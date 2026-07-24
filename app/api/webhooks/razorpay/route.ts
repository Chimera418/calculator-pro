import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/features/payment/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook receiver. No auth — trust is established purely via the
 * `X-Razorpay-Signature` HMAC. Handlers are idempotent so duplicate deliveries
 * are safe (upserts + status guards).
 */
export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // We must read the raw body to verify the signature byte-for-byte.
  const rawBody = await req.text();

  let valid = false;
  try {
    valid = verifyWebhookSignature({ body: rawBody, signature });
  } catch (err) {
    console.error("webhook secret not configured:", err);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event);
        break;
      case "payment.failed":
        await handlePaymentFailed(event);
        break;
      case "refund.created":
        await handleRefundCreated(event);
        break;
      default:
        // Unhandled event types are acknowledged so Razorpay stops retrying.
        break;
    }
  } catch (err) {
    console.error(`webhook handler failed for ${event.event}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id) return;

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: entity.order_id },
  });
  if (!order || order.status === "PAID") return; // idempotent

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.upsert({
      where: { razorpayPaymentId: entity.id },
      update: { status: "SUCCESS" },
      create: {
        userId: order.userId,
        orderId: order.id,
        razorpayPaymentId: entity.id,
        razorpaySignature: "webhook",
        amount: entity.amount ?? order.amount,
        currency: entity.currency ?? order.currency,
        status: "SUCCESS",
      },
    });

    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

    await tx.unlockedFeature.upsert({
      where: { userId_featureId: { userId: order.userId, featureId: order.featureId } },
      update: {},
      create: {
        userId: order.userId,
        featureId: order.featureId,
        paymentId: payment.id,
      },
    });
  });
}

async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id) return;

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: entity.order_id },
  });
  if (!order || order.status === "PAID") return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "FAILED" },
  });
}

async function handleRefundCreated(event: RazorpayWebhookEvent) {
  const paymentId = event.payload?.payment?.entity?.id;
  if (!paymentId) return;

  const payment = await prisma.payment.findUnique({
    where: { razorpayPaymentId: paymentId },
  });
  if (!payment) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });
    // Revoke any feature unlocked by this payment.
    await tx.unlockedFeature.deleteMany({ where: { paymentId: payment.id } });
  });
}

// Minimal typing for the subset of the Razorpay webhook payload we consume.
interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id: string;
        order_id?: string;
        amount?: number;
        currency?: string;
      };
    };
  };
}
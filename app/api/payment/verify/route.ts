import { NextResponse } from "next/server";
import { z } from "zod";
import { safeAuth } from "@/features/auth/config";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/features/payment/webhook";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: Request) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const isTest = session.user.email === "demo@calculator-pro.app";

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  // 1. Verify the HMAC signature server-side before trusting anything.
  const valid = verifyPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    isTest,
  });
  if (!valid) {
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { razorpayOrderId },
    });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const feature = await prisma.feature.findUnique({ where: { id: order.featureId } });
    if (!feature) {
      return NextResponse.json({ success: false, message: "Feature not found" }, { status: 404 });
    }

    // 2–4. Atomically record payment, mark order paid, unlock feature.
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.upsert({
        where: { razorpayPaymentId },
        update: {},
        create: {
          userId: session.user.id,
          orderId: order.id,
          razorpayPaymentId,
          razorpaySignature,
          amount: order.amount,
          currency: order.currency,
          status: "SUCCESS",
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      await tx.unlockedFeature.upsert({
        where: { userId_featureId: { userId: session.user.id, featureId: feature.id } },
        update: {},
        create: {
          userId: session.user.id,
          featureId: feature.id,
          paymentId: payment.id,
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, unlockedFeature: feature.slug });
  } catch (err) {
    console.error("verify failed:", err);
    return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 });
  }
}

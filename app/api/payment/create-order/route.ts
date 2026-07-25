import { NextResponse } from "next/server";
import { z } from "zod";
import { safeAuth } from "@/features/auth/config";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, getPublicKeyId } from "@/features/payment/razorpay";
import { FEATURES } from "@/lib/constants";
import type { FeatureSlug } from "@/types/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  featureSlug: z.string(),
});

export async function POST(req: Request) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const slug = parsed.data.featureSlug as FeatureSlug;
  const featureDef = FEATURES[slug];
  if (!featureDef || featureDef.price <= 0) {
    return NextResponse.json({ error: "Unknown or free feature" }, { status: 400 });
  }

  try {
    // Ensure the Feature row exists (defensive — seed should have created it).
    const feature = await prisma.feature.upsert({
      where: { slug },
      update: {},
      create: {
        slug: featureDef.slug,
        name: featureDef.name,
        description: featureDef.description,
        planRequired: featureDef.plan,
        planName: featureDef.planName,
        price: featureDef.price,
      },
    });

    // Reject if the user already owns it.
    const existing = await prisma.unlockedFeature.findUnique({
      where: { userId_featureId: { userId: session.user.id, featureId: feature.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Feature already unlocked" }, { status: 409 });
    }

    const rzpOrder = await createRazorpayOrder({
      amount: featureDef.price,
      currency: "INR",
      receipt: `feat_${slug}_${Date.now()}`.slice(0, 40),
      notes: { userId: session.user.id, featureSlug: slug },
    });

    await prisma.order.create({
      data: {
        userId: session.user.id,
        razorpayOrderId: rzpOrder.id,
        featureId: feature.id,
        amount: featureDef.price,
        currency: "INR",
        status: "CREATED",
      },
    });

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: featureDef.price,
      currency: "INR",
      key: getPublicKeyId(),
      featureSlug: slug,
      featureName: featureDef.name,
    });
  } catch (err) {
    console.error("create-order failed:", err);
    return NextResponse.json(
      { error: "Failed to create order. Is Razorpay configured?" },
      { status: 500 },
    );
  }
}
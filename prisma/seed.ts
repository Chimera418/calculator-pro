import { PrismaClient } from "@prisma/client";
import { FEATURES } from "../lib/constants";
import { hashPassword } from "../features/auth/password";

const prisma = new PrismaClient();

// Test/dummy account credentials for local sign-in via email + password.
const DEMO_EMAIL = "demo@calculator-pro.app";
const DEMO_PASSWORD = "password123";

async function main() {
  console.log("🌱 Seeding Calculator Pro database…\n");

  // 1. Seed every feature from the canonical feature map.
  for (const feature of Object.values(FEATURES)) {
    await prisma.feature.upsert({
      where: { slug: feature.slug },
      update: {
        name: feature.name,
        description: feature.description,
        planRequired: feature.plan,
        planName: feature.planName,
        price: feature.price,
      },
      create: {
        slug: feature.slug,
        name: feature.name,
        description: feature.description,
        planRequired: feature.plan,
        planName: feature.planName,
        price: feature.price,
      },
    });
  }
  console.log(`✔ Seeded ${Object.keys(FEATURES).length} features.`);

  // 2. Seed a demo user who has already purchased a couple of expansions.
  //    Password is hashed so the account can be used to test email sign-in.
  const demoPasswordHash = await hashPassword(DEMO_PASSWORD);
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash: demoPasswordHash },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Spender",
      passwordHash: demoPasswordHash,
      image: "https://api.dicebear.com/9.x/initials/svg?seed=Demo%20Spender",
      themePreference: { create: { theme: "DARK" } },
    },
  });
  console.log(`✔ Seeded demo user (${demoUser.email} / ${DEMO_PASSWORD}).`);

  // 3. Give the demo user Multiplication + Division, with fake payment records.
  const purchases: Array<{ slug: string; amount: number }> = [
    { slug: "multiplication", amount: 4900 },
    { slug: "division", amount: 9900 },
  ];

  for (const [i, purchase] of purchases.entries()) {
    const feature = await prisma.feature.findUnique({ where: { slug: purchase.slug } });
    if (!feature) continue;

    const order = await prisma.order.upsert({
      where: { razorpayOrderId: `order_demo_${purchase.slug}` },
      update: {},
      create: {
        userId: demoUser.id,
        razorpayOrderId: `order_demo_${purchase.slug}`,
        featureId: feature.id,
        amount: purchase.amount,
        currency: "INR",
        status: "PAID",
      },
    });

    const payment = await prisma.payment.upsert({
      where: { razorpayPaymentId: `pay_demo_${purchase.slug}` },
      update: {},
      create: {
        userId: demoUser.id,
        orderId: order.id,
        razorpayPaymentId: `pay_demo_${purchase.slug}`,
        razorpaySignature: `sig_demo_${i}`,
        amount: purchase.amount,
        currency: "INR",
        status: "SUCCESS",
      },
    });

    await prisma.unlockedFeature.upsert({
      where: { userId_featureId: { userId: demoUser.id, featureId: feature.id } },
      update: {},
      create: {
        userId: demoUser.id,
        featureId: feature.id,
        paymentId: payment.id,
      },
    });
  }
  console.log(`✔ Granted demo user ${purchases.length} paid features.`);

  // 4. Seed some fake calculation history for the demo user.
  const history = [
    { expression: "12 * 8", result: "96" },
    { expression: "100 / 4", result: "25" },
    { expression: "7 * 6", result: "42" },
  ];
  await prisma.calculationHistory.deleteMany({ where: { userId: demoUser.id } });
  for (const h of history) {
    await prisma.calculationHistory.create({
      data: { userId: demoUser.id, expression: h.expression, result: h.result },
    });
  }
  console.log(`✔ Seeded ${history.length} calculation history entries.`);

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
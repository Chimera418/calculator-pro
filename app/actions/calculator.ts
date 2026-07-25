"use server";

import { z } from "zod";
import { safeAuth } from "@/features/auth/config";
import { prisma } from "@/lib/prisma";
import { getUnlockedFeatureSlugs } from "@/lib/user-features";
import { revalidatePath } from "next/cache";

const saveSchema = z.object({
  expression: z.string().min(1).max(200),
  result: z.string().min(1).max(100),
});

/**
 * Persist a calculation to history. Gated behind the `history` feature —
 * because of course remembering things is a paid upgrade.
 */
export async function saveCalculation(input: {
  expression: string;
  result: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const session = await safeAuth();
  if (!session?.user?.id) return { ok: false, reason: "not_authenticated" };

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const unlocked = await getUnlockedFeatureSlugs(session.user.id);
  if (!unlocked.includes("history")) return { ok: false, reason: "history_locked" };

  try {
    await prisma.calculationHistory.create({
      data: {
        userId: session.user.id,
        expression: parsed.data.expression,
        result: parsed.data.result,
      },
    });
    revalidatePath("/profile");
    return { ok: true };
  } catch (err) {
    console.error("saveCalculation failed:", err);
    return { ok: false, reason: "db_error" };
  }
}

export async function clearHistory(): Promise<{ ok: boolean }> {
  const session = await safeAuth();
  if (!session?.user?.id) return { ok: false };
  try {
    await prisma.calculationHistory.deleteMany({ where: { userId: session.user.id } });
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
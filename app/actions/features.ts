"use server";

import { z } from "zod";
import { auth } from "@/features/auth/config";
import { prisma } from "@/lib/prisma";
import { getUnlockedFeatureSlugs } from "@/lib/user-features";
import type { FeatureSlug } from "@/types/features";
import type { CalcTheme } from "@/types/calculator";
import { Theme } from "@prisma/client";
import { revalidatePath } from "next/cache";

/** Return the current user's unlocked feature slugs (empty if signed out). */
export async function getCurrentUserFeatures(): Promise<FeatureSlug[]> {
  const session = await auth();
  return getUnlockedFeatureSlugs(session?.user?.id);
}

const themeSchema = z.enum(["light", "dark", "midnight", "paper", "retro"]);

/**
 * Persist the user's theme choice. Premium themes require the `themes` feature.
 */
export async function saveThemePreference(
  theme: CalcTheme,
): Promise<{ ok: boolean; reason?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, reason: "not_authenticated" };

  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const premium: CalcTheme[] = ["midnight", "paper", "retro"];
  if (premium.includes(parsed.data)) {
    const unlocked = await getUnlockedFeatureSlugs(session.user.id);
    if (!unlocked.includes("themes")) return { ok: false, reason: "themes_locked" };
  }

  try {
    const prismaTheme = parsed.data.toUpperCase() as keyof typeof Theme;
    await prisma.themePreference.upsert({
      where: { userId: session.user.id },
      update: { theme: Theme[prismaTheme] },
      create: { userId: session.user.id, theme: Theme[prismaTheme] },
    });
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("saveThemePreference failed:", err);
    return { ok: false, reason: "db_error" };
  }
}
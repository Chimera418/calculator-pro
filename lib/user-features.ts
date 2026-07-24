import { prisma } from "@/lib/prisma";
import type { FeatureSlug } from "@/types/features";
import type { CalcTheme } from "@/types/calculator";

/**
 * Server-side read helpers for a user's entitlements. Callable directly from
 * server components. All swallow DB errors and degrade to "nothing unlocked"
 * so the app still renders when the database is unreachable.
 */

export async function getUnlockedFeatureSlugs(
  userId: string | undefined,
): Promise<FeatureSlug[]> {
  if (!userId) return [];
  try {
    const rows = await prisma.unlockedFeature.findMany({
      where: { userId },
      include: { feature: { select: { slug: true } } },
    });
    return rows.map((r) => r.feature.slug as FeatureSlug);
  } catch (err) {
    console.error("getUnlockedFeatureSlugs failed:", err);
    return [];
  }
}

export async function getUserTheme(
  userId: string | undefined,
): Promise<CalcTheme> {
  if (!userId) return "light";
  try {
    const pref = await prisma.themePreference.findUnique({ where: { userId } });
    return (pref?.theme.toLowerCase() as CalcTheme) ?? "light";
  } catch {
    return "light";
  }
}

export async function getCalculationHistory(userId: string | undefined) {
  if (!userId) return [];
  try {
    return await prisma.calculationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (err) {
    console.error("getCalculationHistory failed:", err);
    return [];
  }
}
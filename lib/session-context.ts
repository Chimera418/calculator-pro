import { auth } from "@/features/auth/config";
import { getUnlockedFeatureSlugs, getUserTheme } from "@/lib/user-features";
import type { FeatureSlug } from "@/types/features";
import type { CalcTheme } from "@/types/calculator";

export interface SessionContext {
  isLoggedIn: boolean;
  userId?: string;
  userName?: string;
  unlocked: FeatureSlug[];
  theme: CalcTheme;
}

/**
 * Resolve everything the client providers need from the current request.
 * Degrades gracefully to a signed-out, nothing-unlocked state on any error
 * (e.g. database unavailable during local dev before setup).
 */
export async function getSessionContext(): Promise<SessionContext> {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;

  if (!userId) {
    return { isLoggedIn: false, unlocked: [], theme: "light" };
  }

  const [unlocked, theme] = await Promise.all([
    getUnlockedFeatureSlugs(userId),
    getUserTheme(userId),
  ]);

  return {
    isLoggedIn: true,
    userId,
    userName: session?.user?.name ?? undefined,
    unlocked,
    theme,
  };
}
import type { FeatureSlug } from "@/types/features";
import { FEATURES, FREE_FEATURES } from "@/lib/constants";

/**
 * Feature-gating helpers shared by the engine, hooks, and UI.
 * The single source of truth for "is this capability available to the user".
 */

/** Build the effective unlocked set: purchased features ∪ always-free features. */
export function buildUnlockedSet(
  purchased: Iterable<FeatureSlug> = [],
): Set<FeatureSlug> {
  return new Set<FeatureSlug>([...FREE_FEATURES, ...purchased]);
}

export function isFeatureUnlocked(
  slug: FeatureSlug,
  unlocked: Set<FeatureSlug>,
): boolean {
  return unlocked.has(slug);
}

export interface LockInfo {
  slug: FeatureSlug;
  isLocked: boolean;
  planName: string;
  price: number;
  name: string;
  description: string;
}

/** Resolve everything the UI needs to render a (possibly locked) control. */
export function getLockInfo(
  slug: FeatureSlug,
  unlocked: Set<FeatureSlug>,
): LockInfo {
  const feature = FEATURES[slug];
  return {
    slug,
    isLocked: !unlocked.has(slug),
    planName: feature.planName,
    price: feature.price,
    name: feature.name,
    description: feature.description,
  };
}
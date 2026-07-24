"use client";

import { useFeatures } from "@/hooks/useFeatures";
import { getLockInfo } from "@/features/calculator/gating";
import type { FeatureSlug } from "@/types/features";

export interface FeatureGate {
  isLocked: boolean;
  name: string;
  planName: string;
  price: number;
  description: string;
  /** Opens the purchase modal for this feature. */
  onLockedClick: () => void;
}

/**
 * Resolve the lock state and purchase handler for a single gated feature.
 * Free features are always unlocked.
 */
export function useFeatureGate(slug: FeatureSlug): FeatureGate {
  const { unlocked, openPurchase } = useFeatures();
  const info = getLockInfo(slug, unlocked);

  return {
    isLocked: info.isLocked,
    name: info.name,
    planName: info.planName,
    price: info.price,
    description: info.description,
    onLockedClick: () => openPurchase(slug),
  };
}
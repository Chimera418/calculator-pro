"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { FeatureSlug } from "@/types/features";
import { FREE_FEATURES } from "@/lib/constants";
import { getPersistenceMessage } from "@/features/calculator/easter-eggs";

interface FeaturesContextValue {
  /** Effective unlocked set (purchased ∪ free). */
  unlocked: Set<FeatureSlug>;
  isUnlocked: (slug: FeatureSlug) => boolean;
  /** Optimistically mark a feature unlocked after a successful purchase. */
  markUnlocked: (slug: FeatureSlug) => void;
  isLoggedIn: boolean;
  /** Purchase modal control. */
  purchaseSlug: FeatureSlug | null;
  openPurchase: (slug: FeatureSlug) => void;
  closePurchase: () => void;
  /** Global counter for jabbing locked buttons; returns a message at milestones. */
  registerLockedPress: () => string | null;
}

const FeaturesContext = React.createContext<FeaturesContextValue | null>(null);

export function FeaturesProvider({
  children,
  initialUnlocked,
  isLoggedIn,
}: {
  children: React.ReactNode;
  initialUnlocked: FeatureSlug[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [unlocked, setUnlocked] = React.useState<Set<FeatureSlug>>(
    () => new Set<FeatureSlug>([...FREE_FEATURES, ...initialUnlocked]),
  );
  const [purchaseSlug, setPurchaseSlug] = React.useState<FeatureSlug | null>(null);
  const lockedPressCount = React.useRef(0);

  const markUnlocked = React.useCallback(
    (slug: FeatureSlug) => {
      setUnlocked((prev) => new Set(prev).add(slug));
      lockedPressCount.current = 0;
      // Sync server-rendered surfaces (profile, pricing) in the background.
      router.refresh();
    },
    [router],
  );

  const registerLockedPress = React.useCallback(() => {
    lockedPressCount.current += 1;
    return getPersistenceMessage(lockedPressCount.current);
  }, []);

  const value: FeaturesContextValue = {
    unlocked,
    isUnlocked: (slug) => unlocked.has(slug),
    markUnlocked,
    isLoggedIn,
    purchaseSlug,
    openPurchase: setPurchaseSlug,
    closePurchase: () => setPurchaseSlug(null),
    registerLockedPress,
  };

  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>;
}

export function useFeatures(): FeaturesContextValue {
  const ctx = React.useContext(FeaturesContext);
  if (!ctx) throw new Error("useFeatures must be used within a FeaturesProvider");
  return ctx;
}
"use client";

import { useFeatures } from "@/hooks/useFeatures";

/** Thin accessor for the global purchase-modal state. */
export function usePurchaseModal() {
  const { purchaseSlug, openPurchase, closePurchase } = useFeatures();
  return {
    slug: purchaseSlug,
    isOpen: purchaseSlug !== null,
    open: openPurchase,
    close: closePurchase,
  };
}
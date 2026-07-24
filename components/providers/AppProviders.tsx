"use client";

import * as React from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { FeaturesProvider } from "@/hooks/useFeatures";
import { PurchaseModal } from "@/components/payment/PurchaseModal";
import { SocialProofToast } from "@/components/ui/SocialProofToast";
import type { FeatureSlug } from "@/types/features";
import type { CalcTheme } from "@/types/calculator";

export interface AppProvidersProps {
  children: React.ReactNode;
  initialUnlocked: FeatureSlug[];
  isLoggedIn: boolean;
  initialTheme: CalcTheme;
  userName?: string;
}

/**
 * Composes every client-side context and mounts the globally-available
 * purchase modal + social-proof toaster.
 */
export function AppProviders({
  children,
  initialUnlocked,
  isLoggedIn,
  initialTheme,
  userName,
}: AppProvidersProps) {
  const canUsePremiumThemes = initialUnlocked.includes("themes");

  return (
    <ToastProvider>
      <ThemeProvider
        initialTheme={initialTheme}
        canUsePremiumThemes={canUsePremiumThemes}
        persist={isLoggedIn}
      >
        <FeaturesProvider initialUnlocked={initialUnlocked} isLoggedIn={isLoggedIn}>
          {children}
          <PurchaseModal userName={userName} />
          <SocialProofToast />
        </FeaturesProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
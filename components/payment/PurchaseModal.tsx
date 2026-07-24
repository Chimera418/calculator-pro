"use client";

import * as React from "react";
import Link from "next/link";
import { Star, ShieldCheck, Loader2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFeatures } from "@/hooks/useFeatures";
import { useToast } from "@/components/ui/Toast";
import { useRazorpayCheckout } from "./RazorpayCheckout";
import { fireConfetti } from "./SuccessAnimation";
import { FEATURES } from "@/lib/constants";
import { formatCurrency, seededBetween } from "@/lib/utils";
import type { FeatureSlug } from "@/types/features";

export function PurchaseModal({ userName }: { userName?: string }) {
  const { purchaseSlug, closePurchase, markUnlocked, isLoggedIn } = useFeatures();
  const { toast } = useToast();
  const [succeeded, setSucceeded] = React.useState<FeatureSlug | null>(null);

  const { start, status } = useRazorpayCheckout({
    onSuccess: (slug) => {
      markUnlocked(slug);
      fireConfetti();
      setSucceeded(slug);
      toast({
        variant: "success",
        message: `${FEATURES[slug].name} unlocked!`,
        description: "Enjoy your hard-earned arithmetic.",
      });
    },
    onError: (message) => toast({ variant: "error", message }),
  });

  // Fake-but-stable social proof numbers, derived deterministically from the
  // feature slug so they're consistent per feature and pure to compute.
  const proof = React.useMemo(() => {
    const seed = purchaseSlug ?? "none";
    return {
      rating: (4.6 + seededBetween(`${seed}-r`, 0, 3) / 10).toFixed(1),
      reviews: seededBetween(`${seed}-v`, 1200, 48000),
      buyers: seededBetween(`${seed}-b`, 80, 900),
    };
  }, [purchaseSlug]);

  const open = purchaseSlug !== null;
  const feature = purchaseSlug ? FEATURES[purchaseSlug] : null;
  const busy = status !== "idle";

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      closePurchase();
      setSucceeded(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {feature && succeeded === feature.slug ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/15 text-3xl">
              🎉
            </div>
            <DialogTitle>{feature.name} unlocked</DialogTitle>
            <DialogDescription>
              Thank you for your purchase. The button is yours now.
            </DialogDescription>
            <Button className="mt-2 w-full" onClick={() => handleOpenChange(false)}>
              Start calculating
            </Button>
          </div>
        ) : feature ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-left">{feature.name}</DialogTitle>
              <DialogDescription className="text-left">
                {feature.description}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />
                {proof.rating} ({proof.reviews.toLocaleString("en-IN")})
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {proof.buyers} bought today
              </span>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[var(--muted)]">{feature.planName}</span>
                <span className="text-2xl font-semibold text-[var(--fg)]">
                  {formatCurrency(feature.price)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                One-time purchase. Yours forever (or until you clear the database).
              </p>
            </div>

            {isLoggedIn ? (
              <Button
                className="w-full"
                size="lg"
                disabled={busy}
                onClick={() => start(feature.slug, userName)}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {status === "verifying" ? "Verifying…" : "Processing…"}
                  </>
                ) : (
                  <>Buy now — {formatCurrency(feature.price)}</>
                )}
              </Button>
            ) : (
              <Button className="w-full" size="lg" asChild>
                <Link href="/login">Sign in to purchase</Link>
              </Button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
              Secured by Razorpay · UPI, cards, netbanking
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
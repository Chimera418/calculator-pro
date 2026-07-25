"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useFeatures } from "@/hooks/useFeatures";
import { useToast } from "@/components/ui/Toast";
import type { FeatureSlug } from "@/types/features";

type CalcVariant = "number" | "operator" | "function" | "equals" | "utility";

export interface CalcButtonProps {
  label: React.ReactNode;
  ariaLabel: string;
  onActivate: () => void;
  variant?: CalcVariant;
  /** When set, the button is feature-gated. */
  featureSlug?: FeatureSlug;
  wide?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<CalcVariant, string> = {
  number:
    "border border-[var(--border)]/60 bg-[var(--surface-2)]/50 text-[var(--fg)] backdrop-blur-xl hover:bg-[var(--surface-3)]/60",
  operator:
    "border border-[var(--border)]/40 bg-[var(--surface-3)]/40 text-[var(--accent)] font-semibold backdrop-blur-xl hover:bg-[var(--surface-3)]/60",
  function:
    "border border-[var(--border)]/50 bg-[var(--surface-2)]/35 text-[var(--muted)] backdrop-blur-xl hover:bg-[var(--surface-3)]/50",
  equals:
    "border border-white/20 bg-[var(--accent)] text-[var(--accent-fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_18px_-4px_var(--accent)] hover:opacity-90",
  utility:
    "border border-[var(--border)]/50 bg-[var(--surface-2)]/35 text-[var(--danger)] backdrop-blur-xl hover:bg-[var(--surface-3)]/50",
};

export function CalcButton({
  label,
  ariaLabel,
  onActivate,
  variant = "number",
  featureSlug,
  wide,
  className,
}: CalcButtonProps) {
  const gate = useFeatureGate(featureSlug ?? "addition");
  const { registerLockedPress } = useFeatures();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const isLocked = featureSlug ? gate.isLocked : false;

  const handleClick = () => {
    if (isLocked && featureSlug) {
      gate.onLockedClick();
      const msg = registerLockedPress();
      if (msg) toast({ variant: "info", message: msg });
      return;
    }
    onActivate();
  };

  return (
    <motion.button
      type="button"
      aria-label={isLocked ? `${ariaLabel} — locked, ${gate.planName}` : ariaLabel}
      onClick={handleClick}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "relative flex aspect-square w-full select-none items-center justify-center rounded-full text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
        VARIANT_STYLES[variant],
        wide && "col-span-2 aspect-auto",
        isLocked && "cursor-pointer",
        className,
      )}
      title={
        isLocked
          ? `${gate.name} — unlock with ${gate.planName} (${formatCurrency(gate.price)})`
          : undefined
      }
    >
      <span className={cn(isLocked && "opacity-35 blur-[1px]")}>{label}</span>
      {isLocked && (
        <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-black/10 px-1 py-0.5 text-[10px] font-medium text-[var(--lock)] dark:bg-white/10">
          <Lock className="h-2.5 w-2.5" />
        </span>
      )}
    </motion.button>
  );
}
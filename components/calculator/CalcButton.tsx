"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
  number: "bg-[var(--surface-2)] text-[var(--fg)] hover:bg-[var(--surface-3)]",
  operator:
    "bg-[var(--surface-3)] text-[var(--accent)] font-semibold hover:brightness-105",
  function: "bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-3)]",
  equals: "bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90",
  utility: "bg-[var(--surface-2)] text-[var(--danger)] hover:bg-[var(--surface-3)]",
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
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "relative flex h-16 select-none items-center justify-center rounded-2xl text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        VARIANT_STYLES[variant],
        wide && "col-span-2",
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
"use client";

import { Lock } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useFeatures } from "@/hooks/useFeatures";
import { FEATURES } from "@/lib/constants";
import type { CalcMode } from "@/hooks/useCalculator";

const MODES: { id: CalcMode; label: string; slug?: "binary" | "hexadecimal" }[] = [
  { id: "decimal", label: "DEC" },
  { id: "binary", label: "BIN", slug: "binary" },
  { id: "hexadecimal", label: "HEX", slug: "hexadecimal" },
];

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: CalcMode;
  onChange: (m: CalcMode) => void;
}) {
  const { unlocked, openPurchase } = useFeatures();

  return (
    <div className="flex gap-1 rounded-xl bg-[var(--surface-2)] p-1">
      {MODES.map((m) => {
        const locked = m.slug ? !unlocked.has(m.slug) : false;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => (locked && m.slug ? openPurchase(m.slug) : onChange(m.id))}
            title={
              locked && m.slug
                ? `${FEATURES[m.slug].planName} — ${formatCurrency(FEATURES[m.slug].price)}`
                : undefined
            }
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition",
              active
                ? "bg-[var(--surface)] text-[var(--fg)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--fg)]",
            )}
          >
            {m.label}
            {locked && <Lock className="h-3 w-3 text-[var(--lock)]" />}
          </button>
        );
      })}
    </div>
  );
}
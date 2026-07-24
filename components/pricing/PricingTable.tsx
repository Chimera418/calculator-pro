"use client";

import * as React from "react";
import { Check, Lock, Sparkles } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { PLANS, FEATURES } from "@/lib/constants";
import { useFeatures } from "@/hooks/useFeatures";

export function PricingTable() {
  const { unlocked, openPurchase } = useFeatures();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PLANS.map((plan) => {
        const isFree = plan.price === 0;
        const owned = plan.features.every((f) => unlocked.has(f));
        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-3xl border bg-[var(--surface)] p-5 shadow-[var(--shadow)] transition",
              plan.highlighted
                ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                : "border-[var(--border)]",
            )}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[var(--fg)]">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                    <Sparkles className="h-3 w-3" /> Popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">{plan.tagline}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-[var(--fg)]">
                  {isFree ? "Free" : formatCurrency(plan.price)}
                </span>
                {!isFree && <span className="text-xs text-[var(--muted)]">one-time</span>}
              </div>
            </div>

            <ul className="mb-4 flex-1 space-y-2">
              {plan.features.map((slug) => {
                const feature = FEATURES[slug];
                const has = unlocked.has(slug);
                return (
                  <li key={slug} className="flex items-start gap-2 text-sm">
                    {has ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                    ) : (
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lock)]" />
                    )}
                    <span className={cn("text-[var(--fg)]", has && "text-[var(--muted)] line-through")}>
                      {feature.name}
                    </span>
                  </li>
                );
              })}
            </ul>

            {isFree ? (
              <div className="rounded-xl bg-[var(--surface-2)] py-2.5 text-center text-sm font-medium text-[var(--muted)]">
                Always included
              </div>
            ) : owned ? (
              <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--success)]/10 py-2.5 text-center text-sm font-medium text-[var(--success)]">
                <Check className="h-4 w-4" /> Owned
              </div>
            ) : (
              <div className="space-y-2">
                {plan.features
                  .filter((f) => !unlocked.has(f))
                  .map((slug) => (
                    <button
                      key={slug}
                      onClick={() => openPurchase(slug)}
                      className="flex w-full items-center justify-between rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
                    >
                      <span>Unlock {FEATURES[slug].name}</span>
                      <span>{formatCurrency(FEATURES[slug].price)}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
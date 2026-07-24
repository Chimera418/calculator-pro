"use client";

import * as React from "react";
import { Display } from "./Display";
import { ButtonGrid } from "./ButtonGrid";
import { ModeToggle } from "./ModeToggle";
import { History } from "./History";
import { FakeAd } from "@/components/ui/FakeAd";
import { useCalculator } from "@/hooks/useCalculator";
import { useEasterEgg } from "@/hooks/useEasterEgg";
import { useFeatures } from "@/hooks/useFeatures";
import { useToast } from "@/components/ui/Toast";
import type { FeatureSlug } from "@/types/features";

// Keyboard key → engine token, plus the feature that gates it.
const KEY_TOKENS: Record<string, { token: string; requires?: FeatureSlug }> = {
  "0": { token: "0" }, "1": { token: "1" }, "2": { token: "2" }, "3": { token: "3" },
  "4": { token: "4" }, "5": { token: "5" }, "6": { token: "6" }, "7": { token: "7" },
  "8": { token: "8" }, "9": { token: "9" }, ".": { token: "." },
  "+": { token: "+" }, "-": { token: "-" },
  "*": { token: "*", requires: "multiplication" },
  "/": { token: "/", requires: "division" },
  "%": { token: "%", requires: "modulo" },
  "^": { token: "^", requires: "power" },
  "(": { token: "(", requires: "parentheses" },
  ")": { token: ")", requires: "parentheses" },
};

export function Calculator() {
  const { unlocked, openPurchase } = useFeatures();
  const { toast } = useToast();
  const { egg, checkResult, clearEgg } = useEasterEgg();

  const callbacks = React.useMemo(
    () => ({
      onEqualsLocked: () => openPurchase("equals"),
      onFeatureLocked: (slug: FeatureSlug) => openPurchase(slug),
      onLimitReached: () =>
        toast({
          variant: "error",
          message: "Daily free limit reached",
          description: "Upgrade any plan for unlimited calculations.",
        }),
      onResult: (result: string) => checkResult(result),
    }),
    [openPurchase, toast, checkResult],
  );

  const calc = useCalculator(callbacks);

  const showAds = unlocked.size <= 2; // free tier only

  // Physical keyboard support.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        clearEgg();
        calc.compute();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        calc.backspace();
        return;
      }
      if (e.key === "Escape") {
        calc.clearAll();
        return;
      }
      const mapped = KEY_TOKENS[e.key];
      if (mapped) {
        e.preventDefault();
        if (mapped.requires && !unlocked.has(mapped.requires)) {
          openPurchase(mapped.requires);
          return;
        }
        clearEgg();
        calc.input(mapped.token);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [calc, unlocked, openPurchase, clearEgg]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-5">
        <div className="mb-3">
          <ModeToggle mode={calc.mode} onChange={calc.toggleMode} />
        </div>
        <Display
          expression={calc.expression}
          result={calc.result}
          error={calc.error}
          mode={calc.mode}
          memoryActive={calc.memory !== 0}
          easterEgg={egg?.message}
        />
        <ButtonGrid calc={calc} />
        {showAds && <FakeAd />}
      </div>

      <div className="min-h-[24rem] lg:min-h-0">
        <History
          entries={calc.sessionHistory}
          onClear={calc.clearSessionHistory}
          onReuse={(result) => calc.input(result)}
        />
      </div>
      </div>
    </div>
  );
}
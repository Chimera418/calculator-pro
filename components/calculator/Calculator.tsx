"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sigma, History as HistoryGlyph, X } from "lucide-react";
import { Display } from "./Display";
import { ButtonGrid } from "./ButtonGrid";
import { ScientificPad } from "./ScientificPad";
import { ModeToggle } from "./ModeToggle";
import { History } from "./History";
import { FakeAd } from "@/components/ui/FakeAd";
import { useCalculator } from "@/hooks/useCalculator";
import { useEasterEgg } from "@/hooks/useEasterEgg";
import { useFeatures } from "@/hooks/useFeatures";
import { useToast } from "@/components/ui/Toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
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

// Springs drive position (layout) and mobile slide-in; a short tween handles the
// desktop panel fade/scale. Everything animates transform/opacity only — never
// width/height — so the reflow that used to cause choppiness is gone.
const DRAWER_SPRING = { type: "spring" as const, stiffness: 360, damping: 34 };
const PANEL_TWEEN = { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const };

export function Calculator() {
  const { unlocked, openPurchase } = useFeatures();
  const { toast } = useToast();
  const { egg, checkResult, clearEgg } = useEasterEgg();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Scientific pad follows the breakpoint (open on desktop, closed on mobile)
  // until the user expresses a preference. `null` = "not toggled yet", so the
  // open state is derived — no effect / setState-in-effect needed. A panel open
  // on first paint therefore has `sciPref === null` and skips its entrance
  // animation (no "pop"); once toggled it animates normally.
  const [sciPref, setSciPref] = React.useState<boolean | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const sciOpen = sciPref ?? isDesktop;

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

  const toggleSci = () => setSciPref(!sciOpen);
  const toggleHistory = () => setHistoryOpen((v) => !v);
  const closeDrawers = () => {
    setSciPref(false);
    setHistoryOpen(false);
  };

  // Desktop panels fade/scale in place while the keypad slides via `layout`;
  // mobile panels slide in from the edge as overlays.
  const sciAnim = isDesktop
    ? {
        initial: sciPref !== null ? { opacity: 0, scale: 0.96 } : false,
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: PANEL_TWEEN,
      }
    : {
        initial: { x: "-100%" as const },
        animate: { x: 0 },
        exit: { x: "-100%" as const },
        transition: DRAWER_SPRING,
      };

  const historyAnim = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: PANEL_TWEEN,
      }
    : {
        initial: { y: "100%" as const },
        animate: { y: 0 },
        exit: { y: "100%" as const },
        transition: DRAWER_SPRING,
      };

  const layoutMode = isDesktop ? ("position" as const) : false;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="relative flex items-stretch justify-center gap-4">
        {/* Mobile backdrop for either drawer */}
        <AnimatePresence>
          {!isDesktop && (sciOpen || historyOpen) && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawers}
            />
          )}
        </AnimatePresence>

        {/* Scientific drawer (left) */}
        <AnimatePresence mode="popLayout">
          {sciOpen && (
            <motion.div
              key="scientific-drawer"
              layout={layoutMode}
              {...sciAnim}
              className={cn(
                "border border-[var(--border)] bg-[var(--surface)]/70 shadow-[var(--shadow)] backdrop-blur-xl",
                isDesktop
                  ? "w-52 shrink-0 self-stretch overflow-hidden rounded-3xl"
                  : "fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] overflow-y-auto rounded-r-3xl",
              )}
            >
              <div className="flex h-full flex-col p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--fg)]">Scientific</h2>
                  <button
                    onClick={() => setSciPref(false)}
                    aria-label="Close scientific pad"
                    className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ScientificPad calc={calc} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main keypad */}
        <motion.div
          layout={layoutMode}
          transition={DRAWER_SPRING}
          className="w-full max-w-sm shrink-0 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 shadow-[var(--shadow)] backdrop-blur-xl sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              onClick={toggleSci}
              aria-label="Toggle scientific pad"
              aria-pressed={sciOpen}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg)] transition hover:bg-[var(--surface-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                sciOpen ? "bg-[var(--surface-3)]" : "bg-[var(--surface-2)]/60",
              )}
            >
              <Sigma className="h-4 w-4" />
            </button>
            <ModeToggle mode={calc.mode} onChange={calc.toggleMode} />
            <button
              onClick={toggleHistory}
              aria-label="Toggle history"
              aria-pressed={historyOpen}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg)] transition hover:bg-[var(--surface-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                historyOpen ? "bg-[var(--surface-3)]" : "bg-[var(--surface-2)]/60",
              )}
            >
              <HistoryGlyph className="h-4 w-4" />
            </button>
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
        </motion.div>

        {/* History drawer (right, bottom sheet on mobile) */}
        <AnimatePresence mode="popLayout">
          {historyOpen && (
            <motion.div
              key="history-drawer"
              layout={layoutMode}
              {...historyAnim}
              className={cn(
                isDesktop
                  ? "w-72 shrink-0 self-stretch"
                  : "fixed inset-x-0 bottom-0 z-50 h-[70vh] rounded-t-3xl",
              )}
            >
              <History
                entries={calc.sessionHistory}
                onClear={calc.clearSessionHistory}
                onReuse={(result) => calc.input(result)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

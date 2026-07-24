"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CalcMode } from "@/hooks/useCalculator";

function prettify(expr: string): string {
  return expr
    .replace(/\*/g, " × ")
    .replace(/\//g, " ÷ ")
    .replace(/(?<=\d|\))-/g, " − ")
    .replace(/\+/g, " + ")
    .replace(/%/g, " mod ")
    .replace(/\^/g, " ^ ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DisplayProps {
  expression: string;
  result: string | null;
  error: string | null;
  mode: CalcMode;
  memoryActive: boolean;
  easterEgg?: string | null;
}

export function Display({
  expression,
  result,
  error,
  mode,
  memoryActive,
  easterEgg,
}: DisplayProps) {
  const main = result ?? (expression ? prettify(expression) : "0");

  return (
    <div
      className="calc-display relative overflow-hidden rounded-2xl bg-[var(--display-bg)] px-5 py-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span className="flex items-center gap-2">
          {memoryActive && (
            <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 font-medium">M</span>
          )}
          {mode !== "decimal" && (
            <span className="uppercase tracking-wide">{mode}</span>
          )}
        </span>
        <span className="truncate tnum">{result ? prettify(expression) : " "}</span>
      </div>

      <div className="mt-2 min-h-[3rem] text-right">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={main}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className={cn(
              "tnum break-all text-right text-4xl font-light tracking-tight text-[var(--fg)] sm:text-5xl",
              error && "animate-shake text-[var(--danger)]",
            )}
          >
            {error ? "Error" : main}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 h-5 text-right text-sm">
        {error ? (
          <span className="text-[var(--danger)]">{error}</span>
        ) : easterEgg ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[var(--accent)]"
          >
            {easterEgg}
          </motion.span>
        ) : null}
      </div>
    </div>
  );
}
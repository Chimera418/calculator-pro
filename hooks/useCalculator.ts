"use client";

import * as React from "react";
import {
  evaluate,
  formatResult,
  CalculationError,
  FeatureLockedError,
} from "@/features/calculator/engine";
import { useFeatures } from "@/hooks/useFeatures";
import { FREE_FEATURES, FREE_DAILY_CALC_LIMIT } from "@/lib/constants";
import { saveCalculation } from "@/app/actions/calculator";
import type { FeatureSlug } from "@/types/features";

export type CalcMode = "decimal" | "binary" | "hexadecimal";

const OPERATOR_CHARS = new Set(["+", "-", "*", "/", "%", "^"]);

interface CalculatorCallbacks {
  onEqualsLocked?: () => void;
  onFeatureLocked?: (slug: FeatureSlug) => void;
  onLimitReached?: () => void;
  onResult?: (result: string) => void;
}

function calcCountKey() {
  return `p2w-calc-${new Date().toISOString().slice(0, 10)}`;
}

export function useCalculator(callbacks: CalculatorCallbacks = {}) {
  const { unlocked, isLoggedIn } = useFeatures();
  const [expression, setExpression] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [memory, setMemory] = React.useState(0);
  const [mode, setMode] = React.useState<CalcMode>("decimal");
  const [sessionHistory, setSessionHistory] = React.useState<
    { id: string; expression: string; result: string }[]
  >([]);
  const justEvaluated = React.useRef(false);

  const hasPaidPlan = unlocked.size > FREE_FEATURES.length;
  const unlimitedDecimals = unlocked.has("decimal_places");

  const clearError = () => setError(null);

  /** Append a raw token (number, operator, function, paren) to the expression. */
  const input = React.useCallback(
    (token: string) => {
      const carry = result;
      setError(null);
      setResult(null);
      setExpression((prev) => {
        // After an evaluation: numbers start fresh, operators continue the result.
        if (justEvaluated.current) {
          justEvaluated.current = false;
          if (OPERATOR_CHARS.has(token)) {
            return (carry ?? prev) + token;
          }
          return token;
        }
        return prev + token;
      });
    },
    [result],
  );

  const clearAll = React.useCallback(() => {
    setExpression("");
    setResult(null);
    setError(null);
    justEvaluated.current = false;
  }, []);

  const backspace = React.useCallback(() => {
    setError(null);
    if (justEvaluated.current) {
      justEvaluated.current = false;
      setExpression("");
      setResult(null);
      return;
    }
    setExpression((prev) => prev.slice(0, -1));
  }, []);

  const bumpDailyCount = React.useCallback((): boolean => {
    if (hasPaidPlan) return true;
    try {
      const key = calcCountKey();
      const count = Number(window.localStorage.getItem(key) ?? "0");
      if (count >= FREE_DAILY_CALC_LIMIT) return false;
      window.localStorage.setItem(key, String(count + 1));
      return true;
    } catch {
      return true;
    }
  }, [hasPaidPlan]);

  const compute = React.useCallback(() => {
    // The Equals button itself is a paid (God Mode) feature.
    if (!unlocked.has("equals")) {
      callbacks.onEqualsLocked?.();
      return;
    }
    if (!expression.trim()) return;

    if (!bumpDailyCount()) {
      setError(`Free limit reached — ${FREE_DAILY_CALC_LIMIT} calculations/day.`);
      callbacks.onLimitReached?.();
      return;
    }

    try {
      const value = evaluate(expression, { unlocked });
      const formatted = formatResult(value, { unlimitedDecimals, mode });
      setResult(formatted);
      justEvaluated.current = true;
      setSessionHistory((prev) =>
        [{ id: Math.random().toString(36).slice(2), expression, result: formatted }, ...prev].slice(0, 30),
      );
      callbacks.onResult?.(formatted);

      if (isLoggedIn && unlocked.has("history")) {
        void saveCalculation({ expression, result: formatted });
      }
    } catch (err) {
      if (err instanceof FeatureLockedError) {
        callbacks.onFeatureLocked?.(err.feature);
        setError(`"${err.feature}" is locked.`);
      } else if (err instanceof CalculationError) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    }
  }, [expression, unlocked, unlimitedDecimals, mode, isLoggedIn, bumpDailyCount, callbacks]);

  // Memory functions (gated by `memory` feature at the button layer).
  const memoryAdd = React.useCallback(() => {
    const v = Number(result ?? tryEval(expression, unlocked));
    if (!Number.isNaN(v)) setMemory((m) => m + v);
  }, [result, expression, unlocked]);

  const memorySubtract = React.useCallback(() => {
    const v = Number(result ?? tryEval(expression, unlocked));
    if (!Number.isNaN(v)) setMemory((m) => m - v);
  }, [result, expression, unlocked]);

  const memoryRecall = React.useCallback(() => {
    setExpression((prev) => (justEvaluated.current ? String(memory) : prev + String(memory)));
    justEvaluated.current = false;
  }, [memory]);

  const memoryClear = React.useCallback(() => setMemory(0), []);

  const toggleMode = React.useCallback(
    (next: CalcMode) => {
      if (next === "binary" && !unlocked.has("binary")) return;
      if (next === "hexadecimal" && !unlocked.has("hexadecimal")) return;
      setMode(next);
    },
    [unlocked],
  );

  const displayValue = result ?? (expression || "0");
  const clearSessionHistory = React.useCallback(() => setSessionHistory([]), []);

  return {
    expression,
    result,
    error,
    memory,
    mode,
    displayValue,
    sessionHistory,
    input,
    clearAll,
    backspace,
    compute,
    memoryAdd,
    memorySubtract,
    memoryRecall,
    memoryClear,
    toggleMode,
    clearError,
    clearSessionHistory,
  };
}

function tryEval(expression: string, unlocked: Set<FeatureSlug>): number {
  try {
    return evaluate(expression, { unlocked });
  } catch {
    return NaN;
  }
}
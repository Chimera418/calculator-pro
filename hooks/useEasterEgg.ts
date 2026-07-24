"use client";

import * as React from "react";
import { detectEasterEgg, getPersistenceMessage } from "@/features/calculator/easter-eggs";
import type { EasterEgg } from "@/types/calculator";

/**
 * Tracks easter-egg discovery for computed results and repeated locked-button
 * presses. Returns the most recent trigger so the UI can surface it.
 */
export function useEasterEgg() {
  const [egg, setEgg] = React.useState<EasterEgg | null>(null);
  const lockedPressCount = React.useRef(0);

  const checkResult = React.useCallback((result: string): EasterEgg | null => {
    const found = detectEasterEgg(result);
    if (found) setEgg(found);
    return found;
  }, []);

  const registerLockedPress = React.useCallback((): string | null => {
    lockedPressCount.current += 1;
    return getPersistenceMessage(lockedPressCount.current);
  }, []);

  const resetLockedPresses = React.useCallback(() => {
    lockedPressCount.current = 0;
  }, []);

  const clearEgg = React.useCallback(() => setEgg(null), []);

  return { egg, checkResult, registerLockedPress, resetLockedPresses, clearEgg };
}
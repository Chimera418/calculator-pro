"use client";

import * as React from "react";
import type { CalcTheme } from "@/types/calculator";
import { saveThemePreference } from "@/app/actions/features";

const FREE_THEMES: CalcTheme[] = ["light", "dark"];
const PREMIUM_THEMES: CalcTheme[] = ["midnight", "paper", "retro"];
export const ALL_THEMES: CalcTheme[] = [...FREE_THEMES, ...PREMIUM_THEMES];

interface ThemeContextValue {
  theme: CalcTheme;
  setTheme: (t: CalcTheme) => void;
  canUsePremiumThemes: boolean;
  isPremiumTheme: (t: CalcTheme) => boolean;
  availableThemes: CalcTheme[];
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialTheme = "light",
  canUsePremiumThemes = false,
  persist = false,
}: {
  children: React.ReactNode;
  initialTheme?: CalcTheme;
  canUsePremiumThemes?: boolean;
  /** Persist theme to the server (logged-in users). */
  persist?: boolean;
}) {
  const [theme, setThemeState] = React.useState<CalcTheme>(initialTheme);

  // Apply theme to <html> and sync localStorage.
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("p2w-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = React.useCallback(
    (t: CalcTheme) => {
      if (PREMIUM_THEMES.includes(t) && !canUsePremiumThemes) return;
      setThemeState(t);
      if (persist) {
        void saveThemePreference(t);
      }
    },
    [canUsePremiumThemes, persist],
  );

  const value: ThemeContextValue = {
    theme,
    setTheme,
    canUsePremiumThemes,
    isPremiumTheme: (t) => PREMIUM_THEMES.includes(t),
    availableThemes: ALL_THEMES,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
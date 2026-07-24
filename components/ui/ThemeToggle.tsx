"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Sun, Moon, Palette, Lock, Check } from "lucide-react";
import { useTheme, ALL_THEMES } from "@/components/ui/ThemeProvider";
import { useFeatures } from "@/hooks/useFeatures";
import { cn } from "@/lib/utils";
import type { CalcTheme } from "@/types/calculator";

const THEME_LABELS: Record<CalcTheme, string> = {
  light: "Light",
  dark: "Dark",
  midnight: "Midnight",
  paper: "Paper",
  retro: "Retro",
};

export function ThemeToggle() {
  const { theme, setTheme, isPremiumTheme, canUsePremiumThemes } = useTheme();
  const { openPurchase } = useFeatures();

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Palette;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Change theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg)] transition hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Icon className="h-5 w-5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[70] min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]"
        >
          {ALL_THEMES.map((t) => {
            const premium = isPremiumTheme(t);
            const locked = premium && !canUsePremiumThemes;
            return (
              <DropdownMenu.Item
                key={t}
                onSelect={(e) => {
                  if (locked) {
                    e.preventDefault();
                    openPurchase("themes");
                  } else {
                    setTheme(t);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--fg)] outline-none transition data-[highlighted]:bg-[var(--surface-2)]",
                )}
              >
                <span className="flex items-center gap-2">
                  {THEME_LABELS[t]}
                  {premium && (
                    <span className="rounded bg-[var(--surface-3)] px-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Pro
                    </span>
                  )}
                </span>
                {locked ? (
                  <Lock className="h-3.5 w-3.5 text-[var(--lock)]" />
                ) : theme === t ? (
                  <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
                ) : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
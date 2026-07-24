"use client";

import * as React from "react";
import { useToast } from "@/components/ui/Toast";
import { pickRandom, randomBetween } from "@/lib/utils";

const NAMES = [
  "Aarav", "Priya", "Rohan", "Ananya", "Vihaan", "Diya", "Kabir", "Meera",
  "Arjun", "Saanvi", "Ishaan", "Zara", "A user in Mumbai", "Someone in Bengaluru",
];

const FEATURES = [
  "Multiplication", "Division", "Parentheses", "Square Root", "Scientific Functions",
  "the Equals button", "Binary Mode", "Premium Themes", "Calculation History",
];

const TEMPLATES = [
  (n: string, f: string) => `${n} just unlocked ${f}`,
  (n: string, f: string) => `${n} purchased ${f}`,
  (_n: string, f: string) => `Someone just bought ${f}`,
  (n: string) => `${n} upgraded to a paid plan`,
];

/**
 * Periodically emits fake "someone just bought X" social-proof toasts.
 * Fires every 15–45 seconds while mounted.
 */
export function SocialProofToast() {
  const { toast } = useToast();

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = randomBetween(15000, 45000);
      timer = setTimeout(() => {
        const name = pickRandom(NAMES);
        const feature = pickRandom(FEATURES);
        const message = pickRandom(TEMPLATES)(name, feature);
        toast({
          variant: "social",
          message,
          description: `${randomBetween(2, 40)} minutes ago`,
          duration: 4000,
        });
        schedule();
      }, delay);
    };

    // First one a little sooner so the page feels alive.
    timer = setTimeout(schedule, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  return null;
}
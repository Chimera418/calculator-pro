import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a paise amount as INR currency, e.g. 4900 → "₹49". */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** Convert rupees to paise for Razorpay. */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Deterministic-ish pseudo-random helper for fake social proof numbers. */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Deterministic 32-bit string hash (FNV-1a). Pure — safe to call in render. */
export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic integer in [min, max] derived from a seed string. */
export function seededBetween(seed: string, min: number, max: number): number {
  const h = hashString(seed);
  return min + (h % (max - min + 1));
}
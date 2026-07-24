import type { FeatureSlug } from "./features";

export type CalcTheme = "light" | "dark" | "midnight" | "paper" | "retro";

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
}

export interface EasterEgg {
  key: string;
  message: string;
  type: "message" | "achievement";
}

/** A token produced by the tokenizer. */
export type TokenType =
  | "number"
  | "operator"
  | "function"
  | "lparen"
  | "rparen";

export interface Token {
  type: TokenType;
  value: string;
  /** Feature gate required to use this token, if any. */
  requires?: FeatureSlug;
}

export interface EvaluationResult {
  value: number;
  /** Formatted for display, honouring decimal-place gating. */
  display: string;
}
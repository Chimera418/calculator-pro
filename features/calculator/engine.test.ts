import { describe, it, expect } from "vitest";
import {
  evaluate,
  formatResult,
  tokenize,
  toRPN,
  FeatureLockedError,
  CalculationError,
} from "./engine";
import type { FeatureSlug } from "@/types/features";

const all = (...slugs: FeatureSlug[]) => ({ unlocked: slugs });

describe("engine — free operations", () => {
  it("adds without any unlock", () => {
    expect(evaluate("2+3")).toBe(5);
  });

  it("subtracts without any unlock", () => {
    expect(evaluate("10-4")).toBe(6);
  });

  it("handles unary minus", () => {
    expect(evaluate("-5+2")).toBe(-3);
    expect(evaluate("3--2")).toBe(5);
  });

  it("respects left-to-right for same precedence", () => {
    expect(evaluate("10-3-2")).toBe(5);
  });
});

describe("engine — feature gating", () => {
  it("throws FeatureLockedError for multiplication when locked", () => {
    expect(() => evaluate("2*3")).toThrow(FeatureLockedError);
  });

  it("evaluates multiplication when unlocked", () => {
    expect(evaluate("2*3", all("multiplication"))).toBe(6);
  });

  it("reports the specific locked feature", () => {
    try {
      evaluate("6/2");
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(FeatureLockedError);
      expect((e as FeatureLockedError).feature).toBe("division");
    }
  });

  it("gates parentheses", () => {
    expect(() => evaluate("(1+2)")).toThrow(FeatureLockedError);
    expect(evaluate("(1+2)", all("parentheses"))).toBe(3);
  });

  it("gates sqrt and scientific", () => {
    expect(() => evaluate("sqrt(9)")).toThrow(FeatureLockedError);
    expect(evaluate("sqrt(9)", all("square_root", "parentheses"))).toBe(3);
    expect(evaluate("ln(1)", all("scientific", "parentheses"))).toBe(0);
  });

  it("ignoreGating bypasses locks", () => {
    expect(evaluate("2*3*4", { ignoreGating: true })).toBe(24);
  });
});

describe("engine — precedence and parsing", () => {
  it("multiplication before addition", () => {
    expect(evaluate("2+3*4", all("multiplication"))).toBe(14);
  });

  it("parentheses override precedence", () => {
    expect(evaluate("(2+3)*4", all("multiplication", "parentheses"))).toBe(20);
  });

  it("exponent is right-associative", () => {
    expect(evaluate("2^3^2", all("power"))).toBe(512);
  });

  it("modulo", () => {
    expect(evaluate("10%3", all("modulo"))).toBe(1);
  });
});

describe("engine — error handling", () => {
  it("division by zero", () => {
    expect(() => evaluate("1/0", all("division"))).toThrow(CalculationError);
  });

  it("empty expression", () => {
    expect(() => evaluate("")).toThrow(CalculationError);
  });

  it("mismatched parentheses", () => {
    expect(() => evaluate("(1+2", all("parentheses"))).toThrow(CalculationError);
  });

  it("malformed number", () => {
    expect(() => evaluate("1.2.3")).toThrow(CalculationError);
  });

  it("unexpected character", () => {
    expect(() => evaluate("2 & 3")).toThrow(CalculationError);
  });
});

describe("tokenize / toRPN", () => {
  it("tokenizes numbers and operators", () => {
    const tokens = tokenize("12+3");
    expect(tokens.map((t) => t.value)).toEqual(["12", "+", "3"]);
  });

  it("produces RPN in the right order", () => {
    const rpn = toRPN(tokenize("2+3"));
    expect(rpn.map((t) => t.value)).toEqual(["2", "3", "+"]);
  });
});

describe("formatResult", () => {
  it("shows integers plainly", () => {
    expect(formatResult(42)).toBe("42");
  });

  it("truncates to 2 dp on free tier with a hint", () => {
    expect(formatResult(1 / 3)).toBe("0.33…");
  });

  it("keeps precision when unlimited decimals unlocked", () => {
    expect(formatResult(1 / 3, { unlimitedDecimals: true })).toContain("0.3333");
  });

  it("formats binary", () => {
    expect(formatResult(10, { mode: "binary" })).toBe("0b1010");
  });

  it("formats hexadecimal", () => {
    expect(formatResult(255, { mode: "hexadecimal" })).toBe("0xFF");
  });
});
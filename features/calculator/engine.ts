import type { FeatureSlug } from "@/types/features";
import { FREE_FEATURES } from "@/lib/constants";

/**
 * Calculator Pro calculator engine.
 *
 * A dependency-free tokenizer + shunting-yard parser + RPN evaluator.
 * Deliberately does NOT use `eval`. Every operator and function is gated:
 * the evaluator is handed the set of unlocked feature slugs and throws a
 * {@link FeatureLockedError} the moment a locked capability is used.
 */

export class FeatureLockedError extends Error {
  readonly feature: FeatureSlug;
  constructor(feature: FeatureSlug) {
    super(`Feature "${feature}" is locked`);
    this.name = "FeatureLockedError";
    this.feature = feature;
  }
}

export class CalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculationError";
  }
}

type TokenType =
  | "number"
  | "operator"
  | "unary"
  | "function"
  | "lparen"
  | "rparen";

interface Token {
  type: TokenType;
  value: string;
  requires?: FeatureSlug;
}

interface OperatorInfo {
  precedence: number;
  associativity: "left" | "right";
  requires: FeatureSlug;
  apply: (a: number, b: number) => number;
}

const OPERATORS: Record<string, OperatorInfo> = {
  "+": { precedence: 2, associativity: "left", requires: "addition", apply: (a, b) => a + b },
  "-": { precedence: 2, associativity: "left", requires: "subtraction", apply: (a, b) => a - b },
  "*": { precedence: 3, associativity: "left", requires: "multiplication", apply: (a, b) => a * b },
  "/": {
    precedence: 3,
    associativity: "left",
    requires: "division",
    apply: (a, b) => {
      if (b === 0) throw new CalculationError("Cannot divide by zero");
      return a / b;
    },
  },
  "%": {
    precedence: 3,
    associativity: "left",
    requires: "modulo",
    apply: (a, b) => {
      if (b === 0) throw new CalculationError("Cannot modulo by zero");
      return a % b;
    },
  },
  "^": { precedence: 4, associativity: "right", requires: "power", apply: (a, b) => Math.pow(a, b) },
};

const FUNCTIONS: Record<string, { requires: FeatureSlug; apply: (x: number) => number }> = {
  sqrt: {
    requires: "square_root",
    apply: (x) => {
      if (x < 0) throw new CalculationError("Cannot sqrt a negative number");
      return Math.sqrt(x);
    },
  },
  sin: { requires: "scientific", apply: (x) => Math.sin(x) },
  cos: { requires: "scientific", apply: (x) => Math.cos(x) },
  tan: { requires: "scientific", apply: (x) => Math.tan(x) },
  log: {
    requires: "scientific",
    apply: (x) => {
      if (x <= 0) throw new CalculationError("log requires a positive number");
      return Math.log10(x);
    },
  },
  ln: {
    requires: "scientific",
    apply: (x) => {
      if (x <= 0) throw new CalculationError("ln requires a positive number");
      return Math.log(x);
    },
  },
};

const FUNCTION_NAMES = Object.keys(FUNCTIONS).sort((a, b) => b.length - a.length);

/** Tokenize an infix expression string. Throws CalculationError on bad input. */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = input.trim();

  const prev = () => tokens[tokens.length - 1];
  const expectsUnary = () => {
    const p = prev();
    return !p || p.type === "operator" || p.type === "unary" || p.type === "lparen";
  };

  while (i < src.length) {
    const ch = src[i];

    if (ch === " ") {
      i++;
      continue;
    }

    // Number (integer or decimal)
    if (/[0-9.]/.test(ch)) {
      let num = "";
      let dotSeen = false;
      while (i < src.length && /[0-9.]/.test(src[i])) {
        if (src[i] === ".") {
          if (dotSeen) throw new CalculationError("Malformed number");
          dotSeen = true;
        }
        num += src[i];
        i++;
      }
      if (num === ".") throw new CalculationError("Malformed number");
      tokens.push({ type: "number", value: num });
      continue;
    }

    // Function name
    const fnMatch = FUNCTION_NAMES.find((name) =>
      src.slice(i, i + name.length).toLowerCase() === name,
    );
    if (fnMatch) {
      tokens.push({ type: "function", value: fnMatch, requires: FUNCTIONS[fnMatch].requires });
      i += fnMatch.length;
      continue;
    }

    // Unary minus / plus
    if ((ch === "-" || ch === "+") && expectsUnary()) {
      tokens.push({
        type: "unary",
        value: ch,
        requires: ch === "-" ? "subtraction" : "addition",
      });
      i++;
      continue;
    }

    // Binary operator
    if (ch in OPERATORS) {
      tokens.push({ type: "operator", value: ch, requires: OPERATORS[ch].requires });
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "lparen", value: "(", requires: "parentheses" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ")", requires: "parentheses" });
      i++;
      continue;
    }

    throw new CalculationError(`Unexpected character: "${ch}"`);
  }

  return tokens;
}

/** Convert an infix token stream to Reverse Polish Notation (shunting-yard). */
export function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "number":
        output.push(token);
        break;
      case "function":
        stack.push(token);
        break;
      case "unary":
        // Unary binds tighter than binary operators; push onto stack.
        stack.push(token);
        break;
      case "operator": {
        const o1 = OPERATORS[token.value];
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top.type === "function" || top.type === "unary") {
            output.push(stack.pop()!);
            continue;
          }
          if (top.type === "operator") {
            const o2 = OPERATORS[top.value];
            const higher =
              o2.precedence > o1.precedence ||
              (o2.precedence === o1.precedence && o1.associativity === "left");
            if (higher) {
              output.push(stack.pop()!);
              continue;
            }
          }
          break;
        }
        stack.push(token);
        break;
      }
      case "lparen":
        stack.push(token);
        break;
      case "rparen": {
        let matched = false;
        while (stack.length) {
          const top = stack.pop()!;
          if (top.type === "lparen") {
            matched = true;
            break;
          }
          output.push(top);
        }
        if (!matched) throw new CalculationError("Mismatched parentheses");
        // Pop a function sitting on top of the parenthesised group.
        if (stack.length && stack[stack.length - 1].type === "function") {
          output.push(stack.pop()!);
        }
        break;
      }
    }
  }

  while (stack.length) {
    const top = stack.pop()!;
    if (top.type === "lparen" || top.type === "rparen") {
      throw new CalculationError("Mismatched parentheses");
    }
    output.push(top);
  }

  return output;
}

/** Evaluate an RPN token stream to a number. */
function evalRPN(rpn: Token[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === "number") {
      stack.push(parseFloat(token.value));
    } else if (token.type === "unary") {
      const x = stack.pop();
      if (x === undefined) throw new CalculationError("Invalid expression");
      stack.push(token.value === "-" ? -x : x);
    } else if (token.type === "function") {
      const x = stack.pop();
      if (x === undefined) throw new CalculationError("Invalid expression");
      stack.push(FUNCTIONS[token.value].apply(x));
    } else if (token.type === "operator") {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new CalculationError("Invalid expression");
      stack.push(OPERATORS[token.value].apply(a, b));
    }
  }

  if (stack.length !== 1) throw new CalculationError("Invalid expression");
  const result = stack[0];
  if (!Number.isFinite(result)) throw new CalculationError("Result is not a finite number");
  return result;
}

/**
 * Assert that every capability used by the token stream is unlocked.
 * Throws {@link FeatureLockedError} for the first locked feature encountered.
 */
export function assertUnlocked(tokens: Token[], unlocked: Set<FeatureSlug>): void {
  for (const token of tokens) {
    if (token.requires && !unlocked.has(token.requires)) {
      throw new FeatureLockedError(token.requires);
    }
  }
}

export interface EvaluateOptions {
  /** Set of unlocked feature slugs. Free features are always included. */
  unlocked?: Iterable<FeatureSlug>;
  /** Skip gating entirely (used by tests / previews). */
  ignoreGating?: boolean;
}

/**
 * Evaluate an infix expression to a numeric result, enforcing feature gates.
 */
export function evaluate(expression: string, options: EvaluateOptions = {}): number {
  const tokens = tokenize(expression);
  if (tokens.length === 0) throw new CalculationError("Empty expression");

  if (!options.ignoreGating) {
    const unlocked = new Set<FeatureSlug>([...FREE_FEATURES, ...(options.unlocked ?? [])]);
    assertUnlocked(tokens, unlocked);
  }

  return evalRPN(toRPN(tokens));
}

/** Round-trip helper: format a numeric result for display. */
export interface FormatOptions {
  /** When false (free tier), truncate to 2 decimal places. */
  unlimitedDecimals?: boolean;
  /** Output base. */
  mode?: "decimal" | "binary" | "hexadecimal";
}

export function formatResult(value: number, options: FormatOptions = {}): string {
  const { unlimitedDecimals = false, mode = "decimal" } = options;

  if (mode === "binary" || mode === "hexadecimal") {
    if (!Number.isInteger(value)) {
      // Non-integers can't be shown in these bases; fall back with a marker.
      const truncated = Math.trunc(value);
      const base = mode === "binary" ? 2 : 16;
      const prefix = mode === "binary" ? "0b" : "0x";
      return `${prefix}${Math.abs(truncated).toString(base).toUpperCase()}…`;
    }
    const base = mode === "binary" ? 2 : 16;
    const prefix = mode === "binary" ? "0b" : "0x";
    const sign = value < 0 ? "-" : "";
    return `${sign}${prefix}${Math.abs(value).toString(base).toUpperCase()}`;
  }

  if (Number.isInteger(value)) return String(value);

  if (unlimitedDecimals) {
    // Trim trailing zeros but keep full precision.
    return parseFloat(value.toPrecision(12)).toString();
  }

  // Free tier: truncate (not round) to 2 decimals, hint at hidden precision.
  const truncated = Math.trunc(value * 100) / 100;
  const hasMore = truncated !== parseFloat(value.toPrecision(12));
  return hasMore ? `${truncated.toFixed(2)}…` : truncated.toString();
}
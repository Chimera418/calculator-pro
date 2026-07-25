"use client";

import * as React from "react";
import { CalcButton } from "./CalcButton";
import type { useCalculator } from "@/hooks/useCalculator";

type Calc = ReturnType<typeof useCalculator>;

export function ScientificPad({ calc }: { calc: Calc }) {
  const op = (o: string) => () => calc.input(o);

  return (
    <div className="grid grid-cols-4 gap-3 lg:grid-cols-2">
      <CalcButton label="MC" ariaLabel="Memory clear" variant="function" featureSlug="memory" onActivate={calc.memoryClear} />
      <CalcButton label="MR" ariaLabel="Memory recall" variant="function" featureSlug="memory" onActivate={calc.memoryRecall} />
      <CalcButton label="M+" ariaLabel="Memory add" variant="function" featureSlug="memory" onActivate={calc.memoryAdd} />
      <CalcButton label="M−" ariaLabel="Memory subtract" variant="function" featureSlug="memory" onActivate={calc.memorySubtract} />

      <CalcButton label="sin" ariaLabel="Sine" variant="function" featureSlug="scientific" onActivate={op("sin(")} />
      <CalcButton label="cos" ariaLabel="Cosine" variant="function" featureSlug="scientific" onActivate={op("cos(")} />
      <CalcButton label="tan" ariaLabel="Tangent" variant="function" featureSlug="scientific" onActivate={op("tan(")} />
      <CalcButton label="ln" ariaLabel="Natural log" variant="function" featureSlug="scientific" onActivate={op("ln(")} />

      <CalcButton label="√" ariaLabel="Square root" variant="function" featureSlug="square_root" onActivate={op("sqrt(")} />
      <CalcButton label="xʸ" ariaLabel="Power" variant="function" featureSlug="power" onActivate={op("^")} />
      <CalcButton label="(" ariaLabel="Open parenthesis" variant="function" featureSlug="parentheses" onActivate={op("(")} />
      <CalcButton label=")" ariaLabel="Close parenthesis" variant="function" featureSlug="parentheses" onActivate={op(")")} />
    </div>
  );
}

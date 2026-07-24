"use client";

import * as React from "react";
import { Delete } from "lucide-react";
import { CalcButton } from "./CalcButton";
import type { useCalculator } from "@/hooks/useCalculator";

type Calc = ReturnType<typeof useCalculator>;

export function ButtonGrid({ calc }: { calc: Calc }) {
  const num = (n: string) => () => calc.input(n);
  const op = (o: string) => () => calc.input(o);

  return (
    <div className="mt-4 space-y-2">
      {/* Memory row */}
      <div className="grid grid-cols-4 gap-2">
        <CalcButton label="MC" ariaLabel="Memory clear" variant="function" featureSlug="memory" onActivate={calc.memoryClear} />
        <CalcButton label="MR" ariaLabel="Memory recall" variant="function" featureSlug="memory" onActivate={calc.memoryRecall} />
        <CalcButton label="M+" ariaLabel="Memory add" variant="function" featureSlug="memory" onActivate={calc.memoryAdd} />
        <CalcButton label="M−" ariaLabel="Memory subtract" variant="function" featureSlug="memory" onActivate={calc.memorySubtract} />
      </div>

      {/* Scientific row */}
      <div className="grid grid-cols-4 gap-2">
        <CalcButton label="sin" ariaLabel="Sine" variant="function" featureSlug="scientific" onActivate={op("sin(")} />
        <CalcButton label="cos" ariaLabel="Cosine" variant="function" featureSlug="scientific" onActivate={op("cos(")} />
        <CalcButton label="tan" ariaLabel="Tangent" variant="function" featureSlug="scientific" onActivate={op("tan(")} />
        <CalcButton label="ln" ariaLabel="Natural log" variant="function" featureSlug="scientific" onActivate={op("ln(")} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <CalcButton label="√" ariaLabel="Square root" variant="function" featureSlug="square_root" onActivate={op("sqrt(")} />
        <CalcButton label="xʸ" ariaLabel="Power" variant="function" featureSlug="power" onActivate={op("^")} />
        <CalcButton label="(" ariaLabel="Open parenthesis" variant="function" featureSlug="parentheses" onActivate={op("(")} />
        <CalcButton label=")" ariaLabel="Close parenthesis" variant="function" featureSlug="parentheses" onActivate={op(")")} />
      </div>

      {/* Main pad */}
      <div className="grid grid-cols-4 gap-2">
        <CalcButton label="AC" ariaLabel="All clear" variant="utility" onActivate={calc.clearAll} />
        <CalcButton label={<Delete className="h-5 w-5" />} ariaLabel="Backspace" variant="function" onActivate={calc.backspace} />
        <CalcButton label="%" ariaLabel="Modulo" variant="operator" featureSlug="modulo" onActivate={op("%")} />
        <CalcButton label="÷" ariaLabel="Divide" variant="operator" featureSlug="division" onActivate={op("/")} />

        <CalcButton label="7" ariaLabel="Seven" onActivate={num("7")} />
        <CalcButton label="8" ariaLabel="Eight" onActivate={num("8")} />
        <CalcButton label="9" ariaLabel="Nine" onActivate={num("9")} />
        <CalcButton label="×" ariaLabel="Multiply" variant="operator" featureSlug="multiplication" onActivate={op("*")} />

        <CalcButton label="4" ariaLabel="Four" onActivate={num("4")} />
        <CalcButton label="5" ariaLabel="Five" onActivate={num("5")} />
        <CalcButton label="6" ariaLabel="Six" onActivate={num("6")} />
        <CalcButton label="−" ariaLabel="Subtract" variant="operator" onActivate={op("-")} />

        <CalcButton label="1" ariaLabel="One" onActivate={num("1")} />
        <CalcButton label="2" ariaLabel="Two" onActivate={num("2")} />
        <CalcButton label="3" ariaLabel="Three" onActivate={num("3")} />
        <CalcButton label="+" ariaLabel="Add" variant="operator" onActivate={op("+")} />

        <CalcButton label="0" ariaLabel="Zero" wide onActivate={num("0")} />
        <CalcButton label="." ariaLabel="Decimal point" onActivate={op(".")} />
        <CalcButton label="=" ariaLabel="Equals" variant="equals" featureSlug="equals" onActivate={calc.compute} />
      </div>
    </div>
  );
}
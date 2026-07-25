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
    <div className="mt-4 grid grid-cols-4 gap-3">
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
  );
}

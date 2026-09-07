"use client";

import { useState } from "react";
import { Card, Field, inputClass } from "@/components/ui";
import { calcBreakEven, fmtINR } from "@/lib/calculations";

export default function BreakEvenCalculator() {
  const [fixed, setFixed] = useState(24000);
  const [price, setPrice] = useState(2450);
  const [variable, setVariable] = useState(2150);
  const be = calcBreakEven(fixed, price, variable);

  return (
    <Card>
      <Field label="Fixed costs / month">
        <input type="number" value={fixed} onChange={(e) => setFixed(Number(e.target.value))} className={inputClass} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Selling price/unit">
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Variable cost/unit">
          <input type="number" value={variable} onChange={(e) => setVariable(Number(e.target.value))} className={inputClass} />
        </Field>
      </div>
      <div className="mt-3 text-sm">
        You need to sell approximately{" "}
        <b>{be.units === Infinity ? "—" : be.units.toLocaleString("en-IN") + " units"}</b> per month to cover fixed and variable costs
        {be.units !== Infinity && <> (about {fmtINR(be.revenue)} in revenue).</>}
      </div>
    </Card>
  );
}

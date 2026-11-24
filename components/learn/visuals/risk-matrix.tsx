"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFrame } from "./frame";

const COF = ["A", "B", "C", "D", "E"]; const POF = [5, 4, 3, 2, 1];
const level = (p: number, c: number) => { const s = p + c + 1; return s <= 4 ? 0 : s <= 6 ? 1 : s <= 8 ? 2 : 3; };
const LV = [["Low", "bg-emerald-400/25 text-emerald-50", "Inspect at the normal interval; consider reducing effort with a documented reason."], ["Medium", "bg-amber-200/25 text-amber-50", "Keep the planned inspection; check data quality for the drivers."], ["Medium-high", "bg-orange-400/30 text-orange-50", "Plan an effective inspection before the risk target date; review mitigation."], ["High", "bg-red-500/35 text-red-50", "Act now: effective inspection, FFS, process changes or consequence reduction."]] as const;
const DF = ["≤ 1", "1–10", "10–100", "100–1,000", "> 1,000"]; const CA = ["≤ 9.3 m²", "9.3–93 m²", "93–929 m²", "929–9,290 m²", "> 9,290 m²"];

/** 5×5 risk matrix with API 581-style category ranges (risk regions illustrative — each owner sets its own). */
export function RiskMatrix() {
  const [sel, setSel] = useState<[number, number]>([3, 2]);
  const [p, c] = sel; const lv = LV[level(p - 1, c)];
  return <VizFrame title="Interactive — risk matrix" caption="Probability categories follow the damage-factor decades (and POF from 3.06E-05 upward) and consequence categories follow area decades, as in API 581 Part 1 Table 4.1M. The coloured regions are illustrative: each owner/user defines its own risk regions and target.">
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="grid grid-cols-[2.5rem_repeat(5,minmax(0,1fr))] gap-1 text-center text-xs">
        {POF.map((pp) => <div key={pp} className="contents"><div className="flex flex-col items-center justify-center text-white/60"><span className="font-mono text-sm text-white">{pp}</span></div>
          {COF.map((cc, ci) => { const l = LV[level(pp - 1, ci)]; const on = p === pp && c === ci; return <button key={cc} type="button" aria-pressed={on} aria-label={`Probability ${pp}, consequence ${cc}: ${l[0]}`} onClick={() => setSel([pp, ci])} className={cn("aspect-[4/3] rounded-lg font-mono text-sm transition", l[1], on ? "ring-2 ring-white" : "opacity-80 hover:opacity-100")}>{pp}{cc}</button>; })}</div>)}
        <div /><>{COF.map((cc) => <div key={cc} className="pt-1 font-mono text-sm text-white">{cc}</div>)}</>
        <div /><div className="col-span-5 text-white/50">Consequence category →</div>
      </div>
      <div className="grid content-start gap-2 text-sm">
        <p className="text-white/60">Probability <strong className="font-mono text-white">{p}</strong> · total damage factor {DF[p - 1]}</p>
        <p className="text-white/60">Consequence <strong className="font-mono text-white">{COF[c]}</strong> · affected area {CA[c]}</p>
        <p className={cn("rounded-xl px-3 py-2 font-semibold", lv[1])}>{lv[0]} risk</p>
        <p className="text-white/75">{lv[2]}</p>
        <p className="text-xs text-white/45">Moving up one probability row = 10× more likely. Moving right one column = 10× larger consequence. Diagonal cells can carry similar risk for very different reasons.</p>
      </div>
    </div>
  </VizFrame>;
}

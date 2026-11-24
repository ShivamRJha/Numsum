"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFrame } from "./frame";
// [name, path in a 0..600 x 0..200 box (time→, temperature↑), what, why, where]
const HT: [string, string, string, string, string][] = [
  ["Normalize", "M 20 190 L 120 50 L 220 50 L 400 185", "Heat above the upper critical temperature, hold, cool in still air.", "Refines grain, improves toughness and uniformity.", "SA-516 over 40 mm, SA-333 Gr 6, SA-350 LF2"],
  ["Normalize + temper", "M 20 190 L 100 50 L 180 50 L 290 185 L 360 95 L 470 95 L 560 185", "Normalize, then reheat below the lower critical temperature and hold.", "Restores toughness and relieves stress after normalizing; essential for Cr-Mo.", "SA-387, SA-335 P11/P22/P91, SA-182 F22"],
  ["Quench + temper", "M 20 190 L 100 50 L 180 50 L 200 185 L 300 95 L 430 95 L 540 185", "Heat, quench rapidly in water or oil, then temper.", "High strength with good toughness.", "SA-537 Cl 2/3, SA-193 B7, SA-320 L7"],
  ["Anneal", "M 20 190 L 120 55 L 220 55 L 560 185", "Heat, hold, cool slowly in the furnace.", "Softest condition, easy forming and machining.", "Some Cr-Mo plate and tubes"],
  ["Solution anneal", "M 20 190 L 110 25 L 210 25 L 235 185", "Heat to a high temperature to dissolve carbides/intermetallics, then cool rapidly (water quench).", "Best corrosion resistance and ductility for stainless, duplex and many nickel alloys.", "SA-240, SA-312, SA-182 F316L, SA-790 duplex"],
  ["Stress relieve / PWHT", "M 20 190 L 150 100 L 330 100 L 560 185", "Heat below the lower critical temperature, hold, controlled cooling.", "Reduces residual stress from welding or forming.", "Fabricated vessels; simulated PWHT coupons (SA-20 S3)"],
];
export function HeatTreatment() {
  const [i, setI] = useState(1); const h = HT[i];
  return <VizFrame title="Interactive — heat-treatment cycles at a glance" caption="Schematic temperature–time shapes only; temperatures and holding times come from the specification for each grade.">
    <div className="flex flex-wrap gap-1.5">{HT.map((x, k) => <button key={x[0]} type="button" onClick={() => setI(k)} aria-pressed={i === k} className={cn("rounded-full border px-3 py-1 text-xs", i === k ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60")}>{x[0]}</button>)}</div>
    <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 600 210" className="w-full" role="img" aria-label={`${h[0]} cycle`}>
        <line x1={20} y1={195} x2={590} y2={195} stroke="var(--viz-muted)" /><line x1={20} y1={10} x2={20} y2={195} stroke="var(--viz-muted)" />
        <line x1={20} y1={70} x2={590} y2={70} stroke="var(--viz-blue)" strokeDasharray="5 4" /><text x={586} y={64} textAnchor="end" style={{ fill: "var(--viz-blue)" }}>upper critical (Ac3)</text>
        <line x1={20} y1={110} x2={590} y2={110} stroke="var(--viz-faint)" strokeDasharray="5 4" /><text x={586} y={104} textAnchor="end" className="muted">lower critical (Ac1)</text>
        <path d={h[1]} fill="none" stroke="var(--viz-accent)" strokeWidth={3} strokeLinejoin="round" /><text x={300} y={208} textAnchor="middle" className="muted">time →</text><text x={26} y={20} className="muted">temperature</text>
      </svg>
      <div className="text-sm"><p className="font-semibold text-amber-50">{h[0]}</p><p className="mt-1 text-white/75">{h[2]}</p><p className="mt-2 text-white/60"><strong className="text-white/80">Why:</strong> {h[3]}</p><p className="mt-2 text-white/60"><strong className="text-white/80">Typical specs:</strong> {h[4]}</p></div>
    </div>
  </VizFrame>;
}

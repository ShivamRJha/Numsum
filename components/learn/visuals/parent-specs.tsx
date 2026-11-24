"use client";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFrame } from "./frame";
const MAP: [string, string, string, string[]][] = [
  ["Plate (carbon & alloy)", "SA-20", "Tension per plate-as-rolled, Charpy rules, UT/MT options, LTV marking", ["SA-516", "SA-285", "SA-537", "SA-387"]],
  ["Plate (stainless)", "SA-480", "Solution anneal, tests per coil / per 100 pieces, IGC", ["SA-240"]],
  ["Pipe (carbon & ferritic)", "SA-530", "Hydro rules, flattening, NH marking, test report", ["SA-106", "SA-53"]],
  ["Pipe (alloy & stainless)", "SA-999", "Tolerances, flattening, NDE in place of hydro", ["SA-312", "SA-333", "SA-335", "SA-790"]],
  ["Tubes (carbon & low alloy)", "SA-450", "Flattening, flaring, flange, hardness, hydro/NDE", ["SA-179", "SA-192", "SA-210", "SA-214"]],
  ["Tubes (alloy & stainless)", "SA-1016", "Same set for alloy/stainless tubes", ["SA-213", "SA-249", "SA-334"]],
  ["Flanges & forged fittings", "SA-961", "Tension, hardness, impact, S50–S60 options", ["SA-105", "SA-182", "SA-350"]],
  ["Forgings (vessel parts)", "SA-788", "Tests by forging weight, UT/MT/PT, Charpy options", ["SA-266", "SA-336"]],
  ["Wrought butt-weld fittings", "SA-960", "Hardness, tension, S52–S77 options", ["SA-234", "SA-403", "SA-420"]],
  ["Castings", "SA-703", "One tension per heat, NDE S4–S7, weld-repair rules", ["SA-216", "SA-217", "SA-351", "SA-352"]],
  ["Bolting", "SA-962", "Hardness, tension, proof load, impact", ["SA-193", "SA-194", "SA-320"]],
];
export function ParentSpecs() {
  const [i, setI] = useState(0); const m = MAP[i];
  return <VizFrame title="Interactive — product form → parent spec → product specs" caption="Most testing rules for a product form live in its parent general-requirements specification. Test methods for all of them: SA-370 (mechanical) and SA-751 (chemical).">
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="grid gap-1">{MAP.map((x, k) => <button key={x[0]} type="button" onClick={() => setI(k)} aria-pressed={i === k} className={cn("flex justify-between rounded-xl border px-3 py-1.5 text-left text-sm", i === k ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/10 text-white/70 hover:border-white/30")}><span>{x[0]}</span><span className="font-mono text-xs">{x[1]}</span></button>)}</div>
      <div className="flex flex-col items-stretch justify-center gap-3">
        <div className="rounded-2xl border border-sky-200/30 bg-sky-300/[0.06] p-4 text-center"><p className="text-xs text-white/50">Parent general requirements</p><p className="font-mono text-2xl text-sky-100">{m[1]}</p><p className="mt-1 text-sm text-white/70">{m[2]}</p></div>
        <p className="text-center text-white/30" aria-hidden>▼ applies to ▼</p>
        <div className="flex flex-wrap justify-center gap-2">{m[3].map((s) => <Link key={s} href={`/engineering/material-spec-finder#${s}`} className="rounded-xl border border-amber-100/40 bg-amber-100/10 px-3 py-2 font-mono text-sm text-amber-50 hover:bg-amber-100/20">{s}</Link>)}</div>
      </div>
    </div>
  </VizFrame>;
}

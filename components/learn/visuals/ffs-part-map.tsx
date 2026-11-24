"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFrame } from "./frame";

const MAP: [string, string, string, string][] = [
  ["Widespread thinning", "Part 4", "General metal loss", "Average the thickness data (or use thickness profiles if COV > 10%), compare with t_min plus FCA."],
  ["Local thin area / groove", "Part 5", "Local metal loss", "Size s and c, compute Rt and λ, Folias factor → RSF."],
  ["Pits", "Part 6", "Pitting corrosion", "Pit charts (Level 1) or pit-couple measurements (Level 2)."],
  ["Blisters, HIC, SOHIC", "Part 7", "Hydrogen blisters and HIC/SOHIC", "Blister size, spacing, cracking at edges; SOHIC treated as crack-like."],
  ["Out-of-roundness, peaking, offset", "Part 8", "Misalignment and shell distortion", "Extra bending stress from the geometry."],
  ["Crack or crack-like flaw", "Part 9", "Crack-like flaws (FAD)", "Kr and Lr plotted on the failure assessment diagram."],
  ["Low temperature / old equipment", "Part 3", "Brittle fracture", "Minimum allowable temperature from exemption curves, credits, or fracture mechanics."],
  ["Creep-range operation", "Part 10", "High-temperature / creep", "Accumulated creep damage from operating history."],
  ["Fire exposure", "Part 11", "Fire damage", "Heat-exposure zones decide the level of checks."],
  ["Dent or gouge", "Part 12", "Dents, gouges, combinations", "Depth, length, location; fatigue for cyclic pressure."],
  ["Laminations", "Part 13", "Laminations", "Spacing, depth, proximity to welds, hydrogen service."],
  ["Cyclic loading", "Part 14", "Fatigue", "Cycles against fatigue curves."],
];

/** Flaw → API 579-1 Part, with the three levels. */
export function FfsPartMap() {
  const [i, setI] = useState(1); const m = MAP[i];
  return <VizFrame title="Interactive — which part of API 579-1 do I use?" caption="Every part follows the same eight steps and offers Level 1 (screening), Level 2 (engineer) and Level 3 (detailed analysis). Start at Level 1; go deeper only if needed.">
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">{MAP.map((x, k) => <button key={x[0]} type="button" aria-pressed={i === k} onClick={() => setI(k)} className={cn("rounded-xl border px-2.5 py-2 text-left text-xs", i === k ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/10 text-white/70 hover:border-white/30")}><span className="block font-mono text-[10px] text-white/45">{x[1]}</span>{x[0]}</button>)}</div>
      <div className="rounded-2xl border border-white/10 p-4">
        <p className="font-mono text-sm text-amber-100">{m[1]} — {m[2]}</p><p className="mt-2 text-sm text-white/75">{m[3]}</p>
        <div className="mt-4 grid gap-2">{[["Level 1", "Screening with tables and simple equations; inspector or engineer; most conservative", "w-full"], ["Level 2", "Detailed calculation by an engineer; less conservative", "w-4/5"], ["Level 3", "Detailed stress / fracture analysis (often FEA) by specialists", "w-3/5"]].map(([a, b, w]) => <div key={a} className={cn("rounded-xl border border-sky-200/25 bg-sky-300/[0.06] px-3 py-2 text-xs", w)}><span className="font-semibold text-sky-100">{a}</span> <span className="text-white/65">— {b}</span></div>)}</div>
        <p className="mt-3 text-xs text-white/50">Outcome at any level: acceptable at current rating · acceptable at a reduced rating (MAWPr) · repair, replace or monitor.</p>
      </div>
    </div>
  </VizFrame>;
}

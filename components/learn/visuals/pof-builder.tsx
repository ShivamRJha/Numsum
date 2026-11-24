"use client";
import { useState } from "react";
import { Slider, Stat, VizFrame } from "./frame";

const sci = (v: number) => v.toExponential(2).replace("e", "E");
/** API 581: Pf = gff × FMS × Df, with FMS = 10^(−0.02·pscore + 1). */
export function PofBuilder() {
  const [lg, setLg] = useState(Math.log10(3.06e-5)); const [ps, setPs] = useState(50); const [ldf, setLdf] = useState(1.5);
  const gff = 10 ** lg; const fms = 10 ** (-0.02 * ps + 1); const df = 10 ** ldf; const pf = gff * fms * df;
  const cat = pf <= 3.06e-5 ? 1 : pf <= 3.06e-4 ? 2 : pf <= 3.06e-3 ? 3 : pf <= 3.06e-2 ? 4 : 5;
  const bar = (v: number) => `${Math.min(100, Math.max(2, ((Math.log10(v) + 7) / 7) * 100))}%`;
  return <VizFrame title="Interactive — probability of failure = gff × FMS × Df(t)" caption="Management-systems score (pscore) 0–100% gives FMS from 10 (poor) to 0.1 (excellent); 50% gives 1. The damage factor comes from the damage present and the inspection history. Category 1–5 by POF decade from 3.06E-05.">
    <div className="grid gap-4 md:grid-cols-3"><Slider label="Generic failure frequency gff" value={lg} min={-6} max={-3} step={0.01} onChange={setLg} fmt={(v) => sci(10 ** v)} /><Slider label="Management systems score (pscore)" value={ps} min={0} max={100} onChange={setPs} fmt={(v) => `${v}% → FMS ${(10 ** (-0.02 * v + 1)).toFixed(2)}`} /><Slider label="Damage factor Df(t)" value={ldf} min={0} max={4} step={0.01} onChange={setLdf} fmt={(v) => (10 ** v).toFixed(v < 1 ? 2 : 0)} /></div>
    <div className="mt-4 grid gap-2">{[["gff", gff], ["gff × FMS", gff * fms], ["Pf = gff × FMS × Df", pf]].map(([l, v]) => <div key={String(l)} className="grid grid-cols-[9rem_1fr_6rem] items-center gap-3 text-xs"><span className="text-white/60">{l}</span><span className="h-3 rounded-full bg-white/5"><span className="block h-3 rounded-full bg-gradient-to-r from-sky-300/60 to-amber-200/80" style={{ width: bar(v as number) }} /></span><span className="text-right font-mono text-white">{sci(v as number)}</span></div>)}</div>
    <div className="mt-4 grid grid-cols-3 gap-2"><Stat label="FMS" value={fms.toFixed(2)} /><Stat label="Pf per year" value={sci(pf)} /><Stat label="Probability category" value={String(cat)} tone={cat <= 2 ? "ok" : cat === 3 ? "warn" : "bad"} /></div>
  </VizFrame>;
}

"use client";
import { useState } from "react";
import { Slider, Stat, VizFrame } from "./frame";
/** Room-temperature allowable stress basis (Part D Mandatory Appendix 1, below the creep range). */
export function AllowableStress() {
  const [uts, setUts] = useState(485); const [ys, setYs] = useState(260);
  const a = uts / 3.5, b = (2 / 3) * ys; const s = Math.min(a, b);
  const max = Math.max(a, b) * 1.15;
  return <VizFrame title="Interactive — where a Table 1A allowable stress comes from" caption="At room temperature (below the creep range) the allowable is the lower of tensile/3.5 and ⅔ of yield. At temperature, the same factors are applied to the strength trend curves, and in the creep range creep-rate and rupture criteria take over. Always use the Part D value — this is only to understand it.">
    <div className="grid gap-3 sm:grid-cols-2"><Slider label="Specified minimum tensile strength (MPa)" value={uts} min={300} max={900} step={5} onChange={setUts} /><Slider label="Specified minimum yield strength (MPa)" value={ys} min={150} max={750} step={5} onChange={setYs} /></div>
    <div className="mt-4 grid gap-2">{[["Tensile ÷ 3.5", a], ["⅔ × yield", b]].map(([l, v]) => <div key={String(l)} className="grid grid-cols-[7rem_1fr_5rem] items-center gap-3 text-xs"><span className="text-white/60">{l}</span><span className="h-4 rounded-full bg-white/5"><span className={`block h-4 rounded-full ${v === s ? "bg-amber-200/80" : "bg-sky-300/40"}`} style={{ width: `${((v as number) / max) * 100}%` }} /></span><span className="text-right font-mono text-white">{(v as number).toFixed(0)} MPa</span></div>)}</div>
    <div className="mt-3 grid grid-cols-2 gap-2"><Stat label="Allowable stress S (room temp.)" value={`${s.toFixed(0)} MPa`} tone="ok" /><Stat label="Governed by" value={a <= b ? "tensile ÷ 3.5" : "⅔ yield"} /></div>
  </VizFrame>;
}

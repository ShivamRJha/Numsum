"use client";
import { useState } from "react";
import { VizFrame } from "./frame";
/** Why MT needs two perpendicular directions: a crack shows only when it cuts across the magnetic field. */
export function MtDirections() {
  const [crack, setCrack] = useState(20);
  const vis = (fieldDeg: number) => Math.abs(Math.sin(((crack - fieldDeg) * Math.PI) / 180));
  const field = (deg: number, cx: number, label: string) => { const v = vis(deg); return <g>
    <rect x={cx - 110} y={30} width={220} height={150} rx={10} fill="var(--viz-steel)" opacity={0.5} />
    {[-40, -20, 0, 20, 40].map((o) => <line key={o} x1={cx - 90} y1={105 + o} x2={cx + 90} y2={105 + o} stroke="var(--viz-blue)" strokeWidth={1} opacity={0.5} transform={`rotate(${-deg} ${cx} 105)`} />)}
    <line x1={cx - 45} y1={105} x2={cx + 45} y2={105} stroke="var(--viz-bad)" strokeWidth={2 + 5 * v} opacity={0.3 + 0.7 * v} transform={`rotate(${-crack} ${cx} 105)`} strokeLinecap="round" />
    <text x={cx} y={200} textAnchor="middle" className="muted">{label}</text><text x={cx} y={218} textAnchor="middle" style={{ fill: v > 0.7 ? "var(--viz-ok)" : v > 0.4 ? "var(--viz-warn)" : "var(--viz-bad)" }}>{v > 0.7 ? "clear indication" : v > 0.4 ? "weak indication" : "may be missed"}</text></g>; };
  return <VizFrame title="Interactive — why magnetic particle needs two directions" caption="Particles gather where the field leaks out of a crack; a crack parallel to the field barely disturbs it. Article 7 therefore requires at least two examinations per area with the field roughly perpendicular between them.">
    <svg viewBox="0 0 520 230" className="w-full" role="img" aria-label="Crack against two field directions">{field(0, 130, "Field shot 1 (horizontal)")}{field(90, 390, "Field shot 2 (vertical)")}</svg>
    <label className="mt-2 grid gap-1 text-xs text-white/65"><span>Crack orientation: <span className="font-mono text-white">{crack}°</span></span><input type="range" min={0} max={180} value={crack} onChange={(e) => setCrack(Number(e.target.value))} className="w-full accent-amber-300" /></label>
  </VizFrame>;
}

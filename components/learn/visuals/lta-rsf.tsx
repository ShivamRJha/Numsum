"use client";
import { useState } from "react";
import { Slider, Stat, VizFrame } from "./frame";

/** Folias factor for a cylindrical shell, longitudinal flaw (API 579-1 Part 5, Table 5.2 note 2), λ capped at 20. */
export function foliasMt(l: number) {
  const x = Math.min(l, 20);
  const p = 1.001 - 0.014195 * x + 0.2909 * x ** 2 - 0.09642 * x ** 3 + 0.02089 * x ** 4 - 0.003054 * x ** 5 + 2.957e-4 * x ** 6 - 1.8462e-5 * x ** 7 + 7.1553e-7 * x ** 8 - 1.5631e-8 * x ** 9 + 1.4656e-10 * x ** 10;
  return Math.sqrt(p);
}

export function LtaRsf() {
  const [D, setD] = useState(1800); const [tc, setTc] = useState(10); const [tmm, setTmm] = useState(7); const [fca, setFca] = useState(1); const [s, setS] = useState(150); const [mawp, setMawp] = useState(20);
  const Rt = Math.max((tmm - fca) / tc, 0); const lam = (1.285 * s) / Math.sqrt(D * tc); const Mt = foliasMt(lam);
  const rsf = Rt / (1 - (1 / Mt) * (1 - Rt)); const ok = rsf >= 0.9; const mawpr = ok ? mawp : (mawp * rsf) / 0.9;
  const lim = Rt >= 0.2 && tmm - fca >= 2.5;
  // cross-section drawing
  const W = 640, H = 150, wall = 60, depth = Math.min(Math.max(1 - Rt, 0), 0.95) * wall, len = Math.min(Math.max((s / (Math.PI * D)) * 2400, 30), 420);
  return <VizFrame title="Interactive — local thin area (LTA) and remaining strength factor" caption="Level 1 idea for a longitudinal LTA in a cylinder: Rt = (t_mm − FCA)/t_c, λ = 1.285·s/√(D·t_c), Folias factor from the Part 5 cylindrical-shell equation, RSF = Rt/[1 − (1/Mt)(1 − Rt)], RSFa = 0.90. Also check the other Level 1 limits (distance to discontinuities, groove radius, circumferential extent).">
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Wall cross-section with a local thin area">
      <rect x={20} y={40} width={W - 40} height={wall} fill="var(--viz-steel)" stroke="var(--viz-faint)" />
      <path d={`M ${W / 2 - len / 2} 40 Q ${W / 2} ${40 + depth * 2} ${W / 2 + len / 2} 40 Z`} fill="var(--viz-panel)" stroke="var(--viz-bad)" strokeWidth={1.5} />
      <line x1={W / 2 - len / 2} x2={W / 2 + len / 2} y1={28} y2={28} stroke="var(--viz-accent)" /><text x={W / 2} y={22} textAnchor="middle" style={{ fill: "var(--viz-accent)" }}>s = {s} mm</text>
      <text x={30} y={128} className="muted">t_c = {tc} mm (required, future-corroded)</text><text x={W - 30} y={128} textAnchor="end" style={{ fill: "var(--viz-bad)" }}>t_mm = {tmm} mm at the deepest point</text>
    </svg>
    <div className="mt-3 grid gap-3 sm:grid-cols-3"><Slider label="Inside diameter D (mm)" value={D} min={300} max={5000} step={50} onChange={setD} /><Slider label="t_c (mm)" value={tc} min={3} max={40} step={0.5} onChange={setTc} /><Slider label="t_mm (mm)" value={tmm} min={fca + 0.5} max={tc + fca} step={0.1} onChange={setTmm} /><Slider label="FCA (mm)" value={fca} min={0} max={5} step={0.1} onChange={setFca} /><Slider label="LTA length s (mm)" value={s} min={10} max={1500} step={10} onChange={setS} /><Slider label="MAWP (bar)" value={mawp} min={1} max={150} onChange={setMawp} /></div>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5"><Stat label="Rt" value={Rt.toFixed(2)} /><Stat label="λ" value={lam.toFixed(2)} /><Stat label="Mt (Folias)" value={Mt.toFixed(3)} /><Stat label="RSF" value={rsf.toFixed(3)} tone={ok ? "ok" : "bad"} /><Stat label={ok ? "MAWP kept" : "MAWPr"} value={`${mawpr.toFixed(1)} bar`} tone={ok ? "ok" : "warn"} /></div>
    {!lim && <p className="mt-2 text-sm text-red-200">Outside Level 1 limits (Rt below 0.20 or remaining ligament under 2.5 mm) — go to Level 2/3.</p>}
  </VizFrame>;
}

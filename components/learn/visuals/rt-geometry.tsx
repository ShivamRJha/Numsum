"use client";
import { useState } from "react";
import { Slider, Stat, VizFrame } from "./frame";
/** Geometric unsharpness Ug = F·d/D (Section V Art 2 / SE-1030 style geometry). */
export function RtGeometry() {
  const [F, setF] = useState(3); const [D, setD] = useState(600); const [d, setDd] = useState(25);
  const ug = (F * d) / D; const lim = d < 50 ? 0.51 : d < 75 ? 0.76 : d < 100 ? 1.02 : 1.78;
  const ok = ug <= lim; const sx = 300, sy = 20, oy = 50 + (D / 1500) * 160, fy = oy + Math.min(Math.max(d, 4) * 0.8, 70);
  return <VizFrame title="Interactive — radiographic geometry and unsharpness" caption="Ug = F × d ÷ D, where F is the source size, D the source-to-object distance and d the object-to-detector distance. Recommended maximum Ug rises with thickness (0.51 mm below 50 mm up to 1.78 mm above 100 mm); d is used here as the material thickness for simplicity.">
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
      <svg viewBox="0 0 600 310" className="w-full" role="img" aria-label="Source, object and film geometry">
        <rect x={sx - F * 3} y={sy - 6} width={Math.max(F * 6, 4)} height={10} fill="var(--viz-accent)" /><text x={sx + 30} y={sy + 2} style={{ fill: "var(--viz-accent)" }}>source (F = {F} mm)</text>
        <rect x={180} y={oy} width={240} height={fy - oy} fill="var(--viz-steel)" stroke="var(--viz-faint)" /><text x={430} y={(oy + fy) / 2 + 4} className="muted">object</text>
        <circle cx={300} cy={oy + 4} r={3} fill="var(--viz-bad)" />
        <line x1={sx - F * 3} y1={sy} x2={300 + ((300 - (sx - F * 3)) * (fy + 6 - oy)) / (oy - sy)} y2={fy + 6} stroke="var(--viz-blue)" strokeWidth={1} />
        <line x1={sx + F * 3} y1={sy} x2={300 - ((sx + F * 3 - 300) * (fy + 6 - oy)) / (oy - sy)} y2={fy + 6} stroke="var(--viz-blue)" strokeWidth={1} />
        <rect x={150} y={fy + 6} width={300} height={8} fill="var(--viz-ink)" opacity={0.8} /><text x={160} y={fy + 30} className="muted">film / detector</text>
        <text x={40} y={(sy + oy) / 2} className="muted">D = {D} mm</text><text x={40} y={(oy + fy) / 2 + 4} className="muted">d = {d} mm</text>
      </svg>
      <div className="grid content-start gap-3"><Slider label="Source size F (mm)" value={F} min={0.4} max={6} step={0.1} onChange={setF} /><Slider label="Source-to-object D (mm)" value={D} min={100} max={1500} step={10} onChange={setD} /><Slider label="Object-to-film d (mm)" value={d} min={3} max={150} onChange={setDd} />
        <Stat label="Ug" value={`${ug.toFixed(2)} mm`} tone={ok ? "ok" : "bad"} /><Stat label="Recommended max" value={`${lim} mm`} /><p className="text-xs text-white/55">{ok ? "Within the recommended limit." : "Too unsharp — increase D, use a smaller source or reduce d."}</p></div>
    </div>
  </VizFrame>;
}

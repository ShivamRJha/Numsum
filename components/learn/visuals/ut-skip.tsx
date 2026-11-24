"use client";
import { useState } from "react";
import { Slider, Stat, VizFrame } from "./frame";
/** Angle-beam UT: skip distance and sound path for a plate of thickness T. */
export function UtSkip() {
  const [T, setT] = useState(20); const [ang, setAng] = useState(60);
  const r = (ang * Math.PI) / 180; const half = T * Math.tan(r); const skip = 2 * half; const vpath = T / Math.cos(r);
  const sc = 360 / Math.max(skip * 1.3, 1); const top = 60, bot = top + T * sc * 0.9; const x0 = 60;
  return <VizFrame title="Interactive — angle-beam skip distance" caption="Half-skip = T·tanθ, full skip = 2T·tanθ, sound path to the bottom = T/cosθ. Scan the weld from positions that cover the full volume, usually up to a full skip (first and second leg).">
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]">
      <svg viewBox="0 0 520 200" className="w-full" role="img" aria-label="Sound beam bouncing through a plate">
        <rect x={20} y={top} width={480} height={bot - top} fill="var(--viz-steel)" opacity={0.6} />
        <path d={`M ${x0 + skip * sc} ${top} l -14 ${bot - top} h 28 Z`} fill="var(--viz-panel)" stroke="var(--viz-muted)" /><text x={x0 + skip * sc} y={top - 8} textAnchor="middle" className="muted">weld</text>
        <rect x={x0 - 22} y={top - 22} width={44} height={22} rx={3} fill="var(--viz-accent)" /><text x={x0} y={top - 28} textAnchor="middle" style={{ fill: "var(--viz-accent)" }}>probe {ang}°</text>
        <polyline points={`${x0},${top} ${x0 + half * sc},${bot} ${x0 + skip * sc},${top}`} fill="none" stroke="var(--viz-blue)" strokeWidth={2.5} />
        <text x={x0 + half * sc} y={bot + 16} textAnchor="middle" style={{ fill: "var(--viz-blue)" }}>½ skip {half.toFixed(1)} mm</text>
        <text x={x0 + skip * sc} y={bot + 32} textAnchor="middle" style={{ fill: "var(--viz-blue)" }}>full skip {skip.toFixed(1)} mm</text>
      </svg>
      <div className="grid content-start gap-3"><Slider label="Thickness T (mm)" value={T} min={6} max={80} onChange={setT} /><Slider label="Refracted angle θ (°)" value={ang} min={35} max={75} onChange={setAng} />
        <Stat label="Half-skip" value={`${half.toFixed(1)} mm`} /><Stat label="Full skip" value={`${skip.toFixed(1)} mm`} /><Stat label="Sound path (first leg)" value={`${vpath.toFixed(1)} mm`} /></div>
    </div>
  </VizFrame>;
}

"use client";
import { useState } from "react";
import { Slider, Stat, VizFrame } from "./frame";

const CODES = { "API 510 (vessel)": 10, "API 570 Class 1": 5, "API 570 Class 2/3": 10, "API 653 shell": 15 } as const;
type C = keyof typeof CODES;

/** Thickness vs time: long-term and short-term corrosion rates, remaining life and next inspection. */
export function CorrosionTimeline() {
  const [t0, setT0] = useState(12); const [tp, setTp] = useState(10.6); const [tn, setTn] = useState(10); const [treq, setTreq] = useState(7);
  const [yp, setYp] = useState(8); const [yn, setYn] = useState(10); const [code, setCode] = useState<C>("API 510 (vessel)");
  const lt = Math.max((t0 - tn) / Math.max(yn, 0.1), 0); const st = Math.max((tp - tn) / Math.max(yn - yp, 0.1), 0);
  const cr = Math.max(lt, st, 0.025); const rl = Math.max((tn - treq) / cr, 0);
  const cap = CODES[code]; const interval = rl < 4 && code === "API 510 (vessel)" ? Math.min(rl, 2) : Math.min(rl / 2, cap);
  const W = 640, H = 260, L = 44, R = 16, T = 14, B = 34; const xMax = Math.max(yn + Math.min(rl, 40) * 1.08, yn + 4); const yMin = Math.min(treq, tn) - 1, yMax = t0 + 0.5;
  const x = (v: number) => L + (v / xMax) * (W - L - R); const y = (v: number) => T + ((yMax - v) / (yMax - yMin)) * (H - T - B);
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round((xMax / 5) * i));
  const governs = st >= lt ? "short-term" : "long-term";
  return <VizFrame title="Interactive — corrosion rate, remaining life and next inspection" caption="Readings are in mm; time in years from the first reading. The governing (higher) rate is projected to t_required. Learning aid — the inspector chooses the rate that represents current conditions.">
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Thickness versus time chart">
        {ticks.map((t) => <g key={t}><line x1={x(t)} x2={x(t)} y1={T} y2={H - B} stroke="var(--viz-grid)" /><text x={x(t)} y={H - B + 16} textAnchor="middle" className="muted">{t} y</text></g>)}
        {[yMin, (yMin + yMax) / 2, yMax].map((v) => <text key={v} x={L - 6} y={y(v) + 4} textAnchor="end" className="muted mono">{v.toFixed(1)}</text>)}
        <line x1={L} x2={W - R} y1={y(treq)} y2={y(treq)} stroke="var(--viz-bad)" strokeDasharray="6 4" strokeWidth={1.5} /><text x={W - R} y={y(treq) - 6} textAnchor="end" style={{ fill: "var(--viz-bad)" }}>t_required {treq} mm</text>
        <line x1={x(0)} y1={y(t0)} x2={x(yn)} y2={y(tn)} stroke="var(--viz-blue)" strokeWidth={2} /><line x1={x(yp)} y1={y(tp)} x2={x(yn)} y2={y(tn)} stroke="var(--viz-accent)" strokeWidth={2} />
        <line x1={x(yn)} y1={y(tn)} x2={x(yn + rl)} y2={y(treq)} stroke="var(--viz-muted)" strokeWidth={1.5} strokeDasharray="3 3" />
        <line x1={x(yn + interval)} x2={x(yn + interval)} y1={T} y2={H - B} stroke="var(--viz-ok)" strokeWidth={1.5} /><text x={x(yn + interval) + 4} y={T + 12} style={{ fill: "var(--viz-ok)" }}>next inspection</text>
        {[[0, t0, "initial"], [yp, tp, "previous"], [yn, tn, "latest"]].map(([a, b, l]) => <g key={String(l)}><circle cx={x(a as number)} cy={y(b as number)} r={5} fill="var(--viz-panel)" stroke="var(--viz-ink)" strokeWidth={2} /><text x={x(a as number) + 7} y={y(b as number) - 8} className="muted">{String(l)}</text></g>)}
        <text x={L + 4} y={H - B - 8} style={{ fill: "var(--viz-blue)" }}>— long-term</text><text x={L + 96} y={H - B - 8} style={{ fill: "var(--viz-accent)" }}>— short-term</text>
      </svg>
      <div className="grid content-start gap-2.5">
        <select aria-label="Code" value={code} onChange={(e) => setCode(e.target.value as C)} className="rounded-xl border border-white/12 bg-[#0b1220] px-2 py-1.5 text-sm text-white">{(Object.keys(CODES) as C[]).map((c) => <option key={c}>{c}</option>)}</select>
        <Slider label="Initial thickness (mm)" value={t0} min={6} max={30} step={0.1} onChange={setT0} />
        <Slider label="Previous reading (mm)" value={tp} min={treq} max={t0} step={0.1} onChange={setTp} />
        <Slider label="Latest reading (mm)" value={tn} min={treq} max={tp} step={0.1} onChange={setTn} />
        <Slider label="t_required (mm)" value={treq} min={2} max={Math.max(tn - 0.1, 2.1)} step={0.1} onChange={setTreq} />
        <Slider label="Years to previous reading" value={yp} min={1} max={yn - 1} onChange={setYp} />
        <Slider label="Years to latest reading" value={yn} min={yp + 1} max={30} onChange={setYn} />
      </div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="Long-term rate" value={`${lt.toFixed(3)} mm/y`} /><Stat label="Short-term rate" value={`${st.toFixed(3)} mm/y`} /><Stat label={`Remaining life (${governs})`} value={`${rl.toFixed(1)} y`} tone={rl < 4 ? "bad" : rl < 10 ? "warn" : "ok"} /><Stat label={`Interval (cap ${cap} y)`} value={`${interval.toFixed(1)} y`} tone="ok" /></div>
  </VizFrame>;
}

"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFrame } from "./frame";

const SPOTS = {
  inj: ["Injection point", "From at least 300 mm (or 3 pipe diameters) upstream to the second change in flow direction downstream, or 7.6 m past the first change — whichever is less. Thickness every 3 years by default; profile RT or UT grids."],
  dead: ["Deadleg", "Little or no flow — water and solids collect. Corrosion can be faster than the main line; track it as its own circuit and measure at the low point and the connection."],
  cui: ["Corrosion under insulation", "Insulated carbon steel roughly −12 °C to 175 °C. Look at damaged jacketing, penetrations, low points and supports. API 570 sets how much to inspect by class."],
  sa: ["Soil-to-air interface", "Where buried pipe comes out of the ground: inspect from about 300 mm below to 150 mm above grade. Coating breaks here corrode fast."],
  elbow: ["Elbow / change of direction", "Erosion and erosion-corrosion on the outer radius. Place CMLs on the extrados; use a UT grid."],
  sup: ["Pipe support contact point", "Water trapped between pipe and support corrodes the pipe bottom. Lift or use guided-wave / special UT."],
  sbp: ["Small-bore connection", "Vents, drains and instrument tappings: vibration fatigue and thread corrosion. Class 1 primary SBP is inspected like the main line."],
} as const;
type K = keyof typeof SPOTS;

/** Schematic piping circuit with the API 570 / 574 high-risk locations. */
export function PipingCircuit() {
  const [k, setK] = useState<K>("inj");
  const dot = (key: K, cx: number, cy: number, n: number) => <g key={key} role="button" tabIndex={0} aria-label={SPOTS[key][0]} onClick={() => setK(key)} onKeyDown={(e) => e.key === "Enter" && setK(key)} className="cursor-pointer">
    <circle cx={cx} cy={cy} r={13} fill={k === key ? "var(--viz-accent)" : "var(--viz-panel)"} stroke="var(--viz-accent)" strokeWidth={2} /><text x={cx} y={cy + 4} textAnchor="middle" className="mono" style={{ fill: k === key ? "#000" : "var(--viz-accent)", fontWeight: 700 }}>{n}</text></g>;
  return <VizFrame title="Interactive — where piping corrodes first" caption="Tap a numbered spot. Locations from API 570 §5.5 and API 574 §7; distances are the API 570 (2009) values.">
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <svg viewBox="0 0 620 300" className="w-full" role="img" aria-label="Piping circuit schematic">
        <rect x={0} y={248} width={620} height={52} fill="var(--viz-faint)" /><text x={10} y={290} className="muted">ground</text>
        <path d="M 30 80 H 300 V 200 H 470 V 270" fill="none" stroke="var(--viz-steel)" strokeWidth={16} strokeLinejoin="round" />
        <path d="M 30 80 H 300 V 200 H 470 V 270" fill="none" stroke="var(--viz-muted)" strokeWidth={1} strokeDasharray="2 6" />
        <rect x={120} y={64} width={110} height={32} rx={6} fill="none" stroke="var(--viz-blue)" strokeDasharray="4 3" /><text x={175} y={58} textAnchor="middle" style={{ fill: "var(--viz-blue)" }}>insulated</text>
        <path d="M 300 200 H 330" stroke="var(--viz-steel)" strokeWidth={16} /><path d="M 380 200 V 150" stroke="var(--viz-steel)" strokeWidth={10} /><rect x={372} y={132} width={16} height={18} fill="var(--viz-steel)" />
        <line x1={70} y1={30} x2={70} y2={72} stroke="var(--viz-accent)" strokeWidth={3} /><text x={74} y={26} style={{ fill: "var(--viz-accent)" }}>chemical / water injection</text>
        <rect x={40} y={92} width={265} height={6} fill="var(--viz-bad)" opacity={0.35} />
        <path d="M 520 140 h -50 v 60" fill="none" stroke="var(--viz-steel)" strokeWidth={10} /><rect x={520} y={128} width={30} height={24} rx={4} fill="var(--viz-steel)" /><text x={555} y={124} className="muted">closed valve</text>
        <rect x={440} y={214} width={60} height={8} fill="var(--viz-muted)" opacity={0.6} />
        {dot("inj", 70, 118, 1)}{dot("cui", 175, 120, 2)}{dot("elbow", 300, 80, 3)}{dot("sbp", 380, 120, 4)}{dot("dead", 520, 170, 5)}{dot("sup", 440, 240, 6)}{dot("sa", 470, 262, 7)}
      </svg>
      <div className="rounded-2xl border border-white/10 p-4"><p className="font-semibold text-amber-50">{SPOTS[k][0]}</p><p className="mt-2 text-sm leading-6 text-white/75">{SPOTS[k][1]}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{(Object.keys(SPOTS) as K[]).map((key, i) => <button key={key} type="button" onClick={() => setK(key)} className={cn("rounded-full border px-2.5 py-1 text-xs", k === key ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60")}>{i + 1}. {SPOTS[key][0]}</button>)}</div></div>
    </div>
  </VizFrame>;
}

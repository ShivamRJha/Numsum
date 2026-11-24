import { VizFrame } from "./frame";
const STEPS: [string, string, string][] = [
  ["Pre-clean", "Remove scale, oil, paint; solvent or detergent", "border-sky-300/40"],
  ["Dry", "Let solvents evaporate completely", "border-sky-300/40"],
  ["Apply penetrant", "Brush, spray or dip; 5–52 °C unless qualified", "border-amber-300/50"],
  ["Dwell", "At least the Table T-672 minimum, never over 2 h; keep wet", "border-amber-300/50"],
  ["Remove excess", "Solvent: wipe only. Water: ≤ 350 kPa, ≤ 43 °C", "border-orange-300/50"],
  ["Develop", "Thin even coat of developer", "border-emerald-300/50"],
  ["Interpret", "10–60 min after the developer dries; 1,000 lx (visible) or UV ≥ 1,000 µW/cm²", "border-emerald-300/50"],
  ["Post-clean & record", "Remove residues; report indications and disposition", "border-white/20"],
];
export function PtTimeline() {
  return <VizFrame title="Liquid penetrant — the sequence and the clocks" caption="ASME V Article 6 (2017). The procedure states the exact values; times shorter or temperatures outside the range need qualification.">
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([a, b, c], i) => <li key={a} className={`rounded-2xl border-l-4 border-y border-r border-y-white/10 border-r-white/10 p-3 ${c}`}><p className="font-mono text-xs text-white/40">STEP {i + 1}</p><p className="font-semibold text-white">{a}</p><p className="mt-1 text-xs text-white/65">{b}</p></li>)}</ol>
  </VizFrame>;
}

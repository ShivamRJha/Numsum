import { VizFrame } from "./frame";
const PARTS: [string, string, boolean][] = [
  ["Title box", "ASME number, ASTM/AWS basis, ASME exceptions", false], ["1 Scope", "Product form, sizes, grades, service", false], ["2 Referenced documents", "Points to the parent general-requirements spec", true],
  ["3 Ordering information", "What the PO must state (grade, HT, S-requirements)", true], ["Materials & manufacture", "Melting practice, killed / fine grain, forming", false], ["Heat treatment", "Mandatory condition, temperatures, marking letters", true],
  ["Chemical composition", "Heat analysis + product analysis tolerances", true], ["Mechanical properties", "Tension, hardness, impact — frequency & location", true], ["Product tests", "Hydro / NDE, flattening, bend, grain size, IGC", true],
  ["Dimensions & workmanship", "Tolerances, finish, repair welding", false], ["Retests & rejection", "One retest rules; retreatment", false], ["Certification & marking", "MTR contents; NDE / NH / LTV letters", true], ["Supplementary (S1, S2 …)", "Only if named in the order", true],
];
export function SpecAnatomy() {
  return <VizFrame title="Anatomy of a material specification" caption="Highlighted blocks are the ones a QAP is built from. When a block is thin, the rule usually sits in the parent general-requirements spec.">
    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{PARTS.map(([t, d, q], i) => <div key={t} className={`flex gap-3 rounded-xl border p-2.5 ${q ? "border-amber-100/40 bg-amber-100/[0.06]" : "border-white/10"}`}><span className="font-mono text-xs text-white/35">{String(i + 1).padStart(2, "0")}</span><span><span className="block text-sm font-semibold text-white">{t}</span><span className="text-xs text-white/60">{d}</span></span></div>)}</div>
  </VizFrame>;
}

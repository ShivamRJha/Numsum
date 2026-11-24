import Link from "next/link";
import { VizFrame } from "./frame";
const FAM = [
  ["Mechanical & metallurgical", "Temperature, stress, time", "Fatigue, creep, brittle fracture, embrittlement, erosion", "Hardness, replication, UT/TOFD, MT/PT for cracks", "border-sky-300/40"],
  ["Uniform / localized thinning", "Water, oxygen, chemistry", "Atmospheric, CUI, cooling water, CO₂, MIC, soil, galvanic", "UT thickness, profile RT, visual, guided wave", "border-emerald-300/40"],
  ["High-temperature corrosion", "Above ~200 °C, gas chemistry", "Oxidation, sulfidation, carburization, metal dusting, nitriding", "UT thickness, metallography, hardness", "border-amber-300/40"],
  ["Environment-assisted cracking", "Susceptible material + environment + stress", "Chloride, caustic, amine, carbonate, PTA SCC, wet H₂S, H₂ embrittlement", "WFMT, PT, ET, shear-wave UT, PAUT", "border-red-300/40"],
  ["Process-specific (refining)", "Specific acids, salts, H₂", "HCl, HF, H₂SO₄, naphthenic acid, NH₄HS, NH₄Cl, sour water, HTHA", "Targeted UT grids, advanced UT for HTHA", "border-violet-300/40"],
];
export function DmFamilies() {
  return <VizFrame title="The five families of damage" caption={<>Learn the family first: it tells you the driving factors, how the damage looks and which NDE finds it. <Link href="/learn/damage-mechanisms" className="text-amber-100">Open all 69 mechanisms →</Link></>}>
    <div className="grid gap-2 md:grid-cols-5">{FAM.map(([n, d, e, f, c]) => <div key={n} className={`rounded-2xl border-l-4 border-y border-r border-y-white/10 border-r-white/10 bg-white/[0.02] p-3 ${c}`}><p className="text-sm font-semibold text-white">{n}</p><p className="mt-2 text-[11px] uppercase tracking-[.12em] text-white/40">Driven by</p><p className="text-xs text-white/75">{d}</p><p className="mt-2 text-[11px] uppercase tracking-[.12em] text-white/40">Examples</p><p className="text-xs text-white/75">{e}</p><p className="mt-2 text-[11px] uppercase tracking-[.12em] text-white/40">Find it with</p><p className="text-xs text-white/75">{f}</p></div>)}</div>
  </VizFrame>;
}

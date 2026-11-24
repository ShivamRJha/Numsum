"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { VizFrame } from "./frame";

const FLAWS = ["Surface crack", "Volumetric weld flaw (porosity, slag)", "Planar weld flaw (lack of fusion, crack)", "Lamination in plate", "Wall loss / corrosion", "Through-wall leak", "Tube wall loss (exchanger)"] as const;
const MATS = ["Carbon / low-alloy steel (magnetic)", "Austenitic / duplex / nickel / non-ferrous"] as const;
type Rec = [method: string, art: string, note: string, rank: 1 | 2];
function recs(f: number, m: number): Rec[] {
  const mag = m === 0;
  switch (f) {
    case 0: return mag ? [["MT", "Art 7", "Most sensitive for surface and near-surface cracks in ferromagnetic steel", 1], ["PT", "Art 6", "Works too; needs clean, open cracks", 2], ["ET / ACFM", "Art 8 / 15", "Through coatings", 2]] : [["PT", "Art 6", "The standard choice on non-magnetic materials", 1], ["ET", "Art 8", "Fast screening, through thin coatings", 2]];
    case 1: return [["RT", "Art 2", "Best image of volumetric flaws", 1], ["UT / PAUT", "Art 4", "Also detects them; better for thick sections", 2]];
    case 2: return [["UT / PAUT / TOFD", "Art 4", "Best for planar flaws and for sizing their height", 1], ["RT", "Art 2", "Only if the flaw lies roughly parallel to the beam", 2]];
    case 3: return [["Straight-beam UT", "Art 5 (+ SA-435 / SA-578)", "Laminations are parallel to the surface — invisible to RT", 1]];
    case 4: return [["UT thickness / C-scan", "Art 5 / Art 4", "Spot readings for uniform loss, grids or mapping for local loss", 1], ["Profile RT", "Art 2", "Small-bore and insulated piping", 2], ["Guided wave / MFL", "Art 19 / 16", "Screening long lengths and tank floors", 2]];
    case 5: return [["Bubble or vacuum-box test", "Art 10 App I / II", "Simple, for pads, linings, tank bottoms", 1], ["Helium mass spectrometer", "Art 10", "Very small leak rates", 2]];
    default: return mag ? [["Remote field testing (RFT)", "Art 17", "Ferromagnetic tubes", 1], ["IRIS (internal rotary UT)", "Art 4/5 practice", "Accurate wall maps", 2]] : [["Eddy current (bobbin)", "Art 8", "Standard for non-magnetic exchanger tubes", 1], ["IRIS", "UT", "Confirm and size", 2]];
  }
}
export function NdeSelector() {
  const [f, setF] = useState(0); const [m, setM] = useState(0); const list = recs(f, m);
  const pill = (on: boolean) => cn("rounded-full border px-3 py-1 text-xs text-left", on ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60 hover:text-white");
  return <VizFrame title="Interactive — choose an NDE method" caption="Based on the imperfection-versus-method guidance of Section V Article 1 and common practice. The referencing code decides which method is required and its acceptance criteria.">
    <p className="text-xs text-white/50">What are you looking for?</p>
    <div className="mt-1.5 flex flex-wrap gap-1.5">{FLAWS.map((x, i) => <button key={x} type="button" onClick={() => setF(i)} aria-pressed={f === i} className={pill(f === i)}>{x}</button>)}</div>
    <p className="mt-3 text-xs text-white/50">Material</p>
    <div className="mt-1.5 flex flex-wrap gap-1.5">{MATS.map((x, i) => <button key={x} type="button" onClick={() => setM(i)} aria-pressed={m === i} className={pill(m === i)}>{x}</button>)}</div>
    <div className="mt-4 grid gap-2 md:grid-cols-3">{list.map(([a, b, c, r]) => <div key={a} className={cn("rounded-2xl border p-3", r === 1 ? "border-emerald-300/40 bg-emerald-400/[0.06]" : "border-white/10")}><p className="text-[11px] uppercase tracking-[.14em] text-white/45">{r === 1 ? "First choice" : "Alternative"}</p><p className="mt-1 font-semibold text-white">{a}</p><p className="font-mono text-xs text-sky-200">ASME V {b}</p><p className="mt-1 text-xs text-white/65">{c}</p></div>)}</div>
  </VizFrame>;
}

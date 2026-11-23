"use client";
import { useState } from "react";
import { BigResult, CalcLayout, Choice, Field, Num, PressureInput, Verdict, Warnings, Working, num } from "./calc-kit";
import { PART_LABELS, vessel, type Part } from "@/lib/eng/vessel";
import { fmt, fromMPa, toMPa, type PUnit } from "@/lib/eng/units";

export function VesselCalc() {
  const [part, setPart] = useState<Part>("shell");
  const [P, setP] = useState<number | "">(15); const [pu, setPu] = useState<PUnit>("barg");
  const [D, setD] = useState<number | "">(1500); const [S, setS] = useState<number | "">(138); const [E, setE] = useState<number>(0.85);
  const [CA, setCA] = useState<number | "">(3); const [tNom, setTNom] = useState<number | "">(""); const [ut, setUt] = useState<number | "">(0);
  const r = vessel({ part, P: toMPa(num(P), pu), D: num(D), S: num(S), E, CA: num(CA), tNom: tNom === "" ? null : tNom, underTol: num(ut) });
  return <CalcLayout
    inputs={<div className="grid gap-4">
      <Field label="Part"><select value={part} onChange={(e) => setPart(e.target.value as Part)} className="w-full rounded-xl border border-white/12 bg-[#0b1220] px-3 py-2.5 text-white">{(Object.keys(PART_LABELS) as Part[]).map((k) => <option key={k} value={k}>{PART_LABELS[k]}</option>)}</select></Field>
      <Field label="Design pressure (internal)" htmlFor="v-p"><PressureInput id="v-p" value={P} unit={pu} onValue={setP} onUnit={setPu} /></Field>
      <Field label={part === "shellOD" ? "Outside diameter" : "Inside diameter"} htmlFor="v-d"><Num id="v-d" value={D} onChange={setD} suffix="mm" /></Field>
      <Field label="Allowable stress S at design temperature" htmlFor="v-s" hint="From ASME Section II-D for your material and temperature (e.g. SA-516 Gr 70 at moderate temperature is about 138 MPa — check the table)."><Num id="v-s" value={S} onChange={setS} suffix="MPa" /></Field>
      <Field label="Joint efficiency E" hint="1.00 full radiography · 0.85 spot radiography · 0.70 no radiography (Type 1 butt joints, UW-12). Seamless heads: 1.00."><Choice label="Joint efficiency" value={String(E)} options={[["1", "1.00"], ["0.85", "0.85"], ["0.7", "0.70"]]} onChange={(v) => setE(Number(v))} /></Field>
      <Field label="Corrosion allowance" htmlFor="v-ca"><Num id="v-ca" value={CA} onChange={setCA} suffix="mm" /></Field>
      <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer text-sm font-semibold text-white/80">Check an actual plate (optional)</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Nominal thickness" htmlFor="v-tn"><Num id="v-tn" value={tNom} onChange={setTNom} suffix="mm" /></Field><Field label="Mill under-tolerance" htmlFor="v-ut"><Num id="v-ut" value={ut} onChange={setUt} suffix="mm" /></Field></div></details>
    </div>}
    results={<>
      <div className="grid gap-3 sm:grid-cols-2"><BigResult label="Required thickness (pressure)" value={fmt(r.tReq, 2)} unit="mm" /><BigResult label="Minimum with corrosion allowance" value={fmt(r.tMin, 2)} unit="mm" tone="warn" sub={`ASME VIII-1 ${r.clause}`} /></div>
      {r.mawpCorroded !== null && <BigResult label="MAWP of your plate (corroded)" value={fmt(fromMPa(r.mawpCorroded, pu), 2)} unit={pu === "barg" ? "bar g" : pu === "psig" ? "psi g" : pu === "kgcm2" ? "kg/cm² g" : "MPa g"} sub={r.margin !== null ? `Thickness margin ${fmt(r.margin, 2)} mm` : undefined} tone={r.ok ? "ok" : "bad"} />}
      <Verdict ok={r.ok} yes="The plate is thick enough for this design pressure." no="The plate is thinner than required — choose a thicker plate, a stronger material or a better joint efficiency." />
      <Warnings items={r.warnings} />
      <Working steps={r.steps} />
    </>} />;
}

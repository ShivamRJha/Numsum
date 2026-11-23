"use client";
import { useState } from "react";
import { BigResult, CalcLayout, Choice, Field, Num, PressureInput, Warnings, Working, num } from "./calc-kit";
import { testPressure, type TestCode } from "@/lib/eng/hydrotest";
import { fmt, fromMPa, toMPa, P_UNITS, type PUnit } from "@/lib/eng/units";

export function HydrotestCalc() {
  const [code, setCode] = useState<TestCode>("asme8");
  const [P, setP] = useState<number | "">(15); const [pu, setPu] = useState<PUnit>("barg");
  const [sT, setST] = useState<number | "">(138); const [sD, setSD] = useState<number | "">(138);
  const [h, setH] = useState<number | "">(0); const [pneu, setPneu] = useState(false);
  const r = testPressure({ code, P: toMPa(num(P), pu), sTest: num(sT), sDesign: num(sD, 1), height: num(h), pneumatic: pneu });
  const u = P_UNITS[pu].label;
  return <CalcLayout
    inputs={<div className="grid gap-4">
      <Field label="Code"><Choice label="Code" value={code} options={[["asme8", "Pressure vessel — ASME VIII-1"], ["b313", "Process piping — ASME B31.3"]]} onChange={setCode} /></Field>
      <Field label={code === "asme8" ? "MAWP (or design pressure)" : "Design pressure"} htmlFor="h-p"><PressureInput id="h-p" value={P} unit={pu} onValue={setP} onUnit={setPu} /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Allowable stress at test temperature" htmlFor="h-st"><Num id="h-st" value={sT} onChange={setST} suffix="MPa" /></Field><Field label="Allowable stress at design temperature" htmlFor="h-sd"><Num id="h-sd" value={sD} onChange={setSD} suffix="MPa" /></Field></div>
      <Field label="Test medium"><Choice label="Test medium" value={pneu ? "air" : "water"} options={[["water", "Water (hydrostatic)"], ["air", "Air / gas (pneumatic)"]]} onChange={(v) => setPneu(v === "air")} /></Field>
      {!pneu && <Field label="Height from the gauge to the lowest point (optional)" htmlFor="h-h" hint="Adds the weight of the water column."><Num id="h-h" value={h} onChange={setH} suffix="m" /></Field>}
    </div>}
    results={<>
      <div className="grid gap-3 sm:grid-cols-2"><BigResult label="Test pressure at the top" value={fmt(fromMPa(r.pTop, pu), 2)} unit={u} tone="warn" sub={`${r.factor} × pressure × stress ratio ${fmt(r.ratio, 3)}`} /><BigResult label="At the lowest point" value={fmt(fromMPa(r.pBottom, pu), 2)} unit={u} sub={r.head ? `includes ${fmt(fromMPa(r.head, pu), 2)} ${u} of water head` : "no static head"} /></div>
      <Warnings items={r.notes} />
      <Working steps={r.steps} />
    </>} />;
}

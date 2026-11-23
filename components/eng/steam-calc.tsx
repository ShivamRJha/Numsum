"use client";
import { useState } from "react";
import { BigResult, CalcLayout, Field, Num, Working, inputCls, num } from "./calc-kit";
import { ORIFICES, TRAP_STATES, steamLoss } from "@/lib/eng/steam";
import { fmt } from "@/lib/eng/units";

export function SteamCalc() {
  const [p, setP] = useState<number | "">(10); const [d, setD] = useState<number | "">(6); const [state, setState] = useState<string>("blow");
  const [n, setN] = useState<number | "">(1); const [hours, setHours] = useState<number | "">(8000); const [cost, setCost] = useState<number | "">(2500); const [co2, setCo2] = useState<number | "">(0.18);
  const f = TRAP_STATES.find((s) => s.k === state)?.f ?? 1;
  const r = steamLoss({ pBarg: num(p), orificeMm: num(d), factor: f, hours: num(hours), costPerTonne: num(cost), co2PerTonne: num(co2), count: num(n, 1) });
  return <CalcLayout
    inputs={<div className="grid gap-4">
      <Field label="Steam pressure upstream of the trap" htmlFor="s-p"><Num id="s-p" value={p} onChange={setP} suffix="bar g" /></Field>
      <Field label="Orifice diameter" htmlFor="s-d" hint={<>Typical by trap size: {Object.entries(ORIFICES).map(([k, v]) => `${k} → ${v} mm`).join(" · ")}. Use the maker's figure when you know the model.</>}><Num id="s-d" value={d} onChange={setD} suffix="mm" /></Field>
      <Field label="Trap condition"><select value={state} onChange={(e) => setState(e.target.value)} className={inputCls}>{TRAP_STATES.map((s) => <option key={s.k} value={s.k} className="bg-[#0b1220]">{s.label} — loss factor {s.f}</option>)}</select></Field>
      <Field label="Number of traps like this" htmlFor="s-n"><Num id="s-n" value={n} onChange={setN} min={1} step={1} /></Field>
      <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer text-sm font-semibold text-white/80">Cost and CO₂ settings</summary><div className="mt-3 grid gap-3 sm:grid-cols-3"><Field label="Operating hours / year" htmlFor="s-h"><Num id="s-h" value={hours} onChange={setHours} /></Field><Field label="Steam cost" htmlFor="s-c"><Num id="s-c" value={cost} onChange={setCost} suffix="₹/t" /></Field><Field label="CO₂ per tonne steam" htmlFor="s-co"><Num id="s-co" value={co2} onChange={setCo2} suffix="t" /></Field></div></details>
    </div>}
    results={<>
      <div className="grid gap-3 sm:grid-cols-2"><BigResult label="Steam lost" value={fmt(r.kgh, 1)} unit="kg/h" tone={r.kgh > 0 ? "bad" : "ok"} /><BigResult label="Per year" value={fmt(r.tpy, 1)} unit="tonnes" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><BigResult label="Cost per year" value={`₹${Math.round(r.cost).toLocaleString("en-IN")}`} tone="warn" /><BigResult label="CO₂ per year" value={fmt(r.co2, 1)} unit="t CO₂" /></div>
      <Working steps={[
        { label: "Absolute pressure", formula: `(${num(p)} + 1.013) × 14.504`, value: `${fmt(r.psia, 1)} psia` },
        { label: "Orifice in inches", formula: `${num(d)} ÷ 25.4`, value: `${fmt(r.din, 3)} in` },
        { label: "Full-orifice flow (Napier)", formula: "24.24 × P × D²", value: `${fmt(r.fullLbh, 1)} lb/h = ${fmt(r.fullKgh, 2)} kg/h` },
        { label: "Loss for this condition", formula: `× factor ${f} × ${num(n, 1)} trap(s)`, value: `${fmt(r.kgh, 2)} kg/h` },
        { label: "Per year", formula: `× ${num(hours)} h ÷ 1000`, value: `${fmt(r.tpy, 1)} t` },
      ]} />
    </>} />;
}

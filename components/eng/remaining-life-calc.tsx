"use client";
import { useState } from "react";
import { BigResult, CalcLayout, Choice, Field, Num, Warnings, inputCls, num } from "./calc-kit";
import { CODE_RULES, remainingLife, type Code } from "@/lib/eng/remaining-life";
import { fmt } from "@/lib/eng/units";

type Row = { date: string; t: number | "" };
export function RemainingLifeCalc() {
  const [code, setCode] = useState<Code>("api510");
  const [tReq, setTReq] = useState<number | "">(7);
  const [init, setInit] = useState<Row>({ date: "2014-04-01", t: 12 });
  const [prev, setPrev] = useState<Row>({ date: "2022-04-01", t: 10.6 });
  const [last, setLast] = useState<Row>({ date: new Date().toISOString().slice(0, 10), t: 10 });
  const [extra, setExtra] = useState<Row[]>([]);
  const ok = (r: Row) => r.date && r.t !== "";
  const r = ok(init) && ok(last) ? remainingLife({ code, tReq: num(tReq), initial: { date: init.date, t: num(init.t) }, previous: ok(prev) ? { date: prev.date, t: num(prev.t) } : null, latest: { date: last.date, t: num(last.t) }, extra: extra.filter(ok).map((e) => ({ date: e.date, t: num(e.t) })) }) : null;
  const row = (label: string, v: Row, set: (r: Row) => void, id: string) => <div className="grid grid-cols-[1fr_1fr] gap-3"><Field label={`${label} — date`} htmlFor={`${id}-d`}><input id={`${id}-d`} type="date" value={v.date} onChange={(e) => set({ ...v, date: e.target.value })} className={inputCls} /></Field><Field label="Thickness" htmlFor={`${id}-t`}><Num id={`${id}-t`} value={v.t} onChange={(t) => set({ ...v, t })} suffix="mm" /></Field></div>;
  const tone = r ? (r.status === "act" ? "bad" : r.status === "watch" ? "warn" : "ok") : "neutral";
  return <CalcLayout
    inputs={<div className="grid gap-4">
      <Field label="Equipment and code"><Choice label="Code" value={code} options={(Object.keys(CODE_RULES) as Code[]).map((k) => [k, CODE_RULES[k].label])} onChange={setCode} /></Field>
      <Field label="Required (minimum) thickness" htmlFor="rl-req" hint="From the pressure vessel or pipe thickness calculator, or the design calculation."><Num id="rl-req" value={tReq} onChange={setTReq} suffix="mm" /></Field>
      {row("First / original", init, setInit, "rl-i")}
      {row("Previous reading", prev, setPrev, "rl-p")}
      {row("Latest reading", last, setLast, "rl-l")}
      <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer text-sm font-semibold text-white/80">More readings for a trend (optional)</summary>
        <div className="mt-3 grid gap-2">{extra.map((e, i) => <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"><input aria-label="Date" type="date" value={e.date} onChange={(ev) => setExtra((l) => l.map((x, k) => (k === i ? { ...x, date: ev.target.value } : x)))} className={inputCls} /><input aria-label="Thickness mm" type="number" step="any" value={e.t} onChange={(ev) => setExtra((l) => l.map((x, k) => (k === i ? { ...x, t: ev.target.value === "" ? "" : Number(ev.target.value) } : x)))} className={inputCls} /><button type="button" onClick={() => setExtra((l) => l.filter((_, k) => k !== i))} className="px-2 text-xs text-white/50 hover:text-red-200">Remove</button></div>)}
          {extra.length < 10 && <button type="button" onClick={() => setExtra((l) => [...l, { date: "", t: "" }])} className="justify-self-start rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/75">+ Add reading</button>}</div></details>
    </div>}
    results={r ? <>
      <div className="grid gap-3 sm:grid-cols-2"><BigResult label="Remaining life" value={r.rl !== null ? fmt(r.rl, 1) : "—"} unit="years" tone={tone} /><BigResult label="Next inspection due" value={r.nextDate || "Now"} sub={r.nextYears !== null ? `in ${fmt(r.nextYears, 1)} years — ${CODE_RULES[code].rule}` : undefined} tone={tone} /></div>
      <div className="grid gap-3 sm:grid-cols-3"><BigResult label="Long-term rate" value={fmt(r.crLong, 3)} unit="mm/y" /><BigResult label="Short-term rate" value={fmt(r.crShort, 3)} unit="mm/y" /><BigResult label="Trend rate" value={fmt(r.crTrend, 3)} unit="mm/y" sub="least squares (3+ readings)" /></div>
      <p className="text-sm text-white/65">Governing corrosion rate: <strong className="text-white">{fmt(r.cr, 3)} mm/year</strong> ({r.governs}) — the highest rate is used, as the codes require.</p>
      <Warnings items={r.notes} />
    </> : <p className="text-white/55">Enter at least the first and latest readings.</p>} />;
}

"use client";
import { useState } from "react";
import { BigResult, CalcLayout, Field, Num, PressureInput, Verdict, Warnings, Working, inputCls, num } from "./calc-kit";
import { MAT_LABELS, PIPES, SCHEDULES, pipeThickness, type MatClass } from "@/lib/eng/pipe";
import { fmt, fromMPa, toMPa, type PUnit } from "@/lib/eng/units";

export function PipeCalc() {
  const [nps, setNps] = useState("6");
  const [D, setD] = useState<number | "">(168.3);
  const [P, setP] = useState<number | "">(40); const [pu, setPu] = useState<PUnit>("barg");
  const [T, setT] = useState<number | "">(200); const [mat, setMat] = useState<MatClass>("ferritic");
  const [S, setS] = useState<number | "">(138); const [E, setE] = useState<number | "">(1); const [W, setW] = useState<number | "">(1);
  const [c, setC] = useState<number | "">(1.5); const [tol, setTol] = useState<number | "">(12.5); const [sch, setSch] = useState("");
  const size = PIPES.find((x) => x.nps === nps);
  const tNom = sch && size?.w[sch as keyof typeof size.w] ? (size.w[sch as keyof typeof size.w] as number) * 25.4 : null;
  const r = pipeThickness({ P: toMPa(num(P), pu), D: num(D), S: num(S), E: num(E, 1), W: num(W, 1), T: num(T), mat, c: num(c), millTol: num(tol) / 100, tNom, nps: size ? nps : null });
  const unitLabel = pu === "barg" ? "bar g" : pu === "psig" ? "psi g" : pu === "kgcm2" ? "kg/cm² g" : "MPa g";
  return <CalcLayout
    inputs={<div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3"><Field label="Pipe size (NPS)"><select value={nps} onChange={(e) => { setNps(e.target.value); const s = PIPES.find((x) => x.nps === e.target.value); if (s) setD(Math.round(s.od * 25.4 * 10) / 10); }} className={inputCls}>{PIPES.map((x) => <option key={x.nps} value={x.nps} className="bg-[#0b1220]">{x.nps}&quot;</option>)}<option value="custom" className="bg-[#0b1220]">Other</option></select></Field><Field label="Outside diameter" htmlFor="p-d"><Num id="p-d" value={D} onChange={(v) => { setD(v); setNps("custom"); }} suffix="mm" /></Field></div>
      <Field label="Design pressure" htmlFor="p-p"><PressureInput id="p-p" value={P} unit={pu} onValue={setP} onUnit={setPu} /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Design temperature" htmlFor="p-t"><Num id="p-t" value={T} onChange={setT} suffix="°C" /></Field><Field label="Material"><select value={mat} onChange={(e) => setMat(e.target.value as MatClass)} className={inputCls}>{(Object.keys(MAT_LABELS) as MatClass[]).map((k) => <option key={k} value={k} className="bg-[#0b1220]">{MAT_LABELS[k]}</option>)}</select></Field></div>
      <Field label="Allowable stress S at design temperature" htmlFor="p-s" hint="From ASME B31.3 Table A-1 for your material (e.g. A106 Gr B at moderate temperature is about 138 MPa — check the table)."><Num id="p-s" value={S} onChange={setS} suffix="MPa" /></Field>
      <Field label="Corrosion allowance + thread / groove depth (c)" htmlFor="p-c"><Num id="p-c" value={c} onChange={setC} suffix="mm" /></Field>
      <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer text-sm font-semibold text-white/80">More options</summary><div className="mt-3 grid gap-3 sm:grid-cols-3"><Field label="Joint factor E" hint="Seamless 1.0, ERW 0.85" htmlFor="p-e"><Num id="p-e" value={E} onChange={setE} /></Field><Field label="Weld strength W" hint="1.0 below creep range" htmlFor="p-w"><Num id="p-w" value={W} onChange={setW} /></Field><Field label="Mill tolerance" htmlFor="p-tol"><Num id="p-tol" value={tol} onChange={setTol} suffix="%" /></Field></div>
        {size && <Field label="Check a schedule"><select value={sch} onChange={(e) => setSch(e.target.value)} className={`${inputCls} mt-3`}><option value="" className="bg-[#0b1220]">—</option>{SCHEDULES.filter((s) => size.w[s]).map((s) => <option key={s} value={s} className="bg-[#0b1220]">Sch {s} — {((size.w[s] as number) * 25.4).toFixed(2)} mm</option>)}</select></Field>}</details>
    </div>}
    results={<>
      <div className="grid gap-3 sm:grid-cols-2"><BigResult label="Minimum required thickness t_m" value={fmt(r.tm, 2)} unit="mm" sub={`pressure ${fmt(r.t, 2)} mm + c`} /><BigResult label="Minimum nominal wall" value={fmt(r.tNomMin, 2)} unit="mm" tone="warn" sub="after mill tolerance" /></div>
      {r.suggested && <BigResult label={`Lightest listed schedule for NPS ${nps}"`} value={`Sch ${r.suggested.sch}`} sub={`${fmt(r.suggested.w, 2)} mm wall (ASME B36.10M — verify against your pipe spec)`} tone="ok" />}
      {r.mawp !== null && <BigResult label={`MAWP of Sch ${sch}`} value={fmt(fromMPa(r.mawp, pu), 2)} unit={unitLabel} tone={r.ok ? "ok" : "bad"} />}
      <Verdict ok={r.ok} yes="The selected schedule meets the required wall." no="The selected schedule is too thin for these conditions." />
      <Warnings items={r.warnings} />
      <Working steps={r.steps} />
    </>} />;
}

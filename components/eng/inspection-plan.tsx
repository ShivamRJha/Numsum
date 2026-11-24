"use client";
import { useEffect, useMemo, useState } from "react";
import { DM_MAT, DM_Q } from "@/lib/eng/damage-mechanisms";
import { buildPlan, matName, suggestClass, type PlanInput } from "@/lib/eng/inspection-plan";
import { cn } from "@/lib/utils";
import { Field, Num, inputCls } from "./calc-kit";

const KEY = "ns-iplan-v1";
const today = () => new Date().toISOString().slice(0, 10);
const DEFAULT: PlanInput = { tag: "V-101", desc: "Overhead accumulator", site: "", preparedBy: "", date: today(), kind: "vessel", code: "ASME VIII-1", P: 15, Tdes: 150, D: 1500, tNom: 14, CA: 3, S: 138, E: 0.85, mat: "CS", year: 2010, tmax: 60, tmin: 10,
  answers: { hc: true, water: true }, fluid: "hc", inventory: "medium", nearPeople: false, pipeClass: 0, injection: false, deadleg: false, sbp: false, buried: false, soilRes: 5000, cp: false, prd: true, prdService: "typical",
  readings: [{ date: "2014-04-01", t: 13.5 }, { date: "2022-04-01", t: 12.2 }, { date: "2024-04-01", t: 11.8 }], tReqOverride: null, lastInternal: "2024-04-01", lastExternal: "2023-01-01", lastPrd: "2022-06-01", lastCui: "" };
const GROUPS: [string, string[]][] = [
  ["Process fluid", ["hc", "lpg", "h2", "h2s", "sulf", "co2", "amine", "caus", "nh3", "acid", "nap", "oacid", "o2", "chl"]],
  ["Water and utilities", ["water", "stm", "cw", "aer", "stag"]],
  ["Operating conditions", ["insul", "cyc", "vib", "vel", "soil", "fired", "refr", "oil"]],
  ["Fabrication", ["pwht", "dmw", "thick", "hard", "galv", "lmetal"]],
];
const ACIDS: [string, string][] = [["", "Not sure"], ["none", "No acid"], ["HCl", "Hydrochloric (HCl)"], ["H2SO4", "Sulfuric (H₂SO₄)"], ["HF", "Hydrofluoric (HF)"], ["H3PO4", "Phosphoric (H₃PO₄)"]];
const STEPS = ["Equipment", "Design & material", "Service questions", "Condition & history", "Consequence & extras", "Inspection plan"];

export function InspectionPlan() {
  const [x, setX] = useState<PlanInput>(DEFAULT); const [step, setStep] = useState(0); const [ready, setReady] = useState(false);
  useEffect(() => { try { const r = localStorage.getItem(KEY); if (r) setX({ ...DEFAULT, ...JSON.parse(r) }); } catch { /* ignore */ } setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(x)); } catch { /* ignore */ } }, [x, ready]);
  const set = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) => setX((o) => ({ ...o, [k]: v }));
  const ans = (k: string, v: unknown) => setX((o) => { const a = { ...o.answers }; if (v === undefined) delete a[k]; else a[k] = v; return { ...o, answers: a }; });
  const plan = useMemo(() => buildPlan(x), [x]);
  const answered = Object.keys(x.answers).length; const totalQ = GROUPS.reduce((n, g) => n + g[1].length, 0);
  const go = (n: number) => { setStep(n); document.getElementById("ip-top")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const yn = (k: string) => { const v = x.answers[k]; return <div key={k} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2"><span className="text-sm text-white/85">{DM_Q[k]?.t}</span><span className="flex gap-1">{([["Yes", true], ["No", false], ["Not sure", undefined]] as const).map(([l, val]) => <button key={l} type="button" aria-pressed={v === val} onClick={() => ans(k, val)} className={cn("rounded-full border px-2.5 py-1 text-xs", v === val ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/55 hover:text-white")}>{l}</button>)}</span></div>; };
  const check = (label: string, v: boolean, on: (b: boolean) => void) => <label className="flex items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} />{label}</label>;
  const date = (label: string, v: string, on: (s: string) => void) => <Field label={label}><input type="date" value={v} onChange={(e) => on(e.target.value)} className={inputCls} /></Field>;

  return <div id="ip-top" className="scroll-mt-24">
    <ol className="flex flex-wrap gap-1.5 print:hidden" aria-label="Steps">{STEPS.map((s, k) => <li key={s}><button type="button" onClick={() => go(k)} aria-current={step === k} className={cn("rounded-full border px-3 py-1.5 text-xs", step === k ? "border-amber-100/70 bg-amber-100 font-semibold text-black" : k < step ? "border-emerald-300/40 text-emerald-100" : "border-white/12 text-white/60")}>{k + 1}. {s}</button></li>)}</ol>

    {step < 5 && <div className="premium-card mt-5 rounded-3xl border p-5 md:p-6 print:hidden">
      {step === 0 && <div className="grid gap-4 md:grid-cols-2">
        <Field label="Equipment type"><div className="flex gap-2">{(["vessel", "piping"] as const).map((k) => <button key={k} type="button" onClick={() => setX((o) => ({ ...o, kind: k, code: k === "vessel" ? "ASME VIII-1" : "ASME B31.3", D: k === "vessel" ? 1500 : 168.3, tNom: k === "vessel" ? 14 : 7.11 }))} className={cn("flex-1 rounded-xl border px-3 py-2.5 text-sm", x.kind === k ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/70")}>{k === "vessel" ? "Pressure vessel / drum / exchanger shell (API 510)" : "Piping circuit (API 570)"}</button>)}</div></Field>
        <Field label="Construction code"><input value={x.code} onChange={(e) => set("code", e.target.value)} className={inputCls} /></Field>
        <Field label="Tag / circuit no."><input value={x.tag} onChange={(e) => set("tag", e.target.value)} className={inputCls} /></Field>
        <Field label="Description"><input value={x.desc} onChange={(e) => set("desc", e.target.value)} className={inputCls} /></Field>
        <Field label="Plant / unit"><input value={x.site} onChange={(e) => set("site", e.target.value)} className={inputCls} /></Field>
        <Field label="Prepared by"><input value={x.preparedBy} onChange={(e) => set("preparedBy", e.target.value)} className={inputCls} /></Field>
      </div>}
      {step === 1 && <div className="grid gap-4 md:grid-cols-3">
        <Field label="Design pressure (bar g)" htmlFor="ip-p"><Num id="ip-p" value={x.P} onChange={(v) => set("P", Number(v) || 0)} /></Field>
        <Field label="Design temperature (°C)" htmlFor="ip-td"><Num id="ip-td" value={x.Tdes} onChange={(v) => set("Tdes", Number(v) || 0)} /></Field>
        <Field label={x.kind === "vessel" ? "Inside diameter (mm)" : "Outside diameter (mm)"} htmlFor="ip-d"><Num id="ip-d" value={x.D} onChange={(v) => set("D", Number(v) || 0)} /></Field>
        <Field label="Nominal thickness (mm)" htmlFor="ip-tn"><Num id="ip-tn" value={x.tNom} onChange={(v) => set("tNom", Number(v) || 0)} /></Field>
        <Field label="Corrosion allowance (mm)" htmlFor="ip-ca"><Num id="ip-ca" value={x.CA} onChange={(v) => set("CA", Number(v) || 0)} /></Field>
        <Field label="Allowable stress S at design temp. (MPa)" htmlFor="ip-s" hint="ASME II-D Table 1A/1B"><Num id="ip-s" value={x.S} onChange={(v) => set("S", Number(v) || 0)} /></Field>
        <Field label="Joint efficiency / quality factor E" htmlFor="ip-e"><Num id="ip-e" value={x.E} onChange={(v) => set("E", Number(v) || 1)} /></Field>
        <Field label="Material"><select value={x.mat} onChange={(e) => set("mat", e.target.value)} className={inputCls}>{Object.entries(DM_MAT).map(([k, v]) => <option key={k} value={k} className="bg-[#0b1220]">{v}</option>)}</select></Field>
        <Field label="Year built / in service" htmlFor="ip-y"><Num id="ip-y" value={x.year} onChange={(v) => set("year", Number(v) || 2000)} /></Field>
        <Field label="Highest operating temperature (°C)" htmlFor="ip-tx"><Num id="ip-tx" value={x.tmax} onChange={(v) => set("tmax", Number(v) || 0)} /></Field>
        <Field label="Lowest metal temperature (°C)" htmlFor="ip-tm" hint="Include start-up, depressurising, hydrotest"><Num id="ip-tm" value={x.tmin} onChange={(v) => set("tmin", Number(v) || 0)} /></Field>
        <Field label="t_required override (mm, optional)" htmlFor="ip-tr" hint="Leave empty to calculate from pressure"><Num id="ip-tr" value={x.tReqOverride ?? ""} onChange={(v) => set("tReqOverride", v === "" ? null : Number(v))} /></Field>
      </div>}
      {step === 2 && <div className="grid gap-5">
        <p className="text-sm text-white/60">These are the standard API 571 screening questions. Answer what you know; “Not sure” keeps the mechanism open in the plan. Answered {answered} of {totalQ}.</p>
        {GROUPS.map(([g, ks]) => <section key={g}><h3 className="text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">{g}</h3><div className="mt-2 grid gap-1.5 lg:grid-cols-2">{ks.map((k) => k === "acid" ? <div key={k} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2"><span className="text-sm text-white/85">{DM_Q.acid.t}</span><select aria-label="Acid service" value={x.answers.acid === null ? "none" : x.answers.acid ?? ""} onChange={(e) => ans("acid", e.target.value === "" ? undefined : e.target.value === "none" ? null : e.target.value)} className="rounded-lg border border-white/12 bg-[#0b1220] px-2 py-1 text-xs text-white">{ACIDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div> : yn(k))}</div></section>)}
      </div>}
      {step === 3 && <div className="grid gap-5">
        <section><h3 className="text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">Thickness readings at the governing CML</h3>
          <div className="mt-2 grid gap-2">{x.readings.map((r, k) => <div key={k} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"><Field label={k === 0 ? "Date (first = baseline)" : "Date"}><input type="date" value={r.date} onChange={(e) => set("readings", x.readings.map((q, j) => (j === k ? { ...q, date: e.target.value } : q)))} className={inputCls} /></Field><Field label="Thickness (mm)"><input type="number" step="any" value={r.t || ""} onChange={(e) => set("readings", x.readings.map((q, j) => (j === k ? { ...q, t: Number(e.target.value) } : q)))} className={inputCls} /></Field><button type="button" onClick={() => set("readings", x.readings.filter((_, j) => j !== k))} className="pb-3 text-xs text-white/45 hover:text-red-200">Remove</button></div>)}
            {x.readings.length < 12 && <button type="button" onClick={() => set("readings", [...x.readings, { date: today(), t: 0 }])} className="justify-self-start rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/75">+ Add reading</button>}</div></section>
        <section className="grid gap-4 md:grid-cols-4">{date(x.kind === "vessel" ? "Last internal / on-stream" : "Last thickness survey", x.lastInternal, (v) => set("lastInternal", v))}{date("Last external visual", x.lastExternal, (v) => set("lastExternal", v))}{date("Last CUI inspection", x.lastCui, (v) => set("lastCui", v))}{date("Last PRD test", x.lastPrd, (v) => set("lastPrd", v))}</section>
      </div>}
      {step === 4 && <div className="grid gap-5 md:grid-cols-2">
        <Field label="Fluid category (consequence)"><select value={x.fluid} onChange={(e) => set("fluid", e.target.value as PlanInput["fluid"])} className={inputCls}><option value="light-hc" className="bg-[#0b1220]">Flashing light hydrocarbon / LPG / auto-refrigerating</option><option value="toxic" className="bg-[#0b1220]">Toxic (high H₂S, HF, HCl, ammonia…)</option><option value="hc" className="bg-[#0b1220]">Hydrocarbon (liquid or gas, not flashing)</option><option value="h2" className="bg-[#0b1220]">Hydrogen / fuel gas</option><option value="utility" className="bg-[#0b1220]">Utility / non-flammable, non-toxic</option></select></Field>
        <Field label="Inventory that can be released"><select value={x.inventory} onChange={(e) => set("inventory", e.target.value as PlanInput["inventory"])} className={inputCls}><option value="small" className="bg-[#0b1220]">Small (quick isolation)</option><option value="medium" className="bg-[#0b1220]">Medium</option><option value="large" className="bg-[#0b1220]">Large (big inventory, slow isolation)</option></select></Field>
        <div className="grid gap-2">{check("Near people / control room / high-activity area", x.nearPeople, (b) => set("nearPeople", b))}{check("Protected by a pressure-relief device", x.prd, (b) => set("prd", b))}</div>
        {x.prd && <Field label="Relief device service"><select value={x.prdService} onChange={(e) => set("prdService", e.target.value as PlanInput["prdService"])} className={inputCls}><option value="clean" className="bg-[#0b1220]">Clean, non-corrosive</option><option value="typical" className="bg-[#0b1220]">Typical process</option><option value="fouling" className="bg-[#0b1220]">Fouling / corrosive / history of sticking</option></select></Field>}
        {x.kind === "piping" && <>
          <Field label="Piping class (API 570)" hint={`Suggested from fluid: Class ${suggestClass(x.fluid)}`}><select value={x.pipeClass} onChange={(e) => set("pipeClass", Number(e.target.value) as PlanInput["pipeClass"])} className={inputCls}><option value={0} className="bg-[#0b1220]">Use suggestion (Class {suggestClass(x.fluid)})</option>{[1, 2, 3, 4].map((c) => <option key={c} value={c} className="bg-[#0b1220]">Class {c}</option>)}</select></Field>
          <div className="grid gap-2">{check("Has injection or mix points", x.injection, (b) => set("injection", b))}{check("Has deadlegs", x.deadleg, (b) => set("deadleg", b))}{check("Has small-bore / threaded connections", x.sbp, (b) => set("sbp", b))}{check("Part of the line is buried", x.buried, (b) => set("buried", b))}</div>
          {x.buried && <><Field label="Soil resistivity (Ω·cm)" htmlFor="ip-soil"><Num id="ip-soil" value={x.soilRes} onChange={(v) => set("soilRes", Number(v) || 0)} /></Field><div>{check("Effective cathodic protection", x.cp, (b) => set("cp", b))}</div></>}
        </>}
      </div>}
      <div className="mt-6 flex justify-between"><button type="button" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 disabled:opacity-30">← Back</button><button type="button" onClick={() => go(step + 1)} className="rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">{step === 4 ? "Generate plan →" : "Next →"}</button></div>
    </div>}

    {step === 5 && <PlanDoc plan={plan} onEdit={() => go(0)} onReset={() => setX(DEFAULT)} />}
  </div>;
}

function PlanDoc({ plan: p, onEdit, onReset }: { plan: ReturnType<typeof buildPlan>; onEdit: () => void; onReset: () => void }) {
  const i = p.input; const isV = i.kind === "vessel"; const f2 = (n: number | null | undefined, d = 2) => (n === null || n === undefined || !Number.isFinite(n) ? "—" : n.toFixed(d));
  const riskTone = { Low: "bg-emerald-100 text-emerald-900", Medium: "bg-amber-100 text-amber-900", "Medium-high": "bg-orange-100 text-orange-900", High: "bg-red-100 text-red-900" }[p.risk];
  const H = ({ n, t }: { n: number; t: string }) => <h2 className="mt-7 border-b-2 border-slate-800 pb-1 text-base font-bold uppercase tracking-wide text-slate-900 print:break-after-avoid">{n}. {t}</h2>;
  const KV = ({ rows }: { rows: [string, string][] }) => <table className="mt-2 w-full text-sm"><tbody>{rows.map(([a, b]) => <tr key={a} className="border-b border-slate-200"><td className="w-1/3 py-1 pr-3 text-slate-500">{a}</td><td className="py-1 text-slate-900">{b}</td></tr>)}</tbody></table>;
  return <div className="mt-5">
    <div className="mb-4 flex flex-wrap gap-2 print:hidden"><button type="button" onClick={() => window.print()} className="rounded-full bg-amber-100 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white">Download PDF (Save as PDF)</button><button type="button" onClick={onEdit} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">Edit answers</button><button type="button" onClick={() => { const b = new Blob([JSON.stringify(i, null, 1)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${i.tag || "inspection-plan"}.json`; a.click(); }} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">Save answers (.json)</button><button type="button" onClick={onReset} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/50">Start over</button></div>
    <article className="rounded-2xl bg-white p-6 text-slate-900 shadow-2xl md:p-10 print:rounded-none print:p-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-slate-900 pb-3"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-slate-500">Inspection plan</p><h1 className="mt-1 text-2xl font-bold">{i.tag || "—"} · {i.desc || (isV ? "Pressure vessel" : "Piping circuit")}</h1><p className="text-sm text-slate-600">{i.site || "Plant / unit"} · {isV ? "API 510" : `API 570 · Class ${p.pipeClass}`} · {i.code}</p></div><div className="text-right text-xs text-slate-500"><p>Date: {i.date}</p><p>Prepared by: {i.preparedBy || "—"}</p><p>Generated with NumSum inspection plan generator</p></div></header>

      <H n={1} t="Equipment and design basis" />
      <KV rows={[["Type", isV ? "Pressure vessel (cylindrical shell)" : "Piping circuit"], ["Design pressure / temperature", `${i.P} bar g / ${i.Tdes} °C`], [isV ? "Inside diameter" : "Outside diameter", `${i.D} mm`], ["Nominal thickness / corrosion allowance", `${i.tNom} mm / ${i.CA} mm`], ["Material", `${matName(i.mat)} · S = ${i.S} MPa · E = ${i.E}`], ["Operating temperature range", `${i.tmin} to ${i.tmax} °C`], ["In service since", String(i.year)], ["Required thickness t_required", `${f2(p.tReq)} mm — ${p.tReqBasis}`]]} />

      <H n={2} t="Corrosion assessment" />
      {p.rl ? <KV rows={[["Long-term / short-term rate", `${f2(p.rl.crLong, 3)} / ${f2(p.rl.crShort, 3)} mm/y`], ["Governing corrosion rate", `${f2(p.rl.cr, 3)} mm/y (${p.rl.governs})`], ["Remaining life", `${f2(p.rl.rl, 1)} years`], ["Inspection interval", `${f2(p.intervalYears, 1)} years — ${isV ? "lesser of RL/2 and 10 y (RL < 4 y: up to 2 y), API 510 §6.5" : `lesser of RL/2 and ${p.pipeClass === 1 ? 5 : 10} y, API 570 Table 2`}`], ...(isV ? [["MAWP at next inspection", `${f2(p.mawpNext, 1)} bar g (design ${i.P} bar g) — thickness = t_latest − 2 × CR × interval, API 510 §7.3`] as [string, string]] : [])]} /> : <p className="mt-2 text-sm text-slate-700">No corrosion rate yet — take baseline readings at all CMLs.</p>}

      <H n={3} t="Damage mechanism review (API 571)" />
      <table className="mt-2 w-full text-sm"><thead><tr className="bg-slate-100 text-left text-xs uppercase text-slate-600"><th className="p-1.5">Mechanism</th><th className="p-1.5">Status</th><th className="p-1.5">Where</th><th className="p-1.5">How to find it</th></tr></thead>
        <tbody>{[...p.likely.map((d) => [d, "Likely"] as const), ...p.possible.map((d) => [d, "Possible"] as const)].map(([d, s]) => <tr key={d.id} className="border-b border-slate-200 align-top"><td className="p-1.5 font-medium">{d.n} <span className="text-xs text-slate-500">§{d.api}</span></td><td className={cn("p-1.5 text-xs font-semibold", s === "Likely" ? "text-red-700" : "text-amber-700")}>{s}</td><td className="p-1.5 text-xs">{d.who}</td><td className="p-1.5 text-xs">{d.find}</td></tr>)}
          {!p.likely.length && !p.possible.length && <tr><td colSpan={4} className="p-2 text-sm text-slate-600">No mechanism flagged from the answers given.</td></tr>}</tbody></table>
      {p.open > 0 && <p className="mt-1 text-xs text-slate-500">{p.open} further mechanisms remain open because some answers were “not sure”.</p>}

      <H n={4} t="Risk screening (API 580 principles)" />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm"><span className="rounded-lg border border-slate-300 px-3 py-1">Probability <b>{p.pof}</b></span><span className="rounded-lg border border-slate-300 px-3 py-1">Consequence <b>{p.cof}</b></span><span className={cn("rounded-lg px-3 py-1 font-semibold", riskTone)}>{p.risk} risk</span></div>
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{p.riskWhy.map((w) => <li key={w}>{w}</li>)}</ul>
      <p className="mt-1 text-xs text-slate-500">Qualitative screening only. A documented RBI to API 580/581 may set different intervals and scope.</p>
      {p.onStreamOk && <p className="mt-2 text-sm"><b>On-stream in lieu of internal (API 510 §6.5.2):</b> {p.onStreamOk.ok ? "conditions appear to be met — inspector's discretion." : `not permitted — ${p.onStreamOk.reasons.join("; ")}.`}</p>}

      <H n={5} t="Inspection tasks" />
      <table className="mt-2 w-full text-xs"><thead><tr className="bg-slate-100 text-left uppercase text-slate-600"><th className="p-1.5">#</th><th className="p-1.5">Task</th><th className="p-1.5">Method / technique</th><th className="p-1.5">Coverage / location</th><th className="p-1.5">Reference</th><th className="p-1.5">Interval</th><th className="p-1.5">Next due</th><th className="p-1.5">Acceptance</th></tr></thead>
        <tbody>{p.tasks.map((t, k) => <tr key={k} className="border-b border-slate-200 align-top print:break-inside-avoid"><td className="p-1.5">{k + 1}</td><td className="p-1.5 font-medium">{t.task}<span className="mt-0.5 block font-normal text-slate-500">{t.why}</span></td><td className="p-1.5">{t.method}</td><td className="p-1.5">{t.coverage}</td><td className="p-1.5 font-mono text-[10px]">{t.ref}</td><td className="p-1.5 whitespace-nowrap">{t.interval}</td><td className="p-1.5 whitespace-nowrap font-semibold">{t.due}</td><td className="p-1.5">{t.accept}</td></tr>)}</tbody></table>

      <H n={6} t="CML strategy" />
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{isV ? <><li>At least one CML per shell course and per head, each nozzle ≥ NPS 2, and at the liquid level, inlet impingement, low points and stagnant zones.</li><li>Add CMLs or use scanning/grids where corrosion is localised; fewer where it is uniform and slow.</li><li>Use the same technique, probe and exact location each time; record CML ID, method and temperature.</li></> : <><li>CMLs per circuit isometric: elbows (extrados), tees, reducers, downstream of control valves, injection points, deadleg low points, soil-to-air interface.</li><li>Class {p.pipeClass}: {p.pipeClass === 1 ? "more CMLs and NDE coverage" : "number of CMLs set by complexity and corrosion behaviour"}; profile RT for small-bore and insulated lines.</li><li>Track deadlegs and injection points as separate circuits.</li></>}</ul>

      <H n={7} t="Integrity operating windows to set or check" />
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{p.iows.length ? p.iows.map((w) => <li key={w}>{w}</li>) : <li>No mechanism-specific IOWs from the answers given.</li>}</ul>

      <H n={8} t="Evaluation, fitness-for-service and repair triggers" />
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{p.ffs.map((w) => <li key={w}>{w}</li>)}<li>Repairs and alterations: authorized by the inspector, welding to qualified procedures (ASME IX), materials to ASME II, NDE per ASME V; pressure test when required.</li></ul>

      <H n={9} t="Notes" />
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{p.notes.length ? p.notes.map((w) => <li key={w}>{w}</li>) : <li>None.</li>}<li>Review this plan after every inspection, process change, IOW exceedance or failure.</li></ul>

      <H n={10} t="Reference documents" />
      <p className="mt-2 text-sm text-slate-700">{p.docs.join(" · ")}</p>

      <div className="mt-10 grid grid-cols-3 gap-6 text-xs text-slate-600 print:break-inside-avoid">{["Prepared (inspector)", "Reviewed (engineer)", "Approved (owner/user)"].map((r) => <div key={r}><div className="h-12 border-b border-slate-400" /><p className="mt-1">{r} — name, signature, date</p></div>)}</div>
      <p className="mt-6 text-[10px] leading-4 text-slate-500">Draft generated from the answers given, using NumSum&apos;s summaries of API 510/570/571/574/576/579-1/580/581 and ASME V. It must be reviewed and approved by a qualified inspector/engineer against the current editions of the codes, the owner/user&apos;s procedures and jurisdictional requirements before use.</p>
    </article>
  </div>;
}

"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DM_GRP, DM_MAT, DM_Q, dmSlug, screenAll, type DmX } from "@/lib/eng/damage-mechanisms";
import { cn } from "@/lib/utils";
import { Field, Num, inputCls } from "./calc-kit";

const ACIDS: [string, string][] = [["none", "No acid"], ["HCl", "Hydrochloric (HCl)"], ["H2SO4", "Sulfuric (H₂SO₄)"], ["HF", "Hydrofluoric (HF)"], ["H3PO4", "Phosphoric (H₃PO₄)"]];

function YesNo({ k, x, set }: { k: string; x: DmX; set: (k: string, v: unknown) => void }) {
  const q = DM_Q[k];
  if (!q) return null;
  if (q.type === "acid") return <Field label={q.t}><select value={x.acid === null ? "none" : x.acid ?? ""} onChange={(e) => set("acid", e.target.value === "" ? undefined : e.target.value === "none" ? null : e.target.value)} className={inputCls}><option value="" className="bg-[#0b1220]">Not sure</option>{ACIDS.map(([v, l]) => <option key={v} value={v} className="bg-[#0b1220]">{l}</option>)}</select></Field>;
  if (q.type === "num") return <Field label={q.t} htmlFor={`dm-${k}`}><Num id={`dm-${k}`} value={x[k] ?? ""} onChange={(v) => set(k, v === "" ? undefined : v)} /></Field>;
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3"><span className="text-sm text-white/85">{q.t}</span><span className="flex gap-1">{[["Yes", true], ["No", false], ["Not sure", undefined]].map(([l, v]) => <button key={String(l)} type="button" aria-pressed={x[k] === v} onClick={() => set(k, v)} className={cn("rounded-full border px-3 py-1 text-xs", x[k] === v ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60 hover:text-white")}>{String(l)}</button>)}</span></div>;
}

export function DmScreen() {
  const [x, setX] = useState<DmX>({ mat: "CS", tmax: 120, tmin: 15 });
  const set = (k: string, v: unknown) => setX((o) => { const n = { ...o }; if (v === undefined) delete n[k]; else n[k] = v; return n; });
  const res = useMemo(() => screenAll(x), [x]);
  const nextQs = res.questions.filter((q) => !["mat", "tmax", "tmin"].includes(q.k)).slice(0, 6);
  const answered = Object.keys(x).filter((k) => !["mat", "tmax", "tmin"].includes(k) && DM_Q[k]);
  const card = (r: (typeof res.all)[number], tone: string) => <details key={r.d.id} className={cn("rounded-2xl border p-4", tone)}><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2"><span className="font-semibold text-white">{r.d.n}</span><span className="text-xs text-white/50">API 571 §{r.d.api} · {DM_GRP[r.d.g]}</span></summary>
    {r.why && <p className="mt-2 text-sm text-white/75"><strong className="text-white">Why flagged:</strong> {r.why}</p>}
    <p className="mt-2 text-sm text-white/70">{r.d.sw}</p>
    <p className="mt-2 text-sm text-white/60"><strong className="text-white/80">How to find it:</strong> {r.d.find}</p>
    <Link href={`/learn/damage-mechanisms/${dmSlug(r.d)}`} className="mt-2 inline-block text-sm text-amber-100 hover:text-white">Full explanation →</Link></details>;
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
    <div className="premium-card h-fit rounded-3xl border p-6">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">Step 1 — the basics</p>
      <div className="mt-3 grid gap-4">
        <Field label="Material"><select value={x.mat ?? ""} onChange={(e) => set("mat", e.target.value || undefined)} className={inputCls}>{Object.entries(DM_MAT).map(([k, v]) => <option key={k} value={k} className="bg-[#0b1220]">{v}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Highest operating temp." htmlFor="dm-tmax"><Num id="dm-tmax" value={x.tmax ?? ""} onChange={(v) => set("tmax", v === "" ? undefined : v)} suffix="°C" /></Field><Field label="Lowest metal temp." htmlFor="dm-tmin"><Num id="dm-tmin" value={x.tmin ?? ""} onChange={(v) => set("tmin", v === "" ? undefined : v)} suffix="°C" /></Field></div>
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">Step 2 — answer what matters</p>
      <p className="mt-1 text-xs text-white/50">Only questions that change a result are asked, most useful first.</p>
      <div className="mt-3 grid gap-2">{nextQs.length ? nextQs.map((q) => <YesNo key={q.k} k={q.k} x={x} set={set} />) : <p className="text-sm text-emerald-100">No more questions change the result.</p>}</div>
      {answered.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-sm text-white/60">Your answers ({answered.length})</summary><div className="mt-2 grid gap-2">{answered.map((k) => <YesNo key={k} k={k} x={x} set={set} />)}</div></details>}
      <button type="button" onClick={() => setX({ mat: "CS", tmax: 120, tmin: 15 })} className="mt-4 text-sm text-white/50 hover:text-white">Start again</button>
    </div>
    <div className="grid h-fit gap-4" aria-live="polite">
      <div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-2xl border border-red-300/30 bg-red-500/10 p-3"><p className="font-mono text-3xl text-red-100">{res.yes.length}</p><p className="text-xs text-white/60">Likely</p></div><div className="rounded-2xl border border-amber-200/30 bg-amber-200/10 p-3"><p className="font-mono text-3xl text-amber-100">{res.maybe.length}</p><p className="text-xs text-white/60">Possible</p></div><div className="rounded-2xl border border-white/10 p-3"><p className="font-mono text-3xl text-white">{res.open.length}</p><p className="text-xs text-white/60">Need answers</p></div></div>
      {res.yes.length > 0 && <section><h2 className="mb-2 font-semibold text-white">Likely — inspect for these</h2><div className="grid gap-2">{res.yes.map((r) => card(r, "border-red-300/25 bg-red-500/[0.05]"))}</div></section>}
      {res.maybe.length > 0 && <section><h2 className="mb-2 font-semibold text-white">Possible — check the conditions</h2><div className="grid gap-2">{res.maybe.map((r) => card(r, "border-amber-200/25 bg-amber-200/[0.04]"))}</div></section>}
      {!res.yes.length && !res.maybe.length && <p className="rounded-2xl border border-white/10 p-4 text-sm text-white/60">Nothing flagged yet — answer the questions on the left.</p>}
      <p className="text-xs text-white/45">Screening only: a “likely” result is a reason to look, not a finding. Based on the screening thresholds of API RP 571 (2020); the engineer decides.</p>
    </div>
  </div>;
}

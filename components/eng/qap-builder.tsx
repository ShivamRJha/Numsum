"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CURATED, curatedById, type QapLine } from "@/lib/asme/curated";
import { NDE_ACTIVITIES, ndeByKey } from "@/lib/asme/nde";
import { cn } from "@/lib/utils";
import { Field, inputCls } from "./calc-kit";
import { QAP_KEY } from "./spec-finder";

type Lvl = "H" | "W" | "R" | "P" | "-";
type Item = { uid: string; spec: string; desc: string; sups: string[]; off?: number[]; lv?: Record<number, Lvl> };
type Nde = { uid: string; key: string; item: string; extent: string; accept: string; lv: Lvl };
type Head = { project: string; client: string; equipment: string; qapNo: string; rev: string };
type State = { head: Head; items: Item[]; nde: Nde[] };
type Row = { item: string; activity: string; ref: string; freq: string; accept: string; record: string; mfr: Lvl; tpi: Lvl; client: Lvl };
const EMPTY: State = { head: { project: "", client: "", equipment: "", qapNo: "", rev: "0" }, items: [], nde: [] };
const uid = () => Math.random().toString(36).slice(2);
const toTpi = (l: string): Lvl => (l === "H" ? "H" : l === "W" ? "W" : "R");

function load(): State { try { const r = localStorage.getItem(QAP_KEY); if (!r) return EMPTY; const d = JSON.parse(r); return { head: { ...EMPTY.head, ...(d.head || {}) }, items: d.items || [], nde: d.nde || [] }; } catch { return EMPTY; } }

export function QapBuilder() {
  const [s, setS] = useState<State>(EMPTY); const [ready, setReady] = useState(false);
  const [pick, setPick] = useState("SA-516"); const [ndeKey, setNdeKey] = useState("rt");
  useEffect(() => { setS(load()); setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(QAP_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ } }, [s, ready]);
  const upd = (f: (x: State) => State) => setS((x) => f(x));

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    for (const it of s.items) {
      const c = curatedById(it.spec); if (!c) continue;
      const label = `${c.id}${it.desc ? ` — ${it.desc}` : ""}`;
      c.tests.forEach((t: QapLine, i) => { if (it.off?.includes(i)) return; const lv = it.lv?.[i] ?? toTpi(t[4]); out.push({ item: label, activity: t[0], ref: `${c.id} / ${t[2]}`, freq: t[1], accept: t[3], record: t[0].includes("MTR") ? "MTR / CMTR" : "Test report / MTR", mfr: "P", tpi: lv, client: lv === "H" ? "W" : "R" }); });
      for (const k of it.sups) { const o = c.options.find((x) => x[0] === k); if (o) out.push({ item: label, activity: `Supplementary ${o[0]} — ${o[1]}`, ref: `${c.id} ${o[0]} (ordered in PO)`, freq: "As per supplementary requirement", accept: "As per supplementary requirement / PO", record: "MTR / test report", mfr: "P", tpi: "W", client: "R" }); }
    }
    for (const n of s.nde) { const a = ndeByKey(n.key); if (!a) continue; out.push({ item: n.item || "—", activity: a.name, ref: a.ref, freq: n.extent || "—", accept: n.accept || a.acceptHint, record: a.record, mfr: "P", tpi: n.lv, client: n.lv === "H" ? "W" : "R" }); }
    return out;
  }, [s]);

  const csv = () => {
    const h = s.head; const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [[`Project: ${h.project}`, `Client: ${h.client}`, `Equipment: ${h.equipment}`, `QAP No: ${h.qapNo}`, `Rev: ${h.rev}`].map(esc).join(","), "", ["Sl", "Item", "Activity / test", "Reference", "Frequency / extent", "Acceptance", "Record", "Mfr", "TPI", "Client"].map(esc).join(",")];
    rows.forEach((r, i) => lines.push([String(i + 1), r.item, r.activity, r.ref, r.freq, r.accept, r.record, r.mfr, r.tpi, r.client].map(esc).join(",")));
    lines.push("", esc("Legend: P = perform, H = hold point (work stops until witnessed), W = witness (notified; may proceed if waived), R = review of records."));
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${(h.qapNo || "QAP").replace(/[^\w-]+/g, "_")}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const lvSel = (v: Lvl, on: (l: Lvl) => void, label: string) => <select aria-label={label} value={v} onChange={(e) => on(e.target.value as Lvl)} className="rounded-lg border border-white/12 bg-[#0b1220] px-1.5 py-1 text-xs text-white">{(["H", "W", "R", "-"] as Lvl[]).map((l) => <option key={l} value={l}>{l}</option>)}</select>;

  return <div className="grid gap-6">
    <section className="premium-card rounded-3xl border p-5 print:hidden">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">1 — Header</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-5">{(Object.keys(EMPTY.head) as (keyof Head)[]).map((k) => <Field key={k} label={{ project: "Project", client: "Client", equipment: "Equipment / tag", qapNo: "QAP no.", rev: "Rev." }[k]} htmlFor={`h-${k}`}><input id={`h-${k}`} value={s.head[k]} onChange={(e) => upd((x) => ({ ...x, head: { ...x.head, [k]: e.target.value } }))} className={inputCls} /></Field>)}</div>
    </section>

    <section className="premium-card rounded-3xl border p-5 print:hidden">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">2 — Materials</p>
      <div className="mt-3 flex flex-wrap items-end gap-3"><Field label="Specification"><select value={pick} onChange={(e) => setPick(e.target.value)} className={cn(inputCls, "min-w-[16rem]")}>{CURATED.map((c) => <option key={c.id} value={c.id} className="bg-[#0b1220]">{c.id} — {c.form} — {c.family}</option>)}</select></Field>
        <button type="button" onClick={() => upd((x) => ({ ...x, items: [...x.items, { uid: uid(), spec: pick, desc: "", sups: [] }] }))} className="rounded-full bg-amber-100 px-4 py-2.5 text-sm font-semibold text-black hover:bg-white">+ Add material</button>
        <Link href="/engineering/material-spec-finder" className="text-sm text-amber-100 hover:text-white">Find a spec →</Link></div>
      <div className="mt-4 grid gap-3">{s.items.map((it) => { const c = curatedById(it.spec); if (!c) return null; return <div key={it.uid} className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-3"><span className="font-mono text-amber-50">{c.id}</span><input aria-label="Grade, size, part" placeholder="Grade / size / part (e.g. Gr 70N, 25 mm shell plate)" value={it.desc} onChange={(e) => upd((x) => ({ ...x, items: x.items.map((y) => (y.uid === it.uid ? { ...y, desc: e.target.value } : y)) }))} className={cn(inputCls, "flex-1 py-1.5")} /><button type="button" onClick={() => upd((x) => ({ ...x, items: x.items.filter((y) => y.uid !== it.uid) }))} className="text-sm text-white/50 hover:text-red-200">Remove</button></div>
        <ul className="mt-3 grid gap-1">{c.tests.map((t, i) => { const off = it.off?.includes(i); return <li key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!off} onChange={() => upd((x) => ({ ...x, items: x.items.map((y) => (y.uid === it.uid ? { ...y, off: off ? (y.off || []).filter((z) => z !== i) : [...(y.off || []), i] } : y)) }))} aria-label={`Include ${t[0]}`} /><span className={cn("flex-1", off ? "text-white/35 line-through" : "text-white/80")}>{t[0]} <span className="text-white/40">— {t[1]}</span></span>{lvSel(it.lv?.[i] ?? toTpi(t[4]), (l) => upd((x) => ({ ...x, items: x.items.map((y) => (y.uid === it.uid ? { ...y, lv: { ...(y.lv || {}), [i]: l } } : y)) })), `TPI level for ${t[0]}`)}</li>; })}</ul>
        {c.options.length > 0 && <><p className="mt-3 text-xs text-white/45">Supplementary requirements you will order:</p><div className="mt-1.5 flex flex-wrap gap-1.5">{c.options.map(([k, t]) => { const on = it.sups.includes(k); return <button key={k} type="button" aria-pressed={on} onClick={() => upd((x) => ({ ...x, items: x.items.map((y) => (y.uid === it.uid ? { ...y, sups: on ? y.sups.filter((z) => z !== k) : [...y.sups, k] } : y)) }))} className={cn("rounded-full border px-2.5 py-1 text-xs", on ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60 hover:text-white")}>{k} {t}</button>; })}</div></>}
      </div>; })}{!s.items.length && <p className="text-sm text-white/50">No materials yet — add one above.</p>}</div>
    </section>

    <section className="premium-card rounded-3xl border p-5 print:hidden">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">3 — NDE, tests and inspections</p>
      <div className="mt-3 flex flex-wrap items-end gap-3"><Field label="Activity"><select value={ndeKey} onChange={(e) => setNdeKey(e.target.value)} className={cn(inputCls, "min-w-[16rem]")}>{NDE_ACTIVITIES.map((n) => <option key={n.key} value={n.key} className="bg-[#0b1220]">{n.name}</option>)}</select></Field>
        <button type="button" onClick={() => upd((x) => ({ ...x, nde: [...x.nde, { uid: uid(), key: ndeKey, item: "", extent: "", accept: "", lv: "W" }] }))} className="rounded-full bg-amber-100 px-4 py-2.5 text-sm font-semibold text-black hover:bg-white">+ Add activity</button></div>
      <div className="mt-4 grid gap-2">{s.nde.map((n) => { const a = ndeByKey(n.key)!; const set = (p: Partial<Nde>) => upd((x) => ({ ...x, nde: x.nde.map((y) => (y.uid === n.uid ? { ...y, ...p } : y)) })); return <div key={n.uid} className="grid gap-2 rounded-2xl border border-white/10 p-3 md:grid-cols-[12rem_1fr_1fr_1fr_auto_auto] md:items-center">
        <span className="text-sm text-white"><span className="block">{a.name}</span><span className="font-mono text-[11px] text-white/45">{a.ref}</span></span>
        <input aria-label="Item / joint" placeholder="Item / joints (e.g. Cat A & B seams)" value={n.item} onChange={(e) => set({ item: e.target.value })} className={cn(inputCls, "py-1.5 text-sm")} />
        <input aria-label="Extent" placeholder="Extent (e.g. 100%, 10% spot)" value={n.extent} onChange={(e) => set({ extent: e.target.value })} className={cn(inputCls, "py-1.5 text-sm")} />
        <input aria-label="Acceptance" placeholder={a.acceptHint} value={n.accept} onChange={(e) => set({ accept: e.target.value })} className={cn(inputCls, "py-1.5 text-sm")} />
        {lvSel(n.lv, (l) => set({ lv: l }), `TPI level for ${a.name}`)}
        <button type="button" onClick={() => upd((x) => ({ ...x, nde: x.nde.filter((y) => y.uid !== n.uid) }))} className="text-xs text-white/50 hover:text-red-200">Remove</button>
      </div>; })}{!s.nde.length && <p className="text-sm text-white/50">No activities yet. Typical vessel set: VT, RT or UT, MT/PT, PMI (alloys), PWHT chart review, hydro test, dimensional.</p>}</div>
    </section>

    <section className="rounded-3xl border border-white/10 bg-[#0b1220] p-5 print:border-0 print:bg-white print:p-0 print:text-black">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80 print:text-black">Quality assurance plan</p><h2 className="mt-1 font-display text-xl font-semibold text-white print:text-black">{s.head.project || "Project"} · {s.head.equipment || "Equipment"}</h2><p className="text-sm text-white/55 print:text-black">Client: {s.head.client || "—"} · QAP no. {s.head.qapNo || "—"} · Rev {s.head.rev || "0"}</p></div>
        <div className="flex gap-2 print:hidden"><button type="button" onClick={csv} disabled={!rows.length} className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">Download CSV (Excel)</button><button type="button" onClick={() => window.print()} disabled={!rows.length} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 disabled:opacity-40">Print / PDF</button><button type="button" onClick={() => setS(EMPTY)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/50 hover:text-red-200">Clear</button></div></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[56rem] text-left text-xs print:min-w-0"><thead className="uppercase tracking-[.08em] text-white/45 print:text-black"><tr>{["Sl", "Item", "Activity / test", "Reference", "Frequency / extent", "Acceptance", "Record", "Mfr", "TPI", "Client"].map((h) => <th key={h} className="border-b border-white/15 px-2 py-2 print:border-black">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="align-top text-white/80 print:text-black">{[String(i + 1), r.item, r.activity, r.ref, r.freq, r.accept, r.record, r.mfr, r.tpi, r.client].map((v, k) => <td key={k} className={cn("border-b border-white/10 px-2 py-1.5 print:border-gray-400", k >= 7 && "text-center font-mono")}>{v}</td>)}</tr>)}</tbody></table>
        {!rows.length && <p className="py-6 text-center text-sm text-white/45">Add materials and activities above — the plan builds itself here.</p>}</div>
      <p className="mt-3 text-xs text-white/45 print:text-black">P = perform · H = hold point (work stops until witnessed) · W = witness (notified; may proceed if waived) · R = review of records. Lines come from NumSum's notes on ASME Section II/V and must be checked against the specification edition, the purchase order and the construction code before issue.</p>
    </section>
  </div>;
}

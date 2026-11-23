"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import INDEX from "@/lib/asme/spec-index.json";
import { CURATED, curatedById } from "@/lib/asme/curated";
import { cn } from "@/lib/utils";
import { inputCls } from "./calc-kit";

type Spec = { id: string; full: string; part: string; title: string; form: string; family: string; basis: string; note: string; gen: string[]; tests: string[]; sups: [string, string][] };
const ALL = INDEX as Spec[];
const PARTS: [string, string][] = [["", "All parts"], ["A", "Part A — ferrous"], ["B", "Part B — non-ferrous"], ["C", "Part C — consumables"]];
const count = <K extends string>(list: Spec[], key: (s: Spec) => K) => { const m = new Map<K, number>(); for (const s of list) m.set(key(s), (m.get(key(s)) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
const LEVEL: Record<string, string> = { H: "Hold / witness", W: "Witness", R: "Review" };
export const QAP_KEY = "ns-qap-v1";

function addToQap(id: string) {
  try {
    const raw = localStorage.getItem(QAP_KEY); const d = raw ? JSON.parse(raw) : { items: [], nde: [] };
    d.items = [...(d.items || []), { uid: Math.random().toString(36).slice(2), spec: id, desc: "", sups: [] }];
    localStorage.setItem(QAP_KEY, JSON.stringify(d)); return true;
  } catch { return false; }
}

export function SpecFinder() {
  const [q, setQ] = useState(""); const [part, setPart] = useState(""); const [form, setForm] = useState(""); const [family, setFamily] = useState(""); const [onlyCurated, setOnlyCurated] = useState(false);
  const [sel, setSel] = useState<string>("SA-516"); const [added, setAdded] = useState("");
  useEffect(() => {
    const read = () => { try { const h = decodeURIComponent(window.location.hash.slice(1)); if (h && ALL.some((s) => s.id === h)) setSel(h); } catch { /* ignore */ } };
    read(); window.addEventListener("hashchange", read); return () => window.removeEventListener("hashchange", read);
  }, []);
  const base = useMemo(() => ALL.filter((s) => (!part || s.part === part) && (!onlyCurated || curatedById(s.id))), [part, onlyCurated]);
  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return base.filter((s) => (!form || s.form === form) && (!family || s.family === family) && words.every((w) => `${s.id} ${s.full} ${s.title} ${s.basis} ${curatedById(s.id)?.grades || ""}`.toLowerCase().replace(/-/g, " ").includes(w.replace(/-/g, " "))));
  }, [base, q, form, family]);
  const spec = ALL.find((s) => s.id === sel); const cur = spec ? curatedById(spec.id) : undefined;
  const pick = (id: string) => { setSel(id); setAdded(""); try { history.replaceState(null, "", `#${encodeURIComponent(id)}`); } catch { /* ignore */ } document.getElementById("spec-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const chip = (on: boolean) => cn("rounded-full border px-3 py-1 text-xs", on ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60 hover:text-white");
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
    <div className="premium-card h-fit rounded-3xl border p-5">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: SA-516, 316L pipe, P91, Inconel, E7018…" aria-label="Search specifications" className={inputCls} />
      <div className="mt-3 flex flex-wrap gap-1.5">{PARTS.map(([v, l]) => <button key={v} type="button" onClick={() => { setPart(v); setForm(""); setFamily(""); }} className={chip(part === v)}>{l}</button>)}<button type="button" onClick={() => setOnlyCurated((x) => !x)} className={chip(onlyCurated)}>★ With QAP notes ({CURATED.length})</button></div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[.14em] text-white/45">Product form</p>
      <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => setForm("")} className={chip(!form)}>All</button>{count(base, (s) => s.form).map(([f, n]) => <button key={f} type="button" onClick={() => setForm(f === form ? "" : f)} className={chip(form === f)}>{f} <span className="text-white/35">{n}</span></button>)}</div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[.14em] text-white/45">Material family</p>
      <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => setFamily("")} className={chip(!family)}>All</button>{count(base, (s) => s.family).map(([f, n]) => <button key={f} type="button" onClick={() => setFamily(f === family ? "" : f)} className={chip(family === f)}>{f} <span className="text-white/35">{n}</span></button>)}</div>
      <p className="mt-4 text-sm text-white/50">{list.length} of {ALL.length} specifications</p>
      <ul className="mt-2 grid max-h-[32rem] gap-1.5 overflow-y-auto pr-1">{list.map((s) => <li key={s.id}><button type="button" onClick={() => pick(s.id)} className={cn("w-full rounded-xl border px-3 py-2 text-left", sel === s.id ? "border-amber-100/60 bg-amber-100/10" : "border-white/10 hover:border-white/25")}><span className="font-mono text-sm text-amber-50">{s.full}{curatedById(s.id) ? " ★" : ""}</span><span className="block text-sm text-white/70">{s.title}</span></button></li>)}</ul>
    </div>

    <div id="spec-detail" className="scroll-mt-24">{spec ? <div className="premium-card rounded-3xl border p-6">
      <p className="font-mono text-xs text-amber-100/80">ASME II PART {spec.part} · {spec.form} · {spec.family}</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-white">{spec.full}</h2>
      <p className="mt-1 text-white/75">{spec.title}</p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {spec.basis && <div className="rounded-xl border border-white/10 p-3"><dt className="text-white/45">Based on</dt><dd className="text-white/85">{spec.basis}</dd></div>}
        <div className="rounded-xl border border-white/10 p-3"><dt className="text-white/45">General requirements</dt><dd className="text-white/85">{cur?.general || spec.gen.join(", ") || "In the specification itself"}</dd></div>
        {spec.note && <div className="rounded-xl border border-amber-100/20 bg-amber-100/[0.04] p-3 sm:col-span-2"><dt className="text-amber-100/70">ASME differs from the base document</dt><dd className="text-white/80">…except {spec.note}</dd></div>}
      </dl>
      {cur && <>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">★ QAP notes</p>
        <p className="mt-2 text-sm text-white/80"><strong className="text-white">Grades:</strong> {cur.grades}</p>
        <p className="mt-2 text-sm text-white/80"><strong className="text-white">Condition / heat treatment:</strong> {cur.condition}</p>
        <p className="mt-2 text-sm text-white/80"><strong className="text-white">Key properties:</strong> {cur.props}</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm"><thead className="text-xs uppercase tracking-[.1em] text-white/45"><tr><th className="py-2 pr-3">Test / check</th><th className="py-2 pr-3">Frequency</th><th className="py-2 pr-3">Reference</th><th className="py-2 pr-3">Acceptance</th><th className="py-2">Typical</th></tr></thead>
          <tbody>{cur.tests.map((t, i) => <tr key={i} className="border-t border-white/10 align-top"><td className="py-2 pr-3 text-white">{t[0]}</td><td className="py-2 pr-3 text-white/70">{t[1]}</td><td className="py-2 pr-3 font-mono text-xs text-white/60">{t[2]}</td><td className="py-2 pr-3 text-white/70">{t[3]}</td><td className="py-2 text-xs text-amber-100/80" title={LEVEL[t[4]]}>{t[4]}</td></tr>)}</tbody></table></div>
        {cur.tips.length > 0 && <ul className="mt-4 grid gap-1.5">{cur.tips.map((t) => <li key={t} className="flex gap-2 text-sm text-white/75"><span className="text-emerald-200">→</span>{t}</li>)}</ul>}
      </>}
      {spec.tests.length > 0 && <><p className="mt-6 text-xs font-semibold uppercase tracking-[.14em] text-white/45">Test & requirement clauses in this spec</p><div className="mt-2 flex flex-wrap gap-1.5">{spec.tests.map((t) => <span key={t} className="rounded-full border border-white/12 px-2.5 py-1 text-xs text-white/70">{t}</span>)}</div></>}
      {spec.sups.length > 0 && <><p className="mt-6 text-xs font-semibold uppercase tracking-[.14em] text-white/45">Supplementary requirements (apply only when ordered)</p><ul className="mt-2 grid gap-1 sm:grid-cols-2">{spec.sups.map(([k, t]) => <li key={k} className="text-sm text-white/75"><span className="mr-2 font-mono text-amber-100/80">{k}</span>{t}</li>)}</ul></>}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {cur && <button type="button" onClick={() => setAdded(addToQap(spec.id) ? "Added to your QAP." : "Could not save in this browser.")} className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-black hover:bg-white">+ Add to QAP</button>}
        <Link href="/engineering/qap-builder" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">Open QAP builder →</Link>
        {added && <span className="text-sm text-emerald-200">{added}</span>}
      </div>
      <p className="mt-5 text-xs text-white/45">Index built from the 2021 edition of ASME Section II. Clause lists are a navigation aid; the specification (and the edition named in your order) governs.</p>
    </div> : <p className="text-white/55">Pick a specification.</p>}</div>
  </div>;
}

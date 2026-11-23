"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchItems, type SearchItem } from "@/lib/learn/search";
import { cn } from "@/lib/utils";

let cache: Promise<SearchItem[]> | null = null;
const load = () => (cache ??= fetch("/learn/search-index.json").then((r) => r.json()).catch(() => { cache = null; return []; }));

const KIND_TONE: Record<SearchItem["k"], string> = { Module: "text-amber-100", Chapter: "text-sky-200", Topic: "text-violet-200", "Damage mechanism": "text-red-200", Guide: "text-emerald-200", Term: "text-white/60", Tool: "text-amber-100" };

export function SearchBox({ initial = "", big = false, autoFocus = false, placeholder = "Search codes, clauses, damage mechanisms… e.g. “510 corrosion rate”, “CUI”, “RSF”" }: { initial?: string; big?: boolean; autoFocus?: boolean; placeholder?: string }) {
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [kind, setKind] = useState<SearchItem["k"] | "All">("All");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (initial || autoFocus) load().then(setItems); }, [initial, autoFocus]);
  const results = useMemo(() => (items ? searchItems(items, q, 60) : []), [items, q]);
  const kinds = useMemo(() => [...new Set(results.map((r) => r.k))], [results]);
  const shown = kind === "All" ? results : results.filter((r) => r.k === kind);
  const onChange = (v: string) => {
    setQ(v); if (!items) load().then(setItems);
    try { const u = new URL(window.location.href); if (u.pathname === "/learn/search") { if (v) u.searchParams.set("q", v); else u.searchParams.delete("q"); window.history.replaceState(null, "", u); } } catch { /* ignore */ }
  };
  return <div className="w-full">
    <div className="relative">
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={ref} type="search" value={q} autoFocus={autoFocus} onFocus={() => { if (!items) load().then(setItems); }} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Search the Learn library"
        className={cn("w-full rounded-2xl border border-white/15 bg-[#0b1220] pl-12 pr-4 text-white placeholder:text-white/35 focus:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/20", big ? "py-4 text-lg" : "py-3")} />
    </div>
    {q.trim() && <div className="mt-3" aria-live="polite">
      {!items ? <p className="text-sm text-white/50">Loading…</p> : !results.length ? <p className="text-sm text-white/55">Nothing found for “{q}”. Try a code number (510, 579), a clause (7.1), or a term (CUI, RSF, MAWP).</p> : <>
        <div className="mb-2 flex flex-wrap gap-1.5">{(["All", ...kinds] as const).map((k) => <button key={k} type="button" onClick={() => setKind(k)} className={cn("rounded-full border px-3 py-1 text-xs", kind === k ? "border-amber-100/60 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60 hover:text-white")}>{k}{k === "All" ? ` (${results.length})` : ` (${results.filter((r) => r.k === k).length})`}</button>)}</div>
        <ul className="grid gap-2">{shown.slice(0, big ? 60 : 8).map((r) => <li key={r.h + r.t}><Link href={r.h} className="block rounded-2xl border border-white/10 bg-[#0b1220] p-3 hover:border-amber-100/40"><span className={cn("text-[11px] font-semibold uppercase tracking-[.14em]", KIND_TONE[r.k])}>{r.k}</span><span className="mt-0.5 block font-medium text-white">{r.t}</span><span className="mt-0.5 line-clamp-2 block text-sm text-white/55">{r.s}</span></Link></li>)}</ul>
        {!big && results.length > 8 && <Link href={`/learn/search?q=${encodeURIComponent(q)}`} className="mt-2 inline-block text-sm text-amber-100 hover:text-white">See all {results.length} results →</Link>}
      </>}
    </div>}
  </div>;
}

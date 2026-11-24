"use client";
import { useEffect, useMemo, useState } from "react";
import type { ClauseRow } from "@/lib/learn/clauses/types";

type Row = { id: string; title: string; text: string; lesson?: string; depth: number; top: string };

function norm(s: string) { return s.toLowerCase(); }
function mark(text: string, q: string) {
  if (!q) return text;
  const i = norm(text).indexOf(norm(q)); if (i < 0) return text;
  return <>{text.slice(0, i)}<mark className="rounded bg-amber-300/30 px-0.5 text-inherit">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}
const anchor = (id: string) => `c-${id}`;

export function ClauseGuide({ slug, rows, lessons }: { slug: string; rows: ClauseRow[]; lessons: Record<string, string> }) {
  const all: Row[] = useMemo(() => rows.map(([id, title, text]) => ({ id, title, text, lesson: lessons[id], depth: id.split(".").length, top: id.split(".")[0] })), [rows, lessons]);
  const tops = useMemo(() => all.filter((r) => r.depth === 1), [all]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("c-")) { setOpen(h.slice(2)); const go = () => document.getElementById(h)?.scrollIntoView({ block: "start" }); requestAnimationFrame(go); const t1 = setTimeout(go, 350); const t2 = setTimeout(go, 1000); return () => { clearTimeout(t1); clearTimeout(t2); }; }
  }, []);

  const query = q.trim();
  useEffect(() => {
    const el = document.getElementById("clause-list"); if (!el) return;
    if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [query]);
  const shown = useMemo(() => {
    if (!query) return all;
    const n = norm(query);
    const hits = new Set(all.filter((r) => r.text && (norm(r.id).startsWith(n) || norm(r.title).includes(n) || norm(r.text).includes(n))).map((r) => r.id));
    // keep the parent headings of every hit so the result still reads in context
    const keep = new Set<string>();
    for (const id of hits) { const p = id.split("."); for (let i = 1; i <= p.length; i++) keep.add(p.slice(0, i).join(".")); }
    return all.filter((r) => keep.has(r.id));
  }, [all, query]);
  const hitCount = query ? shown.filter((r) => r.text).length : all.filter((r) => r.text).length;

  return <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
    <nav aria-label="Sections" className="hidden lg:block"><div className="sticky top-24 max-h-[75vh] overflow-y-auto pr-2 text-sm">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[.18em] text-white/40">Sections</p>
      {tops.map((t) => <a key={t.id} href={`#${anchor(t.id)}`} className="block truncate rounded-lg px-2 py-1.5 text-white/60 hover:bg-white/5 hover:text-white"><span className="mr-2 font-mono text-amber-100/70">{t.id}</span>{t.title.replace(/^Annex [A-Z]: /, "")}</a>)}
    </div></nav>
    <div className="min-w-0 scroll-mt-24" id="clause-list">
      <div className="sticky top-16 z-10 -mx-1 rounded-2xl border border-white/10 bg-[#0b1220] p-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clauses: number, word or phrase (e.g. 6.5.2, pitting, 50 ppm)" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/35" aria-label="Search clauses" />
          <span className="font-mono text-xs text-white/50">{hitCount} clause{hitCount === 1 ? "" : "s"}</span>
          <select aria-label="Jump to section" className="rounded-xl border border-white/10 bg-black/30 px-2 py-2.5 text-sm text-white lg:hidden" value="" onChange={(e) => { if (e.target.value) document.getElementById(anchor(e.target.value))?.scrollIntoView(); }}>
            <option value="">Jump to…</option>{tops.map((t) => <option key={t.id} value={t.id}>{t.id} {t.title}</option>)}
          </select>
        </div>
      </div>
      {query && hitCount === 0 && <p className="mt-6 text-white/60">No clause mentions “{query}”. Try a shorter word or a clause number.</p>}
      <ol className="mt-4 space-y-2">
        {shown.map((r) => {
          if (!r.text) {
            const cls = r.depth === 1 ? "mt-10 font-display text-2xl font-bold text-white" : r.depth === 2 ? "mt-6 font-display text-lg font-semibold text-white/90" : "mt-4 text-sm font-semibold text-white/75";
            return <li key={r.id} id={anchor(r.id)} className={`scroll-mt-40 ${cls}`}><span className="mr-2 font-mono text-amber-100/80">{r.id}</span>{r.title}</li>;
          }
          const isOpen = open === r.id;
          return <li key={r.id} id={anchor(r.id)} className={`scroll-mt-40 rounded-2xl border p-4 transition ${isOpen ? "border-amber-200/40 bg-amber-200/[.06]" : "border-white/10 bg-white/[.03]"} ${r.depth === 1 ? "mt-8" : ""}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="min-w-0 font-semibold text-white"><span className="mr-2 font-mono text-sm text-amber-100/80">{r.id}</span>{mark(r.title, query)}</h3>
              <div className="flex gap-3 text-xs">
                {r.lesson && <a href={`/learn/codes/${slug}/train#${r.lesson}`} className="text-blue-200 hover:text-white">Lesson →</a>}
                <a href={`#${anchor(r.id)}`} onClick={() => setOpen(r.id)} className="text-white/40 hover:text-white" aria-label={`Link to clause ${r.id}`}>#</a>
              </div>
            </div>
            <p className="mt-2 leading-relaxed text-white/75">{mark(r.text, query)}</p>
          </li>;
        })}
      </ol>
    </div>
  </div>;
}

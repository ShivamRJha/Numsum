"use client";
import { useEffect, useMemo, useState } from "react";
import { pathBySlug } from "@/lib/research/paths";
import { newId } from "@/lib/research/templates";
import type { RadarItem } from "@/lib/research/types";
import { useResearchProfile } from "./use-profile";

type Topic = { topic: string; items: RadarItem[] };

export function RadarClient() {
  const { p, ready, update } = useResearchProfile();
  const [urlTopics, setUrlTopics] = useState<string[] | null>(null);
  const [draft, setDraft] = useState("");
  const [data, setData] = useState<Topic[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [onlyNew, setOnlyNew] = useState<"all" | "arXiv" | "Journal">("all");
  useEffect(() => { const t = new URLSearchParams(location.search).get("topics"); setUrlTopics(t ? t.split("|").filter(Boolean) : []); }, []);
  const topics = useMemo(() => {
    if (urlTopics?.length) return urlTopics;
    if (p?.interests?.length) return p.interests;
    return (pathBySlug(p?.path || "mechanical")?.radarTopics || []).slice(0, 4);
  }, [urlTopics, p]);
  const key = topics.join("|");
  useEffect(() => {
    if (!ready || urlTopics === null || !key) return;
    let live = true; setLoading(true);
    fetch(`/api/research/radar?topics=${encodeURIComponent(key)}`).then((r) => r.json()).then((j) => { if (live) setData(j.topics || []); }).catch(() => { if (live) setData([]); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [key, ready, urlTopics]);

  const saveTopics = (next: string[]) => { setUrlTopics([]); update((x) => ({ ...x, interests: next })); };
  const add = () => { const t = draft.trim().toLowerCase(); if (!t || topics.includes(t)) return; saveTopics([...topics, t].slice(0, 8)); setDraft(""); };
  const reading = new Set((p?.reading || []).map((r) => r.title.toLowerCase()));
  const toReading = (it: RadarItem) => update((x) => ({ ...x, reading: [{ id: newId(), title: it.title, by: `${it.authors.slice(0, 3).join(", ")}${it.authors.length > 3 ? " et al." : ""} — ${it.venue || it.source} (${it.date.slice(0, 4)})`, status: "to_read", addedAt: new Date().toISOString().slice(0, 10), note: it.url }, ...x.reading] }));

  return <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
    <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
      <div className="rounded-3xl border border-white/10 p-5">
        <p className="font-semibold text-white">Your research direction</p>
        <p className="mt-1 text-xs text-white/50">Up to 8 keywords. Saved to your private profile; daily alerts use the same list.</p>
        <ul className="mt-3 flex flex-wrap gap-2">{topics.map((t) => <li key={t} className="flex items-center gap-1 rounded-full bg-violet-200/15 py-1 pl-3 pr-1.5 text-xs text-violet-50">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => saveTopics(topics.filter((x) => x !== t))} className="rounded-full px-1.5 text-violet-100/70 hover:bg-white/10 hover:text-white">×</button></li>)}</ul>
        <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mt-3 flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. neural operator" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35" /><button className="rounded-xl bg-violet-200 px-3 text-sm font-semibold text-black">Add</button></form>
        <label className="mt-4 flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={p?.alerts ?? true} onChange={(e) => update((x) => ({ ...x, alerts: e.target.checked }))} /> Daily alerts for standout papers</label>
      </div>
      <div className="rounded-3xl border border-white/10 p-5 text-sm text-white/60"><p className="font-semibold text-white">Where this comes from</p><p className="mt-1"><b className="text-white/80">Preprints</b>: the newest arXiv papers mentioning your keyword. <b className="text-white/80">Journals</b>: the most-cited articles of the last four months (OpenAlex). Refreshed every few hours.</p></div>
    </aside>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">{(["all", "Journal", "arXiv"] as const).map((k) => <button key={k} type="button" onClick={() => setOnlyNew(k)} aria-pressed={onlyNew === k} className={`rounded-full px-3.5 py-1.5 text-sm ${onlyNew === k ? "bg-white text-black" : "border border-white/15 text-white/70"}`}>{k === "all" ? "Everything" : k === "arXiv" ? "Newest preprints" : "Notable journal papers"}</button>)}{loading && <span className="text-sm text-white/45">Loading the latest papers…</span>}</div>
      {data && !data.length && !loading && <p className="mt-6 text-white/60">No results right now — try a broader keyword.</p>}
      {data?.map((t) => { const items = t.items.filter((i) => onlyNew === "all" || i.source === onlyNew); return <section key={t.topic} className="mt-8"><h2 className="font-display text-xl font-semibold text-white">{t.topic} <span className="font-mono text-sm text-white/40">{items.length}</span></h2>
        <ul className="mt-3 grid gap-2">{items.map((it) => <li key={it.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2 py-0.5 font-semibold ${it.source === "arXiv" ? "bg-sky-300/15 text-sky-100" : "bg-amber-200/15 text-amber-100"}`}>{it.source === "arXiv" ? "Preprint" : "Journal"}</span><span className="text-white/50">{it.venue}</span><span className="text-white/40">{it.date}</span>{typeof it.citations === "number" && it.citations > 0 && <span className="text-emerald-100/80">{it.citations} citations</span>}</div>
          <a href={it.url} target="_blank" rel="noreferrer" className="mt-1.5 block font-semibold leading-snug text-white hover:text-violet-100">{it.title} ↗</a>
          <p className="mt-1 text-sm text-white/55">{it.authors.slice(0, 5).join(", ")}{it.authors.length > 5 ? " et al." : ""}</p>
          {it.summary && <p className="mt-2 line-clamp-3 text-sm text-white/60">{it.summary}</p>}
          <div className="mt-2">{reading.has(it.title.toLowerCase()) ? <span className="text-xs text-emerald-100">✓ In your reading list</span> : <button type="button" onClick={() => toReading(it)} className="text-xs font-semibold text-violet-100 hover:text-white">+ Add to my reading list</button>}</div>
        </li>)}</ul></section>; })}
    </div>
  </div>;
}

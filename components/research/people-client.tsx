"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LEVELS } from "@/lib/research/paths";
import { listResearchers } from "@/lib/research/store";
import type { ResearcherCard } from "@/lib/research/types";

export function PeopleClient() {
  const [list, setList] = useState<ResearcherCard[] | null>(null); const [q, setQ] = useState("");
  useEffect(() => { listResearchers().then(setList).catch(() => setList([])); }, []);
  const lvl = Object.fromEntries(LEVELS.map((l) => [l.key, l.label]));
  const shown = (list || []).filter((c) => !q || `${c.name} ${c.headline} ${c.field} ${c.interests.join(" ")} ${c.lookingFor.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return <div>
    <div className="flex flex-wrap items-center gap-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, field, keyword or what they are looking for" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35" /><Link href="/research/me" className="text-sm font-semibold text-violet-100 hover:text-white">Add or edit your card →</Link></div>
    {list === null ? <p className="mt-6 text-white/50">Loading…</p> : !shown.length ? <p className="mt-6 text-white/60">No researchers listed yet. Publish your card from your dashboard to be the first.</p> :
      <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{shown.map((c) => <li key={c.uid} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-semibold text-white">{c.name}</p>{c.headline && <p className="mt-0.5 text-sm text-white/65">{c.headline}</p>}
        <p className="mt-1 text-xs text-white/45">{[c.field, c.level ? lvl[c.level] : ""].filter(Boolean).join(" · ")}</p>
        {c.interests.length > 0 && <p className="mt-3 flex flex-wrap gap-1.5">{c.interests.slice(0, 6).map((i) => <span key={i} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/70">{i}</span>)}</p>}
        {c.lookingFor.length > 0 && <p className="mt-3 text-xs text-violet-100/90">Looking for: {c.lookingFor.join(", ")}</p>}
        {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-violet-100 hover:text-white">Profile ↗</a>}
      </li>)}</ul>}
  </div>;
}

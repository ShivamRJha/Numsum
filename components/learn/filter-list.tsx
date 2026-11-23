"use client";
import Link from "next/link";
import { useState } from "react";
type Item = { href: string; title: string; text: string; group: string; tag?: string };
export function FilterList({ items, groups, placeholder }: { items: Item[]; groups: [string, string][]; placeholder: string }) {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const hit = (i: Item) => !s || `${i.title} ${i.text} ${i.tag || ""}`.toLowerCase().includes(s);
  return <div>
    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/35 focus:border-amber-100/60 focus:outline-none md:max-w-md" />
    {groups.map(([g, label]) => { const list = items.filter((i) => i.group === g && hit(i)); return list.length ? <section key={g} className="mt-8"><h2 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">{label} <span className="text-white/30">({list.length})</span></h2><div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{list.map((i) => <Link key={i.href} href={i.href} className="premium-card rounded-2xl border p-4 hover:border-amber-100/40"><p className="font-semibold text-white">{i.title}</p>{i.tag && <p className="mt-0.5 font-mono text-xs text-white/40">{i.tag}</p>}<p className="mt-2 line-clamp-3 text-sm text-white/60">{i.text}</p></Link>)}</div></section> : null; })}
    {s && !items.some(hit) && <p className="mt-8 text-white/55">Nothing matches “{q}”.</p>}
  </div>;
}

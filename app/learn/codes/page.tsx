import type { Metadata } from "next";
import Link from "next/link";
import { CODES, TOPICS, TOPIC_GROUPS, chaptersForTopic } from "@/lib/learn/codes";
import { Crumbs } from "@/components/learn/crumbs";
import { CodeFlow } from "@/components/learn/code-flow";
import { SearchBox } from "@/components/learn/search-box";
import { CodesNote } from "@/components/learn/codes-note";
import { JsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
const title = "API Inspection Codes Academy — Learn API 510, 570, 571, 574, 579-1, 580 & 581 Free";
const description = "Free study modules on the API inspection and integrity codes: pressure vessel and piping inspection, damage mechanisms, RBI, and fitness-for-service — with clause references, worked examples, self-checks and search.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn/codes" }, openGraph: { title, description, url: "/learn/codes" } };

export default function CodesHub() {
  const chapterCount = CODES.reduce((n, c) => n + c.chapters.length, 0);
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "API inspection codes study modules", itemListElement: CODES.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl}/learn/codes/${c.slug}`, name: c.title })) }} />
    <Crumbs items={[["API codes academy", "/learn/codes"]]} />
    <header className="mt-4 max-w-3xl"><h1 className="font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">API inspection codes academy</h1><p className="mt-4 text-lg leading-8 text-white/70">Seven study modules, {chapterCount} chapters, one connected picture. Learn what each code says, why, and how they work together — with clause references, worked examples and a quick self-check at the end of each module.</p></header>
    <div className="mt-8 max-w-3xl"><SearchBox /></div>

    <section className="mt-12"><h2 className="font-display text-2xl font-semibold text-white">How the codes fit together</h2><p className="mt-2 text-white/60">Follow one piece of equipment through its integrity cycle. Click a code to open its module.</p><div className="mt-5"><CodeFlow /></div></section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">Learning path</h2><p className="mt-2 text-white/60">New to the subject? Go in this order. Already working? Jump to the code you need.</p>
      <ol className="mt-5 grid gap-3 md:grid-cols-2">{CODES.map((c) => <li key={c.slug}><Link href={`/learn/codes/${c.slug}`} className="premium-card group flex h-full gap-4 rounded-3xl border p-5 hover:border-amber-100/40"><span className="font-mono text-3xl text-amber-100/70">{c.order}</span><span><span className="block font-mono text-xs text-white/45">{c.code} · {c.edition}</span><span className="mt-1 block text-lg font-semibold text-white group-hover:text-amber-50">{c.title.split(" — ")[1]}</span><span className="mt-1 block text-sm text-white/60">{c.covers}</span><span className="mt-2 block text-xs text-white/40">{c.chapters.length} chapters · worked example · self-check</span></span></Link></li>)}</ol></section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">Learn by topic</h2><p className="mt-2 text-white/60">Each topic page puts what every code says about it side by side.</p>
      <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{TOPIC_GROUPS.map((g) => <div key={g}><h3 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">{g}</h3><ul className="mt-2 grid gap-1.5">{TOPICS.filter((t) => t.group === g).map((t) => <li key={t.slug}><Link href={`/learn/codes/topics/${t.slug}`} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:border-amber-100/40 hover:text-white"><span>{t.name}</span><span className="font-mono text-xs text-white/35">{chaptersForTopic(t.key).length}</span></Link></li>)}</ul></div>)}</div></section>

    <div className="mt-12 grid gap-4 md:grid-cols-2"><Link href="/learn/damage-mechanisms" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-semibold text-white">Damage mechanisms library →</p><p className="mt-2 text-sm text-white/60">All 69 mechanisms with what, where, how to find and how to stop.</p></Link><Link href="/engineering" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-semibold text-white">Practice with the calculators →</p><p className="mt-2 text-sm text-white/60">Thickness, remaining life, hydrotest, steam traps and damage screening.</p></Link></div>
    <div className="mt-10"><CodesNote /></div>
  </>;
}

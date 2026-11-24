import type { Metadata } from "next";
import Link from "next/link";
import { CODES, TOPICS, TOPIC_GROUPS, chaptersForTopic } from "@/lib/learn/codes";
import { Crumbs } from "@/components/learn/crumbs";
import { CodeFlow } from "@/components/learn/code-flow";
import { SearchBox } from "@/components/learn/search-box";
import { CodesNote } from "@/components/learn/codes-note";
import { JsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { ModuleProgress } from "@/components/learn/train/module-progress";
import { clauseSet, clauseCount, totalClauses, CLAUSE_SETS } from "@/lib/learn/clauses";

export const dynamic = "force-static";
const title = "API & ASME Codes Academy — Learn API 510, 570, 571, 574, 579-1, 580, 581, ASME Section II & V Free";
const description = "Free study modules on the API inspection and integrity codes and ASME Section II (materials) and Section V (NDE): inspection, damage mechanisms, RBI, fitness-for-service, material specifications, test requirements and NDE methods — with clause references, worked examples, self-checks and search.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn/codes" }, openGraph: { title, description, url: "/learn/codes" } };

export default function CodesHub() {
  const chapterCount = CODES.reduce((n, c) => n + c.chapters.length, 0);
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "API and ASME codes study modules", itemListElement: CODES.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl}/learn/codes/${c.slug}`, name: c.title })) }} />
    <Crumbs items={[["Codes academy", "/learn/codes"]]} />
    <header className="mt-4 max-w-3xl"><h1 className="font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">API & ASME codes academy</h1><p className="mt-4 text-lg leading-8 text-white/70">{CODES.length} study modules, {chapterCount} chapters, one connected picture. Learn what each code says, why, and how they work together — with clause references, worked examples and a quick self-check at the end of each module.</p></header>
    <div className="mt-8 max-w-3xl"><SearchBox /></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-4">{[["▶", "Training mode", "One lesson at a time, saved progress"], ["◎", "Interactive diagrams", "Move the sliders, see the rule work"], ["⇄", "Flashcards", "Key terms and self-checks"], ["✓", "Scored quizzes", "Pass at 70% to complete a module"]].map(([i, t, d]) => <div key={t} className="rounded-2xl border border-white/10 p-4"><span className="font-mono text-xl text-amber-100">{i}</span><p className="mt-1 font-semibold text-white">{t}</p><p className="text-xs text-white/55">{d}</p></div>)}</div>

    <section id="clauses" className="mt-6 scroll-mt-24 rounded-3xl border border-emerald-300/25 bg-emerald-300/[.04] p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-semibold text-white">Clause library — {totalClauses().toLocaleString("en-IN")} clauses explained across {CLAUSE_SETS.length} codes</h2><span className="text-xs text-white/50">Every clause links back to the lesson that teaches it</span></div><div className="mt-3 flex flex-wrap gap-2">{CLAUSE_SETS.map((s) => { const m = CODES.find((x) => x.slug === s.slug); return m ? <Link key={s.slug} href={`/learn/codes/${s.slug}/clauses`} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:border-emerald-300/50 hover:text-white"><span className="font-mono">{m.short}</span> <span className="text-white/45">· {clauseCount(s).toLocaleString("en-IN")}</span></Link> : null; })}</div></section>
    <Link href="/learn/exam-prep" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-amber-100/30 bg-amber-100/[0.05] p-5 hover:border-amber-100/60"><span><span className="block text-xs font-semibold uppercase tracking-[.16em] text-amber-100/80">Preparing for certification?</span><span className="mt-1 block text-lg font-semibold text-white">API 510 & API 570 exam prep — study plan, calculation drills, timed mock exams</span></span><span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-black">Start →</span></Link>
    <section className="mt-12"><h2 className="font-display text-2xl font-semibold text-white">How the codes fit together</h2><p className="mt-2 text-white/60">Follow one piece of equipment through its integrity cycle. Click a code to open its module.</p><div className="mt-5"><CodeFlow /></div></section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">Learning path</h2><p className="mt-2 text-white/60">New to the subject? Go in this order. Already working? Jump to the code you need.</p>
      <ol className="mt-5 grid gap-3 md:grid-cols-2">{CODES.map((c) => <li key={c.slug} className="premium-card flex gap-4 rounded-3xl border p-5"><span className="font-mono text-3xl text-amber-100/70">{c.order}</span><span className="min-w-0 flex-1"><span className="block font-mono text-xs text-white/45">{c.code} · {c.edition}</span><Link href={`/learn/codes/${c.slug}`} className="mt-1 block text-lg font-semibold text-white hover:text-amber-50">{c.title.split(" — ")[1]}</Link><span className="mt-1 block text-sm text-white/60">{c.covers}</span><span className="mt-2 block text-xs text-white/40">{c.chapters.length} lessons · {c.chapters.filter((x) => x.visual).length} interactive diagrams · {c.mcq?.length || 0} quiz questions</span><span className="mt-3 flex flex-wrap items-center gap-3"><Link href={`/learn/codes/${c.slug}/train`} className="rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-white">▶ Train</Link><Link href={`/learn/codes/${c.slug}`} className="text-xs text-white/60 hover:text-white">Read</Link>{clauseSet(c.slug) && <Link href={`/learn/codes/${c.slug}/clauses`} className="text-xs text-emerald-100/80 hover:text-white">§ {clauseCount(clauseSet(c.slug)!).toLocaleString("en-IN")} clauses</Link>}<ModuleProgress slug={c.slug} total={c.chapters.length} compact /></span></span></li>)}</ol></section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">Learn by topic</h2><p className="mt-2 text-white/60">Each topic page puts what every code says about it side by side.</p>
      <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{TOPIC_GROUPS.map((g) => <div key={g}><h3 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">{g}</h3><ul className="mt-2 grid gap-1.5">{TOPICS.filter((t) => t.group === g).map((t) => <li key={t.slug}><Link href={`/learn/codes/topics/${t.slug}`} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:border-amber-100/40 hover:text-white"><span>{t.name}</span><span className="font-mono text-xs text-white/35">{chaptersForTopic(t.key).length}</span></Link></li>)}</ul></div>)}</div></section>

    <div className="mt-12 grid gap-4 md:grid-cols-2"><Link href="/learn/damage-mechanisms" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-semibold text-white">Damage mechanisms library →</p><p className="mt-2 text-sm text-white/60">All 69 mechanisms with what, where, how to find and how to stop.</p></Link><Link href="/engineering" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-semibold text-white">Practice with the calculators →</p><p className="mt-2 text-sm text-white/60">Thickness, remaining life, hydrotest, steam traps and damage screening.</p></Link></div>
    <div className="mt-10"><CodesNote /></div>
  </>;
}

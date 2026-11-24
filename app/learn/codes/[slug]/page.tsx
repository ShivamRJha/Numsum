import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CODES, codeBySlug, topicByKey } from "@/lib/learn/codes";
import { JsonLd, articleLd, faqLd } from "@/lib/seo";
import { Crumbs } from "@/components/learn/crumbs";
import { SearchBox } from "@/components/learn/search-box";
import { CodesNote } from "@/components/learn/codes-note";
import { IrisCta } from "@/components/eng/iris-cta";
import { Visual } from "@/components/learn/visuals";
import { ModuleProgress } from "@/components/learn/train/module-progress";
import { clauseSet, clauseCount } from "@/lib/learn/clauses";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return CODES.map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = codeBySlug((await params).slug); if (!c) return {};
  const path = `/learn/codes/${c.slug}`;
  return { title: c.seoTitle, description: c.description, alternates: { canonical: path }, openGraph: { type: "article", title: c.seoTitle, description: c.description, url: path } };
}

export default async function CodePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = codeBySlug((await params).slug); if (!c) notFound();
  const path = `/learn/codes/${c.slug}`;
  const i = CODES.findIndex((x) => x.slug === c.slug);
  const prev = CODES[i - 1], next = CODES[i + 1];
  return <>
    <JsonLd data={[articleLd({ title: c.title, description: c.description, path, about: c.code }), faqLd(c.quiz)]} />
    <Crumbs items={[["Codes academy", "/learn/codes"], [c.short, path]]} />
    <header className="mt-4 max-w-4xl">
      <p className="font-mono text-xs text-amber-100/80">MODULE {c.order} OF {CODES.length} · {c.code} · {c.edition}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-.03em] text-white md:text-5xl">{c.title}</h1>
      <p className="mt-4 text-lg leading-8 text-white/70">{c.description}</p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 p-4"><dt className="text-white/45">What it covers</dt><dd className="mt-1 text-white/85">{c.covers}</dd></div>
        <div className="rounded-2xl border border-white/10 p-4"><dt className="text-white/45">Where it fits</dt><dd className="mt-1 text-white/85">{c.stage}</dd></div>
        <div className="rounded-2xl border border-white/10 p-4"><dt className="text-white/45">Who uses it</dt><dd className="mt-1 text-white/85">{c.audience}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap items-center gap-3"><Link href={`/learn/codes/${c.slug}/train`} className="rounded-full bg-amber-100 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white">▶ Start training mode</Link><span className="text-sm text-white/50">{c.chapters.length} lessons · {c.chapters.filter((x) => x.visual).length} interactive diagrams · {c.mcq?.length || 0}-question quiz</span><ModuleProgress slug={c.slug} total={c.chapters.length} /></div>{clauseSet(c.slug) && <Link href={`/learn/codes/${c.slug}/clauses`} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-300/[.06] p-4 hover:border-emerald-300/50"><span><span className="font-semibold text-white">Clause-by-clause guide</span><span className="block text-sm text-white/60">Every one of the {clauseCount(clauseSet(c.slug)!)} clauses explained in plain English, searchable by number or word.</span></span><span className="text-sm text-emerald-100">Open →</span></Link>}
    </header>

    <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <nav aria-label="In this module" className="rounded-2xl border border-white/10 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-white/45">In this module</p>
          <ol className="mt-3 grid gap-1.5">
            <li><a href="#concepts" className="text-white/70 hover:text-white">Key terms</a></li>
            {c.chapters.map((ch, n) => <li key={ch.id}><a href={`#${ch.id}`} className="flex gap-2 text-white/70 hover:text-white"><span className="font-mono text-white/35">{n + 1}</span><span>{ch.title}</span></a></li>)}
            {c.example && <li><a href="#example" className="text-white/70 hover:text-white">Worked example</a></li>}
            <li><a href="#pitfalls" className="text-white/70 hover:text-white">Common mistakes</a></li>
            <li><a href="#check" className="text-white/70 hover:text-white">Self-check</a></li>
          </ol>
        </nav>
        <div className="mt-4 hidden lg:block"><SearchBox placeholder={`Search… e.g. ${c.short} interval`} /></div>
      </aside>

      <div className="min-w-0">
        <section id="concepts" className="scroll-mt-24"><h2 className="font-display text-2xl font-semibold text-white">Key terms</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">{c.concepts.map(([t, d]) => <div key={t} className="rounded-2xl border border-white/10 p-4"><dt className="font-semibold text-amber-50">{t}</dt><dd className="mt-1 text-sm leading-6 text-white/70">{d}</dd></div>)}</dl></section>

        {c.chapters.map((ch, n) => <section key={ch.id} id={ch.id} className="mt-12 scroll-mt-24 border-t border-white/10 pt-8">
          <p className="font-mono text-xs text-amber-100/80">{String(n + 1).padStart(2, "0")} · {c.short} {ch.ref}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-white">{ch.title}</h2>
          <p className="mt-3 text-lg leading-8 text-white/80">{ch.summary}</p>
          {ch.visual && <Visual k={ch.visual} />}
          {ch.formula && <div className="mt-4 rounded-2xl border border-amber-100/25 bg-amber-100/[0.05] p-4"><p className="text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">Formula</p>{ch.formula.map((f) => <p key={f} className="mt-1 font-mono text-sm text-white">{f}</p>)}</div>}
          <ul className="mt-4 grid gap-2">{ch.points.map((p) => <li key={p} className="flex gap-3 leading-7 text-white/75"><span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-100/70" /><span>{p}</span></li>)}</ul>
          {ch.deep && ch.deep.length > 0 && <div className="mt-4 grid gap-2">{ch.deep.map(([h, t]) => <details key={h} className="rounded-2xl border border-violet-200/20 bg-violet-300/[0.04] p-4"><summary className="cursor-pointer text-sm font-semibold text-violet-100">Deep dive — {h}</summary><p className="mt-2 text-sm leading-7 text-white/75">{t}</p></details>)}</div>}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {ch.tags.map((k) => { const t = topicByKey(k); return <Link key={k} href={`/learn/codes/topics/${t.slug}`} className="rounded-full border border-white/12 px-2.5 py-1 text-xs text-white/60 hover:text-white">#{t.name}</Link>; })}
            {ch.tool && <Link href={ch.tool[1]} className="ml-auto rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-white">{ch.tool[0]} →</Link>}
          </div>
        </section>)}

        {c.example && <section id="example" className="mt-12 scroll-mt-24 rounded-3xl border border-emerald-300/25 bg-emerald-400/[0.04] p-6"><p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-100/80">Worked example</p><h2 className="mt-1 font-display text-2xl font-semibold text-white">{c.example.title}</h2><ol className="mt-4 grid gap-2">{c.example.steps.map((s, k) => <li key={k} className="flex gap-3 leading-7 text-white/80"><span className="font-mono text-emerald-100/80">{k + 1}.</span><span>{s}</span></li>)}</ol></section>}

        <section id="pitfalls" className="mt-12 scroll-mt-24"><h2 className="font-display text-2xl font-semibold text-white">Common mistakes</h2><ul className="mt-4 grid gap-2">{c.pitfalls.map((p) => <li key={p} className="flex gap-3 rounded-2xl border border-red-300/20 bg-red-500/[0.04] p-3 text-white/75"><span aria-hidden className="text-red-200">✕</span><span>{p}</span></li>)}</ul></section>

        <section id="check" className="mt-12 scroll-mt-24"><h2 className="font-display text-2xl font-semibold text-white">Self-check</h2><p className="mt-1 text-sm text-white/50">Answer in your head, then open to compare.</p><div className="mt-4 grid gap-2">{c.quiz.map(([q, a]) => <details key={q} className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer font-medium text-white">{q}</summary><p className="mt-2 text-white/70">{a}</p></details>)}</div></section>

        <section className="mt-12"><h2 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">Related modules</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{c.related.map((s) => { const r = codeBySlug(s)!; return <Link key={s} href={`/learn/codes/${s}`} className="rounded-2xl border border-white/10 p-4 hover:border-amber-100/40"><p className="font-mono text-xs text-white/45">{r.code}</p><p className="mt-1 font-semibold text-white">{r.title.split(" — ")[1]}</p></Link>; })}</div></section>

        <nav className="mt-10 flex flex-wrap justify-between gap-3" aria-label="Module navigation">
          {prev ? <Link href={`/learn/codes/${prev.slug}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:text-white">← {prev.short}</Link> : <span />}
          {next ? <Link href={`/learn/codes/${next.slug}`} className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-black hover:bg-white">Next: {next.short} →</Link> : <Link href="/learn/codes" className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-black">Back to the academy</Link>}
        </nav>
        <div className="mt-10"><CodesNote /></div>
        <IrisCta line="IRIS applies these rules for you — CMLs, corrosion rates, remaining life, intervals, RBI and FFS records for the whole plant." />
      </div>
    </div>
  </>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { codeBySlug } from "@/lib/learn/codes";
import { CLAUSE_SETS, clauseSet, clauseCount } from "@/lib/learn/clauses";
import { ClauseGuide } from "@/components/learn/clause-guide";
import { Crumbs } from "@/components/learn/crumbs";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return CLAUSE_SETS.map((s) => ({ slug: s.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug; const c = codeBySlug(slug); const s = clauseSet(slug); if (!c || !s) return {};
  return {
    title: `${c.short} Clause-by-Clause Guide — Every Clause Explained`,
    description: `All ${clauseCount(s)} clauses of ${c.code} (${c.edition}) explained in plain English with key numbers, searchable and linked to training lessons. Study notes for API inspector exams.`,
    alternates: { canonical: `/learn/codes/${slug}/clauses` },
  };
}

export default async function ClausesPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug; const c = codeBySlug(slug); const s = clauseSet(slug);
  if (!c || !s) notFound();
  const lessons: Record<string, string> = {};
  for (const [id] of s.rows) { const l = s.lesson(id); if (l) lessons[id] = l; }
  const n = clauseCount(s);
  return <>
    <JsonLd data={breadcrumbLd([["Learn", "/learn"], ["Codes academy", "/learn/codes"], [c.short, `/learn/codes/${slug}`], ["Clause guide", `/learn/codes/${slug}/clauses`]])} />
    <Crumbs items={[["Codes academy", "/learn/codes"], [c.short, `/learn/codes/${slug}`], ["Clause guide", `/learn/codes/${slug}/clauses`]]} />
    <header className="mt-4 max-w-3xl">
      <p className="font-mono text-xs text-amber-100/80">CLAUSE GUIDE · {c.code} · {c.edition}</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">Every clause of {c.short}, explained</h1>
      <p className="mt-3 text-white/65">All {n} numbered clauses and annexes in order, each in plain English with its key numbers. Search by clause number or word, link straight to any clause, or jump to the lesson that teaches it.</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {s.partial ? <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-amber-100">In progress — {s.partial}</span> : <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-emerald-100">100% of clauses covered</span>}
        <Link href={`/learn/codes/${slug}/train`} className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:border-white/40">▶ Training mode</Link>
        <Link href={`/learn/codes/${slug}`} className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:border-white/40">Module overview</Link>
        {/^api-5(10|70)/.test(slug) && <Link href={`/learn/exam-prep/${slug.slice(0, 7)}`} className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:border-white/40">{c.short} exam prep</Link>}
      </div>
    </header>
    <div className="mt-8"><ClauseGuide slug={slug} rows={s.rows} lessons={lessons} /></div>
    <p className="mt-12 max-w-3xl text-xs text-white/40">Independent study notes written by NumSum Labs. They explain each clause in our own words and are not the text of the standard. Always work from your licensed copy of the current edition, which governs.</p>
  </>;
}

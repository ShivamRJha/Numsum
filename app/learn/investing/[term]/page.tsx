import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TERMS, termBySlug } from "@/lib/learn/terms";
import { JsonLd, termLd } from "@/lib/seo";
import { Crumbs } from "@/components/learn/crumbs";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return TERMS.map((t) => ({ term: t.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const t = termBySlug((await params).term); if (!t) return {};
  const title = `${t.term} — Meaning, Formula & What Is Good`;
  return { title, description: t.simple.slice(0, 158), alternates: { canonical: `/learn/investing/${t.slug}` }, openGraph: { title, description: t.simple.slice(0, 158), url: `/learn/investing/${t.slug}` } };
}
export default async function TermPage({ params }: { params: Promise<{ term: string }> }) {
  const t = termBySlug((await params).term); if (!t) notFound();
  const path = `/learn/investing/${t.slug}`;
  const same = TERMS.filter((x) => x.group === t.group && x.slug !== t.slug).slice(0, 8);
  return <article className="max-w-3xl">
    <JsonLd data={termLd({ name: t.term, description: t.simple, path, set: "NumSum investing glossary" })} />
    <Crumbs items={[["Investing terms", "/learn/investing"], [t.term, path]]} />
    <h1 className="mt-4 font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">{t.term}</h1>
    <p className="mt-2 font-mono text-xs text-white/45">{t.group}</p>
    <section className="mt-8 rounded-2xl border border-white/10 p-5"><h2 className="text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">In simple words</h2><p className="mt-2 text-lg leading-8 text-white/85">{t.simple}</p></section>
    <section className="mt-4 rounded-2xl border border-white/10 p-5"><h2 className="text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">For professionals — how it is computed</h2><p className="mt-2 font-mono text-sm leading-7 text-white/75">{t.pro}</p></section>
    {t.good && <section className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.05] p-5"><h2 className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-100/80">What is good</h2><p className="mt-2 text-white/80">{t.good}</p></section>}
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/tools/investment-planner" className="rounded-full bg-amber-100 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white">Plan a goal</Link><Link href="/tools/stock-analyzer" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white">Analyse a stock</Link></div>
    {same.length > 0 && <section className="mt-12"><h2 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">Related terms</h2><div className="mt-3 flex flex-wrap gap-2">{same.map((x) => <Link key={x.slug} href={`/learn/investing/${x.slug}`} className="rounded-full border border-white/12 px-3 py-1.5 text-sm text-white/75 hover:text-white">{x.term}</Link>)}</div></section>}
    <p className="mt-10 text-xs text-white/45">Education only — not investment advice.</p>
  </article>;
}

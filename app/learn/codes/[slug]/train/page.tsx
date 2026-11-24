import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CODES, codeBySlug } from "@/lib/learn/codes";
import { Trainer } from "@/components/learn/train/trainer";
import { Crumbs } from "@/components/learn/crumbs";
import { ModuleTabs } from "@/components/learn/module-tabs";
import { clauseSet, clausesPerLesson } from "@/lib/learn/clauses";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return CODES.map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = codeBySlug((await params).slug); if (!c) return {};
  return { title: `${c.short} Training — Lessons, Flashcards & Quiz`, description: `Interactive training on ${c.code}: ${c.chapters.length} lessons with diagrams, flashcards and a ${c.mcq?.length || 0}-question quiz.`, alternates: { canonical: `/learn/codes/${c.slug}` } };
}
export default async function TrainPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = codeBySlug((await params).slug); if (!c) notFound();
  const i = CODES.findIndex((x) => x.slug === c.slug); const n = CODES[i + 1];
  return <>
    <Crumbs items={[["Codes academy", "/learn/codes"], [c.short, `/learn/codes/${c.slug}`], ["Training", `/learn/codes/${c.slug}/train`]]} />
    <header className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-xs text-amber-100/80">TRAINING · MODULE {c.order} · {c.code} · {c.edition}</p><h1 className="mt-1 font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">{c.title}</h1></div></header>
    <ModuleTabs slug={c.slug} active="train" className="mt-5" />
    <div className="mt-6"><Trainer m={c} next={n ? { slug: n.slug, short: n.short } : undefined} clauses={(() => { const s = clauseSet(c.slug); return s ? clausesPerLesson(s) : {}; })()} /></div>
    <p className="mt-12 text-xs text-white/40">Your progress is saved only in this browser. Independent study notes by NumSum Labs — the current edition of each standard governs.</p>
  </>;
}

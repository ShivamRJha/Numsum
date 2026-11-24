import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TRACKS, trackBySlug } from "@/lib/learn/exam/tracks";
import { codeBySlug } from "@/lib/learn/codes";
import { Crumbs } from "@/components/learn/crumbs";
import { ExamPrep } from "@/components/learn/exam-prep";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return TRACKS.map((t) => ({ track: t.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const t = trackBySlug((await params).track); if (!t) return {};
  const title = `${t.name} Exam Preparation — Study Plan, Calculation Drills & Mock Exam`;
  return { title, description: t.intro, alternates: { canonical: `/learn/exam-prep/${t.slug}` }, openGraph: { title, url: `/learn/exam-prep/${t.slug}` } };
}
export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const t = trackBySlug((await params).track); if (!t) notFound();
  const mods = t.modules.map((s) => codeBySlug(s)!).map(({ slug, short, title, chapters, mcq }) => ({ slug, short, title, chapters, mcq }));
  return <>
    <Crumbs items={[["Exam prep", "/learn/exam-prep"], [t.name, `/learn/exam-prep/${t.slug}`]]} />
    <header className="mt-4 max-w-3xl"><h1 className="font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">{t.title}</h1><p className="mt-3 text-lg leading-8 text-white/70">{t.intro}</p></header>
    <div className="mt-8"><ExamPrep track={t} mods={mods} /></div>
    <p className="mt-10 text-xs text-white/40">Progress and scores are saved only in this browser. Not affiliated with API; confirm exam scope on the current effectivity sheet.</p>
  </>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { TRACKS } from "@/lib/learn/exam/tracks";
import { GENS } from "@/lib/learn/exam/generators";
import { Crumbs } from "@/components/learn/crumbs";
import { CodesNote } from "@/components/learn/codes-note";

export const dynamic = "force-static";
const title = "API 510 & API 570 Exam Preparation — Free Study Plan, Calculation Drills & Mock Exams";
const description = "Prepare for the API 510 pressure vessel and API 570 piping inspector exams: body-of-knowledge study plan, unlimited calculation drills with worked answers (corrosion rate, remaining life, UG-27, MAWP, hydrotest, B31.3) and timed mock exams scored by topic.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn/exam-prep" }, openGraph: { title, description, url: "/learn/exam-prep" } };
export default function ExamHub() {
  return <>
    <Crumbs items={[["Exam prep", "/learn/exam-prep"]]} />
    <header className="mt-4 max-w-3xl"><h1 className="font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">API certification exam prep</h1><p className="mt-4 text-lg leading-8 text-white/70">Three steps: learn the modules, drill the calculations until they are automatic, then prove it in timed mock exams scored by topic.</p></header>
    <div className="mt-8 grid gap-4 md:grid-cols-2">{TRACKS.map((t) => <Link key={t.slug} href={`/learn/exam-prep/${t.slug}`} className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-mono text-3xl text-amber-100">{t.name}</p><p className="mt-2 text-lg font-semibold text-white">{t.title.split(" — ")[0]}</p><p className="mt-2 text-sm text-white/60">{t.intro}</p><p className="mt-3 text-xs text-white/40">{t.modules.length} modules · {GENS.filter((g) => g.tracks.includes(t.key)).length} calculation types · mock exams</p></Link>)}</div>
    <p className="mt-8 rounded-2xl border border-amber-200/25 bg-amber-200/[0.05] p-4 text-sm text-white/70">These tracks prepare you thoroughly for the topics they cover, but no study aid can guarantee a pass. The exam uses specific editions listed on API&apos;s effectivity sheet and includes documents not yet on NumSum (marked in each study plan). Use the official documents alongside this course. NumSum is not affiliated with API.</p>
    <div className="mt-8"><CodesNote /></div>
  </>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { PATHS, RESEARCH_SKILLS, allItems } from "@/lib/research/paths";
import { ResearchShell } from "@/components/research/shell";

export const dynamic = "force-static";
const title = "Engineering Learning Paths — Best Books and Journals, Fundamentals to Research";
const description = "Mechanical, chemical and electrical engineering learning paths: internationally recognised textbooks for fundamentals and advanced study, landmark papers, leading journals and how to follow recent developments.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/research/paths" }, openGraph: { title, description, url: "/research/paths" } };

export default function PathsHub() {
  return <ResearchShell active="/research/paths" title="Learning paths" intro={<p>Each path climbs the same three steps: <b className="text-white">fundamentals</b> you must own, <b className="text-white">advanced</b> study at research depth, and <b className="text-white">recent developments</b> from the leading journals. Pick your discipline and your level; tick items off as you go.</p>}>
    <div className="grid gap-5 md:grid-cols-3">{PATHS.map((p) => <Link key={p.slug} href={`/research/paths/${p.slug}`} className="premium-card group flex flex-col rounded-3xl border p-6 hover:border-violet-200/50">
      <p className="font-display text-2xl font-semibold text-white">{p.name}</p>
      <p className="mt-2 flex-1 text-sm leading-6 text-white/60">{p.tagline}</p>
      <ol className="mt-5 grid gap-2">{p.stages.map((s, i) => <li key={s.key} className="flex items-center gap-3 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-200/40 font-mono text-xs text-violet-100">{i + 1}</span><span className="text-white/80">{s.name}</span><span className="ml-auto font-mono text-xs text-white/40">{s.groups.reduce((n, g) => n + g.items.length, 0)}</span></li>)}</ol>
      <p className="mt-5 text-sm font-semibold text-violet-100 group-hover:text-white">{allItems(p).length} items · {p.journals.length} journals →</p>
    </Link>)}</div>
    <section className="mt-14 rounded-3xl border border-white/10 p-6"><h2 className="font-display text-xl font-semibold text-white">For every discipline: research skills</h2><p className="mt-1 text-sm text-white/60">Read these alongside any path — they teach how research is chosen, done and written.</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">{RESEARCH_SKILLS.map((i) => <li key={i.id} className="rounded-2xl border border-white/10 p-4"><p className="font-semibold text-white">{i.title}</p>{i.by && <p className="text-xs text-white/50">{i.by}</p>}{i.note && <p className="mt-1 text-sm text-white/60">{i.note}</p>}</li>)}</ul>
    </section>
  </ResearchShell>;
}

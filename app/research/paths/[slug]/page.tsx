import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ITEM_KIND_LABEL, PATHS, RESEARCH_SKILLS, allItems, pathBySlug } from "@/lib/research/paths";
import { ResearchShell } from "@/components/research/shell";
import { ItemCheck, PathProgress, StageBadge } from "@/components/research/path-progress";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return PATHS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = pathBySlug((await params).slug); if (!p) return {};
  const title = `${p.name} Learning Path — Best Books, Journals and Research Directions`;
  const description = `${p.tagline} The standard textbooks for fundamentals and advanced study, landmark papers, ${p.journals.length} leading journals, and where to start for B.Tech, M.Tech, PhD and faculty.`;
  return { title, description, alternates: { canonical: `/research/paths/${p.slug}` }, openGraph: { title, description, url: `/research/paths/${p.slug}` } };
}

const KIND_STYLE = { book: "bg-amber-200/15 text-amber-100", paper: "bg-sky-300/15 text-sky-100", course: "bg-emerald-300/15 text-emerald-100", skill: "bg-violet-200/15 text-violet-100" } as const;
const JOURNAL_KIND = { flagship: "Flagship", review: "Reviews", applied: "Applied" } as const;

export default async function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = pathBySlug((await params).slug); if (!p) notFound();
  const items = [...allItems(p), ...RESEARCH_SKILLS];
  return <ResearchShell active="/research/paths" title={p.name} intro={<p>{p.tagline}</p>}>
    <p className="mb-6 text-sm"><Link href="/research/paths" className="text-white/55 hover:text-white">← All paths</Link></p>
    <PathProgress slug={p.slug} total={items.length}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          {p.stages.map((s, i) => <section key={s.key} id={s.key} className="relative scroll-mt-40 border-l border-violet-200/25 pb-12 pl-8 last:pb-0">
            <span className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-violet-200/50 bg-[#0b1220] font-mono text-sm text-violet-100">{i + 1}</span>
            <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-2xl font-semibold text-white">{s.name}</h2><StageBadge stage={s.key} /></div>
            <p className="mt-1 text-white/60">Goal: {s.goal}</p>
            {s.groups.map((g) => <div key={g.name} className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-[.14em] text-white/45">{g.name}</h3>
              <ul className="mt-3 grid gap-2">{g.items.map((it) => <li key={it.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <ItemCheck id={it.id} label={it.title} />
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${KIND_STYLE[it.kind]}`}>{ITEM_KIND_LABEL[it.kind]}</span>{it.link ? <a href={it.link} target={it.link.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="font-semibold text-white hover:text-violet-100">{it.title} ↗</a> : <span className="font-semibold text-white">{it.title}</span>}</div>
                  {it.by && <p className="mt-0.5 text-sm text-white/55">{it.by}</p>}{it.note && <p className="mt-1 text-sm text-white/60">{it.note}</p>}</div>
              </li>)}</ul></div>)}
          </section>)}
          <section className="mt-12 rounded-3xl border border-white/10 p-6"><h2 className="font-display text-xl font-semibold text-white">Research skills, for every level</h2>
            <ul className="mt-4 grid gap-2">{RESEARCH_SKILLS.map((it) => <li key={it.id} className="flex gap-3 rounded-2xl border border-white/10 p-4"><ItemCheck id={it.id} label={it.title} /><div><p className="font-semibold text-white">{it.title}</p>{it.by && <p className="text-sm text-white/55">{it.by}</p>}{it.note && <p className="mt-1 text-sm text-white/60">{it.note}</p>}</div></li>)}</ul></section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-40 lg:h-fit">
          <div className="rounded-3xl border border-white/10 p-5"><h2 className="font-semibold text-white">Journals to follow</h2><p className="mt-1 text-xs text-white/50">Read the review journal yearly, scan flagship tables of contents monthly.</p>
            <ul className="mt-3 grid gap-2.5">{p.journals.map((j) => <li key={j.name}><a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(`source:"${j.name}"`)}&scisbd=1`} target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:text-violet-100">{j.name} ↗</a><p className="text-xs text-white/50">{JOURNAL_KIND[j.kind]} · {j.scope}</p></li>)}</ul></div>
          <div className="rounded-3xl border border-white/10 p-5"><h2 className="font-semibold text-white">Research directions</h2><ul className="mt-3 flex flex-wrap gap-2">{p.directions.map((d) => <li key={d} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">{d}</li>)}</ul>
            <Link href={`/research/radar?topics=${encodeURIComponent(p.radarTopics.slice(0, 4).join("|"))}`} className="mt-4 inline-block text-sm font-semibold text-violet-100 hover:text-white">See this week's papers →</Link></div>
        </aside>
      </div>
    </PathProgress>
  </ResearchShell>;
}

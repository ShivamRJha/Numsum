import type { Metadata } from "next";
import Link from "next/link";
import { LEVELS, PATHS } from "@/lib/research/paths";
import { ResearchShell } from "@/components/research/shell";
import { JoinButton } from "@/components/research/member-only";

export const dynamic = "force-static";
const title = "Research Commons — Learn, Read and Research in Mechanical, Chemical and Electrical Engineering";
const description = "A free space for engineering students, scholars and faculty: learning paths from fundamentals to recent developments, the best books and journals, a daily research radar, discussions, PhD and postdoc positions and a personal progress dashboard.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/research" }, openGraph: { title, description, url: "/research" } };

const FEATURES = [
  ["Learning paths", "Fundamentals → advanced → recent developments for mechanical, chemical and electrical engineering, with the world's standard textbooks and the journals that matter.", "/research/paths", "Open to everyone"],
  ["Research radar", "Set your research direction once. New preprints and notable journal papers in your keywords arrive every day, and the best ones as alerts.", "/research/radar", "Members"],
  ["Discussions", "Ask about a method, a paper or a result and talk it through with students, scholars and faculty.", "/research/discuss", "Members"],
  ["Positions", "PhD, postdoc, internship and collaboration openings, posted by the people offering them.", "/research/positions", "Members"],
  ["Researchers", "A directory of members who choose to be found: field, interests and what they are looking for.", "/research/people", "Members"],
  ["My dashboard", "Private targets with due dates, a reading list, path progress and alerts. Only you see it.", "/research/me", "Members"],
] as const;

export default function CommonsHome() {
  return <ResearchShell active="/research" title="Learn deeply. Research boldly. Together." intro={<p>The Research Commons is a free place to grow from strong fundamentals to original research — for B.Tech students, final-year students, M.Tech and PhD scholars, and professors.</p>}>
    <div className="flex flex-wrap items-center gap-3"><JoinButton /><Link href="/research/paths" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white">Browse learning paths</Link></div>

    <section className="mt-12"><h2 className="font-display text-2xl font-semibold text-white">How growth works here</h2>
      <ol className="mt-5 grid gap-4 md:grid-cols-4">{[["1", "Build fundamentals", "Read the classic textbooks properly and solve their problems."], ["2", "Go advanced", "Pick a direction and study it at research depth."], ["3", "Follow the frontier", "Read the leading journals and the daily radar for your keywords."], ["4", "Do research", "Set targets, find collaborators or a position, and publish."]].map(([n, t, d]) => <li key={n} className="premium-card rounded-3xl border p-5"><span className="font-mono text-3xl text-violet-200/70">{n}</span><p className="mt-2 font-semibold text-white">{t}</p><p className="mt-1 text-sm text-white/60">{d}</p></li>)}</ol>
    </section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">What's inside</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([t, d, h, who]) => <Link key={h} href={h} className="premium-card group flex flex-col rounded-3xl border p-6 hover:border-violet-200/50"><span className="flex items-center justify-between"><span className="text-lg font-semibold text-white">{t}</span><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${who === "Members" ? "bg-violet-200/15 text-violet-100" : "bg-emerald-300/15 text-emerald-100"}`}>{who}</span></span><span className="mt-2 flex-1 text-sm leading-6 text-white/60">{d}</span><span className="mt-4 text-sm font-semibold text-violet-100 group-hover:text-white">Open →</span></Link>)}</div>
    </section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">Three disciplines to start</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">{PATHS.map((p) => <Link key={p.slug} href={`/research/paths/${p.slug}`} className="premium-card rounded-3xl border p-6 hover:border-violet-200/50"><p className="font-display text-xl font-semibold text-white">{p.name}</p><p className="mt-2 text-sm text-white/60">{p.tagline}</p><p className="mt-4 font-mono text-xs text-white/45">{p.stages.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.items.filter((i) => i.kind === "book").length, 0), 0)} books · {p.journals.length} journals · {p.directions.length} research directions</p></Link>)}</div>
    </section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">Where you start depends on where you are</h2>
      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">{LEVELS.map((l) => <div key={l.key} className="grid gap-2 border-t border-white/10 p-4 first:border-t-0 md:grid-cols-[14rem_1fr]"><p className="font-semibold text-white">{l.label}</p><p className="text-sm leading-6 text-white/65">{l.advice}</p></div>)}</div>
    </section>

    <section className="mt-14 grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 p-6"><p className="font-semibold text-white">Privacy by default</p><p className="mt-2 text-sm leading-6 text-white/60">Your targets, reading list and progress are visible only to you. You choose whether to appear in the researcher directory.</p></div>
      <Link href="/research/library" className="rounded-3xl border border-white/10 p-6 hover:border-violet-200/40"><p className="font-semibold text-white">Research library →</p><p className="mt-2 text-sm leading-6 text-white/60">Peer-reviewed and member-submitted research linked to real industrial problems.</p></Link>
    </section>
  </ResearchShell>;
}

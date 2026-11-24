import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/learn/guides";
import { DM_LIB } from "@/lib/eng/damage-mechanisms";
import { TERMS } from "@/lib/learn/terms";
import { CODES } from "@/lib/learn/codes";
import { CLAUSE_SETS, clauseCount, totalClauses } from "@/lib/learn/clauses";
import { SearchBox } from "@/components/learn/search-box";
import { ModuleProgress } from "@/components/learn/train/module-progress";

export const dynamic = "force-static";
const title = "Learn Inspection Engineering — API & ASME Codes Clause by Clause, Training, Exam Prep";
const description = "Free inspection engineering academy: study modules and clause-by-clause guides for API 510, 570, 571, 574, 579-1, 580, 581 and ASME Section II & V, with training mode, quizzes, 69 damage mechanisms, calculators and API 510/570 exam prep.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn" }, openGraph: { title, description, url: "/learn" } };

export default function LearnHub() {
  const chapters = CODES.reduce((n, c) => n + c.chapters.length, 0);
  const clauses = totalClauses();
  const inspection = GUIDES.filter((g) => g.area === "Inspection");
  const money = GUIDES.filter((g) => g.area === "Investing");
  const steps = [
    ["1", "Understand", `${CODES.length} modules · ${chapters} lessons`, "Read each code as a story: what it asks, why, and how the codes connect. Train one lesson at a time with diagrams and quizzes.", "/learn/codes", "Open the academy"],
    ["2", "Look up", `${clauses.toLocaleString("en-IN")} clauses explained`, "Every numbered clause in plain English. Each one links to the lesson that teaches it, and each lesson to its clauses.", "/learn/codes#clauses", "Open the clause library"],
    ["3", "Practise", `${DM_LIB.length} mechanisms · free calculators`, "Screen damage mechanisms, then run the same thickness, remaining-life and interval sums the codes use.", "/learn/damage-mechanisms", "Practise on real cases"],
    ["4", "Prove it", "API 510 & 570", "A study plan, unlimited calculation drills and timed mock exams that point you back to the clauses you missed.", "/learn/exam-prep", "Start exam prep"],
  ] as const;

  return <>
    <header className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">Learn</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">Inspection engineering, learned properly</h1><p className="mt-4 text-lg leading-8 text-white/70">One path through the API and ASME codes: understand the idea, look up the exact clause, practise the calculation, then prove it under exam conditions.</p></header>
    <div className="mt-8 max-w-3xl"><SearchBox /></div>

    <section aria-labelledby="path" className="mt-10"><h2 id="path" className="sr-only">Learning path</h2>
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map(([n, t, k, d, h, c]) => <li key={n}><Link href={h} className="premium-card group flex h-full flex-col rounded-3xl border p-5 hover:border-amber-100/50"><span className="flex items-baseline gap-3"><span className="font-mono text-3xl text-amber-100/70">{n}</span><span className="font-display text-xl font-semibold text-white">{t}</span></span><span className="mt-2 font-mono text-xs text-emerald-100/80">{k}</span><span className="mt-2 flex-1 text-sm leading-6 text-white/60">{d}</span><span className="mt-4 text-sm font-semibold text-amber-100 group-hover:text-white">{c} →</span></Link></li>)}</ol>
    </section>

    <section className="mt-14"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold text-white">Every code, every view</h2><p className="mt-1 text-white/60">Each code has the same four doors: read it, train it, look up its clauses, sit the exam.</p></div><Link href="/learn/codes" className="text-sm text-amber-100 hover:text-white">How the codes fit together →</Link></div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-white/10"><table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-xs uppercase tracking-[.12em] text-white/45"><tr><th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Read</th><th className="px-4 py-3 font-medium">Train</th><th className="px-4 py-3 font-medium">Clauses</th><th className="px-4 py-3 font-medium">Your progress</th></tr></thead>
        <tbody>{CODES.map((c) => { const s = CLAUSE_SETS.find((x) => x.slug === c.slug); return <tr key={c.slug} className="border-t border-white/10">
          <td className="px-4 py-3"><span className="block font-mono text-xs text-white/45">{c.code}</span><span className="text-white">{c.title.split(" — ")[1] ?? c.title}</span></td>
          <td className="px-4 py-3"><Link href={`/learn/codes/${c.slug}`} className="text-white/80 hover:text-white">{c.chapters.length} lessons</Link></td>
          <td className="px-4 py-3"><Link href={`/learn/codes/${c.slug}/train`} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-black hover:bg-white">▶ Train</Link></td>
          <td className="px-4 py-3">{s ? <Link href={`/learn/codes/${c.slug}/clauses`} className="text-emerald-100 hover:text-white">§ {clauseCount(s).toLocaleString("en-IN")}</Link> : <span className="text-white/35">coming</span>}</td>
          <td className="px-4 py-3"><ModuleProgress slug={c.slug} total={c.chapters.length} compact /></td>
        </tr>; })}</tbody>
      </table></div>
    </section>

    <section className="mt-14"><h2 className="font-display text-2xl font-semibold text-white">Short inspection guides</h2><p className="mt-1 text-white/60">Five-minute reads for when you need the idea, not the whole code.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{inspection.map((g) => <Link key={g.slug} href={`/learn/${g.slug}`} className="premium-card rounded-2xl border p-5 hover:border-amber-100/40"><p className="font-semibold text-white">{g.title.split(" — ")[0].split(":")[0]}</p><p className="mt-2 text-sm text-white/60">{g.description}</p><p className="mt-3 font-mono text-xs text-white/40">{g.minutes} min read</p></Link>)}</div></section>

    <section aria-labelledby="money" className="mt-16 rounded-3xl border border-dashed border-violet-200/30 bg-violet-300/[0.04] p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-200/80">Off the clock · just for fun</p>
      <h2 id="money" className="mt-2 font-display text-2xl font-semibold text-white">The Money Lab</h2>
      <p className="mt-2 max-w-3xl text-white/65">Engineers like numbers outside work too. This is our after-hours side project: plain-English money terms and a few stock and fund research toys. It isn’t what we do, and it isn’t advice — it’s a sandbox for the curious.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link href="/learn/investing" className="rounded-full border border-violet-200/40 px-4 py-2 text-sm text-violet-50 hover:border-violet-200/70">{TERMS.length} money terms, decoded</Link><Link href="/tools" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:text-white">Play in the Money Lab →</Link></div>
      {money.length > 0 && <details className="mt-5"><summary className="cursor-pointer text-sm text-white/55 hover:text-white">{money.length} short money reads</summary><div className="mt-3 grid gap-2 md:grid-cols-2">{money.map((g) => <Link key={g.slug} href={`/learn/${g.slug}`} className="rounded-2xl border border-white/10 p-4 text-sm hover:border-violet-200/40"><span className="font-semibold text-white">{g.title.split(" — ")[0].split(":")[0]}</span><span className="mt-1 block text-white/55">{g.description}</span></Link>)}</div></details>}
    </section>
  </>;
}

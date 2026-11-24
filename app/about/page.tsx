import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, LineChart, ShieldCheck, Users, Wrench } from "lucide-react";
import { CODES } from "@/lib/learn/codes";
import { CLAUSE_SETS, clauseCount } from "@/lib/learn/clauses";
import { DM_LIB } from "@/lib/eng/damage-mechanisms";
import { ENG_TOOLS } from "@/lib/eng/catalog";
import { JsonLd, org, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About NumSum Labs — Free Engineering, Inspection and Investing Tools",
  description: "NumSum Labs builds free, plain-language tools for plant engineers, inspectors, investors and MSMEs: an API/ASME codes academy, inspection calculators and planners, Indian stock and fund research, and IRIS inspection software.",
  alternates: { canonical: "/about" },
};

const clauses = CLAUSE_SETS.reduce((n, s) => n + clauseCount(s), 0);
const lessons = CODES.reduce((n, c) => n + c.chapters.length, 0);

const PILLARS = [
  { icon: BookOpen, name: "Learn", href: "/learn/codes", line: `${CODES.length} code modules, ${lessons} lessons and ${clauses.toLocaleString("en-IN")} clauses explained in plain language, with exam practice for API 510 and 570.` },
  { icon: Calculator, name: "Engineering", href: "/engineering", line: `${ENG_TOOLS.length} calculators and planners — thickness, remaining life, inspection plans, QAPs and damage mechanism screening — every step shown.` },
  { icon: LineChart, name: "Investing", href: "/tools", line: "Indian stock and mutual fund research: screeners, company analysis, goal planning and portfolio checks, free to use." },
  { icon: Wrench, name: "IRIS", href: "/products/iris", line: "Inspection and reliability software for process plants — statutory inspections, RBI and an offline tablet app." },
  { icon: Users, name: "Community", href: "/for-msmes", line: "A place for MSMEs to bring real plant problems, and for engineers, students and startups to solve them." },
];

const PRINCIPLES = [
  ["Free to learn", "Every guide, calculator and screener is free. No paywall in front of knowledge an engineer needs to do the job safely."],
  ["Shown, not hidden", "Calculations show each step and the clause they come from, so you can check the work and learn from it."],
  ["Written for the floor", "Short sentences, real examples, units on every number. If an inspector on a turnaround cannot use it, we rewrite it."],
  ["Respect for the codes", "We explain the published standards in our own words and point to the clause. The licensed edition always governs."],
  ["Private by default", "Problems MSMEs submit stay private until they agree to share them. Your calculations stay in your browser."],
  ["Built to last", "Fast static pages, open data formats and exports to PDF and Excel, so work done here stays useful elsewhere."],
] as const;

export default function AboutPage() {
  return <main className="min-h-screen overflow-hidden bg-navy px-6 pb-24 pt-14">
    <JsonLd data={[{ "@context": "https://schema.org", "@type": "AboutPage", name: "About NumSum Labs", url: "/about", about: org }, breadcrumbLd([["Home", "/"], ["About", "/about"]])]} />
    <section className="relative mx-auto max-w-6xl">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-32 h-[28rem] w-[28rem] rounded-full bg-blue-400/20 blur-3xl animate-glow" />
      <p className="section-eyebrow">About NumSum Labs</p>
      <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-[-.045em] md:text-7xl">Practical tools for the people who keep <span className="text-shimmer">plants and portfolios</span> healthy.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/70">NumSum Labs turns dense engineering codes and scattered financial data into tools anyone can use. Inspectors learn API and ASME clause by clause and run the calculations they need on site. Investors research Indian stocks and funds without paying for a terminal. MSMEs get a structured way to solve real problems with help from engineers and students.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/learn/codes" className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-black transition hover:bg-white">Start learning <ArrowRight size={16} /></Link><Link href="/contact" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white/50">Talk to us</Link></div>
    </section>

    <section className="mx-auto mt-20 max-w-6xl">
      <h2 className="section-title">What we build</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-stagger>
        {PILLARS.map((p) => <Link key={p.name} href={p.href} className="lift group rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-100/40">
          <p.icon className="h-6 w-6 text-amber-100" aria-hidden />
          <h3 className="mt-4 font-display text-2xl font-semibold text-white">{p.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{p.line}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-100">Open <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
        </Link>)}
        <div className="rounded-3xl border border-dashed border-white/15 p-6"><ShieldCheck className="h-6 w-6 text-blue-200" aria-hidden /><h3 className="mt-4 font-display text-2xl font-semibold text-white">By the numbers</h3><dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-white/45">Clauses explained</dt><dd className="font-display text-2xl text-white">{clauses.toLocaleString("en-IN")}</dd></div><div><dt className="text-white/45">Damage mechanisms</dt><dd className="font-display text-2xl text-white">{DM_LIB.length}</dd></div><div><dt className="text-white/45">Lessons</dt><dd className="font-display text-2xl text-white">{lessons}</dd></div><div><dt className="text-white/45">Calculators</dt><dd className="font-display text-2xl text-white">{ENG_TOOLS.length}</dd></div></dl></div>
      </div>
    </section>

    <section className="mx-auto mt-20 max-w-6xl">
      <h2 className="section-title">How we work</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-stagger>
        {PRINCIPLES.map(([t, d]) => <div key={t} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><h3 className="text-lg font-semibold text-white">{t}</h3><p className="mt-2 text-sm leading-relaxed text-white/60">{d}</p></div>)}
      </div>
    </section>

    <section className="mx-auto mt-20 max-w-6xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-400/10 via-transparent to-amber-100/10 p-8 md:p-12">
      <h2 className="font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">Have a plant problem, a tool idea or a correction?</h2>
      <p className="mt-3 max-w-2xl text-white/65">We read everything. Corrections to a clause explanation or calculation are fixed quickly and credited in the change notes.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/contact" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-amber-100">Contact us</Link><Link href="/submit-problem" className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white/85 hover:border-white/50">Submit an MSME problem</Link></div>
    </section>
  </main>;
}

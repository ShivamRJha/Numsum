import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HomeSplash } from "@/components/home-splash";
import { Button, Card } from "@/components/ui";
import { PublicReviewCarousel } from "@/components/public-review-carousel";
import { SearchBox } from "@/components/learn/search-box";
import { CODES } from "@/lib/learn/codes";
import { CLAUSE_SETS, clauseCount } from "@/lib/learn/clauses";
import { DM_LIB } from "@/lib/eng/damage-mechanisms";
import { ENG_TOOLS } from "@/lib/eng/catalog";
import SPECS from "@/lib/asme/spec-index.json";
import { JsonLd, org } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "NumSum Labs — API & ASME Inspection Academy, Inspection Plan Generator and Engineering Calculators",
  description: "Learn API 510, 570, 571, 574, 579, 580, 581 and ASME II and V clause by clause, prepare for API inspector exams, generate an inspection plan PDF, build a QAP and run code calculators. Free.",
  alternates: { canonical: "/" },
};

const lessons = CODES.reduce((n, c) => n + c.chapters.length, 0);
const visuals = CODES.reduce((n, c) => n + c.chapters.filter((x) => x.visual).length, 0);
const mcqs = CODES.reduce((n, c) => n + (c.mcq?.length || 0), 0);
const clauses = CLAUSE_SETS.reduce((n, s) => n + clauseCount(s), 0);
const calcs = ENG_TOOLS.length;

const DO = [
  ["New", "Inspection plan generator", "Answer standard questions about a vessel or piping circuit. Get a complete plan with intervals, damage mechanisms, tasks and acceptance — as a PDF.", "/engineering/inspection-plan-generator", "Make a plan"],
  ["", "QAP builder", "Pick the material specs and NDE. Get a quality assurance plan with tests, frequency, references and hold points.", "/engineering/qap-builder", "Build a QAP"],
  ["", "Material spec finder", `${(SPECS as unknown[]).length} ASME Section II specs: product form, mandatory tests and supplementary requirements.`, "/engineering/material-spec-finder", "Find a spec"],
  ["", "Code calculators", "Vessel and pipe thickness, remaining life, hydrotest pressure, steam trap loss and damage mechanism screening — every step shown.", "/engineering", "Open calculators"],
] as const;

export default function Home() {
  return <main className="overflow-hidden bg-[#060504] text-[#fff8ea]">
    <JsonLd data={[{ "@context": "https://schema.org", ...org, description: "Inspection engineering academy, inspection plan generator and code calculators." }, { "@context": "https://schema.org", "@type": "WebSite", name: "NumSum Labs", url: siteUrl, publisher: org, potentialAction: { "@type": "SearchAction", target: `${siteUrl}/learn/search?q={q}`, "query-input": "required name=q" } }]} />
    <HomeSplash />

    {/* Hero: one promise, one search box, three doors */}
    <section className="relative mx-auto max-w-6xl px-6 pb-10 pt-14 md:pt-20">
      <div className="hero-orb hero-orb-a" /><div className="hero-orb hero-orb-b" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-5 inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.22em] text-amber-100/85">Inspection · Integrity · Free</p>
        <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-[-.05em] sm:text-5xl lg:text-6xl">Learn the codes. Plan the inspection. Do the math.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">API and ASME explained clause by clause, exam practice for API 510 and 570, and tools that turn your answers into an inspection plan or QAP.</p>
        <div className="mx-auto mt-8 max-w-2xl text-left"><SearchBox big placeholder="Search any clause, mechanism or spec… e.g. “6.5.2”, “CUI”, “SA-516”" /></div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/engineering/inspection-plan-generator">Generate an inspection plan</Button>
          <Button href="/learn/exam-prep" variant="secondary">Prepare for API exam</Button>
          <Button href="/learn/codes" variant="secondary">Codes academy</Button>
        </div>
      </div>
    </section>

    {/* Proof band */}
    <section className="mx-auto max-w-6xl px-6">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
        {[[CODES.length, "standards taught"], [clauses, "clauses explained"], [lessons, "lessons"], [visuals, "interactive diagrams"], [mcqs, "quiz questions + unlimited drills"], [DM_LIB.length, "damage mechanisms"]].map(([n, l]) => <div key={l as string} className="bg-[#0b0906] px-4 py-5 text-center"><dt className="sr-only">{l}</dt><dd className="font-display text-3xl font-bold text-amber-100">{n}</dd><dd className="mt-1 text-xs leading-4 text-white/55">{l}</dd></div>)}
      </dl>
    </section>

    {/* Learn */}
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="section-eyebrow">Learn</p><h2 className="section-title">A course for every code you inspect to.</h2></div><Link href="/learn/codes" className="whitespace-nowrap text-sm text-amber-100 hover:text-white">All modules →</Link></div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="premium-card">
          <h3 className="text-xl font-semibold">Codes academy</h3>
          <p className="mt-2 text-sm leading-6 text-white/65">Each module runs as short lessons with diagrams you can play with, then flashcards and a scored quiz. Your progress saves in the browser.</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {CODES.map((c) => <li key={c.slug}><Link href={`/learn/codes/${c.slug}/train`} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-sm hover:border-amber-200/40"><span className="min-w-0 truncate"><span className="font-semibold text-white">{c.short}</span> <span className="text-white/50">{c.chapters.length} lessons</span></span><span className="text-amber-100/80">▶</span></Link></li>)}
          </ul>
        </Card>
        <div className="grid gap-5">
          <Card className="premium-card">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-200">Clause by clause</p>
            <h3 className="mt-2 text-xl font-semibold">Every clause, in plain English</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">Find a clause by number or word and read what it actually asks you to do, with its key numbers.</p>
            <div className="mt-4 flex flex-wrap gap-2">{CLAUSE_SETS.map((s) => { const c = CODES.find((x) => x.slug === s.slug); return c ? <Button key={s.slug} href={`/learn/codes/${s.slug}/clauses`} variant="secondary">{c.short} — {clauseCount(s)} clauses</Button> : null; })}</div>
          </Card>
          <Card className="premium-card">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-200">Exam prep</p>
            <h3 className="mt-2 text-xl font-semibold">API 510 and API 570</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">A study plan, calculation drills with fresh numbers every time, and timed mock exams scored by topic.</p>
            <div className="mt-4 flex flex-wrap gap-2"><Button href="/learn/exam-prep/api-510">API 510</Button><Button href="/learn/exam-prep/api-570" variant="secondary">API 570</Button></div>
          </Card>
        </div>
      </div>
    </section>

    {/* Do */}
    <section className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="section-eyebrow">Do the work</p><h2 className="section-title">From questions to documents.</h2></div><Link href="/engineering" className="whitespace-nowrap text-sm text-amber-100 hover:text-white">All {calcs} engineering tools →</Link></div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DO.map(([tag, t, d, h, c]) => <Card key={h} className="premium-card flex h-full flex-col">{tag ? <span className="mb-2 w-fit rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-black">{tag}</span> : null}<h3 className="text-lg font-semibold">{t}</h3><p className="mt-2 flex-1 text-sm leading-6 text-white/65">{d}</p><Button href={h} variant="secondary" className="mt-5">{c}</Button></Card>)}
      </div>
    </section>

    {/* Damage mechanisms */}
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Card className="premium-card grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div><p className="section-eyebrow">API 571</p><h2 className="mt-1 font-display text-2xl font-semibold tracking-[-.03em] md:text-3xl">What could be damaging this equipment?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Answer a few service questions to screen {DM_LIB.length} damage mechanisms, then read how each one looks and how to find it.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col"><Button href="/engineering/damage-mechanism-screening">Screen mechanisms</Button><Button href="/learn/damage-mechanisms" variant="secondary">Browse the library</Button></div>
      </Card>
    </section>

    {/* More from NumSum */}
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <p className="section-eyebrow">More from NumSum</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[["IRIS software", "Plant-wide inspection records: statutory inspections, thickness monitoring, RBI, boilers and steam traps. Office PC and offline tablet.", "/products/iris", "Explore IRIS"], ["Money Lab · just for fun", "Our after-hours side project: a goal planner, fund and stock research toys, and money terms in plain English. Not advice.", "/tools", "Have a play"], ["For MSMEs", "Bring a real industrial problem. We help scope it and connect it with students, researchers and experts.", "/for-msmes", "Learn how it works"]].map(([t, d, h, c]) => <Card key={h} className="premium-card flex h-full flex-col"><h3 className="text-lg font-semibold">{t}</h3><p className="mt-2 flex-1 text-sm leading-6 text-white/65">{d}</p><Button href={h} variant="secondary" className="mt-5">{c}</Button></Card>)}
      </div>
    </section>

    <Suspense fallback={null}><PublicReviewCarousel /></Suspense>
  </main>;
}

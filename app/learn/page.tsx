import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/learn/guides";
import { DM_LIB } from "@/lib/eng/damage-mechanisms";
import { TERMS } from "@/lib/learn/terms";
import { CODES } from "@/lib/learn/codes";
import { SearchBox } from "@/components/learn/search-box";

export const dynamic = "force-static";
const title = "Learn — Inspection, Reliability & Investing Guides in Plain Language";
const description = "Free API inspection codes academy (510, 570, 571, 574, 579-1, 580, 581) and plain-language guides: risk-based inspection, API 510/570/653, corrosion rate and remaining life, 69 API 571 damage mechanisms, steam traps, SIPs, expense ratios and investing terms.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn" }, openGraph: { title, description, url: "/learn" } };

export default function LearnHub() {
  const area = (a: "Inspection" | "Investing") => GUIDES.filter((g) => g.area === a);
  return <>
    <header className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">Learn</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">Short guides, no jargon</h1><p className="mt-4 text-lg leading-8 text-white/70">Study modules on the API inspection codes, a damage mechanisms library, short guides and investing terms — all searchable.</p></header>
    <div className="mt-8 max-w-3xl"><SearchBox /></div>
    <Link href="/learn/codes" className="premium-card mt-10 block rounded-3xl border border-amber-100/30 p-6 hover:border-amber-100/60 md:p-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">Codes academy</p><p className="mt-2 font-display text-2xl font-semibold text-white md:text-3xl">Learn API 510, 570, 571, 574, 579-1, 580, 581 and ASME Section II & V</p><p className="mt-2 max-w-3xl text-white/65">{CODES.length} modules, {CODES.reduce((n, c) => n + c.chapters.length, 0)} chapters with clause references, worked examples, self-checks and a map of how the codes fit together.</p><p className="mt-4 flex flex-wrap gap-2">{CODES.map((c) => <span key={c.slug} className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-white/70">{c.short}</span>)}</p></Link>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Link href="/learn/damage-mechanisms" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-mono text-3xl text-amber-100">{DM_LIB.length}</p><p className="mt-1 text-lg font-semibold text-white">Damage mechanisms (API 571)</p><p className="mt-2 text-sm text-white/60">What each one is, where it happens, what it looks like, how to find it and how to stop it.</p></Link>
      <Link href="/learn/investing" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-mono text-3xl text-amber-100">{TERMS.length}</p><p className="mt-1 text-lg font-semibold text-white">Investing terms</p><p className="mt-2 text-sm text-white/60">CAGR, XIRR, Sharpe, drawdown, P/E, expense ratio and more — explained simply, with the exact formula.</p></Link>
    </div>
    {(["Inspection", "Investing"] as const).map((a) => <section key={a} className="mt-12"><h2 className="font-display text-2xl font-semibold text-white">{a} guides</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{area(a).map((g) => <Link key={g.slug} href={`/learn/${g.slug}`} className="premium-card rounded-2xl border p-5 hover:border-amber-100/40"><p className="font-semibold text-white">{g.title.split(" — ")[0].split(":")[0]}</p><p className="mt-2 text-sm text-white/60">{g.description}</p><p className="mt-3 font-mono text-xs text-white/40">{g.minutes} min read</p></Link>)}</div></section>)}
  </>;
}

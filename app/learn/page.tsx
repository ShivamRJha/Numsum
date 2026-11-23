import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/learn/guides";
import { DM_LIB } from "@/lib/eng/damage-mechanisms";
import { TERMS } from "@/lib/learn/terms";

export const dynamic = "force-static";
const title = "Learn — Inspection, Reliability & Investing Guides in Plain Language";
const description = "Free, plain-language guides: risk-based inspection, API 510/570/653, corrosion rate and remaining life, 69 API 571 damage mechanisms, steam traps, SIPs, expense ratios and investing terms.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn" }, openGraph: { title, description, url: "/learn" } };

export default function LearnHub() {
  const area = (a: "Inspection" | "Investing") => GUIDES.filter((g) => g.area === a);
  return <>
    <header className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">Learn</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">Short guides, no jargon</h1><p className="mt-4 text-lg leading-8 text-white/70">Each guide takes a few minutes and ends with the tool that does the work.</p></header>
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      <Link href="/learn/damage-mechanisms" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-mono text-3xl text-amber-100">{DM_LIB.length}</p><p className="mt-1 text-lg font-semibold text-white">Damage mechanisms (API 571)</p><p className="mt-2 text-sm text-white/60">What each one is, where it happens, what it looks like, how to find it and how to stop it.</p></Link>
      <Link href="/learn/investing" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-mono text-3xl text-amber-100">{TERMS.length}</p><p className="mt-1 text-lg font-semibold text-white">Investing terms</p><p className="mt-2 text-sm text-white/60">CAGR, XIRR, Sharpe, drawdown, P/E, expense ratio and more — explained simply, with the exact formula.</p></Link>
    </div>
    {(["Inspection", "Investing"] as const).map((a) => <section key={a} className="mt-12"><h2 className="font-display text-2xl font-semibold text-white">{a} guides</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{area(a).map((g) => <Link key={g.slug} href={`/learn/${g.slug}`} className="premium-card rounded-2xl border p-5 hover:border-amber-100/40"><p className="font-semibold text-white">{g.title.split(" — ")[0].split(":")[0]}</p><p className="mt-2 text-sm text-white/60">{g.description}</p><p className="mt-3 font-mono text-xs text-white/40">{g.minutes} min read</p></Link>)}</div></section>)}
  </>;
}

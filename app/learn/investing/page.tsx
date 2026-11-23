import type { Metadata } from "next";
import { TERMS } from "@/lib/learn/terms";
import { Crumbs } from "@/components/learn/crumbs";
import { FilterList } from "@/components/learn/filter-list";

export const dynamic = "force-static";
const title = "Investing Terms Explained Simply — CAGR, XIRR, Sharpe, P/E, Expense Ratio & More";
const description = "Every investing measure explained twice: once in plain language for beginners and once with the exact formula for professionals — returns, risk, valuation, funds and scores.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn/investing" }, openGraph: { title, description, url: "/learn/investing" } };
const GROUPS = ["Basics", "Returns", "Risk", "Business & valuation", "Price behaviour", "Funds", "Scores & data"];
export default function TermsIndex() {
  return <>
    <Crumbs items={[["Investing terms", "/learn/investing"]]} />
    <header className="mt-4 max-w-3xl"><h1 className="font-display text-4xl font-bold tracking-[-.04em] text-white">Investing terms, explained simply</h1><p className="mt-4 text-lg leading-8 text-white/70">Each term has a plain-language meaning and the exact formula used in our tools.</p></header>
    <div className="mt-8"><FilterList placeholder="Search, e.g. drawdown, P/E, XIRR" groups={GROUPS.map((g) => [g, g])} items={TERMS.map((t) => ({ href: `/learn/investing/${t.slug}`, title: t.term, text: t.simple, group: t.group }))} /></div>
  </>;
}

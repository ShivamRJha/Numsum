import type { Metadata } from "next";
import Link from "next/link";
import { DataQuality } from "@/components/invest/data-quality";
import { ToolHeader } from "@/components/invest/tools-nav";
import { Card } from "@/components/ui";
import { GLOSSARY, GLOSSARY_GROUPS } from "@/lib/invest/glossary";
import { loadFundSummary, loadStockSummary } from "@/lib/invest/load";

export const metadata: Metadata = {
  title: "How the Investment Tools Work — Data, Checks, Scoring & Glossary | NumSum Labs",
  description: "Where the data comes from, how it is cross-checked, how funds and stocks are scored for long-term SIP investing, the 'risen too much' heat measure, and every term explained simply and professionally.",
  alternates: { canonical: "/tools/methodology" },
};

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => <h2 id={id} className="scroll-mt-32 font-display text-3xl font-bold tracking-[-.03em] text-white">{children}</h2>;
const Table = ({ head, rows }: { head: string[]; rows: (string | number)[][] }) => <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs uppercase tracking-[.12em] text-white/45"><tr>{head.map((h) => <th key={h} className="py-2 pr-4">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t border-white/8">{r.map((c, j) => <td key={j} className={j === 0 ? "py-2 pr-4 text-white/90" : "py-2 pr-4 text-white/65"}>{c}</td>)}</tr>)}</tbody></table></div>;

const toc = [["philosophy", "Who these tools are for"], ["sources", "Where the data comes from"], ["data-quality", "Multiple checks & backups"], ["funds", "How funds are scored"], ["stocks", "How stocks are scored"], ["heat", "“Risen too much” — heat"], ["checklist", "The investor checklist"], ["sip-builder", "How stocks are suggested"], ["planner", "Goal planner maths"], ["limits", "Limitations"], ["glossary", "Glossary"]];

export default async function MethodologyPage() {
  const [funds, stocks] = await Promise.all([loadFundSummary(), loadStockSummary()]);
  const groups = GLOSSARY_GROUPS.map((g) => [g, Object.entries(GLOSSARY).filter(([, e]) => e.group === g)] as const);
  return <>
    <ToolHeader eyebrow="How it works" title="Nothing hidden: data, checks and scoring." intro={<p>Everything the tools show is explained here twice — in plain words for anyone new to investing, and with the exact definitions and formulas for professionals. Hover or tap any underlined term in the tools for the same explanation.</p>} />
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
      <nav aria-label="On this page" className="hidden lg:block"><ul className="sticky top-36 grid gap-1 text-sm">{toc.map(([id, l]) => <li key={id}><a href={`#${id}`} className="block rounded-lg px-3 py-1.5 text-white/60 hover:bg-white/5 hover:text-white">{l}</a></li>)}</ul></nav>
      <div className="grid gap-10">
        <section><H2 id="philosophy">Who these tools are for</H2>
          <Card className="premium-card mt-4"><p className="text-white/75">The tools are built for people who invest <strong className="text-white">regularly (SIP) and hold for at least one year</strong> — ideally five or more. They are not for trading, tips or quick one-time jumps. That choice shapes everything:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-white/65"><li>Business quality, cost and valuation weigh more than recent price moves.</li><li>Stocks that have <a href="#heat" className="text-amber-100 underline">risen too far, too fast</a> are flagged and down-rated, even if they look exciting.</li><li>Suggestions come with a monthly amount and rules for staying invested, not entry and exit prices.</li><li>Nothing here is a recommendation to buy or sell. Treat scores as a research starting point, then read the company's or fund's documents.</li></ul></Card>
        </section>

        <section><H2 id="sources">Where the data comes from</H2>
          <Table head={["Data", "Primary source", "Backup / cross-check", "Updated"]} rows={[
            ["Mutual fund list & latest NAV", "AMFI daily NAV file", "Second AMFI file format", "Nightly 00:40 IST"],
            ["Fund NAV history", "api.mfapi.in", "Latest NAV compared with AMFI; mismatches excluded", "Nightly"],
            ["Fund expense ratios", "AMFI TER disclosure (tracker on GitHub)", "Previous refresh's value if a fund is missing", "Nightly"],
            ["Stock prices (NSE)", "eod2 NSE end-of-day dataset", "Yahoo Finance — compared on overlapping days; used alone if NSE data is missing", "Nightly + live in the analyzer"],
            ["Nifty 50 & its P/E", "eod2 dataset", "Yahoo Finance (^NSEI)", "Nightly"],
            ["Company fundamentals", "Yahoo Finance", "Last nightly values if live fetch fails", "Nightly + live in the analyzer"],
            ["Nifty 500 list", "NSE indices", "Bundled list in the website", "Nightly"],
          ]} />
          <p className="mt-3 text-sm text-white/55">Admins can also press <em>Refresh now</em> to fetch everything immediately. Prices are adjusted for splits and bonuses; stock returns exclude dividends.</p>
        </section>

        <section><H2 id="data-quality">Multiple checks &amp; backups</H2>
          <p className="mt-3 text-white/65">Every refresh runs these checks before anything is saved. If a refresh loads less than 85% of the previous data, it is <strong className="text-white">not saved</strong> and the old data stays. Each save also keeps the previous version as a backup, and admins can restore it with one click.</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2"><DataQuality title="Mutual funds — latest refresh" checks={funds?.checks} updatedAt={funds?.updatedAt} /><DataQuality title="Stocks — latest refresh" checks={stocks?.checks} updatedAt={stocks?.updatedAt} /></div>
        </section>

        <section><H2 id="funds">How funds are scored</H2>
          <p className="mt-3 text-white/65">Each fund is compared only with funds in the same group (e.g. flexi cap with flexi cap, Nifty 50 index funds with each other). For every measure we work out its percentile among those peers, then take a weighted average. Young funds and funds with missing data are pulled toward 50 so they cannot top the list on luck.</p>
          <Table head={["Group", "What counts (weight)"]} rows={[
            ["Active equity", "Expense ratio 30 · consistency vs peers 25 · max fall 10 · Sortino 10 · 1/3/5-year returns 15 · track record 10"],
            ["Index & gold funds", "Expense ratio 40 · tracking vs same-index peers 35 · return 10 · track record 15"],
            ["Arbitrage", "3-year return 35 · 1-year return 5 · stability 20 · expense ratio 30 · track record 10"],
            ["Debt", "3-year return 30 · 1-year return 10 · stability 20 · expense ratio 25 · track record 15"],
          ]} />
          <p className="mt-3 text-sm text-white/55">Why cost weighs most: a fund has to beat its peers by more than its extra fee just to break even, and research across markets finds fees are the most reliable predictor of future relative returns. Past returns are the least reliable, so they carry little weight.</p>
        </section>

        <section><H2 id="stocks">How stocks are scored</H2>
          <p className="mt-3 text-white/65">Each Nifty 500 stock gets five pillar scores (0–100). Quality and valuation are compared <strong className="text-white">within the stock's own industry</strong> — a bank is compared with banks, not with software companies.</p>
          <Table head={["Pillar", "Weight", "Measures"]} rows={[["Business quality", 30, "ROE 45 · debt/equity 25 (not for lenders) · profit margin 30"], ["Valuation", 25, "P/E 65 · P/B 35 (lower is better, vs industry)"], ["Risk", 20, "Volatility 35 · 3-year worst fall 35 · beta 30"], ["Long-term trend", 15, "3-year return 40 · price vs 200-day average (no extra credit above +20%) 30 · share of positive 1-year periods 30"], ["Growth", 10, "Revenue growth 50 · earnings growth 50"]]} />
          <p className="mt-3 text-sm text-white/55">Then: heat penalty (below), thin data pulled toward 50, and stocks trading under ₹1 crore a day capped at 45. Signal: Strong ≥ 70, Positive ≥ 57, Neutral ≥ 43, otherwise Weak.</p>
        </section>

        <section><H2 id="heat">“Risen too much” — heat</H2>
          <Card className="premium-card mt-4"><p className="text-white/75"><strong className="text-white">In simple words:</strong> when a share price shoots up very quickly, new buyers are often paying for years of future growth in advance. Even excellent companies can then go nowhere — or fall — for a long time. The heat measure spots this so you can slow down.</p>
            <p className="mt-3 text-sm text-white/60"><strong className="text-white/80">Exactly:</strong> {GLOSSARY.heat.pro}</p>
            <Table head={["Heat", "Score", "What a SIP investor might do"]} rows={[["Calm", "< 30", "Normal SIP."], ["Warm", "30–54", "Normal SIP; avoid adding big one-time amounts after sharp jumps."], ["Hot", "55–74", "Start smaller and spread purchases over 6–12 months."], ["Overheated", "75+", "Avoid lump sums; keep any SIP small and wait for the price to cool toward its 200-day average."]]} />
            <p className="mt-3 text-sm text-white/55">Effect on scores: above heat 50, the stock score drops by 0.4 points per heat point (up to −20), the analyzer checklist by 0.3 per point, and Overheated stocks can never be rated better than Neutral / Mixed.</p></Card>
        </section>

        <section><H2 id="checklist">The investor checklist (stock analyzer)</H2>
          <p className="mt-3 text-white/65">Seventeen yes/no checks that long-term investors commonly run, in six groups. The checklist score weights the groups and subtracts the heat penalty; a volatility-based position-size guide suggests the most this stock should be of your stock money.</p>
          <Table head={["Group", "Weight", "Checks"]} rows={[["Business quality", 30, "ROE > 15% · debt/equity < 1 · profitable with growing earnings · revenue growing"], ["Valuation", 20, "P/E < 1.5× industry (or Nifty) · PEG < 2 · P/B < 6"], ["Risk", 20, "Volatility < 35% · beta < 1.2 · 3-year worst fall better than −40% · positive in 60%+ of 1-year periods"], ["Long-term trend", 15, "3-year return positive · price above 200-day average"], ["Entry timing", 10, "< 25% above 200-day average · 6-month gain < 40% · RSI < 70"], ["Liquidity", 5, "Traded value > ₹5 crore a day"]]} />
        </section>

        <section><H2 id="sip-builder">How stocks are suggested (Stock SIP builder)</H2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-white/65"><li>Start from the scored Nifty 500 and keep only liquid stocks (₹5 crore+ a day) with complete data.</li><li>Apply your choices: risk level sets minimum company size and maximum volatility; your style re-weights the pillars (e.g. “Dividend” adds dividend yield, “Value” favours valuation); excluded industries are removed.</li><li>Remove Weak stocks. Overheated (and, if you ask, Hot) stocks go to a separate <em>wait list</em> instead of the basket.</li><li>Pick the best-ranked stocks with at most two per industry, until the basket size suits your monthly amount (about ₹1,000+ per stock).</li><li>Split the monthly amount with risk-balanced weights (steadier stocks get more), capped by each stock's position-size guide.</li></ol>
          <p className="mt-3 text-sm text-white/55">Every suggested stock shows why it was chosen. The suggestion is a research list for a long-term SIP — check each company yourself before investing.</p>
        </section>

        <section><H2 id="planner">Goal planner maths</H2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-white/65"><li>Future goal = today's cost × (1 + inflation)<sup>years</sup>.</li><li>Allocation: equity share rises with years and risk appetite (e.g. balanced: 0% under 3 years, 35% at 3–5, 50% at 5–7, 60% at 7–10, 65% beyond); gold 5–10% from 3 years; the rest in debt/arbitrage. Excluded parts are spread proportionally over the rest.</li><li>Expected return = allocation-weighted assumptions (defaults: equity 11%, debt 7%, gold 8%), with a ±2% range.</li><li>Required SIP solves: savings × (1+r)<sup>n</sup> + SIP × Σ (1+g)<sup>k</sup> × FV(12 monthly payments) × (1+r)<sup>n−k−1</sup> = goal.</li></ul>
        </section>

        <section><H2 id="limits">Limitations</H2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-white/65"><li>Free public sources can be delayed, revised or briefly unavailable; the checks above catch most problems, not all.</li><li>Fund size (AUM), exit loads, portfolio holdings and quarterly result history are not included yet.</li><li>Fundamentals are trailing figures and change with each quarterly result.</li><li>Scores describe the past and present; they do not predict returns. NumSum Labs is not a SEBI-registered investment adviser or research analyst.</li></ul>
        </section>

        <section><H2 id="glossary">Glossary</H2><p className="mt-3 text-white/65">Every term in plain words, then the professional definition.</p>
          {groups.map(([g, entries]) => <div key={g} className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-[.2em] text-amber-100/80">{g}</h3><dl className="mt-3 grid gap-3 md:grid-cols-2">{entries.map(([id, e]) => <div key={id} id={`term-${id}`} className="scroll-mt-36 rounded-2xl border border-white/10 bg-white/[0.03] p-4 target:border-amber-100/60"><dt className="font-semibold text-white">{e.term}</dt><dd className="mt-1.5 text-sm leading-6 text-white/75">{e.simple}</dd><dd className="mt-1.5 font-mono text-xs leading-5 text-white/50">{e.pro}</dd>{e.good && <dd className="mt-1.5 text-xs text-emerald-200/90">Good: {e.good}</dd>}</div>)}</dl></div>)}
        </section>
        <p className="text-sm text-white/50">Questions about the method? <Link href="/contact?topic=investment_tool" className="underline">Ask us</Link>.</p>
      </div>
    </div>
  </>;
}

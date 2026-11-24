import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
import { StockAnalyzerClient } from "@/components/invest/stock-analyzer-client";
import { NIFTY500, UNIVERSE_BY_SYMBOL } from "@/lib/invest/sources";

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const symbol = decodeURIComponent((await params).symbol).toUpperCase();
  const name = UNIVERSE_BY_SYMBOL.get(symbol)?.[1] || symbol;
  return { title: `${name} (${symbol}) — Share Analysis, Financials, Peers & News | NumSum`, description: `${name} (${symbol}) share analysis: quarterly results, P&L, balance sheet, cash flow, ROE/ROCE, peer comparison, news tone and a long-term checklist. Free.`, alternates: { canonical: `/tools/stock-analyzer/${encodeURIComponent(symbol)}` } };
}

/** Nifty 500 pages are pre-built and refreshed daily; any other NSE symbol is built on first visit and cached. */
export const revalidate = 86400;
export const dynamicParams = true;
export function generateStaticParams() { return NIFTY500.map(([s]) => ({ symbol: s })); }

export default async function StockAnalyzerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const symbol = decodeURIComponent((await params).symbol).toUpperCase();
  const u = UNIVERSE_BY_SYMBOL.get(symbol);
  const name = u?.[1] || symbol, industry = u?.[2] || "";
  const peers = industry ? NIFTY500.filter((x) => x[2] === industry && x[0] !== symbol).slice(0, 8) : [];
  const path = `/tools/stock-analyzer/${encodeURIComponent(symbol)}`;
  return <>
    <JsonLd data={[breadcrumbLd([["Home", "/"], ["Investing", "/tools"], ["Stock analyzer", "/tools/stock-analyzer"], [name, path]]), { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: `Is ${name} a good stock for a long-term SIP?`, acceptedAnswer: { "@type": "Answer", text: `NumSum runs a free long-term checklist on ${name} (${symbol}): business quality (ROE, debt, margins), valuation against ${industry || "industry"} peers, risk (volatility, drawdown, beta), the long-term trend and whether the price has run up too far. Recent news tone adjusts the score by at most six points. It is a research aid, not a recommendation.` } },
      { "@type": "Question", name: `Where can I see ${name} quarterly results and financials?`, acceptedAnswer: { "@type": "Answer", text: `The page shows quarterly and annual sales, operating profit, net profit, EPS, balance sheet, cash flow and ratios such as ROE and ROCE, with a peer comparison.` } },
    ] }]} />
    <StockAnalyzerClient symbol={symbol} universe={NIFTY500} />
    <section className="mt-10 border-t border-white/10 pt-6 text-sm text-white/55">
      <h2 className="font-display text-lg text-white/80">About this analysis</h2>
      <p className="mt-2 max-w-3xl">{name} ({symbol}){industry ? ` is listed on the NSE in ${industry}` : " is listed on the NSE"}. This free page combines price history, fundamentals, financial statements, peer comparison and a news-tone check into one long-term investor checklist. Data refreshes daily; nothing here is investment advice.</p>
      {peers.length > 0 && <p className="mt-3">Compare with: {peers.map(([s, n], i) => <span key={s}>{i > 0 && " · "}<Link href={`/tools/stock-analyzer/${encodeURIComponent(s)}`} className="text-blue-100/80 hover:text-white">{n}</Link></span>)}</p>}
    </section>
  </>;
}

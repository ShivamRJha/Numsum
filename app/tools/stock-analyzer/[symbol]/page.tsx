import type { Metadata } from "next";
import { StockAnalyzerClient } from "@/components/invest/stock-analyzer-client";
import { NIFTY500, UNIVERSE_BY_SYMBOL } from "@/lib/invest/sources";

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const symbol = decodeURIComponent((await params).symbol).toUpperCase();
  const name = UNIVERSE_BY_SYMBOL.get(symbol)?.[1] || symbol;
  return { title: `${name} (${symbol}) — Stock Analysis & Investor Checklist | NumSum Labs`, description: `${name}: trend, momentum, risk, beta, drawdown, Sharpe, ROE, debt and valuation checks with a SIP back-test.`, alternates: { canonical: `/tools/stock-analyzer/${encodeURIComponent(symbol)}` } };
}

export default async function StockAnalyzerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const symbol = decodeURIComponent((await params).symbol).toUpperCase();
  return <StockAnalyzerClient symbol={symbol} universe={NIFTY500} />;
}

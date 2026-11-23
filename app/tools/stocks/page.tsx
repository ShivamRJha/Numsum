import type { Metadata } from "next";
import { StockScreenerClient } from "@/components/invest/stock-screener-client";
import { ToolHeader } from "@/components/invest/tools-nav";
import { loadStockSummary } from "@/lib/invest/load";

export const metadata: Metadata = {
  title: "Nifty 500 Stock Screener — Trend, Risk, Quality & Valuation Scores | NumSum Labs",
  description: "Screen the Nifty 500 with scores for trend, risk, quality, valuation and growth versus industry peers. Ready-made screens for quality at a fair price, momentum, low volatility and dividends.",
  alternates: { canonical: "/tools/stocks" },
};

export default async function StocksPage() {
  const doc = await loadStockSummary();
  return <>
    <ToolHeader eyebrow="Stock screener" title="Screen the Nifty 500." intro={<p>Every stock is scored against the Nifty 500 on trend, risk, quality, valuation and growth — quality and valuation against its own industry. Use a ready-made screen, then open any stock in the analyzer to run the full checklist.</p>} />
    <StockScreenerClient rows={doc?.rows || []} asOf={doc?.asOf || null} indexPe={doc?.indexPe ?? null} methodology={doc?.methodology || ""} industries={doc?.industries || {}} withFundamentals={doc?.withFundamentals || 0} />
  </>;
}

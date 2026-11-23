import type { Metadata } from "next";
import { StockSearch } from "@/components/invest/stock-search";
import { ToolHeader } from "@/components/invest/tools-nav";
import { Card } from "@/components/ui";
import { NIFTY500 } from "@/lib/invest/sources";

export const metadata: Metadata = {
  title: "Stock Analyzer — Investor Checklist, Risk & Return Statistics | NumSum Labs",
  description: "Analyse any NSE stock: 200-day trend, momentum, RSI, volatility, beta, drawdown, Sharpe, VaR, ROE, debt and P/E versus peers, a SIP back-test and a plain-language signal summary.",
  alternates: { canonical: "/tools/stock-analyzer" },
};

const popular = ["RELIANCE", "HDFCBANK", "TCS", "INFY", "ICICIBANK", "ITC", "LT", "BHARTIARTL", "SBIN", "HINDUNILVR", "ASIANPAINT", "TITAN"];

export default function StockAnalyzerHome() {
  return <>
    <ToolHeader eyebrow="Stock analyzer" title="Run the checks before you buy." intro={<p>Type any NSE symbol. The analyzer runs fifteen standard checks — trend, momentum, risk, quality, valuation and liquidity — explains each one, and back-tests a monthly SIP in the stock against the Nifty 50.</p>} />
    <Card className="premium-card"><StockSearch universe={NIFTY500} autoFocus /><div className="mt-5 flex flex-wrap gap-2 text-sm">{popular.map((s) => <a key={s} href={`/tools/stock-analyzer/${s}`} className="rounded-full border border-white/12 px-3 py-1.5 text-white/70 hover:text-white">{s}</a>)}</div></Card>
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {[["Trend & momentum", "Price vs 50- and 200-day averages, 12-1 month momentum, RSI and distance from the 52-week high."], ["Risk", "Volatility, downside volatility, beta and correlation with the Nifty, 1-day Value-at-Risk, 3-year maximum drawdown, Sharpe and Sortino ratios."], ["Business & price", "Return on equity, debt/equity, margins and earnings growth; P/E against its industry and the Nifty; price/book; dividend yield; liquidity."]].map(([t, d]) => <Card key={t}><h2 className="font-semibold text-white">{t}</h2><p className="mt-2 text-sm leading-6 text-white/60">{d}</p></Card>)}
    </div>
  </>;
}

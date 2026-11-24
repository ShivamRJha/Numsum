import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookOpen, Gauge, Layers, LineChart, PieChart, Target } from "lucide-react";
import { ToolHeader } from "@/components/invest/tools-nav";
import { loadFundSummary, loadStockSummary } from "@/lib/invest/load";

export const metadata: Metadata = {
  title: "Money Lab — Goal Planner, Fund & Stock Research Toys | NumSum Labs",
  description: "Free research tools for Indian investors: goal-based SIP planner, mutual fund screener with expense ratios, Nifty 500 stock screener, stock analyzer with investor checklist, and portfolio diversification check.",
  alternates: { canonical: "/tools" },
};

const tools = [
  { href: "/tools/investment-planner", icon: Target, title: "Goal planner", text: "Inflation-adjusted target, required SIP with step-up, and an allocation that fits your timeline — exclude gold, debt or small caps, add direct stocks." },
  { href: "/tools/funds", icon: BarChart3, title: "Fund screener & compare", text: "Every direct-plan fund in 24 groups scored on expense ratio, consistency, downside risk and returns. Compare up to four side by side." },
  { href: "/tools/stocks", icon: Gauge, title: "Stock screener", text: "The Nifty 500 scored on trend, risk, quality, valuation and growth against industry peers, with ready-made screens." },
  { href: "/tools/stock-analyzer", icon: LineChart, title: "Stock analyzer", text: "Run the checks investors use before buying: 200-day trend, momentum, RSI, beta, drawdown, Sharpe, ROE, debt and P/E — plus a SIP back-test." },
  { href: "/tools/stock-sip", icon: Layers, title: "Stock SIP builder", text: "Pick your monthly amount, horizon, risk and style — get a diversified stock basket with reasons, a monthly split and a wait list of stocks that have risen too much." },
  { href: "/tools/methodology", icon: BookOpen, title: "How it works", text: "Data sources, cross-checks and backups, scoring weights, the heat measure, and every term explained simply and professionally." },
  { href: "/tools/portfolio", icon: PieChart, title: "Portfolio check", text: "Correlation matrix, portfolio volatility, diversification ratio and suggested risk-balanced weights for up to eight stocks." },
] as const;

export default async function ToolsHub() {
  const [funds, stocks] = await Promise.all([loadFundSummary(), loadStockSummary()]);
  const d = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
  return <>
    <ToolHeader eyebrow="Money Lab · our after-hours side project" title="Numbers for fun, off the clock." intro={<p>NumSum is an inspection engineering company; this corner is where we play with money maths in our spare time. Plan goals, screen funds and stocks, and run the standard checks before you invest — built for regular (SIP) investing over a year or more, on data refreshed and cross-checked every night from AMFI and NSE.</p>}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><p className="text-white/45">Funds scored</p><p className="mt-1 text-xl font-semibold">{funds?.fundCount?.toLocaleString("en-IN") ?? "—"}</p><p className="text-xs text-white/40">NAV {d(funds?.navDate)}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><p className="text-white/45">Stocks scored</p><p className="mt-1 text-xl font-semibold">{stocks?.count?.toLocaleString("en-IN") ?? "—"}</p><p className="text-xs text-white/40">Prices {d(stocks?.asOf)}</p></div>
      </div>
    </ToolHeader>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{tools.map(({ href, icon: Icon, title, text }) => <Link key={href} href={href} className="glass group rounded-3xl p-6 transition hover:-translate-y-0.5 hover:border-amber-100/40"><Icon className="text-amber-100" aria-hidden="true" /><h2 className="mt-4 text-xl font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-white/60">{text}</p><p className="mt-4 text-sm font-semibold text-amber-100 group-hover:text-white">Open →</p></Link>)}</div>
  </>;
}

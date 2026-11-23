import type { Metadata } from "next";
import { PlannerClient, type StockPick } from "@/components/invest/planner-client";
import { ToolHeader } from "@/components/invest/tools-nav";
import { loadFundSummary, loadStockSummary } from "@/lib/invest/load";
import { summaryFunds } from "@/lib/invest/types";

export const metadata: Metadata = {
  title: "Investment Planner — Goal SIP Calculator & Allocation | NumSum Labs",
  description: "Plan any goal: inflation-adjusted target, required SIP with step-up, an allocation that fits your timeline (exclude gold, debt or small caps, add direct stocks) and the best-scoring funds for each part.",
  alternates: { canonical: "/tools/investment-planner" },
  openGraph: { title: "NumSum Investment Planner", description: "Goal-based SIP planning with allocation, expense-ratio-aware fund picks and a direct-stock basket." },
};

export default async function InvestmentPlannerPage() {
  const [fundDoc, stockDoc] = await Promise.all([loadFundSummary(), loadStockSummary()]);
  const funds = summaryFunds(fundDoc);
  // A diversified basket: liquid, positively scored stocks, at most two per industry
  const perIndustry = new Map<string, number>();
  const picks: StockPick[] = [];
  for (const r of stockDoc?.rows || []) {
    if (picks.length >= 15) break;
    if ((r.sc ?? 0) < 57 || (r.liq ?? 0) < 5) continue;
    const n = perIndustry.get(r.i) || 0;
    if (n >= 2) continue;
    perIndustry.set(r.i, n + 1);
    picks.push({ s: r.s, n: r.n, i: r.i, sc: r.sc, sig: r.sig, v: r.v });
  }
  return <>
    <ToolHeader eyebrow="Goal planner" title="Plan a goal. See what it really takes." intro={<p>Enter what you are saving for and when. The planner adjusts the target for inflation, works out the monthly SIP you need, suggests an allocation for your timeline — which you can customise — and shows the best-scoring funds and stocks for each part.</p>} />
    <PlannerClient funds={funds} buckets={fundDoc?.buckets || {}} navDate={fundDoc?.navDate || null} picks={picks} stockAsOf={stockDoc?.asOf || null} />
  </>;
}

import type { Metadata } from "next";
import { FundScreenerClient } from "@/components/invest/fund-screener-client";
import { ToolHeader } from "@/components/invest/tools-nav";
import { loadFundSummary } from "@/lib/invest/load";
import { summaryFunds } from "@/lib/invest/types";

export const metadata: Metadata = {
  title: "Mutual Fund Screener & Comparison with Expense Ratios | NumSum Labs",
  description: "Every direct-plan mutual fund in 24 groups, scored on expense ratio, consistency, downside risk and returns. Filter, sort and compare up to four funds side by side.",
  alternates: { canonical: "/tools/funds" },
};

export default async function FundsPage() {
  const doc = await loadFundSummary();
  return <>
    <ToolHeader eyebrow="Fund screener" title="Find and compare mutual funds." intro={<p>Direct-plan, growth-option funds scored against their own group. Cost matters most: a fund must beat its peers by more than its extra expense ratio just to break even, so the expense ratio carries the largest weight.</p>} />
    <FundScreenerClient funds={summaryFunds(doc)} buckets={doc?.buckets || {}} navDate={doc?.navDate || null} methodology={doc?.methodology || ""} source={doc?.source || ""} />
  </>;
}

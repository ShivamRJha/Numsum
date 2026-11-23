import type { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { PlannerClient } from "@/components/invest/planner-client";
import { db } from "@/lib/firebase";
import { META_COLLECTION, SUMMARY_DOC, type FundSummaryDoc } from "@/lib/invest/types";

export const metadata: Metadata = {
  title: "Investment Planner — Goal SIP Calculator & Fund Scores | NumSum Labs",
  description: "Plan any goal: inflation-adjusted target, required SIP with step-up, an allocation that fits your timeline, and Indian mutual funds scored daily on consistency, risk and returns.",
  alternates: { canonical: "/tools/investment-planner" },
  openGraph: { title: "NumSum Investment Planner", description: "Goal-based SIP planning with allocation and daily-refreshed mutual fund scores." },
};

async function loadSummary(): Promise<FundSummaryDoc | null> {
  try {
    const snap = await getDoc(doc(db, META_COLLECTION, SUMMARY_DOC));
    return snap.exists() ? (snap.data() as FundSummaryDoc) : null;
  } catch {
    return null;
  }
}

export default async function InvestmentPlannerPage() {
  const summary = await loadSummary();
  return <main className="min-h-screen bg-navy px-6 py-12">
    <div className="mx-auto max-w-7xl">
      <p className="section-eyebrow">Tools · Investment planner</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] md:text-5xl">Plan a goal. See what it really takes.</h1>
      <p className="mt-4 max-w-3xl text-white/65">Enter what you are saving for and when. The planner adjusts the target for inflation, works out the monthly SIP you need, suggests an allocation that suits your timeline, and shows the funds that score best in each group on the latest data.</p>
      <div className="mt-10"><PlannerClient summary={summary} /></div>
    </div>
  </main>;
}

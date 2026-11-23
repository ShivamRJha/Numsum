"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/data-states";
import { Card } from "@/components/ui";
import { db } from "@/lib/firebase";
import { META_COLLECTION, STATUS_DOC, SUMMARY_DOC, type FundSummaryDoc, type RefreshStatusDoc } from "@/lib/invest/types";

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

export default function AdminMarketDataPage() {
  const [status, setStatus] = useState<RefreshStatusDoc | null>(null);
  const [summary, setSummary] = useState<FundSummaryDoc | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([getDoc(doc(db, META_COLLECTION, STATUS_DOC)), getDoc(doc(db, META_COLLECTION, SUMMARY_DOC))])
      .then(([s, f]) => { setStatus(s.exists() ? (s.data() as RefreshStatusDoc) : null); setSummary(f.exists() ? (f.data() as FundSummaryDoc) : null); })
      .catch(() => undefined).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingState label="Loading market data status" />;
  return <div className="space-y-6">
    <div><p className="text-sm uppercase tracking-[.3em] text-blue-300">Tools</p><h1 className="mt-2 font-display text-4xl">Market data</h1><p className="mt-2 text-white/60">Mutual-fund data behind the investment planner. It refreshes every night at 00:40 IST through the GitHub Actions workflow “Refresh market data”; run that workflow manually to refresh now.</p></div>
    <div className="grid gap-4 md:grid-cols-4">
      <Card><p className="text-xs uppercase tracking-[.16em] text-white/50">Last run</p><p className="mt-2 text-lg text-white">{fmt(status?.lastRunAt)}</p></Card>
      <Card><p className="text-xs uppercase tracking-[.16em] text-white/50">Result</p><p className={status?.ok ? "mt-2 text-lg text-emerald-200" : "mt-2 text-lg text-red-200"}>{status ? (status.ok ? "Success" : "Failed") : "Never run"}</p></Card>
      <Card><p className="text-xs uppercase tracking-[.16em] text-white/50">Funds scored</p><p className="mt-2 text-lg text-white">{summary?.fundCount?.toLocaleString("en-IN") ?? "—"}</p></Card>
      <Card><p className="text-xs uppercase tracking-[.16em] text-white/50">Latest NAV date</p><p className="mt-2 text-lg text-white">{summary?.navDate ?? "—"}</p></Card>
    </div>
    {status?.message && <Card><p className="text-sm text-white/70">{status.message}{status.failed ? ` · ${status.failed} funds could not be loaded` : ""}{status.durationSec ? ` · ${status.durationSec}s` : ""}</p></Card>}
    {summary && <Card><h2 className="font-display text-2xl">Groups</h2><div className="mt-4 grid gap-2 text-sm md:grid-cols-3">{Object.values(summary.buckets).map((b) => <div key={b.key} className="flex justify-between rounded-xl border border-white/10 px-3 py-2"><span>{b.label}</span><span className="text-white/55">{b.count}</span></div>)}</div></Card>}
  </div>;
}

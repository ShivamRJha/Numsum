"use client";

import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "@/components/data-states";
import { Card } from "@/components/ui";
import { db } from "@/lib/firebase";
import { refreshFundsNow, refreshStocksNow, restorePrevious } from "@/lib/invest/admin-refresh";
import { DataQuality } from "@/components/invest/data-quality";
import { META_COLLECTION, STATUS_DOC, STOCK_SUMMARY_DOC, SUMMARY_DOC, type FundSummaryDoc, type RefreshStatusDoc, type StockSummaryDoc } from "@/lib/invest/types";
import { cn } from "@/lib/utils";

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

type Job = "funds" | "stocks" | "both";

export default function AdminMarketDataPage() {
  const [status, setStatus] = useState<RefreshStatusDoc | null>(null);
  const [funds, setFunds] = useState<FundSummaryDoc | null>(null);
  const [stocks, setStocks] = useState<StockSummaryDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<Job | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [bar, setBar] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [s, f, st] = await Promise.all([STATUS_DOC, SUMMARY_DOC, STOCK_SUMMARY_DOC].map((id) => getDoc(doc(db, META_COLLECTION, id)).catch(() => null)));
    setStatus(s?.exists() ? (s.data() as RefreshStatusDoc) : null);
    setFunds(f?.exists() ? (f.data() as FundSummaryDoc) : null);
    setStocks(st?.exists() ? (st.data() as StockSummaryDoc) : null);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function run(job: Job) {
    setRunning(job); setError(""); setLog([]); setBar(null);
    const progress = (m: string, done?: number, total?: number) => { setLog((l) => (l[l.length - 1]?.split("…")[0] === m.split("…")[0] ? [...l.slice(0, -1), m] : [...l, m])); setBar(done !== undefined && total ? { done, total } : null); };
    try {
      if (job !== "stocks") await refreshFundsNow(progress);
      if (job !== "funds") await refreshStocksNow(progress);
      progress("Done. The tools now show the new data.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed.");
    } finally { setRunning(null); setBar(null); }
  }

  async function restore(kind: "funds" | "stocks") {
    if (!window.confirm(`Put back the previous ${kind} data? The current version becomes the backup, so you can switch back.`)) return;
    setError(""); setLog([`Restoring previous ${kind} data…`]);
    try { await restorePrevious(kind); setLog((l) => [...l, "Restored."]); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Restore failed."); }
  }

  if (loading) return <LoadingState label="Loading market data status" />;
  const card = "text-xs uppercase tracking-[.16em] text-white/50";
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm uppercase tracking-[.3em] text-blue-300">Tools</p><h1 className="mt-2 font-display text-4xl">Market data</h1><p className="mt-2 max-w-3xl text-white/60">Mutual-fund and stock data behind the investment tools. It refreshes automatically every night at 00:40 IST. Use “Refresh now” to fetch the latest data immediately — keep this tab open until it finishes (funds ~2 minutes, stocks ~3 minutes).</p></div>
      <div className="flex flex-wrap gap-2">
        {(["funds", "stocks", "both"] as Job[]).map((j) => <button key={j} type="button" disabled={Boolean(running)} onClick={() => run(j)} className={cn("rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50", j === "both" ? "bg-amber-100 text-black hover:bg-white" : "border border-white/15 text-white hover:border-white/40")}>{running === j ? "Refreshing…" : j === "both" ? "Refresh everything now" : `Refresh ${j} now`}</button>)}
      </div>
    </div>

    {(running || log.length > 0 || error) && <Card>
      {bar && <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-100 transition-all" style={{ width: `${Math.round((bar.done / bar.total) * 100)}%` }} /></div>}
      <ul className="space-y-1 font-mono text-xs text-white/70">{log.map((l, i) => <li key={i}>› {l}</li>)}</ul>
      {error && <p role="alert" className="mt-3 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
    </Card>}

    <div className="grid gap-4 md:grid-cols-4">
      <Card><p className={card}>Last refresh</p><p className="mt-2 text-lg text-white">{fmt(status?.lastRunAt)}</p><p className="mt-1 text-xs text-white/45">{status?.by || ""}</p></Card>
      <Card><p className={card}>Result</p><p className={status?.ok ? "mt-2 text-lg text-emerald-200" : "mt-2 text-lg text-red-200"}>{status ? (status.ok ? "Success" : "Failed") : "Never run"}</p><p className="mt-1 text-xs text-white/45">{status?.message}</p></Card>
      <Card><p className={card}>Funds</p><p className="mt-2 text-lg text-white">{funds?.fundCount?.toLocaleString("en-IN") ?? "—"}</p><p className="mt-1 text-xs text-white/45">NAV {funds?.navDate ?? "—"} · {funds?.withTer ?? 0} with expense ratio</p></Card>
      <Card><p className={card}>Stocks</p><p className="mt-2 text-lg text-white">{stocks?.count?.toLocaleString("en-IN") ?? "—"}</p><p className="mt-1 text-xs text-white/45">Prices {stocks?.asOf ?? "—"} · {stocks?.withFundamentals ?? 0} with fundamentals</p></Card>
    </div>

    <div className="grid gap-4 lg:grid-cols-2"><DataQuality title="Funds — data checks" checks={funds?.checks} updatedAt={funds?.updatedAt} /><DataQuality title="Stocks — data checks" checks={stocks?.checks} updatedAt={stocks?.updatedAt} /></div>
    <div className="flex flex-wrap gap-2 text-sm"><span className="text-white/50">Backups: every refresh keeps the previous version.</span><button type="button" disabled={Boolean(running)} onClick={() => restore("funds")} className="rounded-full border border-white/15 px-3 py-1.5 text-white/75 hover:border-white/40">Restore previous funds</button><button type="button" disabled={Boolean(running)} onClick={() => restore("stocks")} className="rounded-full border border-white/15 px-3 py-1.5 text-white/75 hover:border-white/40">Restore previous stocks</button></div>
    {funds && <Card><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Fund groups</h2><Link href="/tools/funds" className="text-sm text-blue-200 hover:text-white">Open fund screener →</Link></div><div className="mt-4 grid gap-2 text-sm md:grid-cols-3">{Object.values(funds.buckets).map((b) => <div key={b.key} className="flex justify-between rounded-xl border border-white/10 px-3 py-2"><span>{b.label}</span><span className="text-white/55">{b.count}</span></div>)}</div></Card>}
    {stocks && <Card><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Stock industries</h2><Link href="/tools/stocks" className="text-sm text-blue-200 hover:text-white">Open stock screener →</Link></div><div className="mt-4 grid gap-2 text-sm md:grid-cols-3">{Object.entries(stocks.industries).sort((a, b) => b[1].count - a[1].count).map(([k, v]) => <div key={k} className="flex justify-between rounded-xl border border-white/10 px-3 py-2"><span>{k}</span><span className="text-white/55">{v.count} · P/E {v.pe ? v.pe.toFixed(1) : "—"}</span></div>)}</div></Card>}
  </div>;
}

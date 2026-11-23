"use client";
/**
 * Admin "Refresh now": runs the market-data pipeline from the admin's browser.
 * The server routes fetch and compute (they need no secrets); the browser scores and saves to
 * Firestore with the admin's own sign-in, which the security rules already allow for system_documents.
 */
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { BUCKET_BY_KEY } from "./buckets";
import { buildFundSummary, scoreFunds, type FundCandidate, type FundStats } from "./funds-pipeline";
import { industryMedians, scoreStocks, STOCK_METHODOLOGY, type Fundamentals, type StockStats } from "./stocks";
import { META_COLLECTION, STATUS_DOC, STOCK_SUMMARY_DOC, SUMMARY_DOC, type RefreshStatusDoc, type StockSummaryDoc } from "./types";

export type Progress = (message: string, done?: number, total?: number) => void;

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Please sign in again.");
  const res = await fetch(path, { ...init, headers: { ...(init.headers || {}), authorization: `Bearer ${token}`, "content-type": "application/json" } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `${path} failed (HTTP ${res.status})`);
  return body as T;
}

async function inChunks<T, R>(items: T[], size: number, parallel: number, fn: (chunk: T[]) => Promise<R[]>, progress: (done: number) => void): Promise<R[]> {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  const out: R[] = [];
  let next = 0, done = 0;
  await Promise.all(Array.from({ length: Math.min(parallel, chunks.length) }, async () => {
    while (next < chunks.length) {
      const c = chunks[next++];
      let res: R[] = [];
      for (let attempt = 0; attempt < 2; attempt++) { try { res = await fn(c); break; } catch { await new Promise((r) => setTimeout(r, 1500)); } }
      out.push(...res);
      done += c.length; progress(done);
    }
  }));
  return out;
}

const clean = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/** Two passes: batches in parallel, then one slower retry of whatever is still missing. */
async function collect<T, R>(items: T[], key: (t: T) => string, rkey: (r: R) => string, fn: (chunk: T[]) => Promise<R[]>, label: string, progress: Progress, size: number) {
  const first = await inChunks(items, size, 5, fn, (d) => progress(`${label}… ${d}/${items.length}`, d, items.length));
  const got = new Set(first.map(rkey));
  const missing = items.filter((t) => !got.has(key(t)));
  if (!missing.length) return first;
  progress(`Retrying ${missing.length} that did not load…`, 0, missing.length);
  const second = await inChunks(missing, Math.max(5, Math.floor(size / 2)), 3, fn, (d) => progress(`Retrying… ${d}/${missing.length}`, d, missing.length));
  return [...first, ...second];
}

async function existingCount(id: string, field: "fundCount" | "count") {
  try { const s = await getDoc(doc(db, META_COLLECTION, id)); return s.exists() ? Number(s.data()[field]) || 0 : 0; } catch { return 0; }
}

async function writeStatus(patch: Partial<RefreshStatusDoc> & { message: string; ok: boolean }) {
  const s: RefreshStatusDoc = { lastRunAt: new Date().toISOString(), fundCount: 0, failed: 0, durationSec: 0, by: `admin ${auth.currentUser?.email || ""}`.trim(), ...patch };
  await setDoc(doc(db, META_COLLECTION, STATUS_DOC), clean(s)).catch(() => undefined);
}

export async function refreshFundsNow(progress: Progress) {
  const started = Date.now();
  progress("Downloading today's AMFI scheme list and expense ratios…");
  const { candidates, source } = await api<{ candidates: FundCandidate[]; source: string }>("/api/market/funds/candidates");
  if (candidates.length < 200) throw new Error(`Only ${candidates.length} schemes found in the AMFI file — keeping the current data.`);
  const stats = await collect(candidates, (c) => c.code, (s: FundStats) => s.code, async (chunk) => (await api<{ stats: FundStats[] }>("/api/market/funds/stats", { method: "POST", body: JSON.stringify({ candidates: chunk }) })).stats, "Fetching NAV history", progress, 20);
  const before = await existingCount(SUMMARY_DOC, "fundCount");
  if (stats.length < 200 || (before && stats.length < before * 0.85)) throw new Error(`Only ${stats.length} funds loaded (the current data has ${before}) — kept the current data. Please try again in a few minutes.`);
  progress("Scoring funds…");
  const { rows, buckets, latestT } = scoreFunds(stats);
  const summary = buildFundSummary(rows, buckets, latestT, `AMFI daily NAV file, AMFI TER tracker (expense ratios) and NAV history from api.mfapi.in — ${source.split("/").pop()}`);
  progress("Saving to the database…");
  await setDoc(doc(db, META_COLLECTION, SUMMARY_DOC), clean(summary));
  let detail = "";
  try {
    for (let i = 0; i < rows.length; i += 400) {
      const batch = writeBatch(db);
      for (const r of rows.slice(i, i + 400)) batch.set(doc(db, "market_funds", r.code), clean({ ...r, kind: BUCKET_BY_KEY[r.bucket]?.kind || "", updatedAt: summary.updatedAt }));
      await batch.commit();
    }
  } catch { detail = " (per-fund records skipped until the new database rules are published)"; }
  const msg = `Scored ${rows.length} funds (${summary.withTer} with expense ratio)${detail}`;
  await writeStatus({ ok: true, message: msg, fundCount: rows.length, failed: candidates.length - stats.length, durationSec: Math.round((Date.now() - started) / 1000) });
  progress(msg);
  return summary;
}

type StockItem = { symbol: string; stats: StockStats; fu: Fundamentals | null };

export async function refreshStocksNow(progress: Progress) {
  const started = Date.now();
  progress("Loading the Nifty 500 list…");
  const { universe, indexPe } = await api<{ universe: [string, string, string][]; indexPe: number | null }>("/api/market/universe");
  const items = await collect(universe.map((u) => u[0]), (s) => s, (x: StockItem) => x.symbol, async (chunk) => (await api<{ items: StockItem[] }>("/api/market/stocks/stats", { method: "POST", body: JSON.stringify({ symbols: chunk }) })).items, "Fetching prices and fundamentals", progress, 15);
  const before = await existingCount(STOCK_SUMMARY_DOC, "count");
  if (items.length < 300 || (before && items.length < before * 0.85)) throw new Error(`Only ${items.length} stocks loaded (the current data has ${before}) — kept the current data. Please try again in a few minutes.`);
  const meta = new Map(universe.map((u) => [u[0], u]));
  const rows = scoreStocks(items.map((x) => ({ stats: x.stats, fu: x.fu, name: meta.get(x.symbol)?.[1] || x.symbol, industry: meta.get(x.symbol)?.[2] || "Other" }))).sort((a, b) => (b.sc ?? -1) - (a.sc ?? -1));
  const summary: StockSummaryDoc = {
    version: 1, updatedAt: new Date().toISOString(), asOf: items.map((x) => x.stats.asOf).sort().pop() || "", count: rows.length,
    withFundamentals: rows.filter((r) => r.pe !== null || r.roe !== null).length, indexPe,
    source: "NSE daily prices (eod2 dataset, topped up from Yahoo Finance) and Yahoo Finance fundamentals", methodology: STOCK_METHODOLOGY, industries: industryMedians(rows), rows,
  };
  progress("Saving to the database…");
  await setDoc(doc(db, META_COLLECTION, STOCK_SUMMARY_DOC), clean(summary));
  const msg = `Scored ${rows.length} stocks (${summary.withFundamentals} with fundamentals)`;
  await writeStatus({ ok: true, message: msg, fundCount: 0, stockCount: rows.length, failed: universe.length - items.length, durationSec: Math.round((Date.now() - started) / 1000) });
  progress(msg);
  return summary;
}

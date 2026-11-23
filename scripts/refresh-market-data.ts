/**
 * Nightly market-data refresh for the NumSum investment tools (also runnable by hand).
 *
 *   npx tsx scripts/refresh-market-data.ts                 # funds + stocks → Firestore
 *   npx tsx scripts/refresh-market-data.ts --dry-run       # no Firestore; writes market-data.json
 *   --funds-only | --stocks-only | --limit=40
 *
 * Writes: market_funds/{schemeCode}, system_documents/market_fund_summary,
 *         system_documents/market_stock_summary, system_documents/market_refresh_status.
 * Credentials: Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS) for FIREBASE_PROJECT_ID.
 */
import { writeFileSync } from "node:fs";
import { BUCKET_BY_KEY } from "../lib/invest/buckets";
import { buildFundSummary, computeFundStats, scoreFunds, type FundStats } from "../lib/invest/funds-pipeline";
import { fetchBars, fetchFundCandidates, fetchIndex, fetchNavHistory, fetchUniverse, pool, YahooSession } from "../lib/invest/sources";
import { computeStockStats, industryMedians, scoreStocks, STOCK_METHODOLOGY, type Fundamentals, type StockStats } from "../lib/invest/stocks";
import { META_COLLECTION, STATUS_DOC, STOCK_SUMMARY_DOC, SUMMARY_DOC, type FundSummaryDoc, type RefreshStatusDoc, type StockSummaryDoc } from "../lib/invest/types";

const DRY = process.argv.includes("--dry-run");
const FUNDS = !process.argv.includes("--stocks-only");
const STOCKS = !process.argv.includes("--funds-only");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);
const MIN_FUNDS = LIMIT ? 1 : 200;
const MIN_STOCKS = LIMIT ? 1 : 300;

type DocRef = { set: (data: unknown, opts?: unknown) => Promise<unknown> };
type Batch = { set: (ref: DocRef, data: unknown) => void; delete: (ref: DocRef) => void; commit: () => Promise<unknown> };
type Col = { doc: (id: string) => DocRef; select: () => { get: () => Promise<{ docs: { id: string }[] }> } };
type Db = { collection: (name: string) => Col; batch: () => Batch };

async function firestore(): Promise<Db> {
  const { initializeApp, applicationDefault, getApps } = await import("firebase-admin/app");
  const { getFirestore } = (await import("firebase-admin/firestore")) as unknown as { getFirestore: () => Db };
  const projectId = [process.env.FIREBASE_PROJECT_ID, process.env.GOOGLE_CLOUD_PROJECT, process.env.GCLOUD_PROJECT].map((v) => (v || "").trim()).find(Boolean);
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID is not set.");
  if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId });
  return getFirestore();
}

async function refreshFunds() {
  let { candidates, source } = await fetchFundCandidates(MIN_FUNDS, console.log);
  if (LIMIT) candidates = candidates.slice(0, LIMIT);
  let done = 0;
  const stats = (await pool(candidates, 8, async (c) => {
    try { return computeFundStats(c, await fetchNavHistory(c.code)); } catch { return null; } finally { if (++done % 100 === 0) console.log(`  fund history ${done}/${candidates.length}`); }
  })).filter((x): x is FundStats => x !== null);
  console.log(`Funds: history for ${stats.length}/${candidates.length}`);
  if (stats.length < MIN_FUNDS) throw new Error(`Only ${stats.length} funds loaded — keeping the previous data.`);
  const { rows, buckets, latestT } = scoreFunds(stats);
  const summary = buildFundSummary(rows, buckets, latestT, `AMFI daily NAV file, AMFI TER tracker (expense ratios) and NAV history from api.mfapi.in — ${source.split("/").pop()}`);
  return { rows, summary, failed: candidates.length - stats.length };
}

async function refreshStocks() {
  let universe = await fetchUniverse();
  if (LIMIT) universe = universe.slice(0, LIMIT);
  const index = await fetchIndex();
  console.log(`Stocks: ${universe.length} in universe; Nifty P/E ${index.pe}`);
  let done = 0;
  const stats = await pool(universe, 8, async ([sym]) => {
    try { return computeStockStats(sym, await fetchBars(sym), index.bars); } catch { return null; } finally { if (++done % 100 === 0) console.log(`  stock history ${done}/${universe.length}`); }
  });
  const yahoo = new YahooSession();
  const yOk = await yahoo.init();
  console.log(`Yahoo fundamentals session: ${yOk ? "ok" : "unavailable"}`);
  const fund = yOk ? await pool(universe, 4, async ([sym], i) => (stats[i] ? yahoo.fundamentals(sym) : null)) : universe.map(() => null);
  const items = universe.map((u, i) => ({ stats: stats[i] as StockStats, fu: fund[i] as Fundamentals | null, name: u[1], industry: u[2] })).filter((x) => x.stats);
  if (items.length < MIN_STOCKS) throw new Error(`Only ${items.length} stocks loaded — keeping the previous data.`);
  const rows = scoreStocks(items).sort((a, b) => (b.sc ?? -1) - (a.sc ?? -1));
  const asOf = items.map((x) => x.stats.asOf).sort().pop() || "";
  const summary: StockSummaryDoc = {
    version: 1, updatedAt: new Date().toISOString(), asOf, count: rows.length, withFundamentals: rows.filter((r) => r.pe !== null || r.roe !== null).length,
    indexPe: index.pe, source: "NSE daily prices (eod2 dataset, topped up from Yahoo Finance) and Yahoo Finance fundamentals", methodology: STOCK_METHODOLOGY,
    industries: industryMedians(rows), rows,
  };
  return { summary, failed: universe.length - items.length };
}

async function main() {
  const started = Date.now();
  const out: { funds?: Awaited<ReturnType<typeof refreshFunds>>; stocks?: Awaited<ReturnType<typeof refreshStocks>> } = {};
  const errors: string[] = [];
  if (FUNDS) { try { out.funds = await refreshFunds(); } catch (e) { errors.push(`Funds: ${(e as Error).message}`); console.error(e); } }
  if (STOCKS) { try { out.stocks = await refreshStocks(); } catch (e) { errors.push(`Stocks: ${(e as Error).message}`); console.error(e); } }
  const durationSec = Math.round((Date.now() - started) / 1000);
  const parts = [out.funds && `${out.funds.summary.fundCount} funds (${out.funds.summary.withTer} with expense ratio)`, out.stocks && `${out.stocks.summary.count} stocks (${out.stocks.summary.withFundamentals} with fundamentals)`].filter(Boolean);
  const status: RefreshStatusDoc = { lastRunAt: new Date().toISOString(), ok: errors.length === 0, message: [parts.length ? `Scored ${parts.join(" and ")}` : "", ...errors].filter(Boolean).join(" · "), fundCount: out.funds?.summary.fundCount || 0, stockCount: out.stocks?.summary.count || 0, failed: (out.funds?.failed || 0) + (out.stocks?.failed || 0), durationSec, by: "nightly job" };
  console.log(status.message, `(${durationSec}s)`);

  if (DRY) { writeFileSync("market-data.json", JSON.stringify({ funds: out.funds?.summary, stocks: out.stocks?.summary }, null, 1)); console.log("Dry run: wrote market-data.json"); }
  else {
    const db = await firestore();
    if (out.funds) {
      const col = db.collection("market_funds");
      const existing = new Set((await col.select().get()).docs.map((d) => d.id));
      const keep = new Set(out.funds.rows.map((r) => r.code));
      let batch = db.batch(), n = 0;
      const flush = async () => { if (n) { await batch.commit(); batch = db.batch(); n = 0; } };
      for (const row of out.funds.rows) { batch.set(col.doc(row.code), { ...row, kind: BUCKET_BY_KEY[row.bucket]?.kind || "", updatedAt: out.funds.summary.updatedAt }); if (++n >= 400) await flush(); }
      for (const id of existing) if (!keep.has(id)) { batch.delete(col.doc(id)); if (++n >= 400) await flush(); }
      await flush();
      await db.collection(META_COLLECTION).doc(SUMMARY_DOC).set(JSON.parse(JSON.stringify(out.funds.summary satisfies FundSummaryDoc)));
    }
    if (out.stocks) await db.collection(META_COLLECTION).doc(STOCK_SUMMARY_DOC).set(JSON.parse(JSON.stringify(out.stocks.summary)));
    await db.collection(META_COLLECTION).doc(STATUS_DOC).set(status);
    console.log("Firestore updated.");
  }
  if (errors.length) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });

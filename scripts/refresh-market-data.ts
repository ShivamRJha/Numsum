/**
 * Daily mutual-fund data refresh for the NumSum investment planner.
 *
 *   npx tsx scripts/refresh-market-data.ts            # fetch, score and write to Firestore
 *   npx tsx scripts/refresh-market-data.ts --dry-run  # fetch and score only; writes market-data.json
 *   --limit=40                                        # only the first N funds (testing)
 *
 * Sources: AMFI daily NAV file (scheme list, categories, latest NAV) and api.mfapi.in (NAV history).
 * Writes: market_funds/{schemeCode}, market_meta/fund_summary, market_meta/refresh_status.
 * Credentials: Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS) for FIREBASE_PROJECT_ID.
 */
import { writeFileSync } from "node:fs";
import { BUCKETS, BUCKET_BY_KEY, classifyScheme, type FundKind } from "../lib/invest/buckets";
import { annualVol, cagr, historyYears, maxDrawdown, median, monthEnds, monthKeys, monthlyReturns, parseMfapiHistory, percentiles, sortino, std, weighted, type NavPoint } from "../lib/invest/metrics";
import type { BucketSummary, FundRow, FundSummaryDoc, RefreshStatusDoc } from "../lib/invest/types";

const AMFI_URLS = ["https://portal.amfiindia.com/spages/NAVAll.txt", "https://www.amfiindia.com/spages/NAVAll.txt"];
const MFAPI = (code: string) => `https://api.mfapi.in/mf/${code}`;
const DRY = process.argv.includes("--dry-run");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);
const MIN_FUNDS = LIMIT ? 1 : 200; // refuse to overwrite good data with a broken fetch
const TOP_N = 25;

type Candidate = { code: string; name: string; amc: string; bucket: string; nav: number; navDate: string };
type Loaded = Candidate & { series: NavPoint[] };

async function fetchText(url: string, tries = 3): Promise<string> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "NumSumLabs-MarketData/1.0 (+https://www.numsum.in)" }, signal: AbortSignal.timeout(45_000) });
      if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
      return await res.text();
    } catch (err) { last = err; await new Promise((r) => setTimeout(r, 1500 * (i + 1))); }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

function parseAmfiDate(value: string) {
  const d = new Date(`${value.trim()} UTC`); // e.g. "21-Nov-2026"
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const [dd, mon, yy] = value.trim().split("-");
  const t = Date.parse(`${mon} ${dd}, ${yy} UTC`);
  return Number.isNaN(t) ? "" : new Date(t).toISOString().slice(0, 10);
}

export function parseAmfi(text: string): Candidate[] {
  const out: Candidate[] = [];
  let header = "", amc = "";
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/Schemes\s*\(/i.test(line) && !line.includes(";")) { header = line; continue; }
    if (!line.includes(";")) { amc = line; continue; }
    const parts = line.split(";");
    if (parts.length < 6 || !/^\d+$/.test(parts[0].trim())) continue;
    const [code, , , name, navStr, date] = parts.map((p) => p.trim());
    const nav = Number(navStr);
    const bucket = classifyScheme(header, name);
    if (!bucket || !(nav > 0)) continue;
    out.push({ code, name, amc, bucket: bucket.key, nav, navDate: parseAmfiDate(date) });
  }
  return out;
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i]); }
  }));
  return results;
}

async function loadHistory(c: Candidate): Promise<Loaded | null> {
  try {
    const json = JSON.parse(await fetchText(MFAPI(c.code))) as { data?: { date: string; nav: string }[] };
    const series = parseMfapiHistory(json.data || []);
    return series.length >= 30 ? { ...c, series } : null;
  } catch { return null; }
}

const r4 = (x: number | null) => (x === null || !Number.isFinite(x) ? null : Math.round(x * 1e4) / 1e4);

function scoreWeights(kind: FundKind, f: Record<string, number | null>): [string, number, boolean][] {
  // metric, weight, lowerIsBetter
  switch (kind) {
    case "active": return [["consistency", 30, false], ["mdd5", 15, false], ["sortino3", 15, false], ["cagr3", 10, false], ["cagr5", 10, false], ["cagr1", 10, false], ["yearsCapped", 10, false]];
    case "passive":
    case "gold": return [[f.cagr3 !== null ? "cagr3" : "cagr1", 40, false], ["tracking", 40, true], ["yearsCapped", 20, false]];
    case "arbitrage": return [["cagr3", 40, false], ["cagr1", 10, false], ["vol3", 30, true], ["yearsCapped", 20, false]];
    case "debt": return [["cagr3", 35, false], ["cagr1", 15, false], ["vol3", 25, true], ["mdd5", 5, false], ["yearsCapped", 20, false]];
  }
}

export function scoreAll(loaded: Loaded[]): { rows: FundRow[]; buckets: Record<string, BucketSummary>; latestT: number } {
  const latestT = Math.max(...loaded.map((f) => f.series[f.series.length - 1].t));
  const keys61 = monthKeys(latestT, 61);
  const keys37 = keys61.slice(-37);
  const rows: FundRow[] = [];
  const buckets: Record<string, BucketSummary> = {};

  for (const def of BUCKETS) {
    const funds = loaded.filter((f) => f.bucket === def.key && f.series[f.series.length - 1].t >= latestT - 20 * 864e5); // drop stale/closed schemes
    if (!funds.length) continue;
    const me = funds.map((f) => monthEnds(f.series, 62));
    // Rolling 12-month returns for consistency (last 49 windows)
    const roll = me.map((m) => keys61.map((k, i) => { if (i < 12) return null; const a = m.get(keys61[i - 12]), b = m.get(k); return a && b ? b / a - 1 : null; }));
    const rollMed = keys61.map((_, i) => median(roll.map((r) => r[i]).filter((x): x is number => x !== null)));
    const mret = me.map((m) => monthlyReturns(m, keys37));
    const mretMed = keys37.map((_, i) => median(mret.map((r) => r[i]).filter((x): x is number => x !== null)));

    const metrics = funds.map((f, fi) => {
      const years = historyYears(f.series);
      const windows = roll[fi].map((r, i) => (r !== null && rollMed[i] !== null ? (r >= (rollMed[i] as number) ? 1 : 0) : null)).filter((x): x is 0 | 1 => x !== null);
      const diffs = mret[fi].map((r, i) => (r !== null && mretMed[i] !== null ? r - (mretMed[i] as number) : null)).filter((x): x is number => x !== null);
      const sd = diffs.length >= 12 ? std(diffs) : null;
      return {
        years,
        yearsCapped: Math.min(years, 10),
        cagr1: cagr(f.series, 1), cagr3: cagr(f.series, 3), cagr5: cagr(f.series, 5),
        vol3: annualVol(monthlyReturns(me[fi], keys37)),
        mdd5: maxDrawdown(f.series, 5),
        sortino3: sortino(monthlyReturns(me[fi], keys37)),
        consistency: windows.length >= 24 ? windows.reduce((s: number, x) => s + x, 0) / windows.length : null,
        tracking: def.kind === "passive" || def.kind === "gold" ? (sd === null ? null : sd * Math.sqrt(12)) : null,
      } as Record<string, number | null> & { years: number };
    });

    const metricNames = ["consistency", "mdd5", "sortino3", "cagr1", "cagr3", "cagr5", "yearsCapped", "tracking", "vol3"];
    const pct: Record<string, (number | null)[]> = {};
    for (const m of metricNames) {
      pct[`${m}:hi`] = percentiles(metrics.map((x) => x[m] ?? null), false);
      pct[`${m}:lo`] = percentiles(metrics.map((x) => x[m] ?? null), true);
    }

    const scored = funds.map((f, i) => {
      const w = scoreWeights(def.kind, metrics[i]);
      const parts = w.map(([m, wt, lo]) => [pct[`${m}:${lo ? "lo" : "hi"}`][i], wt] as [number | null, number]);
      const { score, coverage } = weighted(parts);
      const years = metrics[i].years;
      const maturity = Math.min(1, years / 3);
      const cov = Math.min(1, coverage / 0.8);
      const robust = score === null ? null : 50 + (score - 50) * maturity * cov;
      const confidence: FundRow["confidence"] = years >= 5 && coverage >= 0.9 ? "High" : years >= 3 && coverage >= 0.6 ? "Medium" : "Low";
      return { f, m: metrics[i], score: robust === null ? null : Math.round(robust * 10) / 10, coverage: Math.round(coverage * 100) / 100, confidence };
    }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    scored.forEach((s, rank) => rows.push({
      code: s.f.code, name: s.f.name, amc: s.f.amc, bucket: def.key, nav: s.f.nav, navDate: s.f.navDate,
      years: Math.round(s.m.years * 10) / 10,
      cagr1: r4(s.m.cagr1), cagr3: r4(s.m.cagr3), cagr5: r4(s.m.cagr5), vol3: r4(s.m.vol3), mdd5: r4(s.m.mdd5), sortino3: r4(s.m.sortino3),
      consistency: r4(s.m.consistency), tracking: r4(s.m.tracking),
      score: s.score, coverage: s.coverage, confidence: s.confidence, rank: rank + 1,
    }));

    const med = (k: string) => r4(median(metrics.map((x) => x[k]).filter((x): x is number => x !== null)));
    buckets[def.key] = {
      key: def.key, label: def.label, kind: def.kind, asset: def.asset, count: funds.length,
      median: { cagr1: med("cagr1"), cagr3: med("cagr3"), cagr5: med("cagr5"), vol3: med("vol3") },
      top: rows.filter((r) => r.bucket === def.key).slice(0, TOP_N).map((r) => ({ c: r.code, n: r.name, s: r.score, r: r.rank, c1: r.cagr1, c3: r.cagr3, c5: r.cagr5, v: r.vol3, dd: r.mdd5, y: r.years, cf: r.confidence })),
    };
  }
  return { rows, buckets, latestT };
}

type DocRef = { set: (data: unknown) => Promise<unknown> };
type Batch = { set: (ref: DocRef, data: unknown) => void; delete: (ref: DocRef) => void; commit: () => Promise<unknown> };
type Col = { doc: (id: string) => DocRef; select: () => { get: () => Promise<{ docs: { id: string }[] }> } };
type Db = { collection: (name: string) => Col; batch: () => Batch };

async function firestore(): Promise<Db> {
  const { initializeApp, applicationDefault, getApps } = await import("firebase-admin/app");
  const { getFirestore } = (await import("firebase-admin/firestore")) as unknown as { getFirestore: () => Db };
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID is not set.");
  if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId });
  return getFirestore();
}

async function main() {
  const started = Date.now();
  let text = "";
  for (const url of AMFI_URLS) { try { text = await fetchText(url); if (text.length > 100_000) break; } catch (err) { console.warn(`AMFI fetch failed: ${(err as Error).message}`); } }
  if (!text) throw new Error("Could not download the AMFI NAV file.");
  let candidates = parseAmfi(text);
  console.log(`AMFI: ${candidates.length} schemes in planner buckets`);
  if (LIMIT) candidates = candidates.slice(0, LIMIT);

  let done = 0;
  const loaded = (await pool(candidates, 8, async (c) => { const r = await loadHistory(c); if (++done % 100 === 0) console.log(`  history ${done}/${candidates.length}`); return r; })).filter((x): x is Loaded => x !== null);
  const failed = candidates.length - loaded.length;
  console.log(`History loaded for ${loaded.length} funds (${failed} failed)`);
  if (loaded.length < MIN_FUNDS) throw new Error(`Only ${loaded.length} funds loaded — keeping the previous data.`);

  const { rows, buckets, latestT } = scoreAll(loaded);
  const summary: FundSummaryDoc = {
    updatedAt: new Date().toISOString(), navDate: new Date(latestT).toISOString().slice(0, 10), fundCount: rows.length,
    source: "AMFI daily NAV file and NAV history from api.mfapi.in (direct plans, growth option)",
    methodology: "Funds are scored 0–100 against others in the same bucket. Active: consistency vs peers 30, downside (max drawdown 15, Sortino 15), returns 1/3/5y 30, track record 10. Index & gold: returns vs same-index peers 40 (a proxy for lower cost), tracking vs peers 40, track record 20. Debt & arbitrage: returns, stability and track record. Young funds and thin data are pulled toward 50.",
    buckets,
  };
  const durationSec = Math.round((Date.now() - started) / 1000);
  const status: RefreshStatusDoc = { lastRunAt: summary.updatedAt, ok: true, message: `Scored ${rows.length} funds in ${Object.keys(buckets).length} buckets`, fundCount: rows.length, failed, durationSec };

  if (DRY) {
    writeFileSync("market-data.json", JSON.stringify({ summary, rows }, null, 1));
    console.log(`Dry run: wrote market-data.json (${rows.length} funds). ${status.message}`);
    return;
  }

  const db = await firestore();
  const col = db.collection("market_funds");
  const existing = new Set((await col.select().get()).docs.map((d) => d.id));
  const keep = new Set(rows.map((r) => r.code));
  let batch = db.batch(), n = 0;
  const flush = async () => { if (n) { await batch.commit(); batch = db.batch(); n = 0; } };
  for (const row of rows) { batch.set(col.doc(row.code), { ...row, kind: BUCKET_BY_KEY[row.bucket]?.kind || "", updatedAt: summary.updatedAt }); if (++n >= 400) await flush(); }
  for (const id of existing) if (!keep.has(id)) { batch.delete(col.doc(id)); if (++n >= 400) await flush(); }
  await flush();
  await db.collection("market_meta").doc("fund_summary").set(summary);
  await db.collection("market_meta").doc("refresh_status").set(status);
  console.log(`Firestore updated. ${status.message} (${durationSec}s)`);
}

const isMain = process.argv[1] && /refresh-market-data\.ts$/.test(process.argv[1]);
if (isMain) {
  main().catch(async (err) => {
    console.error(err);
    if (!DRY) {
      try {
        const db = await firestore();
        await db.collection("market_meta").doc("refresh_status").set({ lastRunAt: new Date().toISOString(), ok: false, message: String((err as Error).message || err).slice(0, 500), fundCount: 0, failed: 0, durationSec: 0 } satisfies RefreshStatusDoc);
      } catch { /* status write is best-effort */ }
    }
    process.exit(1);
  });
}

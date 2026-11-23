/**
 * Network fetchers for market data (server / Node only: Vercel functions, GitHub Actions).
 * All sources are public: AMFI, the AMFI TER tracker, api.mfapi.in, the eod2 NSE dataset and Yahoo Finance.
 */
import { attachTer, parseAmfi, parseTer, type FundCandidate } from "./funds-pipeline";
import { parseMfapiHistory, type NavPoint } from "./metrics";
import { parseEodCsv, type Bar, type Fundamentals } from "./stocks";
import universe from "./nifty500.json";

const UA = "Mozilla/5.0 (compatible; NumSumLabs-MarketData/1.1; +https://www.numsum.in)";
export const AMFI_URLS = ["https://portal.amfiindia.com/spages/NAVAll.txt", "https://www.amfiindia.com/spages/NAVAll.txt", "https://portal.amfiindia.com/spages/Original_NAVAll.txt"];
export const TER_URL = "https://raw.githubusercontent.com/captn3m0/india-mutual-fund-ter-tracker/main/data.csv";
const EOD = (name: string) => `https://raw.githubusercontent.com/BennyThadikaran/eod2_data/main/daily/${encodeURIComponent(name.toLowerCase())}.csv`;

export async function fetchText(url: string, { tries = 3, timeout = 30_000, headers = {} as Record<string, string> } = {}): Promise<string> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, ...headers }, signal: AbortSignal.timeout(timeout), cache: "no-store" });
      if (res.status === 404) throw Object.assign(new Error(`${url} → 404`), { fatal: true });
      if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      last = err;
      if ((err as { fatal?: boolean }).fatal) break;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

export async function pool<T, R>(items: T[], size: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => { while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); } }));
  return results;
}

/* ----------------------------------------------------------------- funds */

export async function fetchFundCandidates(minCount = 200, log: (m: string) => void = () => {}): Promise<{ candidates: FundCandidate[]; source: string }> {
  let best: ReturnType<typeof parseAmfi> = [], source = "";
  for (const url of AMFI_URLS) {
    try {
      const parsed = parseAmfi(await fetchText(url, { timeout: 45_000 }));
      log(`AMFI ${url}: ${parsed.length} schemes in planner groups`);
      if (parsed.length > best.length) { best = parsed; source = url; }
      if (parsed.length >= minCount) break;
    } catch (err) { log(`AMFI ${url} failed: ${(err as Error).message}`); }
  }
  let ter = new Map<string, number>();
  try { ter = parseTer(await fetchText(TER_URL, { timeout: 45_000 })); log(`Expense ratios: ${ter.size} schemes`); } catch (err) { log(`Expense ratios failed: ${(err as Error).message}`); }
  return { candidates: attachTer(best, ter), source };
}

export async function fetchNavHistory(code: string): Promise<NavPoint[]> {
  const json = JSON.parse(await fetchText(`https://api.mfapi.in/mf/${code}`, { tries: 3, timeout: 25_000 })) as { data?: { date: string; nav: string }[] };
  return parseMfapiHistory(json.data || []);
}

/* ----------------------------------------------------------------- stocks */

export type UniverseRow = [symbol: string, name: string, industry: string];
export const NIFTY500 = universe as UniverseRow[];
export const UNIVERSE_BY_SYMBOL = new Map(NIFTY500.map((u) => [u[0], u]));

/** NSE daily bars from the eod2 dataset, topped up with recent Yahoo closes when eod2 lags. */
export async function fetchBars(symbol: string, { topUp = true } = {}): Promise<Bar[]> {
  const bars = parseEodCsv(await fetchText(EOD(symbol), { tries: 2, timeout: 25_000 }));
  if (!topUp || !bars.length) return bars;
  const lagDays = (Date.now() - bars[bars.length - 1].t) / 864e5;
  if (lagDays < 2) return bars;
  try {
    const recent = await yahooChart(`${symbol}.NS`, "1mo");
    const last = bars[bars.length - 1].t;
    // Guard against an unadjusted split between the two sources
    const overlap = recent.find((b) => Math.abs(b.t - last) < 864e5);
    if (overlap && Math.abs(overlap.c / bars[bars.length - 1].c - 1) > 0.15) return bars;
    return [...bars, ...recent.filter((b) => b.t > last + 864e5 / 2)];
  } catch { return bars; }
}

/** Nifty 50 bars and its latest P/E (eod2 keeps P/E for indices). */
export async function fetchIndex(): Promise<{ bars: Bar[]; pe: number | null }> {
  const text = await fetchText(EOD("nifty 50"), { tries: 2, timeout: 25_000 });
  const bars = parseEodCsv(text);
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const iPe = head.findIndex((h) => h === "p/e" || h === "pe");
  const lastRow = lines[lines.length - 1].split(",");
  const pe = iPe >= 0 ? Number(lastRow[iPe]) || null : Number(lastRow[6]) || null;
  let merged = bars;
  try { const recent = await yahooChart("^NSEI", "1mo"); const last = bars[bars.length - 1]?.t || 0; merged = [...bars, ...recent.filter((b) => b.t > last + 864e5 / 2)]; } catch { /* eod2 only */ }
  return { bars: merged, pe };
}

export async function yahooChart(ySymbol: string, range = "1mo"): Promise<Bar[]> {
  const json = JSON.parse(await fetchText(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?range=${range}&interval=1d`, { tries: 2, timeout: 15_000 }));
  const r = json?.chart?.result?.[0];
  const ts: number[] = r?.timestamp || [];
  const close: (number | null)[] = r?.indicators?.quote?.[0]?.close || [];
  const vol: (number | null)[] = r?.indicators?.quote?.[0]?.volume || [];
  const istDay = (t: number) => { const d = new Date((t + 19_800) * 1000); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };
  return ts.map((t, i) => ({ t: istDay(t), c: close[i] as number, v: vol[i] || 0 })).filter((b) => b.c > 0);
}

/** Yahoo needs a cookie + crumb for quoteSummary. One session is reused for many symbols. */
export class YahooSession {
  private cookie = "";
  private crumb = "";
  async init() {
    try {
      const res = await fetch("https://fc.yahoo.com", { headers: { "user-agent": UA }, redirect: "manual", signal: AbortSignal.timeout(10_000) });
      const set = res.headers.get("set-cookie") || "";
      this.cookie = set.split(/,(?=\s*\w+=)/).map((c) => c.split(";")[0]).join("; ");
      const cr = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", { headers: { "user-agent": UA, cookie: this.cookie }, signal: AbortSignal.timeout(10_000) });
      this.crumb = cr.ok ? (await cr.text()).trim() : "";
    } catch { this.crumb = ""; }
    return Boolean(this.crumb);
  }
  async fundamentals(symbol: string): Promise<Fundamentals | null> {
    if (!this.crumb) return null;
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(`${symbol}.NS`)}?modules=summaryDetail,financialData,defaultKeyStatistics,price&crumb=${encodeURIComponent(this.crumb)}`;
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, cookie: this.cookie }, signal: AbortSignal.timeout(12_000) });
      if (!res.ok) return null;
      const r = (await res.json())?.quoteSummary?.result?.[0];
      if (!r) return null;
      const v = (x: { raw?: number } | undefined) => (x && typeof x.raw === "number" && Number.isFinite(x.raw) ? x.raw : null);
      const de = v(r.financialData?.debtToEquity);
      const mcap = v(r.price?.marketCap) ?? v(r.summaryDetail?.marketCap);
      return {
        name: r.price?.longName || r.price?.shortName || undefined,
        pe: v(r.summaryDetail?.trailingPE), pb: v(r.defaultKeyStatistics?.priceToBook), roe: v(r.financialData?.returnOnEquity),
        de: de === null ? null : de / 100, divYield: v(r.summaryDetail?.dividendYield), margin: v(r.financialData?.profitMargins),
        revGrowth: v(r.financialData?.revenueGrowth), epsGrowth: v(r.financialData?.earningsGrowth), mcapCr: mcap === null ? null : Math.round(mcap / 1e7), source: "Yahoo Finance",
      };
    } catch { return null; }
  }
}

/** Best-effort refresh of the Nifty 500 list from NSE indices; falls back to the bundled list. */
export async function fetchUniverse(): Promise<UniverseRow[]> {
  for (const url of ["https://www.niftyindices.com/IndexConstituent/ind_nifty500list.csv", "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv"]) {
    try {
      const text = await fetchText(url, { tries: 1, timeout: 15_000, headers: { referer: "https://www.niftyindices.com/" } });
      const rows = text.trim().split(/\r?\n/).slice(1).map((l) => l.split(",")).filter((p) => p.length >= 3 && p[2]);
      if (rows.length > 400) return rows.map((p) => [p[2].trim(), p[0].trim().replace(/ Ltd\.?$| Limited$/i, ""), p[1].trim()]);
    } catch { /* try next */ }
  }
  return NIFTY500;
}

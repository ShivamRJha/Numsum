/**
 * Mutual-fund pipeline shared by the nightly job, the admin "Refresh now" button and the API routes.
 * Phase 1 (per fund, server): computeFundStats(candidate, navHistory)
 * Phase 2 (cross-section, anywhere): scoreFunds(stats) → rows + bucket summaries
 */
import { BUCKETS, BUCKET_BY_KEY, classifyScheme, type FundKind } from "./buckets";
import { annualVol, cagr, historyYears, maxDrawdown, median, monthEnds, monthKeys, monthlyReturns, percentiles, sortino, std, weighted, type NavPoint } from "./metrics";
import type { BucketSummary, DataCheck, FundLite, FundRow, FundSummaryDoc } from "./types";

export type FundCandidate = { code: string; name: string; amc: string; bucket: string; nav: number; navDate: string; ter: number | null };

export type FundStats = FundCandidate & {
  latestT: number;
  years: number;
  cagr1: number | null; cagr3: number | null; cagr5: number | null;
  vol3: number | null; mdd5: number | null; sortino3: number | null;
  /** Month-end NAVs for the last ~62 months, [YYYY-MM, nav]. */
  me: [string, number][];
  /** Latest NAV in the history vs the AMFI file: "agree", "differ" or "unverified" (different dates). */
  chk?: "agree" | "differ" | "unverified";
};

/* ----------------------------------------------------------------- AMFI file */

function parseAmfiDate(value: string) {
  const t = Date.parse(`${value.trim().replace(/-/g, " ")} UTC`);
  return Number.isNaN(t) ? "" : new Date(t).toISOString().slice(0, 10);
}

/**
 * Parses the AMFI NAV file — the classic layout (";" rows under "Open Ended Schemes(…)" headers and
 * fund-house lines) and newer layouts that use "|" and/or carry category / fund-house columns.
 */
export function parseAmfi(text: string): Omit<FundCandidate, "ter">[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sample = lines.slice(0, 80).join("\n");
  const delim = (sample.match(/\|/g) || []).length > (sample.match(/;/g) || []).length ? "|" : ";";
  const headerLine = lines.find((l) => /scheme\s*code/i.test(l) && l.includes(delim));
  const cols = (headerLine || "Scheme Code;ISIN;ISIN2;Scheme Name;Net Asset Value;Date").split(delim).map((c) => c.trim().toLowerCase());
  const find = (...tests: RegExp[]) => cols.findIndex((c) => tests.some((t) => t.test(c)));
  const iCode = Math.max(0, find(/scheme\s*code/));
  const iName = find(/scheme\s*name/) >= 0 ? find(/scheme\s*name/) : 3;
  const iNav = find(/net\s*asset\s*value/, /^nav$/) >= 0 ? find(/net\s*asset\s*value/, /^nav$/) : 4;
  const iDate = find(/date/) >= 0 ? find(/date/) : 5;
  const iCats = cols.map((c, k) => (/(category|scheme\s*type|sub.?type|class)/.test(c) ? k : -1)).filter((k) => k >= 0);
  const iAmc = find(/(amc|fund\s*house|mutual\s*fund\s*name)/);

  const out: Omit<FundCandidate, "ter">[] = [];
  let header = "", amc = "";
  for (const line of lines) {
    if (line === headerLine) continue;
    if (!line.includes(delim)) {
      if (/schemes?\s*\(/i.test(line)) header = line; else amc = line;
      continue;
    }
    const parts = line.split(delim).map((x) => x.trim());
    const code = parts[iCode];
    if (!/^\d+$/.test(code || "")) continue;
    const name = parts[iName] || "";
    const nav = Number((parts[iNav] || "").replace(/,/g, ""));
    const bucket = classifyScheme([header, ...iCats.map((k) => parts[k] || "")].join(" "), name);
    if (!bucket || !(nav > 0)) continue;
    out.push({ code, name, amc: (iAmc >= 0 ? parts[iAmc] : "") || amc, bucket: bucket.key, nav, navDate: parseAmfiDate(parts[iDate] || "") });
  }
  return out;
}

/* ----------------------------------------------------------------- expense ratios */

/** Minimal RFC-4180 CSV reader. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

const DROP = /\b(direct|plan|growth|option|regular|fund|scheme|the|of|and|g|gr|nav|cumulative)\b/g;
/** Name key that matches an AMFI plan name ("X Fund - Direct Plan - Growth") to the base scheme name ("X Fund"). */
export function schemeKey(name: string) {
  return name.toLowerCase().replace(/&/g, " and ").replace(/\(.*?\)/g, " ").replace(DROP, " ").replace(/[^a-z0-9]/g, "");
}

/**
 * Expense ratios from the public AMFI TER tracker. Cost = base expense ratio + 18% GST (the management cost);
 * brokerage and transaction costs are excluded because they are not comparable across categories.
 */
export function parseTer(csvText: string): Map<string, number> {
  const rows = parseCsv(csvText);
  const head = rows[0]?.map((h) => h.trim()) || [];
  const col = (label: string) => head.findIndex((h) => h.toLowerCase() === label.toLowerCase());
  const iName = col("Scheme Name");
  const cost = (r: string[], plan: "Direct" | "Regular") => {
    const ber = Number(r[col(`${plan} Plan - Base Expense Ratio (BER) (%)`)]);
    if (Number.isFinite(ber) && ber > 0) return Math.round(ber * 1.18 * 1000) / 1000;
    const tot = Number(r[col(`${plan} Plan - Total TER (%)`)]);
    return Number.isFinite(tot) && tot > 0 ? tot : null;
  };
  const out = new Map<string, number>();
  for (const r of rows.slice(1)) {
    const key = schemeKey(r[iName] || "");
    const v = cost(r, "Direct") ?? cost(r, "Regular"); // ETFs report a single TER
    if (key && v !== null && !out.has(key)) out.set(key, v);
  }
  return out;
}

export function attachTer(cands: Omit<FundCandidate, "ter">[], ter: Map<string, number>): FundCandidate[] {
  return cands.map((c) => { const k = schemeKey(c.name); return { ...c, ter: ter.get(k) ?? ter.get(k.replace(/equity/g, "")) ?? null }; });
}

/* ----------------------------------------------------------------- phase 1 */

export function computeFundStats(c: FundCandidate, series: NavPoint[]): FundStats | null {
  if (series.length < 30) return null;
  const latestT = series[series.length - 1].t;
  const me = monthEnds(series, 62);
  const keys37 = monthKeys(latestT, 37);
  const rets = monthlyReturns(me, keys37);
  const r = (x: number | null) => (x === null || !Number.isFinite(x) ? null : Math.round(x * 1e5) / 1e5);
  const lastIso = new Date(latestT).toISOString().slice(0, 10);
  const chk: FundStats["chk"] = c.navDate && lastIso === c.navDate ? (Math.abs(series[series.length - 1].nav / c.nav - 1) < 0.005 ? "agree" : "differ") : "unverified";
  return {
    ...c, chk, latestT, years: Math.round(historyYears(series) * 100) / 100,
    cagr1: r(cagr(series, 1)), cagr3: r(cagr(series, 3)), cagr5: r(cagr(series, 5)),
    vol3: r(annualVol(rets)), mdd5: r(maxDrawdown(series, 5)), sortino3: r(sortino(rets)),
    me: [...me.entries()],
  };
}

/* ----------------------------------------------------------------- phase 2 */

/** Data sanity: drop funds whose history disagrees with AMFI or shows impossible returns. */
export function isSane(f: FundStats) {
  if (f.chk === "differ") return false;
  if (f.cagr1 !== null && Math.abs(f.cagr1) > 1.5) return false;
  if (f.cagr3 !== null && Math.abs(f.cagr3) > 0.8) return false;
  return true;
}

/** Re-use the previous expense ratio when today's TER download did not cover a fund. */
export function fillTerFromPrevious<T extends { code: string; ter: number | null }>(cands: T[], previous: { c: string; t: number | null }[] | undefined): T[] {
  if (!previous?.length) return cands;
  const prev = new Map(previous.map((f) => [f.c, f.t]));
  return cands.map((c) => (c.ter === null && prev.get(c.code) != null ? { ...c, ter: prev.get(c.code) as number } : c));
}

/** metric, weight, lowerIsBetter. Cost carries the most weight for active funds — the most reliable predictor of net returns. */
function weightsFor(kind: FundKind, m: Record<string, number | null>): [string, number, boolean][] {
  switch (kind) {
    case "active": return [["ter", 30, true], ["consistency", 25, false], ["mdd5", 10, false], ["sortino3", 10, false], ["cagr3", 5, false], ["cagr5", 5, false], ["cagr1", 5, false], ["yearsCapped", 10, false]];
    case "passive":
    case "gold": return [["ter", 40, true], ["tracking", 35, true], [m.cagr3 !== null ? "cagr3" : "cagr1", 10, false], ["yearsCapped", 15, false]];
    case "arbitrage": return [["cagr3", 35, false], ["cagr1", 5, false], ["vol3", 20, true], ["ter", 30, true], ["yearsCapped", 10, false]];
    case "debt": return [["cagr3", 30, false], ["cagr1", 10, false], ["vol3", 20, true], ["ter", 25, true], ["yearsCapped", 15, false]];
  }
}

const r4 = (x: number | null | undefined) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 1e4) / 1e4);

export function scoreFunds(stats: FundStats[]): { rows: FundRow[]; buckets: Record<string, BucketSummary>; latestT: number } {
  const latestT = Math.max(...stats.map((s) => s.latestT));
  const keys61 = monthKeys(latestT, 61);
  const keys37 = keys61.slice(-37);
  const rows: FundRow[] = [];
  const buckets: Record<string, BucketSummary> = {};

  for (const def of BUCKETS) {
    const funds = stats.filter((f) => f.bucket === def.key && f.latestT >= latestT - 20 * 864e5 && isSane(f));
    if (!funds.length) continue;
    const me = funds.map((f) => new Map(f.me));
    const roll = me.map((m) => keys61.map((k, i) => { if (i < 12) return null; const a = m.get(keys61[i - 12]), b = m.get(k); return a && b ? b / a - 1 : null; }));
    const rollMed = keys61.map((_, i) => median(roll.map((x) => x[i]).filter((x): x is number => x !== null)));
    const mret = me.map((m) => monthlyReturns(m, keys37));
    const mretMed = keys37.map((_, i) => median(mret.map((x) => x[i]).filter((x): x is number => x !== null)));

    const metrics = funds.map((f, fi) => {
      const wins = roll[fi].map((x, i) => (x !== null && rollMed[i] !== null ? (x >= (rollMed[i] as number) ? 1 : 0) : null)).filter((x): x is 0 | 1 => x !== null);
      const diffs = mret[fi].map((x, i) => (x !== null && mretMed[i] !== null ? x - (mretMed[i] as number) : null)).filter((x): x is number => x !== null);
      const sd = diffs.length >= 12 ? std(diffs) : null;
      return {
        years: f.years, yearsCapped: Math.min(f.years, 10),
        cagr1: f.cagr1, cagr3: f.cagr3, cagr5: f.cagr5, vol3: f.vol3, mdd5: f.mdd5, sortino3: f.sortino3, ter: f.ter,
        consistency: wins.length >= 24 ? wins.reduce((s: number, x) => s + x, 0) / wins.length : null,
        tracking: def.kind === "passive" || def.kind === "gold" ? (sd === null ? null : sd * Math.sqrt(12)) : null,
      } as Record<string, number | null> & { years: number };
    });

    const names = ["consistency", "mdd5", "sortino3", "cagr1", "cagr3", "cagr5", "yearsCapped", "tracking", "vol3", "ter"];
    const pct: Record<string, (number | null)[]> = {};
    for (const n of names) { pct[`${n}:hi`] = percentiles(metrics.map((x) => x[n] ?? null)); pct[`${n}:lo`] = percentiles(metrics.map((x) => x[n] ?? null), true); }

    const scored = funds.map((f, i) => {
      const parts = weightsFor(def.kind, metrics[i]).map(([n, wt, lo]) => [pct[`${n}:${lo ? "lo" : "hi"}`][i], wt] as [number | null, number]);
      const { score, coverage } = weighted(parts);
      const maturity = Math.min(1, f.years / 3);
      const robust = score === null ? null : 50 + (score - 50) * maturity * Math.min(1, coverage / 0.8);
      const confidence: FundRow["confidence"] = f.years >= 5 && coverage >= 0.9 ? "High" : f.years >= 3 && coverage >= 0.6 ? "Medium" : "Low";
      return { f, m: metrics[i], score: robust === null ? null : Math.round(robust * 10) / 10, coverage: Math.round(coverage * 100) / 100, confidence };
    }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    scored.forEach((s, rank) => rows.push({
      code: s.f.code, name: s.f.name, amc: s.f.amc, bucket: def.key, nav: s.f.nav, navDate: s.f.navDate,
      years: Math.round(s.f.years * 10) / 10, ter: s.f.ter,
      cagr1: r4(s.f.cagr1), cagr3: r4(s.f.cagr3), cagr5: r4(s.f.cagr5), vol3: r4(s.f.vol3), mdd5: r4(s.f.mdd5), sortino3: r4(s.f.sortino3),
      consistency: r4(s.m.consistency), tracking: r4(s.m.tracking),
      score: s.score, coverage: s.coverage, confidence: s.confidence, rank: rank + 1,
    }));

    const med = (k: string) => r4(median(metrics.map((x) => x[k]).filter((x): x is number => x !== null)));
    buckets[def.key] = { key: def.key, label: def.label, kind: def.kind, asset: def.asset, count: funds.length, median: { cagr1: med("cagr1"), cagr3: med("cagr3"), cagr5: med("cagr5"), vol3: med("vol3"), ter: med("ter") } };
  }
  return { rows, buckets, latestT };
}

export const FUND_METHODOLOGY = "Funds are scored 0–100 against others in the same group. Active funds: expense ratio 30, consistency vs peers (rolling 12-month windows) 25, downside (max drawdown 10, Sortino 10), returns 1/3/5y 15, track record 10. Index and gold funds: expense ratio 40, tracking vs same-index peers 35, return 10, track record 15. Debt and arbitrage: returns, stability, expense ratio and track record. Young funds and thin data are pulled toward 50.";

export function toLite(r: FundRow): FundLite {
  return { c: r.code, n: r.name, a: r.amc || "", b: r.bucket, s: r.score, r: r.rank, t: r.ter, c1: r.cagr1, c3: r.cagr3, c5: r.cagr5, v: r.vol3, dd: r.mdd5, so: r.sortino3, cs: r.consistency, tr: r.tracking, y: r.years, cf: r.confidence, nav: r.nav };
}

export function buildFundSummary(rows: FundRow[], buckets: Record<string, BucketSummary>, latestT: number, source: string, checks: DataCheck[] = []): FundSummaryDoc {
  return {
    checks,
    version: 2, updatedAt: new Date().toISOString(), navDate: new Date(latestT).toISOString().slice(0, 10), fundCount: rows.length,
    withTer: rows.filter((r) => r.ter !== null).length, source, methodology: FUND_METHODOLOGY, buckets, funds: rows.map(toLite),
  };
}

export { BUCKET_BY_KEY };

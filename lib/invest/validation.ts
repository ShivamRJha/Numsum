/** Data-quality checks recorded with every market-data refresh ("multiple checks"). */
import type { FundCandidate, FundStats } from "./funds-pipeline";
import { isSane } from "./funds-pipeline";
import type { StockLite, StockStats, Fundamentals } from "./stocks";
import type { DataCheck } from "./types";

const pc = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const st = (ok: boolean, warn: boolean): DataCheck["status"] => (ok ? "pass" : warn ? "warn" : "fail");

export function fundChecks(cands: FundCandidate[], stats: FundStats[], scored: number, prevCount = 0): DataCheck[] {
  const agree = stats.filter((s) => s.chk === "agree").length, differ = stats.filter((s) => s.chk === "differ").length;
  const insane = stats.filter((s) => !isSane(s)).length;
  const ter = cands.filter((c) => c.ter !== null).length;
  const newest = stats.reduce((m, s) => Math.max(m, s.latestT), 0);
  const ageDays = newest ? Math.round((Date.now() - newest) / 864e5) : 99;
  return [
    { name: "AMFI scheme list", status: st(cands.length >= 400, cands.length >= 200), detail: `${cands.length} direct-plan growth schemes in the planner's groups` },
    { name: "NAV history downloaded", status: st(pc(stats.length, cands.length) >= 85, pc(stats.length, cands.length) >= 70), detail: `${stats.length} of ${cands.length} funds (${pc(stats.length, cands.length)}%) from api.mfapi.in` },
    { name: "Latest NAV cross-check (history vs AMFI)", status: st(differ === 0, differ <= 5), detail: `${agree} agree, ${differ} differ (excluded), ${stats.length - agree - differ} could not be compared (different dates)` },
    { name: "Impossible returns removed", status: st(insane === 0, insane <= 10), detail: `${insane} funds excluded for mismatched data or implausible returns` },
    { name: "Expense ratio coverage", status: st(pc(ter, cands.length) >= 90, pc(ter, cands.length) >= 70), detail: `${ter} of ${cands.length} funds (${pc(ter, cands.length)}%) matched to the AMFI TER disclosure` },
    { name: "Data freshness", status: st(ageDays <= 4, ageDays <= 7), detail: `Latest NAV is ${ageDays} day(s) old` },
    { name: "Compared with previous refresh", status: prevCount ? st(scored >= prevCount * 0.9, scored >= prevCount * 0.85) : "pass", detail: prevCount ? `${scored} funds scored vs ${prevCount} last time` : `${scored} funds scored (first refresh)` },
  ];
}

export function stockChecks(universe: number, loaded: { stats: StockStats; fu: Fundamentals | null }[], rows: StockLite[], prevCount = 0): DataCheck[] {
  const agree = loaded.filter((x) => x.stats.check === "2 sources agree").length, differ = loaded.filter((x) => x.stats.check === "sources differ").length;
  const fu = loaded.filter((x) => x.fu && (x.fu.pe != null || x.fu.roe != null)).length;
  const splits = loaded.reduce((a, x) => a + (x.stats.splitsAdjusted ? 1 : 0), 0);
  const newest = loaded.map((x) => x.stats.asOf).sort().pop() || "";
  const ageDays = newest ? Math.round((Date.now() - Date.parse(newest)) / 864e5) : 99;
  const hot = rows.filter((r) => r.hl === "Overheated").length;
  return [
    { name: "Price history downloaded", status: st(pc(loaded.length, universe) >= 95, pc(loaded.length, universe) >= 80), detail: `${loaded.length} of ${universe} Nifty 500 stocks` },
    { name: "Price cross-check (NSE data vs Yahoo Finance)", status: st(differ <= 3, differ <= 15), detail: `${agree} agree, ${differ} differ (kept NSE data), ${loaded.length - agree - differ} single source` },
    { name: "Split and bonus adjustment", status: "pass", detail: `${splits} stocks had one or more splits/bonuses adjusted` },
    { name: "Fundamentals coverage", status: st(pc(fu, loaded.length) >= 85, pc(fu, loaded.length) >= 50), detail: `${fu} of ${loaded.length} stocks (${pc(fu, loaded.length)}%) have P/E or ROE` },
    { name: "Stale prices excluded", status: "pass", detail: `${universe - loaded.length} stocks skipped (no recent prices or not enough history)` },
    { name: "Data freshness", status: st(ageDays <= 4, ageDays <= 7), detail: `Latest price is ${ageDays} day(s) old (${newest})` },
    { name: "Overheated stocks flagged", status: "pass", detail: `${hot} stocks have risen too far, too fast and are capped at Neutral` },
    { name: "Compared with previous refresh", status: prevCount ? st(rows.length >= prevCount * 0.9, rows.length >= prevCount * 0.85) : "pass", detail: prevCount ? `${rows.length} stocks scored vs ${prevCount} last time` : `${rows.length} stocks scored (first refresh)` },
  ];
}

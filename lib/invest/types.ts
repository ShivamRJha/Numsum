/** Shapes stored in Firestore by scripts/refresh-market-data.ts and read by the planner. */
// system_documents is publicly readable and admin/service-account writable in firestore.rules.
export const META_COLLECTION = "system_documents";
export const SUMMARY_DOC = "market_fund_summary";
export const STATUS_DOC = "market_refresh_status";
export type FundRow = {
  code: string;
  name: string;
  amc?: string;
  bucket: string;
  nav: number;
  navDate: string; // ISO date
  years: number;
  cagr1: number | null;
  cagr3: number | null;
  cagr5: number | null;
  vol3: number | null;
  mdd5: number | null;
  sortino3: number | null;
  consistency: number | null; // share of rolling 12-month windows at or above the bucket median (0–1)
  tracking: number | null; // annualised deviation vs bucket median (passive / gold)
  score: number | null; // 0–100 within bucket
  coverage: number; // 0–1 share of the scorecard that was measurable
  confidence: "High" | "Medium" | "Low";
  rank: number;
};

/** Compact copy in system_documents/market_fund_summary (one read for the whole planner). */
export type FundTop = { c: string; n: string; s: number | null; r: number; c1: number | null; c3: number | null; c5: number | null; v: number | null; dd: number | null; y: number; cf: FundRow["confidence"] };

export type BucketSummary = {
  key: string;
  label: string;
  kind: string;
  asset: string;
  count: number;
  median: { cagr1: number | null; cagr3: number | null; cagr5: number | null; vol3: number | null };
  top: FundTop[];
};

export type FundSummaryDoc = {
  updatedAt: string; // ISO timestamp of the refresh
  navDate: string; // latest NAV date seen
  fundCount: number;
  source: string;
  methodology: string;
  buckets: Record<string, BucketSummary>;
};

export type RefreshStatusDoc = { lastRunAt: string; ok: boolean; message: string; fundCount: number; failed: number; durationSec: number };

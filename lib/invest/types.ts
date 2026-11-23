/** Shapes stored in Firestore by the market-data refresh and read by the tools. */
// system_documents is publicly readable and admin/service-account writable in firestore.rules.
export const META_COLLECTION = "system_documents";
export const SUMMARY_DOC = "market_fund_summary";
export const STOCK_SUMMARY_DOC = "market_stock_summary";
export const STATUS_DOC = "market_refresh_status";

export type FundRow = {
  code: string;
  name: string;
  amc?: string;
  bucket: string;
  nav: number;
  navDate: string;
  years: number;
  ter: number | null; // direct-plan expense ratio, % a year
  cagr1: number | null;
  cagr3: number | null;
  cagr5: number | null;
  vol3: number | null;
  mdd5: number | null;
  sortino3: number | null;
  consistency: number | null;
  tracking: number | null;
  score: number | null;
  coverage: number;
  confidence: "High" | "Medium" | "Low";
  rank: number;
};

/** Compact fund record stored in the summary document. */
export type FundLite = { c: string; n: string; a: string; b: string; s: number | null; r: number; t: number | null; c1: number | null; c3: number | null; c5: number | null; v: number | null; dd: number | null; so: number | null; cs: number | null; tr: number | null; y: number; cf: FundRow["confidence"]; nav: number };
/** v1 summary shape (top lists per bucket). */
export type FundTop = { c: string; n: string; s: number | null; r: number; c1: number | null; c3: number | null; c5: number | null; v: number | null; dd: number | null; y: number; cf: FundRow["confidence"] };

export type BucketSummary = {
  key: string;
  label: string;
  kind: string;
  asset: string;
  count: number;
  median: { cagr1: number | null; cagr3: number | null; cagr5: number | null; vol3: number | null; ter?: number | null };
  top?: FundTop[];
};

export type FundSummaryDoc = {
  version?: number;
  updatedAt: string;
  navDate: string;
  fundCount: number;
  withTer?: number;
  source: string;
  methodology: string;
  buckets: Record<string, BucketSummary>;
  funds?: FundLite[];
};

export type RefreshStatusDoc = { lastRunAt: string; ok: boolean; message: string; fundCount: number; failed: number; durationSec: number; stockCount?: number; by?: string };

/** Normalise v1 (top lists) and v2 (all funds) summaries into one fund list. */
export function summaryFunds(doc: FundSummaryDoc | null): FundLite[] {
  if (!doc) return [];
  if (doc.funds?.length) return doc.funds;
  return Object.values(doc.buckets).flatMap((b) => (b.top || []).map((f) => ({ ...f, a: "", b: b.key, t: null, so: null, cs: null, tr: null, nav: 0 })));
}

export type StockSummaryDoc = {
  version: number;
  updatedAt: string;
  asOf: string; // latest price date
  count: number;
  withFundamentals: number;
  indexPe: number | null;
  source: string;
  methodology: string;
  industries: Record<string, { pe: number | null; count: number }>;
  rows: import("./stocks").StockLite[];
};

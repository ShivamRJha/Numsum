/**
 * Fund buckets used by the investment planner and the daily market-data refresh.
 * Shared by the browser (labels) and scripts/refresh-market-data.ts (classification).
 */
export type FundKind = "active" | "passive" | "gold" | "arbitrage" | "debt";
export type AssetClass = "equity" | "debt" | "gold";

export type BucketDef = {
  key: string;
  label: string;
  kind: FundKind;
  asset: AssetClass;
  /** Regex on the AMFI section header, e.g. "Open Ended Schemes(Equity Scheme - Large Cap Fund)". */
  header: RegExp;
  /** Optional regex the lower-case scheme name must match. */
  name?: RegExp;
  /** Lower-case fragments that exclude a scheme from this bucket. */
  exclude?: string[];
  /** Direct-plan growth option required (ETFs are exempt). */
  directGrowth?: boolean;
  note?: string;
};

// Category text may come from an AMFI section header ("Open Ended Schemes(Equity Scheme - Mid Cap Fund)")
// or from a category column ("Mid Cap Fund"); the look-behind stops "Large & Mid Cap Fund" matching "Mid Cap Fund".
const equity = (key: string, label: string, header: string, note?: string): BucketDef => ({ key, label, kind: "active", asset: "equity", header: new RegExp(`(?<![&\\w]\\s*)${header}`, "i"), directGrowth: true, note });
const index = (key: string, label: string, name: RegExp, exclude: string[] = []): BucketDef => ({ key, label, kind: "passive", asset: "equity", header: /Index Funds?\b/i, name, exclude: ["equal weight", "momentum", "quality", "value", "low vol", "alpha", "dividend", "multicap", "bharat bond", "g-sec", "gilt", "sdl", "bond", "crisil", "debt", ...exclude], directGrowth: true });
const debt = (key: string, label: string, header: string): BucketDef => ({ key, label, kind: "debt", asset: "debt", header: new RegExp(header, "i"), directGrowth: true });

export const BUCKETS: BucketDef[] = [
  index("idx_n50", "Nifty 50 index fund", /nifty\s*50\b/, ["next 50", "nifty 500", "nifty 50 value", "arbitrage"]),
  index("idx_next50", "Nifty Next 50 index fund", /next\s*50/),
  index("idx_n100", "Nifty 100 index fund", /nifty\s*100\b/),
  index("idx_mid150", "Nifty Midcap 150 index fund", /midcap\s*150/),
  index("idx_small250", "Nifty Smallcap 250 index fund", /smallcap\s*250/),
  index("idx_n500", "Nifty 500 index fund", /nifty\s*500\b/),
  index("idx_sensex", "BSE Sensex index fund", /sensex/, ["next"]),
  equity("large", "Large cap", "Large Cap Fund"),
  equity("largemid", "Large & mid cap", "Large\\s*&\\s*Mid Cap Fund"),
  equity("flexi", "Flexi cap", "Flexi Cap Fund"),
  equity("multi", "Multi cap", "Multi Cap Fund"),
  equity("mid", "Mid cap", "Mid Cap Fund"),
  equity("small", "Small cap", "Small Cap Fund"),
  equity("focused", "Focused", "Focused Fund"),
  equity("value", "Value", "Value Fund"),
  equity("contra", "Contra", "Contra Fund"),
  equity("divyield", "Dividend yield", "Dividend Yield Fund"),
  equity("elss", "ELSS (tax saver)", "ELSS", "3-year lock-in; deduction only under the old tax regime."),
  { key: "gold", label: "Gold ETF / gold fund", kind: "gold", asset: "gold", header: /(Gold ETF|Other\s+ETFs|FoF Domestic|Fund of Funds? \(?Domestic)/i, name: /gold/, exclude: ["silver", "multi asset", "multi-asset", "equity"], directGrowth: true },
  { key: "arbitrage", label: "Arbitrage", kind: "arbitrage", asset: "debt", header: /Arbitrage Fund/i, directGrowth: true, note: "Equity taxation with debt-like risk; suits money needed in 1–3 years." },
  debt("liquid", "Liquid", "Liquid Fund"),
  debt("shortdur", "Short duration", "Short Duration Fund"),
  debt("corpbond", "Corporate bond", "Corporate Bond Fund"),
  debt("bankpsu", "Banking & PSU", "Banking and PSU Fund"),
];

export const BUCKET_BY_KEY: Record<string, BucketDef> = Object.fromEntries(BUCKETS.map((b) => [b.key, b]));

const DIRECT = /\bdirect\b/i;
const NOT_GROWTH = /\bidcw\b|payout|reinvest|bonus|dividend(?!\s*yield)/i;

/** Classify an AMFI scheme into a bucket, or null to skip it. */
export function classifyScheme(header: string, schemeName: string): BucketDef | null {
  const name = schemeName.toLowerCase();
  const isEtf = /\betf\b|exchange traded/i.test(schemeName) && !/fund of fund|\bfof\b/i.test(schemeName);
  for (const b of BUCKETS) {
    if (!b.header.test(header)) continue;
    if (b.name && !b.name.test(name)) continue;
    if (b.exclude?.some((x) => name.includes(x))) continue;
    if (isEtf && b.kind !== "gold") continue; // equity ETFs need a demat account; only gold ETFs are listed
    if (b.directGrowth && !isEtf && (!DIRECT.test(schemeName) || NOT_GROWTH.test(schemeName))) continue;
    return b;
  }
  return null;
}

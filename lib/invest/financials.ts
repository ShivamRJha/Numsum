/**
 * Company financial statements (annual and quarterly) from Yahoo Finance's public fundamentals time series,
 * turned into a Screener-style table: sales, operating profit, net profit, EPS, balance sheet and cash flow,
 * plus derived ratios (margins, ROE, ROCE, debt/equity, free cash flow) and growth rates.
 */
const UA = "Mozilla/5.0 (compatible; NumSumLabs-MarketData/1.1; +https://www.numsum.in)";

const ITEMS = {
  sales: "TotalRevenue", op: "OperatingIncome", ebitda: "EBITDA", interest: "InterestExpense", pbt: "PretaxIncome", tax: "TaxProvision",
  np: "NetIncomeCommonStockholders", eps: "DilutedEPS", dep: "ReconciledDepreciation",
  assets: "TotalAssets", equity: "StockholdersEquity", debt: "TotalDebt", cash: "CashAndCashEquivalents", shares: "OrdinarySharesNumber",
  cfo: "OperatingCashFlow", capex: "CapitalExpenditure", fcf: "FreeCashFlow", div: "CashDividendsPaid",
} as const;
export type Item = keyof typeof ITEMS;
export type Period = { end: string } & Partial<Record<Item, number | null>>;
export type Ratios = { opm: number | null; npm: number | null; roe: number | null; roce: number | null; de: number | null; payout: number | null; cfoToNp: number | null };
export type Financials = {
  annual: (Period & Ratios)[]; quarterly: (Period & Ratios)[];
  growth: { sales3: number | null; profit3: number | null; sales1: number | null; profit1: number | null; qSalesYoy: number | null; qProfitYoy: number | null };
  source: string; currency: string;
};

type TsPoint = { asOfDate: string; reportedValue?: { raw?: number } };

export async function fetchFinancials(symbol: string): Promise<Financials | null> {
  const y = `${symbol}.NS`;
  const types = (["annual", "quarterly"] as const).flatMap((p) => Object.values(ITEMS).map((t) => `${p}${t}`)).join(",");
  const url = `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(y)}?symbol=${encodeURIComponent(y)}&type=${types}&period1=946684800&period2=${Math.floor(Date.now() / 1000)}`;
  let json: { timeseries?: { result?: Record<string, unknown>[] } };
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(15_000), next: { revalidate: 43_200 } });
    if (!res.ok) return null;
    json = await res.json();
  } catch { return null; }
  const result = json.timeseries?.result || [];
  const byPeriod = { annual: new Map<string, Period>(), quarterly: new Map<string, Period>() };
  const reverse = new Map<string, Item>(Object.entries(ITEMS).map(([k, v]) => [v, k as Item]));
  for (const r of result) {
    const type = ((r.meta as { type?: string[] })?.type || [])[0] || "";
    const m = /^(annual|quarterly)(.+)$/.exec(type);
    if (!m) continue;
    const item = reverse.get(m[2]);
    if (!item) continue;
    for (const p of (r[type] as (TsPoint | null)[]) || []) {
      if (!p?.asOfDate) continue;
      const v = p.reportedValue?.raw;
      const map = byPeriod[m[1] as "annual" | "quarterly"];
      const row = map.get(p.asOfDate) || { end: p.asOfDate };
      row[item] = typeof v === "number" && Number.isFinite(v) ? v : null;
      map.set(p.asOfDate, row);
    }
  }
  const sort = (m: Map<string, Period>) => [...m.values()].sort((a, b) => a.end.localeCompare(b.end)).filter((p) => p.sales != null || p.np != null);
  const annual = withRatios(sort(byPeriod.annual), 1);
  const quarterly = withRatios(sort(byPeriod.quarterly), 4);
  if (!annual.length && !quarterly.length) return null;
  return { annual, quarterly, growth: growth(annual, quarterly), source: "Yahoo Finance (company filings)", currency: "INR" };
}

const div = (a: number | null | undefined, b: number | null | undefined) => (a == null || b == null || b === 0 ? null : a / b);

/** Ratios per period. Return ratios use the average of opening and closing balances when both exist; quarterly flows are annualised. */
function withRatios(rows: Period[], annualise: number): (Period & Ratios)[] {
  return rows.map((p, i) => {
    const prev = annualise === 4 ? rows.find((r) => Math.abs(Date.parse(r.end) - (Date.parse(p.end) - 365 * 864e5)) < 20 * 864e5) : rows[i - 1];
    const avg = (k: Item) => { const a = p[k], b = prev?.[k]; return a == null ? null : b == null ? a : (a + b) / 2; };
    const capital = (p.equity ?? 0) + (p.debt ?? 0);
    const ebit = p.op ?? (p.pbt != null && p.interest != null ? p.pbt + Math.abs(p.interest) : null);
    return {
      ...p,
      opm: div(p.op ?? p.ebitda, p.sales), npm: div(p.np, p.sales),
      roe: (() => { const r = div(p.np, avg("equity")); return r == null ? null : r * annualise; })(),
      roce: (() => { const r = capital > 0 ? div(ebit, capital) : null; return r == null ? null : r * annualise; })(),
      de: div(p.debt, p.equity), payout: p.div != null && p.np ? Math.abs(p.div) / p.np : null, cfoToNp: div(p.cfo, p.np),
    };
  });
}

function cagr(rows: Period[], k: Item, years: number) {
  if (rows.length <= years) return null;
  const a = rows[rows.length - 1 - years][k], b = rows[rows.length - 1][k];
  if (a == null || b == null || a <= 0 || b <= 0) return null;
  return Math.pow(b / a, 1 / years) - 1;
}

function growth(annual: Period[], q: Period[]): Financials["growth"] {
  const yoy = (k: Item) => {
    const last = q[q.length - 1]; if (!last) return null;
    const target = Date.parse(last.end) - 365 * 864e5;
    const prev = q.find((p) => Math.abs(Date.parse(p.end) - target) < 20 * 864e5);
    const a = prev?.[k], b = last[k]; return a == null || b == null || a <= 0 ? null : b / a - 1;
  };
  return { sales3: cagr(annual, "sales", 3), profit3: cagr(annual, "np", 3), sales1: cagr(annual, "sales", 1), profit1: cagr(annual, "np", 1), qSalesYoy: yoy("sales"), qProfitYoy: yoy("np") };
}

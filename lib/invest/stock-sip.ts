/**
 * Stock SIP builder: turns a user's selections into a diversified basket of stocks for a monthly SIP held at least
 * a year. Pure functions so the logic is testable and identical everywhere.
 */
import type { StockLite } from "./stocks";

export type SipRisk = "conservative" | "balanced" | "growth";
export type SipStyle = "balanced" | "quality" | "value" | "dividend" | "growth" | "lowvol";
export type SipInputs = {
  monthly: number; // ₹ per month for direct stocks
  years: number; // ≥ 1
  risk: SipRisk;
  style: SipStyle;
  excludeIndustries: string[];
  avoidHot: boolean; // also keep "Hot" (not only "Overheated") stocks out of the basket
  maxPerIndustry: number;
  count: number | null; // number of stocks; null = auto from amount
};

export const SIP_DEFAULTS: SipInputs = { monthly: 10000, years: 5, risk: "balanced", style: "balanced", excludeIndustries: [], avoidHot: true, maxPerIndustry: 2, count: null };

export const RISK_RULES: Record<SipRisk, { minMcapCr: number; maxVol: number; maxBeta: number; label: string; text: string }> = {
  conservative: { minMcapCr: 50000, maxVol: 0.28, maxBeta: 1.1, label: "Conservative", text: "Large, steady companies only (market cap ₹50,000 Cr+, volatility under 28%)." },
  balanced: { minMcapCr: 10000, maxVol: 0.35, maxBeta: 1.3, label: "Balanced", text: "Large and established mid-sized companies (₹10,000 Cr+, volatility under 35%)." },
  growth: { minMcapCr: 2000, maxVol: 0.45, maxBeta: 1.6, label: "Growth", text: "Includes smaller companies with more upside and bigger swings (₹2,000 Cr+, volatility under 45%)." },
};

/** Pillar weights per style (quality, valuation, risk, trend, growth) plus extras. */
export const STYLE_RULES: Record<SipStyle, { label: string; text: string; w: { q: number; v: number; r: number; t: number; g: number }; dividend?: number }> = {
  balanced: { label: "Balanced", text: "The standard long-term score: quality first, then fair price, risk, trend and growth.", w: { q: 30, v: 25, r: 20, t: 15, g: 10 } },
  quality: { label: "Quality first", text: "Strong businesses — high ROE, low debt, good margins — even at a slightly higher price.", w: { q: 50, v: 15, r: 15, t: 15, g: 5 } },
  value: { label: "Value", text: "Cheaper stocks versus their industry, with acceptable quality.", w: { q: 25, v: 45, r: 15, t: 10, g: 5 } },
  dividend: { label: "Dividend income", text: "Companies that pay regular dividends, with quality and fair valuation.", w: { q: 30, v: 25, r: 20, t: 10, g: 0 }, dividend: 15 },
  growth: { label: "Growth", text: "Faster-growing companies with a healthy long-term trend (and more volatility).", w: { q: 25, v: 10, r: 10, t: 25, g: 30 } },
  lowvol: { label: "Low volatility", text: "The steadiest stocks — smaller swings and shallower falls.", w: { q: 25, v: 15, r: 45, t: 10, g: 5 } },
};

export type Pick = { row: StockLite; fit: number; weight: number; monthly: number; reasons: string[] };
export type SipResult = { picks: Pick[]; waitlist: { row: StockLite; why: string }[]; considered: number; afterFilters: number; industries: number; avgVol: number | null; avgBeta: number | null; notes: string[] };

const pc = (x: number | null | undefined) => (x == null ? "—" : `${Math.round(x * 100)}%`);

function reasonsFor(r: StockLite, ind: Record<string, { pe: number | null }>): string[] {
  const out: string[] = [];
  if ((r.roe ?? 0) >= 0.18) out.push(`High ROE ${pc(r.roe)}`);
  if (r.de != null && r.de < 0.3 && !/financial|bank/i.test(r.i)) out.push("Little debt");
  const ipe = ind[r.i]?.pe;
  if (r.pe && ipe && r.pe < ipe) out.push(`P/E ${r.pe.toFixed(0)} below industry ${ipe.toFixed(0)}`);
  if ((r.pos ?? 0) >= 0.75) out.push(`Positive in ${pc(r.pos)} of 1-year periods`);
  if ((r.c3 ?? 0) >= 0.15) out.push(`3-year return ${pc(r.c3)} a year`);
  if ((r.v ?? 1) < 0.22) out.push(`Low volatility ${pc(r.v)}`);
  if ((r.dy ?? 0) >= 0.02) out.push(`Dividend yield ${pc(r.dy)}`);
  if ((r.eg ?? 0) >= 0.15) out.push(`Earnings growing ${pc(r.eg)}`);
  if (r.hl === "Calm") out.push("Not overheated");
  return out.slice(0, 4);
}

export function buildStockSip(rows: StockLite[], input: SipInputs, industries: Record<string, { pe: number | null }>): SipResult {
  const rr = RISK_RULES[input.risk], style = STYLE_RULES[input.style];
  const ex = new Set(input.excludeIndustries);
  const notes: string[] = [];
  const eligible = rows.filter((r) => (r.liq ?? 0) >= 5 && r.cov >= 0.6 && r.sc !== null && r.pl);
  const filtered = eligible.filter((r) => !ex.has(r.i) && (r.mc ?? 0) >= rr.minMcapCr && (r.v ?? 1) <= rr.maxVol && (r.b ?? 2) <= rr.maxBeta && r.sig !== "Weak" && (input.style !== "dividend" || (r.dy ?? 0) > 0.005));
  // Style-weighted fit score from the stored pillar scores
  const scored = filtered.map((r) => {
    const pl = r.pl!;
    const parts: [number | null, number][] = [[pl.q, style.w.q], [pl.v, style.w.v], [pl.r, style.w.r], [pl.t, style.w.t], [pl.g, style.w.g]];
    if (style.dividend) parts.push([Math.min(100, ((r.dy ?? 0) / 0.04) * 100), style.dividend]);
    let w = 0, s = 0; for (const [v, wt] of parts) if (v !== null && wt) { s += v * wt; w += wt; }
    let fit = w ? s / w : 0;
    if ((r.ht ?? 0) > 50) fit -= ((r.ht ?? 0) - 50) * 0.4;
    return { r, fit: Math.round(fit) };
  }).sort((a, b) => b.fit - a.fit);

  const auto = Math.max(4, Math.min(20, Math.floor(input.monthly / 1000)));
  const n = Math.max(3, Math.min(25, input.count ?? auto));
  if (input.monthly / n < 500) notes.push("Each stock gets under ₹500 a month — consider fewer stocks or a higher amount, as tiny purchases may buy less than one share.");
  const perInd = new Map<string, number>();
  const picks: { r: StockLite; fit: number }[] = [];
  const waitlist: { row: StockLite; why: string }[] = [];
  for (const x of scored) {
    const hot = x.r.hl === "Overheated" || (input.avoidHot && x.r.hl === "Hot");
    if (hot) { if (waitlist.length < 8) waitlist.push({ row: x.r, why: `${x.r.hl} — risen too much recently; wait or start very small` }); continue; }
    if (picks.length >= n) continue;
    const k = perInd.get(x.r.i) || 0;
    if (k >= input.maxPerIndustry) continue;
    perInd.set(x.r.i, k + 1);
    picks.push(x);
  }
  if (picks.length < n) notes.push(`Only ${picks.length} stocks meet all your conditions. Loosen the risk level, style or excluded industries to see more.`);

  // Risk-balanced weights (∝ 1/volatility), capped by the volatility position guide, renormalised
  const inv = picks.map((p) => 1 / Math.max(0.12, p.r.v ?? 0.3));
  let weights = inv.map((x) => x / (inv.reduce((a, b) => a + b, 0) || 1));
  const cap = Math.max(0.12, 2 / Math.max(1, picks.length));
  for (let k = 0; k < 5; k++) { const over = weights.map((w) => Math.min(w, cap)); const t = over.reduce((a, b) => a + b, 0) || 1; weights = over.map((w) => w / t); }
  const vol = picks.length ? picks.reduce((a, p, i) => a + weights[i] * (p.r.v ?? 0), 0) : null;
  const beta = picks.length ? picks.reduce((a, p, i) => a + weights[i] * (p.r.b ?? 1), 0) : null;
  if (input.years < 3) notes.push("With less than 3 years, keep direct stocks a small part of your money; shares can stay down for a few years.");
  return {
    picks: picks.map((p, i) => ({ row: p.r, fit: p.fit, weight: weights[i], monthly: Math.round((input.monthly * weights[i]) / 10) * 10, reasons: reasonsFor(p.r, industries) })),
    waitlist, considered: eligible.length, afterFilters: filtered.length, industries: perInd.size, avgVol: vol, avgBeta: beta, notes,
  };
}

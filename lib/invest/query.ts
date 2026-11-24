/**
 * Screener-style text queries over the stock summary, e.g.
 *   "ROE > 15 AND P/E < 25 AND Market cap > 5000"
 *   "Dividend yield > 2 OR (Debt to equity < 0.5 AND Sales growth > 15)"
 * Percentages are typed as percent (ROE > 15 means 15 %). Market cap is in ₹ crore.
 */
import type { StockLite } from "./stocks";

type Field = { key: string; names: string[]; get: (r: StockLite) => number | null | undefined; pct?: boolean; unit?: string };
export const QUERY_FIELDS: Field[] = [
  { key: "pe", names: ["p/e", "pe", "price to earning", "price to earnings"], get: (r) => (r.pe && r.pe > 0 ? r.pe : null) },
  { key: "pb", names: ["p/b", "pb", "price to book"], get: (r) => r.pb },
  { key: "roe", names: ["roe", "return on equity"], get: (r) => r.roe, pct: true },
  { key: "de", names: ["debt to equity", "debt/equity", "d/e", "de"], get: (r) => r.de },
  { key: "dy", names: ["dividend yield", "div yield", "dy"], get: (r) => r.dy, pct: true },
  { key: "mc", names: ["market cap", "market capitalization", "mcap", "mc"], get: (r) => r.mc, unit: "₹ Cr" },
  { key: "px", names: ["current price", "price", "cmp"], get: (r) => r.px, unit: "₹" },
  { key: "r1", names: ["return 1y", "1y return", "return over 1 year", "1 year return"], get: (r) => r.r1, pct: true },
  { key: "r3m", names: ["return 3m", "3m return", "return over 3 months"], get: (r) => r.r3m, pct: true },
  { key: "c3", names: ["return 3y", "3y return", "cagr 3y", "3 year cagr", "return over 3 years"], get: (r) => r.c3, pct: true },
  { key: "c5", names: ["return 5y", "5y return", "cagr 5y", "5 year cagr", "return over 5 years"], get: (r) => r.c5, pct: true },
  { key: "rg", names: ["sales growth", "revenue growth"], get: (r) => r.rg, pct: true },
  { key: "eg", names: ["profit growth", "eps growth", "earnings growth"], get: (r) => r.eg, pct: true },
  { key: "mg", names: ["profit margin", "net margin", "margin", "npm"], get: (r) => r.mg, pct: true },
  { key: "v", names: ["volatility", "vol"], get: (r) => r.v, pct: true },
  { key: "b", names: ["beta"], get: (r) => r.b },
  { key: "dd", names: ["max drawdown", "drawdown", "worst fall"], get: (r) => (r.dd == null ? null : Math.abs(r.dd)), pct: true },
  { key: "tr", names: ["vs 200 dma", "vs 200-day", "200 dma", "above 200 dma"], get: (r) => r.tr, pct: true },
  { key: "rsi", names: ["rsi"], get: (r) => r.rsi },
  { key: "sc", names: ["score", "numsum score"], get: (r) => r.sc },
  { key: "liq", names: ["traded value", "liquidity", "value traded"], get: (r) => r.liq, unit: "₹ Cr/day" },
];
const NAMES = QUERY_FIELDS.flatMap((f) => f.names.map((n) => [n, f] as const)).sort((a, b) => b[0].length - a[0].length);

type Node = { op: "and" | "or"; a: Node; b: Node } | { cmp: string; f: Field; v: number };
export type Compiled = { test: (r: StockLite) => boolean; text: string };

export function compileQuery(input: string): Compiled | { error: string } {
  const src = input.trim();
  if (!src) return { error: "Type a query such as: ROE > 15 AND P/E < 25" };
  let i = 0; const s = src.toLowerCase();
  const ws = () => { while (s[i] === " " || s[i] === "\n" || s[i] === "\t") i++; };
  const word = (w: string) => { ws(); if (s.startsWith(w, i) && !/[a-z]/.test(s[i + w.length] || "")) { i += w.length; return true; } return false; };
  function primary(): Node {
    ws();
    if (s[i] === "(") { i++; const n = expr(); ws(); if (s[i] !== ")") throw new Error("Missing closing bracket"); i++; return n; }
    const hit = NAMES.find(([n]) => s.startsWith(n, i));
    if (!hit) throw new Error(`Unknown field near “${src.slice(i, i + 20)}”. Try ROE, P/E, Market cap, Sales growth…`);
    i += hit[0].length; ws();
    const m = /^(>=|<=|!=|=|>|<)/.exec(s.slice(i)); if (!m) throw new Error(`Expected >, <, >=, <= or = after ${hit[1].names[0]}`);
    i += m[0].length; ws();
    const nm = /^-?\d+(\.\d+)?/.exec(s.slice(i)); if (!nm) throw new Error(`Expected a number after ${m[0]}`);
    i += nm[0].length; ws(); if (s[i] === "%") i++;
    const raw = Number(nm[0]);
    return { cmp: m[0], f: hit[1], v: hit[1].pct ? raw / 100 : raw };
  }
  function and(): Node { let n = primary(); while (word("and") || (ws(), s[i] === "&" && s[i + 1] === "&" && (i += 2))) n = { op: "and", a: n, b: primary() }; return n; }
  function expr(): Node { let n = and(); while (word("or") || (ws(), s[i] === "|" && s[i + 1] === "|" && (i += 2))) n = { op: "or", a: n, b: and() }; return n; }
  try {
    const tree = expr(); ws();
    if (i < s.length) throw new Error(`Unexpected “${src.slice(i, i + 15)}”. Join conditions with AND or OR.`);
    const run = (n: Node, r: StockLite): boolean => {
      if ("op" in n) return n.op === "and" ? run(n.a, r) && run(n.b, r) : run(n.a, r) || run(n.b, r);
      const x = n.f.get(r); if (x == null || !Number.isFinite(x)) return false;
      switch (n.cmp) { case ">": return x > n.v; case "<": return x < n.v; case ">=": return x >= n.v; case "<=": return x <= n.v; case "=": return Math.abs(x - n.v) < 1e-9; default: return x !== n.v; }
    };
    return { test: (r) => run(tree, r), text: src };
  } catch (e) { return { error: (e as Error).message }; }
}

export const QUERY_EXAMPLES = [
  "ROE > 15 AND Debt to equity < 0.5 AND P/E < 30",
  "Sales growth > 15 AND Profit growth > 15 AND Market cap > 10000",
  "Dividend yield > 2 AND ROE > 12",
  "Return 3y > 20 AND Volatility < 30",
  "P/B < 1.5 AND ROE > 10 AND vs 200 DMA < 0",
];

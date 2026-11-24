/**
 * Company news from Google News (India edition) RSS, scored for tone with a finance-specific word list.
 * Each headline gets a tone from −1 to +1 and event tags; the company's news score is a recency- and
 * relevance-weighted average. It is a signal about what is being reported, not about what will happen.
 */
const UA = "Mozilla/5.0 (compatible; NumSumLabs-News/1.0; +https://www.numsum.in)";

export type NewsItem = { title: string; link: string; source: string; date: string; tone: number; tags: string[] };
export type NewsSummary = { items: NewsItem[]; score: number | null; label: "Positive" | "Slightly positive" | "Neutral" | "Slightly negative" | "Negative" | "Not enough news"; count: number; points: number; drivers: string[]; source: string };

// weight: strength of the phrase. Matched on lower-case headline text with word boundaries.
const POS: [string, number][] = [
  ["record profit", 1], ["record revenue", 0.9], ["profit jumps", 0.9], ["profit rises", 0.7], ["profit up", 0.6], ["net profit up", 0.7], ["beats estimates", 0.9], ["beat estimates", 0.9], ["tops estimates", 0.9],
  ["revenue rises", 0.6], ["revenue up", 0.5], ["strong results", 0.8], ["strong q", 0.6], ["margin expands", 0.7], ["margins improve", 0.6],
  ["order win", 0.8], ["wins order", 0.8], ["bags order", 0.8], ["secures order", 0.8], ["bags contract", 0.8], ["wins contract", 0.8], ["order book", 0.3], ["new order", 0.6],
  ["upgrade", 0.7], ["upgrades", 0.7], ["target raised", 0.7], ["raises target", 0.7], ["buy rating", 0.6], ["outperform", 0.5], ["overweight", 0.4],
  ["dividend", 0.3], ["bonus issue", 0.4], ["buyback", 0.6], ["stake buy", 0.4], ["acquires", 0.3], ["acquisition", 0.2], ["expansion", 0.4], ["capacity addition", 0.4], ["launches", 0.2],
  ["approval", 0.4], ["usfda approval", 0.7], ["gets approval", 0.5], ["debt-free", 0.6], ["deleverag", 0.5], ["rating upgrade", 0.8], ["credit rating upgraded", 0.8],
  ["surg", 0.6], ["soar", 0.6], ["rall", 0.5], ["jump", 0.5], ["gain", 0.3], ["hits 52-week high", 0.4], ["all-time high", 0.4], ["record high", 0.4], ["rise", 0.25], ["climb", 0.3],
  ["crash proof", 1.1], ["crash-proof", 1.1], ["guidance raised", 0.8], ["raises guidance", 0.8], ["turnaround", 0.5], ["turns profitable", 0.8], ["promoter buys", 0.6], ["promoters increase stake", 0.6],
];
const NEG: [string, number][] = [
  ["loss widens", 1], ["net loss", 0.7], ["profit falls", 0.8], ["profit drops", 0.8], ["profit declines", 0.7], ["profit down", 0.6], ["misses estimates", 0.9], ["miss estimates", 0.9], ["below estimates", 0.8],
  ["revenue falls", 0.7], ["revenue declines", 0.6], ["weak results", 0.8], ["margin contracts", 0.7], ["margins shrink", 0.7], ["margin pressure", 0.6],
  ["downgrade", 0.8], ["downgrades", 0.8], ["target cut", 0.7], ["cuts target", 0.7], ["sell rating", 0.7], ["underperform", 0.5], ["underweight", 0.4],
  ["fraud", 1], ["scam", 1], ["raid", 0.9], ["searches", 0.4], ["probe", 0.8], ["investigation", 0.7], ["sebi order", 0.8], ["sebi bans", 1], ["penalty", 0.6], ["fine", 0.3], ["show cause", 0.6], ["ed ", 0.3],
  ["default", 1], ["insolvency", 1], ["bankruptcy", 1], ["nclt", 0.6], ["rating downgrade", 0.9], ["credit rating downgraded", 0.9], ["pledge", 0.5], ["pledged shares", 0.6],
  ["resigns", 0.5], ["resignation", 0.5], ["auditor resigns", 1], ["ceo quits", 0.6], ["cfo quits", 0.7], ["layoffs", 0.4], ["strike", 0.4], ["shutdown", 0.6], ["fire at", 0.6], ["plant shut", 0.6],
  ["warning letter", 0.8], ["import alert", 0.9], ["recall", 0.6], ["usfda observations", 0.6], ["form 483", 0.6],
  ["plung", 0.7], ["crash", 0.8], ["tanks", 0.6], ["slump", 0.6], ["tumbl", 0.6], ["fall", 0.3], ["drop", 0.3], ["declin", 0.3], ["slip", 0.3], ["skid", 0.4], ["sink", 0.5], ["hits 52-week low", 0.5], ["lower circuit", 0.6],
  ["guidance cut", 0.8], ["cuts guidance", 0.8], ["promoter sells", 0.5], ["stake sale", 0.3], ["block deal", 0.1], ["offloads", 0.4],
];
const TAGS: [RegExp, string][] = [
  [/\bq[1-4]\b|results|quarter|earnings|profit|revenue/, "Results"], [/\border(s)? (worth|win|from|of|for)|bags order|wins order|contract/, "Orders"], [/upgrade|downgrade|target|rating|brokerage|buy |sell /, "Analysts"],
  [/sebi|probe|raid|fraud|penalty|investigation|court|nclt|tax demand/, "Regulatory/legal"], [/dividend|buyback|bonus|split/, "Shareholder"], [/acqui|merger|stake|deal/, "Deals"],
  [/promoter|pledge|block deal|bulk deal/, "Ownership"], [/usfda|approval|warning letter|import alert/, "Approvals"], [/resign|appoint|ceo|cfo|md /, "Management"],
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const NEGATE = /\b(no|not|denies|deny|despite|rules out|without)\b/;

export function scoreHeadline(title: string): { tone: number; tags: string[] } {
  const t = ` ${title.toLowerCase().replace(/[‘’]/g, "'")} `;
  let pos = 0, neg = 0;
  for (const [w, k] of POS) if (new RegExp(`\\b${esc(w)}`).test(t)) pos += k;
  for (const [w, k] of NEG) if (new RegExp(`\\b${esc(w)}`).test(t)) neg += k;
  let tone = Math.tanh((pos - neg) * 0.9);
  if (NEGATE.test(t) && Math.abs(tone) > 0) tone *= -0.4; // "denies fraud", "no impact" — weak and reversed
  return { tone: Math.round(tone * 100) / 100, tags: TAGS.filter(([r]) => r.test(t)).map(([, l]) => l) };
}

const decode = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]+>/g, "").trim();
const tag = (x: string, n: string) => decode((new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`).exec(x) || [])[1] || "");

export function parseRss(xml: string): { title: string; link: string; source: string; date: string }[] {
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map((it) => {
    const source = tag(it, "source");
    let title = tag(it, "title");
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const d = new Date(tag(it, "pubDate"));
    return { title, link: tag(it, "link"), source, date: Number.isNaN(+d) ? "" : d.toISOString() };
  }).filter((x) => x.title && x.date);
}

/** Words that tie a headline to this company rather than to the market in general. */
function relevance(title: string, name: string, symbol: string) {
  const t = title.toLowerCase();
  const key = name.toLowerCase().replace(/\b(ltd|limited|india|industries|corporation|company|co)\b\.?/g, "").trim().split(/\s+/).filter((w) => w.length > 2).slice(0, 2);
  if (new RegExp(`\\b${esc(symbol.toLowerCase())}\\b`).test(t)) return 1;
  if (key.length && key.every((w) => t.includes(w))) return 1;
  if (key.length && t.includes(key[0])) return 0.7;
  return 0.25;
}

export function summarise(raw: { title: string; link: string; source: string; date: string }[], name: string, symbol: string, now = Date.now()): NewsSummary {
  const seen = new Set<string>();
  const items: (NewsItem & { w: number })[] = [];
  for (const r of raw) {
    const k = r.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").slice(0, 70);
    if (seen.has(k)) continue; seen.add(k);
    const age = Math.max(0, (now - Date.parse(r.date)) / 864e5);
    if (age > 45) continue;
    const { tone, tags } = scoreHeadline(r.title);
    const w = Math.exp(-age / 10) * relevance(r.title, name, symbol);
    items.push({ ...r, tone, tags, w });
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  const scored = items.filter((i) => i.tone !== 0);
  const wsum = scored.reduce((s, i) => s + i.w, 0);
  const score = scored.length && wsum > 0 ? Math.round((scored.reduce((s, i) => s + i.tone * i.w, 0) / wsum) * 100) / 100 : null;
  // influence on the stock signal: at most ±6 points, scaled down when there are few relevant, recent stories
  const confidence = Math.min(1, wsum / 3);
  const points = score === null ? 0 : Math.round(score * 6 * confidence);
  const label: NewsSummary["label"] = score === null || confidence < 0.2 ? "Not enough news" : score > 0.35 ? "Positive" : score > 0.1 ? "Slightly positive" : score < -0.35 ? "Negative" : score < -0.1 ? "Slightly negative" : "Neutral";
  const drivers = [...scored].sort((a, b) => Math.abs(b.tone * b.w) - Math.abs(a.tone * a.w)).slice(0, 3).map((i) => i.title);
  // show company-specific stories first; general market round-ups only if little else exists
  const specific = items.filter((i) => i.w / Math.exp(-Math.max(0, (now - Date.parse(i.date)) / 864e5) / 10) >= 0.7);
  const shown = specific.length >= 5 ? specific : items;
  return { items: shown.slice(0, 30).map(({ w: _w, ...i }) => i), score, label, count: items.length, points, drivers, source: "Google News (India)" };
}

export async function fetchNews(name: string, symbol: string): Promise<NewsSummary> {
  const clean = name.replace(/\b(Ltd|Limited)\.?$/i, "").trim();
  const q = `("${clean}" OR "${symbol}") (share OR stock OR results OR NSE) when:30d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(10_000), next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(String(res.status));
    return summarise(parseRss(await res.text()), clean, symbol);
  } catch {
    return { items: [], score: null, label: "Not enough news", count: 0, points: 0, drivers: [], source: "Google News (India) — unavailable right now" };
  }
}

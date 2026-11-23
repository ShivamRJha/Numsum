import { fetchBarsChecked, fetchIndex, pool, YahooSession } from "@/lib/invest/sources";
import { computeStockStats } from "@/lib/invest/stocks";
import { json, unauthorized, verifyFirebaseUser } from "@/lib/invest/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

let indexCache: { at: number; data: Awaited<ReturnType<typeof fetchIndex>> } | null = null;

/** Step 2: price statistics and fundamentals for up to 30 NSE symbols. */
export async function POST(req: Request) {
  if (!(await verifyFirebaseUser(req))) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { symbols?: string[] };
  const symbols = (body.symbols || []).map((s) => String(s).toUpperCase().trim()).filter((s) => /^[A-Z0-9&\-]{1,20}$/.test(s)).slice(0, 20);
  if (!indexCache || Date.now() - indexCache.at > 10 * 60_000) indexCache = { at: Date.now(), data: await fetchIndex() };
  const index = indexCache.data;
  const yahoo = new YahooSession();
  const yOk = await yahoo.init();
  const deadline = Date.now() + 48_000;
  const out = await pool(symbols, 6, async (symbol) => {
    if (Date.now() > deadline) return null;
    try {
      const b = await fetchBarsChecked(symbol);
      const st = computeStockStats(symbol, b.bars, index.bars);
      const fu = st && yOk ? await yahoo.fundamentals(symbol) : null;
      return st ? { symbol, stats: { ...st, check: b.check }, fu } : null;
    } catch { return null; }
  });
  return json({ items: out.filter(Boolean), failed: out.filter((x) => !x).length, yahoo: yOk, indexPe: index.pe });
}

import { fetchNews } from "@/lib/invest/news";
import { UNIVERSE_BY_SYMBOL } from "@/lib/invest/sources";
import { json } from "@/lib/invest/server-auth";

export const runtime = "nodejs";
export const maxDuration = 15;

/** Recent company headlines with a tone score. Cached at the edge for 30 minutes. */
export async function GET(req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const symbol = decodeURIComponent((await params).symbol || "").toUpperCase().trim();
  if (!/^[A-Z0-9&\-]{1,20}$/.test(symbol)) return json({ error: "Invalid symbol" }, { status: 400 });
  const qName = new URL(req.url).searchParams.get("name")?.slice(0, 80);
  const name = UNIVERSE_BY_SYMBOL.get(symbol)?.[1] || qName || symbol;
  return json(await fetchNews(name, symbol), { cache: "public, s-maxage=1800, stale-while-revalidate=7200" });
}

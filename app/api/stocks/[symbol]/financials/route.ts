import { fetchFinancials } from "@/lib/invest/financials";
import { json } from "@/lib/invest/server-auth";

export const runtime = "nodejs";
export const maxDuration = 20;

/** Annual and quarterly financial statements with ratios. Cached at the edge for 12 hours. */
export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const symbol = decodeURIComponent((await params).symbol || "").toUpperCase().trim();
  if (!/^[A-Z0-9&\-]{1,20}$/.test(symbol)) return json({ error: "Invalid symbol" }, { status: 400 });
  const f = await fetchFinancials(symbol);
  if (!f) return json({ error: "Financial statements are not available for this company right now." }, { status: 404, cache: "public, s-maxage=1800" });
  return json(f, { cache: "public, s-maxage=43200, stale-while-revalidate=86400" });
}

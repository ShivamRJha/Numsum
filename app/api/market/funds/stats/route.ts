import { computeFundStats, type FundCandidate } from "@/lib/invest/funds-pipeline";
import { fetchNavHistory, pool } from "@/lib/invest/sources";
import { json, unauthorized, verifyFirebaseUser } from "@/lib/invest/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Step 2: NAV history and per-fund statistics for up to 60 funds. */
export async function POST(req: Request) {
  if (!(await verifyFirebaseUser(req))) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { candidates?: FundCandidate[] };
  const list = (body.candidates || []).filter((c) => /^\d+$/.test(String(c?.code))).slice(0, 40);
  const deadline = Date.now() + 50_000;
  const stats = await pool(list, 10, async (c) => { if (Date.now() > deadline) return null; try { return computeFundStats(c, await fetchNavHistory(c.code, { tries: 2, timeout: 12_000 })); } catch { return null; } });
  return json({ stats: stats.filter(Boolean), failed: stats.filter((s) => !s).length });
}

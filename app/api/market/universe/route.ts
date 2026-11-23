import { fetchIndex, fetchUniverse } from "@/lib/invest/sources";
import { json, unauthorized, verifyFirebaseUser } from "@/lib/invest/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Step 1 of the stock refresh: the Nifty 500 list and the Nifty 50 P/E. */
export async function GET(req: Request) {
  if (!(await verifyFirebaseUser(req))) return unauthorized();
  const [universe, index] = await Promise.all([fetchUniverse(6_000), fetchIndex().catch(() => ({ pe: null }))]);
  return json({ universe, indexPe: index.pe });
}

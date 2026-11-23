import { fetchFundCandidates } from "@/lib/invest/sources";
import { json, unauthorized, verifyFirebaseUser } from "@/lib/invest/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Step 1 of the admin refresh: today's AMFI scheme list with expense ratios. */
export async function GET(req: Request) {
  if (!(await verifyFirebaseUser(req))) return unauthorized();
  const log: string[] = [];
  const { candidates, source } = await fetchFundCandidates(200, (m) => log.push(m));
  return json({ candidates, source, log });
}

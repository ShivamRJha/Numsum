import { NextResponse } from "next/server";
import { radar } from "@/lib/research/radar";

// GET /api/research/radar?topics=a|b|c  → recent preprints and notable journal papers per topic (cached 6 h per topic).
export async function GET(req: Request) {
  const u = new URL(req.url);
  const topics = (u.searchParams.get("topics") || "").split("|").map((t) => t.slice(0, 80)).filter(Boolean).slice(0, 8);
  if (!topics.length) return NextResponse.json({ topics: [] });
  const data = await radar(topics);
  return NextResponse.json({ topics: data, asOf: new Date().toISOString() }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600" } });
}

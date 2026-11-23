import { buildSearchIndex } from "@/lib/learn/search-index";
export const dynamic = "force-static";
export function GET() {
  return Response.json(buildSearchIndex(), { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}

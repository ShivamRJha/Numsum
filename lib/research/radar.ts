// Research radar: recent preprints (arXiv) and notable recent journal papers (OpenAlex) for a set of topics.
// Shared by the /api/research/radar route and the daily alert script. Both sources are free, open APIs.
import type { RadarItem } from "./types";

const UA = { "User-Agent": "NumSum-Research-Radar/1.0 (https://www.numsum.in)" };
const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const tidy = (s: string) => decode(s).replace(/\s+/g, " ").trim();
const tag = (xml: string, name: string) => { const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(xml); return m ? tidy(m[1]) : ""; };

/** Newest arXiv preprints whose text (or title, with titleOnly) contains the phrase. */
export async function arxiv(topic: string, max = 8, titleOnly = false): Promise<RadarItem[]> {
  const field = titleOnly ? "ti" : "all";
  const q = `${field}:"${topic.replace(/"/g, "")}"`;
  const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(q)}&sortBy=submittedDate&sortOrder=descending&max_results=${max}`;
  const r = await fetch(url, { headers: UA, next: { revalidate: 21600 } } as RequestInit);
  if (!r.ok) return [];
  const xml = await r.text();
  return xml.split("<entry>").slice(1).map((e) => {
    const id = tag(e, "id");
    const authors = [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => tidy(m[1]));
    const cat = /<arxiv:primary_category[^>]*term="([^"]+)"/.exec(e)?.[1];
    return { id: `arxiv:${id.split("/abs/")[1] || id}`, source: "arXiv" as const, title: tag(e, "title"), authors, date: tag(e, "published").slice(0, 10), url: id.replace("http://", "https://"), venue: cat ? `arXiv ${cat}` : "arXiv", summary: tag(e, "summary").slice(0, 320) };
  }).filter((x) => x.title);
}

type OAWork = { id: string; doi?: string | null; display_name?: string; publication_date?: string; cited_by_count?: number; authorships?: { author?: { display_name?: string } }[]; primary_location?: { source?: { display_name?: string } | null; landing_page_url?: string | null } | null };

/** Most-cited journal articles published in the last `days` days that match the topic. */
export async function openalex(topic: string, days = 120, max = 6): Promise<RadarItem[]> {
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(topic)}&filter=from_publication_date:${since},type:article&sort=cited_by_count:desc&per-page=${max}&select=id,doi,display_name,publication_date,primary_location,authorships,cited_by_count`;
  const r = await fetch(url, { headers: UA, next: { revalidate: 21600 } } as RequestInit);
  if (!r.ok) return [];
  const j = (await r.json()) as { results?: OAWork[] };
  return (j.results || []).filter((w) => w.display_name).map((w) => ({
    id: `oa:${w.id.split("/").pop()}`, source: "Journal" as const, title: tidy(w.display_name || ""),
    authors: (w.authorships || []).map((a) => a.author?.display_name || "").filter(Boolean).slice(0, 6),
    date: w.publication_date || "", url: w.doi || w.primary_location?.landing_page_url || w.id,
    venue: w.primary_location?.source?.display_name || undefined, citations: w.cited_by_count,
  }));
}

const key = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 90);

export async function radar(topics: string[], opts: { perTopic?: number; days?: number } = {}): Promise<{ topic: string; items: RadarItem[] }[]> {
  const list = [...new Set(topics.map((t) => t.trim()).filter(Boolean))].slice(0, 8);
  return Promise.all(list.map(async (topic) => {
    const [a, b] = await Promise.all([arxiv(topic, opts.perTopic ?? 6).catch(() => []), openalex(topic, opts.days ?? 120, 4).catch(() => [])]);
    const seen = new Set<string>(); const items: RadarItem[] = [];
    for (const it of [...b, ...a]) { const k = key(it.title); if (!seen.has(k)) { seen.add(k); items.push(it); } }
    return { topic, items };
  }));
}

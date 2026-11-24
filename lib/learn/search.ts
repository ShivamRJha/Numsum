/** Client-safe search over the Learn index (no data imports here). */
export type SearchItem = { t: string; s: string; h: string; k: "Module" | "Chapter" | "Topic" | "Damage mechanism" | "Guide" | "Term" | "Tool" | "Spec" | "Clause"; x: string };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080)).replace(/[^a-z0-9.§ ]+/g, " ");

/** Simple ranked search: every word must appear; title hits and exact phrases rank higher. */
export function searchItems(items: SearchItem[], q: string, limit = 30): SearchItem[] {
  const query = norm(q).trim();
  if (!query) return [];
  const words = query.split(/\s+/).filter(Boolean);
  const scored: [number, SearchItem][] = [];
  for (const it of items) {
    const title = norm(it.t), body = norm(`${it.s} ${it.x}`);
    if (!words.every((w) => title.includes(w) || body.includes(w))) continue;
    let sc = 0;
    for (const w of words) sc += title.includes(w) ? 5 : 1;
    if (title.includes(query)) sc += 10;
    else if (body.includes(query)) sc += 3;
    if (it.k === "Module" || it.k === "Tool") sc += 2;
    scored.push([sc, it]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map(([, it]) => it);
}

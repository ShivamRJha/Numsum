/** One flat list of everything on the Learn side, for the site search. Built at build time. */
import { CODES, TOPICS, topicByKey } from "@/lib/learn/codes";
import { DM_LIB, DM_GRP, dmSlug } from "@/lib/eng/damage-mechanisms";
import { GUIDES } from "@/lib/learn/guides";
import { TERMS } from "@/lib/learn/terms";
import { ENG_TOOLS } from "@/lib/eng/catalog";
import { CURATED } from "@/lib/asme/curated";
import SPECS from "@/lib/asme/spec-index.json";
import { CLAUSE_SETS } from "@/lib/learn/clauses";

import type { SearchItem } from "@/lib/learn/search";
export type { SearchItem };

export function buildSearchIndex(): SearchItem[] {
  const out: SearchItem[] = [];
  for (const c of CODES) {
    out.push({ k: "Module", t: c.title, s: `${c.code} · ${c.edition}`, h: `/learn/codes/${c.slug}`, x: `${c.code} ${c.short} ${c.covers} ${c.description} ${c.concepts.map((x) => x.join(" ")).join(" ")}` });
    for (const ch of c.chapters) out.push({ k: "Chapter", t: `${c.short} ${ch.ref} — ${ch.title}`, s: ch.summary, h: `/learn/codes/${c.slug}#${ch.id}`, x: `${c.code} ${c.short} ${ch.ref} ${ch.title} ${ch.summary} ${ch.points.join(" ")} ${(ch.formula || []).join(" ")} ${ch.tags.map((k) => topicByKey(k).name).join(" ")}` });
  }
  for (const set of CLAUSE_SETS) {
    const c = CODES.find((x) => x.slug === set.slug); if (!c) continue;
    for (const [id, title, text] of set.rows) if (text) out.push({ k: "Clause", t: `${c.short} ${/^[A-Z]$/.test(id) ? "Annex" : "§"}${/^[A-Z]$/.test(id) ? " " + id : id} — ${title}`, s: text.length > 160 ? text.slice(0, 157) + "…" : text, h: `/learn/codes/${set.slug}/clauses#c-${id}`, x: `${c.short} ${id} ${title} ${text}` });
  }
  for (const t of TOPICS) out.push({ k: "Topic", t: t.name, s: t.intro, h: `/learn/codes/topics/${t.slug}`, x: `${t.name} ${t.intro} ${t.group}` });
  for (const d of DM_LIB) out.push({ k: "Damage mechanism", t: d.n, s: `API 571 §${d.api} · ${DM_GRP[d.g as keyof typeof DM_GRP]}`, h: `/learn/damage-mechanisms/${dmSlug(d)}`, x: `${d.n} ${d.sw} ${d.why} ${d.who} ${d.find}` });
  for (const g of GUIDES) out.push({ k: "Guide", t: g.title, s: g.description, h: `/learn/${g.slug}`, x: `${g.title} ${g.description} ${g.sections.map(([h, p]) => `${h} ${p.join(" ")}`).join(" ")}` });
  for (const t of TERMS) out.push({ k: "Term", t: t.term, s: t.simple, h: `/learn/investing/${t.slug}`, x: `${t.term} ${t.simple} ${t.pro}` });
  for (const t of ENG_TOOLS) out.push({ k: "Tool", t: t.h1, s: t.short, h: `/engineering/${t.slug}`, x: `${t.name} ${t.description} ${t.codes}` });
  for (const sp of SPECS as { id: string; full: string; title: string; form: string; family: string; basis: string }[]) {
    const c = CURATED.find((x) => x.id === sp.id);
    out.push({ k: "Spec", t: `${sp.full} — ${sp.title}`, s: c ? `${c.grades}. ${c.condition}` : `${sp.form} · ${sp.family}${sp.basis ? ` · based on ${sp.basis}` : ""}`, h: `/engineering/material-spec-finder#${encodeURIComponent(sp.id)}`, x: `${sp.id} ${sp.full} ${sp.title} ${sp.form} ${sp.family} ${c ? `${c.grades} ${c.props} ${c.tests.map((t) => t[0]).join(" ")}` : ""}` });
  }
  return out;
}


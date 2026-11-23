import { GLOSSARY } from "@/lib/invest/glossary";
export const termSlug = (term: string) => term.toLowerCase().replace(/[()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const TERMS = Object.entries(GLOSSARY).map(([key, e]) => ({ key, slug: termSlug(e.term), ...e }));
export const termBySlug = (s: string) => TERMS.find((t) => t.slug === s);

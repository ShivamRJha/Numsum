import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { ENG_TOOLS } from "@/lib/eng/catalog";
import { DM_LIB, dmSlug } from "@/lib/eng/damage-mechanisms";
import { GUIDES } from "@/lib/learn/guides";
import { TERMS } from "@/lib/learn/terms";
import { CODES, TOPICS } from "@/lib/learn/codes";

type F = MetadataRoute.Sitemap[number]["changeFrequency"];
const routes: [string, number, F][] = [
  ["/", 1, "weekly"],
  ["/engineering", 0.95, "weekly"],
  ...ENG_TOOLS.map((t): [string, number, F] => [`/engineering/${t.slug}`, 0.9, "monthly"]),
  ["/products/iris", 0.9, "monthly"],
  ["/learn", 0.85, "weekly"],
  ["/learn/codes", 0.9, "monthly"],
  ...CODES.map((c): [string, number, F] => [`/learn/codes/${c.slug}`, 0.85, "monthly"]),
  ...TOPICS.map((t): [string, number, F] => [`/learn/codes/topics/${t.slug}`, 0.6, "monthly"]),
  ["/learn/damage-mechanisms", 0.85, "monthly"],
  ...DM_LIB.map((d): [string, number, F] => [`/learn/damage-mechanisms/${dmSlug(d)}`, 0.7, "monthly"]),
  ...GUIDES.map((g): [string, number, F] => [`/learn/${g.slug}`, 0.75, "monthly"]),
  ["/learn/investing", 0.7, "monthly"],
  ...TERMS.map((t): [string, number, F] => [`/learn/investing/${t.slug}`, 0.5, "yearly"]),
  ["/tools", 0.85, "daily"],
  ["/tools/investment-planner", 0.85, "daily"],
  ["/tools/funds", 0.8, "daily"],
  ["/tools/stocks", 0.8, "daily"],
  ["/tools/stock-analyzer", 0.8, "daily"],
  ["/tools/stock-sip", 0.7, "daily"],
  ["/tools/portfolio", 0.6, "monthly"],
  ["/tools/methodology", 0.5, "monthly"],
  ["/for-msmes", 0.7, "monthly"],
  ["/challenges", 0.7, "weekly"],
  ["/problem-statements", 0.6, "weekly"],
  ["/case-studies", 0.6, "weekly"],
  ["/community", 0.5, "daily"],
  ["/msme-intelligence", 0.5, "monthly"],
  ["/research", 0.5, "weekly"],
  ["/sops", 0.5, "monthly"],
  ["/pilots", 0.4, "monthly"],
  ["/about", 0.6, "monthly"],
  ["/contact", 0.7, "yearly"],
  ["/join", 0.4, "yearly"],
  ["/privacy", 0.3, "yearly"],
  ["/terms", 0.3, "yearly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(([path, priority, changeFrequency]) => ({ url: `${siteUrl}${path}`, lastModified, changeFrequency, priority }));
}

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const routes: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["/", 1, "weekly"],
  ["/products/iris", 0.9, "monthly"],
  ["/tools", 0.9, "daily"],
  ["/tools/investment-planner", 0.9, "daily"],
  ["/tools/funds", 0.8, "daily"],
  ["/tools/stocks", 0.8, "daily"],
  ["/tools/stock-analyzer", 0.8, "daily"],
  ["/tools/portfolio", 0.6, "monthly"],
  ["/for-msmes", 0.8, "monthly"],
  ["/challenges", 0.8, "weekly"],
  ["/problem-statements", 0.7, "weekly"],
  ["/case-studies", 0.7, "weekly"],
  ["/community", 0.6, "daily"],
  ["/msme-intelligence", 0.6, "monthly"],
  ["/research", 0.6, "weekly"],
  ["/sops", 0.5, "monthly"],
  ["/pilots", 0.5, "monthly"],
  ["/about", 0.6, "monthly"],
  ["/contact", 0.7, "yearly"],
  ["/join", 0.5, "yearly"],
  ["/privacy", 0.3, "yearly"],
  ["/terms", 0.3, "yearly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(([path, priority, changeFrequency]) => ({ url: `${siteUrl}${path}`, lastModified, changeFrequency, priority }));
}

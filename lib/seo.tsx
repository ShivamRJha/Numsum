/** Structured data (JSON-LD) helpers for search engines. */
import { siteUrl } from "@/lib/site";

export const org = { "@type": "Organization", name: "NumSum Labs", url: siteUrl, logo: `${siteUrl}/numsum-logo.svg` };

export function toolLd({ name, description, path, category = "EngineeringApplication" }: { name: string; description: string; path: string; category?: string }) {
  return { "@context": "https://schema.org", "@type": "WebApplication", name, description, url: `${siteUrl}${path}`, applicationCategory: category, operatingSystem: "Any (web browser)", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, publisher: org };
}
export function faqLd(faqs: [string, string][]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
}
export function breadcrumbLd(items: [string, string][]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${siteUrl}${path}` })) };
}
export function articleLd({ title, description, path, about }: { title: string; description: string; path: string; about?: string }) {
  return { "@context": "https://schema.org", "@type": "TechArticle", headline: title, description, url: `${siteUrl}${path}`, about, author: org, publisher: org, inLanguage: "en-IN" };
}
export function termLd({ name, description, path, set }: { name: string; description: string; path: string; set: string }) {
  return { "@context": "https://schema.org", "@type": "DefinedTerm", name, description, url: `${siteUrl}${path}`, inDefinedTermSet: set };
}

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

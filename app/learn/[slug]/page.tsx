import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, guide } from "@/lib/learn/guides";
import { JsonLd, articleLd } from "@/lib/seo";
import { Crumbs } from "@/components/learn/crumbs";
import { IrisCta } from "@/components/eng/iris-cta";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guide((await params).slug); if (!g) return {};
  return { title: g.title, description: g.description, alternates: { canonical: `/learn/${g.slug}` }, openGraph: { type: "article", title: g.title, description: g.description, url: `/learn/${g.slug}` } };
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guide((await params).slug); if (!g) notFound();
  const more = GUIDES.filter((x) => x.slug !== g.slug && x.area === g.area);
  return <article className="max-w-3xl">
    <JsonLd data={articleLd({ title: g.title, description: g.description, path: `/learn/${g.slug}` })} />
    <Crumbs items={[[g.area, "/learn"], [g.title.split(" — ")[0].split(":")[0], `/learn/${g.slug}`]]} />
    <h1 className="mt-4 font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">{g.title}</h1>
    <p className="mt-3 font-mono text-xs text-white/45">{g.minutes} min read · NumSum Labs</p>
    {g.sections.map(([h, ps]) => <section key={h} className="mt-8"><h2 className="font-display text-xl font-semibold text-white">{h}</h2>{ps.map((p, i) => <p key={i} className="mt-3 leading-7 text-white/75">{p}</p>)}</section>)}
    {g.tool && <Link href={g.tool[1]} className="mt-10 inline-flex rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-black hover:bg-white">{g.tool[0]} →</Link>}
    {more.length > 0 && <section className="mt-12"><h2 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">More {g.area.toLowerCase()} guides</h2><ul className="mt-3 grid gap-2">{more.map((m) => <li key={m.slug}><Link href={`/learn/${m.slug}`} className="text-amber-100 hover:text-white">{m.title.split(" — ")[0].split(":")[0]}</Link></li>)}</ul></section>}
    {g.area === "Inspection" && <IrisCta />}
  </article>;
}

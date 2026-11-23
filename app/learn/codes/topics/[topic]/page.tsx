import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS, chaptersForTopic, topicBySlug } from "@/lib/learn/codes";
import { JsonLd, articleLd } from "@/lib/seo";
import { Crumbs } from "@/components/learn/crumbs";
import { CodesNote } from "@/components/learn/codes-note";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return TOPICS.filter((t) => chaptersForTopic(t.key).length).map((t) => ({ topic: t.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const t = topicBySlug((await params).topic); if (!t) return {};
  const codes = [...new Set(chaptersForTopic(t.key).map(({ code }) => code.short))].join(", ");
  const title = `${t.name} — What ${codes} Say`;
  return { title, description: `${t.intro} Compared across ${codes}, with clause references.`, alternates: { canonical: `/learn/codes/topics/${t.slug}` }, openGraph: { title, url: `/learn/codes/topics/${t.slug}` } };
}
export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const t = topicBySlug((await params).topic); if (!t) notFound();
  const list = chaptersForTopic(t.key);
  const byCode = [...new Map(list.map((x) => [x.code.slug, x.code])).values()];
  const others = TOPICS.filter((x) => x.group === t.group && x.slug !== t.slug);
  return <article className="max-w-4xl">
    <JsonLd data={articleLd({ title: t.name, description: t.intro, path: `/learn/codes/topics/${t.slug}` })} />
    <Crumbs items={[["Codes academy", "/learn/codes"], [t.name, `/learn/codes/topics/${t.slug}`]]} />
    <p className="mt-4 text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">Topic · {t.group}</p>
    <h1 className="mt-1 font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">{t.name}</h1>
    <p className="mt-3 text-lg leading-8 text-white/70">{t.intro}</p>
    <p className="mt-2 text-sm text-white/45">{list.length} chapters in {byCode.length} {byCode.length === 1 ? "module" : "modules"}: {byCode.map((c) => c.short).join(" · ")}</p>
    {byCode.map((code) => <section key={code.slug} className="mt-10"><h2 className="font-display text-xl font-semibold text-white"><Link href={`/learn/codes/${code.slug}`} className="hover:text-amber-50">{code.code}</Link></h2>
      <div className="mt-3 grid gap-3">{list.filter((x) => x.code.slug === code.slug).map(({ ch }) => <Link key={ch.id} href={`/learn/codes/${code.slug}#${ch.id}`} className="premium-card block rounded-2xl border p-5 hover:border-amber-100/40"><p className="font-mono text-xs text-amber-100/70">{code.short} {ch.ref}</p><p className="mt-1 font-semibold text-white">{ch.title}</p><p className="mt-2 text-sm leading-6 text-white/65">{ch.summary}</p>{ch.formula && <p className="mt-2 font-mono text-xs text-white/55">{ch.formula[0]}</p>}</Link>)}</div></section>)}
    {others.length > 0 && <section className="mt-12"><h2 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">More in “{t.group}”</h2><div className="mt-3 flex flex-wrap gap-2">{others.map((o) => <Link key={o.slug} href={`/learn/codes/topics/${o.slug}`} className="rounded-full border border-white/12 px-3 py-1.5 text-sm text-white/70 hover:text-white">{o.name}</Link>)}</div></section>}
    <div className="mt-10"><CodesNote /></div>
  </article>;
}

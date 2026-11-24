import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DM_FFS, DM_GRP, DM_LIB, DM_MAT, DM_RBI, dmBySlug, dmSlug } from "@/lib/eng/damage-mechanisms";
import { JsonLd, articleLd } from "@/lib/seo";
import { Crumbs } from "@/components/learn/crumbs";
import { IrisCta } from "@/components/eng/iris-cta";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return DM_LIB.map((d) => ({ slug: dmSlug(d) })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = dmBySlug((await params).slug); if (!d) return {};
  const title = `${d.n} — Causes, Affected Equipment, Inspection & Prevention (API 571 §${d.api})`;
  const description = d.sw.length > 155 ? `${d.sw.slice(0, 152).replace(/\s+\S*$/, "")}…` : d.sw;
  return { title, description, alternates: { canonical: `/learn/damage-mechanisms/${dmSlug(d)}` }, openGraph: { type: "article", title, description, url: `/learn/damage-mechanisms/${dmSlug(d)}` } };
}
const ROWS: [keyof typeof DM_LIB[number], string][] = [["why", "What causes it"], ["who", "Where it happens"], ["look", "What it looks like"], ["find", "How to find it"], ["stop", "How to prevent it"]];
export default async function DmPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = dmBySlug((await params).slug); if (!d) notFound();
  const path = `/learn/damage-mechanisms/${dmSlug(d)}`;
  const same = DM_LIB.filter((x) => x.g === d.g && x.id !== d.id).slice(0, 6);
  return <article className="max-w-4xl">
    <JsonLd data={articleLd({ title: `${d.n} (API 571 §${d.api})`, description: d.sw, path, about: d.n })} />
    <Crumbs items={[["Damage mechanisms", "/learn/damage-mechanisms"], [d.n, path]]} />
    <h1 className="mt-4 font-display text-3xl font-bold tracking-[-.03em] text-white md:text-4xl">{d.n}</h1>
    <p className="mt-2 font-mono text-xs text-white/45">API RP 571 §{d.api} · {DM_GRP[d.g as keyof typeof DM_GRP]}</p>
    <p className="mt-6 text-lg leading-8 text-white/80">{d.sw}</p>
    <dl className="mt-8 grid gap-4">{ROWS.map(([k, l]) => d[k] ? <div key={String(k)} className="rounded-2xl border border-white/10 p-5"><dt className="text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">{l}</dt><dd className="mt-2 leading-7 text-white/75">{String(d[k])}</dd></div> : null)}</dl>
    <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
      <div className="rounded-2xl border border-white/10 p-4"><p className="text-white/45">Materials</p><p className="mt-1 text-white/80">{d.mat.map((m: string) => DM_MAT[m as keyof typeof DM_MAT] || m).join(", ")}</p></div>
      <div className="rounded-2xl border border-white/10 p-4"><p className="text-white/45">RBI damage factor (API 581)</p><p className="mt-1 text-white/80">{DM_RBI[d.rbi as keyof typeof DM_RBI] || "—"}</p></div>
      <div className="rounded-2xl border border-white/10 p-4"><p className="text-white/45">Fitness-for-service (API 579-1)</p><p className="mt-1 text-white/80">{DM_FFS[d.ffs as keyof typeof DM_FFS] || "—"}</p></div>
    </div>
    {/^3\.\d+$/.test(d.api) && <Link href={`/learn/codes/api-571-damage-mechanisms/clauses#c-${d.api}`} className="mt-8 mr-3 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/85 hover:border-amber-100/60 hover:text-white">Clause-by-clause: API 571 §{d.api} →</Link>}
    <Link href="/engineering/damage-mechanism-screening" className="mt-8 inline-flex rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-black hover:bg-white">Does it apply to my equipment? Screen now →</Link>
    {same.length > 0 && <section className="mt-12"><h2 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">Related mechanisms</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{same.map((x) => <Link key={x.id} href={`/learn/damage-mechanisms/${dmSlug(x)}`} className="rounded-2xl border border-white/10 p-3 text-sm text-white/80 hover:border-amber-100/40 hover:text-white">{x.n}</Link>)}</div></section>}
    <IrisCta line="IRIS keeps a damage-mechanism review for every circuit and feeds it into the RBI and inspection plan." />
  </article>;
}

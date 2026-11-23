import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ENG_TOOLS, engTool } from "@/lib/eng/catalog";
import { JsonLd, breadcrumbLd, faqLd, toolLd } from "@/lib/seo";
import { ToolClient } from "@/components/eng/tool-client";
import { IrisCta } from "@/components/eng/iris-cta";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return ENG_TOOLS.map((t) => ({ slug: t.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = engTool((await params).slug);
  if (!t) return {};
  const path = `/engineering/${t.slug}`;
  return { title: t.title, description: t.description, alternates: { canonical: path }, openGraph: { title: t.title, description: t.description, url: path, type: "website" } };
}

export default async function EngToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = engTool((await params).slug);
  if (!t) notFound();
  const path = `/engineering/${t.slug}`;
  const related = ENG_TOOLS.filter((x) => x.slug !== t.slug).slice(0, 4);
  return <>
    <JsonLd data={[toolLd({ name: t.h1, description: t.description, path }), faqLd(t.faqs), breadcrumbLd([["Home", "/"], ["Engineering tools", "/engineering"], [t.name, path]])]} />
    <nav aria-label="Breadcrumb" className="text-sm text-white/50 print:hidden"><Link href="/engineering" className="hover:text-white">Engineering tools</Link> <span aria-hidden>›</span> <span className="text-white/75">{t.name}</span></nav>
    <header className="mt-4 max-w-3xl print:hidden"><h1 className="font-display text-3xl font-bold tracking-[-.04em] text-white md:text-5xl">{t.h1}</h1><p className="mt-4 text-lg leading-8 text-white/70">{t.intro}</p><p className="mt-2 font-mono text-xs text-white/45">{t.codes} · free · runs in your browser — nothing you type is sent anywhere</p></header>
    <section className="mt-8"><ToolClient slug={t.slug} /></section>
    <div className="mt-14 grid gap-10 lg:grid-cols-2 print:hidden">
      <section><h2 className="font-display text-2xl font-semibold text-white">How it is calculated</h2><ol className="mt-4 grid gap-3 text-white/70">{t.method.map((m, i) => <li key={i} className="flex gap-3"><span className="font-mono text-amber-100/80">{i + 1}.</span><span>{m}</span></li>)}</ol></section>
      <section><h2 className="font-display text-2xl font-semibold text-white">Questions engineers ask</h2><div className="mt-4 grid gap-2">{t.faqs.map(([q, a]) => <details key={q} className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer font-medium text-white">{q}</summary><p className="mt-2 text-white/65">{a}</p></details>)}</div></section>
    </div>
    <p className="mt-10 rounded-2xl border border-white/10 p-4 text-sm text-white/50 print:hidden">These calculators support, and do not replace, the judgement of a qualified engineer and the current edition of the code. Check the inputs against your own data before relying on a result.</p>
    <section className="mt-12 print:hidden"><h2 className="font-display text-xl font-semibold text-white">Related tools</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <Link key={r.slug} href={`/engineering/${r.slug}`} className="premium-card rounded-2xl border p-4 hover:border-amber-100/40"><p className="font-semibold text-white">{r.name}</p><p className="mt-1 text-sm text-white/60">{r.short}</p></Link>)}</div></section>
    <div className="print:hidden"><IrisCta /></div>
  </>;
}

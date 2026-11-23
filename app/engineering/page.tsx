import type { Metadata } from "next";
import Link from "next/link";
import { ENG_TOOLS } from "@/lib/eng/catalog";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
import { IrisCta } from "@/components/eng/iris-cta";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
const title = "Free Inspection & Mechanical Engineering Calculators — ASME, API 510/570/653, API 571";
const description = "Free online calculators for inspection and reliability engineers: pressure vessel and pipe thickness (ASME VIII, B31.3), corrosion rate and remaining life (API 510/570/653), hydrotest pressure, steam trap loss and API 571 damage mechanism screening.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/engineering" }, openGraph: { title, description, url: "/engineering" } };

const GROUPS: [string, string[]][] = [
  ["Design & thickness", ["pressure-vessel-thickness-calculator", "pipe-thickness-calculator", "hydrotest-pressure-calculator"]],
  ["Inspection & integrity", ["remaining-life-calculator", "damage-mechanism-screening"]],
  ["Materials & quality", ["material-spec-finder", "qap-builder"]],
  ["Energy & utilities", ["steam-trap-loss-calculator"]],
];

export default function EngineeringHub() {
  return <>
    <JsonLd data={[breadcrumbLd([["Home", "/"], ["Engineering tools", "/engineering"]]), { "@context": "https://schema.org", "@type": "ItemList", name: "Engineering calculators", itemListElement: ENG_TOOLS.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `${siteUrl}/engineering/${t.slug}`, name: t.h1 })) }]} />
    <header className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">Engineering tools</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">Calculators for inspection and plant engineers</h1><p className="mt-4 text-lg leading-8 text-white/70">Pick one task. Each tool opens with a worked example, shows every step of the working, and names the code clause it follows. Free, no sign-in, nothing leaves your browser.</p></header>
    {GROUPS.map(([g, slugs]) => <section key={g} className="mt-10"><h2 className="text-sm font-semibold uppercase tracking-[.14em] text-white/50">{g}</h2><div className="mt-3 grid gap-4 md:grid-cols-3">{slugs.map((s) => { const t = ENG_TOOLS.find((x) => x.slug === s)!; return <Link key={s} href={`/engineering/${s}`} className="premium-card group flex flex-col rounded-3xl border p-6 transition hover:border-amber-100/40"><p className="text-lg font-semibold text-white group-hover:text-amber-50">{t.name}</p><p className="mt-2 flex-1 text-sm leading-6 text-white/60">{t.short}</p><p className="mt-4 font-mono text-xs text-white/40">{t.codes}</p></Link>; })}</div></section>)}
    <section className="mt-12 grid gap-4 md:grid-cols-2"><Link href="/learn/damage-mechanisms" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-semibold text-white">Damage mechanisms library →</p><p className="mt-2 text-sm text-white/60">All 69 API 571 mechanisms in plain language: what, where, how to find and how to stop each one.</p></Link><Link href="/learn" className="premium-card rounded-3xl border p-6 hover:border-amber-100/40"><p className="font-semibold text-white">Learn →</p><p className="mt-2 text-sm text-white/60">Short guides on inspection, integrity and investing basics.</p></Link></section>
    <IrisCta />
  </>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { DM_GRP, DM_LIB, dmSlug } from "@/lib/eng/damage-mechanisms";
import { Crumbs } from "@/components/learn/crumbs";
import { FilterList } from "@/components/learn/filter-list";

export const dynamic = "force-static";
const title = "API 571 Damage Mechanisms — All 69 Explained (CUI, HTHA, Sulfidation, SCC, Wet H2S…)";
const description = "Plain-language library of all 69 API RP 571 damage mechanisms for fixed equipment: what each is, affected materials and units, appearance, inspection methods and prevention.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/learn/damage-mechanisms" }, openGraph: { title, description, url: "/learn/damage-mechanisms" } };

export default function DmIndex() {
  return <>
    <Crumbs items={[["Damage mechanisms", "/learn/damage-mechanisms"]]} />
    <header className="mt-4 max-w-3xl"><h1 className="font-display text-4xl font-bold tracking-[-.04em] text-white">Damage mechanisms (API 571)</h1><p className="mt-4 text-lg leading-8 text-white/70">All {DM_LIB.length} mechanisms in API RP 571 (2020), each explained in plain language. Not sure which apply to your equipment? <Link href="/engineering/damage-mechanism-screening" className="text-amber-100 hover:text-white">Run the screening tool</Link>.</p></header>
    <div className="mt-8"><FilterList placeholder="Search, e.g. chloride, hydrogen, 400 °C" groups={Object.entries(DM_GRP)} items={DM_LIB.map((d) => ({ href: `/learn/damage-mechanisms/${dmSlug(d)}`, title: d.n, text: d.sw, group: d.g, tag: `API 571 §${d.api}` }))} /></div>
  </>;
}

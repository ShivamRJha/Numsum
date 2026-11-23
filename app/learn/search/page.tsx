import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchFromUrl } from "@/components/learn/search-from-url";
import { Crumbs } from "@/components/learn/crumbs";

export const metadata: Metadata = { title: "Search the Learn Library — API Codes, Damage Mechanisms, Guides", description: "Search NumSum's learning library: API 510, 570, 571, 574, 579-1, 580 and 581 study modules, damage mechanisms, guides and tools.", alternates: { canonical: "/learn/search" }, robots: { index: false, follow: true } };
export default function SearchPage() {
  return <div className="max-w-3xl">
    <Crumbs items={[["Search", "/learn/search"]]} />
    <h1 className="mt-4 font-display text-3xl font-bold tracking-[-.03em] text-white">Search</h1>
    <div className="mt-6"><Suspense fallback={null}><SearchFromUrl /></Suspense></div>
  </div>;
}

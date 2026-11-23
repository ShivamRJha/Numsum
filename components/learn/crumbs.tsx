import Link from "next/link";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
export function Crumbs({ items }: { items: [string, string][] }) {
  const all: [string, string][] = [["Learn", "/learn"], ...items];
  return <><JsonLd data={breadcrumbLd([["Home", "/"], ...all])} /><nav aria-label="Breadcrumb" className="text-sm text-white/50">{all.map(([n, h], i) => <span key={h}>{i > 0 && <span aria-hidden className="mx-1.5">›</span>}{i < all.length - 1 ? <Link href={h} className="hover:text-white">{n}</Link> : <span className="text-white/75">{n}</span>}</span>)}</nav></>;
}

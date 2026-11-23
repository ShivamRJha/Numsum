"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const TOOL_LINKS = [
  ["Overview", "/tools"],
  ["Goal planner", "/tools/investment-planner"],
  ["Fund screener", "/tools/funds"],
  ["Stock screener", "/tools/stocks"],
  ["Stock analyzer", "/tools/stock-analyzer"],
  ["Portfolio check", "/tools/portfolio"],
] as const;

export function ToolsNav() {
  const path = usePathname() || "";
  return <nav aria-label="Investment tools" className="sticky top-16 z-30 -mx-6 mb-8 border-b border-white/10 bg-[#060a12]/85 px-6 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-2 text-sm">
      {TOOL_LINKS.map(([label, href]) => { const active = href === "/tools" ? path === "/tools" : path.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("whitespace-nowrap rounded-full px-4 py-2 transition", active ? "bg-amber-100 font-semibold text-black" : "text-white/65 hover:bg-white/10 hover:text-white")}>{label}</Link>; })}
    </div>
  </nav>;
}

export function ToolHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: React.ReactNode; children?: React.ReactNode }) {
  return <header className="mb-8 flex flex-wrap items-end justify-between gap-6"><div className="max-w-3xl"><p className="section-eyebrow">{eyebrow}</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] md:text-5xl">{title}</h1><div className="mt-4 text-white/65">{intro}</div></div>{children}</header>;
}

export function Disclaimer() {
  return <p className="mt-10 border-t border-white/10 pt-6 text-xs leading-5 text-white/45">For education and research only — not investment advice or a recommendation to buy or sell any security. NumSum Labs is not a SEBI-registered investment adviser or research analyst. Data comes from public sources, may be delayed or contain errors, and past performance does not indicate future returns. Investments in securities and mutual funds are subject to market risks; read all related documents carefully and consult a SEBI-registered adviser before investing.</p>;
}

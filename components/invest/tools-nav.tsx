"use client";
import { ExplainToggle } from "@/components/invest/explain";

export const TOOL_LINKS = [
  ["Overview", "/tools"],
  ["Goal planner", "/tools/investment-planner"],
  ["Fund screener", "/tools/funds"],
  ["Stock screener", "/tools/stocks"],
  ["Stock analyzer", "/tools/stock-analyzer"],
  ["Stock SIP builder", "/tools/stock-sip"],
  ["Portfolio check", "/tools/portfolio"],
  ["How it works", "/tools/methodology"],
] as const;

/** The page list lives in the site's section bar; this row keeps only the explanation-level switch. */
export function ToolsNav() {
  return <div className="mb-6 hidden items-center justify-end gap-2 sm:flex"><span className="text-xs text-white/45">Explain</span><ExplainToggle /></div>;
}

export function MobileExplainBar() {
  return <div className="mb-6 flex items-center justify-end gap-2 sm:hidden"><span className="text-xs text-white/45">Explain</span><ExplainToggle /></div>;
}

export function ToolHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: React.ReactNode; children?: React.ReactNode }) {
  return <header className="mb-8 flex flex-wrap items-end justify-between gap-6"><div className="max-w-3xl"><p className="section-eyebrow">{eyebrow}</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] md:text-5xl">{title}</h1><div className="mt-4 text-white/65">{intro}</div></div>{children}</header>;
}

export function Disclaimer() {
  return <p className="mt-10 border-t border-white/10 pt-6 text-xs leading-5 text-white/45">Built for long-term investing — a horizon of at least one year, usually through a monthly SIP. Not for trading or short-term bets. For education and research only — not investment advice or a recommendation to buy or sell any security. NumSum Labs is not a SEBI-registered investment adviser or research analyst. Data comes from public sources, may be delayed or contain errors, and past performance does not indicate future returns. Investments in securities and mutual funds are subject to market risks; read all related documents carefully and consult a SEBI-registered adviser before investing.</p>;
}

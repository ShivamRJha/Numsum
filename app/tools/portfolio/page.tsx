import type { Metadata } from "next";
import { PortfolioClient } from "@/components/invest/portfolio-client";
import { ToolHeader } from "@/components/invest/tools-nav";
import { NIFTY500 } from "@/lib/invest/sources";

export const metadata: Metadata = {
  title: "Portfolio Check — Correlation, Volatility & Diversification | NumSum Labs",
  description: "Check a basket of up to eight NSE stocks: correlation matrix, portfolio volatility, diversification ratio, industry concentration and risk-balanced weights.",
  alternates: { canonical: "/tools/portfolio" },
};

export default function PortfolioPage() {
  return <>
    <ToolHeader eyebrow="Portfolio check" title="Is your basket really diversified?" intro={<p>Add up to eight NSE stocks and your weights. The check measures how they move together over the last three years, the volatility of the whole basket, how much diversification you actually get, and suggests risk-balanced weights.</p>} />
    <PortfolioClient universe={NIFTY500} />
  </>;
}

import type { Metadata } from "next";
import { DataStatus } from "@/components/invest/data-quality";
import { StockSipClient } from "@/components/invest/stock-sip-client";
import { ToolHeader } from "@/components/invest/tools-nav";
import { loadStockSummary } from "@/lib/invest/load";

export const metadata: Metadata = {
  title: "Stock SIP Builder — Suggested Stocks for a Long-Term Monthly SIP | NumSum Labs",
  description: "Choose your monthly amount, horizon, risk and style; get a diversified basket of Nifty 500 stocks for a long-term SIP, with reasons, a monthly split and a wait list of stocks that have risen too much.",
  alternates: { canonical: "/tools/stock-sip" },
};

export default async function StockSipPage() {
  const doc = await loadStockSummary();
  return <>
    <ToolHeader eyebrow="Stock SIP builder" title="Stocks for a long-term monthly SIP." intro={<p>Tell us how much you want to invest in stocks each month, for how long, and what kind of companies you prefer. You get a diversified basket with the reason for each choice, a monthly split, and a wait list of good companies whose prices have run up too far.</p>}>
      <DataStatus label="Prices" iso={doc?.asOf} checks={doc?.checks} />
    </ToolHeader>
    <StockSipClient rows={doc?.rows || []} industries={doc?.industries || {}} asOf={doc?.asOf || null} />
  </>;
}

"use client";

import Link from "next/link";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Explain, Term } from "@/components/invest/explain";
import { Badge, ScoreBar, Stat, field, pct } from "@/components/invest/kit";
import { Card } from "@/components/ui";
import { db } from "@/lib/firebase";
import { inr } from "@/lib/invest/planner";
import { buildStockSip, RISK_RULES, SIP_DEFAULTS, STYLE_RULES, type SipInputs, type SipRisk, type SipStyle } from "@/lib/invest/stock-sip";
import type { StockLite } from "@/lib/invest/stocks";
import { cn } from "@/lib/utils";

const chip = (on: boolean) => cn("rounded-full border px-3 py-1.5 text-sm transition", on ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/65 hover:text-white");

export function StockSipClient({ rows, industries, asOf }: { rows: StockLite[]; industries: Record<string, { pe: number | null; count: number }>; asOf: string | null }) {
  const { user, requestAuth } = useAuth();
  const [x, setX] = useState<SipInputs>(SIP_DEFAULTS);
  const [msg, setMsg] = useState("");
  useEffect(() => { try { const s = new URLSearchParams(window.location.search).get("q"); if (s) setX({ ...SIP_DEFAULTS, ...JSON.parse(decodeURIComponent(escape(atob(s)))) }); } catch { /* ignore bad links */ } }, []);
  const set = <K extends keyof SipInputs>(k: K, v: SipInputs[K]) => setX((o) => ({ ...o, [k]: v }));
  const res = useMemo(() => buildStockSip(rows, x, industries), [rows, x, industries]);
  const inds = useMemo(() => Object.entries(industries).sort((a, b) => b[1].count - a[1].count).map(([k]) => k), [industries]);

  function csv() {
    const lines = [["Symbol", "Company", "Industry", "Monthly ₹", "Share %", "Fit score", "Heat", "Reasons"], ...res.picks.map((p) => [p.row.s, p.row.n, p.row.i, String(p.monthly), (p.weight * 100).toFixed(1), String(p.fit), p.row.hl || "", p.reasons.join("; ")])];
    const blob = new Blob([lines.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `numsum-stock-sip-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }
  function share() {
    const url = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(x)))))}`;
    navigator.clipboard?.writeText(url).then(() => setMsg("Link copied.")).catch(() => window.prompt("Copy this link", url));
  }
  async function save() {
    if (!user) { requestAuth(); return; }
    try { await addDoc(collection(db, "investment_plans"), { userId: user.uid, name: `Stock SIP ${inr(x.monthly, false)}/month`, inputs: { kind: "stock-sip", ...x, picks: res.picks.map((p) => ({ s: p.row.s, m: p.monthly })) }, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); setMsg("Saved to your account."); }
    catch { setMsg("Could not save right now. Please try again later."); }
  }

  if (!rows.length) return <Card><p className="text-white/60">Stock data appears after the first nightly refresh.</p></Card>;

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
    <Card className="premium-card h-fit lg:sticky lg:top-32">
      <h2 className="font-display text-2xl">Your choices</h2>
      <Explain>This builder is for a monthly <Term id="sip">SIP</Term> held for at least a year. It never suggests trading or one-time “quick jumps”.</Explain>
      <div className="mt-4 grid gap-5">
        <div><label htmlFor="ss-amt" className="mb-1.5 flex justify-between text-sm text-white/75"><span>Monthly amount for stocks</span><span className="text-white/45">{inr(x.monthly)}</span></label><input id="ss-amt" type="number" min={1000} step={1000} value={x.monthly} onChange={(e) => set("monthly", Math.max(1000, Number(e.target.value) || 1000))} className={field} /></div>
        <div><label htmlFor="ss-yrs" className="mb-1.5 flex justify-between text-sm text-white/75"><span>How long will you keep investing?</span><span className="text-white/45">{x.years} {x.years === 1 ? "year" : "years"}</span></label><input id="ss-yrs" type="range" min={1} max={20} value={x.years} onChange={(e) => set("years", Number(e.target.value))} className="w-full accent-amber-200" /><p className="mt-1 text-xs text-white/45">Minimum 1 year. Shares reward patience — 5+ years is ideal.</p></div>
        <fieldset><legend className="mb-2 text-sm text-white/75">Risk level</legend><div className="flex flex-wrap gap-2">{(Object.keys(RISK_RULES) as SipRisk[]).map((r) => <button key={r} type="button" aria-pressed={x.risk === r} onClick={() => set("risk", r)} className={chip(x.risk === r)}>{RISK_RULES[r].label}</button>)}</div><p className="mt-1.5 text-xs text-white/50">{RISK_RULES[x.risk].text}</p></fieldset>
        <fieldset><legend className="mb-2 text-sm text-white/75">Style</legend><div className="flex flex-wrap gap-2">{(Object.keys(STYLE_RULES) as SipStyle[]).map((s) => <button key={s} type="button" aria-pressed={x.style === s} onClick={() => set("style", s)} className={chip(x.style === s)}>{STYLE_RULES[s].label}</button>)}</div><p className="mt-1.5 text-xs text-white/50">{STYLE_RULES[x.style].text}</p></fieldset>
        <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer text-sm font-semibold text-white/80">Industries to leave out {x.excludeIndustries.length ? `(${x.excludeIndustries.length})` : ""}</summary><div className="mt-3 flex flex-wrap gap-2">{inds.map((i) => { const on = x.excludeIndustries.includes(i); return <button key={i} type="button" aria-pressed={on} onClick={() => set("excludeIndustries", on ? x.excludeIndustries.filter((k) => k !== i) : [...x.excludeIndustries, i])} className={cn(chip(on), "text-xs")}>{on ? "✕ " : ""}{i}</button>; })}</div></details>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-white/75">Max per industry<select value={x.maxPerIndustry} onChange={(e) => set("maxPerIndustry", Number(e.target.value))} className={cn(field, "mt-1.5")}>{[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label className="text-sm text-white/75">Number of stocks<select value={x.count ?? 0} onChange={(e) => set("count", Number(e.target.value) || null)} className={cn(field, "mt-1.5")}><option value={0}>Auto</option>{[5, 8, 10, 12, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        </div>
        <label className="flex items-start gap-3 text-sm text-white/75"><input type="checkbox" checked={x.avoidHot} onChange={(e) => set("avoidHot", e.target.checked)} className="mt-1 h-4 w-4 accent-amber-200" /><span>Also wait on <Term id="heat">“Hot”</Term> stocks (Overheated stocks are always kept out)</span></label>
      </div>
    </Card>

    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Stocks" value={res.picks.length} hint={`from ${res.afterFilters} that fit your choices`} /><Stat label="Industries" value={res.industries} /><Stat label={<Term id="volatility">Avg volatility</Term>} value={pct(res.avgVol, 0)} /><Stat label={<Term id="beta">Avg beta</Term>} value={res.avgBeta ? res.avgBeta.toFixed(2) : "—"} /></div>
      {res.notes.map((n) => <p key={n} className="rounded-2xl border border-amber-200/25 bg-amber-200/5 px-4 py-3 text-sm text-amber-50/90">{n}</p>)}
      <Card className="premium-card">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl">Suggested basket</h2><p className="mt-1 text-sm text-white/55">{inr(x.monthly, false)} a month · prices as of {asOf || "—"}</p></div><div className="flex flex-wrap gap-2"><Link href={`/tools/portfolio?s=${res.picks.map((p) => encodeURIComponent(p.row.s)).join(",")}`} className="glass rounded-full px-4 py-2 text-sm text-white">Check diversification</Link><button type="button" onClick={csv} className="glass rounded-full px-4 py-2 text-sm text-white">Download CSV</button><button type="button" onClick={share} className="glass rounded-full px-4 py-2 text-sm text-white">Copy link</button><button type="button" onClick={save} className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-black hover:bg-white">{user ? "Save" : "Sign in to save"}</button></div></div>
        {msg && <p className="mt-2 text-sm text-white/60" role="status">{msg}</p>}
        <Explain>Each stock is ranked by how well it fits your style, using the long-term pillar scores (quality, valuation, risk, trend, growth). The monthly split gives steadier stocks a little more (<Term id="riskbalanced">risk-balanced</Term>), so no single wild stock dominates.</Explain>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-[.12em] text-white/45"><tr><th className="py-2 pr-3">Stock</th><th className="py-2 pr-3">Fit</th><th className="py-2 pr-3"><Term id="heat">Heat</Term></th><th className="py-2 pr-3 text-right">Per month</th><th className="py-2 pr-3 text-right">Share</th><th className="py-2">Why it was chosen</th></tr></thead>
          <tbody>{res.picks.map((p) => <tr key={p.row.s} className="border-t border-white/8 align-top"><td className="py-2.5 pr-3"><Link href={`/tools/stock-analyzer/${encodeURIComponent(p.row.s)}`} className="font-medium text-blue-100 hover:text-white">{p.row.n}</Link><p className="text-xs text-white/40">{p.row.s} · {p.row.i}</p></td><td className="py-2.5 pr-3"><ScoreBar score={p.fit} /></td><td className="py-2.5 pr-3">{p.row.hl ? <Badge kind={p.row.hl}>{p.row.hl}</Badge> : "—"}</td><td className="py-2.5 pr-3 text-right font-mono">{inr(p.monthly, false)}</td><td className="py-2.5 pr-3 text-right font-mono">{pct(p.weight, 0)}</td><td className="py-2.5"><div className="flex flex-wrap gap-1.5">{p.reasons.map((r) => <span key={r} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/70">{r}</span>)}</div></td></tr>)}</tbody></table></div>
      </Card>

      {res.waitlist.length > 0 && <Card><h2 className="font-display text-2xl">Wait list — good fit, but risen too much</h2><Explain always>These match your choices but their prices have run up too far, too fast. Long-term investors usually wait for them to cool down (price closer to its 200-day average) or start with a very small amount.</Explain><ul className="mt-3 grid gap-2 md:grid-cols-2">{res.waitlist.map((w) => <li key={w.row.s} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-2.5 text-sm"><Link href={`/tools/stock-analyzer/${encodeURIComponent(w.row.s)}`} className="text-blue-100 hover:text-white">{w.row.n}</Link><Badge kind={w.row.hl}>{w.row.hl}</Badge></li>)}</ul></Card>}

      <Card className="premium-card"><h2 className="font-display text-2xl">How to run this SIP</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/70">
          <li>Invest on the same date every month, whatever the market is doing. Falls are when a SIP buys the most shares.</li>
          <li>Hold each purchase for at least 12 months — gains after one year are taxed as long-term capital gains, at a lower rate than short-term gains.</li>
          <li>Review every quarter after results: open each stock in the <Link href="/tools/stock-analyzer" className="underline">analyzer</Link>. Replace a stock only if its business checks keep failing, not because the price fell.</li>
          <li>Rebalance once a year back to the suggested split; do not add extra to stocks that turned “Hot”.</li>
          <li>Keep direct stocks to a minority of your equity money and keep an emergency fund separately. Use the <Link href="/tools/investment-planner" className="underline">goal planner</Link> for the full picture.</li>
        </ol></Card>
    </div>
  </div>;
}

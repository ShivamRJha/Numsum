"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { field } from "@/components/invest/kit";

export function StockSearch({ universe, autoFocus, onPick, placeholder = "Search a stock — name or NSE symbol (e.g. RELIANCE)" }: { universe: [string, string, string][]; autoFocus?: boolean; onPick?: (symbol: string) => void; placeholder?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => { const t = q.trim().toLowerCase(); if (!t) return []; return universe.filter(([s, n]) => s.toLowerCase().startsWith(t) || n.toLowerCase().includes(t)).slice(0, 8); }, [q, universe]);
  const go = (s: string) => { const sym = s.trim().toUpperCase(); if (!sym) return; setQ(""); setOpen(false); if (onPick) onPick(sym); else router.push(`/tools/stock-analyzer/${encodeURIComponent(sym)}`); };
  return <form className="relative" role="search" onSubmit={(e) => { e.preventDefault(); go(hits[0]?.[0] || q); }}>
    <div className="flex gap-2"><input aria-label="Stock symbol or name" value={q} autoFocus={autoFocus} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder={placeholder} className={field} autoComplete="off" /><button type="submit" className="rounded-full bg-amber-100 px-5 text-sm font-semibold text-black hover:bg-white">{onPick ? "Add" : "Analyse"}</button></div>
    {open && hits.length > 0 && <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl">{hits.map(([s, n, i]) => <li key={s}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => go(s)} className="flex w-full justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/10"><span className="text-white">{n}</span><span className="text-white/45">{s} · {i}</span></button></li>)}</ul>}
  </form>;
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchBox } from "@/components/learn/search-box";
import { siteMenu } from "@/lib/navigation";

/** Site-wide search: a button in the header plus Ctrl/⌘-K and "/" shortcuts. */
export function CommandPalette({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return <>
    {compact
      ? <button type="button" onClick={() => setOpen(true)} aria-label="Search the site" className="rounded-full border border-white/10 p-2.5 text-white/75 transition hover:border-white/30 hover:text-white"><Search size={16} /></button>
      : <button type="button" onClick={() => setOpen(true)} className="flex w-56 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-white/45 transition hover:border-white/25 hover:text-white/70 xl:w-64"><Search size={15} /><span className="flex-1 text-left">Search codes, tools…</span><kbd className="rounded-md border border-white/15 px-1.5 text-[10px] text-white/45">Ctrl K</kbd></button>}
    {open && <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 pt-[8vh] backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#070c16] p-4 shadow-[0_40px_120px_rgba(0,0,0,.7)] animate-pop-in">
        <div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/45">Search NumSum</p><button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"><X size={16} /></button></div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <SearchBox autoFocus placeholder="Clause (510 7.1), mechanism (CUI), tool (remaining life)…" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {siteMenu.map((g) => <div key={g.label}><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/40">{g.label}</p><ul className="mt-1.5 grid gap-0.5">{g.links.slice(0, 4).map((l) => <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-1.5 text-sm text-white/75 hover:bg-white/[0.07] hover:text-white">{l.label}</Link></li>)}</ul></div>)}
          </div>
        </div>
      </div>
    </div>}
  </>;
}

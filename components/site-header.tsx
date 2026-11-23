"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AuthNav } from "@/components/auth-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/lib/brand";
import { siteMenu, siteMenuLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(path: string, href: string) { const h = href.split("#")[0]; return h === "/" ? path === "/" : path === h || path.startsWith(`${h}/`); }

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const pathname = usePathname() || "/";
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); setMenu(null); }, [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(null); setOpen(false); } };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#02050a]/80 backdrop-blur-2xl print:hidden">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5" aria-label="Primary navigation">
        <Link className="group flex shrink-0 items-center gap-3" href="/" aria-label="NumSum Labs home">
          <Image src={brand.logo} alt="" width={38} height={38} className="rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(96,165,250,.18)] transition group-hover:scale-105" priority />
          <span className="font-display text-xl font-bold tracking-[-.04em] sm:text-2xl">NumSum Labs</span>
        </Link>
        <div ref={navRef} className="mx-auto hidden items-center gap-0.5 text-sm text-white/70 lg:flex">
          {siteMenu.map((g) => { const active = g.links.some((l) => isActive(pathname, l.href)); const isOpen = menu === g.label; return <div key={g.label} className="relative" onMouseEnter={() => setMenu(g.label)} onMouseLeave={() => setMenu((m) => (m === g.label ? null : m))}>
            <button type="button" aria-expanded={isOpen} aria-haspopup="true" onClick={() => setMenu(isOpen ? null : g.label)} className={cn("flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60", (active || isOpen) && "bg-white/10 text-white")}>{g.label}<ChevronDown size={14} className={cn("transition", isOpen && "rotate-180")} aria-hidden="true" /></button>
            {isOpen && <div className="absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-2"><div className="rounded-3xl border border-white/10 bg-[#070c16]/98 p-2 shadow-[0_30px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">{g.links.map((l) => <Link key={l.href} href={l.href} onClick={() => setMenu(null)} className={cn("block rounded-2xl px-4 py-3 transition hover:bg-white/[0.07]", isActive(pathname, l.href) && "bg-white/[0.06]")}><span className="block font-medium text-white">{l.label}</span>{l.desc && <span className="mt-0.5 block text-xs text-white/50">{l.desc}</span>}</Link>)}</div></div>}
          </div>; })}
          {siteMenuLinks.map((l) => <Link key={l.href} href={l.href} className={cn("whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white", isActive(pathname, l.href) && "bg-white/10 text-white")}>{l.label}</Link>)}
        </div>
        <div className="ml-auto hidden items-center gap-2 lg:flex"><ThemeToggle /><AuthNav /></div>
        <ThemeToggle className="ml-auto lg:hidden" />
        <button className="rounded-full border border-white/10 p-3 text-white/75 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen((value) => !value)}>{open ? <X size={18} /> : <Menu size={18} />}</button>
      </nav>
      {open && <div id="mobile-site-menu" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-[#02050a]/98 px-5 pb-6 lg:hidden"><div className="mx-auto grid max-w-7xl gap-2 pt-4">
        {siteMenu.map((g) => { const isOpen = mobileGroup === g.label; return <section key={g.label} className="rounded-2xl border border-white/10 bg-white/[0.03]"><button type="button" aria-expanded={isOpen} onClick={() => setMobileGroup(isOpen ? null : g.label)} className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-medium text-white">{g.label}<ChevronDown size={16} className={cn("transition", isOpen && "rotate-180")} /></button>{isOpen && <div className="grid gap-1 px-2 pb-2">{g.links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-white/80 hover:bg-white/[0.06]">{l.label}</Link>)}</div>}</section>; })}
        <div className="grid grid-cols-2 gap-2">{siteMenuLinks.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-white/85">{l.label}</Link>)}</div>
        <section className="mt-3"><p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-white/45">Account</p><AuthNav mobile /></section>
      </div></div>}
    </header>
  );
}

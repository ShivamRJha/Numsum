"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AuthNav } from "@/components/auth-nav";
import { CommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/lib/brand";
import { sectionFor, siteMenu, siteMenuLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(path: string, href: string) { const h = href.split("#")[0]; return h === "/" ? path === "/" : path === h || path.startsWith(`${h}/`); }
/** the most specific matching link wins, so "/learn" is not lit up on "/learn/codes" */
function activeHref(path: string, hrefs: string[]) { return hrefs.filter((h) => isActive(path, h)).sort((a, b) => b.length - a.length)[0]; }

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";
  const navRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const section = sectionFor(pathname);
  useEffect(() => { setOpen(false); setMenu(null); setMobileGroup(sectionFor(pathname)?.label ?? null); }, [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(null); setOpen(false); } };
    const scroll = () => setScrolled(window.scrollY > 8);
    scroll();
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc); window.addEventListener("scroll", scroll, { passive: true });
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); window.removeEventListener("scroll", scroll); };
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const enter = (label: string) => { clearTimeout(timer.current); setMenu(label); };
  const leave = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setMenu(null), 120); };
  const sectionActive = section ? activeHref(pathname, section.links.map((l) => l.href)) : undefined;

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-[#02050a]/80 backdrop-blur-2xl transition-colors print:hidden", scrolled ? "border-white/10" : "border-transparent")}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5" aria-label="Primary navigation">
        <Link className="group flex shrink-0 items-center gap-2.5" href="/" aria-label="NumSum Labs home">
          <Image src={brand.logo} alt="" width={34} height={34} className="rounded-xl bg-white p-1.5 transition group-hover:rotate-[-6deg] group-hover:scale-105" priority />
          <span className="font-display text-lg font-bold tracking-[-.04em] sm:text-xl">NumSum<span className="text-white/45"> Labs</span></span>
        </Link>

        <div ref={navRef} className="ml-4 hidden items-center gap-0.5 text-sm text-white/70 lg:flex" onMouseLeave={leave}>
          {siteMenu.map((g) => {
            const here = section?.label === g.label; const isOpen = menu === g.label;
            return <div key={g.label} className="relative" onMouseEnter={() => enter(g.label)}>
              <button type="button" aria-expanded={isOpen} aria-haspopup="true" onClick={() => setMenu(isOpen ? null : g.label)}
                className={cn("relative flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 transition xl:px-3 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60", (here || isOpen) && "text-white", isOpen && "bg-white/[0.07]")}>
                {g.label}<ChevronDown size={13} className={cn("opacity-60 transition", isOpen && "rotate-180")} aria-hidden="true" />
                {here && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-amber-100" aria-hidden="true" />}
              </button>
              {isOpen && <div className="absolute left-0 top-full z-50 pt-3" onMouseEnter={() => enter(g.label)}>
                <div className="grid w-[40rem] grid-cols-[1fr_13rem] overflow-hidden rounded-3xl border border-white/10 bg-[#070c16] shadow-[0_30px_80px_rgba(0,0,0,.55)] animate-menu-in">
                  <div className="grid grid-cols-2 gap-0.5 p-2">{g.links.map((l) => <Link key={l.href} href={l.href} onClick={() => setMenu(null)} className={cn("rounded-2xl px-3.5 py-2.5 transition hover:bg-white/[0.07]", isActive(pathname, l.href) && "bg-white/[0.06]")}><span className="block text-sm font-medium text-white">{l.label}</span>{l.desc && <span className="mt-0.5 block text-xs leading-snug text-white/50">{l.desc}</span>}</Link>)}</div>
                  <div className="flex flex-col justify-between border-l border-white/10 bg-white/[0.025] p-4">
                    <div><p className="font-display text-base font-semibold text-white">{g.label}</p><p className="mt-1.5 text-xs leading-relaxed text-white/55">{g.blurb}</p></div>
                    <div className="mt-4 grid gap-3">{g.cta && <Link href={g.cta.href} onClick={() => setMenu(null)} className="group/cta inline-flex items-center gap-1.5 text-sm font-semibold text-amber-100 hover:text-white">{g.cta.label}<ArrowRight size={14} className="transition group-hover/cta:translate-x-0.5" /></Link>}<p className="flex gap-3 border-t border-white/10 pt-3 text-xs text-white/50">{siteMenuLinks.map((l) => <Link key={l.href} href={l.href} onClick={() => setMenu(null)} className="hover:text-white">{l.label}</Link>)}</p></div>
                  </div>
                </div>
              </div>}
            </div>;
          })}
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex"><div className="hidden 2xl:block"><CommandPalette /></div><div className="2xl:hidden"><CommandPalette compact /></div><ThemeToggle /><AuthNav /></div>
        <div className="ml-auto flex items-center gap-2 lg:hidden"><CommandPalette compact /><button className="rounded-full border border-white/10 p-2.5 text-white/75" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-site-menu" onClick={() => setOpen((value) => !value)}>{open ? <X size={18} /> : <Menu size={18} />}</button></div>
      </nav>

      {/* Section bar: where you are and the pages next to it, always one tap away */}
      {section && section.links.length > 1 && <div className="border-t border-white/[0.06]">
        <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-5 py-1.5 text-[13px]">
          <Link href={section.home} className="mr-2 shrink-0 font-semibold text-white/85">{section.label}</Link>
          {section.links.map((l) => <Link key={l.href} href={l.href} aria-current={l.href === sectionActive ? "page" : undefined} className={cn("shrink-0 whitespace-nowrap rounded-full px-3 py-1 transition", l.href === sectionActive ? "bg-amber-100/15 text-amber-50" : "text-white/55 hover:bg-white/[0.06] hover:text-white")}>{l.label}</Link>)}
        </div>
      </div>}

      {open && <div id="mobile-site-menu" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-[#02050a] px-5 pb-10 lg:hidden animate-fade-in"><div className="mx-auto grid max-w-7xl gap-2 pt-4">
        {siteMenu.map((g) => { const isOpen = mobileGroup === g.label; return <section key={g.label} className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <button type="button" aria-expanded={isOpen} onClick={() => setMobileGroup(isOpen ? null : g.label)} className="flex w-full items-center justify-between px-4 py-3.5 text-left"><span><span className="block text-base font-medium text-white">{g.label}</span><span className="block text-xs text-white/45">{g.blurb}</span></span><ChevronDown size={16} className={cn("shrink-0 transition", isOpen && "rotate-180")} /></button>
          {isOpen && <div className="grid gap-0.5 px-2 pb-2">{[...g.links, ...(g.cta ? [g.cta] : [])].map((l) => <Link key={l.href + l.label} href={l.href} onClick={() => setOpen(false)} className={cn("rounded-xl px-3 py-2.5 text-white/80 hover:bg-white/[0.06]", isActive(pathname, l.href) && "bg-white/[0.06] text-white")}>{l.label}{l.desc && <span className="block text-xs text-white/45">{l.desc}</span>}</Link>)}</div>}
        </section>; })}
        <div className="grid grid-cols-2 gap-2">{siteMenuLinks.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-white/85">{l.label}</Link>)}</div>
        <div className="mt-1 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-white/60">Theme <ThemeToggle /></div>
        <section className="mt-3"><p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-white/45">Account</p><AuthNav mobile /></section>
      </div></div>}
    </header>
  );
}

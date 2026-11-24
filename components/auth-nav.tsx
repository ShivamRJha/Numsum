"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, type User } from "firebase/auth";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";

const item = "block rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white";

/** One account button instead of separate Dashboard / bell / Admin / name pills. */
function AccountMenu({ user, isAdmin }: { user: User; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close);
  }, []);
  const name = user.displayName || user.email || "Account";
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  return <div ref={ref} className="relative">
    <button aria-expanded={open} aria-label="Account menu" className="flex items-center gap-1.5 rounded-full border border-white/10 py-1 pl-1 pr-2 text-white/80 transition hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200/70" onClick={() => setOpen((v) => !v)}>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-300 to-amber-100 text-xs font-bold text-navy">{initial}</span>
      <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="absolute right-0 z-50 mt-3 w-60 rounded-2xl border border-white/10 bg-[#07111f] p-2 shadow-2xl animate-menu-in">
      <p className="truncate px-3 pb-2 pt-1 text-xs text-white/45">{name}</p>
      <Link className={item} href="/dashboard">Dashboard</Link>
      <Link className={item} href="/notifications">Notifications</Link>
      <Link className={item} href="/profile">My profile</Link>
      <Link className={item} href="/dashboard/problems">My problems</Link>
      <Link className={item} href="/dashboard/challenges">My challenges</Link>
      <Link className={item} href="/teams">My teams</Link>
      {isAdmin && <><div className="my-2 h-px bg-white/10" /><Link className={`${item} text-blue-200`} href="/admin">Admin</Link><Link className={`${item} text-blue-200`} href="/admin/system-health">System health</Link></>}
      <div className="my-2 h-px bg-white/10" />
      <Link className={item} href="/settings">Settings</Link>
      <button className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-100 hover:bg-red-500/10" onClick={() => signOut(auth)}>Log out</button>
    </div>}
  </div>;
}

export function AuthNav({ mobile = false }: { mobile?: boolean }) {
  const { user, profile, requestAuth } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  if (mobile) {
    const m = "rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/80";
    return <div className="grid gap-2">{user ? <><Link className={m} href="/dashboard">Dashboard</Link><Link className={m} href="/notifications">Notifications</Link><Link className={m} href="/profile">My profile</Link><Link className={m} href="/settings">Settings</Link>{isAdmin && <Link className="rounded-2xl border border-blue-300/20 bg-blue-300/10 px-4 py-3 text-blue-100" href="/admin">Admin</Link>}<button className="rounded-2xl border border-red-200/15 px-4 py-3 text-left text-red-100" onClick={() => signOut(auth)}>Log out</button></> : <div className="grid grid-cols-2 gap-2"><button className="rounded-2xl border border-white/10 px-4 py-3 text-white/80" onClick={() => requestAuth()}>Sign in</button><Link className="rounded-2xl bg-blue-300 px-4 py-3 text-center font-semibold text-navy" href="/join">Join free</Link></div>}</div>;
  }
  return <div className="flex items-center gap-1.5">{user ? <AccountMenu user={user} isAdmin={isAdmin} /> : <><button className="rounded-full px-3 py-2 text-sm text-white/70 transition hover:text-white" onClick={() => requestAuth()}>Sign in</button><Link className="rounded-full bg-blue-300 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-blue-200" href="/join">Join free</Link></>}</div>;
}

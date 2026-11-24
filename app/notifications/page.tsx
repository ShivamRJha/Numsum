"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui";
import { listAlerts, markAlertRead, type Alert } from "@/lib/research/store";

export default function NotificationsPage() {
  const { user, loading, requestAuth } = useAuth();
  const [items, setItems] = useState<Alert[] | null>(null);
  useEffect(() => { if (user) listAlerts(user.uid).then(setItems).catch(() => setItems([])); }, [user]);
  if (loading) return <main className="min-h-screen bg-navy px-6 py-10" />;
  if (!user) return <main className="min-h-screen bg-navy px-6 py-10"><Card className="mx-auto max-w-2xl"><h1 className="font-display text-4xl">Notifications require sign in.</h1><button className="mt-6 rounded-full bg-blue-400 px-5 py-3 font-semibold text-navy" onClick={() => requestAuth({ returnTo: "/notifications" })}>Sign In</button></Card></main>;
  const read = (id: string) => markAlertRead(id).then(() => setItems((x) => x?.map((y) => y.id === id ? { ...y, read: true } : y) || null));
  return <main className="min-h-screen bg-navy px-6 py-10"><div className="mx-auto max-w-3xl"><h1 className="font-display text-5xl">Notifications</h1>
    {items === null ? <p className="mt-8 text-white/50">Loading…</p> : !items.length ? <Card className="mt-8"><p className="text-white/60">Nothing yet. Research alerts, reviews and replies will appear here. Set your keywords on the <Link href="/research/radar" className="text-blue-200">research radar</Link> to get daily paper alerts.</p></Card> :
      <ul className="mt-8 grid gap-3">{items.map((n) => <li key={n.id} className={`rounded-2xl border p-4 ${n.read ? "border-white/10" : "border-blue-300/30 bg-blue-400/[0.06]"}`}><p className="text-xs uppercase tracking-[.14em] text-blue-200/80">{n.title}</p><p className="mt-1 text-white/85">{n.message}</p><div className="mt-2 flex gap-4 text-sm">{n.link && <a href={n.link} target="_blank" rel="noreferrer" onClick={() => read(n.id)} className="text-blue-200 hover:text-white">Open ↗</a>}{!n.read && <button type="button" onClick={() => read(n.id)} className="text-white/50 hover:text-white">Mark read</button>}</div></li>)}</ul>}
  </div></main>;
}

"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { PATHS } from "@/lib/research/paths";
import { createPosition, listMyPositions, listPositions, setPositionStatus } from "@/lib/research/store";
import { POSITION_TYPES, type Position, type PositionType } from "@/lib/research/types";

const input = "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35";
const label = Object.fromEntries(POSITION_TYPES) as Record<PositionType, string>;
const empty = { type: "phd" as PositionType, title: "", org: "", location: "", field: "Mechanical Engineering", description: "", link: "", deadline: "" };

export function PositionsClient() {
  const { user, profile } = useAuth();
  const [list, setList] = useState<Position[] | null>(null); const [mine, setMine] = useState<Position[]>([]);
  const [type, setType] = useState<PositionType | "all">("all"); const [field, setField] = useState("all");
  const [form, setForm] = useState(empty); const [show, setShow] = useState(false); const [msg, setMsg] = useState("");
  const load = () => { listPositions().then(setList).catch(() => setList([])); if (user) listMyPositions(user.uid).then(setMine).catch(() => setMine([])); };
  useEffect(() => { load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = new Date().toISOString().slice(0, 10);
  const shown = (list || []).filter((p) => (type === "all" || p.type === type) && (field === "all" || p.field === field) && (!p.deadline || p.deadline >= today));
  const submit = async () => {
    if (!user || !form.title.trim() || !form.org.trim() || !form.description.trim()) { setMsg("Title, organisation and description are required."); return; }
    try { await createPosition({ ...form, title: form.title.trim().slice(0, 160), org: form.org.trim(), description: form.description.trim().slice(0, 3000), link: form.link.trim() || undefined, deadline: form.deadline || undefined, location: form.location.trim() || undefined, authorId: user.uid, authorName: profile?.fullName || profile?.displayName || profile?.name || "Member" }); setForm(empty); setShow(false); setMsg("Posted."); load(); }
    catch { setMsg("Couldn't post — please try again."); }
  };
  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <div className="min-w-0">
      <div className="flex flex-wrap gap-2"><select value={type} onChange={(e) => setType(e.target.value as PositionType | "all")} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"><option value="all">All types</option>{POSITION_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select value={field} onChange={(e) => setField(e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"><option value="all">All fields</option>{PATHS.map((p) => <option key={p.slug}>{p.name}</option>)}<option>Other</option></select></div>
      {list === null ? <p className="mt-6 text-white/50">Loading…</p> : !shown.length ? <p className="mt-6 text-white/60">No open positions match. Post one if you are offering a place.</p> :
        <ul className="mt-4 grid gap-3">{shown.map((p) => <li key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-violet-200/15 px-2 py-0.5 font-semibold text-violet-100">{label[p.type]}</span><span className="text-white/50">{p.field}</span>{p.deadline && <span className="text-amber-100/80">Apply by {p.deadline}</span>}</div>
          <p className="mt-2 font-semibold text-white">{p.title}</p><p className="text-sm text-white/55">{p.org}{p.location ? ` · ${p.location}` : ""}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/45"><span>Posted by {p.authorName}</span>{p.link && <a href={p.link} target="_blank" rel="noreferrer" className="font-semibold text-violet-100 hover:text-white">Details and how to apply ↗</a>}</div>
        </li>)}</ul>}
    </div>
    <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
      <div className="rounded-3xl border border-white/10 p-5"><p className="font-semibold text-white">Offer a position</p><p className="mt-1 text-xs text-white/50">PhD, postdoc, internship, research assistant or an open collaboration. Link to the official advert where one exists.</p>
        {!show ? <button type="button" onClick={() => setShow(true)} className="mt-3 rounded-xl bg-violet-200 px-4 py-2 text-sm font-semibold text-black">Post a position</button> : <div className="mt-3 grid gap-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PositionType })} className={input}>{POSITION_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title, e.g. PhD in physics-informed CFD" className={input} />
          <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="University, lab or company" className={input} />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, country or remote" className={input} />
          <select value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} className={input}>{PATHS.map((p) => <option key={p.slug}>{p.name}</option>)}<option>Other</option></select>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Topic, requirements, funding, how to apply" className={input} />
          <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Official link (optional)" className={input} />
          <label className="text-xs text-white/50">Deadline (optional)<input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={`${input} mt-1`} /></label>
          <div className="flex gap-2"><button type="button" onClick={submit} className="rounded-xl bg-violet-200 px-4 py-2 text-sm font-semibold text-black">Publish</button><button type="button" onClick={() => setShow(false)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70">Cancel</button></div>
        </div>}
        {msg && <p className="mt-2 text-xs text-white/60">{msg}</p>}</div>
      {mine.length > 0 && <div className="rounded-3xl border border-white/10 p-5"><p className="font-semibold text-white">Your posts</p><ul className="mt-2 grid gap-2">{mine.map((p) => <li key={p.id} className="flex items-center justify-between gap-2 text-sm"><span className="min-w-0 truncate text-white/75">{p.title}</span>{p.status === "open" ? <button type="button" onClick={() => setPositionStatus(p.id, "closed").then(load)} className="shrink-0 text-xs text-white/50 hover:text-white">Close</button> : <span className="shrink-0 text-xs text-white/35">{p.status}</span>}</li>)}</ul></div>}
    </aside>
  </div>;
}

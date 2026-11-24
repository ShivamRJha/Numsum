"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { addComment, createThread, listComments, listThreads, type ResearchComment, type ResearchThread } from "@/lib/research/store";

const input = "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35";
const when = (iso?: string) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export function DiscussClient() {
  const { user, profile, profileComplete } = useAuth();
  const name = profile?.fullName || profile?.displayName || profile?.name || "Member";
  const [threads, setThreads] = useState<ResearchThread[] | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ title: "", body: "", tags: "" });
  const load = () => listThreads().then(setThreads).catch(() => { setThreads([]); setErr("Discussions need a completed profile to read."); });
  useEffect(() => { load(); }, []);
  const post = async () => {
    if (!user || !form.title.trim() || !form.body.trim()) return;
    try { await createThread({ title: form.title.trim(), body: form.body.trim(), tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6), authorId: user.uid, authorName: name }); setForm({ title: "", body: "", tags: "" }); load(); }
    catch { setErr("Couldn't post — complete your profile first, then try again."); }
  };
  const shown = (threads || []).filter((t) => !q || `${t.title} ${t.body} ${(t.tags || []).join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <div className="min-w-0">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search discussions" className={input} />
      {err && <p className="mt-3 text-sm text-amber-100">{err}</p>}
      {threads === null ? <p className="mt-6 text-white/50">Loading…</p> : !shown.length ? <p className="mt-6 text-white/60">No discussions yet — start the first one.</p> :
        <ul className="mt-4 grid gap-3">{shown.map((t) => <li key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <button type="button" onClick={() => setOpen(open === t.id ? null : t.id)} className="text-left"><p className="font-semibold text-white hover:text-violet-100">{t.title}</p></button>
          <p className="mt-1 text-xs text-white/45">{t.authorName} · {when(t.createdAt)}{t.tags?.length ? ` · ${t.tags.map((x) => `#${x}`).join(" ")}` : ""}</p>
          <p className={`mt-2 whitespace-pre-wrap text-sm text-white/70 ${open === t.id ? "" : "line-clamp-2"}`}>{t.body}</p>
          {open === t.id ? <Thread thread={t} name={name} canPost={profileComplete} /> : <button type="button" onClick={() => setOpen(t.id)} className="mt-2 text-xs font-semibold text-violet-100">Open discussion →</button>}
        </li>)}</ul>}
    </div>
    <aside className="lg:sticky lg:top-24 lg:h-fit"><div className="rounded-3xl border border-white/10 p-5"><p className="font-semibold text-white">Start a discussion</p><p className="mt-1 text-xs text-white/50">Ask about a method, a paper, a result or a research idea. Be specific; cite what you read.</p>
      {profileComplete ? <div className="mt-3 grid gap-2"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" maxLength={140} className={input} /><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What do you want to discuss?" rows={6} className={input} /><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags, comma-separated" className={input} /><button type="button" onClick={post} className="rounded-xl bg-violet-200 px-4 py-2 text-sm font-semibold text-black">Post</button></div>
        : <a href="/profile/complete?returnTo=/research/discuss" className="mt-3 inline-block text-sm font-semibold text-amber-100">Complete your profile to post →</a>}
    </div></aside>
  </div>;
}

function Thread({ thread, name, canPost }: { thread: ResearchThread; name: string; canPost: boolean }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ResearchComment[] | null>(null); const [body, setBody] = useState(""); const [err, setErr] = useState("");
  const load = () => listComments(thread.id).then(setComments).catch(() => setComments([]));
  useEffect(() => { load(); }, [thread.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = async () => { if (!user || !body.trim()) return; try { await addComment({ threadId: thread.id, body: body.trim(), authorId: user.uid, authorName: name }); setBody(""); load(); } catch { setErr("Couldn't post the reply."); } };
  return <div className="mt-4 border-t border-white/10 pt-4">
    <ul className="grid gap-3">{(comments || []).map((c) => <li key={c.id} className="rounded-xl bg-black/20 p-3"><p className="text-xs text-white/45">{c.authorName} · {when(c.createdAt)}</p><p className="mt-1 whitespace-pre-wrap text-sm text-white/80">{c.body}</p></li>)}{comments && !comments.length && <li className="text-sm text-white/50">No replies yet.</li>}</ul>
    {canPost && <div className="mt-3 flex gap-2"><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Reply" className={input} /><button type="button" onClick={send} className="self-end rounded-xl bg-violet-200 px-4 py-2 text-sm font-semibold text-black">Reply</button></div>}
    {err && <p className="mt-2 text-xs text-red-200">{err}</p>}
  </div>;
}

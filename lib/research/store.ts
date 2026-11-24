"use client";
// Client-side Firestore access for the Research Commons. Rules: researchProfiles = owner only; researchers = signed-in read,
// owner write; research_positions = signed-in read of open/closed, author write; discussions reuse discussion_threads/comments.
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Position, ResearchProfile, ResearcherCard } from "./types";

const clean = <T extends object>(o: T) => JSON.parse(JSON.stringify(o)) as T; // drops undefined (Firestore rejects it)

export async function loadProfile(uid: string): Promise<ResearchProfile | null> {
  const s = await getDoc(doc(db, "researchProfiles", uid));
  if (!s.exists()) return null;
  const d = s.data() as Partial<ResearchProfile>;
  return { uid, interests: [], alerts: true, targets: [], reading: [], pathDone: {}, ...d } as ResearchProfile;
}
export async function saveProfile(p: ResearchProfile) {
  await setDoc(doc(db, "researchProfiles", p.uid), clean({ ...p, updatedAt: new Date().toISOString() }));
}

export async function listResearchers(): Promise<ResearcherCard[]> {
  const s = await getDocs(collection(db, "researchers"));
  return s.docs.map((d) => d.data() as ResearcherCard).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}
export async function getMyCard(uid: string) { const s = await getDoc(doc(db, "researchers", uid)); return s.exists() ? (s.data() as ResearcherCard) : null; }
export async function saveCard(c: ResearcherCard) { await setDoc(doc(db, "researchers", c.uid), clean({ ...c, updatedAt: new Date().toISOString() })); }
export async function removeCard(uid: string) { await deleteDoc(doc(db, "researchers", uid)); }

export async function listPositions(): Promise<Position[]> {
  const s = await getDocs(query(collection(db, "research_positions"), where("status", "==", "open")));
  return s.docs.map((d) => ({ ...(d.data() as Omit<Position, "id">), id: d.id })).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
export async function listMyPositions(uid: string): Promise<Position[]> {
  const s = await getDocs(query(collection(db, "research_positions"), where("authorId", "==", uid)));
  return s.docs.map((d) => ({ ...(d.data() as Omit<Position, "id">), id: d.id }));
}
export async function createPosition(p: Omit<Position, "id" | "createdAt" | "status">) {
  await addDoc(collection(db, "research_positions"), clean({ ...p, status: "open", createdAt: new Date().toISOString() }));
}
export async function setPositionStatus(id: string, status: Position["status"]) { await updateDoc(doc(db, "research_positions", id), { status }); }

// Research discussions: the platform's discussion_threads with category research_discussion, visible to members.
export type ResearchThread = { id: string; title: string; body: string; tags?: string[]; authorId: string; authorName: string; createdAt?: string; lastActivityAt?: string };
export type ResearchComment = { id: string; threadId: string; body: string; authorId: string; authorName: string; createdAt?: string };
export async function listThreads(): Promise<ResearchThread[]> {
  const s = await getDocs(query(collection(db, "discussion_threads"), where("category", "==", "research_discussion"), where("visibility", "==", "members"), where("status", "==", "open")));
  return s.docs.map((d) => { const x = d.data(); return { id: d.id, title: x.title, body: x.body, tags: x.tags, authorId: x.authorId, authorName: x.authorName, createdAt: x.createdIso, lastActivityAt: x.createdIso }; })
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
export async function createThread(t: { title: string; body: string; tags: string[]; authorId: string; authorName: string }) {
  const slug = `${t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}-${Date.now().toString(36)}`;
  await addDoc(collection(db, "discussion_threads"), {
    ...t, slug, summary: t.body.slice(0, 200), scopeType: "research", visibility: "members", status: "open", category: "research_discussion",
    moderationStatus: "clean", participantIds: [t.authorId], commentCount: 0, createdAt: serverTimestamp(), createdIso: new Date().toISOString(),
  });
}
export async function listComments(threadId: string): Promise<ResearchComment[]> {
  const s = await getDocs(query(collection(db, "discussion_comments"), where("threadId", "==", threadId), where("status", "==", "visible")));
  return s.docs.map((d) => { const x = d.data(); return { id: d.id, threadId, body: x.body, authorId: x.authorId, authorName: x.authorName, createdAt: x.createdIso }; })
    .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
}
export async function addComment(c: { threadId: string; body: string; authorId: string; authorName: string }) {
  await addDoc(collection(db, "discussion_comments"), { ...c, status: "visible", moderationStatus: "clean", createdAt: serverTimestamp(), createdIso: new Date().toISOString() });
}

export type Alert = { id: string; title: string; message: string; link?: string; read: boolean; createdIso?: string };
export async function listAlerts(uid: string): Promise<Alert[]> {
  const s = await getDocs(query(collection(db, "notifications"), where("userId", "==", uid)));
  return s.docs.map((d) => { const x = d.data(); return { id: d.id, title: x.title, message: x.message, link: x.link, read: Boolean(x.read), createdIso: x.createdIso || "" }; })
    .sort((a, b) => b.createdIso.localeCompare(a.createdIso));
}
export async function markAlertRead(id: string) { await updateDoc(doc(db, "notifications", id), { read: true }); }

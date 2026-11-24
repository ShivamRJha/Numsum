/**
 * Daily research alerts for the Research Commons.
 * For every member with alerts on, finds standout new work in their keywords and writes in-app notifications:
 *   - preprints from the last 3 days whose TITLE contains the keyword (arXiv), and
 *   - journal articles from the last 30 days already gathering citations (OpenAlex).
 * At most 3 alerts per member per run; notification ids are deterministic, so a paper is never announced twice.
 * Run: FIREBASE_PROJECT_ID=… npx tsx scripts/research-radar.ts   (DRY=1 prints instead of writing)
 */
import { createHash } from "node:crypto";
import { arxiv, openalex } from "../lib/research/radar";
import type { RadarItem } from "../lib/research/types";

const DRY = process.env.DRY === "1";
const PER_USER = 3;

type Snap = { id: string; data: () => Record<string, unknown> };
type DocRef = { get: () => Promise<{ exists: boolean }>; set: (d: unknown) => Promise<unknown> };
type Db = { collection: (n: string) => { where: (f: string, op: string, v: unknown) => { get: () => Promise<{ docs: Snap[] }> }; doc: (id: string) => DocRef } };

async function firestore(): Promise<{ db: Db; ts: () => unknown }> {
  const { initializeApp, applicationDefault, getApps } = await import("firebase-admin/app");
  const fs = (await import("firebase-admin/firestore")) as unknown as { getFirestore: () => Db; FieldValue: { serverTimestamp: () => unknown } };
  const projectId = [process.env.FIREBASE_PROJECT_ID, process.env.GOOGLE_CLOUD_PROJECT, process.env.GCLOUD_PROJECT].map((v) => (v || "").trim()).find(Boolean);
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID is not set.");
  if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId });
  return { db: fs.getFirestore(), ts: () => fs.FieldValue.serverTimestamp() };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 16);

async function standout(topic: string): Promise<RadarItem[]> {
  const pre = (await arxiv(topic, 10, true).catch(() => [])).filter((i) => i.date >= daysAgo(3));
  await sleep(3000); // arXiv asks for a pause between API calls
  const jr = (await openalex(topic, 30, 5).catch(() => [])).filter((i) => (i.citations || 0) >= 3);
  return [...jr, ...pre];
}

async function main() {
  const { db, ts } = await firestore();
  const users = (await db.collection("researchProfiles").where("alerts", "==", true).get()).docs
    .map((d) => ({ uid: d.id, interests: ((d.data().interests as string[]) || []).slice(0, 8) })).filter((u) => u.interests.length);
  const topics = [...new Set(users.flatMap((u) => u.interests.map((t) => t.toLowerCase())))];
  console.log(`${users.length} members with alerts, ${topics.length} topics`);
  const byTopic = new Map<string, RadarItem[]>();
  for (const t of topics) { byTopic.set(t, await standout(t)); console.log(`  ${t}: ${byTopic.get(t)!.length} candidates`); }

  let written = 0;
  for (const u of users) {
    let sent = 0;
    for (const t of u.interests.map((x) => x.toLowerCase())) {
      for (const it of byTopic.get(t) || []) {
        if (sent >= PER_USER) break;
        const id = `radar_${u.uid}_${hash(it.id)}`;
        const ref = db.collection("notifications").doc(id);
        if ((await ref.get()).exists) continue;
        const message = `${it.title} — ${it.venue || it.source}, ${it.date}${it.citations ? ` · ${it.citations} citations` : ""}`;
        if (DRY) console.log(`[dry] ${u.uid}: ${message}`);
        else await ref.set({ userId: u.uid, type: "research_alert", title: `Research radar: ${t}`, message, link: it.url, read: false, createdAt: ts(), createdIso: new Date().toISOString() });
        sent++; written++;
      }
    }
  }
  console.log(`Done: ${written} alerts ${DRY ? "(dry run)" : "written"}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });

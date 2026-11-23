import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const ENQUIRY_TOPICS = ["iris_demo", "iris_quote", "msme_problem", "partnership", "investment_tool", "general"] as const;
export type EnquiryTopic = (typeof ENQUIRY_TOPICS)[number];
export const ENQUIRY_STATUSES = ["new", "contacted", "qualified", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const topicLabels: Record<EnquiryTopic, string> = {
  iris_demo: "IRIS — book a demo",
  iris_quote: "IRIS — pricing / quotation",
  msme_problem: "MSME problem or project",
  partnership: "Partnership / collaboration",
  investment_tool: "Investment planner",
  general: "General enquiry",
};

export type EnquiryInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  city?: string;
  topic: EnquiryTopic;
  message: string;
  modules?: string[];
  users?: string;
  sourcePage: string;
};

export type Enquiry = EnquiryInput & { id: string; status: EnquiryStatus; createdAt?: { toDate: () => Date }; adminNote?: string; collection: string };

const COLLECTION = "enquiries";
/** Used only if the `enquiries` rules have not been deployed yet (that collection already allows public create). */
const FALLBACK = "career_applications";

function clean(value: string | undefined, max: number) {
  return (value || "").trim().slice(0, max);
}

/** Public (no sign-in) create. Field list and limits must match `validEnquiry()` in firestore.rules. */
export async function submitEnquiry(input: EnquiryInput) {
  const payload: Record<string, unknown> = {
    name: clean(input.name, 120),
    email: clean(input.email, 200).toLowerCase(),
    topic: input.topic,
    message: clean(input.message, 4000),
    sourcePage: clean(input.sourcePage, 200) || "/",
    status: "new",
    createdAt: serverTimestamp(),
  };
  for (const [key, max] of [["phone", 30], ["company", 160], ["designation", 120], ["city", 120], ["users", 40]] as const) {
    const value = clean(input[key], max);
    if (value) payload[key] = value;
  }
  if (input.modules?.length) payload.modules = input.modules.slice(0, 20).map((m) => m.slice(0, 60));
  try {
    return await addDoc(collection(db, COLLECTION), payload);
  } catch (err) {
    if ((err as { code?: string })?.code !== "permission-denied") throw err;
    return addDoc(collection(db, FALLBACK), { ...payload, kind: "enquiry" });
  }
}

export async function listEnquiries(max = 300) {
  const [main, fallback] = await Promise.all([
    getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc"), limit(max))).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data(), collection: COLLECTION }) as Enquiry)).catch(() => [] as Enquiry[]),
    getDocs(query(collection(db, FALLBACK), where("kind", "==", "enquiry"), limit(max))).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data(), collection: FALLBACK }) as Enquiry)).catch(() => [] as Enquiry[]),
  ]);
  const t = (e: Enquiry) => e.createdAt?.toDate?.().getTime() || 0;
  return [...main, ...fallback].sort((a, b) => t(b) - t(a));
}

export async function updateEnquiry(row: Pick<Enquiry, "id" | "collection">, patch: { status?: EnquiryStatus; adminNote?: string }) {
  return updateDoc(doc(db, row.collection || COLLECTION, row.id), { ...patch, updatedAt: serverTimestamp() });
}

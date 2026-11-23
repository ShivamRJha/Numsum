import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { META_COLLECTION, STOCK_SUMMARY_DOC, SUMMARY_DOC, type FundSummaryDoc, type StockSummaryDoc } from "./types";

async function read<T>(id: string): Promise<T | null> {
  try { const snap = await getDoc(doc(db, META_COLLECTION, id)); return snap.exists() ? (snap.data() as T) : null; } catch { return null; }
}
export const loadFundSummary = () => read<FundSummaryDoc>(SUMMARY_DOC);
export const loadStockSummary = () => read<StockSummaryDoc>(STOCK_SUMMARY_DOC);

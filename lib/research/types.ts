import type { LevelKey } from "./paths";

export type Target = { id: string; title: string; phase?: string; due?: string; done: boolean; progress?: number; note?: string };
export type ReadingStatus = "to_read" | "reading" | "done";
export type ReadingItem = { id: string; title: string; by?: string; status: ReadingStatus; note?: string; addedAt?: string; finishedAt?: string };

/** researchProfiles/{uid}: private to its owner. */
export type ResearchProfile = {
  uid: string;
  path?: string;
  level?: LevelKey;
  direction?: string;
  interests: string[];
  alerts: boolean;
  targets: Target[];
  reading: ReadingItem[];
  pathDone: Record<string, string[]>;
  template?: string;
  updatedAt?: string;
};

/** researchers/{uid}: opt-in directory card, readable by signed-in members. */
export type ResearcherCard = { uid: string; name: string; headline?: string; field?: string; level?: LevelKey; interests: string[]; lookingFor: string[]; link?: string; updatedAt?: string };

export type PositionType = "phd" | "postdoc" | "collaboration" | "internship" | "ra";
export const POSITION_TYPES: [PositionType, string][] = [["phd", "PhD position"], ["postdoc", "Postdoc"], ["collaboration", "Collaboration"], ["internship", "Research internship"], ["ra", "Research assistant"]];
/** research_positions/{id}: posted by signed-in members, read by signed-in members. */
export type Position = { id: string; type: PositionType; title: string; org: string; location?: string; field: string; description: string; link?: string; deadline?: string; authorId: string; authorName: string; status: "open" | "closed" | "hidden"; createdAt?: string };

export type RadarItem = { id: string; source: "arXiv" | "Journal"; title: string; authors: string[]; date: string; url: string; venue?: string; summary?: string; citations?: number };

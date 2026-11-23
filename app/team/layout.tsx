import type { Metadata } from "next";

export const metadata: Metadata = { title: "Team — NumSum Labs", description: "The NumSum Labs team.", openGraph: { title: "Team — NumSum Labs", description: "The NumSum Labs team." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

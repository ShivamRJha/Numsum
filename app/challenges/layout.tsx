import type { Metadata } from "next";

export const metadata: Metadata = { title: "Innovation Challenges — NumSum Labs", description: "Open industrial innovation challenges scoped from real MSME problems. Register, form a team and submit solutions.", openGraph: { title: "Innovation Challenges — NumSum Labs", description: "Open industrial innovation challenges scoped from real MSME problems. Register, form a team and submit solutions." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

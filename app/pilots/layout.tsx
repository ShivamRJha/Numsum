import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impact & Pilots — NumSum Labs", description: "Approved pilot implementations and verified MSME impact.", openGraph: { title: "Impact & Pilots — NumSum Labs", description: "Approved pilot implementations and verified MSME impact." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

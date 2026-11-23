import type { Metadata } from "next";

export const metadata: Metadata = { title: "Case Studies — NumSum Labs", description: "Validated MSME case studies: the problem, the approach and the measured outcome.", openGraph: { title: "Case Studies — NumSum Labs", description: "Validated MSME case studies: the problem, the approach and the measured outcome." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

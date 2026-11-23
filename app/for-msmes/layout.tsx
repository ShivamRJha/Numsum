import type { Metadata } from "next";

export const metadata: Metadata = { title: "For MSMEs — NumSum Labs", description: "How NumSum Labs helps MSMEs structure operational problems, connect with engineering expertise and validate solutions through pilots.", openGraph: { title: "For MSMEs — NumSum Labs", description: "How NumSum Labs helps MSMEs structure operational problems, connect with engineering expertise and validate solutions through pilots." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

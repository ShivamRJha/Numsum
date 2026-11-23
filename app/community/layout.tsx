import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community — NumSum Labs", description: "Discussions between MSMEs, engineers, researchers and solution providers on practical industrial problems.", openGraph: { title: "Community — NumSum Labs", description: "Discussions between MSMEs, engineers, researchers and solution providers on practical industrial problems." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

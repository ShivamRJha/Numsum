import type { Metadata } from "next";

export const metadata: Metadata = { title: "Join NumSum Labs", description: "Create a NumSum Labs member account to submit problems, take part in challenges and join the community.", openGraph: { title: "Join NumSum Labs", description: "Create a NumSum Labs member account to submit problems, take part in challenges and join the community." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submit an MSME Problem — NumSum Labs", description: "Privately submit an operational problem from your MSME. NumSum Labs reviews and structures it before any public step.", openGraph: { title: "Submit an MSME Problem — NumSum Labs", description: "Privately submit an operational problem from your MSME. NumSum Labs reviews and structures it before any public step." } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import { Disclaimer, ToolsNav } from "@/components/invest/tools-nav";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-navy px-6 pb-16">
    <ToolsNav />
    <div className="mx-auto max-w-7xl">{children}<Disclaimer /></div>
  </main>;
}

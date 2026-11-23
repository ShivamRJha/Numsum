import { ExplainProvider } from "@/components/invest/explain";
import { Disclaimer, MobileExplainBar, ToolsNav } from "@/components/invest/tools-nav";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <ExplainProvider>
    <main className="tools-bg min-h-screen bg-navy px-6 pb-16">
      <ToolsNav />
      <div className="mx-auto max-w-7xl"><MobileExplainBar />{children}<Disclaimer /></div>
    </main>
  </ExplainProvider>;
}

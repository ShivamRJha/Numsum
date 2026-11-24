/** Re-mounted on every navigation, giving each page a short fade-up entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}

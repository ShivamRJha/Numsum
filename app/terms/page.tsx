import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use — NumSum Labs",
  description: "The terms that apply when you use numsum.in, the NumSum Labs member platform and its tools.",
};

export default function TermsPage() {
  return <LegalPage title="Terms of Use" updated="23 November 2026">
    <p>These terms apply to your use of numsum.in and the NumSum Labs platform and tools (the “Service”). By using the Service you agree to them. If you use it for an organisation, you confirm you may accept these terms for it.</p>

    <h2>1. Accounts</h2>
    <p>Keep your sign-in secure and your profile accurate. You are responsible for activity on your account. We may suspend accounts that misuse the Service or breach these terms.</p>

    <h2>2. Your content</h2>
    <p>You keep ownership of what you submit. You give NumSum Labs a licence to host, review, structure and — only where you or the MSME concerned has approved it — publish that content to run the Service. Do not submit anything confidential to public areas, anything you do not have the right to share, or anything unlawful, misleading or abusive.</p>

    <h2>3. Challenges</h2>
    <p>Each challenge may have its own rules on eligibility, timelines, evaluation, rewards and intellectual property. Where they differ from these terms, the challenge rules apply to that challenge.</p>

    <h2>4. Investment planner</h2>
    <p>The investment planner and fund data are provided for general education and planning only. They are not investment advice, a recommendation or an offer to buy or sell any security or fund. NumSum Labs is not registered with SEBI as an investment adviser or research analyst. Fund data comes from public sources, may be delayed or contain errors, and past performance does not guarantee future returns. Mutual fund investments are subject to market risks; read all scheme-related documents carefully and consult a SEBI-registered adviser before investing.</p>

    <h2>5. Software products</h2>
    <p>IRIS and other NumSum Labs software are supplied under a separate licence agreement and order. Information on this site describes the product and does not form part of any contract until an order is accepted in writing.</p>

    <h2>6. Acceptable use</h2>
    <p>Do not attempt to break, overload, scrape or reverse-engineer the Service, access data you are not permitted to see, or use it to send spam.</p>

    <h2>7. Disclaimer and liability</h2>
    <p>The Service is provided “as is”. To the extent the law allows, NumSum Labs is not liable for indirect or consequential loss, or for decisions you make based on content or tools on the Service. Engineering, inspection and financial decisions remain the responsibility of qualified people in your organisation.</p>

    <h2>8. Changes and law</h2>
    <p>We may update these terms; continued use means you accept the updated terms. These terms are governed by the laws of India.</p>

    <h2>9. Contact</h2>
    <p>Questions about these terms: use the <Link href="/contact">contact page</Link>. See also our <Link href="/privacy">privacy policy</Link>.</p>
  </LegalPage>;
}

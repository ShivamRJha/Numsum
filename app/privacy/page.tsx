import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — NumSum Labs",
  description: "How NumSum Labs collects, uses, stores and protects personal data, and how to exercise your rights.",
};

export default function PrivacyPage() {
  const email = contactEmail();
  const reach = email ? <>by e-mail to <a href={`mailto:${email}`}>{email}</a> or through the <Link href="/contact">contact form</Link></> : <>through the <Link href="/contact">contact form</Link></>;
  return <LegalPage title="Privacy Policy" updated="23 November 2026">
    <p>This policy explains how NumSum Labs (“NumSum”, “we”, “us”) handles personal data when you use numsum.in, our member platform, the investment planner, or contact us about our products, including IRIS. We process personal data in line with India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000 and the rules under them.</p>

    <h2>1. What we collect</h2>
    <ul>
      <li><strong>Account data</strong> — name, e-mail, sign-in provider, profile details you choose to add (organisation, role, sector, city, skills).</li>
      <li><strong>Content you submit</strong> — MSME problem submissions, questionnaire answers, challenge registrations and submissions, community posts, comments and reviews.</li>
      <li><strong>Enquiries</strong> — name, e-mail, phone, company, designation, city and your message when you use a contact or demo form.</li>
      <li><strong>Saved plans</strong> — if you sign in and save an investment plan, the planner inputs you entered. We do not ask for bank, card, PAN or demat details and you should not enter them.</li>
      <li><strong>Technical data</strong> — basic logs needed to run and secure the service (browser type, pages requested, error reports).</li>
    </ul>

    <h2>2. Why we use it</h2>
    <ul>
      <li>To create and run your account and the features you use.</li>
      <li>To review, structure and work on problems you submit, and to run challenges.</li>
      <li>To reply to enquiries, arrange demos and send quotations you ask for.</li>
      <li>To keep the platform secure, prevent misuse and meet legal obligations.</li>
    </ul>
    <p>We rely on your consent (which you can withdraw at any time) and, where the law allows, on legitimate uses such as responding to a request you made. We do not sell personal data and we do not use it for third-party advertising.</p>

    <h2>3. What is public</h2>
    <p>Private submissions, onboarding notes and internal reviews stay private. Content is shown publicly only after review and, where it relates to an MSME, only with its consent. Community posts you mark public are visible to everyone.</p>

    <h2>4. Where data is stored and who can see it</h2>
    <p>Data is stored with Google Firebase / Google Cloud and the site is hosted on Vercel. These providers process data for us under their terms and may store it outside India. Within NumSum, access is limited to team members who need it, controlled by role-based permissions.</p>

    <h2>5. How long we keep it</h2>
    <p>Account data is kept while your account is active. Enquiries are kept for up to three years unless they lead to a contract. You can ask us to delete your data earlier, subject to records we must keep by law.</p>

    <h2>6. Your rights</h2>
    <p>You may ask to access a summary of your personal data, correct or complete it, erase it, withdraw consent, nominate another person to exercise your rights, and raise a grievance. Contact us {reach}. We aim to respond within 30 days. If you are not satisfied with our response, you may approach the Data Protection Board of India.</p>

    <h2>7. Grievance Officer</h2>
    <p>Grievance Officer, NumSum Labs — reachable {reach}. Please start your message with “Grievance”.</p>

    <h2 id="cookies">8. Cookies and analytics</h2>
    <p>We use the storage needed for sign-in and to remember simple preferences (such as light or dark theme). With your consent only, we use Google Analytics through Google Tag Manager to count visits and see which pages and tools are used; it sets analytics cookies and receives your browser details and an approximate location. Until you accept, analytics cookies are not set. We do not use advertising cookies and do not sell data. You can change your choice at any time with “Cookie settings” at the bottom of every page.</p>
    <p>The engineering calculators run entirely in your browser; the values you type into them are not sent to us.</p>

    <h2>9. Children</h2>
    <p>The platform is meant for adults and businesses. We do not knowingly collect data from anyone under 18.</p>

    <h2>10. Changes</h2>
    <p>We may update this policy. The date at the top shows the latest version; material changes will be highlighted on the site.</p>
  </LegalPage>;
}

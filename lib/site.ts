/** Site-wide settings. Set these in Vercel → Project → Settings → Environment Variables. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.numsum.in").replace(/\/$/, "");

/** Public contact address. Leave NEXT_PUBLIC_CONTACT_EMAIL unset to hide it; enquiries still arrive in Admin › Enquiries. */
export function contactEmail() {
  return (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim();
}

export const companyName = "NumSum Labs";

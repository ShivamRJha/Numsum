import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

/** Verifies a Firebase ID token from `Authorization: Bearer …`. Returns the uid or null. */
export async function verifyFirebaseUser(req: Request): Promise<string | null> {
  const projectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim();
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !projectId) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, { issuer: `https://securetoken.google.com/${projectId}`, audience: projectId });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function json(data: unknown, init: ResponseInit & { cache?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  if (init.cache) headers.set("cache-control", init.cache);
  return new Response(JSON.stringify(data), { ...init, headers });
}

export const unauthorized = () => json({ error: "Sign in as an admin to refresh market data." }, { status: 401 });

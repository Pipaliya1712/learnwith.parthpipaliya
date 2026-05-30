import { cookies } from "next/headers";

export type SessionData = {
  userId: string;
  email: string;
  role: string;
};

const SESSION_KEY = "learnwith_session";
const secretText = process.env.SESSION_SECRET || "default_secret_key_change_me_in_production_1234567890123456";
const secret = new TextEncoder().encode(secretText);

export async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return payload + "." + Buffer.from(signature).toString("base64");
}

export async function verify(signedPayload: string) {
  try {
    const [payloadBase64, signatureBase64] = signedPayload.split(".");
    if (!payloadBase64 || !signatureBase64) return null;
    
    const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signature = Buffer.from(signatureBase64, "base64");
    
    const isValid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(payloadBase64));
    return isValid ? payloadBase64 : null;
  } catch {
    return null;
  }
}

export async function createSession(data: SessionData, maxAge: number = 60 * 60) {
  const payload = JSON.stringify(data);
  const payloadBase64 = Buffer.from(payload).toString("base64");
  const signed = await sign(payloadBase64);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, signed, {
    path: "/",
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookieStore.set("session_expires_at", new Date(Date.now() + maxAge * 1000).toISOString(), {
    path: "/",
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_KEY)?.value;

  if (!sessionCookie) return null;

  const expiresAt = cookieStore.get("session_expires_at")?.value;
  if (expiresAt && new Date(expiresAt) < new Date()) return null;

  const verifiedPayload = await verify(sessionCookie);
  if (!verifiedPayload) return null;

  try {
    const payload = Buffer.from(verifiedPayload, "base64").toString();
    return JSON.parse(payload) as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
  cookieStore.delete("session_expires_at");
}

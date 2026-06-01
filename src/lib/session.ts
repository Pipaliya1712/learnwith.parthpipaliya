import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const JWT_COOKIE = "learnwith_jwt";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_change_me_in_production_1234567890123456"
);

export type SessionData = {
  userId: string;
  email: string;
  role: string;
};

// ─── Store JWT from FastAPI login response into an HTTP-only cookie ──────────
export async function createSession(token: string, maxAge: number = 3600) {
  const cookieStore = await cookies();
  cookieStore.set(JWT_COOKIE, token, {
    path: "/",
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

// ─── Read and verify the JWT from the cookie ─────────────────────────────────
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;
    const email = payload.email as string;
    const role = payload.role as string;
    if (!userId || !email || !role) return null;
    return { userId, email, role };
  } catch {
    return null;
  }
}

// ─── Get raw JWT token string (for forwarding to FastAPI) ────────────────────
export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(JWT_COOKIE)?.value ?? null;
}

// ─── Clear the session cookie ────────────────────────────────────────────────
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE);
}

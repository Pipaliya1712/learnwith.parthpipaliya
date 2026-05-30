import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";
import { verify } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Read custom session cookie
  const sessionCookie = request.cookies.get("learnwith_session")?.value;
  const expiresAtCookie = request.cookies.get("session_expires_at")?.value;

  let userId: string | null = null;

  if (sessionCookie) {
    // Check expiry
    if (expiresAtCookie && new Date(expiresAtCookie) < new Date()) {
      // Session expired — clear cookies and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("learnwith_session");
      response.cookies.delete("session_expires_at");
      return response;
    }

    try {
      const verifiedPayload = await verify(sessionCookie);
      if (verifiedPayload) {
        const payloadStr = Buffer.from(verifiedPayload, "base64").toString();
        const payload = JSON.parse(payloadStr);
        userId = payload.userId;
      }
    } catch {
      userId = null;
    }
  }

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");
  const isAdminRoute = pathname.startsWith("/admin");

  // Redirect logged-in + verified users away from auth pages
  if (userId && isAuthPage) {
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("email_verified")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.email_verified) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect dashboard routes
  if (!userId && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userId && isDashboardRoute) {
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_blocked, email_verified, email")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.is_blocked) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("learnwith_session");
      response.cookies.delete("session_expires_at");
      return response;
    }

    if (!profile.email_verified) {
      return NextResponse.redirect(
        new URL(`/verify-email?email=${encodeURIComponent(profile.email)}`, request.url)
      );
    }
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_blocked, email_verified")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.is_blocked || !profile.email_verified) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("learnwith_session");
      response.cookies.delete("session_expires_at");
      return response;
    }

    if (profile.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

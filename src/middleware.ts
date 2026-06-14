import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verify JWT locally using jose (no DB calls needed for UI routing!)
  const session = await getSession();

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isDashboardRoute =
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/profile") || 
    pathname.startsWith("/settings");

  const isAdminRoute = pathname.startsWith("/admin");

  // Redirect logged-in users away from auth pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (!session && isDashboardRoute) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("learnwith_jwt");
    return response;
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("learnwith_jwt");
      return response;
    }
    
    if (session.role !== "admin" && session.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ignore static files and API routes (FastAPI handles API auth)
    "/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

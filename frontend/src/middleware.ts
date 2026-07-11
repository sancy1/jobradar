// frontend/src/middleware.ts
// Route Protection Guard Engine executing in Vercel Edge Runtime

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Exact route matching for authentication views
const AUTH_ROUTES = ["/auth/signin", "/auth/signup"];
const PROTECTED_PREFIXES = ["/dashboard", "/jobs", "/search", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Identify route security tier
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // 2. Extract JWT token from HttpOnly cookies (Vercel server-to-render context)
  // Note: Your client auth handler must drop this cookie along with localStorage
  const token = request.cookies.get("jobradar_access_token")?.value;

  // 3. Challenge: Protected resource access without authentication
  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/auth/signin", request.url);
    // Preserves target path to re-route users post-login
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 4. Bypass: Authenticated user attempting to access landing auth screens
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Optimized matching matrix preventing loop traps on styling/asset pipelines
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes handled by proxy/backend)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

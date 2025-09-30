import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Check for token in cookies (for server-side rendering)
  const cookieToken = req.cookies.get("token");

  // Check for Authorization header (in case token is passed via header)
  const authHeader = req.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  // If no token found in either location and trying to access protected routes, redirect to signin
  if (!cookieToken && !headerToken) {
    // Allow access to signin page to prevent redirect loop
    if (req.nextUrl.pathname === "/signin") {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Removed my-account from middleware since we handle auth in the component
    // "/my-account/:path*",
  ],
};

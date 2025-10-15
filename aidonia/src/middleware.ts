import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to decode JWT token
function decodeJWT(token: string): any | null {
  try {
    // Split token and decode payload
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(atob(payload));

    // Check if token is expired
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      // ✅ PERFORMANCE: Remove console.log in production
      if (process.env.NODE_ENV === "development") {
        console.log("🔴 Token is expired");
      }
      return null;
    }

    return decodedPayload;
  } catch (error) {
    // ✅ PERFORMANCE: Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Error decoding JWT:", error);
    }
    return null;
  }
}

// Helper function to check if user has required role
function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const normalizedUserRole = userRole?.toLowerCase();
  const normalizedRequiredRole = requiredRole?.toLowerCase();

  // Admin has access to everything
  if (normalizedUserRole === "admin") return true;

  // Check specific role match
  return normalizedUserRole === normalizedRequiredRole;
}

export function middleware(req: NextRequest) {
  console.log(`🛡️  Middleware protecting: ${req.nextUrl.pathname}`);

  // Check for token in cookies (for server-side rendering)
  const cookieToken = req.cookies.get("token");

  // Check for Authorization header (in case token is passed via header)
  const authHeader = req.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  // Get the actual token value
  const token = cookieToken?.value || headerToken;

  // Handle admin routes protection
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // If no token found, redirect to signin
    if (!token) {
      console.log(
        `❌ No token found, redirecting to /signin from ${req.nextUrl.pathname}`
      );

      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }

    // Decode and validate JWT token
    const decodedToken = decodeJWT(token);
    if (!decodedToken) {
      console.log(`❌ Invalid or expired token, redirecting to /signin`);

      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }

    // Check if user has admin role
    const userRole =
      decodedToken.role ||
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];

    if (!hasRequiredRole(userRole, "admin")) {
      console.log(
        `❌ User role '${userRole}' insufficient for admin access, redirecting to /unauthorized`
      );

      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // Handle signin page - prevent authenticated users from accessing signin
  if (req.nextUrl.pathname === "/signin") {
    if (token) {
      const decodedToken = decodeJWT(token);
      if (decodedToken) {
        const userRole =
          decodedToken.role ||
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        // Redirect based on role
        if (hasRequiredRole(userRole, "admin")) {
          console.log(
            `✅ Authenticated admin trying to access signin, redirecting to /admin`
          );
          const url = req.nextUrl.clone();
          url.pathname = "/admin";
          return NextResponse.redirect(url);
        } else {
          console.log(
            `✅ Authenticated user trying to access signin, redirecting to /`
          );
          const url = req.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // Handle other protected routes that require authentication
  const protectedRoutes = ["/create-post", "/my-account"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      console.log(
        `❌ No token found for protected route, redirecting to /signin from ${req.nextUrl.pathname}`
      );

      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }

    // Validate token for protected routes
    const decodedToken = decodeJWT(token);
    if (!decodedToken) {
      console.log(
        `❌ Invalid or expired token for protected route, redirecting to /signin`
      );

      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  console.log(
    `✅ Token valid and role authorized, allowing access to ${req.nextUrl.pathname}`
  );
  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/",              // ✅ REMOVED: Allow unauthenticated access to home page
    "/admin/:path*", // ✅ Protect all admin routes
    "/signin", // ✅ Prevent authenticated users from accessing signin
    "/create-post", // ✅ Protect post creation (requires authentication)
    "/my-account/:path*", // ✅ Protect user account pages
    // Add other protected routes as needed
  ],
};

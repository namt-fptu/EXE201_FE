/**
 * Authentication and role management utilities
 */

export type NormalizedRole = "admin" | "user";

/**
 * Normalizes user roles to lowercase and handles edge cases
 * @param role - Raw role string from API response
 * @returns Normalized role ("admin" or "user")
 */
export const normalizeRole = (
  role: string | undefined | null
): NormalizedRole => {
  if (!role) {
    return "user";
  }

  const normalizedRole = role.toLowerCase().trim();
  if (normalizedRole === "admin") return "admin";
  return "user";
};

/**
 * Gets the appropriate redirect path based on user role
 * @param role - Normalized user role
 * @param fallbackPath - Optional fallback path from URL params
 * @returns Redirect path
 */
export const getRedirectPathByRole = (role: NormalizedRole, fallbackPath?: string): string => {
  // Admin always goes to admin panel regardless of fallback
  if (role === "admin") {
    return "/admin";
  }
  
  // Regular users can go to fallback path if it's not admin route
  if (fallbackPath && !fallbackPath.startsWith("/admin")) {
    return fallbackPath;
  }
  
  return "/";
};

/**
 * Performs role-based redirection using Next.js router
 * Handles URL redirect parameters from signin page
 * Keep router type as any to avoid importing next/navigation in a shared util
 */
export const redirectByRole = (role: NormalizedRole, router: any, options?: {
  redirectParam?: string;
  replace?: boolean;
}): void => {
  // Check for redirect parameter in URL
  let redirectPath = "";
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    redirectPath = urlParams.get("redirect") || options?.redirectParam || "";
  }
  
  const finalPath = getRedirectPathByRole(role, redirectPath);
  
  console.log(`🔄 Role-based redirect: ${role} → ${finalPath}${redirectPath ? ` (requested: ${redirectPath})` : ""}`);
  
  if (router && typeof router.push === "function") {
    if (options?.replace) {
      router.replace(finalPath);
    } else {
      router.push(finalPath);
    }
  }
};

/**
 * Validates if a user has the required role(s)
 * @param userRole - User's current role
 * @param requiredRoles - Array of required roles
 * @returns True if user has required role
 */
export const hasRequiredRole = (
  userRole: string | undefined | null,
  requiredRoles: string[]
): boolean => {
  if (!userRole || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }

  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRoles = requiredRoles.map((role) => normalizeRole(role));
  
  // Admin has access to everything
  if (normalizedUserRole === "admin") {
    return true;
  }
  
  return normalizedRequiredRoles.includes(normalizedUserRole);
};

/**
 * Validates JWT token structure and expiration
 * @param token - JWT token string
 * @returns Token payload if valid, null if invalid
 */
export const validateJWTToken = (token: string): any | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.warn("JWT token is expired");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Error validating JWT token:", error);
    return null;
  }
};

/**
 * Extracts user ID from various token formats
 * @param token - JWT token payload
 * @returns User ID or null
 */
export const extractUserIdFromToken = (token: any): number | null => {
  if (!token) return null;
  
  // Try various common claim names for user ID
  return token.userId || token.id || token.sub || 
         token["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
         null;
};
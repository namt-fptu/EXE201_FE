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
 * @returns Redirect path
 */
export const getRedirectPathByRole = (role: NormalizedRole): string => {
  return role === "admin" ? "/admin" : "/";
};

/**
 * Performs role-based redirection using Next.js router
 * Keep router type as any to avoid importing next/navigation in a shared util
 */
export const redirectByRole = (role: NormalizedRole, router: any): void => {
  const path = getRedirectPathByRole(role);
  if (router && typeof router.push === "function") {
    router.push(path);
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
  return normalizedRequiredRoles.includes(normalizedUserRole);
};
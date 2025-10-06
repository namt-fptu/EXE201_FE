"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { toast } from "react-toastify";
import { normalizeRole, getRedirectPathByRole, hasRequiredRole } from "@/utils/auth-helpers";

export const useAuthGuard = (
  redirectTo: string = "/",
  options?: {
    requireAuth?: boolean;
    message?: string;
    requiredRoles?: string[]; // Parameter for role-based access
    useRoleBasedRedirect?: boolean; // New option for role-based redirect on auth pages
  }
) => {
  const { isAuthenticated, user, loadUserFromStorage } = useUserStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    // Load user from storage first
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();

      // For protected routes (requireAuth: true)
      if (options?.requireAuth && !isAuth) {
        router.replace(redirectTo);
        toast.error(options.message || "Please sign in to access this page");
        return;
      }

      // Check for required roles using centralized utility
      if (options?.requiredRoles && user) {
        if (!hasRequiredRole(user.role, options.requiredRoles)) {
          router.replace(redirectTo);
          toast.error("You do not have permission to access this page");
          return;
        }
      }

      // For auth pages (requireAuth: false or undefined) - redirect if already authenticated
      if (!options?.requireAuth && isAuth && user) {
        let targetRedirect = redirectTo;
        
        // Use role-based redirect if option is enabled
        if (options?.useRoleBasedRedirect) {
          const normalizedRole = normalizeRole(user.role);
          targetRedirect = getRedirectPathByRole(normalizedRole);
        }
        
        router.replace(targetRedirect);
        toast.info(options.message || "You are already signed in!");
        return;
      }

      setCanAccess(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router, redirectTo, options, loadUserFromStorage]);

  return { isChecking, canAccess };
};

export default useAuthGuard;

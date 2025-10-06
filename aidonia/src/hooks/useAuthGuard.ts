"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { toast } from "sonner";
import { normalizeRole, getRedirectPathByRole, hasRequiredRole } from "@/utils/auth-helpers";

export const useAuthGuard = (
  redirectTo: string = "/",
  options?: {
    requireAuth?: boolean;
    message?: string;
    requiredRoles?: string[]; // New parameter for role-based access
  }
) => {
  const { isAuthenticated, user } = useUserStore(); // Access user from store
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();

      // For protected routes (requireAuth: true)
      if (options?.requireAuth && !isAuth) {
        router.replace(redirectTo);
        toast.error(options.message || "Please sign in to access this page", {
          duration: 3000,
        });
        return;
      }

      // Check for required roles using centralized utility
      if (options?.requiredRoles && user) {
        if (!hasRequiredRole(user.role, options.requiredRoles)) {
          router.replace(redirectTo);
          toast.error("You do not have permission to access this page", {
            duration: 3000,
          });
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
        
        // Prevent multiple toasts by checking if we're already showing one
        const existingToasts = document.querySelectorAll('[data-sonner-toast]');
        if (existingToasts.length === 0) {
          toast.info(options.message || "You are already signed in!", {
            duration: 3000,
          });
        }
        
        router.replace(targetRedirect);
        return;
      }

      setCanAccess(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router, redirectTo, options]);

  return { isChecking, canAccess };
};

export default useAuthGuard;

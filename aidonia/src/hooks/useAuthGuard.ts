"use client";
import { useEffect, useRef, useState } from "react";
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
    useRoleBasedRedirect?: boolean; // Allow role-based redirect for auth pages
  }
) => {
  const { isAuthenticated, user } = useUserStore(); // Access user from store
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const didRedirectRef = useRef(false); // prevent duplicate redirects/toasts

  // Deconstruct options to stable primitives for the dependency array
  const {
    requireAuth = false,
    message,
    requiredRoles,
    useRoleBasedRedirect = false,
  } = options || {};

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();

      // For protected routes (requireAuth: true)
      if (requireAuth && !isAuth) {
        if (!didRedirectRef.current) {
          didRedirectRef.current = true;
          toast.error(message || "Please sign in to access this page", {
            duration: 3000,
          });
          router.replace(redirectTo);
        }
        setCanAccess(false);
        setIsChecking(false);
        return; // stop further checks
      }

      // Check for required roles using centralized utility
      if (requiredRoles && user) {
        if (!hasRequiredRole(user.role, requiredRoles)) {
          if (!didRedirectRef.current) {
            didRedirectRef.current = true;
            toast.error("You do not have permission to access this page", {
              duration: 3000,
            });
            router.replace(redirectTo);
          }
          setCanAccess(false);
          setIsChecking(false);
          return;
        }
      }

      // For auth pages (requireAuth: false or undefined) - redirect if already authenticated
      if (!requireAuth && isAuth && user) {
        let targetRedirect = redirectTo;
        
        // Use role-based redirect if option is enabled
        if (useRoleBasedRedirect) {
          const normalizedRole = normalizeRole(user.role);
          targetRedirect = getRedirectPathByRole(normalizedRole);
        }
        
        if (!didRedirectRef.current) {
          didRedirectRef.current = true;
          toast.info(message || "You are already signed in!", {
            duration: 2000,
          });
          router.replace(targetRedirect);
        }
        setCanAccess(false);
        setIsChecking(false);
        return; // stop further checks
      }

      setCanAccess(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router, redirectTo, requireAuth, message, useRoleBasedRedirect, JSON.stringify(requiredRoles)]);

  return { isChecking, canAccess };
};

export default useAuthGuard;

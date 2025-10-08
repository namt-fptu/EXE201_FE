"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { validateJWTToken, hasRequiredRole } from "@/utils/auth-helpers";

export interface UseRoleRedirectOptions {
  /** Enable automatic role-based redirects */
  enableRoleRedirect?: boolean;
  /** Show loading state during redirect */
  showLoading?: boolean;
  /** Custom redirect paths */
  redirectPaths?: {
    admin?: string;
    user?: string;
    signin?: string;
  };
}

/**
 * Hook for handling role-based redirects on client-side
 * Ensures admins are always redirected to /admin when accessing /
 */
export const useRoleRedirect = (options: UseRoleRedirectOptions = {}) => {
  const {
    enableRoleRedirect = true,
    showLoading = true,
    redirectPaths = {
      admin: "/admin",
      user: "/",
      signin: "/signin"
    }
  } = options;

  const { user, isAuthenticated } = useUserStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!enableRoleRedirect) {
      setIsChecking(false);
      return;
    }

    const checkAndRedirect = () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          console.log("🔄 User not authenticated, redirecting to signin");
          setIsRedirecting(true);
          router.push(redirectPaths.signin!);
          return;
        }

        if (!user) {
          setIsChecking(false);
          return;
        }

        // Get current pathname
        const currentPath = window.location.pathname;

        // Validate token
        const token = localStorage.getItem("token");
        if (token) {
          const tokenPayload = validateJWTToken(token);
          if (!tokenPayload) {
            console.log("🔄 Invalid token, redirecting to signin");
            useUserStore.getState().logout();
            setIsRedirecting(true);
            router.push(redirectPaths.signin!);
            return;
          }
        }

        // **CRITICAL LOGIC**: Role-based redirect from root path
        if (currentPath === "/" && hasRequiredRole(user.role, ['admin'])) {
          console.log("🔄 Admin user on root path, redirecting to admin panel");
          setIsRedirecting(true);
          router.push(redirectPaths.admin!);
          return;
        }

        // Check if user is trying to access admin routes without admin role
        if (currentPath.startsWith("/admin") && !hasRequiredRole(user.role, ['admin'])) {
          console.log("🔄 Non-admin user trying to access admin routes, redirecting to home");
          setIsRedirecting(true);
          router.push(redirectPaths.user!);
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error in role redirect check:", error);
        setIsChecking(false);
      }
    };

    // Small delay to allow store to hydrate
    const timer = setTimeout(checkAndRedirect, 100);
    return () => clearTimeout(timer);
  }, [user, isAuthenticated, enableRoleRedirect, router, redirectPaths]);

  return {
    isChecking: showLoading && isChecking,
    isRedirecting: showLoading && isRedirecting,
    shouldShowContent: !isChecking && !isRedirecting
  };
};
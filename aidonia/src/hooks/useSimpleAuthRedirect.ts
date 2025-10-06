"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { normalizeRole, redirectByRole } from "@/utils/auth-helpers";

/**
 * Simple hook to handle authenticated user redirect from auth pages
 * Avoids the complex useAuthGuard logic that causes loops
 */
export const useSimpleAuthRedirect = () => {
  const { user, isAuthenticated } = useUserStore();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only redirect once and only if user is authenticated
    if (!hasRedirectedRef.current && isAuthenticated() && user) {
      hasRedirectedRef.current = true;
      
      const normalizedRole = normalizeRole(user.role);
      redirectByRole(normalizedRole, router);
    }
  }, [user, isAuthenticated, router]);

  return {
    shouldRedirect: isAuthenticated() && user && !hasRedirectedRef.current,
    user
  };
};
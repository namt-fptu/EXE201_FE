"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { ensureValidToken } from "@/services/auth";
import { normalizeRole, redirectByRole } from "@/utils/auth-helpers";
import { debugLog } from "@/utils/debug";

export const useAuthRehydration = () => {
  const { user, loadUserFromStorage, logout } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isRehydrated, setIsRehydrated] = useState(false);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Prevent multiple runs
    if (hasRunRef.current || isRehydrated) {
      return;
    }

    const rehydrateUser = async () => {
      hasRunRef.current = true;
      
      try {
        debugLog.auth("Starting auth rehydration...");
        
        // First, load user from localStorage
        loadUserFromStorage();
        
        // Check if we have valid authentication data
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const savedUser = localStorage.getItem("user");

        if (!token && !refreshToken) {
          debugLog.auth("No authentication data available");
          setIsRehydrated(true);
          return;
        }

        // Parse saved user data
        let parsedUser = null;
        if (savedUser) {
          try {
            parsedUser = JSON.parse(savedUser);
            debugLog.auth("Loaded user from storage", { role: parsedUser.role, username: parsedUser.userName || parsedUser.username });
          } catch (error) {
            debugLog.error("Error parsing saved user data", error);
            localStorage.removeItem("user");
            setIsRehydrated(true);
            return;
          }
        }

        // Ensure we have a valid token (refresh if needed)
        const validToken = await ensureValidToken();

        if (!validToken) {
          debugLog.auth("Unable to get valid token, logging out");
          logout();
          setIsRehydrated(true);
          return;
        }

        // If we have a valid token and user data, check if redirect is needed
        if (validToken && parsedUser) {
          debugLog.auth("Valid token and user data found, checking route...");
          
          const normalizedRole = normalizeRole(parsedUser.role);
          debugLog.auth("User role", normalizedRole);
          
          // Only redirect if we're on specific pages that need redirect
          const needsRedirect = pathname === "/signin" || (pathname === "/" && normalizedRole === "admin");
          
          if (needsRedirect) {
            debugLog.auth(`Redirecting ${normalizedRole} from ${pathname}...`);
            
            // Immediate redirect without delay to prevent flash
            redirectByRole(normalizedRole, router);
          } else {
            debugLog.auth(`User (${normalizedRole}) is on appropriate page: ${pathname}`);
          }
        }

        setIsRehydrated(true);
        debugLog.success("Auth rehydration completed");

      } catch (error) {
        debugLog.error("Authentication rehydration failed", error);
        logout();
        setIsRehydrated(true);
      }
    };

    rehydrateUser();
  }, []); // Empty dependency array - run only once on mount

  return { user, isRehydrated };
};

export default useAuthRehydration;

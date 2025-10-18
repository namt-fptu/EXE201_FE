"use client";
import { useEffect, useRef } from "react";
import useUserStore from "@/redux/userStore";
import useTokenRefresh from "@/hooks/useTokenRefresh";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadUserFromStorage } = useUserStore();
  const { checkAndRefreshToken } = useTokenRefresh();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  // Simple initialization - just load from storage once
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Load user from storage synchronously
      loadUserFromStorage();

      // Debug: Check what user data was loaded
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log("🔍 AuthProvider: Loaded user data:", {
            userName: userData.userName,
            hasAvatar: !!userData.avataImage,
            avatarUrl: userData.avataImage,
          });
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }

      // Set up token refresh interval
      refreshIntervalRef.current = setInterval(
        () => {
          checkAndRefreshToken();
        },
        10 * 60 * 1000
      ); // 10 minutes
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []); // Empty deps - run only once

  return <>{children}</>;
}

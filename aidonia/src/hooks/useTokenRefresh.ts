"use client";
import { useCallback } from "react";
import { refreshAccessToken, isTokenExpired } from "@/services/auth";
import useUserStore from "@/redux/userStore";

export const useTokenRefresh = () => {
  const { logout } = useUserStore();

  const checkAndRefreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token || !refreshToken) {
        logout();
        return false;
      }

      // Check if token is expired or about to expire
      if (isTokenExpired(token)) {
        const newToken = await refreshAccessToken();
        return !!newToken;
      }

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  }, [logout]);

  const forceRefreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await refreshAccessToken();
      return !!newToken;
    } catch (error) {
      console.error("Force token refresh failed:", error);
      logout();
      return false;
    }
  }, [logout]);

  return {
    checkAndRefreshToken,
    forceRefreshToken,
  };
};

export default useTokenRefresh;

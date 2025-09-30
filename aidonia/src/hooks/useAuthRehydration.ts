"use client";
import { useEffect } from "react";
import api from "@/services/axios";
import useUserStore from "@/redux/userStore";
import { ensureValidToken } from "@/services/auth";

export const useAuthRehydration = () => {
  const { setUser, user, loadUserFromStorage, logout } = useUserStore();

  useEffect(() => {
    const rehydrateUser = async () => {
      // First, try to load user from localStorage
      if (!user) {
        loadUserFromStorage();
      }

      // Check if we have valid authentication data
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token && !refreshToken) {
        // No authentication data available
        return;
      }

      try {
        // Ensure we have a valid token (refresh if needed)
        const validToken = await ensureValidToken();

        if (!validToken) {
          // Unable to get valid token, clear everything
          logout();
          return;
        }

        // If we have a valid token but no user data, fetch user info
        if (validToken && !user) {
          try {
            const response = await api.get(`users/${user.id}`); // You'll need to implement this endpoint

            if (response.data) {
              const userData = {
                id: response.data.id.toString(),
                username: response.data.username || response.data.userName,
                role: response.data.role,
                avatarImage:
                  response.data.avataImage || response.data.avatarImage,
              };
              setUser(userData);
            }
          } catch (userError) {
            console.error("Failed to fetch user data:", userError);
            if (
              userError &&
              typeof userError === "object" &&
              "code" in userError
            ) {
              if (userError.code === "ERR_NETWORK") {
                console.error(
                  "Network error while fetching user data - backend server may be unreachable"
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Authentication rehydration failed:", error);
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "ERR_NETWORK") {
            console.error(
              "Network error during rehydration - backend server may be down"
            );
          }
        }
        logout();
      }
    };

    rehydrateUser();
  }, [setUser, user, loadUserFromStorage, logout]);

  return { user };
};

export default useAuthRehydration;

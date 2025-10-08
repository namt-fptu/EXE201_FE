"use client";
import { useState } from "react";
import useUserStore from "@/redux/userStore";
import { logoutUser, isTokenExpired } from "@/services/auth";
import useTokenRefresh from "@/hooks/useTokenRefresh";
import { toast } from "sonner";

export default function UserProfile() {
  const { user } = useUserStore();
  const { forceRefreshToken } = useTokenRefresh();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    toast.info("Signing out...", {
      duration: 2000,
    });
    await logoutUser();
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const success = await forceRefreshToken();
      if (success) {
        toast.success("Token refreshed successfully!", {
          duration: 3000,
        });
      } else {
        toast.error("Failed to refresh token", {
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("Error refreshing token", {
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTokenStatus = () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) {
      return "No tokens available";
    }

    if (isTokenExpired(token)) {
      return "Token expired";
    }

    return "Token valid";
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Username:</strong> {user.userName || 'N/A'}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Token Status:</strong> {getTokenStatus()}
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleRefreshToken}
          disabled={isRefreshing}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Token"}
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

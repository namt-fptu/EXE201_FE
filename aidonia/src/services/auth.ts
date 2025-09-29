import api from "@/services/axios";
import useUserStore from "@/redux/userStore";

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post("auth/refresh-access-token", {
      refreshToken: refreshToken,
    });

    if (
      response.data &&
      (response.data.accessToken || response.data.AccessToken)
    ) {
      const newToken = response.data.accessToken || response.data.AccessToken;
      localStorage.setItem("token", newToken);
      return newToken;
    }

    throw new Error("Invalid refresh token response");
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Clear invalid tokens
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Clear user state
    const { logout } = useUserStore.getState();
    logout();

    throw error;
  }
};

// Function to check if token is expired or about to expire
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Check if token expires within the next 5 minutes
    return payload.exp < currentTime + 300;
  } catch {
    return true;
  }
};

// Function to proactively refresh token if needed
export const ensureValidToken = async (): Promise<string | null> => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    try {
      return await refreshAccessToken();
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }

  return token;
};

export const logoutUser = async () => {
  try {
    // Get refresh token from localStorage
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      // Use revoke-token endpoint to invalidate the refresh token
      await api.post("auth/revoke-token", {
        refreshToken: refreshToken,
      });
    }
  } catch (error) {
    console.error("Error during token revocation:", error);
    // Continue with logout even if token revocation fails
  } finally {
    // Always clear local state regardless of API call result
    const { logout } = useUserStore.getState();
    logout();

    // Redirect to signin page
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
  }
};

export default logoutUser;

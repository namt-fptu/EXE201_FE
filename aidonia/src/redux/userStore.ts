import { create } from "zustand";
import { NormalizedRole } from "@/utils/auth-helpers";

interface User {
  id: number;
  userName: string;
  email: string;
  phoneNumber?: string;
  location?: string | null;
  role?: string;
  reputationScore?: number;
  avataImage?: string | null;
  phoneVerified?: boolean;
  mailVerified?: boolean;
  token?: string | null;
  refreshToken?: string | null;
  residentId?: string; // Added for API compatibility
  // Additional fields for UI
  fullName?: string;
  bio?: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  loadUserFromStorage: () => void;
  updateUserProfile: (profileData: Partial<User>) => void;
}

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    // Also save to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },
  logout: () => {
    console.log("🧹 UserStore: Clearing user state...");
    set({ user: null });
    
    // Clear all authentication data
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // ✅ CRITICAL: Clear cookies too for middleware
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      
      // Also clear any session storage
      sessionStorage.clear();
      
      console.log("✅ UserStore: All authentication data cleared including cookies");
    }
  },
  isAuthenticated: () => {
    const { user } = get();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (!user || !token) {
      return false;
    }

    // Validate JWT token
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn("Invalid JWT token format");
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check if token is expired
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        console.warn("JWT token is expired");
        // Auto-logout when token is expired
        get().logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  },
  loadUserFromStorage: () => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (savedUser && token) {
        try {
          const user = JSON.parse(savedUser);
          set({ user });
        } catch (error) {
          console.error("Error parsing saved user data:", error);
          // Clear invalid data
          localStorage.removeItem("user");
        }
      }
    }
  },
  updateUserProfile: (profileData) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...profileData };
      set({ user: updatedUser });
      // Also save to localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }  
  },
}));

export default useUserStore;

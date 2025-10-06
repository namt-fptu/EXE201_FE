import { create } from "zustand";

interface User {
  id: string;
  username: string;
  role: string;
  avatarImage?: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  loadUserFromStorage: () => void;
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
      
      // Also clear any session storage
      sessionStorage.clear();
      
      console.log("✅ UserStore: All authentication data cleared");
    }
  },
  isAuthenticated: () => {
    const { user } = get();
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return !!(user && token);
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
}));

export default useUserStore;

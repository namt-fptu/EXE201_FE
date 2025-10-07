/**
 * Development utility to clear all auth data
 * Use this in browser console: clearAuthData()
 */

declare global {
  interface Window {
    clearAuthData: () => void;
  }
}

export const clearAuthData = () => {
  console.log("🧹 Clearing all authentication data...");
  
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  console.log("✅ All auth data cleared!");
  console.log("🔄 Reloading page...");
  
  // Reload page
  window.location.reload();
};

// Make it available globally for debugging
if (typeof window !== "undefined") {
  window.clearAuthData = clearAuthData;
}
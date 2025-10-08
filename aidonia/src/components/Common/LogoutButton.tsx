"use client";

import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { toast } from "sonner";

interface LogoutButtonProps {
  children: React.ReactNode;
  className?: string;
  showToast?: boolean;
}

/**
 * ✅ Secure Logout Component
 * - Clears all authentication data (localStorage, cookies, store)
 * - Redirects to signin page
 * - Prevents admin from staying on restricted pages
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  children,
  className = "",
  showToast = true
}) => {
  const router = useRouter();
  const { logout } = useUserStore();

  const handleLogout = async () => {
    try {
      // Clear all authentication data
      logout();
      
      // Show success message
      if (showToast) {
        toast.success("Logged out successfully");
      }
      
      // Force redirect to signin page
      router.replace("/signin");
      
      console.log("✅ Logout completed, redirected to signin");
    } catch (error) {
      console.error("Error during logout:", error);
      if (showToast) {
        toast.error("Error during logout");
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
};

/**
 * Hook for programmatic logout
 */
export const useLogout = () => {
  const router = useRouter();
  const { logout } = useUserStore();

  const performLogout = async (options?: { showToast?: boolean; redirectTo?: string }) => {
    const { showToast = true, redirectTo = "/signin" } = options || {};
    
    try {
      logout();
      
      if (showToast) {
        toast.success("Logged out successfully");
      }
      
      router.replace(redirectTo);
      
      console.log(`✅ Logout completed, redirected to ${redirectTo}`);
    } catch (error) {
      console.error("Error during logout:", error);
      if (showToast) {
        toast.error("Error during logout");
      }
    }
  };

  return { performLogout };
};
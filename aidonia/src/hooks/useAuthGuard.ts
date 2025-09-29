"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { toast } from "react-toastify";

export const useAuthGuard = (
  redirectTo: string = "/",
  options?: {
    requireAuth?: boolean;
    message?: string;
  }
) => {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();

      // For protected routes (requireAuth: true)
      if (options?.requireAuth && !isAuth) {
        router.replace(redirectTo);
        toast.error(options.message || "Please sign in to access this page");
        return;
      }

      // For auth pages (requireAuth: false or undefined) - redirect if already authenticated
      if (!options?.requireAuth && isAuth) {
        router.replace(redirectTo);
        toast.info(options.message || "You are already signed in!");
        return;
      }

      setCanAccess(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, router, redirectTo, options]);

  return { isChecking, canAccess };
};

export default useAuthGuard;

"use client";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import useAuthRehydration from "@/hooks/useAuthRehydration";
import useTokenRefresh from "@/hooks/useTokenRefresh";
import "react-toastify/dist/ReactToastify.css";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthRehydration();
  const { checkAndRefreshToken } = useTokenRefresh();

  // Set up automatic token refresh check every 10 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        checkAndRefreshToken();
      },
      10 * 60 * 1000
    ); // 10 minutes

    return () => clearInterval(interval);
  }, [checkAndRefreshToken]);

  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

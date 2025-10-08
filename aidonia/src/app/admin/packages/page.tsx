"use client";

import useAuthGuard from "@/hooks/useAuthGuard";
import PackagesManager from "@/components/admin/Packages/PackagesManager";

export default function AdminPackagesPage() {
  // Protect route - only allow admin users
  const { isChecking, canAccess } = useAuthGuard("/signin", {
    requireAuth: true,
    requiredRoles: ["admin"],
    message:
      "You do not have permission to access the packages management page.",
  });

  // Show loading while checking authentication
  if (isChecking || !canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isChecking ? "Checking permissions..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full">
      <PackagesManager />
    </div>
  );
}

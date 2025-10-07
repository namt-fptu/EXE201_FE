"use client";

import { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface WithAdminProtectionProps {
  // Add any common props here if needed
}

interface AuthOptions {
  redirectTo?: string;
  message?: string;
  showLoading?: boolean;
  loadingMessage?: string;
}

/**
 * Higher-Order Component that protects admin-only pages
 * Usage: export default withAdminProtection(YourComponent);
 */
export function withAdminProtection<P extends WithAdminProtectionProps>(
  WrappedComponent: ComponentType<P>,
  options: AuthOptions = {}
) {
  const {
    redirectTo = "/signin",
    message = "You do not have permission to access this admin page.",
    showLoading = true,
    loadingMessage = "Checking permissions..."
  } = options;

  const ProtectedComponent = (props: P) => {
    const { isChecking, canAccess } = useAuthGuard(redirectTo, {
      requireAuth: true,
      requiredRoles: ["admin"],
      message,
    });

    const router = useRouter();

    useEffect(() => {
      if (!isChecking && !canAccess) {
        router.replace(redirectTo);
      }
    }, [isChecking, canAccess, router]);

    // Show loading state while checking auth
    if (isChecking && showLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="text-slate-600 font-semibold">{loadingMessage}</p>
          </div>
        </div>
      );
    }

    // Don't render anything if user doesn't have access
    if (!canAccess) {
      return null;
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  ProtectedComponent.displayName = `withAdminProtection(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
}

/**
 * Component that shows admin-only content
 * Usage: <AdminOnly>Your admin content</AdminOnly>
 */
export function AdminOnly({ 
  children, 
  fallback = null,
  showLoading = false 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}) {
  const { isChecking, canAccess } = useAuthGuard("/signin", {
    requireAuth: true,
    requiredRoles: ["admin"],
  });

  if (isChecking && showLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default withAdminProtection;
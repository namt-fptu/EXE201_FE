"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  redirectTo?: string;
  message?: string;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

/**
 * Protected Route Component
 * Wraps content that requires authentication/authorization
 * 
 * Usage:
 * <ProtectedRoute requiredRoles={["admin"]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  redirectTo = "/signin",
  message,
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps) {
  const { isChecking, canAccess } = useAuthGuard(redirectTo, {
    requireAuth,
    requiredRoles,
    message,
  });

  const router = useRouter();

  useEffect(() => {
    if (!isChecking && !canAccess) {
      router.replace(redirectTo);
    }
  }, [isChecking, canAccess, router, redirectTo]);

  // Show loading state
  if (isChecking) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-slate-600 font-semibold">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!canAccess) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h3>
          <p className="text-slate-600">You don't have permission to access this content.</p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Admin-specific protected route shorthand
 */
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute
      requiredRoles={["admin"]}
      message="You do not have permission to access this admin area."
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
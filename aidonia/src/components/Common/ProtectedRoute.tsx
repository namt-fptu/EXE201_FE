"use client";

import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
  message?: string;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component that wraps children with authentication/authorization checks
 * Uses useAuthGuard hook internally for consistent protection logic
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/unauthorized',
  message,
  fallback
}) => {
  const canAccess = useAuthGuard(redirectTo, {
    requireAuth: true,
    requiredRoles,
    message
  });

  // Show custom fallback or default loading while checking authorization
  if (!canAccess) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Higher-Order Component version for wrapping entire page components
 */
export const withProtectedRoute = (
  WrappedComponent: React.ComponentType<any>,
  options?: Omit<ProtectedRouteProps, 'children'>
) => {
  const ProtectedComponent = (props: any) => (
    <ProtectedRoute {...options}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );

  ProtectedComponent.displayName = `withProtectedRoute(${WrappedComponent.displayName || WrappedComponent.name})`;
  return ProtectedComponent;
};
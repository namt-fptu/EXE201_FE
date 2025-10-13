"use client";

import { ReactNode } from "react";
import { AdminRoute } from "@/components/admin/Auth/ProtectedRoute";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin Layout wrapper with built-in authentication
 * Automatically protects all admin pages
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRoute
      loadingComponent={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Aidonia Admin</h2>
              <p className="text-slate-600 font-semibold">Verifying admin access...</p>
            </div>
          </div>
        </div>
      }
      unauthorizedComponent={
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Admin Access Required</h1>
              <p className="text-slate-700 font-medium mb-6 leading-relaxed">
                This area is restricted to administrators only. Please contact your system administrator if you believe you should have access.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 hover:scale-105 shadow-lg shadow-primary-500/25"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </AdminRoute>
  );
}

export default AdminLayout;
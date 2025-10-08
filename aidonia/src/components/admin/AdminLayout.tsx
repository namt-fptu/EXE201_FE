"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/Common/ProtectedRoute';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

/**
 * AdminLayout component that wraps all admin pages with authentication
 * Ensures all admin content is properly protected
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pageTitle
}) => {
  return (
    <ProtectedRoute 
      requiredRoles={['admin']} 
      message={`You need admin privileges to access ${pageTitle || 'this page'}.`}
      redirectTo="/unauthorized"
    >
      {children}
    </ProtectedRoute>
  );
};

export default AdminLayout;
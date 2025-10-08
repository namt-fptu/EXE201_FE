"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/redux/userStore';

interface AuthFixerProps {
  children: React.ReactNode;
}

export const AuthFixer: React.FC<AuthFixerProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const router = useRouter();
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const fixAuthenticationIssues = async () => {
      try {
        console.log('🔧 AuthFixer: Starting authentication check...');
        
        // 1. Check localStorage data
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const savedUser = localStorage.getItem('user');
        
        if (!token || !savedUser) {
          console.log('❌ AuthFixer: No token or user data found');
          setIsChecking(false);
          return;
        }
        
        // 2. Parse user data
        let userData;
        try {
          userData = JSON.parse(savedUser);
        } catch (e) {
          console.log('❌ AuthFixer: Invalid user data JSON');
          setIsChecking(false);
          return;
        }
        
        // 3. Ensure cookie is set for middleware
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        if (!cookies.token) {
          console.log('🔧 AuthFixer: Setting auth cookie...');
          document.cookie = `token=${token}; path=/; max-age=${60 * 30}; SameSite=Lax`;
        }
        
        // 4. Update user store if needed
        if (!user || user.id !== userData.id) {
          console.log('🔧 AuthFixer: Updating user store...');
          setUser(userData);
        }
        
        // 5. Check if redirect is needed
        const currentPath = window.location.pathname;
        const userRole = userData.role?.toLowerCase();
        
        console.log(`🔧 AuthFixer: Current path: ${currentPath}, User role: ${userRole}`);
        
        // Redirect logic
        if (userRole === 'admin' && currentPath === '/') {
          console.log('🚀 AuthFixer: Redirecting admin to /admin');
          router.replace('/admin');
        } else if (userRole === 'admin' && currentPath === '/signin') {
          console.log('🚀 AuthFixer: Redirecting admin from signin to /admin');
          router.replace('/admin');
        } else if (userRole !== 'admin' && currentPath.startsWith('/admin')) {
          console.log('🚀 AuthFixer: Redirecting non-admin from admin area');
          router.replace('/');
        } else if (currentPath === '/signin' && token) {
          console.log('🚀 AuthFixer: Redirecting authenticated user from signin');
          router.replace(userRole === 'admin' ? '/admin' : '/');
        }
        
        setDebugInfo(`✅ Auth Status: Token=${!!token}, User=${userData.username}, Role=${userRole}, Path=${currentPath}`);
        
      } catch (error) {
        console.error('❌ AuthFixer error:', error);
        setDebugInfo(`❌ Auth Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        // Give some time for any redirects to take effect
        setTimeout(() => {
          setIsChecking(false);
        }, 1000);
      }
    };

    fixAuthenticationIssues();
  }, [router, user, setUser]);

  // Show debug info in development
  if (process.env.NODE_ENV === 'development' && debugInfo) {
    console.log('🔧 AuthFixer Debug:', debugInfo);
  }

  // Show loading during check
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Checking authentication...</p>
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <p className="text-xs text-blue-600 mt-2 max-w-sm">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthFixer;
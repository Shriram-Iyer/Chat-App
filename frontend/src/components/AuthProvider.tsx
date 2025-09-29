'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import type { UserResponse } from '@/types/user';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Debug: track mount/unmount
  useEffect(() => {
    return () => {};
  }, []);
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, isCheckingAuth, checkAuth, connectSocket, disconnectSocket } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connect socket after authentication and on protected routes
  useEffect(() => {
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);
    if (authUser && !isPublicRoute) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [authUser, pathname, connectSocket, disconnectSocket]);

  // Route protection logic
  useEffect(() => {
    // Don't redirect while checking auth
    if (isCheckingAuth) return;
    
    // Define public routes (accessible without authentication)
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);
    
    // Define protected routes (require authentication)
    const protectedRoutes = ['/', '/profile', '/chat', '/call', '/notifications'];
    const isProtectedRoute = protectedRoutes.includes(pathname);
    
    if (!authUser) {
      // Not authenticated - redirect to login if trying to access protected routes
      if (isProtectedRoute) {
        router.push('/login');
      }
    } else {
      // Authenticated - redirect away from auth pages to homepage
      if (isPublicRoute) {
        router.push('/');
      }
    }
  }, [authUser, isCheckingAuth, pathname, router]);

  // Show full-page loader when checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if user is not authenticated
  const protectedRoutes = ['/', '/profile', '/chat', '/call', '/notifications'];
  const isProtectedRoute = protectedRoutes.includes(pathname);
  
  if (!authUser && isProtectedRoute) {
    // Return null to prevent flash of content while redirecting
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user: authUser, 
      isLoading: isCheckingAuth, 
      isError: false, 
      refetch: checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('withAuth must be used within an AuthProvider');
    }
    const { user, isLoading } = context;
    
    if (isLoading) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title">Authentication Required</h2>
              <a href="/login" className="btn btn-primary">Go to Login</a>
            </div>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

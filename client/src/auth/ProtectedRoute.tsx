/**
 * PADDOCK20 Protected Route
 * F1-grade access control for secure paddock areas
 */
import React, { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireOnboarding?: boolean;
}

/**
 * Protected Route Component
 * 
 * Secures routes by checking authentication status and role requirements.
 * Redirects users to appropriate pages based on their authentication state.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireOnboarding = false
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Show loading spinner while authentication is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-t-2 border-carolina-blue border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-carolina-blue font-orbitron">Accessing Paddock...</p>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }
  
  // If route requires admin role but user is not an admin
  if (requireAdmin && user?.role !== 'admin') {
    return <Redirect to="/the-paddock" />;
  }
  
  // If user hasn't completed onboarding but the route requires it
  if (requireOnboarding && !user?.onboardingCompleted) {
    return <Redirect to="/beta-agreement" />;
  }
  
  // User is authenticated and meets all requirements
  return <>{children}</>;
};

/**
 * Admin-only Protected Route Component
 */
export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Onboarded-only Protected Route Component
 */
export const OnboardedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requireOnboarding={true}>
      {children}
    </ProtectedRoute>
  );
};
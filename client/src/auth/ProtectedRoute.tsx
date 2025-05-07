/**
 * PADDOCK20 Protected Route
 * F1-grade access control for secure paddock areas
 */
import React, { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { AuthPermission, AuthRole } from './types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: AuthPermission[];
  requiredRole?: AuthRole;
  requireOnboarding?: boolean;
  redirectPath?: string;
}

/**
 * Protected Route Component
 * 
 * Secures routes by checking authentication status and permission requirements.
 * Redirects users to appropriate pages based on their authentication state.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requireOnboarding = false,
  redirectPath = "/auth"
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();
  
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
  
  // Check for specific role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return <Redirect to={redirectPath} />;
  }
  
  // Check for specific permissions
  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return <Redirect to={redirectPath} />;
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
export const AdminRoute: React.FC<{ children: ReactNode; redirectPath?: string }> = ({ 
  children, 
  redirectPath = "/the-paddock" 
}) => {
  return (
    <ProtectedRoute 
      requiredPermissions={[AuthPermission.VIEW_ADMIN_DASHBOARD]}
      redirectPath={redirectPath}
    >
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

/**
 * Premium features route component
 */
export const PremiumRoute: React.FC<{ children: ReactNode; redirectPath?: string }> = ({ 
  children, 
  redirectPath = "/premium" 
}) => {
  return (
    <ProtectedRoute 
      requiredPermissions={[AuthPermission.ACCESS_PREMIUM_FEATURES]}
      redirectPath={redirectPath}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Beta features route component
 */
export const BetaRoute: React.FC<{ children: ReactNode; redirectPath?: string }> = ({ 
  children, 
  redirectPath = "/the-paddock" 
}) => {
  return (
    <ProtectedRoute 
      requiredPermissions={[AuthPermission.ACCESS_BETA_FEATURES]}
      redirectPath={redirectPath}
    >
      {children}
    </ProtectedRoute>
  );
};
/**
 * PermissionRoute Component
 * Protects routes based on user permissions
 */

import React from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { AuthPermission } from './types';
import PremiumFeatureBanner from '@/components/PremiumFeatureBanner';
import { Loader2 } from 'lucide-react';

interface PermissionRouteProps {
  path: string;
  permission: AuthPermission | AuthPermission[];
  component: React.ReactNode;
  fallback?: React.ReactNode;
  premiumFeatureName?: string;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  path,
  permission,
  component,
  fallback,
  premiumFeatureName
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission } = usePermissions();
  const [, navigate] = useLocation();
  
  // Check if user has permission
  const hasAccess = hasPermission(permission);
  
  // Set up route
  return (
    <Route path={path}>
      {() => {
        // If auth is still loading, show loading state
        if (loading) {
          return (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-carolina-blue" />
            </div>
          );
        }
        
        // If not authenticated, redirect to auth page
        if (!isAuthenticated) {
          navigate('/auth');
          return null;
        }
        
        // If authenticated but no permission, show fallback or premium banner
        if (!hasAccess) {
          // If fallback is provided, show that
          if (fallback) {
            return <>{fallback}</>;
          }
          
          // Otherwise show premium banner for premium features
          return (
            <PremiumFeatureBanner
              featureName={premiumFeatureName}
              description={
                Array.isArray(permission) && permission.includes(AuthPermission.ACCESS_PREMIUM_FEATURES) ||
                permission === AuthPermission.ACCESS_PREMIUM_FEATURES
                  ? "This premium feature requires an upgraded subscription."
                  : "You don't have permission to access this feature."
              }
            />
          );
        }
        
        // If authenticated and has permission, show component
        return <>{component}</>;
      }}
    </Route>
  );
};

/**
 * PremiumRoute - Specialized PermissionRoute for premium features
 */
interface PremiumRouteProps {
  path: string;
  component: React.ReactNode;
  featureName?: string;
}

export const PremiumRoute: React.FC<PremiumRouteProps> = ({
  path,
  component,
  featureName
}) => {
  return (
    <PermissionRoute
      path={path}
      permission={AuthPermission.ACCESS_PREMIUM_FEATURES}
      component={component}
      premiumFeatureName={featureName}
    />
  );
};

/**
 * AdminRoute - Specialized PermissionRoute for admin features
 */
interface AdminRouteProps {
  path: string;
  component: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  path,
  component
}) => {
  return (
    <PermissionRoute
      path={path}
      permission={AuthPermission.VIEW_ADMIN_DASHBOARD}
      component={component}
      fallback={(
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <div className="bg-zinc-900 border border-carolina-blue rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
            <p className="text-zinc-400 mb-4">
              You need Team Principal or Race Engineer privileges to access this area.
            </p>
          </div>
        </div>
      )}
    />
  );
};

/**
 * BetaRoute - Specialized PermissionRoute for beta features
 */
interface BetaRouteProps {
  path: string;
  component: React.ReactNode;
  featureName?: string;
}

export const BetaRoute: React.FC<BetaRouteProps> = ({
  path,
  component,
  featureName
}) => {
  return (
    <PermissionRoute
      path={path}
      permission={AuthPermission.ACCESS_BETA_FEATURES}
      component={component}
      fallback={(
        <div className="container max-w-2xl mx-auto py-12 px-4">
          <div className="bg-zinc-900 border border-carolina-blue rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Beta Access Required</h2>
            <p className="text-zinc-400 mb-4">
              {featureName ? `${featureName} is` : 'This feature is'} currently in beta testing.
              Join our beta program to get early access.
            </p>
          </div>
        </div>
      )}
    />
  );
};
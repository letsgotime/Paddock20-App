/**
 * usePermissions hook
 * Provides role-based access control functionality for the application
 */

import { useAuth } from './useAuth';
import { AuthPermission, ROLE_PERMISSIONS } from './types';

interface UsePermissionsReturn {
  hasPermission: (permission: AuthPermission | AuthPermission[]) => boolean;
  isAdmin: boolean;
  isBetaTester: boolean;
  isPremium: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if the user has the specified permission(s)
   */
  const hasPermission = (requiredPermission: AuthPermission | AuthPermission[]): boolean => {
    // If not authenticated, no permissions
    if (!isAuthenticated || !user) {
      return false;
    }

    // Get permissions for user's role
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    // Check for array of permissions (any match = true)
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.some(permission => userPermissions.includes(permission));
    }

    // Check for single permission
    return userPermissions.includes(requiredPermission);
  };

  /**
   * Quick checks for common permission patterns
   */
  const isAdmin = hasPermission(AuthPermission.VIEW_ADMIN_DASHBOARD);
  const isBetaTester = hasPermission(AuthPermission.ACCESS_BETA_FEATURES);
  const isPremium = hasPermission(AuthPermission.ACCESS_PREMIUM_FEATURES);

  return {
    hasPermission,
    isAdmin,
    isBetaTester,
    isPremium
  };
}

export default usePermissions;
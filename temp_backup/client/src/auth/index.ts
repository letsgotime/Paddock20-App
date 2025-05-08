/**
 * Auth Module Index
 * Centralizes all auth-related exports
 */

// Export core auth hooks and providers
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export { usePermissions } from './usePermissions';

// Export route protection components
export { 
  PermissionRoute, 
  PremiumRoute, 
  AdminRoute, 
  BetaRoute 
} from './PermissionRoute';

// Export types
export {
  AuthRole,
  AuthPermission,
  ROLE_PERMISSIONS,
  type User,
  type AuthState,
  type LoginCredentials,
  type RegisterData,
  type ApiResponse,
  type AuthContextType
} from './types';
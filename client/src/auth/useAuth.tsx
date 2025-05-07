/**
 * PADDOCK20 useAuth Hook
 * F1-precision authentication hook for driver access controls
 */
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import type { AuthContextType } from './types';
import { AuthRole, AuthPermission, ROLE_PERMISSIONS } from './types';

/**
 * Hook to access authentication context
 * 
 * @returns Authentication context with user data and auth methods
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. Make sure AuthProvider is in your component tree.'
    );
  }
  
  return context;
}

/**
 * Hook to check if the current user is an admin (Team Principal or Race Engineer)
 * 
 * @returns Boolean indicating if user has admin privileges
 */
export function useIsAdmin(): boolean {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && (
    user?.role === AuthRole.TEAM_PRINCIPAL || 
    user?.role === AuthRole.RACE_ENGINEER
  );
}

/**
 * Hook to check if the current user is a premium subscriber
 * 
 * @returns Boolean indicating if user has premium subscription
 */
export function useIsPremium(): boolean {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) return false;
  
  // Check via subscription tier
  if (user.subscriptionTier === 'premium' || user.subscriptionTier === 'team') {
    return true;
  }
  
  // Check via role
  return (
    user.role === AuthRole.TEAM_MANAGER || 
    user.role === AuthRole.TEAM_PRINCIPAL || 
    user.role === AuthRole.RACE_ENGINEER
  );
}

/**
 * Hook to check if the current user is a beta tester
 * 
 * @returns Boolean indicating if user is a beta tester
 */
export function useIsBetaTester(): boolean {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && user?.role === AuthRole.BETA_TESTER;
}

/**
 * Hook to check if the current user has completed onboarding
 * 
 * @returns Boolean indicating if user has completed onboarding
 */
export function useHasCompletedOnboarding(): boolean {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && !!user?.onboardingCompleted;
}
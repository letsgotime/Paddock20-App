/**
 * PADDOCK20 useAuth Hook
 * F1-precision authentication hook for driver access controls
 */
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import type { AuthContextType } from './types';

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
 * Hook to check if the current user is an admin
 * 
 * @returns Boolean indicating if user has admin role
 */
export function useIsAdmin(): boolean {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && user?.role === 'admin';
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
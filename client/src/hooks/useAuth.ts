import { useAuthContext } from './useAuthContext';

/**
 * Auth hook that works with server-side authentication
 */
export function useAuth() {
  // Simply return the auth context
  return useAuthContext();
}

// Types are already defined in AuthContext.tsx
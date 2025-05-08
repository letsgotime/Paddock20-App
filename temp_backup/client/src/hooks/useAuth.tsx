// We'll import directly from the exports to prevent import cycles
import { createContext, useContext, ReactNode } from 'react';
import { useNativeAuth, User } from './useNativeAuth';

// Define compatibility layer types to match the expected interface
export interface AuthCompatibilityLayer {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create a context for the auth compatibility layer
export const AuthContext = createContext<AuthCompatibilityLayer | null>(null);

// Auth compatibility provider that wraps the native auth
export function AuthProvider({ children }: { children: ReactNode }) {
  const nativeAuth = useNativeAuth();
  
  // Adapt/wrap the native auth methods to match the legacy API
  const login = async (email: string, password: string): Promise<void> => {
    const result = await nativeAuth.login(email, password);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<void> => {
    const result = await nativeAuth.register(email, password, username);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const logout = async (): Promise<void> => {
    const result = await nativeAuth.logout();
    if (!result.success) {
      throw new Error(result.error);
    }
  };
  
  // Create the compatibility layer value
  const authValue: AuthCompatibilityLayer = {
    user: nativeAuth.user,
    loading: nativeAuth.loading,
    isAuthenticated: nativeAuth.isAuthenticated,
    error: nativeAuth.error,
    login,
    register,
    logout
  };
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Enhanced hook that provides access to authentication functionality
 * This is now a compatibility layer that redirects to the new native auth system
 */
export function useAuth(): AuthCompatibilityLayer {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
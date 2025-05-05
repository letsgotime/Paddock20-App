import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Whether to enable development fallback that prevents errors
const DEV_FALLBACK = true;
const DEV_ENVIRONMENT = process.env.NODE_ENV === 'development';

// Mock user for development fallback if needed
const fallbackUser = {
  id: 99999,
  username: 'DevUser',
  email: 'dev@example.com',
  firstName: 'Development',
  lastName: 'User',
  fullName: 'Development User',
  profileImage: null,
  role: 'admin' as const
};

/**
 * Enhanced hook that provides access to authentication functionality
 * Includes fallback for development to prevent breaking the app
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  // In development, provide fallback to prevent breaking the app
  if (!context && DEV_ENVIRONMENT && DEV_FALLBACK) {
    console.warn('Using development fallback for AuthContext - wrap components in AuthProvider for production');
    
    // Return a minimal implementation that won't break the app during development
    return {
      user: fallbackUser,
      session: { user: fallbackUser },
      loading: false,
      error: null,
      login: async () => {
        console.warn('Login called outside AuthProvider');
        return fallbackUser;
      },
      register: async () => {
        console.warn('Register called outside AuthProvider');
        return fallbackUser;
      },
      logout: async () => {
        console.warn('Logout called outside AuthProvider');
      }
    };
  }
  
  // In production, we need a proper provider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
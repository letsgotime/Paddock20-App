import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Enhanced hook that provides access to authentication functionality
 * 
 * This hook abstracts the Auth0 integration and session management
 * behind a simple interface for components to use.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  // In production, we need a proper provider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add a computed property for authentication state
  // This simplifies checking if the user is authenticated
  const isAuthenticated = !!context.session;
  
  // Return the context with the additional helper
  return {
    ...context,
    isAuthenticated
  };
}
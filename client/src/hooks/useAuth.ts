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
  
  // Use the isAuthenticated value from context (which is derived from user existence)
  // This ensures consistency across the application
  
  // Return the context directly - the isAuthenticated property is already computed in AuthContext
  return context;
}
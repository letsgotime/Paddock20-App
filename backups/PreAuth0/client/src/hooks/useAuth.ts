import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Enhanced hook that provides access to authentication functionality
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  // In production, we need a proper provider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
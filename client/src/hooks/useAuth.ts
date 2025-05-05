import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook that provides access to authentication functionality
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
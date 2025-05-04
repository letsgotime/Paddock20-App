import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserDisplayName } from '../utils/DataIntegrityVerifier';

/**
 * Hook that provides access to authentication functionality
 * Falls back to development values if no context is available
 */
export function useAuth() {
  // First try to use the real AuthContext
  const authContext = useContext(AuthContext);
  
  // If we have an auth context, use it
  if (authContext) {
    return authContext;
  }
  
  // Otherwise, provide a fallback implementation for development
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Mock user for development - using dynamic display name
  const userDisplayName = getUserDisplayName();
  const nameParts = userDisplayName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  const user = {
    id: 1,
    username: userDisplayName,
    email: `${firstName.toLowerCase()}@gotime.com`,
    firstName: firstName,
    lastName: lastName,
    fullName: userDisplayName,
    role: 'admin' as const
  };
  
  // Mock login function
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Login successful:', username);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };
  
  // Mock register function
  const register = async (userData: any) => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Registration successful:', userData.username);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return false;
    }
  };
  
  // Mock logout function
  const logout = async () => {
    console.log('Logout successful');
    return true;
  };
  
  // Return dev implementation
  return {
    user,
    session: user ? { user } : null,
    loading,
    error,
    login,
    register,
    logout
  };
}
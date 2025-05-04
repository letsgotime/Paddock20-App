import { useState } from 'react';

/**
 * Development version of auth hook with hardcoded values
 * to avoid authentication errors
 */
export function useAuth() {
  // Hardcoded dev user to prevent auth errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Mock user for development
  const user = {
    id: 1,
    username: 'Gavin Brooks',
    email: 'gavin@gotime.com',
    firstName: 'Gavin',
    lastName: 'Brooks',
    fullName: 'Gavin Brooks',
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
  
  return {
    user,
    loading,
    error,
    login,
    register,
    logout
  };
}

// Types are already defined in AuthContext.tsx
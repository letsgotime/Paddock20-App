import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

// Define user type
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  profileImage?: string | null;
  role?: string;
  createdAt?: string;
}

// Define auth context type
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
}

// Create context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => ({ success: false, error: 'Auth context not initialized' }),
  register: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
  updateProfile: async () => ({ success: false, error: 'Auth context not initialized' }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user');
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (err) {
        console.log('No authenticated user found');
        // Not setting error for 401 as it's expected when not logged in
        if (axios.isAxiosError(err) && err.response?.status !== 401) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/login', { email, password });
      
      if (response.status === 200) {
        setUser(response.data);
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (err) {
      let errorMessage = 'Failed to login';
      
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(err as Error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/register', userData);
      
      if (response.status === 201) {
        setUser(response.data);
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (err) {
      let errorMessage = 'Failed to register';
      
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(err as Error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/logout');
      setUser(null);
    } catch (err) {
      setError(err as Error);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/profile/update', data);
      
      if (response.status === 200) {
        setUser(response.data);
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (err) {
      let errorMessage = 'Failed to update profile';
      
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(err as Error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Create context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
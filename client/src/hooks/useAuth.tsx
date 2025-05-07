/**
 * Authentication Hook
 * 
 * Provides a unified interface for authentication
 * across the application.
 */

import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useToast } from './use-toast';

// Auth user type
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  profileImage?: string | null;
  role?: string;
}

// Login credentials type
interface LoginCredentials {
  email: string;
  password: string;
}

// Register data type
interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/auth/user');
        
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          // Not authenticated, clear user
          setUser(null);
        }
      } catch (err) {
        // Only set error if it's not a 401 (not authenticated)
        if (axios.isAxiosError(err) && err.response?.status !== 401) {
          setError(err as Error);
          toast({
            title: 'Error',
            description: 'Failed to fetch user data',
            variant: 'destructive',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [toast]);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', credentials);
      
      if (response.data.success) {
        setUser(response.data.user);
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Login failed',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      let errorMessage = 'Login failed';
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(err as Error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', data);
      
      if (response.data.success) {
        setUser(response.data.user);
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Registration failed',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      let errorMessage = 'Registration failed';
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(err as Error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/logout');
      
      if (response.data.success) {
        setUser(null);
        toast({
          title: 'Success',
          description: 'Logged out successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Logout failed',
          variant: 'destructive',
        });
      }
    } catch (err) {
      // Even if logout fails, clear the user from context
      setUser(null);
      
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        setError(err as Error);
        toast({
          title: 'Error',
          description: 'Error during logout',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<AuthUser>): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.put('/api/auth/profile', data);
      
      if (response.data.success) {
        setUser(response.data.user);
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to update profile',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      let errorMessage = 'Failed to update profile';
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(err as Error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to change password',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      let errorMessage = 'Failed to change password';
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(err as Error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Password reset email sent',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to send password reset email',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      let errorMessage = 'Failed to send password reset email';
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(err as Error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword,
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Password reset successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to reset password',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      let errorMessage = 'Failed to reset password';
      
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(err as Error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
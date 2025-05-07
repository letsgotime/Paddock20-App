import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Define user type
export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

// Auth context type
interface NativeAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

// Create context
const NativeAuthContext = createContext<NativeAuthContextType | null>(null);

// Provider component
export function NativeAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/register', { 
        email, 
        password,
        username
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/logout');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(null);
        return { success: true };
      } else {
        setError(data.message || 'Logout failed');
        return { success: false, error: data.message || 'Logout failed' };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during logout';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <NativeAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </NativeAuthContext.Provider>
  );
}

// Hook to use the auth context
export function useNativeAuth() {
  const context = useContext(NativeAuthContext);
  
  if (!context) {
    throw new Error('useNativeAuth must be used within a NativeAuthProvider');
  }
  
  return context;
}
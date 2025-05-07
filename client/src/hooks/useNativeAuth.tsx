import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { 
  saveUserProfileToLocalStorage, 
  clearUserProfileFromLocalStorage,
  getNextAuthFlowPath
} from '@/utils/authFlowUtils';

// Define user type
export type User = {
  id: string | number;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: Date | string;
  role?: string;
  [key: string]: any; // For additional properties
};

// Auth state interface
interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

// Create context with default values
export const NativeAuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  login: async () => ({ success: false, error: 'Context not initialized' }),
  register: async () => ({ success: false, error: 'Context not initialized' }),
  logout: async () => ({ success: false, error: 'Context not initialized' }),
});

// Auth provider component
export const NativeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/me');

        if (response.ok) {
          const responseData = await response.json();
          
          // Check if the response has user data in the expected format
          if (responseData.success && responseData.user) {
            setUser(responseData.user);
            setIsAuthenticated(true);
            
            // Store user profile in localStorage when authentication check succeeds
            saveUserProfileToLocalStorage(responseData.user);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            clearUserProfileFromLocalStorage();
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          
          // Clear user profile from localStorage when auth check fails
          clearUserProfileFromLocalStorage();
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear user profile from localStorage on error
        clearUserProfileFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Check if the response has user data in the expected format
        if (responseData.success && responseData.user) {
          setUser(responseData.user);
          setIsAuthenticated(true);
          
          // Store user profile in localStorage for other components to access
          saveUserProfileToLocalStorage(responseData.user);
          
          return { success: true };
        } else {
          // If response was OK but data format is unexpected
          setError('Invalid response format from server');
          return { success: false, error: 'Invalid response format from server' };
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return { success: false, error: errorData.message || 'Login failed' };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during login';
      console.error('Login error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (
    email: string, 
    password: string, 
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        email,
        password,
        username,
        // Additional fields can be added here
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Check if the response has user data in the expected format
        if (responseData.success && responseData.user) {
          setUser(responseData.user);
          setIsAuthenticated(true);
          
          // Store user profile in localStorage for beta agreement and onboarding components
          saveUserProfileToLocalStorage(responseData.user);
          
          return { success: true };
        } else {
          // If response was OK but data format is unexpected
          setError('Invalid response format from server');
          return { success: false, error: 'Invalid response format from server' };
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
        return { success: false, error: errorData.message || 'Registration failed' };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during registration';
      console.error('Registration error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/logout');
      
      if (response.ok) {
        const responseData = await response.json();
        
        // Even if the response data format is not as expected, we'll handle logout on the client side
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear user profile from localStorage on logout
        clearUserProfileFromLocalStorage();
        
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Logout failed');
        return { success: false, error: errorData.message || 'Logout failed' };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during logout';
      console.error('Logout error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Provide auth context to children
  return (
    <NativeAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </NativeAuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useNativeAuth = (): AuthState => {
  const context = useContext(NativeAuthContext);
  
  if (context === undefined) {
    throw new Error('useNativeAuth must be used within a NativeAuthProvider');
  }
  
  return context;
};
import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

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

// Auth context type
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create auth context and export it
export const NativeAuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const NativeAuthProvider = ({ children }: AuthProviderProps) => {
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
        
        if (response.data) {
          setUser(response.data);
        } else {
          // Not authenticated, clear user
          setUser(null);
        }
      } catch (err) {
        // Only set error if it's not a 401 (not authenticated)
        if (axios.isAxiosError(err) && err.response?.status !== 401) {
          setError(err as Error);
          console.error("Error fetching user data:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data) {
        setUser(response.data);
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Login failed',
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
  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', { email, password, username });
      
      if (response.data) {
        setUser(response.data);
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Registration failed',
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
      
      // Always clear the user on logout attempt, regardless of response
      setUser(null);
      
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
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

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <NativeAuthContext.Provider value={value}>
      {children}
    </NativeAuthContext.Provider>
  );
};
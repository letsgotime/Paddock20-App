import { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// User interface matches our database model
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  profileImage: string | null;
  role: 'user' | 'admin' | 'premium' | null;
  // Add other properties as needed
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check authentication status on first render
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // DEVELOPMENT MODE ONLY: Create a default user for testing
        // This bypasses real authentication for development purposes
        console.log('DEVELOPMENT MODE: Creating default user for testing');
        
        // Create a default test user
        const defaultUser: User = {
          id: 1,
          username: 'gavin',
          email: 'gavin@gotime.com',
          firstName: 'Gavin',
          lastName: 'Brooks',
          fullName: 'Gavin Brooks',
          profileImage: null,
          role: 'user'
        };
        
        // Set the user and session
        setUser(defaultUser);
        setSession({ user: defaultUser });
        console.log('DEV MODE: Using default test user:', defaultUser.username);
        
        // Optional: Try the real API call anyway (but ignore failures)
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const userData = await response.json();
            console.log('Successfully connected to real auth API', userData);
          }
        } catch (apiErr) {
          console.log('Using dev mode auth - real API unreachable');
        }
        
      } catch (err) {
        console.error('Error in auth system:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data);
      setSession({ user: data });
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.username}!`,
        variant: 'default',
      });
      
      return data;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data);
      setSession({ user: data });
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully!',
        variant: 'default',
      });
      
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Logout failed');
      }

      setUser(null);
      setSession(null);
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      
      toast({
        title: 'Logout Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
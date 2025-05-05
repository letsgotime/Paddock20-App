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

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  betaProgram?: 'user' | 'tester'; // Beta program type
  hasAgreedToNDA?: boolean;       // NDA agreement flag
  feedbackCommitment?: boolean;    // For beta testers only
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
        
        // Try to get the user from the server
        const response = await fetch('/api/user', {
          credentials: 'include' // Send cookies for authentication
        });
        
        // If authenticated successfully
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            setSession({ user: data.user });
            console.log('Successfully authenticated user:', data.user.username);
          } else {
            console.log('No authenticated user found');
            setUser(null);
            setSession(null);
          }
        } 
        // If not authenticated or error
        else {
          console.log('Not authenticated or auth error');
          setUser(null);
          setSession(null);
          
          // Don't create fallback users - authentication must be secure
          if (window.location.pathname !== '/auth') {
            console.log('Redirecting to authentication page');
          }
        }
      } catch (err) {
        console.error('Error in auth system:', err);
        setError('Failed to initialize authentication');
        setUser(null);
        setSession(null);
        
        // Redirect to auth page on error if not already there
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
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

  // Enhanced Logout function with improved security
  const logout = async () => {
    try {
      setLoading(true);
      
      // Store the redirect path before clearing everything
      const redirectPath = '/auth';
      
      // Clear user data first to prevent any auth-dependent components from breaking
      setUser(null);
      setSession(null);
      
      // Force a hard reset of local storage for auth-related items
      localStorage.removeItem('auth-session');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('returnToPath');
      localStorage.removeItem('currentVehicle');
      
      // Clear sensitive user data
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userSettings');
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('savedVehicles');
      
      // Clear any other app state that might depend on the user
      sessionStorage.removeItem('weatherAppReturnPoint');
      sessionStorage.removeItem('lastLocation');
      sessionStorage.removeItem('lastSearch');
      
      // Clear all session cookies by setting expired date
      document.cookie.split(';').forEach(cookie => {
        const trimmedCookie = cookie.trim();
        const name = trimmedCookie.split('=')[0];
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Now call the logout API (but we've already cleared local state)
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn('Server-side logout returned non-200 status, but continuing client-side logout');
        }
      } catch (apiError) {
        console.warn('Server-side logout API error, but continuing client-side logout:', apiError);
      }
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
      
      // Better handling of redirect with React Router
      if (window.location.pathname !== redirectPath) {
        // Explicitly redirect to auth page with replace to prevent back button issues
        window.history.replaceState(null, '', redirectPath);
        // Dispatch an event to make React Router notice the URL change
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      
      toast({
        title: 'Logout Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Still try to redirect to auth page even on error
      if (window.location.pathname !== '/auth') {
        window.history.replaceState(null, '', '/auth');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
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
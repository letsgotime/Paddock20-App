// Temporary auth hook that uses localStorage until we integrate the full database auth
// This will be replaced with a proper context-based implementation

import { useState, useEffect } from 'react';

// Interface to represent the session object
interface User {
  id: string;
  username?: string;
  email?: string;
  profileImage?: string | null;
  role?: 'user' | 'admin' | 'premium' | null;
  // Add other properties that the app expects
}

interface Session {
  user: User;
}

const LOCAL_STORAGE_KEY = 'paddock20_session';

/**
 * Temporary auth hook that works with localStorage
 * This will be replaced with a proper database-backed auth system
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the session from localStorage on first render
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as Session;
        setSession(parsedSession);
        setUser(parsedSession.user);
      }
    } catch (err) {
      console.error('Error loading session from localStorage:', err);
      setError('Failed to load authentication data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock login function (will be replaced with actual API call)
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock successful login
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        username,
        email: `${username}@example.com`,
        role: 'user'
      };
      
      const newSession = { user: mockUser };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession));
      
      setSession(newSession);
      setUser(mockUser);
      
      return mockUser;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mock register function (will be replaced with actual API call)
  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock successful registration
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        username: userData.username,
        email: userData.email,
        role: 'user'
      };
      
      const newSession = { user: mockUser };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession));
      
      setSession(newSession);
      setUser(mockUser);
      
      return mockUser;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mock logout function
  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user,
    loading,
    error,
    login,
    register,
    logout
  };
}
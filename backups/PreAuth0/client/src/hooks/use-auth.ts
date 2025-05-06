/**
 * Use-Auth Hook
 * 
 * This hook provides access to the authenticated user and authentication state
 * It returns the current user, loading state, and authentication methods
 */

import { useState, useEffect } from 'react';

// Define User type
export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profileImage?: string | null;
  role?: string;
}

// Define authentication context state
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Custom hook to access authentication state
 * This provides user data from the server-side session
 */
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    // Load authentication state on mount
    const loadAuthState = async () => {
      try {
        const response = await fetch('/api/user');
        
        if (response.ok) {
          const userData = await response.json();
          
          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
          
          console.log('Successfully authenticated user:', userData.username);
        } else {
          // Not authenticated
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Failed to check authentication status',
        });
      }
    };

    loadAuthState();
  }, []);

  return authState;
}

export default useAuth;
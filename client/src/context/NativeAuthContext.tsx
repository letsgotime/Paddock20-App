import React, { createContext, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '../components/ui/use-toast';

// Define a simplified User type that matches what we expect from the API
type User = {
  id: number;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
};

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};

export const NativeAuthContext = createContext<AuthContextType>(defaultContext);

export const NativeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get the current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setError(null);
      toast({
        title: 'Success',
        description: 'You have successfully logged in.',
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; username: string }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setError(null);
      toast({
        title: 'Success',
        description: 'Your account has been created.',
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setError(null);
      toast({
        title: 'Success',
        description: 'You have been logged out.',
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Login function
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  // Register function
  const register = async (email: string, password: string, username: string) => {
    await registerMutation.mutateAsync({ email, password, username });
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Make sure user matches our User type
  const typedUser = user ? (user as User) : null;

  return (
    <NativeAuthContext.Provider
      value={{
        user: typedUser,
        loading: isLoading,
        isAuthenticated: !!typedUser,
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
import React, { createContext, ReactNode, useState, useContext } from 'react';

// Define the shape of our auth context
interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

// Create the context with a default state
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component to wrap our app
export function MockAuthProvider({ children }: { children: ReactNode }) {
  // Create a demo user that will be used throughout the application
  const demoUser = {
    id: 'demo-user-123',
    username: 'demouser',
    role: 'user',
    email: 'demo@paddock20.com',
    isDemo: true
  };

  // Set up the state for our demo auth
  const [state] = useState<AuthContextType>({
    user: demoUser,
    loading: false,
    isAuthenticated: true,
    error: null
  });

  // Provide the auth context to the app
  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider. Make sure AuthProvider is in your component tree.');
  }
  return context;
}
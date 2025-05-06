import React, { ReactNode } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Updated component to accept children instead of path and component props
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  // While checking authentication status, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-carolina-blue" />
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
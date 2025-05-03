import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg text-gray-300">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (error) {
    console.error('Authentication error:', error);
    // Force redirect to auth page on error
    window.location.href = `/auth?redirect=${encodeURIComponent(location.pathname)}&error=${encodeURIComponent('Authentication failed')}`;
    return null;
  }

  // Redirect to auth page if not authenticated with proper message
  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}&message=${encodeURIComponent('Please log in to access this page')}`} replace />;
  }

  // Additional security check - ensure user has required fields
  if (!user.id || !user.username) {
    console.error('Invalid user detected:', user);
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}&error=${encodeURIComponent('Invalid user session')}`} replace />;
  }

  // Render children if authenticated and user is valid
  return <>{children}</>;
}
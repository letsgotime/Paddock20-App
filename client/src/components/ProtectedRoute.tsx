import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Controls whether to bypass real authentication and use the mock user
// Set to true for development environments, false for production
// Changed to false to ensure proper authentication flow
const DEV_MODE = false;

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  // Use the useAuth hook which provides a unified interface to authentication
  const auth = useAuth();
  
  console.log('ProtectedRoute checking auth status:', { 
    loading: auth.loading, 
    user: auth.user ? 'authenticated' : 'not authenticated',
    path: location.pathname
  });
  
  // Show loading state while checking authentication
  if (auth.loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg text-gray-300">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated (either through real auth or DEV_MODE), show the protected content
  if (DEV_MODE || auth.user) {
    return <>{children}</>;
  }

  // If not authenticated and not in DEV_MODE, redirect to the login page
  // Also add a timestamp parameter to break any potential client-side caching
  return <Navigate to={`/auth?t=${Date.now()}`} state={{ from: location }} replace />;
}
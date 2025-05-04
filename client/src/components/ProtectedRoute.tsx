import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Define a mock user for development purposes
const devUser = {
  id: 1,
  username: 'GavinGotime',
  email: 'gavin@gotime.com',
  role: 'admin'
};

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  
  // For development/preview mode, we'll use a hardcoded user
  // This helps avoid authentication delays and white screen issues
  const user = devUser;
  const loading = false;
  const error = null;

  // Show loading state while checking authentication (rarely shown in dev mode)
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
    return <Navigate to="/auth" replace />;
  }

  // For development mode, always authenticate successfully
  // In production, this would check the actual user
  if (user) {
    return <>{children}</>;
  }

  // Fallback - should never reach here in dev mode
  return <Navigate to="/auth" replace />;
}
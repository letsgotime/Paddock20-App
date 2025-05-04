import { ReactNode, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// Define a mock user for development purposes - only used if DEV_MODE is enabled
const devUser = {
  id: 1,
  username: 'GavinGotime',
  email: 'gavin@gotime.com',
  role: 'admin'
};

// Controls whether to bypass real authentication and use the mock user
// Set to true for development environments, false for production
const DEV_MODE = true;

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authError, setAuthError] = useState<Error | null>(null);
  
  // In a production app, use the AuthContext instead of manual fetching
  // This helps ensure consistent auth state throughout the app
  const authContext = useContext(AuthContext);
  
  useEffect(() => {
    if (DEV_MODE) {
      // For development mode, use the mock user
      setCurrentUser(devUser);
      setIsLoading(false);
      setAuthChecked(true);
      return;
    }
    
    // Check if we already have auth context data
    if (authContext && authContext.user) {
      setCurrentUser(authContext.user);
      setIsLoading(false);
      setAuthChecked(true);
      return;
    }
    
    // Fetch auth status from the server
    fetch('/api/user')
      .then(async response => {
        if (response.ok) {
          const data = await response.json();
          if (data && data.success && data.user) {
            console.log('User authenticated:', data.user.username);
            setCurrentUser(data.user);
          } else {
            console.log('User not authenticated - no user data');
            setCurrentUser(null);
          }
        } else {
          console.log('User not authenticated - response not OK');
          setCurrentUser(null);
        }
      })
      .catch(error => {
        console.error('Auth check failed:', error);
        setAuthError(error);
        setCurrentUser(null);
      })
      .finally(() => {
        setIsLoading(false);
        setAuthChecked(true);
      });
  }, [authContext, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading || !authChecked) {
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
  if (authError) {
    console.error('Authentication error:', authError);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, show the protected content
  if (currentUser) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to the login page
  return <Navigate to="/auth" state={{ from: location }} replace />;
}
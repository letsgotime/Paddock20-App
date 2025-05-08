import { Redirect } from 'wouter';
import { useAuth } from '@/auth/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * @deprecated Use the ProtectedRoute from '@/auth/ProtectedRoute' instead.
 * This component is kept for backward compatibility but will be removed in a future update.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.warn('Using deprecated ProtectedRoute from components. Use the one from auth/ instead.');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Redirect to="/auth" />;
};
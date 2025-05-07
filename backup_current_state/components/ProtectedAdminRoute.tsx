import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes requiring admin privileges
 * Uses the PADDOCK20 styling for loading states
 */
export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-90 bg-[url('@/assets/images/carbon-fiber-bg.png')]">
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-[#1982FC] bg-zinc-900 bg-opacity-80">
          <Loader2 className="w-12 h-12 animate-spin text-[#1982FC]" />
          <p className="mt-4 text-white font-orbitron">Accessing Admin Panel...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!user || !isAdmin) {
    return <Redirect to="/auth" />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
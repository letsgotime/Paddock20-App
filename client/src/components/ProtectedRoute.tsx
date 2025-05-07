/**
 * Protected Route Component
 * 
 * Protects routes that require authentication.
 * Redirects to login page if not authenticated.
 */

import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not admin when required
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setLocation('/auth');
      } else if (adminOnly && user?.role !== 'admin') {
        setLocation('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, adminOnly, setLocation]);

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated and role check passes, render children
  if (isAuthenticated && (!adminOnly || user?.role === 'admin')) {
    return <>{children}</>;
  }

  // Return null during redirect
  return null;
}
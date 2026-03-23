import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Check for demo mode flags from Auth0Callback component
const isDemoMode = () => {
  // Auto-enable demo mode on replit.app domains
  if (window.location.hostname.includes('replit.app')) {
    console.log('Replit.app domain detected - auto-enabling demo mode');
    localStorage.setItem('PADDOCK20_DEMO_MODE', 'true');
    localStorage.setItem('paddock20_demo_auth_bypass', 'true');
    return true;
  }
  
  // Otherwise check local storage flags
  return localStorage.getItem('PADDOCK20_DEMO_MODE') === 'true' || 
         localStorage.getItem('paddock20_demo_auth_bypass') === 'true';
};

// DEMO MODE CONFIGURATION
// The demo mode can be triggered either by:
// 1. The explicit demo mode switch in the UI
// 2. A callback error from Auth0 when deployed to a new URL
// 3. Automatically on replit.app domains
const DEMO_MODE = isDemoMode(); 

// List of all paths that should work in demo mode
const DEMO_ALLOWED_PATHS = [
  '/',
  '/the-paddock',
  '/dashboard',
  '/personalized-dashboard',
  '/profile',
  '/garage-vault',
  '/garage',
  '/add-vehicle',
  '/drive-journal',
  '/manifestation-station',
  '/weather-paddock',
  '/weather',
  '/juicebox',
  '/tires-timepieces',
  '/podium-pursuit'
];

interface ProtectedRouteProps {
  children: ReactNode;
  bypassAuth?: boolean; // Optional prop to bypass auth for specific routes
}

export default function ProtectedRoute({ children, bypassAuth = false }: ProtectedRouteProps) {
  const [location] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  
  // Use a ref to track if this component has initialized auth bypass
  const hasBypassedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if current path should be allowed in demo mode
  const isPathAllowedInDemo = DEMO_ALLOWED_PATHS.some(path => 
    location === path || location.startsWith(path + '/')
  );
  
  // Determine if we should bypass auth
  const shouldBypassAuth = bypassAuth || DEMO_MODE || isPathAllowedInDemo;
  
  // Log demo mode status once per component instance
  useEffect(() => {
    if (!hasBypassedRef.current && shouldBypassAuth) {
      console.log('DEMO MODE: Bypassing authentication for:', location);
      
      // Ensure demo user profile is set up
      if (window.location.hostname.includes('replit.app') || DEMO_MODE) {
        // Create demo user profile if it doesn't exist
        if (!localStorage.getItem('userProfile')) {
          const demoUser = {
            id: 9999,
            username: 'demoadmin',
            email: 'demo@paddock20.example',
            firstName: 'Demo',
            lastName: 'User',
            fullName: 'Demo User',
            profileImage: 'https://ui-avatars.com/api/?name=Demo+User&background=1982FC&color=fff',
            role: 'admin',
          };
          
          // Set all required demo flags
          localStorage.setItem('userProfile', JSON.stringify(demoUser));
          localStorage.setItem('paddock20_beta_status', 'enrolled');
          localStorage.setItem('paddock20_beta_onboarding_complete_guest', 'true');
          localStorage.setItem(`paddock20_beta_onboarding_complete_${demoUser.id}`, 'true');
          console.log('Demo user profile created for protected route');
        }
      }
      
      hasBypassedRef.current = true;
    }
    
    // Only attempt redirection if auth is required and user is not authenticated
    if (!shouldBypassAuth && !loading && !isAuthenticated) {
      // Store in ref to properly clean up
      redirectTimeoutRef.current = setTimeout(() => {
        // We're using window.location to enforce a full page reload
        // This helps break infinite render cycles
        window.location.href = `/auth?redirect=${encodeURIComponent(location)}`;
      }, 300);
    }
    
    return () => {
      // Always clean up timeout to prevent memory leaks
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [location, loading, isAuthenticated, shouldBypassAuth]);
  
  // If we're in bypass mode, render immediately
  if (shouldBypassAuth) {
    return <>{children}</>;
  }
  
  // Still loading auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1982FC] mx-auto mb-4" />
          <p className="text-white text-xl font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated - show temporary state before redirect happens
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1982FC] mx-auto mb-4" />
          <p className="text-white text-xl font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  // User is authenticated - render children
  return <>{children}</>;
}
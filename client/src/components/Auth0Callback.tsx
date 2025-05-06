import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Auth0Callback - Handles the redirect callback from Auth0 login/signup
 * This component shows a loading spinner while processing Auth0 authentication
 * and redirects to the appropriate page once authentication is complete.
 * 
 * IMPORTANT: This is a minimalist implementation focusing only on the core redirect functionality.
 */
const Auth0Callback = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, error, user } = useAuth0();
  
  useEffect(() => {
    // Log extensive debugging information
    console.log('🔄 Auth0Callback mounted');
    console.log('URL:', window.location.href);
    console.log('Auth State:', { isLoading, isAuthenticated, error: !!error, user: !!user });
    
    // Extract authorization code for verification
    const params = new URLSearchParams(window.location.search);
    const hasAuthCode = params.has('code');
    console.log('Authorization code present:', hasAuthCode);
    
    // Only take action when the loading state is complete
    if (!isLoading) {
      console.log('Auth0 handshake completed (no longer loading)');
      
      // Successfully authenticated
      if (isAuthenticated) {
        console.log('✅ Authentication successful!');
        console.log('User:', user);
        
        // Check if this is a new user by looking at loginsCount or createdAt
        // New users will have a recent createdAt timestamp or loginsCount of 1
        const isNewUser = user && (
          user?.metadata?.loginsCount === 1 || 
          (user?.created_at && new Date(user.created_at).getTime() > Date.now() - 60000) // created within the last minute
        );
        
        if (isNewUser) {
          console.log('🆕 New user detected - directing to beta enrollment');
          // Redirect to beta enrollment page
          window.location.href = '/beta-enrollment';
        }
        // Handle legacy beta registration flow (if beta status was stored)
        else if (localStorage.getItem('paddock20_beta_status')) {
          console.log('Beta status detected - directing to onboarding');
          
          // Clean up beta registration data
          localStorage.removeItem('paddock20_beta_status');
          localStorage.removeItem('paddock20_has_agreed_to_nda');
          localStorage.removeItem('paddock20_has_agreed_to_terms');
          localStorage.removeItem('paddock20_feedback_commitment');
          
          // Redirect to onboarding flow
          window.location.href = '/onboarding';
        } else {
          // Regular login - redirect to dashboard
          console.log('Regular login - sending to dashboard');
          window.location.href = '/dashboard';
        }
      } 
      // Authentication error
      else if (error) {
        console.error('❌ Authentication error:', error);
        window.location.href = '/auth';
      }
      // Not authenticated but no error (unusual state)
      else {
        console.log('⚠️ Not authenticated but no error');
        if (hasAuthCode) {
          console.log('Authorization code present but auth failed silently - directing to auth page');
          window.location.href = '/auth';
        }
      }
    }
  }, [isLoading, isAuthenticated, error, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#1982FC]" />
          <h1 className="text-2xl font-bold text-white">
            Finalizing authentication...
          </h1>
          <p className="text-gray-400">
            Please wait while we complete your secure sign-in
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth0Callback;
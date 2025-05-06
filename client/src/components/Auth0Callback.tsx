import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Auth0Callback - Handles the redirect callback from Auth0 login/signup
 * This component shows a loading spinner while processing Auth0 authentication
 * and redirects to the appropriate page once authentication is complete.
 */
const Auth0Callback = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, error } = useAuth0();
  
  useEffect(() => {
    console.log('Auth0Callback triggered');
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('error:', error);
    console.log('Current URL:', window.location.href);
    console.log('URL parameters:', window.location.search);
    
    // Extract auth0 code parameter for debugging
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    console.log('Auth0 code present:', !!authCode);
    
    // If Auth0 authentication completed successfully
    if (!isLoading && isAuthenticated && !error) {
      console.log('✅ Auth0 authentication successful, redirecting to dashboard');
      
      // Get stored beta program status if available (for new registrations)
      const betaStatus = localStorage.getItem('paddock20_beta_status');
      console.log('Beta status from localStorage:', betaStatus);
      
      // If this was a new registration (beta status exists), redirect to onboarding
      if (betaStatus) {
        console.log('Redirecting to onboarding page');
        setLocation('/onboarding');
        
        // Clean up the stored beta status
        localStorage.removeItem('paddock20_beta_status');
        localStorage.removeItem('paddock20_has_agreed_to_nda');
        localStorage.removeItem('paddock20_has_agreed_to_terms');
        localStorage.removeItem('paddock20_feedback_commitment');
      } else {
        // Otherwise, redirect to the dashboard
        console.log('Redirecting to dashboard page');
        setTimeout(() => {
          setLocation('/dashboard');
        }, 500); // Small delay to ensure auth state is properly set
      }
    } 
    // If authentication failed, redirect back to auth page
    else if (!isLoading && !isAuthenticated && error) {
      console.error('❌ Auth0 authentication error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setTimeout(() => {
        setLocation('/auth');
      }, 1000); // Delay to ensure error is logged
    }
    // If still loading, show the loading state
    else if (isLoading) {
      console.log('⏳ Auth0 authentication still loading...');
    }
    // If not authenticated but no error (initial state or logout)
    else if (!isAuthenticated && !error) {
      console.log('⏳ Not authenticated yet, waiting for Auth0 response...');
      
      // If we have a code but not authenticated, something might be wrong with token exchange
      if (authCode) {
        console.log('⚠️ Auth code present but not authenticated yet. This is expected during token exchange.');
      }
    }
  }, [isAuthenticated, isLoading, error, setLocation]);

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
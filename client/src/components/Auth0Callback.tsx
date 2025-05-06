import React, { useEffect, useState } from 'react';
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
  const [processingRedirect, setProcessingRedirect] = useState(false);
  
  useEffect(() => {
    // Log extensive debugging information
    console.log('🔄 Auth0Callback mounted');
    console.log('URL:', window.location.href);
    console.log('Auth State:', { isLoading, isAuthenticated, error: !!error, user: !!user });
    
    // Extract authorization code for verification
    const params = new URLSearchParams(window.location.search);
    const hasAuthCode = params.has('code');
    console.log('Authorization code present:', hasAuthCode);
    
    // Only take action when the loading state is complete and not already processing a redirect
    if (!isLoading && !processingRedirect) {
      console.log('Auth0 handshake completed (no longer loading)');
      
      // Mark that we're processing a redirect to prevent double redirects
      setProcessingRedirect(true);
      
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
        
        // Set timeout to ensure state updates have time to process
        setTimeout(() => {
          // For any authentication, check if this is a new user
          if (isNewUser) {
            console.log('🆕 New user detected - directing to Auth0 account creation first');
            // All new users need to go through Auth0 signup first, THEN beta enrollment
            setLocation('/auth');
            return;
          }
          
          // IMPORTANT: Enforce the exact flow: Marketing page → Auth0 → Beta Modal → Onboarding
          
          // Get the user's status from localStorage
          const hasCompletedBetaEnrollment = localStorage.getItem('paddock20_beta_status');
          const hasCompletedOnboarding = localStorage.getItem(`paddock20_beta_onboarding_complete_${user?.sub || 'guest'}`);
          
          console.log('Auth flow status checks:', { 
            isAuthenticated: true, 
            hasCompletedBetaEnrollment, 
            hasCompletedOnboarding 
          });
          
          // Step 1: After Auth0 authentication, always direct to Beta Enrollment first
          if (!hasCompletedBetaEnrollment) {
            console.log('✅ Auth0 complete - directing to beta enrollment modal');
            setLocation('/beta-enrollment');
          }
          // Step 2: If beta enrollment is complete, check if onboarding is complete
          else if (!hasCompletedOnboarding) {
            console.log('✅ Beta enrollment complete - directing to onboarding process');
            setLocation('/onboarding');
          } 
          // Step 3: If both beta enrollment and onboarding are complete, go to dashboard
          else {
            console.log('✅ All steps complete - sending to dashboard');
            setLocation('/dashboard');
          }
        }, 500);
      } 
      // Authentication error
      else if (error) {
        console.error('❌ Authentication error:', error);
        setTimeout(() => setLocation('/auth'), 500);
      }
      // Not authenticated but no error (unusual state)
      else {
        console.log('⚠️ Not authenticated but no error');
        if (hasAuthCode) {
          console.log('Authorization code present but auth failed silently - directing to auth page');
          setTimeout(() => setLocation('/auth'), 500);
        }
      }
    }
  }, [isLoading, isAuthenticated, error, user, processingRedirect, setLocation]);

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
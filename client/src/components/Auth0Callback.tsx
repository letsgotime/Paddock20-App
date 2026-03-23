import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { Loader2, AlertTriangle } from 'lucide-react';

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
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDemoOption, setShowDemoOption] = useState(false);
  
  // Check for error in URL params (which happens when the Auth0 domain rejects the callback URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      const errorDesc = params.get('error_description') || params.get('error');
      setAuthError(errorDesc);
      
      // On production deployment, automatically go to demo mode after a short delay
      if (window.location.hostname.includes('replit.app')) {
        console.log('Deployed app detected with Auth0 error - automatically redirecting to demo mode');
        setTimeout(() => {
          enableDemoMode();
        }, 1000);
      } else {
        // On dev environment, show the demo option button after a delay
        setTimeout(() => {
          setShowDemoOption(true);
        }, 2000);
      }
    }
  }, []);
  
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
            setLocation('/the-paddock');
          }
        }, 500);
      } 
      // Authentication error
      else if (error) {
        console.error('❌ Authentication error:', error);
        setAuthError(error.message || 'Authentication failed');
        
        // On production deployment, automatically go to demo mode after a short delay
        if (window.location.hostname.includes('replit.app')) {
          console.log('Deployed app detected with Auth0 error - automatically redirecting to demo mode');
          setTimeout(() => {
            enableDemoMode();
          }, 1000);
        } else {
          // On dev environment, show the demo option button after a delay
          setTimeout(() => {
            setShowDemoOption(true);
          }, 2000);
        }
      }
      // Not authenticated but no error (unusual state)
      else {
        console.log('⚠️ Not authenticated but no error');
        if (hasAuthCode) {
          console.log('Authorization code present but auth failed silently - directing to auth page');
          setAuthError('Authentication failed silently. This may be due to a callback URL mismatch.');
          
          // On production deployment, automatically go to demo mode after a short delay
          if (window.location.hostname.includes('replit.app')) {
            console.log('Deployed app detected with Auth0 error - automatically redirecting to demo mode');
            setTimeout(() => {
              enableDemoMode();
            }, 1000);
          } else {
            // On dev environment, show the demo option button after a delay
            setTimeout(() => {
              setShowDemoOption(true);
            }, 2000);
          }
        }
      }
    }
  }, [isLoading, isAuthenticated, error, user, processingRedirect, setLocation]);

  // Enable demo mode for testing on deployed app
  const enableDemoMode = () => {
    // Set all required demo mode flags for complete bypass
    localStorage.setItem('PADDOCK20_DEMO_MODE', 'true');
    localStorage.setItem('paddock20_demo_auth_bypass', 'true');
    localStorage.setItem('paddock20_beta_status', 'enrolled');
    localStorage.setItem('paddock20_beta_onboarding_complete_guest', 'true');
    
    // Set demo user data
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
    
    localStorage.setItem('userProfile', JSON.stringify(demoUser));
    
    console.log('Demo mode fully enabled - redirecting to dashboard');
    
    // Force redirect to the paddock
    window.location.href = '/the-paddock';
  };

  // If there's an auth error, show error and demo option
  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <div className="max-w-md rounded-lg border border-red-900 bg-black/80 p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-white">Authentication Error</h1>
          <p className="mt-2 text-gray-300">{authError}</p>
          
          <div className="mt-8">
            <p className="mb-4 text-gray-400">
              This error occurs when using a new URL that isn't configured in Auth0's allowed callback URLs.
            </p>
            
            {/* Always show the demo mode button, but vary the design based on timing */}
            <button
              onClick={enableDemoMode}
              className={`w-full rounded px-6 py-3 text-lg font-bold text-white ${
                showDemoOption 
                  ? 'animate-pulse bg-[#08c519] hover:bg-[#08c519]/80' 
                  : 'bg-[#1982FC] hover:bg-[#1982FC]/80'
              }`}
            >
              {window.location.hostname.includes('replit.app')
                ? 'START DEMO MODE NOW'
                : 'Continue in Demo Mode'}
            </button>
            
            <p className={`mt-3 text-sm ${showDemoOption ? 'text-green-500' : 'text-gray-500'}`}>
              {showDemoOption 
                ? 'RECOMMENDED: Demo mode allows you to use the application without Auth0.'
                : 'Demo mode bypasses authentication for testing purposes.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
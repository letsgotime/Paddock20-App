import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Login Redirect page 
 * This handles redirecting users to the auth page with the proper parameters
 */
const LoginRedirect: React.FC = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get any URL parameters that might be needed for the redirect
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirectTo') || '/';
    const action = urlParams.get('action') || 'login';
    
    // Store the redirect path for after login
    if (redirectTo) {
      try {
        localStorage.setItem('authRedirectTo', redirectTo);
      } catch (e) {
        console.error('Failed to save redirect path:', e);
      }
    }
    
    // Redirect to the auth page with appropriate action
    setTimeout(() => {
      setLocation(`/auth?action=${action}`);
    }, 1000);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        {/* F1-inspired racing stripe */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#1982FC]" />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-orbitron tracking-wide mb-2">
            REDIRECTING
          </h1>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-[#1982FC]" />
            </div>
            <p className="text-gray-300">
              Taking you to the login page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
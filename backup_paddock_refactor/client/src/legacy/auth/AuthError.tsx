import React from 'react';
import { useLocation } from 'wouter';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Authentication Error page
 * Displays friendly error messages for various auth failure scenarios
 */
const AuthError: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Parse error from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const errorCode = urlParams.get('code') || 'unknown';
  const errorMessage = urlParams.get('message') || 'An unknown authentication error occurred';
  
  // Generate helpful messages based on error codes
  const getHelpfulMessage = (code: string): string => {
    switch (code) {
      case 'expired_session':
        return 'Your session has expired. Please sign in again to continue.';
      case 'invalid_token':
        return 'Your authentication token is invalid or expired.';
      case 'server_error':
        return 'There was a problem with the authentication server. Please try again later.';
      case 'rate_limited':
        return 'Too many login attempts. Please wait a moment before trying again.';
      case 'unauthorized':
        return 'You are not authorized to access this resource.';
      case 'missing_permissions':
        return 'Your account does not have the required permissions for this action.';
      default:
        return 'There was a problem with the authentication process. Please try again.';
    }
  };
  
  const helpfulMessage = getHelpfulMessage(errorCode);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        {/* F1-inspired racing stripe */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#1982FC]" />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-orbitron tracking-wide mb-2">
            AUTHENTICATION ERROR
          </h1>
          
          <div className="flex justify-center my-6">
            <ShieldAlert className="h-20 w-20 text-red-500" />
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-900/30 border border-red-900 rounded-md text-left">
              <p className="text-red-300 font-medium mb-2">Error Details</p>
              <p className="text-gray-300 text-sm mb-2">{errorMessage}</p>
              <p className="text-gray-400 text-sm">{helpfulMessage}</p>
            </div>
            
            <div className="flex flex-col space-y-3 pt-2">
              <Button
                onClick={() => setLocation('/auth')}
                className="w-full bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
              >
                Return to Login
              </Button>
              
              <Button
                onClick={() => setLocation('/')}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Go to Home Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
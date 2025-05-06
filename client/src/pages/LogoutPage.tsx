import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { LogOut, CheckCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * LogoutPage - Handles the user logout process with a clean UI
 * Used for both Auth0 logout redirect and manual logout action
 */
const LogoutPage: React.FC = () => {
  const { logout, isAuthenticated, isLoading } = useAuth0();
  const [, setLocation] = useLocation();
  const [logoutStatus, setLogoutStatus] = useState<'pending' | 'processing' | 'complete'>('pending');
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  
  // When the component mounts, check auth status
  useEffect(() => {
    if (isLoading) return;
    
    // If already logged out, show complete status
    if (!isAuthenticated) {
      setLogoutStatus('complete');
      return;
    }
    
    // If still authenticated, perform logout
    setLogoutStatus('processing');
    
    // Clear all local storage items related to authentication and user data
    localStorage.removeItem('auth-session');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('currentVehicle');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('weatherAppReturnPoint');
    localStorage.removeItem('loginShown');
    
    // Clear any beta or onboarding related data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('paddock20_beta') || 
        key.includes('paddock20_onboarding') ||
        key.includes('paddock20_legal')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Log out from Auth0 with redirect back to the logout page to show completion
    setTimeout(() => {
      logout({
        logoutParams: {
          returnTo: window.location.origin + '/logout',
        }
      });
    }, 500);
  }, [isLoading, isAuthenticated, logout]);
  
  // Countdown timer for auto-redirect after logout completion
  useEffect(() => {
    if (logoutStatus !== 'complete') return;
    
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [logoutStatus, setLocation]);
  
  // Handle manual navigation to home page
  const navigateToHome = () => {
    setLocation('/');
  };
  
  // Render based on logout status
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 p-8 shadow-xl">
        <div className="text-center">
          {logoutStatus === 'pending' && (
            <>
              <LogOut className="h-16 w-16 text-[#1982FC] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Logging Out
              </h1>
              <p className="text-gray-400 mb-6">
                Preparing to log you out securely...
              </p>
            </>
          )}
          
          {logoutStatus === 'processing' && (
            <>
              <RefreshCw className="h-16 w-16 text-[#1982FC] mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Logging Out
              </h1>
              <p className="text-gray-400 mb-6">
                Securely ending your session and clearing data...
              </p>
            </>
          )}
          
          {logoutStatus === 'complete' && (
            <>
              <CheckCircle className="h-16 w-16 text-[#08c519] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Successfully Logged Out
              </h1>
              <p className="text-gray-400 mb-6">
                You have been securely logged out of Paddock20
              </p>
              <div className="text-center mb-8">
                <p className="text-gray-300">
                  Redirecting to home page in {countdownSeconds} seconds...
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={navigateToHome}
                  className="bg-[#1982FC] hover:bg-[#1982FC]/80"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/auth')}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sign In Again
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
      
      <div className="mt-8 text-center">
        <div className="text-lg font-bold text-[#1982FC] mb-2">
          PADDOCK<span className="text-[#08c519]">20</span>
        </div>
        <div className="text-sm text-gray-500">
          Thank you for visiting Paddock20. Drive safe and drive inspired.
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
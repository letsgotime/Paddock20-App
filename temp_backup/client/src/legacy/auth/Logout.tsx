import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import supabase from '@/services/supabaseClient';

/**
 * Logout page that handles the formal logout process
 * Acts as a proper URL endpoint for auth flows
 */
const Logout: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutComplete, setLogoutComplete] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear any local storage items
        localStorage.removeItem('authRedirectTo');
        localStorage.removeItem('currentVehicle');
        localStorage.removeItem('loginShown');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userSettings');
        localStorage.removeItem('userPreferences');
        localStorage.removeItem('savedVehicles');
        sessionStorage.removeItem('weatherAppReturnPoint');
        sessionStorage.removeItem('lastLocation');
        sessionStorage.removeItem('lastSearch');
        
        // Perform actual logout from Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Error during logout:', error);
          setError('Failed to log out. Please try again.');
        } else {
          setLogoutComplete(true);
          
          // Wait a bit before redirecting to home
          setTimeout(() => {
            setLocation('/');
          }, 2000);
        }
      } catch (err) {
        console.error('Unexpected error during logout:', err);
        setError('An unexpected error occurred during logout.');
      } finally {
        setIsLoggingOut(false);
      }
    };
    
    performLogout();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        {/* F1-inspired racing stripe */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#1982FC]" />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-orbitron tracking-wide mb-2">
            LOGGING OUT
          </h1>
          
          {error ? (
            <div className="mt-6 text-center">
              <div className="text-red-500 mb-3">Logout Error</div>
              <p className="text-gray-300 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[#1982FC] text-white rounded"
              >
                Try Again
              </button>
              <button 
                onClick={() => setLocation('/')} 
                className="mt-4 ml-2 px-4 py-2 bg-gray-700 text-white rounded"
              >
                Return Home
              </button>
            </div>
          ) : logoutComplete ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-[#08c519]" />
              </div>
              <p className="text-gray-300">
                You have been successfully logged out.
              </p>
              <p className="text-gray-400 text-sm">
                Redirecting you to the home page...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-[#1982FC] mr-2" />
                <LogOut className="h-8 w-8 text-[#1982FC]" />
              </div>
              <p className="text-gray-300">
                Securely logging you out...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logout;
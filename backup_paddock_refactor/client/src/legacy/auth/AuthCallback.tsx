import React, { useEffect, useState } from 'react';
import supabase from '@/services/supabaseClient';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

/**
 * Authentication callback handler for Supabase
 * This component handles redirect callbacks from Supabase authentication flows
 * (email confirmation, password reset, OAuth providers, etc.)
 */
const AuthCallback: React.FC = () => {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get URL hash parameters 
      const hash = window.location.hash;
      
      try {
        // Process the URL hash that contains Supabase tokens
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }
        
        if (data?.session) {
          console.log('Auth callback successful');
          // Redirect to the dashboard or home page after successful authentication
          setTimeout(() => {
            setLocation('/');
          }, 2000);
        } else {
          console.error('No session found in callback');
          setError('Authentication failed. Please try logging in again.');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError('Unexpected error during authentication');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        {/* F1-inspired racing stripe */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#1982FC]" />
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-orbitron tracking-wide mb-2">
            AUTHENTICATION
          </h1>
          
          {error ? (
            <div className="mt-6 text-center">
              <div className="text-red-500 mb-3">Authentication Error</div>
              <p className="text-gray-300 text-sm">{error}</p>
              <button 
                onClick={() => setLocation('/auth')} 
                className="mt-4 px-4 py-2 bg-[#1982FC] text-white rounded"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-[#1982FC]" />
              </div>
              <p className="text-gray-300">
                Completing your authentication process...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
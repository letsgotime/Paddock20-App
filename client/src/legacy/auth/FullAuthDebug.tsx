import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

const FullAuthDebug = () => {
  const { 
    isLoading, 
    isAuthenticated, 
    error, 
    user, 
    loginWithRedirect 
  } = useAuth0();
  
  const [, setLocation] = useLocation();
  const [authState, setAuthState] = useState<any>({});
  
  // Get and parse URL parameters
  useEffect(() => {
    // Full URL details
    const urlDetails = {
      fullUrl: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
    
    console.log('URL details:', urlDetails);
    
    // Parse query params from search string
    const searchParams = new URLSearchParams(window.location.search);
    const searchParamsObject: Record<string, string> = {};
    
    for (const [key, value] of searchParams.entries()) {
      searchParamsObject[key] = value;
    }
    
    // Parse hash params
    let hashParams: Record<string, string> = {};
    
    if (window.location.hash) {
      const hashParts = window.location.hash.split('?');
      if (hashParts.length > 1) {
        const hashSearchParams = new URLSearchParams(hashParts[1]);
        for (const [key, value] of hashSearchParams.entries()) {
          hashParams[key] = value;
        }
      }
    }
    
    const parsedUrl = {
      ...urlDetails,
      searchParams: searchParamsObject,
      hashParams
    };
    
    setAuthState(prev => ({ ...prev, parsedUrl }));
    
  }, []);
  
  // Log Auth0 state changes
  useEffect(() => {
    console.log('Auth0 state:', { isLoading, isAuthenticated, hasError: !!error });
    setAuthState(prev => ({ 
      ...prev, 
      auth0: { 
        isLoading, 
        isAuthenticated, 
        hasError: !!error,
        error: error ? JSON.stringify(error, null, 2) : null,
        user: user ? JSON.stringify(user, null, 2) : null
      } 
    }));
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('✅ Authenticated successfully!');
      } else if (error) {
        console.error('❌ Authentication error:', error);
      }
    }
  }, [isLoading, isAuthenticated, error, user]);
  
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-[#1982FC] mb-6">Auth0 Full Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">Auth0 State</h2>
              <p className="text-gray-300">
                <span className="font-semibold">Loading:</span> {isLoading ? 'Yes' : 'No'}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Has Error:</span> {error ? 'Yes' : 'No'}
              </p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">URL Parameters</h2>
              <pre className="whitespace-pre-wrap text-sm text-green-300 font-mono overflow-auto max-h-80">
                {JSON.stringify(authState.parsedUrl || {}, null, 2)}
              </pre>
            </div>
            
            {isAuthenticated && user && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-2">User</h2>
                <pre className="whitespace-pre-wrap text-sm text-green-300 font-mono overflow-auto max-h-80">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-red-400 mb-2">Auth0 Error</h2>
                <pre className="whitespace-pre-wrap text-sm text-red-300 font-mono overflow-auto max-h-80">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">Environment</h2>
              <p className="text-gray-300 mb-1">
                <span className="font-semibold">Auth0 Domain:</span> {import.meta.env.VITE_AUTH0_DOMAIN || 'Not found'}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="font-semibold">Client ID:</span> {import.meta.env.VITE_AUTH0_CLIENT_ID ? 'Present' : 'Not found'}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="font-semibold">Standard Redirect URI:</span>
                <br />{window.location.origin}/auth/callback
              </p>
              <p className="text-gray-300 mb-4">
                <span className="font-semibold">Hash Redirect URI:</span>
                <br />{window.location.origin}/#/auth/callback
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => loginWithRedirect()}
                  className="px-4 py-2 bg-[#1982FC] hover:bg-[#1982FC]/80 rounded-md text-white font-medium"
                >
                  Test Login
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
                >
                  Go Home
                </button>
                
                <button
                  onClick={() => setLocation('/debug')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
                >
                  Simple Debug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAuthDebug;
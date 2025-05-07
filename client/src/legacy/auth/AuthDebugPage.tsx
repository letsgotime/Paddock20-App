import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';

/**
 * AuthDebugPage - A simple component to debug Auth0 authentication status
 * This page displays raw Auth0 data to help troubleshoot authentication issues
 */
const AuthDebugPage = () => {
  const [, setLocation] = useLocation();
  const { 
    isLoading, 
    isAuthenticated, 
    error, 
    user, 
    getAccessTokenSilently 
  } = useAuth0();
  
  // Log detailed Auth0 state for debugging
  useEffect(() => {
    console.log("=== AUTH DEBUG PAGE ===");
    console.log("isLoading:", isLoading);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("error:", error);
    console.log("user:", user);
    
    // Try to get access token if authenticated
    if (isAuthenticated && !isLoading) {
      getAccessTokenSilently()
        .then(token => {
          console.log("Access token obtained successfully");
          console.log("Token first 20 chars:", token.substring(0, 20) + "...");
        })
        .catch(err => {
          console.error("Error getting access token:", err);
        });
    }
    
    // Check URL parameters for Auth0 data
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('code') && queryParams.has('state')) {
      console.log("Auth0 code parameter detected in URL");
      console.log("code:", queryParams.get('code')?.substring(0, 10) + "...");
      console.log("state:", queryParams.get('state')?.substring(0, 10) + "...");
    }
    
    // Check for error parameters
    if (queryParams.has('error')) {
      console.error("Auth0 error in URL parameters:", queryParams.get('error'));
      console.error("Error description:", queryParams.get('error_description'));
    }
  }, [isLoading, isAuthenticated, error, user, getAccessTokenSilently]);
  
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-[#1982FC] mb-6">Auth0 Debug Page</h1>
        
        <div className="grid gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Status</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Loading:</div>
              <div className={`font-mono ${isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
                {isLoading ? 'true' : 'false'}
              </div>
              
              <div className="text-gray-400">Authenticated:</div>
              <div className={`font-mono ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                {isAuthenticated ? 'true' : 'false'}
              </div>
              
              <div className="text-gray-400">Has Error:</div>
              <div className={`font-mono ${error ? 'text-red-400' : 'text-green-400'}`}>
                {error ? 'true' : 'false'}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Authentication Error</h2>
              <pre className="whitespace-pre-wrap text-sm text-red-300 font-mono">
                {error.message || JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
          
          {isAuthenticated && user && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">User Information</h2>
              <div className="overflow-x-auto">
                <pre className="text-sm text-green-300 font-mono">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">URL Parameters</h2>
            <div className="overflow-x-auto">
              <pre className="text-sm text-blue-300 font-mono">
                {JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search)), null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-4 py-2 bg-[#1982FC] hover:bg-[#1982FC]/80 rounded-md text-white font-medium"
            >
              Back to Login
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;
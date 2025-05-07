import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const SimpleDebug = () => {
  const { 
    isLoading, 
    isAuthenticated, 
    error, 
    user, 
    loginWithRedirect 
  } = useAuth0();
  
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-[#1982FC] mb-6">Simple Auth0 Debug</h1>
        
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Status</h2>
            <p className="text-gray-300">Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p className="text-gray-300">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p className="text-gray-300">Has Error: {error ? 'Yes' : 'No'}</p>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
              <pre className="whitespace-pre-wrap text-sm text-red-300 font-mono">
                {error.message || JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
          
          {isAuthenticated && user && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">User</h2>
              <pre className="text-sm text-green-300 font-mono">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Environment</h2>
            <p className="text-gray-300">Domain: {import.meta.env.VITE_AUTH0_DOMAIN || 'Not found'}</p>
            <p className="text-gray-300">Client ID: {import.meta.env.VITE_AUTH0_CLIENT_ID ? 'Present' : 'Not found'}</p>
            <p className="text-gray-300">Redirect URI: {window.location.origin}/auth/callback</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => loginWithRedirect()}
              className="px-4 py-2 bg-[#1982FC] hover:bg-[#1982FC]/80 rounded-md text-white font-medium"
            >
              Test Login
            </button>
            
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
            >
              Back to Auth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDebug;
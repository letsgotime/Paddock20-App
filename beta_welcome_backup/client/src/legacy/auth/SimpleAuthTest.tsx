import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';

/**
 * Super simplified Auth0 test page
 * This isolates Auth0 authentication to diagnose issues
 */
const SimpleAuthTest = () => {
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [callbackUrl, setCallbackUrl] = useState<string>('');
  
  // Create the Auth0 redirect URI
  useEffect(() => {
    // Standard callback URL
    const redirectUri = `${window.location.origin}/auth/callback`;
    setCallbackUrl(redirectUri);
    
    // Log environment info
    addLog(`Auth0 Domain: ${import.meta.env.VITE_AUTH0_DOMAIN}`);
    addLog(`Auth0 ClientID: ${import.meta.env.VITE_AUTH0_CLIENT_ID ? 'Present' : 'Missing'}`);
    addLog(`Callback URL: ${redirectUri}`);
    addLog(`Current URL: ${window.location.href}`);
  }, []);
  
  // Helper to add logs with timestamps
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };
  
  // Handle login button click with manual auth0 configuration
  const handleLoginClick = () => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    
    if (!domain || !clientId) {
      setError('Missing Auth0 configuration');
      return;
    }
    
    addLog('Initiating manual Auth0 login...');
    
    // Generate a state parameter for security
    const state = btoa(Math.random().toString(36));
    sessionStorage.setItem('auth_state', state);
    
    // Construct Auth0 authorize URL directly
    const authorizeUrl = `https://${domain}/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=openid%20profile%20email&` +
      `state=${encodeURIComponent(state)}`;
    
    addLog(`Redirect URL: ${authorizeUrl}`);
    
    // Navigate to Auth0 authorization endpoint
    window.location.href = authorizeUrl;
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        addLog('Copied to clipboard');
      })
      .catch(err => {
        addLog(`Copy failed: ${err}`);
      });
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-[#1982FC] mb-4">Auth0 Connection Test</h1>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 p-4 rounded mb-6">
            <h2 className="text-xl font-semibold text-red-400">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded">
              <h2 className="text-xl font-semibold text-white mb-2">Callback URL</h2>
              <div className="relative">
                <pre className="text-green-300 font-mono text-sm p-2 bg-black/50 rounded overflow-x-auto">
                  {callbackUrl}
                </pre>
                <button 
                  onClick={() => copyToClipboard(callbackUrl)}
                  className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-xs rounded"
                >
                  Copy
                </button>
              </div>
              
              <p className="text-gray-400 mt-2 text-sm">
                Add this URL <strong>exactly</strong> to your Auth0 Application's "Allowed Callback URLs" field
              </p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded">
              <h2 className="text-xl font-semibold text-white mb-4">Auth0 Login Test</h2>
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 bg-[#1982FC] hover:bg-[#1982FC]/80 rounded text-white font-medium w-full"
              >
                Test Login
              </button>
              <p className="text-gray-400 mt-2 text-sm">
                This bypasses React components and directly constructs the Auth0 URL
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold text-white mb-2">Logs</h2>
            <div className="bg-black/50 p-2 rounded h-80 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-300 font-mono text-xs border-b border-gray-800 py-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500 italic text-center mt-20">No logs yet</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Go Home
          </button>
          <button
            onClick={() => {
              addLog('Opened Auth0 dashboard tab');
              window.open('https://manage.auth0.com/dashboard/', '_blank');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Open Auth0 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthTest;
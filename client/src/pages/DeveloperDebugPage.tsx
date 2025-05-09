import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import APIDebugger from '../components/APIDebugger';

const DeveloperDebugPage: React.FC = () => {
  const [envVars, setEnvVars] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  
  const checkEnvironmentVariables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/env-check');
      const data = await response.json();
      setEnvVars(data.env_status);
    } catch (error) {
      console.error('Failed to check environment variables:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-green-500 hover:text-green-400 mr-4">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">Developer Debug Console</h1>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/40 rounded-lg p-4">
              <h3 className="text-blue-400 font-bold mb-2">Browser Information</h3>
              <div className="text-sm">
                <p><span className="text-gray-400">User Agent:</span> {navigator.userAgent}</p>
                <p><span className="text-gray-400">Language:</span> {navigator.language}</p>
                <p><span className="text-gray-400">Platform:</span> {navigator.platform}</p>
                <p><span className="text-gray-400">Online:</span> {navigator.onLine ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="bg-black/40 rounded-lg p-4">
              <h3 className="text-blue-400 font-bold mb-2">Geolocation Status</h3>
              <div className="text-sm">
                <p><span className="text-gray-400">Available:</span> {'geolocation' in navigator ? 'Yes' : 'No'}</p>
                <p className="text-orange-400">Note: Geolocation requires secure context (HTTPS) and user permission</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <button 
              onClick={checkEnvironmentVariables}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-md text-white transition-colors"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Environment Variables'}
            </button>
            
            {Object.keys(envVars).length > 0 && (
              <div className="mt-4">
                <h3 className="text-blue-400 font-bold mb-2">Environment Variables</h3>
                <div className="bg-black rounded-lg p-4 text-sm">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(envVars, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <APIDebugger />
        
        <div className="bg-gray-900/50 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Console Log</h2>
          <div className="bg-black/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
            <p className="text-green-400">Developer Debug Page loaded successfully.</p>
            <p className="text-blue-400">Use the API Debugger above to test API connections.</p>
            <p className="text-yellow-400">Check browser console for detailed debugging information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDebugPage;
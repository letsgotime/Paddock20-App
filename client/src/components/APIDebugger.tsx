import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Component to debug API calls
export const APIDebugger: React.FC = () => {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const timestamp = new Date().getTime(); // Add timestamp to bypass cache
      const url = `${endpoint}?_t=${timestamp}`;
      
      console.log(`Testing API endpoint: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Log response status
      console.log(`Response status: ${response.status}`);
      
      // Try to get the response text first to see what we're dealing with
      const text = await response.text();
      console.log(`Response (first 100 chars): ${text.substring(0, 100)}...`);
      
      // Parse as JSON if possible
      try {
        const json = JSON.parse(text);
        setData(json);
      } catch (parseError) {
        setError(`Received non-JSON response: ${text.length > 100 ? text.substring(0, 100) + '...' : text}`);
      }
    } catch (err) {
      console.error('API Test Error:', err);
      setError((err as Error).message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 my-4 border border-gray-800 rounded-lg bg-black/30">
      <h2 className="text-xl font-bold mb-4">API Connection Debugger</h2>
      
      <div className="space-y-2 mb-4">
        <Button 
          onClick={() => testEndpoint('/api/test')}
          disabled={loading}
          variant="outline"
          className="mr-2"
        >
          Test /api/test
        </Button>
        
        <Button 
          onClick={() => testEndpoint('/api/weather-health')}
          disabled={loading}
          variant="outline"
          className="mr-2"
        >
          Test Weather Health
        </Button>
        
        <Button 
          onClick={() => testEndpoint('/api/weather?lat=35.2271&lon=-80.8431')}
          disabled={loading}
          variant="outline"
        >
          Test Weather API
        </Button>
      </div>
      
      {loading && (
        <div className="text-blue-400">Loading...</div>
      )}
      
      {error && (
        <div className="text-red-400 p-2 border border-red-800 rounded bg-red-900/30 my-2">
          <p className="font-bold">Error:</p>
          <pre className="whitespace-pre-wrap text-sm overflow-auto">{error}</pre>
        </div>
      )}
      
      {data && (
        <div className="mt-4">
          <p className="font-bold">Response:</p>
          <pre className="whitespace-pre-wrap bg-gray-900 p-2 rounded text-sm overflow-auto max-h-[200px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default APIDebugger;
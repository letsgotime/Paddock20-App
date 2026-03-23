import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '../components/PageTitle';

const SpotifyEnvCheck: React.FC = () => {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    // Get the environment variable
    const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    setClientId(spotifyClientId || null);
  }, []);

  return (
    <div className="container py-8">
      <PageTitle title="Spotify Environment Check" />
      
      <h1 className="text-3xl font-bold text-carolina-blue mb-8">Spotify Environment Check</h1>
      
      <Card className="max-w-2xl mx-auto bg-card border-border">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Checking the availability of required Spotify environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-md">
              <h3 className="font-semibold mb-2">VITE_SPOTIFY_CLIENT_ID</h3>
              {clientId ? (
                <div className="flex items-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Available - Value is set (first few characters: {clientId.substring(0, 4)}...)</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Not available - This is required for Spotify integration</span>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-900/20 rounded-md">
              <h3 className="font-semibold mb-2">Additional Information</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Spotify CLIENT_ID should be exposed to the client as VITE_SPOTIFY_CLIENT_ID</li>
                <li>Spotify CLIENT_SECRET should only be used on the server</li>
                <li>Check your .env file to make sure variables are properly defined</li>
                <li>Remember that variables must be prefixed with VITE_ to be available to the client</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotifyEnvCheck;
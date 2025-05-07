import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import spotifyAuth from '../services/spotify/spotifyAuth';
import { useSpotify } from '../contexts/SpotifyContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PageTitle from '../components/PageTitle';

/**
 * SpotifyCallbackPage
 * 
 * This page handles the callback from Spotify OAuth flow.
 * It extracts the authorization code from the URL and exchanges it for access tokens.
 */
const SpotifyCallbackPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { refreshPlaylists } = useSpotify();
  const { toast } = useToast();

  useEffect(() => {
    // Process the callback as soon as the component mounts
    processSpotifyCallback();
  }, []);

  const processSpotifyCallback = async () => {
    try {
      // Get the URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for errors
      const error = urlParams.get('error');
      if (error) {
        setStatus('error');
        setErrorMessage(error);
        
        toast({
          title: 'Authorization Failed',
          description: `Spotify authorization error: ${error}`,
          variant: 'destructive',
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        
        return;
      }
      
      // Get the authorization code
      const code = urlParams.get('code');
      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code found');
        
        toast({
          title: 'Missing Authorization Code',
          description: 'No authorization code was received from Spotify',
          variant: 'destructive',
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        
        return;
      }
      
      // Exchange the code for tokens
      const success = await spotifyAuth.exchangeCode(code);
      
      if (!success) {
        setStatus('error');
        setErrorMessage('Failed to exchange authorization code for tokens');
        
        toast({
          title: 'Authentication Failed',
          description: 'Failed to complete Spotify authentication',
          variant: 'destructive',
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        
        return;
      }
      
      // Successfully authenticated with Spotify
      setStatus('success');
      
      // Refresh playlists in the context
      try {
        await refreshPlaylists();
      } catch (err) {
        console.error('Error loading playlists after authentication:', err);
        // Continue anyway since the auth part was successful
      }
      
      toast({
        title: 'Connected to Spotify',
        description: 'Successfully connected your Spotify account',
      });
      
      // Redirect to the dashboard
      setTimeout(() => {
        // Redirect to a specific page that uses Spotify, or to the home page
        setLocation('/');
      }, 1500);
      
    } catch (error) {
      setStatus('error');
      
      // Try to get a meaningful error message
      let message = 'Unknown error during Spotify authentication';
      if (error instanceof Error) {
        message = error.message;
      }
      
      setErrorMessage(message);
      
      toast({
        title: 'Authentication Error',
        description: message,
        variant: 'destructive',
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        setLocation('/');
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <PageTitle title="Spotify Authentication" />
      
      <div className="w-full max-w-lg p-6 space-y-6 bg-card border border-border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-carolina-blue">
          Spotify Authentication
        </h1>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 size={48} className="animate-spin text-carolina-blue" />
            <p className="text-center text-lg text-gray-200">
              Connecting to Spotify...
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-center text-lg text-gray-200">
              Successfully connected to Spotify. Redirecting...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-center text-lg text-gray-200">
              Failed to connect to Spotify
            </p>
            {errorMessage && (
              <p className="text-center text-sm text-gray-400">
                {errorMessage}
              </p>
            )}
            <p className="text-center text-sm text-gray-400">
              Redirecting to homepage...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyCallbackPage;
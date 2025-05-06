import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
// Import class directly
import { SpotifyAuth } from '../services/spotify/spotifyAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * SpotifyCallbackPage
 * 
 * This page handles the OAuth callback from Spotify after a user authorizes our application.
 * It exchanges the authorization code for access and refresh tokens,
 * saves them to storage, and redirects the user back to their original location.
 */
const SpotifyCallbackPage = () => {
  const [, navigate] = useLocation();
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Ensure user is authenticated with Auth0 first
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      });
      return;
    }
    
    // Process Spotify authorization code
    const processAuth = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        // Handle errors returned from Spotify
        if (error) {
          console.error('Spotify authorization error:', error);
          setStatus('error');
          setErrorMessage(`Authorization failed: ${error}`);
          return;
        }
        
        // Ensure we have a code
        if (!code) {
          console.error('No authorization code found in callback URL');
          setStatus('error');
          setErrorMessage('No authorization code received from Spotify');
          return;
        }
        
        // Get our Auth0 token to authenticate with our backend
        const token = await getAccessTokenSilently();
        
        // Get the redirect URI used in the original request 
        // (must match exactly for token exchange)
        const spotifyAuth = new SpotifyAuth();
        const redirectUri = spotifyAuth.getRedirectUri();
        
        // Exchange code for tokens via our backend proxy
        const response = await fetch('/api/spotify/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            code,
            redirect_uri: redirectUri
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Token exchange error:', errorData);
          setStatus('error');
          setErrorMessage(`Failed to exchange authorization code: ${errorData.error || 'Unknown error'}`);
          return;
        }
        
        // Get token data and save to localStorage
        const tokenData = await response.json();
        spotifyAuth.saveTokens(tokenData);
        
        // Update status and show success toast
        setStatus('success');
        toast({
          title: 'Spotify Connected',
          description: 'Your Spotify account has been successfully connected!',
        });
        
        // Redirect back to the original location or to a default page
        setTimeout(() => {
          // Parse the state parameter to extract the return URL if it exists
          let returnTo = '/';
          try {
            if (state) {
              const stateObj = JSON.parse(decodeURIComponent(state));
              if (stateObj.returnTo) {
                returnTo = stateObj.returnTo;
              }
            }
          } catch (e) {
            console.error('Error parsing state parameter:', e);
          }
          
          navigate(returnTo);
        }, 1500);
      } catch (error) {
        console.error('Error processing Spotify callback:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };
    
    processAuth();
  }, [isAuthenticated, getAccessTokenSilently, navigate, toast, loginWithRedirect]);
  
  // Render different UI based on status
  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <CardHeader>
              <CardTitle>Connecting Spotify</CardTitle>
              <CardDescription>
                Please wait while we connect your Spotify account...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </>
        );
      
      case 'success':
        return (
          <>
            <CardHeader>
              <CardTitle className="text-green-500">Connection Successful</CardTitle>
              <CardDescription>
                Your Spotify account has been successfully connected!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p>Redirecting you back...</p>
            </CardContent>
          </>
        );
      
      case 'error':
        return (
          <>
            <CardHeader>
              <CardTitle className="text-destructive">Connection Failed</CardTitle>
              <CardDescription>
                There was a problem connecting your Spotify account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate('/')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
                >
                  Return to Home
                </button>
              </div>
            </CardContent>
          </>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        {renderContent()}
      </Card>
    </div>
  );
};

export default SpotifyCallbackPage;
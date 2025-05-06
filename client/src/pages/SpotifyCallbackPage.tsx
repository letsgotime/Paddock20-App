/**
 * Spotify Callback Page
 * 
 * Handles the callback from Spotify OAuth authentication
 */
import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { spotifyAuth } from '../services/spotify/spotifyAuth';
import { useToast } from '@/hooks/use-toast';
// Use the App's layout structure directly since we don't have a Layout component
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SpotifyCallbackPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ code: string }>('/spotify/callback');
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing authorization...');
  
  useEffect(() => {
    async function handleCallback() {
      // Get code from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      // Handle error in URL
      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        
        toast({
          title: 'Spotify Authentication Error',
          description: `Failed to connect to Spotify: ${error}`,
          variant: 'destructive'
        });
        
        // Redirect after a delay
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        
        return;
      }
      
      // No code in URL
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Spotify');
        
        toast({
          title: 'Spotify Authentication Error',
          description: 'No authorization code received from Spotify',
          variant: 'destructive'
        });
        
        // Redirect after a delay
        setTimeout(() => {
          setLocation('/');
        }, 3000);
        
        return;
      }
      
      try {
        // Handle the callback with the code
        const success = await spotifyAuth.handleCallback(code);
        
        if (success) {
          setStatus('success');
          setMessage('Successfully connected to Spotify!');
          
          toast({
            title: 'Spotify Connected',
            description: 'You have successfully connected your Spotify account',
          });
          
          // Redirect after a delay
          setTimeout(() => {
            setLocation('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Failed to process Spotify authorization');
          
          toast({
            title: 'Spotify Authentication Error',
            description: 'Failed to process Spotify authorization',
            variant: 'destructive'
          });
          
          // Redirect after a delay
          setTimeout(() => {
            setLocation('/');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Authentication error: ${error.message || 'Unknown error'}`);
        
        toast({
          title: 'Spotify Authentication Error',
          description: `Authentication error: ${error.message || 'Unknown error'}`,
          variant: 'destructive'
        });
        
        // Redirect after a delay
        setTimeout(() => {
          setLocation('/');
        }, 3000);
      }
    }
    
    handleCallback();
  }, [setLocation, toast]);
  
  // UI states based on the authorization process
  const statusContent = {
    loading: (
      <>
        <div className="animate-spin w-12 h-12 mb-4">
          <Loader2 className="w-12 h-12 text-carolina-blue" />
        </div>
        <h2 className="text-2xl font-bold text-carolina-blue mb-2">Connecting to Spotify</h2>
        <p className="text-white/70">Please wait while we complete your authorization...</p>
      </>
    ),
    success: (
      <>
        <div className="w-12 h-12 mb-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-carolina-blue mb-2">Successfully Connected</h2>
        <p className="text-white/70">You've connected your Spotify account to PADDOCK20</p>
        <p className="text-white/50 mt-4">Redirecting you back...</p>
      </>
    ),
    error: (
      <>
        <div className="w-12 h-12 mb-4 bg-red-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-carolina-blue mb-2">Connection Failed</h2>
        <p className="text-white/70">{message}</p>
        <p className="text-white/50 mt-4">Redirecting you back...</p>
      </>
    )
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black">
      <Card className="p-8 max-w-md w-full bg-black/70 border border-carolina-blue/30 backdrop-blur-lg">
        <div className="flex flex-col items-center justify-center text-center">
          {statusContent[status]}
        </div>
      </Card>
    </div>
  );
}
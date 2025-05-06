/**
 * Spotify Callback Page
 * Handles the redirect from Spotify OAuth flow
 */
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleSpotifyRedirect } from '@/services/spotify/spotifyAuth';
import { Loader2 } from 'lucide-react';

const SpotifyCallbackPage = () => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processSpotifyCallback = async () => {
      try {
        const tokens = await handleSpotifyRedirect();
        
        if (tokens) {
          toast({
            title: 'Spotify Connected',
            description: 'Your Spotify account has been successfully connected.',
          });
          // Redirect to appropriate page after successful auth
          window.location.href = '/';
        }
      } catch (err: any) {
        console.error('Error handling Spotify callback:', err);
        setError(err.message || 'Failed to connect your Spotify account');
        setIsProcessing(false);
      }
    };

    processSpotifyCallback();
  }, [toast]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-xl border border-red-800/30">
          <h1 className="text-2xl font-bold text-white mb-4">Connection Error</h1>
          <div className="p-4 mb-6 bg-red-900/20 border border-red-800/50 rounded-md">
            <p className="text-red-300">{error}</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-[#1982FC] text-white rounded-md hover:bg-[#1982FC]/80 transition-colors"
            >
              Return to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-xl border border-blue-800/30">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" 
            alt="Spotify Logo" 
            className="h-10 mr-2" 
          />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-6">Connecting to Spotify</h1>
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-[#1982FC] animate-spin" />
          <p className="text-gray-300 text-center">
            Please wait while we finish connecting your Spotify account...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpotifyCallbackPage;
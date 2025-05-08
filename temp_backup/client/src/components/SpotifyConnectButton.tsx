import React from 'react';
import { Button } from "@/components/ui/button";
import { Music2Icon } from 'lucide-react';
import spotifyApi from '../services/spotify/spotifyApi';
import { useSpotify } from '../contexts/SpotifyContext';

/**
 * SpotifyConnectButton
 * 
 * A button component that initiates Spotify authentication flow
 * or shows current connection status
 */
const SpotifyConnectButton: React.FC = () => {
  const { isAuthenticated, userProfile, login, logout } = useSpotify();
  
  // Function to handle click based on authentication state
  const handleClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      login();
    }
  };
  
  return (
    <Button
      variant={isAuthenticated ? "outline" : "default"}
      size="sm"
      className={`${isAuthenticated ? 'bg-green-800 hover:bg-green-700' : 'bg-[#1DB954] hover:bg-[#1ed760]'} text-white flex items-center gap-2`}
      onClick={handleClick}
    >
      <Music2Icon size={16} />
      {isAuthenticated 
        ? `Connected: ${userProfile?.display_name || 'Spotify User'}`
        : 'Connect Spotify'
      }
    </Button>
  );
};

export default SpotifyConnectButton;
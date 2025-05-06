import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  isSpotifyAuthenticated,
  initiateSpotifyAuth,
  handleSpotifyRedirect,
  clearSpotifyAuth,
  getSpotifyUserProfile
} from '../services/spotify/spotifyAuth';
import {
  getUserPlaylists,
  getPlaylist,
  getPlaylistsByActivity,
  getPlaylistsByGenre,
  createPlaylist,
  saveDrivePlaylist,
  getDrivePlaylistsByUserId,
  getDrivePlaylistsByMood,
  getDrivePlaylistsByWeather,
  playPlaylist,
  pausePlayback,
  resumePlayback,
  getRecommendedPlaylists
} from '../services/spotify/spotifyApi';
import {
  SpotifyContextType,
  SpotifyProfile,
  SpotifyPlaylist,
  SpotifyTokens,
  DrivePlaylist
} from '../services/spotify/spotifyTypes';
import { useToast } from '@/hooks/use-toast';

// Create the context with a default undefined value
const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

// Provider component
export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recommendedPlaylists, setRecommendedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [favoritePlaylists, setFavoritePlaylists] = useState<DrivePlaylist[]>([]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isSpotifyAuthenticated();
        setIsAuthenticated(authStatus);
        
        if (authStatus) {
          // Load user profile
          const userProfile = await getSpotifyUserProfile();
          setProfile(userProfile);
          
          // Load user playlists
          const playlists = await getUserPlaylists();
          setUserPlaylists(playlists);
          
          // Load favorite drive playlists
          const drivePlaylists = await getDrivePlaylistsByUserId();
          setFavoritePlaylists(drivePlaylists);
        }
      } catch (error) {
        console.error('Error checking Spotify auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Handle authentication
  const authenticate = async () => {
    try {
      setIsLoading(true);
      await initiateSpotifyAuth();
      // Note: This will redirect away from the current page
    } catch (error) {
      console.error('Spotify authentication error:', error);
      toast({
        title: 'Spotify Authentication Failed',
        description: 'Unable to connect to Spotify. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = () => {
    clearSpotifyAuth();
    setIsAuthenticated(false);
    setProfile(null);
    setUserPlaylists([]);
    setCurrentPlaylist(null);
    toast({
      title: 'Spotify Disconnected',
      description: 'Your Spotify account has been disconnected.',
    });
  };

  // Implement playlist methods
  const refreshUserPlaylists = async () => {
    if (!isAuthenticated) return [];
    
    try {
      const playlists = await getUserPlaylists();
      setUserPlaylists(playlists);
      return playlists;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      return [];
    }
  };

  const fetchPlaylistById = async (id: string) => {
    if (!isAuthenticated) return null;
    
    try {
      const playlist = await getPlaylist(id);
      return playlist;
    } catch (error) {
      console.error(`Error fetching playlist ${id}:`, error);
      return null;
    }
  };

  const fetchPlaylistsByActivity = async (activity: string, limit = 5) => {
    try {
      const playlists = await getPlaylistsByActivity(activity, limit);
      return playlists;
    } catch (error) {
      console.error('Error fetching playlists by activity:', error);
      return [];
    }
  };

  const fetchPlaylistsByGenre = async (genre: string, limit = 5) => {
    try {
      const playlists = await getPlaylistsByGenre(genre, limit);
      return playlists;
    } catch (error) {
      console.error('Error fetching playlists by genre:', error);
      return [];
    }
  };

  const createNewPlaylist = async (name: string, description = '', isPublic = false) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your Spotify account first.',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      const playlist = await createPlaylist(name, description, isPublic);
      // Refresh user playlists after creating a new one
      refreshUserPlaylists();
      
      toast({
        title: 'Playlist Created',
        description: `Your "${name}" playlist has been created successfully.`,
      });
      
      return playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Playlist Creation Failed',
        description: 'Unable to create playlist. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Drive-specific methods
  const savePlaylistForDrive = async (playlist: DrivePlaylist) => {
    try {
      await saveDrivePlaylist(playlist);
      
      // Refresh favorites
      const drivePlaylists = await getDrivePlaylistsByUserId();
      setFavoritePlaylists(drivePlaylists);
      
      toast({
        title: 'Playlist Saved',
        description: 'This playlist has been added to your drive collection.',
      });
    } catch (error) {
      console.error('Error saving drive playlist:', error);
      toast({
        title: 'Failed to Save Playlist',
        description: 'Unable to save playlist to your collection.',
        variant: 'destructive',
      });
    }
  };

  const getPlaylistsByDriveMood = async (moods: string[]) => {
    try {
      return await getDrivePlaylistsByMood(moods);
    } catch (error) {
      console.error('Error fetching playlists by mood:', error);
      return [];
    }
  };

  const getPlaylistsByWeatherCondition = async (conditions: string[]) => {
    try {
      return await getDrivePlaylistsByWeather(conditions);
    } catch (error) {
      console.error('Error fetching playlists by weather:', error);
      return [];
    }
  };

  // Playback controls
  const handlePlayPlaylist = async (playlistUri: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your Spotify account first.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await playPlaylist(playlistUri);
    } catch (error) {
      toast({
        title: 'Playback Error',
        description: 'Spotify Premium is required for playback control.',
        variant: 'destructive',
      });
    }
  };

  const handlePausePlayback = async () => {
    if (!isAuthenticated) return;
    
    try {
      await pausePlayback();
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  const handleResumePlayback = async () => {
    if (!isAuthenticated) return;
    
    try {
      await resumePlayback();
    } catch (error) {
      console.error('Error resuming playback:', error);
    }
  };

  // Provide context value
  const contextValue: SpotifyContextType = {
    isAuthenticated,
    isLoading,
    tokens,
    profile,
    currentPlaylist,
    userPlaylists,
    recommendedPlaylists,
    favoritePlaylists,
    
    // Authentication methods
    authenticate,
    logout,
    
    // Playlist methods
    getUserPlaylists: refreshUserPlaylists,
    getPlaylistById: fetchPlaylistById,
    getPlaylistsByActivity: fetchPlaylistsByActivity,
    getPlaylistsByGenre: fetchPlaylistsByGenre,
    createPlaylist: createNewPlaylist,
    
    // Drive-specific methods
    saveDrivePlaylist: savePlaylistForDrive,
    getDrivePlaylistsByUserId,
    getDrivePlaylistsByMood: getPlaylistsByDriveMood,
    getDrivePlaylistsByWeather: getPlaylistsByWeatherCondition,
    
    // Playback methods
    playPlaylist: handlePlayPlaylist,
    pausePlayback: handlePausePlayback,
    resumePlayback: handleResumePlayback,
  };

  return (
    <SpotifyContext.Provider value={contextValue}>
      {children}
    </SpotifyContext.Provider>
  );
};

// Custom hook to use Spotify context
export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  
  return context;
};

// Spotify callback handler component
export const SpotifyCallback = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        const tokens = await handleSpotifyRedirect();
        
        if (tokens) {
          toast({
            title: 'Spotify Connected',
            description: 'Your Spotify account has been connected successfully.',
          });
        }
        
        // Redirect back to the app after processing
        window.location.href = '/';
      } catch (err) {
        console.error('Error handling Spotify callback:', err);
        setError('Failed to connect your Spotify account. Please try again.');
        setIsProcessing(false);
      }
    };
    
    processCallback();
  }, [toast]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="bg-red-900/20 border border-red-900 p-6 rounded-lg max-w-md text-center">
          <h1 className="text-xl font-bold text-red-500 mb-4">Connection Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-800 px-4 py-2 rounded text-white hover:bg-gray-700"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-900/60 border border-blue-900/30 p-6 rounded-lg max-w-md text-center">
        <h1 className="text-xl font-bold text-[#1982FC] mb-4">Connecting to Spotify</h1>
        <p className="text-gray-300 mb-6">Please wait while we connect your Spotify account...</p>
        <div className="w-10 h-10 border-t-2 border-b-2 border-[#1982FC] rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};
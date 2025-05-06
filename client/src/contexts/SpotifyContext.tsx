/**
 * Spotify Context
 * 
 * Provides Spotify functionality throughout the application
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
import { spotifyAuth } from '../services/spotify/spotifyAuth';
import { spotifyApi } from '../services/spotify/spotifyApi';
import {
  SpotifyProfile,
  SpotifyPlaylist,
  PlaylistResponse,
  DrivePlaylist
} from '../services/spotify/spotifyTypes';
import { useToast } from '@/hooks/use-toast';

interface SpotifyContextProps {
  // Authentication state
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  
  // Profile data
  profile: SpotifyProfile | null;
  isLoadingProfile: boolean;
  
  // Playlists
  playlists: SpotifyPlaylist[];
  isLoadingPlaylists: boolean;
  refreshPlaylists: () => Promise<void>;
  
  // Drive-specific playlist functions
  createDrivePlaylist: (
    driveName: string,
    duration: number,
    mood?: string,
    weather?: string,
    route?: string,
    distance?: number
  ) => Promise<DrivePlaylist | null>;
  
  // User playlists management
  getUserPlaylists: () => Promise<PlaylistResponse>;
  getPlaylistById: (id: string) => Promise<SpotifyPlaylist | null>;
  
  // General search
  searchTracks: (query: string, limit?: number) => Promise<any>;
  
  // Error state
  error: string | null;
}

const SpotifyContext = createContext<SpotifyContextProps | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Profile state
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  
  // Playlists state
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication status and load profile on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuthed = spotifyAuth.isAuthenticated();
      setIsAuthenticated(isAuthed);
      
      if (isAuthed) {
        loadProfile();
        loadPlaylists();
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!spotifyAuth.isAuthenticated()) {
      return;
    }
    
    setIsLoadingProfile(true);
    setError(null);
    
    try {
      const userProfile = await spotifyApi.getProfile();
      setProfile(userProfile);
    } catch (err) {
      const errorMsg = 'Failed to load Spotify profile';
      setError(errorMsg);
      toast({
        title: 'Spotify Error',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [toast]);
  
  // Load user playlists
  const loadPlaylists = useCallback(async () => {
    if (!spotifyAuth.isAuthenticated()) {
      return;
    }
    
    setIsLoadingPlaylists(true);
    setError(null);
    
    try {
      const playlistResponse = await spotifyApi.getUserPlaylists();
      setPlaylists(playlistResponse.items);
    } catch (err) {
      const errorMsg = 'Failed to load Spotify playlists';
      setError(errorMsg);
      toast({
        title: 'Spotify Error',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingPlaylists(false);
    }
  }, [toast]);
  
  // Refresh playlists
  const refreshPlaylists = useCallback(async () => {
    await loadPlaylists();
  }, [loadPlaylists]);
  
  // Login
  const login = useCallback(() => {
    spotifyAuth.authorize();
  }, []);
  
  // Logout
  const logout = useCallback(() => {
    spotifyAuth.clearTokens();
    setIsAuthenticated(false);
    setProfile(null);
    setPlaylists([]);
  }, []);
  
  // Create a playlist for a drive
  const createDrivePlaylist = useCallback(async (
    driveName: string,
    duration: number,
    mood?: string,
    weather?: string,
    route?: string,
    distance?: number
  ): Promise<DrivePlaylist | null> => {
    if (!spotifyAuth.isAuthenticated()) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to Spotify to create playlists',
        variant: 'destructive'
      });
      return null;
    }
    
    setError(null);
    
    try {
      const playlist = await spotifyApi.createDrivePlaylist(
        driveName,
        duration,
        mood,
        weather,
        route,
        distance
      );
      
      // Refresh the playlists list
      await refreshPlaylists();
      
      toast({
        title: 'Playlist Created',
        description: `Created "${playlist.name}" with ${playlist.tracks.total} tracks`,
      });
      
      return playlist;
    } catch (err) {
      const errorMsg = 'Failed to create drive playlist';
      setError(errorMsg);
      toast({
        title: 'Spotify Error',
        description: errorMsg,
        variant: 'destructive'
      });
      return null;
    }
  }, [toast, refreshPlaylists]);
  
  // Get user playlists
  const getUserPlaylists = useCallback(async (): Promise<PlaylistResponse> => {
    if (!spotifyAuth.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }
    
    try {
      return await spotifyApi.getUserPlaylists();
    } catch (err) {
      setError('Failed to get user playlists');
      throw err;
    }
  }, []);
  
  // Get a playlist by ID
  const getPlaylistById = useCallback(async (id: string): Promise<SpotifyPlaylist | null> => {
    if (!spotifyAuth.isAuthenticated()) {
      return null;
    }
    
    try {
      return await spotifyApi.getPlaylist(id);
    } catch (err) {
      setError(`Failed to get playlist: ${id}`);
      return null;
    }
  }, []);
  
  // Search for tracks
  const searchTracks = useCallback(async (query: string, limit = 20) => {
    if (!spotifyAuth.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }
    
    try {
      return await spotifyApi.search(query, 'track', limit);
    } catch (err) {
      setError('Failed to search for tracks');
      throw err;
    }
  }, []);
  
  const contextValue: SpotifyContextProps = {
    isAuthenticated,
    login,
    logout,
    profile,
    isLoadingProfile,
    playlists,
    isLoadingPlaylists,
    refreshPlaylists,
    createDrivePlaylist,
    getUserPlaylists,
    getPlaylistById,
    searchTracks,
    error
  };
  
  return (
    <SpotifyContext.Provider value={contextValue}>
      {children}
    </SpotifyContext.Provider>
  );
}

// Custom hook to use the Spotify context
export function useSpotify() {
  const context = useContext(SpotifyContext);
  
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  
  return context;
}
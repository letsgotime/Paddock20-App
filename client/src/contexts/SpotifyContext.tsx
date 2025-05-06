import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { SpotifyAuth, SpotifyApi } from '../services/spotify/spotifyAuth';
import { 
  SpotifyTrack, 
  SpotifyPlaylist, 
  SpotifyProfile,
  PlaylistResponse, 
  PlaylistTracksResponse 
} from '../services/spotify/spotifyTypes';
import { useToast } from '@/hooks/use-toast';

// Define context value type
interface SpotifyContextType {
  // Authentication state
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Spotify user data
  profile: SpotifyProfile | null;
  
  // Authentication actions
  login: () => void;
  logout: () => void;
  
  // Playlist management
  userPlaylists: SpotifyPlaylist[];
  refreshPlaylists: () => Promise<void>;
  getPlaylist: (id: string) => Promise<SpotifyPlaylist>;
  createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<SpotifyPlaylist>;
  addTracksToPlaylist: (playlistId: string, trackUris: string[]) => Promise<void>;
  removeTracksFromPlaylist: (playlistId: string, trackUris: string[]) => Promise<void>;
  
  // Track searching
  searchTracks: (query: string) => Promise<SpotifyTrack[]>;
  
  // Recommendations
  getRecommendations: (params: {
    seed_tracks?: string[];
    seed_artists?: string[];
    seed_genres?: string[];
    limit?: number;
    target_energy?: number;
    target_tempo?: number;
    target_valence?: number;
  }) => Promise<SpotifyTrack[]>;
  
  // Drive playlist management
  getRecommendedDrivePlaylists: () => Promise<SpotifyPlaylist[]>;
  getDrivePlaylistsByMood: (moods: string[]) => Promise<SpotifyPlaylist[]>;
  getDrivePlaylistsByWeather: (conditions: string[]) => Promise<SpotifyPlaylist[]>;
  saveDrivePlaylist: (playlist: SpotifyPlaylist) => Promise<void>;
  updateDrivePlaylist: (id: string, updates: Partial<SpotifyPlaylist>) => Promise<void>;
}

// Create the context with default values
const SpotifyContext = createContext<SpotifyContextType | null>(null);

// Provider component
export function SpotifyProvider({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated: isAuth0Authenticated } = useAuth0();
  const { toast } = useToast();
  
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<SpotifyPlaylist[]>([]);
  
  // Initialize Spotify API wrapper
  const spotifyApi = new SpotifyApi();
  const spotifyAuth = new SpotifyAuth();
  
  // Initialize Spotify authentication
  useEffect(() => {
    const initializeSpotify = async () => {
      if (!isAuth0Authenticated) {
        setIsAuthenticated(false);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }
      
      try {
        // Get Auth0 token for authenticating with our backend
        const token = await getAccessTokenSilently();
        
        // Check if we have an active Spotify session
        const isActive = await spotifyAuth.checkSession(token);
        
        if (isActive) {
          setIsAuthenticated(true);
          await loadUserProfile();
          await loadUserPlaylists();
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing Spotify context:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize Spotify'));
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    initializeSpotify();
  }, [isAuth0Authenticated]);
  
  // Load user profile
  const loadUserProfile = async () => {
    try {
      const profileData = await spotifyApi.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading Spotify user profile:', error);
      toast({
        title: 'Error loading profile',
        description: 'Could not load your Spotify profile',
        variant: 'destructive'
      });
    }
  };
  
  // Load user playlists
  const loadUserPlaylists = async () => {
    try {
      const playlists = await spotifyApi.getUserPlaylists();
      setUserPlaylists(playlists);
    } catch (error) {
      console.error('Error loading Spotify playlists:', error);
      toast({
        title: 'Error loading playlists',
        description: 'Could not load your Spotify playlists',
        variant: 'destructive'
      });
    }
  };
  
  // Refresh playlists
  const refreshPlaylists = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      await loadUserPlaylists();
    } catch (error) {
      console.error('Error refreshing playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get a specific playlist with track details
  const getPlaylist = async (id: string): Promise<SpotifyPlaylist> => {
    try {
      const playlist = await spotifyApi.getPlaylist(id);
      return playlist;
    } catch (error) {
      console.error(`Error getting playlist ${id}:`, error);
      toast({
        title: 'Error fetching playlist',
        description: 'Could not load the requested playlist',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  // Create a new playlist
  const createPlaylist = async (
    name: string, 
    description?: string, 
    isPublic?: boolean
  ): Promise<SpotifyPlaylist> => {
    if (!profile) {
      toast({
        title: 'Error creating playlist',
        description: 'You need to connect your Spotify account',
        variant: 'destructive'
      });
      throw new Error('Not connected to Spotify');
    }
    
    try {
      const playlist = await spotifyApi.createPlaylist(name, description, isPublic);
      
      // Refresh the playlists list
      await refreshPlaylists();
      
      toast({
        title: 'Playlist created',
        description: `Your playlist "${name}" was created successfully`,
      });
      
      return playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Error creating playlist',
        description: 'Could not create the playlist on Spotify',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  // Add tracks to a playlist
  const addTracksToPlaylist = async (playlistId: string, trackUris: string[]): Promise<void> => {
    try {
      await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
      toast({
        title: 'Tracks added',
        description: `Added ${trackUris.length} tracks to your playlist`,
      });
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      toast({
        title: 'Error adding tracks',
        description: 'Could not add tracks to your playlist',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  // Remove tracks from a playlist
  const removeTracksFromPlaylist = async (playlistId: string, trackUris: string[]): Promise<void> => {
    try {
      await spotifyApi.removeTracksFromPlaylist(playlistId, trackUris);
      toast({
        title: 'Tracks removed',
        description: `Removed ${trackUris.length} tracks from your playlist`,
      });
    } catch (error) {
      console.error('Error removing tracks from playlist:', error);
      toast({
        title: 'Error removing tracks',
        description: 'Could not remove tracks from your playlist',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  // Search for tracks
  const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
    try {
      return await spotifyApi.searchTracks(query);
    } catch (error) {
      console.error('Error searching tracks:', error);
      toast({
        title: 'Error searching tracks',
        description: 'Could not find tracks matching your search',
        variant: 'destructive'
      });
      return [];
    }
  };
  
  // Get track recommendations
  const getRecommendations = async (params: {
    seed_tracks?: string[];
    seed_artists?: string[];
    seed_genres?: string[];
    limit?: number;
    target_energy?: number;
    target_tempo?: number;
    target_valence?: number;
  }): Promise<SpotifyTrack[]> => {
    try {
      return await spotifyApi.getRecommendations(params);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: 'Error getting recommendations',
        description: 'Could not get track recommendations',
        variant: 'destructive'
      });
      return [];
    }
  };
  
  // Initiate Spotify login
  const login = useCallback(() => {
    spotifyAuth.authorize();
  }, []);
  
  // Logout from Spotify
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setProfile(null);
    setUserPlaylists([]);
    // Note: This doesn't revoke access, just clears the local state
  }, []);
  
  // Drive playlist specific functions
  const getRecommendedDrivePlaylists = async (): Promise<SpotifyPlaylist[]> => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/spotify/recommended-playlists', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommended playlists');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting recommended drive playlists:', error);
      return [];
    }
  };
  
  const getDrivePlaylistsByMood = async (moods: string[]): Promise<SpotifyPlaylist[]> => {
    try {
      const token = await getAccessTokenSilently();
      const queryParams = moods.map(mood => `mood=${encodeURIComponent(mood)}`).join('&');
      const response = await fetch(`/api/spotify/drive-playlists/mood?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists by mood');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting drive playlists by mood:', error);
      return [];
    }
  };
  
  const getDrivePlaylistsByWeather = async (conditions: string[]): Promise<SpotifyPlaylist[]> => {
    try {
      const token = await getAccessTokenSilently();
      const queryParams = conditions.map(condition => `weather=${encodeURIComponent(condition)}`).join('&');
      const response = await fetch(`/api/spotify/drive-playlists/weather?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists by weather');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting drive playlists by weather:', error);
      return [];
    }
  };
  
  const saveDrivePlaylist = async (playlist: SpotifyPlaylist): Promise<void> => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/spotify/drive-playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(playlist)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save drive playlist');
      }
      
      toast({
        title: 'Playlist saved',
        description: 'Your drive playlist has been saved',
      });
    } catch (error) {
      console.error('Error saving drive playlist:', error);
      toast({
        title: 'Error saving playlist',
        description: 'Could not save your drive playlist',
        variant: 'destructive'
      });
    }
  };
  
  const updateDrivePlaylist = async (id: string, updates: Partial<SpotifyPlaylist>): Promise<void> => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/spotify/drive-playlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update drive playlist');
      }
      
      toast({
        title: 'Playlist updated',
        description: 'Your drive playlist has been updated',
      });
    } catch (error) {
      console.error('Error updating drive playlist:', error);
      toast({
        title: 'Error updating playlist',
        description: 'Could not update your drive playlist',
        variant: 'destructive'
      });
    }
  };
  
  // Combine all values and functions for the context
  const value: SpotifyContextType = {
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    profile,
    login,
    logout,
    userPlaylists,
    refreshPlaylists,
    getPlaylist,
    createPlaylist,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    searchTracks,
    getRecommendations,
    getRecommendedDrivePlaylists,
    getDrivePlaylistsByMood,
    getDrivePlaylistsByWeather,
    saveDrivePlaylist,
    updateDrivePlaylist
  };
  
  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}

// Hook to use the context
export function useSpotify() {
  const context = useContext(SpotifyContext);
  
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  
  return context;
}
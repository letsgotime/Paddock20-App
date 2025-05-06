import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { SpotifyAuth, SpotifyApi } from '../services/spotify/spotifyAuth';
import { useToast } from '@/hooks/use-toast';
import {
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifyProfile
} from '../services/spotify/spotifyTypes';

interface SpotifyContextType {
  // Authentication
  isConnected: boolean;
  connectSpotify: (returnTo?: string) => void;
  disconnectSpotify: () => void;
  
  // User profile
  userProfile: SpotifyProfile | null;
  
  // Playlists
  playlists: SpotifyPlaylist[];
  isLoadingPlaylists: boolean;
  loadPlaylists: () => Promise<void>;
  getPlaylistById: (id: string) => SpotifyPlaylist | undefined;
  
  // Playlist operations
  createPlaylist: (name: string, description?: string) => Promise<SpotifyPlaylist>;
  addTracksToPlaylist: (playlistId: string, trackUris: string[]) => Promise<void>;
  removeTracksFromPlaylist: (playlistId: string, trackUris: string[]) => Promise<void>;
  
  // Track management
  getRecommendations: (params: {
    seed_tracks?: string[];
    seed_artists?: string[];
    seed_genres?: string[];
    limit?: number;
    target_energy?: number;
    target_tempo?: number;
    target_valence?: number;
  }) => Promise<SpotifyTrack[]>;
  searchTracks: (query: string, limit?: number) => Promise<SpotifyTrack[]>;
  
  // Drive related operations
  createDrivePlaylist: (name: string, description: string, tracks: SpotifyTrack[]) => Promise<SpotifyPlaylist>;
  
  // Loading states
  isLoading: boolean;
}

// Initialize context with default values
const SpotifyContext = createContext<SpotifyContextType>({
  isConnected: false,
  connectSpotify: () => {},
  disconnectSpotify: () => {},
  userProfile: null,
  playlists: [],
  isLoadingPlaylists: false,
  loadPlaylists: async () => {},
  getPlaylistById: () => undefined,
  createPlaylist: async () => ({} as SpotifyPlaylist),
  addTracksToPlaylist: async () => {},
  removeTracksFromPlaylist: async () => {},
  getRecommendations: async () => [],
  searchTracks: async () => [],
  createDrivePlaylist: async () => ({} as SpotifyPlaylist),
  isLoading: false,
});

// Provider component
export const SpotifyProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Auth0 authentication
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { toast } = useToast();
  
  // State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<SpotifyProfile | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(false);
  
  // Initialize Spotify services
  const spotifyAuth = new SpotifyAuth();
  const spotifyApi = new SpotifyApi();
  
  // Check if the user has connected their Spotify account
  const checkSpotifyConnection = async () => {
    try {
      if (!isAuthenticated) {
        setIsConnected(false);
        return;
      }
      
      // Check if we have Spotify tokens in storage
      const hasTokens = spotifyAuth.isTokenValid();
      
      if (!hasTokens) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      
      // Get Auth0 token for backend requests
      const token = await getAccessTokenSilently();
      
      // Verify the token with Spotify
      const isValid = await spotifyAuth.checkSession(token);
      setIsConnected(isValid);
      
      // If connected, load user profile
      if (isValid) {
        await loadUserProfile(token);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  };
  
  // Load user profile
  const loadUserProfile = async (token: string) => {
    try {
      const profile = await spotifyApi.getProfile();
      setUserProfile(profile as SpotifyProfile);
    } catch (error) {
      console.error('Error loading Spotify profile:', error);
      setUserProfile(null);
    }
  };
  
  // Load user playlists
  const loadPlaylists = async () => {
    try {
      setIsLoadingPlaylists(true);
      
      // Get Auth0 token for backend requests
      const token = await getAccessTokenSilently();
      
      // Get playlists from Spotify
      const response = await fetch('/api/spotify/me/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load playlists');
      }
      
      const data = await response.json();
      setPlaylists(data.items as SpotifyPlaylist[]);
    } catch (error) {
      console.error('Error loading playlists:', error);
      toast({
        title: 'Failed to load playlists',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPlaylists(false);
    }
  };
  
  // Find playlist by ID
  const getPlaylistById = (id: string): SpotifyPlaylist | undefined => {
    return playlists.find(playlist => playlist.id === id);
  };
  
  // Create a new playlist
  const createPlaylist = async (name: string, description?: string): Promise<SpotifyPlaylist> => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch('/api/spotify/me/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          public: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }
      
      const playlist = await response.json();
      
      // Update local playlists state
      setPlaylists(prev => [...prev, playlist]);
      
      return playlist as SpotifyPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Failed to create playlist',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Add tracks to a playlist
  const addTracksToPlaylist = async (playlistId: string, trackUris: string[]): Promise<void> => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`/api/spotify/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uris: trackUris
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add tracks to playlist');
      }
      
      // Refresh playlist to get updated tracks
      await loadPlaylists();
      
      toast({
        title: 'Tracks Added',
        description: `${trackUris.length} tracks added to playlist`,
      });
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      toast({
        title: 'Failed to add tracks',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Remove tracks from a playlist
  const removeTracksFromPlaylist = async (playlistId: string, trackUris: string[]): Promise<void> => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`/api/spotify/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tracks: trackUris.map(uri => ({ uri }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove tracks from playlist');
      }
      
      // Refresh playlist to get updated tracks
      await loadPlaylists();
      
      toast({
        title: 'Tracks Removed',
        description: `${trackUris.length} tracks removed from playlist`,
      });
    } catch (error) {
      console.error('Error removing tracks from playlist:', error);
      toast({
        title: 'Failed to remove tracks',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
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
      const token = await getAccessTokenSilently();
      
      // Convert params to query string
      const queryParams = new URLSearchParams();
      
      if (params.seed_tracks?.length) {
        queryParams.append('seed_tracks', params.seed_tracks.join(','));
      }
      
      if (params.seed_artists?.length) {
        queryParams.append('seed_artists', params.seed_artists.join(','));
      }
      
      if (params.seed_genres?.length) {
        queryParams.append('seed_genres', params.seed_genres.join(','));
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      if (typeof params.target_energy === 'number') {
        queryParams.append('target_energy', params.target_energy.toString());
      }
      
      if (typeof params.target_tempo === 'number') {
        queryParams.append('target_tempo', params.target_tempo.toString());
      }
      
      if (typeof params.target_valence === 'number') {
        queryParams.append('target_valence', params.target_valence.toString());
      }
      
      const response = await fetch(`/api/spotify/recommendations?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      
      const data = await response.json();
      return data.tracks as SpotifyTrack[];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: 'Failed to get recommendations',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return [];
    }
  };
  
  // Search for tracks
  const searchTracks = async (query: string, limit: number = 20): Promise<SpotifyTrack[]> => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to search tracks');
      }
      
      const data = await response.json();
      return data.tracks.items as SpotifyTrack[];
    } catch (error) {
      console.error('Error searching tracks:', error);
      toast({
        title: 'Failed to search tracks',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return [];
    }
  };
  
  // Create a playlist specifically for a drive
  const createDrivePlaylist = async (
    name: string,
    description: string,
    tracks: SpotifyTrack[]
  ): Promise<SpotifyPlaylist> => {
    try {
      // Create a new playlist
      const playlist = await createPlaylist(name, description);
      
      // Add tracks to the playlist
      if (tracks.length > 0) {
        const trackUris = tracks.map(track => track.uri);
        await addTracksToPlaylist(playlist.id, trackUris);
      }
      
      return playlist;
    } catch (error) {
      console.error('Error creating drive playlist:', error);
      toast({
        title: 'Failed to create drive playlist',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Connect to Spotify
  const connectSpotify = (returnTo: string = window.location.pathname) => {
    // Initiate Spotify authorization flow with return path
    spotifyAuth.authorize(returnTo);
  };
  
  // Disconnect from Spotify
  const disconnectSpotify = () => {
    // Clear stored tokens
    spotifyAuth.clearTokens();
    setIsConnected(false);
    setUserProfile(null);
    setPlaylists([]);
    
    toast({
      title: 'Spotify Disconnected',
      description: 'Your Spotify account has been disconnected',
    });
  };
  
  // Check connection on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      checkSpotifyConnection();
    } else {
      setIsConnected(false);
      setUserProfile(null);
      setPlaylists([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  // Load playlists when connected
  useEffect(() => {
    if (isConnected) {
      loadPlaylists();
    }
  }, [isConnected]);
  
  const contextValue: SpotifyContextType = {
    isConnected,
    connectSpotify,
    disconnectSpotify,
    userProfile,
    playlists,
    isLoadingPlaylists,
    loadPlaylists,
    getPlaylistById,
    createPlaylist,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    getRecommendations,
    searchTracks,
    createDrivePlaylist,
    isLoading,
  };
  
  return (
    <SpotifyContext.Provider value={contextValue}>
      {children}
    </SpotifyContext.Provider>
  );
};

// Custom hook to use the Spotify context
export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  
  return context;
};
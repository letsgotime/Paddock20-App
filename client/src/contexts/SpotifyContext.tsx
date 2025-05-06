import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import spotifyApi from '../services/spotify/spotifyApi';
import spotifyAuth from '../services/spotify/spotifyAuth';
import { 
  SpotifyProfile, 
  SpotifyPlaylist, 
  DrivePlaylist,
  PlaylistTracksResponse,
  SpotifyTrack
} from '../services/spotify/spotifyTypes';
import { useToast } from "@/hooks/use-toast";

// Define the context type
interface SpotifyContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: SpotifyProfile | null;
  playlists: SpotifyPlaylist[];
  drivePlaylists: DrivePlaylist[];
  // Auth methods
  login: () => void;
  logout: () => void;
  // Playlist methods
  refreshPlaylists: () => Promise<void>;
  getPlaylistTracks: (playlistId: string) => Promise<PlaylistTracksResponse>;
  createDrivePlaylist: (
    driveName: string,
    driveDuration: number,
    seedTracks: string[]
  ) => Promise<DrivePlaylist | null>;
  // Track methods
  getTopTracks: () => Promise<SpotifyTrack[]>;
  searchTracks: (query: string) => Promise<SpotifyTrack[]>;
}

// Create the context with default values
export const SpotifyContext = createContext<SpotifyContextType>({
  isAuthenticated: false,
  isLoading: true,
  userProfile: null,
  playlists: [],
  drivePlaylists: [],
  login: () => {},
  logout: () => {},
  refreshPlaylists: async () => {},
  getPlaylistTracks: async () => ({ href: '', items: [], limit: 0, next: null, offset: 0, previous: null, total: 0 }),
  createDrivePlaylist: async () => null,
  getTopTracks: async () => [],
  searchTracks: async () => []
});

// Provider component
export const SpotifyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<SpotifyProfile | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [drivePlaylists, setDrivePlaylists] = useState<DrivePlaylist[]>([]);
  const { toast } = useToast();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = spotifyAuth.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          // Get user profile
          const profile = await spotifyApi.getCurrentUserProfile();
          setUserProfile(profile);
          
          // Get user's playlists
          await refreshPlaylists();
        } catch (error) {
          console.error('Error initializing Spotify context:', error);
          if (error instanceof Error) {
            toast({
              title: "Spotify Error",
              description: error.message,
              variant: "destructive"
            });
          }
          // Auth might be expired or invalid
          if (spotifyAuth.isAuthenticated()) {
            spotifyAuth.logout();
            setIsAuthenticated(false);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Method to start login flow
  const login = () => {
    spotifyApi.startAuthFlow();
  };

  // Method to logout
  const logout = () => {
    spotifyApi.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setPlaylists([]);
    setDrivePlaylists([]);
    
    toast({
      title: "Logged out",
      description: "Successfully logged out of Spotify",
    });
  };

  // Method to refresh playlists
  const refreshPlaylists = async () => {
    try {
      setIsLoading(true);
      
      // Get regular playlists
      const playlistsResponse = await spotifyApi.getUserPlaylists();
      setPlaylists(playlistsResponse.items);
      
      // Filter for drive playlists
      // We can identify drive playlists by their name or description
      const drivePlaylists = playlistsResponse.items
        .filter(playlist => 
          (playlist.name?.includes('Drive') || 
          playlist.description?.includes('drive')) &&
          !playlist.name?.includes('Discover')
        )
        .map(playlist => ({
          ...playlist,
          driveName: playlist.name.replace(' Drive', ''),
          driveDuration: estimateDriveDuration(playlist) 
        }));
      
      setDrivePlaylists(drivePlaylists);
    } catch (error) {
      console.error('Error refreshing playlists:', error);
      if (error instanceof Error) {
        toast({
          title: "Error Loading Playlists",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to estimate drive duration from playlist
  const estimateDriveDuration = (playlist: SpotifyPlaylist): number => {
    // Try to extract from description if it contains duration
    if (playlist.description && playlist.description.includes('min)')) {
      const match = playlist.description.match(/\((\d+) min\)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    // Default to the total track time if we can get it, otherwise estimate based on track count
    return Math.round(playlist.tracks.total * 3.5); // Assume average track is 3.5 minutes
  };

  // Method to get tracks for a playlist
  const getPlaylistTracks = async (playlistId: string): Promise<PlaylistTracksResponse> => {
    try {
      return await spotifyApi.getPlaylistTracks(playlistId);
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      if (error instanceof Error) {
        toast({
          title: "Error Loading Tracks",
          description: error.message,
          variant: "destructive"
        });
      }
      return { href: '', items: [], limit: 0, next: null, offset: 0, previous: null, total: 0 };
    }
  };

  // Method to create a drive playlist
  const createDrivePlaylist = async (
    driveName: string,
    driveDuration: number,
    seedTracks: string[]
  ): Promise<DrivePlaylist | null> => {
    if (!userProfile) {
      toast({
        title: "Error Creating Playlist",
        description: "You need to be logged in to Spotify",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setIsLoading(true);
      
      // Create the playlist
      const playlist = await spotifyApi.createDrivePlaylist(
        userProfile.id,
        driveName,
        driveDuration,
        seedTracks
      );
      
      // Add to local state
      setDrivePlaylists(prev => [...prev, playlist]);
      
      toast({
        title: "Playlist Created",
        description: `"${driveName} Drive" has been created in your Spotify account`,
      });
      
      return playlist;
    } catch (error) {
      console.error('Error creating drive playlist:', error);
      if (error instanceof Error) {
        toast({
          title: "Error Creating Playlist",
          description: error.message,
          variant: "destructive"
        });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Method to get user's top tracks
  const getTopTracks = async (): Promise<SpotifyTrack[]> => {
    try {
      const response = await spotifyApi.getTopTracks();
      return response.items || [];
    } catch (error) {
      console.error('Error getting top tracks:', error);
      if (error instanceof Error) {
        toast({
          title: "Error Loading Tracks",
          description: error.message,
          variant: "destructive"
        });
      }
      return [];
    }
  };

  // Method to search for tracks
  const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
    if (!query.trim()) return [];
    
    try {
      const response = await spotifyApi.search(query, ['track']);
      return response.tracks?.items || [];
    } catch (error) {
      console.error('Error searching tracks:', error);
      if (error instanceof Error) {
        toast({
          title: "Search Error",
          description: error.message,
          variant: "destructive"
        });
      }
      return [];
    }
  };

  // Combine all values and methods into a context value
  const contextValue: SpotifyContextType = {
    isAuthenticated,
    isLoading,
    userProfile,
    playlists,
    drivePlaylists,
    login,
    logout,
    refreshPlaylists,
    getPlaylistTracks,
    createDrivePlaylist,
    getTopTracks,
    searchTracks
  };

  return (
    <SpotifyContext.Provider value={contextValue}>
      {children}
    </SpotifyContext.Provider>
  );
};

// Custom hook to use the Spotify context
export const useSpotify = () => useContext(SpotifyContext);
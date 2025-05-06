/**
 * Spotify Types
 * Type definitions for Spotify API data structures
 */

// Spotify authentication tokens
export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  scope: string;
}

// Spotify user profile
export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  external_urls: {
    spotify: string;
  };
  country?: string;
  product?: string;
  profileUrl: string;
}

// Spotify playlist
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
    external_urls: {
      spotify: string;
    };
  };
  images: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  uri: string;
  tracks: {
    total: number;
    href: string;
    items?: SpotifyPlaylistTrack[];
  };
  public: boolean;
  collaborative: boolean;
  external_urls: {
    spotify: string;
  };
  snapshot_id?: string;
}

// Spotify playlist track
export interface SpotifyPlaylistTrack {
  added_at: string;
  track: SpotifyTrack;
}

// Spotify track
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  href: string;
  duration_ms: number;
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number | null;
      width: number | null;
    }[];
    release_date?: string;
    external_urls: {
      spotify: string;
    };
  };
  artists: {
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }[];
  external_urls: {
    spotify: string;
  };
  popularity?: number;
  explicit?: boolean;
  preview_url?: string | null;
}

// Drive playlist (stored in our backend)
export interface DrivePlaylist {
  id: string;
  userId: string;
  spotifyId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  mood?: string[];
  weather?: string[];
  routeId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Context type definition for the SpotifyContext provider
export interface SpotifyContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: SpotifyTokens | null;
  profile: SpotifyProfile | null;
  currentPlaylist: SpotifyPlaylist | null;
  userPlaylists: SpotifyPlaylist[];
  recommendedPlaylists: SpotifyPlaylist[];
  favoritePlaylists: DrivePlaylist[];
  
  // Authentication methods
  authenticate: () => Promise<void>;
  logout: () => void;
  
  // Playlist methods
  getUserPlaylists: () => Promise<SpotifyPlaylist[]>;
  getPlaylistById: (id: string) => Promise<SpotifyPlaylist>;
  getPlaylistsByActivity: (activity: string, limit?: number) => Promise<SpotifyPlaylist[]>;
  getPlaylistsByGenre: (genre: string, limit?: number) => Promise<SpotifyPlaylist[]>;
  createPlaylist: (name: string, description?: string, isPublic?: boolean) => Promise<SpotifyPlaylist>;
  
  // Drive-specific methods
  saveDrivePlaylist: (playlist: DrivePlaylist) => Promise<void>;
  getDrivePlaylistsByUserId: () => Promise<DrivePlaylist[]>;
  getDrivePlaylistsByMood: (moods: string[]) => Promise<DrivePlaylist[]>;
  getDrivePlaylistsByWeather: (conditions: string[]) => Promise<DrivePlaylist[]>;
  
  // Playback methods
  playPlaylist: (playlistUri: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
}
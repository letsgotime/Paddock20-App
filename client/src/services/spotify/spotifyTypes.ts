/**
 * Spotify Service Types
 * Defines all types for the Spotify integration
 */

// Authentication types
export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp when token expires
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
  product: string; // 'premium', 'free', etc.
  country: string;
  uri: string;
}

// Playlist types
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string, height: number | null, width: number | null }>;
  uri: string;
  external_urls: {
    spotify: string;
  };
  tracks: {
    total: number;
    items?: SpotifyPlaylistTrack[];
  };
  owner: {
    id: string;
    display_name: string;
  };
  public: boolean;
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  track: SpotifyTrack;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string, height: number | null, width: number | null }>;
  };
  preview_url: string | null;
  uri: string;
  external_urls: {
    spotify: string;
  };
}

// Drive association types
export interface DrivePlaylist {
  playlistId: string;
  playlistName: string;
  playlistImageUrl: string;
  driveId: string; // Associated drive ID
  createdAt: string;
  mood: string[]; // Array of moods like ['energetic', 'focused']
  weather: string[]; // Array of weather conditions ['sunny', 'rainy']
  tags: string[]; // Custom tags
}

// Activity types
export interface SpotifyActivity {
  id: string;
  type: 'drive' | 'detailing' | 'maintenance' | 'mod' | 'general';
  playlistId: string;
  timestamp: string;
  duration: number; // In seconds
  contextId: string; // ID of the drive, maintenance session, etc.
}

// Paddock20 specific types
export interface DrivingPlaylistPreference {
  userId: string;
  activityType: 'cruising' | 'performance' | 'commuting' | 'offroad' | 'track';
  mood: string[];
  preferredGenres: string[];
  favoritePlaylistIds: string[];
  customSettings: Record<string, any>;
}

// Context type for React context
export interface SpotifyContextType {
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
  getDrivePlaylistsByUserId: (userId: string) => Promise<DrivePlaylist[]>;
  getDrivePlaylistsByMood: (moods: string[]) => Promise<DrivePlaylist[]>;
  getDrivePlaylistsByWeather: (conditions: string[]) => Promise<DrivePlaylist[]>;
  
  // Current playback methods
  playPlaylist: (playlistUri: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  resumePlayback: () => Promise<void>;
}
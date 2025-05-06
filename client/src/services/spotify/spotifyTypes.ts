/**
 * Spotify Types
 * Contains type definitions for Spotify API integrations
 */

// Spotify Authentication Tokens
export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  scope: string;
}

// Spotify User Profile
export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  external_urls: {
    spotify: string;
  };
  country: string;
  product: string;
  profileUrl: string;
}

// Spotify Track
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: {
    id: string;
    name: string;
  }[];
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
}

// Spotify Playlist
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  uri: string;
  images: { url: string; height: number; width: number }[];
  owner: {
    id: string;
    display_name: string;
  };
  public: boolean;
  collaborative: boolean;
  tracks: {
    total: number;
    items?: {
      track: SpotifyTrack;
      added_at: string;
      added_by: {
        id: string;
        display_name: string;
      };
    }[];
  };
  external_urls: {
    spotify: string;
  };
}

// Drive Journal specific playlist with additional metadata
export interface DrivePlaylist {
  spotifyId: string;
  userId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  uri: string;
  dateAdded: string;
  mood?: string[];
  weather?: string[];
  activity?: string[];
  vehicle?: string; // Vehicle ID associated with this playlist
  driveMoment?: string; // Time of day: morning, afternoon, evening, night
  isFavorite: boolean;
}

// SpotifyContext type containing all the properties and methods available in the context
export interface SpotifyContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: SpotifyTokens | null;
  profile: SpotifyProfile | null;

  // Playlists
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
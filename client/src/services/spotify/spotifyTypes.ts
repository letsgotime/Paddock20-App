/**
 * Spotify API Type Definitions
 * 
 * This file contains TypeScript interfaces for Spotify API responses and entities.
 * These types help maintain type safety when interacting with Spotify's API.
 */

/**
 * SpotifyTokenResponse
 * 
 * Response from Spotify token endpoint
 */
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * SpotifyProfile
 * 
 * Spotify user profile information
 */
export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  country: string;
  product: string;
  uri: string;
  // Additional specific fields we need
  profileImageUrl?: string;
}

/**
 * SpotifyArtist
 * 
 * Information about a Spotify artist
 */
export interface SpotifyArtist {
  id: string;
  name: string;
  type: string;
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
}

/**
 * SpotifyAlbum
 * 
 * Information about a Spotify album
 */
export interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string;
  artists: SpotifyArtist[];
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  release_date: string;
  total_tracks: number;
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
}

/**
 * SpotifyTrack
 * 
 * Information about a Spotify track
 */
export interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
  // We might add additional custom fields
  added_at?: string;
  is_playable?: boolean;
  // Audio features that might be included when getting track details
  audio_features?: {
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    time_signature: number;
  }
}

/**
 * SpotifyPlaylist
 * 
 * Information about a Spotify playlist
 */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  owner: {
    id: string;
    display_name: string;
    uri: string;
    href: string;
    external_urls: {
      spotify: string;
    };
  };
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  tracks: {
    href: string;
    total: number;
    items?: Array<{
      added_at: string;
      track: SpotifyTrack;
    }>;
  };
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
  snapshot_id: string;
  
  // Additional drive platform specific fields
  weather_conditions?: string[];
  drive_moods?: string[];
  is_featured?: boolean;
  energy_level?: number;
  drive_duration_range?: {
    min_minutes: number;
    max_minutes: number;
  };
  added_by_user_id?: string;
  vehicle_id?: string;
  last_used_at?: string;
  custom_tags?: string[];
}

/**
 * SpotifyRecommendationSeed
 * 
 * Seed criteria for Spotify recommendations
 */
export interface SpotifyRecommendationSeed {
  id: string;
  href: string;
  type: string;
  initialPoolSize: number;
  afterFilteringSize: number;
  afterRelinkingSize: number;
}

/**
 * SpotifyRecommendationResponse
 * 
 * Response from Spotify recommendations API
 */
export interface SpotifyRecommendationResponse {
  seeds: SpotifyRecommendationSeed[];
  tracks: SpotifyTrack[];
}

/**
 * SpotifyError
 * 
 * Standard error format from Spotify API
 */
export interface SpotifyError {
  status: number;
  message: string;
  error: {
    status: number;
    message: string;
  };
}
/**
 * Spotify API Type Definitions
 * 
 * Contains TypeScript interfaces for Spotify API responses
 */

/**
 * Basic Spotify token response from OAuth flow
 */
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * Spotify user profile
 */
export interface SpotifyProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  product: string;
  type: string;
  uri: string;
}

/**
 * Basic image object returned by Spotify
 */
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

/**
 * Spotify playlist object
 */
export interface SpotifyPlaylist {
  collaborative: boolean;
  description: string | null;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  owner: {
    display_name: string;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
    items?: PlaylistTrackObject[];
  };
  type: string;
  uri: string;
}

/**
 * Extended Spotify playlist for drive-specific features
 */
export interface DrivePlaylist extends SpotifyPlaylist {
  driveName: string;
  driveRoute?: string;
  driveDistance?: number;
  driveDuration: number; // in minutes
}

/**
 * Track within a playlist
 */
export interface PlaylistTrackObject {
  added_at: string;
  added_by: {
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  is_local: boolean;
  track: SpotifyTrack;
}

/**
 * Spotify track object
 */
export interface SpotifyTrack {
  album: {
    album_type: string;
    artists: SpotifyArtist[];
    available_markets: string[];
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
  };
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
}

/**
 * Spotify artist object
 */
export interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

/**
 * Response object for playlists endpoints
 */
export interface PlaylistResponse {
  href: string;
  items: SpotifyPlaylist[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

/**
 * Response object for playlist tracks endpoint
 */
export interface PlaylistTracksResponse {
  href: string;
  items: PlaylistTrackObject[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

/**
 * Response from recommendations endpoint
 */
export interface RecommendationsResponse {
  seeds: {
    afterFilteringSize: number;
    afterRelinkingSize: number;
    href: string;
    id: string;
    initialPoolSize: number;
    type: string;
  }[];
  tracks: SpotifyTrack[];
}

/**
 * Response from search endpoint
 */
export interface SearchResponse {
  tracks?: {
    href: string;
    items: SpotifyTrack[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  artists?: {
    href: string;
    items: SpotifyArtist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  albums?: {
    href: string;
    items: any[]; // Simplified album objects
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  playlists?: {
    href: string;
    items: SpotifyPlaylist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}
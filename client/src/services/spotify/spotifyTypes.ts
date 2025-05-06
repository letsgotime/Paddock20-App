/**
 * Spotify API TypeScript Interfaces
 * 
 * This file contains all TypeScript interfaces for the Spotify API.
 * Reference: https://developer.spotify.com/documentation/web-api/reference
 */

/**
 * Spotify Authentication Response
 * 
 * Returned from the /api/token endpoint when exchanging an authorization code 
 * or refreshing a token
 */
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string; // Always "Bearer"
  expires_in: number; // Token lifetime in seconds
  refresh_token: string;
  scope: string; // Space-separated list of scopes
}

/**
 * Spotify User Profile
 * 
 * Returned from the /me endpoint
 */
export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  images: SpotifyImage[];
  product: string; // "premium", "free", etc.
  uri: string;
  country: string;
  followers: {
    href: string | null;
    total: number;
  };
}

/**
 * Spotify Image
 * 
 * Used in various API responses to represent images
 */
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

/**
 * Spotify Playlist Object
 * 
 * Represents a Spotify playlist
 */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  href: string;
  uri: string;
  collaborative: boolean;
  public: boolean;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
    uri: string;
    href: string;
  };
  tracks: {
    href: string;
    total: number;
    items?: SpotifyPlaylistTrack[];
  };
  snapshot_id: string;
  followers: {
    href: string | null;
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

/**
 * Spotify Playlist Track Object
 * 
 * Represents a track in a playlist, including additional metadata
 */
export interface SpotifyPlaylistTrack {
  added_at: string;
  added_by: {
    id: string;
    uri: string;
    href: string;
  };
  is_local: boolean;
  track: SpotifyTrack;
}

/**
 * Spotify Track Object
 * 
 * Represents a Spotify track
 */
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  href: string;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  popularity: number;
  track_number: number;
  disc_number: number;
  is_playable?: boolean;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
}

/**
 * Spotify Artist Object
 * 
 * Represents a Spotify artist
 */
export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  href: string;
  genres?: string[];
  popularity?: number;
  images?: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
  followers?: {
    href: string | null;
    total: number;
  };
}

/**
 * Spotify Album Object
 * 
 * Represents a Spotify album
 */
export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  href: string;
  album_type: 'album' | 'single' | 'compilation';
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  total_tracks: number;
  external_urls: {
    spotify: string;
  };
}

/**
 * Spotify Playlist Response
 * 
 * Paginated response containing playlists
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
 * Spotify Playlist Tracks Response
 * 
 * Paginated response containing tracks in a playlist
 */
export interface PlaylistTracksResponse {
  href: string;
  items: SpotifyPlaylistTrack[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

/**
 * Spotify Recommendations Response
 * 
 * Response from recommendations endpoint
 */
export interface RecommendationsResponse {
  tracks: SpotifyTrack[];
  seeds: RecommendationSeed[];
}

/**
 * Spotify Recommendation Seed
 * 
 * Information about seeds used for recommendations
 */
export interface RecommendationSeed {
  id: string;
  href: string;
  type: 'ARTIST' | 'TRACK' | 'GENRE';
  initialPoolSize: number;
  afterFilteringSize: number;
  afterRelinkingSize: number;
}

/**
 * Spotify Search Response
 * 
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
    items: SpotifyAlbum[];
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

/**
 * Spotify Drive Playlist
 * 
 * Custom interface for drive-specific playlists
 */
export interface DrivePlaylist extends SpotifyPlaylist {
  driveId?: string;      // ID of the drive this playlist is associated with
  driveName?: string;    // Name of the drive
  driveDate?: string;    // Date of the drive
  driveRoute?: string;   // Route information
  driveDistance?: number; // Distance of the drive in miles/km
  driveDuration?: number; // Duration of the drive in minutes
}
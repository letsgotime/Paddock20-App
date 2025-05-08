/**
 * Spotify API Service
 * 
 * Handles all Spotify API interactions
 */

import spotifyAuth from './spotifyAuth';
import {
  SpotifyProfile,
  SpotifyPlaylist,
  SpotifyTrack,
  PlaylistResponse,
  PlaylistTracksResponse,
  RecommendationsResponse,
  SearchResponse,
  DrivePlaylist
} from './spotifyTypes';

// Base API URL for Spotify Web API
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Make an authenticated request to the Spotify API
 */
async function spotifyFetch<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  // Get a valid access token
  const accessToken = await spotifyAuth.getAccessToken();
  
  if (!accessToken) {
    throw new Error('No Spotify access token available. User may need to authenticate.');
  }
  
  // Construct request options
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    // Add body for non-GET requests
    ...(method !== 'GET' && body ? { body: JSON.stringify(body) } : {})
  };
  
  // Make the request
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${endpoint}`, options);
  
  // Handle errors
  if (!response.ok) {
    let errorMessage = `Spotify API error: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = `${errorMessage} - ${errorData.error?.message || 'Unknown error'}`;
    } catch (e) {
      // If parsing fails, just use the status code
    }
    
    throw new Error(errorMessage);
  }
  
  // For 204 No Content responses, return empty object
  if (response.status === 204) {
    return {} as T;
  }
  
  // Parse the response
  return await response.json() as T;
}

/**
 * Get current user's Spotify profile
 */
export async function getCurrentUserProfile(): Promise<SpotifyProfile> {
  return await spotifyFetch<SpotifyProfile>('/me');
}

/**
 * Get user's playlists
 * @param limit Optional maximum number of playlists to return
 * @param offset Optional offset for pagination
 */
export async function getUserPlaylists(limit = 50, offset = 0): Promise<PlaylistResponse> {
  return await spotifyFetch<PlaylistResponse>(`/me/playlists?limit=${limit}&offset=${offset}`);
}

/**
 * Get a specific playlist by ID
 * @param playlistId The Spotify ID of the playlist
 */
export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  return await spotifyFetch<SpotifyPlaylist>(`/playlists/${playlistId}`);
}

/**
 * Get tracks from a playlist
 * @param playlistId The Spotify ID of the playlist
 * @param limit Optional maximum number of tracks to return
 * @param offset Optional offset for pagination
 */
export async function getPlaylistTracks(
  playlistId: string,
  limit = 100,
  offset = 0
): Promise<PlaylistTracksResponse> {
  return await spotifyFetch<PlaylistTracksResponse>(
    `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
  );
}

/**
 * Create a new playlist
 * @param userId The Spotify user ID
 * @param name The name of the playlist
 * @param description Optional description
 * @param isPublic Whether the playlist should be public (default: false)
 */
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
  isPublic = false
): Promise<SpotifyPlaylist> {
  return await spotifyFetch<SpotifyPlaylist>(
    `/users/${userId}/playlists`,
    'POST',
    {
      name,
      description,
      public: isPublic
    }
  );
}

/**
 * Create a specialized drive playlist
 * @param userId Spotify user ID
 * @param driveName Name of the drive/route
 * @param driveDuration Estimated duration of the drive in minutes
 * @param seedTracks Array of track IDs to use as seeds
 * @param description Optional description
 */
export async function createDrivePlaylist(
  userId: string,
  driveName: string,
  driveDuration: number,
  seedTracks: string[],
  description?: string
): Promise<DrivePlaylist> {
  // Create an empty playlist first
  const playlist = await createPlaylist(
    userId,
    `${driveName} Drive`,
    description || `Playlist for ${driveName} drive (${driveDuration} min)`,
    false
  );
  
  // Get recommendations based on seed tracks
  const recommendations = await getRecommendations(seedTracks);
  
  // Calculate how many tracks we need to fill the duration
  const targetDurationMs = driveDuration * 60 * 1000; // convert minutes to ms
  let totalDuration = 0;
  const selectedTracks: string[] = [];
  
  // Select tracks until we reach the target duration
  for (const track of recommendations.tracks) {
    selectedTracks.push(track.uri);
    totalDuration += track.duration_ms;
    
    if (totalDuration >= targetDurationMs) {
      break;
    }
  }
  
  // Add the tracks to the playlist
  if (selectedTracks.length > 0) {
    await addTracksToPlaylist(playlist.id, selectedTracks);
  }
  
  // Return the enhanced playlist
  return {
    ...playlist,
    driveName,
    driveDuration
  };
}

/**
 * Add tracks to a playlist
 * @param playlistId The Spotify ID of the playlist
 * @param trackUris Array of Spotify track URIs
 * @param position Optional position to insert tracks
 */
export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[],
  position?: number
): Promise<void> {
  await spotifyFetch(
    `/playlists/${playlistId}/tracks`,
    'POST',
    {
      uris: trackUris,
      position
    }
  );
}

/**
 * Get track recommendations based on seed tracks
 * @param seedTracks Array of track IDs to use as seeds
 * @param limit Optional maximum number of recommendations
 */
export async function getRecommendations(
  seedTracks: string[],
  limit = 50
): Promise<RecommendationsResponse> {
  // Spotify only allows up to 5 seed tracks
  const seeds = seedTracks.slice(0, 5);
  
  return await spotifyFetch<RecommendationsResponse>(
    `/recommendations?limit=${limit}&seed_tracks=${seeds.join(',')}`
  );
}

/**
 * Search Spotify for tracks, artists, albums, or playlists
 * @param query The search query
 * @param types Array of item types to search for (track, artist, album, playlist)
 * @param limit Optional maximum number of results per type
 */
export async function search(
  query: string,
  types: ('track' | 'artist' | 'album' | 'playlist')[],
  limit = 20
): Promise<SearchResponse> {
  const typeParam = types.join(',');
  return await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=${typeParam}&limit=${limit}`
  );
}

/**
 * Get a user's saved tracks
 * @param limit Optional maximum number of tracks
 * @param offset Optional offset for pagination
 */
export async function getSavedTracks(limit = 50, offset = 0): Promise<any> {
  return await spotifyFetch<any>(`/me/tracks?limit=${limit}&offset=${offset}`);
}

/**
 * Get a user's top tracks
 * @param timeRange Time range to get top tracks for (short, medium, or long term)
 * @param limit Optional maximum number of tracks
 */
export async function getTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit = 50
): Promise<any> {
  return await spotifyFetch<any>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
}

/**
 * Check if the user is authenticated with Spotify
 */
export function isAuthenticated(): boolean {
  return spotifyAuth.isAuthenticated();
}

/**
 * Start the Spotify authentication flow
 */
export function startAuthFlow(): void {
  const authUrl = spotifyAuth.getAuthorizationUrl();
  window.location.href = authUrl;
}

/**
 * Logout from Spotify
 */
export function logout(): void {
  spotifyAuth.logout();
}

// Export all functions
export default {
  getCurrentUserProfile,
  getUserPlaylists,
  getPlaylist,
  getPlaylistTracks,
  createPlaylist,
  createDrivePlaylist,
  addTracksToPlaylist,
  getRecommendations,
  search,
  getSavedTracks,
  getTopTracks,
  isAuthenticated,
  startAuthFlow,
  logout
};
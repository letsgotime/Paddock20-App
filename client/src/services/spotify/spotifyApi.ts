/**
 * Spotify API Service
 * Handles interactions with the Spotify Web API
 */
import { getAccessToken } from './spotifyAuth';
import {
  SpotifyPlaylist,
  SpotifyProfile,
  SpotifyTrack,
  DrivePlaylist
} from './spotifyTypes';

// Constants
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const API_BASE = '/api/spotify';  // Our backend proxy endpoint

/**
 * Makes an authenticated request to the Spotify API
 */
const spotifyApiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated with Spotify');
  }
  
  const url = endpoint.startsWith('https://') ? 
    endpoint : 
    `${SPOTIFY_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid, user needs to re-authenticate
      throw new Error('Spotify session expired. Please reconnect your account.');
    }
    
    if (response.status === 429) {
      // Rate limited
      throw new Error('Too many requests to Spotify. Please try again later.');
    }
    
    try {
      const errorData = await response.json();
      throw new Error(`Spotify API error: ${errorData.error?.message || response.statusText}`);
    } catch (e) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }
  }
  
  return response.json();
};

/**
 * Makes a request to our backend Spotify API proxy
 */
const spotifyBackendRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    } catch (e) {
      throw new Error(`API error: ${response.statusText}`);
    }
  }
  
  return response.json();
};

/**
 * Fetches the user's Spotify playlists
 */
export const getUserPlaylists = async (): Promise<SpotifyPlaylist[]> => {
  try {
    const response = await spotifyApiRequest<{
      items: SpotifyPlaylist[],
      next: string | null
    }>('/me/playlists?limit=50');
    
    let playlists = response.items;
    let nextUrl = response.next;
    
    // Fetch additional playlists if there are more
    while (nextUrl) {
      const moreData = await spotifyApiRequest<{
        items: SpotifyPlaylist[],
        next: string | null
      }>(nextUrl);
      
      playlists = [...playlists, ...moreData.items];
      nextUrl = moreData.next;
    }
    
    return playlists;
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    return [];
  }
};

/**
 * Fetches a specific Spotify playlist by ID
 */
export const getPlaylist = async (id: string): Promise<SpotifyPlaylist | null> => {
  try {
    const playlist = await spotifyApiRequest<SpotifyPlaylist>(`/playlists/${id}?market=from_token`);
    return playlist;
  } catch (error) {
    console.error(`Error fetching playlist ${id}:`, error);
    return null;
  }
};

/**
 * Searches for Spotify playlists by activity
 */
export const getPlaylistsByActivity = async (activity: string, limit = 6): Promise<SpotifyPlaylist[]> => {
  try {
    const { playlists } = await spotifyApiRequest<{
      playlists: {
        items: SpotifyPlaylist[]
      }
    }>(`/search?q=${encodeURIComponent(activity)}&type=playlist&limit=${limit}&market=from_token`);
    
    return playlists.items;
  } catch (error) {
    console.error(`Error searching playlists for activity ${activity}:`, error);
    return [];
  }
};

/**
 * Searches for Spotify playlists by genre
 */
export const getPlaylistsByGenre = async (genre: string, limit = 6): Promise<SpotifyPlaylist[]> => {
  try {
    const { playlists } = await spotifyApiRequest<{
      playlists: {
        items: SpotifyPlaylist[]
      }
    }>(`/search?q=genre:${encodeURIComponent(genre)}&type=playlist&limit=${limit}&market=from_token`);
    
    return playlists.items;
  } catch (error) {
    console.error(`Error searching playlists for genre ${genre}:`, error);
    return [];
  }
};

/**
 * Creates a new Spotify playlist
 */
export const createPlaylist = async (
  name: string,
  description = '',
  isPublic = false
): Promise<SpotifyPlaylist | null> => {
  try {
    // First, get the user's Spotify ID
    const userProfile = await spotifyApiRequest<SpotifyProfile>('/me');
    
    // Create the playlist
    const playlist = await spotifyApiRequest<SpotifyPlaylist>(
      `/users/${userProfile.id}/playlists`,
      'POST',
      {
        name,
        description,
        public: isPublic
      }
    );
    
    return playlist;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
};

/**
 * Adds tracks to a Spotify playlist
 */
export const addTracksToPlaylist = async (
  playlistId: string,
  trackUris: string[]
): Promise<boolean> => {
  try {
    await spotifyApiRequest(
      `/playlists/${playlistId}/tracks`,
      'POST',
      {
        uris: trackUris
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Error adding tracks to playlist ${playlistId}:`, error);
    return false;
  }
};

/**
 * Gets recommendations based on provided seed data
 */
export const getRecommendedTracks = async (
  seedArtists: string[] = [],
  seedTracks: string[] = [],
  seedGenres: string[] = [],
  limit = 20
): Promise<SpotifyTrack[]> => {
  try {
    const params = new URLSearchParams();
    
    if (seedArtists.length) {
      params.append('seed_artists', seedArtists.join(','));
    }
    
    if (seedTracks.length) {
      params.append('seed_tracks', seedTracks.join(','));
    }
    
    if (seedGenres.length) {
      params.append('seed_genres', seedGenres.join(','));
    }
    
    params.append('limit', limit.toString());
    params.append('market', 'from_token');
    
    const response = await spotifyApiRequest<{ tracks: SpotifyTrack[] }>(
      `/recommendations?${params.toString()}`
    );
    
    return response.tracks;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

/**
 * Gets recommended playlists from our backend
 */
export const getRecommendedPlaylists = async (): Promise<SpotifyPlaylist[]> => {
  try {
    return await spotifyBackendRequest<SpotifyPlaylist[]>('/recommended-playlists');
  } catch (error) {
    console.error('Error fetching recommended playlists:', error);
    return [];
  }
};

// Drive Journal specific playlist functions

/**
 * Save a Drive Journal playlist to our backend
 */
export const saveDrivePlaylist = async (playlist: DrivePlaylist): Promise<void> => {
  await spotifyBackendRequest('/drive-playlists', 'POST', playlist);
};

/**
 * Update an existing Drive Journal playlist in our backend
 */
export const updateDrivePlaylist = async (playlistId: string, updates: Partial<DrivePlaylist>): Promise<void> => {
  await spotifyBackendRequest(`/drive-playlists/${playlistId}`, 'PUT', updates);
};

/**
 * Get all Drive Journal playlists for the current user
 */
export const getDrivePlaylistsByUserId = async (): Promise<DrivePlaylist[]> => {
  try {
    return await spotifyBackendRequest<DrivePlaylist[]>('/drive-playlists/user');
  } catch (error) {
    console.error('Error fetching drive playlists:', error);
    return [];
  }
};

/**
 * Get Drive Journal playlists filtered by mood
 */
export const getDrivePlaylistsByMood = async (moods: string[]): Promise<DrivePlaylist[]> => {
  try {
    const moodParams = moods.map(mood => `mood=${encodeURIComponent(mood)}`).join('&');
    return await spotifyBackendRequest<DrivePlaylist[]>(`/drive-playlists/mood?${moodParams}`);
  } catch (error) {
    console.error('Error fetching playlists by mood:', error);
    return [];
  }
};

/**
 * Get Drive Journal playlists filtered by weather condition
 */
export const getDrivePlaylistsByWeather = async (conditions: string[]): Promise<DrivePlaylist[]> => {
  try {
    const weatherParams = conditions.map(condition => `weather=${encodeURIComponent(condition)}`).join('&');
    return await spotifyBackendRequest<DrivePlaylist[]>(`/drive-playlists/weather?${weatherParams}`);
  } catch (error) {
    console.error('Error fetching playlists by weather:', error);
    return [];
  }
};

// Playback control functions

/**
 * Start playing a specific playlist
 */
export const playPlaylist = async (playlistUri: string): Promise<void> => {
  await spotifyApiRequest(
    '/me/player/play',
    'PUT',
    {
      context_uri: playlistUri
    }
  );
};

/**
 * Pause playback
 */
export const pausePlayback = async (): Promise<void> => {
  await spotifyApiRequest('/me/player/pause', 'PUT');
};

/**
 * Resume playback
 */
export const resumePlayback = async (): Promise<void> => {
  await spotifyApiRequest('/me/player/play', 'PUT');
};

/**
 * Get the user's currently playing track
 */
export const getCurrentlyPlaying = async (): Promise<{
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number | null;
  context: { uri: string; type: string } | null;
} | null> => {
  try {
    return await spotifyApiRequest('/me/player/currently-playing');
  } catch (error) {
    console.error('Error getting currently playing track:', error);
    return null;
  }
};
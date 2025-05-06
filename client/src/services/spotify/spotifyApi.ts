/**
 * Spotify API Service
 * Handles all Spotify API requests
 */
import { getStoredTokens, refreshSpotifyToken, needsTokenRefresh } from './spotifyAuth';
import { SpotifyPlaylist, SpotifyProfile, DrivePlaylist } from './spotifyTypes';

/**
 * Base fetch function that handles authorization and refreshing tokens
 */
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
) => {
  // Get tokens
  let tokens = getStoredTokens();
  
  if (!tokens) {
    throw new Error('No Spotify authentication tokens found');
  }
  
  // Check if token needs refresh
  if (needsTokenRefresh()) {
    tokens = await refreshSpotifyToken();
    if (!tokens) {
      throw new Error('Failed to refresh Spotify token');
    }
  }
  
  // Set up headers with auth token
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  
  // Make the API request
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle unauthorized (expired token)
  if (response.status === 401) {
    tokens = await refreshSpotifyToken();
    if (!tokens) {
      throw new Error('Failed to refresh Spotify token after 401');
    }
    
    // Retry with new token
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    return fetch(url, {
      ...options,
      headers
    });
  }
  
  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Spotify API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }
  
  return response;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<SpotifyProfile> => {
  const response = await fetchWithAuth('https://api.spotify.com/v1/me');
  return response.json();
};

/**
 * Get user's playlists
 */
export const getUserPlaylists = async (limit = 50, offset = 0): Promise<SpotifyPlaylist[]> => {
  const response = await fetchWithAuth(
    `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  return data.items;
};

/**
 * Get a specific playlist by ID
 */
export const getPlaylist = async (playlistId: string): Promise<SpotifyPlaylist> => {
  const response = await fetchWithAuth(
    `https://api.spotify.com/v1/playlists/${playlistId}`
  );
  return response.json();
};

/**
 * Search for playlists by term
 */
export const searchPlaylists = async (
  term: string,
  limit = 10
): Promise<SpotifyPlaylist[]> => {
  // URL encode the search term
  const encodedTerm = encodeURIComponent(term);
  
  const response = await fetchWithAuth(
    `https://api.spotify.com/v1/search?q=${encodedTerm}&type=playlist&limit=${limit}`
  );
  const data = await response.json();
  return data.playlists.items;
};

/**
 * Get playlists by genre
 */
export const getPlaylistsByGenre = async (
  genre: string,
  limit = 10
): Promise<SpotifyPlaylist[]> => {
  // Search for playlists with the genre
  return searchPlaylists(`genre:${genre} driving`, limit);
};

/**
 * Get playlists by activity
 */
export const getPlaylistsByActivity = async (
  activity: string,
  limit = 10
): Promise<SpotifyPlaylist[]> => {
  // Customize search query based on activity
  let searchTerm = '';
  
  // Map driving activities to appropriate search terms
  switch (activity.toLowerCase()) {
    case 'track driving':
    case 'track days':
      searchTerm = 'racing driving track day speed';
      break;
    case 'autocross':
      searchTerm = 'autocross racing competition driving';
      break;
    case 'drifting':
    case 'drift racing':
      searchTerm = 'drift drifting racing';
      break;
    case 'rally':
    case 'rally racing':
      searchTerm = 'rally racing driving';
      break;
    case 'off-roading':
    case 'offroad':
      searchTerm = 'offroad adventure driving';
      break;
    case 'car shows':
      searchTerm = 'car show cruising driving';
      break;
    case 'commuting':
      searchTerm = 'commute driving chill';
      break;
    case 'cruising':
      searchTerm = 'cruise driving relaxing road trip';
      break;
    default:
      // Use the activity as the search term
      searchTerm = `${activity} driving`;
  }
  
  return searchPlaylists(searchTerm, limit);
};

/**
 * Create a new playlist for the user
 */
export const createPlaylist = async (
  name: string,
  description = '',
  isPublic = false
): Promise<SpotifyPlaylist> => {
  const user = await getCurrentUser();
  
  const response = await fetchWithAuth(
    `https://api.spotify.com/v1/users/${user.id}/playlists`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic
      })
    }
  );
  
  return response.json();
};

/**
 * Add tracks to a playlist
 */
export const addTracksToPlaylist = async (
  playlistId: string,
  trackUris: string[]
): Promise<void> => {
  await fetchWithAuth(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: trackUris
      })
    }
  );
};

/**
 * Get playlist recommendations based on seed genres
 */
export const getRecommendedPlaylists = async (
  seedGenres: string[],
  limit = 5
): Promise<SpotifyPlaylist[]> => {
  // For each seed genre, get playlists
  const playlistPromises = seedGenres.map(genre => getPlaylistsByGenre(genre, limit));
  const genrePlaylists = await Promise.all(playlistPromises);
  
  // Flatten and deduplicate
  const uniqueIds = new Set<string>();
  const dedupedPlaylists: SpotifyPlaylist[] = [];
  
  genrePlaylists.flat().forEach(playlist => {
    if (!uniqueIds.has(playlist.id)) {
      uniqueIds.add(playlist.id);
      dedupedPlaylists.push(playlist);
    }
  });
  
  // Return up to the limit
  return dedupedPlaylists.slice(0, limit);
};

// Local storage for drive playlists
const DRIVE_PLAYLISTS_KEY = 'paddock20_drive_playlists';

/**
 * Save a drive playlist association
 */
export const saveDrivePlaylist = async (playlist: DrivePlaylist): Promise<void> => {
  // Get existing drive playlists
  const existingData = localStorage.getItem(DRIVE_PLAYLISTS_KEY);
  const drivePlaylists: DrivePlaylist[] = existingData ? JSON.parse(existingData) : [];
  
  // Add new playlist or update existing
  const existingIndex = drivePlaylists.findIndex(p => p.playlistId === playlist.playlistId);
  
  if (existingIndex >= 0) {
    drivePlaylists[existingIndex] = playlist;
  } else {
    drivePlaylists.push(playlist);
  }
  
  // Save back to storage
  localStorage.setItem(DRIVE_PLAYLISTS_KEY, JSON.stringify(drivePlaylists));
};

/**
 * Get drive playlists by user ID
 */
export const getDrivePlaylistsByUserId = async (): Promise<DrivePlaylist[]> => {
  const existingData = localStorage.getItem(DRIVE_PLAYLISTS_KEY);
  return existingData ? JSON.parse(existingData) : [];
};

/**
 * Get drive playlists filtered by mood
 */
export const getDrivePlaylistsByMood = async (moods: string[]): Promise<DrivePlaylist[]> => {
  const allPlaylists = await getDrivePlaylistsByUserId();
  
  return allPlaylists.filter(playlist => 
    playlist.mood.some(m => moods.includes(m.toLowerCase()))
  );
};

/**
 * Get drive playlists filtered by weather conditions
 */
export const getDrivePlaylistsByWeather = async (conditions: string[]): Promise<DrivePlaylist[]> => {
  const allPlaylists = await getDrivePlaylistsByUserId();
  
  return allPlaylists.filter(playlist => 
    playlist.weather.some(w => conditions.includes(w.toLowerCase()))
  );
};

/**
 * Control playback - requires Spotify Premium
 */
export const playPlaylist = async (playlistUri: string): Promise<void> => {
  try {
    await fetchWithAuth(
      'https://api.spotify.com/v1/me/player/play',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context_uri: playlistUri
        })
      }
    );
  } catch (error) {
    console.error('Error starting playback:', error);
    throw new Error('Playback control requires Spotify Premium');
  }
};

/**
 * Pause playback
 */
export const pausePlayback = async (): Promise<void> => {
  try {
    await fetchWithAuth(
      'https://api.spotify.com/v1/me/player/pause',
      { method: 'PUT' }
    );
  } catch (error) {
    console.error('Error pausing playback:', error);
    throw new Error('Playback control requires Spotify Premium');
  }
};

/**
 * Resume playback
 */
export const resumePlayback = async (): Promise<void> => {
  try {
    await fetchWithAuth(
      'https://api.spotify.com/v1/me/player/play',
      { method: 'PUT' }
    );
  } catch (error) {
    console.error('Error resuming playback:', error);
    throw new Error('Playback control requires Spotify Premium');
  }
};
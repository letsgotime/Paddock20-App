import axios from 'axios';

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Interface for API responses
interface SpotifyPlaylistResponse {
  playlists: {
    items: any[];
    total: number;
  };
}

// Spotify API token management
let spotifyToken: string | null = null;
let tokenExpiration: number = 0;

// Get Spotify API token (client credentials flow)
const getToken = async (): Promise<string> => {
  // Check if we have a valid token
  const now = Date.now();
  if (spotifyToken && tokenExpiration > now) {
    return spotifyToken;
  }
  
  try {
    // Request new token from our server endpoint
    const response = await axios.get('/api/spotify/token');
    
    if (response.data && response.data.access_token) {
      spotifyToken = response.data.access_token;
      // Set expiration (convert seconds to milliseconds, subtract 60s buffer)
      tokenExpiration = now + ((response.data.expires_in - 60) * 1000);
      return spotifyToken;
    } else {
      throw new Error('Invalid token response');
    }
  } catch (error) {
    console.error('Error retrieving Spotify token:', error);
    throw error;
  }
};

// Map driving activities to relevant Spotify categories or search terms
const activityToSearchMap: Record<string, string> = {
  'Maintenance': 'focus',
  'Detailing': 'chill',
  'Fun Drives': 'driving',
  'Adding Mods': 'rock',
  'Commute': 'commute',
  'Track Days': 'workout',
  'Car Shows': 'party',
  'Road Trips': 'road trip',
  'Off-Roading': 'adventure',
  'Car Photography': 'instrumental'
};

// Search playlists for a specific driving activity
export const getPlaylistsByActivity = async (activity: string, limit: number = 10): Promise<any[]> => {
  try {
    const token = await getToken();
    const searchTerm = activityToSearchMap[activity] || activity;
    
    // First try to find a matching category
    try {
      const categoryResponse = await axios.get(`${SPOTIFY_API_BASE}/browse/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { limit: 50 }
      });
      
      const categories = categoryResponse.data.categories.items;
      const matchingCategory = categories.find(
        (cat: any) => cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingCategory) {
        const playlistsResponse = await axios.get(
          `${SPOTIFY_API_BASE}/browse/categories/${matchingCategory.id}/playlists`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { limit }
          }
        );
        
        return playlistsResponse.data.playlists.items;
      }
    } catch (error) {
      console.warn('Category search failed, falling back to search API');
    }
    
    // Fallback to search API
    const searchResponse = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        q: `${searchTerm} ${activity}`,
        type: 'playlist',
        limit
      }
    });
    
    return searchResponse.data.playlists.items;
  } catch (error) {
    console.error(`Error fetching playlists for activity "${activity}":`, error);
    throw error;
  }
};

// Get a specific playlist with track details
export const getPlaylistDetails = async (playlistId: string): Promise<any> => {
  try {
    const token = await getToken();
    
    const response = await axios.get(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching playlist details for ID "${playlistId}":`, error);
    throw error;
  }
};

// Get recommendations based on seed tracks, artists, or genres
export const getRecommendations = async (
  seedTracks: string[] = [],
  seedArtists: string[] = [],
  seedGenres: string[] = ['rock', 'pop'],
  limit: number = 20
): Promise<any> => {
  try {
    const token = await getToken();
    
    const response = await axios.get(`${SPOTIFY_API_BASE}/recommendations`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        seed_tracks: seedTracks.join(','),
        seed_artists: seedArtists.join(','),
        seed_genres: seedGenres.join(','),
        limit
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

// Export all functions
export default {
  getPlaylistsByActivity,
  getPlaylistDetails,
  getRecommendations
};
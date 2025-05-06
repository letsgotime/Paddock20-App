import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Spotify API credentials from environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Validate that API credentials are available
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.warn('Spotify API credentials are missing. Spotify integration will not work properly.');
}

// Get Spotify access token using Client Credentials Flow
router.get('/token', async (req, res) => {
  try {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return res.status(500).json({ 
        error: 'Spotify API credentials not configured', 
        message: 'Please contact an administrator to set up Spotify integration.' 
      });
    }

    // Encode client ID and secret for authorization header
    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    // Request token from Spotify API
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', 
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Return token data to client
    return res.json(response.data);
  } catch (error) {
    console.error('Failed to get Spotify token:', error);
    return res.status(500).json({ 
      error: 'Failed to authenticate with Spotify', 
      message: error.message || 'Unknown error' 
    });
  }
});

// Get playlists for a specific activity
router.get('/playlists', async (req, res) => {
  try {
    // Get category name from query parameter
    const { category = 'driving', limit = 10 } = req.query;
    
    // Check if credentials are available
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      // Return mock data for development if no API keys
      return res.json({ 
        playlists: getMockPlaylists(category as string, parseInt(limit as string) || 10)
      });
    }
    
    // Get token first
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', 
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const token = tokenResponse.data.access_token;
    
    // Map driving activities to relevant search terms
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
    
    const searchTerm = activityToSearchMap[category as string] || category;
    
    // Search for playlists
    const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
      headers: { 'Authorization': `Bearer ${token}` },
      params: {
        q: `${searchTerm}`,
        type: 'playlist',
        limit: limit
      }
    });
    
    return res.json({ playlists: searchResponse.data.playlists.items });
  } catch (error) {
    console.error('Failed to fetch Spotify playlists:', error);
    
    // Fallback to mock data if API request fails
    const { category = 'driving', limit = 10 } = req.query;
    return res.json({ 
      playlists: getMockPlaylists(category as string, parseInt(limit as string) || 10)
    });
  }
});

// Mock data function for development and when API keys are missing
function getMockPlaylists(category: string, limit: number) {
  // Base set of mock playlists
  const mockPlaylists = [
    {
      id: 'playlist1',
      name: 'Ultimate Driving Mix',
      description: 'Perfect tracks for hitting the open road',
      images: [{ url: '/assets/playlist-covers/driving.jpg' }],
      external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd' },
      tracks: { total: 50 }
    },
    {
      id: 'playlist2',
      name: 'Garage Workshop Classics',
      description: 'Rock classics for working on your ride',
      images: [{ url: '/assets/playlist-covers/workshop.jpg' }],
      external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0' },
      tracks: { total: 45 }
    },
    {
      id: 'playlist3',
      name: 'Detail Session',
      description: 'Chill beats for when you're detailing your car',
      images: [{ url: '/assets/playlist-covers/detail.jpg' }],
      external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS' },
      tracks: { total: 42 }
    },
    {
      id: 'playlist4',
      name: 'Track Day Adrenaline',
      description: 'High-energy tracks for track days',
      images: [{ url: '/assets/playlist-covers/track.jpg' }],
      external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4eRPd9frC1m' },
      tracks: { total: 38 }
    },
    {
      id: 'playlist5',
      name: 'Commute Essentials',
      description: 'Make your daily drive more enjoyable',
      images: [{ url: '/assets/playlist-covers/commute.jpg' }],
      external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX9wC1KY45plY' },
      tracks: { total: 55 }
    }
  ];
  
  // Return a subset of the mock playlists
  return mockPlaylists.slice(0, limit);
}

export default router;
/**
 * Spotify API Routes
 * 
 * Handles Spotify OAuth and API proxying
 */
import express from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Validate required environment variables
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.error('Missing required Spotify environment variables');
}

// Spotify API base URL
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Spotify OAuth URLs
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Get redirect URI based on host
function getRedirectUri(req: express.Request): string {
  const host = req.headers.host || 'localhost:5000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/spotify/callback`;
}

/**
 * Start Spotify OAuth flow
 */
router.get('/authorize', requireAuth, (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = getRedirectUri(req);
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private', 
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public'
  ].join(' ');

  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId!,
    scope: scopes,
    redirect_uri: redirectUri,
    show_dialog: 'true' // Force login dialog
  });

  // Redirect to Spotify authorization page
  res.redirect(`${SPOTIFY_AUTH_URL}?${queryParams.toString()}`);
});

/**
 * Handle callback from Spotify OAuth
 */
router.post('/callback', requireAuth, async (req, res) => {
  const { code } = req.body;
  const redirectUri = getRedirectUri(req);

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange authorization code for access token
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    });

    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(SPOTIFY_TOKEN_URL, params, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Spotify token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

/**
 * Refresh an expired access token
 */
router.post('/refresh-token', requireAuth, async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh token' });
  }

  try {
    // Exchange refresh token for new access token
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token
    });

    const authHeader = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(SPOTIFY_TOKEN_URL, params, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Spotify token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Get current user's profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * Get user's playlists
 */
router.get('/playlists', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const limit = req.query.limit || '50';
    const offset = req.query.offset || '0';
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`${SPOTIFY_API_URL}/me/playlists?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

/**
 * Get a specific playlist
 */
router.get('/playlists/:id', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const playlistId = req.params.id;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`${SPOTIFY_API_URL}/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    } else if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

/**
 * Get tracks for a specific playlist
 */
router.get('/playlists/:id/tracks', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const playlistId = req.params.id;
    const limit = req.query.limit || '100';
    const offset = req.query.offset || '0';
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const response = await axios.get(`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    } else if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
});

/**
 * Create a new playlist
 */
router.post('/playlists', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { name, description = '', public: isPublic = false } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }
    
    // First, get the user's Spotify ID
    const userResponse = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const userId = userResponse.data.id;
    
    // Then create the playlist
    const response = await axios.post(
      `${SPOTIFY_API_URL}/users/${userId}/playlists`,
      {
        name,
        description,
        public: isPublic
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

/**
 * Add tracks to a playlist
 */
router.post('/playlists/:id/tracks', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const playlistId = req.params.id;
    const { uris } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    if (!uris || !Array.isArray(uris) || uris.length === 0) {
      return res.status(400).json({ error: 'Track URIs are required' });
    }
    
    const response = await axios.post(
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      { uris },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    } else if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.status(500).json({ error: 'Failed to add tracks to playlist' });
  }
});

/**
 * Search Spotify
 */
router.get('/search', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const query = req.query.q as string;
    const type = req.query.type as string || 'track,artist,album,playlist';
    const limit = req.query.limit || '20';
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const response = await axios.get(
      `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Failed to search Spotify' });
  }
});

/**
 * Get recommendations
 */
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const seed_tracks = req.query.seed_tracks as string;
    const seed_artists = req.query.seed_artists as string;
    const seed_genres = req.query.seed_genres as string;
    const limit = req.query.limit || '20';
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    if (!seed_tracks && !seed_artists && !seed_genres) {
      return res.status(400).json({ error: 'At least one seed (tracks, artists, or genres) is required' });
    }
    
    let url = `${SPOTIFY_API_URL}/recommendations?limit=${limit}`;
    
    if (seed_tracks) url += `&seed_tracks=${seed_tracks}`;
    if (seed_artists) url += `&seed_artists=${seed_artists}`;
    if (seed_genres) url += `&seed_genres=${seed_genres}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Spotify API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
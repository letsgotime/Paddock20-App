import express from 'express';
import { requireAuth } from '../middleware/auth';
import axios from 'axios';

// Create a new router
const router = express.Router();

// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com/api';

// Middleware to check if Spotify credentials are configured
const checkSpotifyConfig = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return res.status(503).json({
      error: 'Spotify API not configured',
      message: 'Spotify client credentials are not set'
    });
  }
  next();
};

/**
 * Exchange Spotify authorization code for tokens
 * 
 * Route: POST /api/spotify/token
 * Auth required: Yes
 * 
 * Request body:
 * - code: Spotify authorization code
 * - redirect_uri: Redirect URI used in the authorization request
 * 
 * Response:
 * - access_token: Spotify access token
 * - refresh_token: Spotify refresh token
 * - expires_in: Token expiration time in seconds
 * - token_type: Token type (Bearer)
 */
router.post('/token', requireAuth, checkSpotifyConfig, async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    if (!code || !redirect_uri) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required parameters: code and redirect_uri'
      });
    }
    
    // Exchange code for tokens using the authorization code flow
    const tokenResponse = await axios({
      method: 'post',
      url: `${SPOTIFY_AUTH_BASE}/token`,
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    res.json(tokenResponse.data);
  } catch (error) {
    console.error('Error exchanging Spotify code for tokens:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.error || 'Spotify API Error',
        message: error.response.data?.error_description || 'Failed to exchange authorization code'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during Spotify authentication'
    });
  }
});

/**
 * Refresh Spotify access token
 * 
 * Route: POST /api/spotify/refresh
 * Auth required: Yes
 * 
 * Request body:
 * - refresh_token: Spotify refresh token
 * 
 * Response:
 * - access_token: New Spotify access token
 * - expires_in: Token expiration time in seconds
 * - token_type: Token type (Bearer)
 */
router.post('/refresh', requireAuth, checkSpotifyConfig, async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required parameter: refresh_token'
      });
    }
    
    // Refresh the access token
    const tokenResponse = await axios({
      method: 'post',
      url: `${SPOTIFY_AUTH_BASE}/token`,
      params: {
        grant_type: 'refresh_token',
        refresh_token,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    res.json(tokenResponse.data);
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.error || 'Spotify API Error',
        message: error.response.data?.error_description || 'Failed to refresh token'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during token refresh'
    });
  }
});

/**
 * Check if Spotify authentication is valid
 * 
 * Route: GET /api/spotify/check-auth
 * Auth required: Yes
 */
router.get('/check-auth', requireAuth, async (req, res) => {
  try {
    // The auth token should be provided in the Authorization header
    const spotifyToken = req.headers['x-spotify-token'];
    
    if (!spotifyToken || typeof spotifyToken !== 'string') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Spotify token not provided'
      });
    }
    
    // Check token by making a simple request to the Spotify API
    await axios({
      method: 'get',
      url: `${SPOTIFY_API_BASE}/me`,
      headers: {
        'Authorization': `Bearer ${spotifyToken}`
      }
    });
    
    // If the request didn't throw an error, the token is valid
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Error checking Spotify authentication:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Spotify token is invalid or expired'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during authentication check'
    });
  }
});

/**
 * Generic proxy for Spotify API requests
 * 
 * This middleware handles any Spotify API request by proxying it to the Spotify API.
 * The path after /api/spotify/ is appended to the Spotify API base URL.
 * 
 * Route: * (All other routes)
 * Auth required: Yes
 */
router.all('*', requireAuth, async (req, res) => {
  try {
    // Extract the path from the original URL
    // Remove the '/api/spotify' prefix
    const path = req.path;
    
    // Get the Spotify token from the header
    const spotifyToken = req.headers['x-spotify-token'] as string;
    
    if (!spotifyToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Spotify token not provided'
      });
    }
    
    // Forward the request to Spotify API
    const response = await axios({
      method: req.method,
      url: `${SPOTIFY_API_BASE}${path}`,
      headers: {
        'Authorization': `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json'
      },
      params: req.method === 'GET' ? req.query : undefined,
      data: req.method !== 'GET' ? req.body : undefined
    });
    
    // Return the Spotify API response
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying Spotify API request:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during Spotify API request'
    });
  }
});

export default router;
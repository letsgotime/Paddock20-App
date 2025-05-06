import express from 'express';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Environment variables for Spotify integration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Token exchange endpoint
router.post('/token', requireAuth, async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    if (!code || !redirect_uri) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Spotify credentials not configured');
      return res.status(500).json({ error: 'Spotify integration not properly configured' });
    }
    
    // Create authorization header for Spotify API
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }).toString(),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Spotify token exchange error:', errorData);
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to exchange code for tokens',
        details: errorData
      });
    }
    
    const tokenData = await tokenResponse.json();
    res.json(tokenData);
  } catch (error) {
    console.error('Error in Spotify token exchange:', error);
    res.status(500).json({ error: 'Internal server error during token exchange' });
  }
});

// Token refresh endpoint
router.post('/refresh-token', requireAuth, async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Missing refresh token' });
    }
    
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Spotify credentials not configured');
      return res.status(500).json({ error: 'Spotify integration not properly configured' });
    }
    
    // Create authorization header for Spotify API
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    // Exchange refresh token for new access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }).toString(),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Spotify token refresh error:', errorData);
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to refresh access token',
        details: errorData
      });
    }
    
    const tokenData = await tokenResponse.json();
    res.json(tokenData);
  } catch (error) {
    console.error('Error in Spotify token refresh:', error);
    res.status(500).json({ error: 'Internal server error during token refresh' });
  }
});

// Endpoint to check Spotify API connection
router.get('/connection-status', requireAuth, async (req, res) => {
  try {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return res.json({ 
        configured: false,
        message: 'Spotify credentials not configured'
      });
    }
    
    res.json({ 
      configured: true,
      message: 'Spotify API credentials are configured'
    });
  } catch (error) {
    console.error('Error checking Spotify connection status:', error);
    res.status(500).json({ error: 'Error checking Spotify API configuration' });
  }
});

export default router;
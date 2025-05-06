/**
 * Spotify API Routes
 * 
 * Handles Spotify API token exchange and other server-side Spotify interactions
 */
import express from 'express';
import axios from 'axios';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

const router = express.Router();

// Environment variables for Spotify API
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Schema for token exchange request
const tokenExchangeSchema = z.object({
  code: z.string(),
  redirect_uri: z.string().url(),
});

// Schema for token refresh request
const refreshTokenSchema = z.object({
  refresh_token: z.string(),
});

/**
 * Exchange authorization code for access and refresh tokens
 * POST /api/spotify/token
 */
router.post('/token', async (req, res) => {
  try {
    // Validate request body
    const result = tokenExchangeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: result.error.format(),
      });
    }

    const { code, redirect_uri } = result.data;

    // Check if Spotify credentials are configured
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'Spotify API credentials not configured',
      });
    }

    // Exchange code for tokens with Spotify API
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    });

    // Return tokens to client
    res.json(tokenResponse.data);
  } catch (error: any) {
    console.error('Error exchanging Spotify authorization code:', error);
    
    // Return more detailed error info for debugging
    if (error.response) {
      console.error('Spotify API error response:', error.response.data);
      return res.status(error.response.status).json({
        error: 'Error exchanging authorization code',
        details: error.response.data,
      });
    }
    
    res.status(500).json({
      error: 'Failed to exchange authorization code',
    });
  }
});

/**
 * Refresh Spotify access token
 * POST /api/spotify/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    // Validate request body
    const result = refreshTokenSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid refresh token',
        details: result.error.format(),
      });
    }

    const { refresh_token } = result.data;

    // Check if Spotify credentials are configured
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'Spotify API credentials not configured',
      });
    }

    // Exchange refresh token for new access token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'refresh_token',
        refresh_token,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    });

    // Return new tokens to client
    res.json(tokenResponse.data);
  } catch (error: any) {
    console.error('Error refreshing Spotify token:', error);
    
    // Return more detailed error info for debugging
    if (error.response) {
      console.error('Spotify API error response:', error.response.data);
      return res.status(error.response.status).json({
        error: 'Error refreshing token',
        details: error.response.data,
      });
    }
    
    res.status(500).json({
      error: 'Failed to refresh token',
    });
  }
});

/**
 * Get recommended playlists
 * Requires authentication
 * GET /api/spotify/recommended-playlists
 */
router.get('/recommended-playlists', requireAuth, async (req, res) => {
  try {
    // Get recommended playlists from database
    // This is where you would implement your recommendation logic
    // or retrieve curated playlists from your database
    
    // For now, returning a placeholder response
    res.json([]);
  } catch (error) {
    console.error('Error getting recommended playlists:', error);
    res.status(500).json({ error: 'Failed to get recommended playlists' });
  }
});

/**
 * Save a drive playlist
 * Requires authentication
 * POST /api/spotify/drive-playlists
 */
router.post('/drive-playlists', requireAuth, async (req, res) => {
  try {
    // TODO: Save the drive playlist to the database
    // This would typically create an entry in a drive_playlists table
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving drive playlist:', error);
    res.status(500).json({ error: 'Failed to save drive playlist' });
  }
});

/**
 * Update a drive playlist
 * Requires authentication
 * PUT /api/spotify/drive-playlists/:id
 */
router.put('/drive-playlists/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Update the drive playlist in the database
    // This would typically update an entry in a drive_playlists table
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating drive playlist:', error);
    res.status(500).json({ error: 'Failed to update drive playlist' });
  }
});

/**
 * Get drive playlists for the current user
 * Requires authentication
 * GET /api/spotify/drive-playlists/user
 */
router.get('/drive-playlists/user', requireAuth, async (req, res) => {
  try {
    // Get user's drive playlists from database
    // For now, returning an empty array
    res.json([]);
  } catch (error) {
    console.error('Error getting drive playlists:', error);
    res.status(500).json({ error: 'Failed to get drive playlists' });
  }
});

/**
 * Get drive playlists by mood
 * Requires authentication
 * GET /api/spotify/drive-playlists/mood?mood=energetic&mood=chill
 */
router.get('/drive-playlists/mood', requireAuth, async (req, res) => {
  try {
    const moods = [req.query.mood].flat().filter(Boolean) as string[];
    
    if (!moods.length) {
      return res.status(400).json({ error: 'At least one mood is required' });
    }
    
    // Get drive playlists by mood from database
    // For now, returning an empty array
    res.json([]);
  } catch (error) {
    console.error('Error getting drive playlists by mood:', error);
    res.status(500).json({ error: 'Failed to get drive playlists by mood' });
  }
});

/**
 * Get drive playlists by weather condition
 * Requires authentication
 * GET /api/spotify/drive-playlists/weather?weather=sunny&weather=rainy
 */
router.get('/drive-playlists/weather', requireAuth, async (req, res) => {
  try {
    const conditions = [req.query.weather].flat().filter(Boolean) as string[];
    
    if (!conditions.length) {
      return res.status(400).json({ error: 'At least one weather condition is required' });
    }
    
    // Get drive playlists by weather condition from database
    // For now, returning an empty array
    res.json([]);
  } catch (error) {
    console.error('Error getting drive playlists by weather:', error);
    res.status(500).json({ error: 'Failed to get drive playlists by weather' });
  }
});

export default router;
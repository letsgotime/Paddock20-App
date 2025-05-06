/**
 * Spotify Authentication Service
 * Handles OAuth flow and token management
 */
import { SpotifyTokens, SpotifyProfile } from './spotifyTypes';

// Constants for Spotify Auth
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/spotify-callback`;
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-library-read',
  'user-library-modify'
].join(' ');

// Token storage keys
const ACCESS_TOKEN_KEY = 'paddock20_spotify_access_token';
const REFRESH_TOKEN_KEY = 'paddock20_spotify_refresh_token';
const EXPIRES_AT_KEY = 'paddock20_spotify_expires_at';

/**
 * Generates a random string for PKCE state
 */
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Generates a code challenge for PKCE
 */
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Initiates Spotify OAuth flow
 */
export const initiateSpotifyAuth = async (): Promise<void> => {
  if (!CLIENT_ID) {
    throw new Error('Spotify Client ID not configured');
  }
  
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store code verifier for later use
  localStorage.setItem('paddock20_spotify_code_verifier', codeVerifier);
  
  // Generate random state for security
  const state = generateRandomString(16);
  localStorage.setItem('paddock20_spotify_auth_state', state);
  
  // Build authorization URL
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', SCOPES);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('code_challenge', codeChallenge);
  
  // Redirect to Spotify auth
  window.location.href = authUrl.toString();
};

/**
 * Handles redirect back from Spotify authorization
 */
export const handleSpotifyRedirect = async (): Promise<SpotifyTokens | null> => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  // Check for errors
  if (error) {
    console.error('Spotify authorization error:', error);
    throw new Error(`Spotify authorization failed: ${error}`);
  }
  
  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem('paddock20_spotify_auth_state');
  if (!state || state !== storedState) {
    throw new Error('Spotify state mismatch. Authorization may have been tampered with.');
  }
  
  // Clean up state
  localStorage.removeItem('paddock20_spotify_auth_state');
  
  if (!code) {
    return null;
  }
  
  // Exchange code for tokens using PKCE
  const codeVerifier = localStorage.getItem('paddock20_spotify_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier missing. Cannot complete authentication.');
  }
  
  localStorage.removeItem('paddock20_spotify_code_verifier');
  
  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Calculate token expiration time
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Store tokens
    const tokens: SpotifyTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt
    };
    
    saveTokens(tokens);
    return tokens;
    
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
};

/**
 * Refreshes the access token when expired
 */
export const refreshSpotifyToken = async (): Promise<SpotifyTokens | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    });
    
    if (!response.ok) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(EXPIRES_AT_KEY);
      return null;
    }
    
    const tokenData = await response.json();
    
    // Calculate new expiration time
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Create new tokens object, preserving the refresh token if not returned
    const tokens: SpotifyTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken, // Use existing refresh token if not provided
      expiresAt
    };
    
    saveTokens(tokens);
    return tokens;
    
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return null;
  }
};

/**
 * Saves tokens to localStorage
 */
export const saveTokens = (tokens: SpotifyTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(EXPIRES_AT_KEY, tokens.expiresAt.toString());
};

/**
 * Gets tokens from localStorage
 */
export const getStoredTokens = (): SpotifyTokens | null => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);
  
  if (!accessToken || !refreshToken || !expiresAtStr) {
    return null;
  }
  
  return {
    accessToken,
    refreshToken,
    expiresAt: parseInt(expiresAtStr, 10)
  };
};

/**
 * Checks if token needs refresh
 */
export const needsTokenRefresh = (): boolean => {
  const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);
  
  if (!expiresAtStr) {
    return true;
  }
  
  const expiresAt = parseInt(expiresAtStr, 10);
  const currentTime = Date.now();
  
  // Refresh if token expires in less than 5 minutes
  return (expiresAt - currentTime) < (5 * 60 * 1000);
};

/**
 * Clears all Spotify auth data
 */
export const clearSpotifyAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
};

/**
 * Gets the current user's Spotify profile
 */
export const getSpotifyUserProfile = async (): Promise<SpotifyProfile | null> => {
  let tokens = getStoredTokens();
  
  if (!tokens) {
    return null;
  }
  
  // Check if token needs refresh
  if (needsTokenRefresh()) {
    tokens = await refreshSpotifyToken();
    if (!tokens) {
      return null;
    }
  }
  
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token might be invalid, try refreshing
        tokens = await refreshSpotifyToken();
        if (!tokens) {
          return null;
        }
        
        // Retry with new token
        return getSpotifyUserProfile();
      }
      throw new Error(`Failed to get user profile: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error getting Spotify user profile:', error);
    return null;
  }
};

/**
 * Checks if user is authenticated with Spotify
 */
export const isSpotifyAuthenticated = async (): Promise<boolean> => {
  const tokens = getStoredTokens();
  
  if (!tokens) {
    return false;
  }
  
  // Validate by checking user profile
  const profile = await getSpotifyUserProfile();
  return !!profile;
};
/**
 * Spotify Authentication Service
 * Manages Spotify authentication flow and token management
 */
import { SpotifyTokens, SpotifyProfile } from './spotifyTypes';

// Configuration constants
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 
  `${window.location.origin}/spotify/callback`;

// Required scopes for the application
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-currently-playing',
  'user-modify-playback-state'
].join(' ');

// Local storage keys
const ACCESS_TOKEN_KEY = 'paddock20_spotify_access_token';
const REFRESH_TOKEN_KEY = 'paddock20_spotify_refresh_token';
const EXPIRES_AT_KEY = 'paddock20_spotify_expires_at';
const SPOTIFY_PROFILE_KEY = 'paddock20_spotify_profile';

/**
 * Initiates the Spotify authentication flow by redirecting to Spotify login
 */
export const initiateSpotifyAuth = async (): Promise<void> => {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error('Spotify Client ID is not configured');
  }

  // Generate a random state for security
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('spotify_auth_state', state);

  // Prepare authentication URL with all required parameters
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', SPOTIFY_SCOPES);
  authUrl.searchParams.append('show_dialog', 'true');

  // Redirect the user to Spotify login
  window.location.href = authUrl.toString();
};

/**
 * Handles the redirect from Spotify after authentication
 * Exchanges the authorization code for access and refresh tokens
 */
export const handleSpotifyRedirect = async (): Promise<SpotifyTokens | null> => {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const storedState = localStorage.getItem('spotify_auth_state');
  const error = urlParams.get('error');

  // Clear the stored state
  localStorage.removeItem('spotify_auth_state');

  // Check for errors
  if (error) {
    throw new Error(`Spotify authentication error: ${error}`);
  }

  // Validate state to prevent CSRF attacks
  if (!state || state !== storedState) {
    throw new Error('Spotify authentication failed: invalid state parameter');
  }

  if (!code) {
    throw new Error('Spotify authentication failed: no authorization code received');
  }

  try {
    // Exchange code for tokens using backend proxy to protect client secret
    const response = await fetch('/api/spotify/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    // Calculate expiration time
    const expiresAt = Date.now() + (data.expires_in * 1000);
    
    // Store tokens securely
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
    
    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      expires_at: expiresAt,
      scope: data.scope
    };
    
    // Fetch and store user profile
    const profile = await fetchUserProfile(tokens.access_token);
    localStorage.setItem(SPOTIFY_PROFILE_KEY, JSON.stringify(profile));
    
    return tokens;
  } catch (error) {
    console.error('Error handling Spotify redirect:', error);
    clearSpotifyAuth();
    throw error;
  }
};

/**
 * Refreshes the access token using the refresh token
 */
export const refreshAccessToken = async (): Promise<SpotifyTokens | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    clearSpotifyAuth();
    return null;
  }
  
  try {
    const response = await fetch('/api/spotify/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token refresh failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    // Calculate expiration time
    const expiresAt = Date.now() + (data.expires_in * 1000);
    
    // Update stored tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
    
    // If a new refresh token was provided, update it
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }
    
    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_in: data.expires_in,
      expires_at: expiresAt,
      scope: data.scope
    };
    
    return tokens;
  } catch (error) {
    console.error('Error refreshing Spotify access token:', error);
    clearSpotifyAuth();
    return null;
  }
};

/**
 * Checks if the user is authenticated with Spotify
 * Refreshes the token if needed
 */
export const isSpotifyAuthenticated = async (): Promise<boolean> => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!accessToken || !expiresAtStr || !refreshToken) {
    return false;
  }
  
  const expiresAt = parseInt(expiresAtStr, 10);
  const now = Date.now();
  
  // If token is expired or about to expire (within 5 minutes), refresh it
  if (now >= expiresAt - 5 * 60 * 1000) {
    const tokens = await refreshAccessToken();
    return !!tokens;
  }
  
  return true;
};

/**
 * Gets the current access token, refreshing if necessary
 */
export const getAccessToken = async (): Promise<string | null> => {
  const isAuthenticated = await isSpotifyAuthenticated();
  
  if (!isAuthenticated) {
    return null;
  }
  
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Fetches the user's Spotify profile
 */
export const fetchUserProfile = async (accessToken: string): Promise<SpotifyProfile> => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return {
    id: data.id,
    display_name: data.display_name || data.id,
    email: data.email || '',
    images: data.images || [],
    external_urls: data.external_urls,
    country: data.country,
    product: data.product,
    profileUrl: data.external_urls?.spotify || `https://open.spotify.com/user/${data.id}`
  };
};

/**
 * Gets the user's Spotify profile from cache or fetches if needed
 */
export const getSpotifyUserProfile = async (): Promise<SpotifyProfile | null> => {
  // Try to get from localStorage first
  const profileStr = localStorage.getItem(SPOTIFY_PROFILE_KEY);
  
  if (profileStr) {
    try {
      return JSON.parse(profileStr);
    } catch (e) {
      console.error('Error parsing stored Spotify profile:', e);
    }
  }
  
  // If not in localStorage or parsing failed, fetch it
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const profile = await fetchUserProfile(accessToken);
    localStorage.setItem(SPOTIFY_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch (e) {
    console.error('Error fetching Spotify profile:', e);
    return null;
  }
};

/**
 * Clears all Spotify authentication data
 */
export const clearSpotifyAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(SPOTIFY_PROFILE_KEY);
  localStorage.removeItem('spotify_auth_state');
};
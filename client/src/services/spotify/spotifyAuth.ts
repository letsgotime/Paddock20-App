/**
 * Spotify Authentication Service
 * 
 * Handles Spotify OAuth flow and token management
 */
import axios from 'axios';
import { SpotifyTokenResponse } from './spotifyTypes';

// Authentication state keys
const SPOTIFY_TOKEN_KEY = 'paddock20_spotify_auth_token';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'paddock20_spotify_auth_expiry';
const SPOTIFY_REFRESH_TOKEN_KEY = 'paddock20_spotify_auth_refresh_token';

/**
 * SpotifyAuth class to handle Spotify authentication
 */
export class SpotifyAuth {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;

  constructor() {
    // Try to load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem(SPOTIFY_TOKEN_KEY);
      this.refreshToken = localStorage.getItem(SPOTIFY_REFRESH_TOKEN_KEY);
      const expiryString = localStorage.getItem(SPOTIFY_TOKEN_EXPIRY_KEY);
      this.expiresAt = expiryString ? parseInt(expiryString, 10) : 0;
    } catch (error) {
      console.error('Error loading Spotify tokens from storage:', error);
      this.clearTokens();
    }
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage(): void {
    try {
      if (this.accessToken) {
        localStorage.setItem(SPOTIFY_TOKEN_KEY, this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem(SPOTIFY_REFRESH_TOKEN_KEY, this.refreshToken);
      }
      localStorage.setItem(SPOTIFY_TOKEN_EXPIRY_KEY, this.expiresAt.toString());
    } catch (error) {
      console.error('Error saving Spotify tokens to storage:', error);
    }
  }

  /**
   * Clear all tokens from memory and storage
   */
  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    
    try {
      localStorage.removeItem(SPOTIFY_TOKEN_KEY);
      localStorage.removeItem(SPOTIFY_REFRESH_TOKEN_KEY);
      localStorage.removeItem(SPOTIFY_TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing Spotify tokens from storage:', error);
    }
  }

  /**
   * Check if we have a valid token
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken && this.expiresAt > Date.now();
  }

  /**
   * Get the current access token, refreshing if necessary
   */
  public async getAccessToken(): Promise<string | null> {
    // If no access token, we can't do anything
    if (!this.accessToken) {
      return null;
    }

    // If token is expired and we have a refresh token, try to refresh
    if (this.expiresAt <= Date.now() && this.refreshToken) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
      }
    }

    return this.accessToken;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post('/api/spotify/refresh-token', {
        refresh_token: this.refreshToken
      });

      this.handleTokenResponse(response.data);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, clear tokens and force re-authentication
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Handle the token response from either initial authorization or refresh
   */
  public handleTokenResponse(tokenResponse: SpotifyTokenResponse): void {
    this.accessToken = tokenResponse.access_token;
    
    // Only update refresh token if provided (not always included in refresh responses)
    if (tokenResponse.refresh_token) {
      this.refreshToken = tokenResponse.refresh_token;
    }
    
    // Calculate expiry time (current time + expires_in seconds)
    this.expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    
    // Save tokens to storage
    this.saveTokensToStorage();
  }

  /**
   * Start the Spotify authorization flow
   */
  public authorize(): void {
    // Redirect to our server route that starts the OAuth flow
    window.location.href = '/api/spotify/authorize';
  }

  /**
   * Handle the callback from Spotify OAuth
   */
  public async handleCallback(code: string): Promise<boolean> {
    try {
      const response = await axios.post('/api/spotify/callback', { code });
      this.handleTokenResponse(response.data);
      return true;
    } catch (error) {
      console.error('Error handling Spotify callback:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const spotifyAuth = new SpotifyAuth();
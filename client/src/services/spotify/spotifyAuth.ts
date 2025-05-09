import { SpotifyTokenResponse } from './spotifyTypes';

/**
 * SpotifyAuth Class
 * 
 * Manages Spotify authentication flow and token storage
 */
class SpotifyAuth {
  private static instance: SpotifyAuth;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private clientId: string;
  private redirectUri: string;
  private readonly STORAGE_KEY = 'paddock20_spotify_auth';

  private constructor() {
    // Read client ID from environment
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
    
    // Use a fixed redirect URI that matches exactly what's registered in Spotify Developer Dashboard
    // This should be the exact URL registered in your Spotify app settings
    this.redirectUri = 'https://b3a4f353-dfcc-4127-ba8c-8d58ee1363a3-00-1h7svyzt8skoi.kirk.replit.dev/spotify/callback';

    // Load any existing tokens from storage
    this.loadFromStorage();
    
    // Validate imported config
    if (!this.clientId) {
      console.warn('Spotify Client ID not configured');
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SpotifyAuth {
    if (!SpotifyAuth.instance) {
      SpotifyAuth.instance = new SpotifyAuth();
    }
    return SpotifyAuth.instance;
  }

  /**
   * Load tokens from storage if they exist
   */
  private loadFromStorage(): void {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (authData) {
        const { accessToken, refreshToken, expiresAt } = JSON.parse(authData);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
      }
    } catch (error) {
      console.error('Error loading Spotify auth from storage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Save tokens to storage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          expiresAt: this.expiresAt,
        })
      );
    } catch (error) {
      console.error('Error saving Spotify auth to storage:', error);
    }
  }

  /**
   * Generate Spotify authorization URL for login
   */
  public getAuthorizationUrl(): string {
    if (!this.clientId) {
      throw new Error('Spotify Client ID not configured');
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-library-modify',
      'user-top-read',
      'user-read-recently-played'
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      show_dialog: 'true' // Force show dialog even if previously authenticated
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  public async exchangeCode(code: string): Promise<boolean> {
    try {
      // Use our backend proxy to handle token exchange 
      // (requires server-side endpoint)
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirect_uri: this.redirectUri }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const data: SpotifyTokenResponse = await response.json();
      
      // Store tokens
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || this.refreshToken;
      this.expiresAt = Date.now() + data.expires_in * 1000;
      
      // Save to localStorage
      this.saveToStorage();
      
      return true;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    try {
      // Use our backend proxy to handle token refresh
      const response = await fetch('/api/spotify/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data: SpotifyTokenResponse = await response.json();
      
      // Update tokens
      this.accessToken = data.access_token;
      
      // Some implementations don't return a new refresh token, so only update if one is returned
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }
      
      this.expiresAt = Date.now() + data.expires_in * 1000;
      
      // Save to storage
      this.saveToStorage();
      
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  }

  /**
   * Get access token, refreshing if necessary
   */
  public async getAccessToken(): Promise<string | null> {
    // Check if token is expired or about to expire (5 minute buffer)
    if (this.accessToken && this.expiresAt > Date.now() + 300000) {
      return this.accessToken;
    }

    // Token expired, try to refresh
    if (this.refreshToken) {
      const success = await this.refreshAccessToken();
      if (success) {
        return this.accessToken;
      }
    }

    return null;
  }

  /**
   * Check if user is authenticated with Spotify
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken && this.expiresAt > Date.now();
  }

  /**
   * Logout from Spotify
   */
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export default SpotifyAuth.getInstance();
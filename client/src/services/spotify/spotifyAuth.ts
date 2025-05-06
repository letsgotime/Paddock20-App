import { SpotifyTokenResponse } from './spotifyTypes';

/**
 * SpotifyAuth Class
 * 
 * Handles Spotify authentication flows and token management
 */
export class SpotifyAuth {
  // Spotify authorization parameters
  private clientId: string;
  private redirectUri: string;
  private scopes: string[];
  private spotifyAuthUrl: string;
  
  // Token storage keys
  private readonly ACCESS_TOKEN_KEY = 'spotify_access_token';
  private readonly REFRESH_TOKEN_KEY = 'spotify_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
  
  /**
   * Constructor
   * 
   * Initializes the Spotify authentication service with default parameters
   */
  constructor() {
    // Client ID should be managed securely on the server
    // For now, set as empty as it will be handled by the backend proxy
    this.clientId = '';
    
    // Configure redirect URI to our app's callback page
    this.redirectUri = this.getRedirectUri();
    
    // Define needed Spotify API scopes
    this.scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-top-read',
      'user-read-recently-played'
    ];
    
    // Spotify authorization endpoint
    this.spotifyAuthUrl = 'https://accounts.spotify.com/authorize';
  }
  
  /**
   * Generate the redirect URI for Spotify OAuth callback
   * 
   * This builds the callback URL based on the current origin
   * and the callback route in our application
   */
  public getRedirectUri(): string {
    // Match the route defined in App.tsx
    return `${window.location.origin}/spotify/callback`;
  }
  
  /**
   * Initiate Spotify authorization flow
   * 
   * Redirects the user to Spotify's authorization page
   * Can include state information for security & return path
   */
  public authorize(returnTo: string = '/'): void {
    // Create a state parameter to include return path and prevent CSRF
    const state = JSON.stringify({
      returnTo,
      nonce: Math.random().toString(36).substring(2, 15)
    });
    
    // Build the authorization URL with all required parameters
    const authUrl = new URL(this.spotifyAuthUrl);
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', this.scopes.join(' '));
    authUrl.searchParams.append('state', encodeURIComponent(state));
    authUrl.searchParams.append('show_dialog', 'true'); // Force login dialog
    
    // Redirect to Spotify authorization page
    window.location.href = authUrl.toString();
  }
  
  /**
   * Save token data to local storage
   * 
   * Stores access token, refresh token, and expiry time
   */
  public saveTokens(tokenData: SpotifyTokenResponse): void {
    const expiryTime = Date.now() + (tokenData.expires_in * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }
  
  /**
   * Get the stored access token
   * 
   * Returns null if no token is stored
   */
  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  /**
   * Get the stored refresh token
   * 
   * Returns null if no refresh token is stored
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  /**
   * Check if the access token is expired
   * 
   * Returns true if the token exists and is not expired
   */
  public isTokenValid(): boolean {
    const accessToken = this.getAccessToken();
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!accessToken || !expiryTime) {
      return false;
    }
    
    const expiryTimeNum = parseInt(expiryTime, 10);
    // Consider the token invalid if it expires in less than 5 minutes
    return Date.now() < (expiryTimeNum - 5 * 60 * 1000);
  }
  
  /**
   * Clear all stored tokens
   * 
   * Used during logout or when tokens become invalid
   */
  public clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }
  
  /**
   * Check if we have an active Spotify session
   * 
   * Makes a request to our backend to validate the token
   */
  public async checkSession(authToken: string): Promise<boolean> {
    try {
      // Only check if we have a token stored
      if (!this.getAccessToken()) {
        return false;
      }
      
      // Check with the backend if our session is valid
      const response = await fetch('/api/spotify/check-auth', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking Spotify session:', error);
      return false;
    }
  }
}

/**
 * SpotifyApi Class
 * 
 * Handles all Spotify API requests through our backend proxy
 */
export class SpotifyApi {
  private auth: SpotifyAuth;
  
  constructor() {
    this.auth = new SpotifyAuth();
  }
  
  /**
   * Make an authenticated request to our backend Spotify API proxy
   * 
   * @param path - API endpoint path
   * @param method - HTTP method
   * @param body - Request body (for POST/PUT/PATCH)
   * @param authToken - Auth0 token for API authentication
   */
  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    authToken?: string
  ): Promise<T> {
    // Prepare request options
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Add authorization header if token provided
    if (authToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${authToken}`
      };
    }
    
    // Add body for non-GET requests
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    // Make the request to our backend proxy
    const response = await fetch(`/api/spotify${path}`, options);
    
    // Handle errors
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.error || errorData.message || 'Unknown Spotify API error';
      } catch (e) {
        errorText = `Request failed with status ${response.status}`;
      }
      throw new Error(errorText);
    }
    
    // Parse and return response
    return await response.json();
  }
  
  /**
   * Get the current user's Spotify profile
   */
  async getProfile() {
    return this.request('/me');
  }
  
  /**
   * Get a list of the current user's playlists
   */
  async getUserPlaylists() {
    return this.request('/me/playlists');
  }
  
  /**
   * Get details for a specific playlist including tracks
   */
  async getPlaylist(playlistId: string) {
    return this.request(`/playlists/${playlistId}`);
  }
  
  /**
   * Create a new playlist for the current user
   */
  async createPlaylist(name: string, description?: string, isPublic?: boolean) {
    return this.request(
      '/me/playlists',
      'POST',
      { name, description, public: isPublic ?? false }
    );
  }
  
  /**
   * Add tracks to a playlist
   */
  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    return this.request(
      `/playlists/${playlistId}/tracks`,
      'POST',
      { uris: trackUris }
    );
  }
  
  /**
   * Remove tracks from a playlist
   */
  async removeTracksFromPlaylist(playlistId: string, trackUris: string[]) {
    return this.request(
      `/playlists/${playlistId}/tracks`,
      'DELETE',
      { tracks: trackUris.map(uri => ({ uri })) }
    );
  }
  
  /**
   * Search for tracks matching a query
   */
  async searchTracks(query: string, limit: number = 20) {
    return this.request(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
  }
  
  /**
   * Get track recommendations based on seed tracks, artists, or genres
   */
  async getRecommendations(params: {
    seed_tracks?: string[];
    seed_artists?: string[];
    seed_genres?: string[];
    limit?: number;
    target_energy?: number;
    target_tempo?: number;
    target_valence?: number;
  }) {
    // Convert params to query string
    const queryParams = new URLSearchParams();
    
    // Add seeds (need at least one type of seed)
    if (params.seed_tracks?.length) {
      queryParams.append('seed_tracks', params.seed_tracks.join(','));
    }
    
    if (params.seed_artists?.length) {
      queryParams.append('seed_artists', params.seed_artists.join(','));
    }
    
    if (params.seed_genres?.length) {
      queryParams.append('seed_genres', params.seed_genres.join(','));
    }
    
    // Add other parameters
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (typeof params.target_energy === 'number') {
      queryParams.append('target_energy', params.target_energy.toString());
    }
    
    if (typeof params.target_tempo === 'number') {
      queryParams.append('target_tempo', params.target_tempo.toString());
    }
    
    if (typeof params.target_valence === 'number') {
      queryParams.append('target_valence', params.target_valence.toString());
    }
    
    return this.request(`/recommendations?${queryParams.toString()}`);
  }
}
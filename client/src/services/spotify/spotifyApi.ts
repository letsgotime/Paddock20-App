/**
 * Spotify API Service
 * 
 * Provides methods to interact with Spotify APIs
 */
import axios from 'axios';
import { spotifyAuth } from './spotifyAuth';
import {
  SpotifyProfile,
  SpotifyPlaylist,
  PlaylistResponse,
  PlaylistTracksResponse,
  RecommendationsResponse,
  SearchResponse,
  DrivePlaylist
} from './spotifyTypes';

/**
 * SpotifyApi class to interact with Spotify Web API
 */
export class SpotifyApi {
  /**
   * Get the current user's Spotify profile
   */
  public async getProfile(): Promise<SpotifyProfile> {
    return this.apiGet('/api/spotify/me');
  }

  /**
   * Get the current user's playlists
   */
  public async getUserPlaylists(limit = 50, offset = 0): Promise<PlaylistResponse> {
    return this.apiGet(`/api/spotify/playlists?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get a single playlist by ID
   */
  public async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.apiGet(`/api/spotify/playlists/${playlistId}`);
  }

  /**
   * Get tracks from a playlist
   */
  public async getPlaylistTracks(playlistId: string, limit = 100, offset = 0): Promise<PlaylistTracksResponse> {
    return this.apiGet(`/api/spotify/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
  }

  /**
   * Create a new playlist
   */
  public async createPlaylist(name: string, description = '', isPublic = false): Promise<SpotifyPlaylist> {
    return this.apiPost('/api/spotify/playlists', {
      name,
      description,
      public: isPublic
    });
  }

  /**
   * Add tracks to a playlist
   */
  public async addTracksToPlaylist(playlistId: string, uris: string[]): Promise<{ snapshot_id: string }> {
    return this.apiPost(`/api/spotify/playlists/${playlistId}/tracks`, {
      uris
    });
  }

  /**
   * Search Spotify
   */
  public async search(query: string, type = 'track,artist,album,playlist', limit = 20): Promise<SearchResponse> {
    return this.apiGet(`/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
  }

  /**
   * Get music recommendations based on seed tracks, artists, or genres
   */
  public async getRecommendations(
    seed_tracks?: string[],
    seed_artists?: string[],
    seed_genres?: string[],
    limit = 20
  ): Promise<RecommendationsResponse> {
    let params = `limit=${limit}`;
    
    if (seed_tracks && seed_tracks.length > 0) {
      params += `&seed_tracks=${seed_tracks.join(',')}`;
    }
    
    if (seed_artists && seed_artists.length > 0) {
      params += `&seed_artists=${seed_artists.join(',')}`;
    }
    
    if (seed_genres && seed_genres.length > 0) {
      params += `&seed_genres=${seed_genres.join(',')}`;
    }
    
    return this.apiGet(`/api/spotify/recommendations?${params}`);
  }

  /**
   * Create a drive playlist based on mood, weather, and route
   */
  public async createDrivePlaylist(
    driveName: string,
    duration: number, // in minutes
    mood?: string,
    weather?: string,
    route?: string,
    distance?: number,
  ): Promise<DrivePlaylist> {
    const playlist = await this.createPlaylist(
      `${driveName} - Drive Playlist`,
      `Playlist for drive: ${driveName}${weather ? ` (${weather})` : ''}`,
      false
    );
    
    // Now make recommendations based on the mood and populate the playlist
    const seedGenres = this.getMoodBasedGenres(mood);
    const recommendations = await this.getRecommendations(
      undefined,
      undefined,
      seedGenres,
      Math.ceil(duration / 3.5) // Estimate ~3.5 min per track
    );
    
    if (recommendations.tracks.length > 0) {
      await this.addTracksToPlaylist(
        playlist.id,
        recommendations.tracks.map(track => track.uri)
      );
    }
    
    // Extend with drive information
    const drivePlaylist: DrivePlaylist = {
      ...playlist,
      driveName,
      driveRoute: route,
      driveDistance: distance,
      driveDuration: duration
    };
    
    return drivePlaylist;
  }

  /**
   * Helper method to get appropriate genres based on mood
   */
  private getMoodBasedGenres(mood?: string): string[] {
    // Default to energetic driving music
    if (!mood) {
      return ['rock', 'electronic', 'indie'];
    }
    
    switch (mood.toLowerCase()) {
      case 'energetic':
      case 'upbeat':
        return ['dance', 'electronic', 'edm', 'rock'];
      case 'relaxed':
      case 'chill':
        return ['chill', 'ambient', 'acoustic', 'indie'];
      case 'focused':
      case 'concentrated':
        return ['instrumental', 'classical', 'electronic'];
      case 'happy':
      case 'cheerful':
        return ['pop', 'happy', 'funk', 'disco'];
      case 'melancholic':
      case 'sad':
        return ['sad', 'indie', 'alternative', 'folk'];
      default:
        return ['rock', 'pop', 'indie'];
    }
  }

  /**
   * Generic GET request to API
   */
  private async apiGet<T>(url: string): Promise<T> {
    try {
      const token = await spotifyAuth.getAccessToken();
      
      if (!token) {
        throw new Error('Not authenticated with Spotify');
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Spotify API GET error (${url}):`, error);
      throw error;
    }
  }

  /**
   * Generic POST request to API
   */
  private async apiPost<T>(url: string, data: any): Promise<T> {
    try {
      const token = await spotifyAuth.getAccessToken();
      
      if (!token) {
        throw new Error('Not authenticated with Spotify');
      }
      
      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Spotify API POST error (${url}):`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const spotifyApi = new SpotifyApi();
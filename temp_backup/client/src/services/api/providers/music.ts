import { BaseProvider, ProviderResponse } from '../core/provider';
import { ApiRequestConfig } from '../core/types';

/**
 * Represents Last.fm API provider response structures
 */
export interface LastFmArtistInfo {
  name: string;
  mbid?: string;
  url: string;
  image: { '#text': string; size: string }[];
  streamable: string;
  ontour: string;
  stats: {
    listeners: string;
    playcount: string;
  };
  similar: {
    artist: {
      name: string;
      url: string;
      image: { '#text': string; size: string }[];
    }[];
  };
  tags: {
    tag: {
      name: string;
      url: string;
    }[];
  };
  bio: {
    links: {
      link: {
        '#text': string;
        rel: string;
        href: string;
      };
    };
    published: string;
    summary: string;
    content: string;
  };
}

export interface LastFmAlbumInfo {
  name: string;
  artist: string;
  mbid?: string;
  url: string;
  image: { '#text': string; size: string }[];
  listeners: string;
  playcount: string;
  tracks: {
    track: {
      name: string;
      url: string;
      duration: string;
      '@attr'?: { rank: string };
      streamable: { '#text': string; fulltrack: string };
      artist: {
        name: string;
        mbid?: string;
        url: string;
      };
    }[];
  };
  tags: {
    tag: {
      name: string;
      url: string;
    }[];
  };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}

export interface LastFmTrackInfo {
  name: string;
  mbid?: string;
  url: string;
  duration: string;
  streamable: { '#text': string; fulltrack: string };
  listeners: string;
  playcount: string;
  artist: {
    name: string;
    mbid?: string;
    url: string;
  };
  album?: {
    artist: string;
    title: string;
    mbid?: string;
    url: string;
    image: { '#text': string; size: string }[];
    '@attr'?: { position: string };
  };
  toptags: {
    tag: {
      name: string;
      url: string;
    }[];
  };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}

export interface LastFmTopTracks {
  track: {
    name: string;
    duration: string;
    playcount: string;
    listeners: string;
    mbid?: string;
    url: string;
    streamable: { '#text': string; fulltrack: string };
    artist: {
      name: string;
      mbid?: string;
      url: string;
    };
    image: { '#text': string; size: string }[];
    '@attr'?: { rank: string };
  }[];
  '@attr': {
    artist: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}

export interface LastFmSimilarTracks {
  track: {
    name: string;
    playcount: string;
    mbid?: string;
    match: string;
    url: string;
    streamable: { '#text': string; fulltrack: string };
    duration: string;
    artist: {
      name: string;
      mbid?: string;
      url: string;
    };
    image: { '#text': string; size: string }[];
  }[];
  '@attr': {
    artist: string;
    track: string;
  };
}

export interface LastFmSearchResults {
  results: {
    'opensearch:totalResults': string;
    'opensearch:startIndex': string;
    'opensearch:itemsPerPage': string;
    artistmatches?: {
      artist: {
        name: string;
        listeners: string;
        mbid?: string;
        url: string;
        streamable: string;
        image: { '#text': string; size: string }[];
      }[];
    };
    albummatches?: {
      album: {
        name: string;
        artist: string;
        url: string;
        image: { '#text': string; size: string }[];
        streamable: string;
        mbid?: string;
      }[];
    };
    trackmatches?: {
      track: {
        name: string;
        artist: string;
        url: string;
        streamable: string;
        listeners: string;
        image: { '#text': string; size: string }[];
        mbid?: string;
      }[];
    };
    '@attr': {
      for: string;
    };
  };
}

/**
 * Music Provider for integrating with the Last.fm API
 */
export class LastFmProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/';

  constructor() {
    super('lastfm', 'music');
    this.apiKey = process.env.LASTFM_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('LastFM API key not set. Music provider functionality will be limited.');
    }
  }

  /**
   * Builds a Last.fm API request URL with parameters
   */
  private buildUrl(method: string, params: Record<string, string>): string {
    const url = new URL(this.baseUrl);
    url.searchParams.append('method', method);
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('format', 'json');
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    return url.toString();
  }

  /**
   * Gets information about an artist
   */
  async getArtistInfo(artist: string, lang = 'en'): Promise<ProviderResponse<LastFmArtistInfo>> {
    try {
      const config: ApiRequestConfig = {
        url: this.buildUrl('artist.getInfo', { artist, lang }),
        method: 'GET',
      };
      
      const response = await this.makeRequest<{ artist: LastFmArtistInfo }>(config);
      
      if (!response.data?.artist) {
        return {
          success: false,
          error: 'Artist information not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: response.data.artist,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<LastFmArtistInfo>(error, 'Failed to get artist information');
    }
  }

  /**
   * Gets information about an album
   */
  async getAlbumInfo(artist: string, album: string, lang = 'en'): Promise<ProviderResponse<LastFmAlbumInfo>> {
    try {
      const config: ApiRequestConfig = {
        url: this.buildUrl('album.getInfo', { artist, album, lang }),
        method: 'GET',
      };
      
      const response = await this.makeRequest<{ album: LastFmAlbumInfo }>(config);
      
      if (!response.data?.album) {
        return {
          success: false,
          error: 'Album information not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: response.data.album,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<LastFmAlbumInfo>(error, 'Failed to get album information');
    }
  }

  /**
   * Gets information about a track
   */
  async getTrackInfo(artist: string, track: string, lang = 'en'): Promise<ProviderResponse<LastFmTrackInfo>> {
    try {
      const config: ApiRequestConfig = {
        url: this.buildUrl('track.getInfo', { artist, track, lang }),
        method: 'GET',
      };
      
      const response = await this.makeRequest<{ track: LastFmTrackInfo }>(config);
      
      if (!response.data?.track) {
        return {
          success: false,
          error: 'Track information not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: response.data.track,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<LastFmTrackInfo>(error, 'Failed to get track information');
    }
  }

  /**
   * Gets top tracks for an artist
   */
  async getArtistTopTracks(artist: string, limit = 10, page = 1): Promise<ProviderResponse<LastFmTopTracks>> {
    try {
      const config: ApiRequestConfig = {
        url: this.buildUrl('artist.getTopTracks', { 
          artist, 
          limit: limit.toString(), 
          page: page.toString() 
        }),
        method: 'GET',
      };
      
      const response = await this.makeRequest<{ toptracks: LastFmTopTracks }>(config);
      
      if (!response.data?.toptracks) {
        return {
          success: false,
          error: 'Top tracks not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: response.data.toptracks,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<LastFmTopTracks>(error, 'Failed to get top tracks');
    }
  }

  /**
   * Gets similar tracks to a specified track
   */
  async getSimilarTracks(artist: string, track: string, limit = 10): Promise<ProviderResponse<LastFmSimilarTracks>> {
    try {
      const config: ApiRequestConfig = {
        url: this.buildUrl('track.getSimilar', { 
          artist, 
          track,
          limit: limit.toString()
        }),
        method: 'GET',
      };
      
      const response = await this.makeRequest<{ similartracks: LastFmSimilarTracks }>(config);
      
      if (!response.data?.similartracks) {
        return {
          success: false,
          error: 'Similar tracks not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: response.data.similartracks,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<LastFmSimilarTracks>(error, 'Failed to get similar tracks');
    }
  }

  /**
   * Search for music content (artists, albums, tracks)
   */
  async search(query: string, entityType: 'artist' | 'album' | 'track', limit = 10, page = 1): Promise<ProviderResponse<LastFmSearchResults>> {
    try {
      const params: Record<string, string> = {
        limit: limit.toString(),
        page: page.toString()
      };
      params[entityType] = query;
      
      const config: ApiRequestConfig = {
        url: this.buildUrl(`${entityType}.search`, params),
        method: 'GET',
      };
      
      const response = await this.makeRequest<{ results: LastFmSearchResults['results'] }>(config);
      
      if (!response.data?.results) {
        return {
          success: false,
          error: 'Search results not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: { results: response.data.results },
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<LastFmSearchResults>(error, 'Failed to search');
    }
  }

  /**
   * Gets tag information and top tracks/artists for a tag
   */
  async getTagInfo(tag: string): Promise<ProviderResponse<any>> {
    try {
      const config: ApiRequestConfig = {
        url: this.buildUrl('tag.getInfo', { tag }),
        method: 'GET',
      };
      
      const response = await this.makeRequest(config);
      
      if (!response.data?.tag) {
        return {
          success: false,
          error: 'Tag information not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: response.data.tag,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get tag information');
    }
  }

  /**
   * Gets the top tags on Last.fm
   */
  async getTopTags(): Promise<ProviderResponse<any>> {
    try {
      const config: ApiRequestConfig = {
        url: this.buildUrl('tag.getTopTags', {}),
        method: 'GET',
      };
      
      const response = await this.makeRequest(config);
      
      if (!response.data?.toptags) {
        return {
          success: false,
          error: 'Top tags not found',
          data: null,
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      return {
        success: true,
        data: response.data.toptags,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get top tags');
    }
  }
}

/**
 * Application-specific data transformation for music providers
 */
export interface SongRecommendation {
  title: string;
  artist: string;
  albumArt?: string;
  url?: string;
  matchScore?: number;
  tags?: string[];
}

export interface ArtistInfo {
  name: string;
  bio?: string;
  imageUrl?: string;
  tags?: string[];
  similarArtists?: { name: string; imageUrl?: string }[];
}

export interface PlaylistInfo {
  name: string;
  tracks: SongRecommendation[];
  totalTracks: number;
}

/**
 * Factory function to create a Last.fm provider
 */
export function createLastFmProvider(): LastFmProvider {
  return new LastFmProvider();
}

/**
 * Factory function to create an array of all available music providers
 */
export function createMusicProviders(): BaseProvider[] {
  return [createLastFmProvider()];
}
import { BaseProvider, ProviderResponse } from '../core/provider';
import { ApiRequestConfig } from '../core/types';

/**
 * Sound search parameters
 */
export interface SoundSearchParams {
  query: string;
  filter?: string;
  sort?: 'score' | 'duration_desc' | 'duration_asc' | 'created_desc' | 'created_asc' | 'downloads_desc' | 'downloads_asc' | 'rating_desc' | 'rating_asc';
  page?: number;
  pageSize?: number;
  fields?: string[];
  descriptors?: string[];
  geoTag?: string;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * Sound metadata
 */
export interface SoundMetadata {
  id: number;
  name: string;
  url: string;
  license: string;
  username: string;
  description: string;
  created: string;
  duration: number;
  filesize: number;
  type: string;
  samplerate: number;
  bitrate: number;
  bitdepth: number;
  channels: number;
  download: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
    'preview-hq-ogg': string;
    'preview-lq-ogg': string;
  };
  images: {
    waveform_m: string;
    waveform_l: string;
    spectral_m: string;
    spectral_l: string;
  };
  num_downloads: number;
  avg_rating: number;
  num_ratings: number;
  tags: string[];
  geotag?: {
    lat: number;
    lon: number;
    zoom: number;
  };
  comments?: any[];
}

/**
 * Sound search results
 */
export interface SoundSearchResults {
  count: number;
  results: SoundMetadata[];
  next: string | null;
  previous: string | null;
}

/**
 * Freesound API Provider for sound effects and audio
 */
export class FreesoundProvider extends BaseProvider {
  private baseUrl = 'https://freesound.org/apiv2';
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiration: number = 0;
  
  /**
   * Create an instance of FreesoundProvider
   */
  constructor() {
    super('freesound', 'sound', 8);
    
    this.clientId = import.meta.env.VITE_FREESOUND_CLIENT_ID || 'f1lX3B8AhsBTWYNUqoQG';
    this.clientSecret = import.meta.env.VITE_FREESOUND_CLIENT_SECRET || 'mXE2fEwXv9nbmJ0Kmjs6NpFdpw4s42iixvHc255M';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Freesound API credentials not configured. Set VITE_FREESOUND_CLIENT_ID and VITE_FREESOUND_CLIENT_SECRET environment variables.');
    }
  }
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret;
  }
  
  /**
   * Get access token for API requests
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiration) {
      return this.accessToken;
    }
    
    // Get new token
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.accessToken = data.access_token;
      // Set expiration to 23 hours from now (Freesound tokens are valid for 24 hours)
      this.tokenExpiration = now + (23 * 60 * 60 * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Freesound access token:', error);
      throw error;
    }
  }
  
  /**
   * Get headers for API requests
   */
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  
  /**
   * Make a request to the Freesound API
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {},
    method: string = 'GET',
    body?: any
  ): Promise<ProviderResponse<T>> {
    if (!this.isConfigured()) {
      return this.handleError(
        new Error('Freesound API not configured'),
        'Missing API credentials'
      );
    }
    
    try {
      const headers = await this.getHeaders();
      
      // Build query string from params
      const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${this.baseUrl}/${endpoint}${queryParams ? '?' + queryParams : ''}`;
      
      const requestOptions: RequestInit = {
        method,
        headers
      };
      
      if (body && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(body);
        requestOptions.headers = {
          ...headers,
          'Content-Type': 'application/json'
        };
      }
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`Freesound API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch sound data');
    }
  }
  
  /**
   * Search for sounds
   */
  async searchSounds(params: SoundSearchParams): Promise<ProviderResponse<SoundSearchResults>> {
    const queryParams: Record<string, any> = {
      query: params.query,
      filter: params.filter,
      sort: params.sort,
      page: params.page,
      page_size: params.pageSize,
      fields: params.fields?.join(','),
      descriptors: params.descriptors?.join(','),
      geotag: params.geoTag,
      min_duration: params.minDuration,
      max_duration: params.maxDuration
    };
    
    return this.makeRequest<SoundSearchResults>('search/text/', queryParams);
  }
  
  /**
   * Get sound by ID
   */
  async getSoundById(id: number): Promise<ProviderResponse<SoundMetadata>> {
    return this.makeRequest<SoundMetadata>(`sounds/${id}/`);
  }
  
  /**
   * Get similar sounds
   */
  async getSimilarSounds(id: number, params?: { 
    page?: number, 
    pageSize?: number,
    fields?: string[] 
  }): Promise<ProviderResponse<SoundSearchResults>> {
    const queryParams: Record<string, any> = {
      page: params?.page,
      page_size: params?.pageSize,
      fields: params?.fields?.join(',')
    };
    
    return this.makeRequest<SoundSearchResults>(`sounds/${id}/similar/`, queryParams);
  }
  
  /**
   * Get sounds by tag
   */
  async getSoundsByTag(tag: string, params?: { 
    page?: number, 
    pageSize?: number,
    fields?: string[] 
  }): Promise<ProviderResponse<SoundSearchResults>> {
    const queryParams: Record<string, any> = {
      page: params?.page,
      page_size: params?.pageSize,
      fields: params?.fields?.join(',')
    };
    
    return this.makeRequest<SoundSearchResults>(`tags/${tag}/sounds/`, queryParams);
  }
  
  /**
   * Search for automotive sounds
   * Helper method specific to our application domain
   */
  async searchAutomotiveSounds(query: string, params?: { 
    page?: number, 
    pageSize?: number,
    sort?: SoundSearchParams['sort']
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Add automotive tags to refine search
    const filter = 'tag:car OR tag:engine OR tag:automotive OR tag:vehicle OR tag:motor OR tag:racing OR tag:f1 OR tag:formula1';
    
    return this.searchSounds({
      query,
      filter,
      page: params?.page || 1,
      pageSize: params?.pageSize || 15,
      sort: params?.sort || 'score'
    });
  }
  
  /**
   * Get F1/racing sounds
   * Helper method specific to our application domain
   */
  async getRacingSounds(params?: { 
    page?: number, 
    pageSize?: number,
    sort?: SoundSearchParams['sort']
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Specific filter for racing sounds
    const filter = 'tag:f1 OR tag:formula1 OR tag:racing OR tag:race OR tag:motorsport';
    
    return this.searchSounds({
      query: 'racing engine',
      filter,
      page: params?.page || 1,
      pageSize: params?.pageSize || 15,
      sort: params?.sort || 'rating_desc'
    });
  }
  
  /**
   * Get engine sounds
   * Helper method specific to our application domain
   */
  async getEngineSounds(params?: { 
    page?: number, 
    pageSize?: number,
    sort?: SoundSearchParams['sort']
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Specific filter for engine sounds
    const filter = 'tag:engine OR tag:motor OR tag:car OR tag:revving';
    
    return this.searchSounds({
      query: 'engine',
      filter,
      page: params?.page || 1,
      pageSize: params?.pageSize || 15,
      sort: params?.sort || 'rating_desc'
    });
  }
}

/**
 * Factory function to create a Freesound provider
 */
export function createFreesoundProvider(): FreesoundProvider {
  return new FreesoundProvider();
}

/**
 * Mock implementation of sound provider for development
 */
export class MockSoundProvider extends BaseProvider {
  constructor() {
    super('mock-sound', 'sound', 5); // Lower priority than real providers
  }
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean {
    return true; // Always configured
  }
  
  /**
   * Search for sounds
   */
  async searchSounds(params: SoundSearchParams): Promise<ProviderResponse<SoundSearchResults>> {
    // Generate mock search results
    const results: SoundMetadata[] = Array(10).fill(null).map((_, index) => this.createMockSound(index + 1, params.query));
    
    return {
      success: true,
      data: {
        count: results.length,
        results,
        next: null,
        previous: null
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get sound by ID
   */
  async getSoundById(id: number): Promise<ProviderResponse<SoundMetadata>> {
    return {
      success: true,
      data: this.createMockSound(id, `Sound ${id}`),
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get similar sounds
   */
  async getSimilarSounds(id: number, params?: { 
    page?: number, 
    pageSize?: number,
    fields?: string[] 
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Generate mock similar sounds
    const pageSize = params?.pageSize || 10;
    const results: SoundMetadata[] = Array(pageSize).fill(null).map((_, index) => 
      this.createMockSound(index + 100, `Similar to Sound ${id}`)
    );
    
    return {
      success: true,
      data: {
        count: results.length,
        results,
        next: null,
        previous: null
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get sounds by tag
   */
  async getSoundsByTag(tag: string, params?: { 
    page?: number, 
    pageSize?: number,
    fields?: string[] 
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Generate mock sounds for the tag
    const pageSize = params?.pageSize || 10;
    const results: SoundMetadata[] = Array(pageSize).fill(null).map((_, index) => 
      this.createMockSound(index + 200, `${tag} Sound`)
    );
    
    return {
      success: true,
      data: {
        count: results.length,
        results,
        next: null,
        previous: null
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Search for automotive sounds
   */
  async searchAutomotiveSounds(query: string, params?: { 
    page?: number, 
    pageSize?: number,
    sort?: SoundSearchParams['sort']
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Generate mock automotive sounds
    const pageSize = params?.pageSize || 15;
    const results: SoundMetadata[] = Array(pageSize).fill(null).map((_, index) => {
      const soundTypes = [
        'Engine Start', 'Revving', 'Idle', 'Acceleration', 
        'Gear Shift', 'Braking', 'Door Slam', 'Horn', 
        'Turn Signal', 'Tire Squeal', 'Exhaust', 'Turbo',
        'V8 Engine', 'V12 Engine', 'F1 Engine'
      ];
      
      const carBrands = [
        'Ferrari', 'Lamborghini', 'Porsche', 'McLaren',
        'Mercedes', 'BMW', 'Audi', 'Ford', 'Toyota',
        'Honda', 'Chevrolet', 'Dodge', 'Nissan'
      ];
      
      const randomType = soundTypes[Math.floor(Math.random() * soundTypes.length)];
      const randomBrand = carBrands[Math.floor(Math.random() * carBrands.length)];
      
      return this.createMockSound(
        index + 300, 
        `${randomBrand} ${randomType}`, 
        [`${randomBrand.toLowerCase()}`, 'car', 'engine', 'automotive', randomType.toLowerCase().replace(' ', '-')]
      );
    });
    
    return {
      success: true,
      data: {
        count: results.length,
        results,
        next: null,
        previous: null
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get F1/racing sounds
   */
  async getRacingSounds(params?: { 
    page?: number, 
    pageSize?: number,
    sort?: SoundSearchParams['sort']
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Generate mock racing sounds
    const pageSize = params?.pageSize || 15;
    const results: SoundMetadata[] = Array(pageSize).fill(null).map((_, index) => {
      const soundTypes = [
        'F1 Engine', 'Race Start', 'Pit Stop', 'Fly By', 
        'Gear Shift', 'Accelerating', 'Crowd Cheer', 'Announcer',
        'Team Radio', 'Podium Celebration', 'Formation Lap'
      ];
      
      const teams = [
        'Mercedes', 'Red Bull', 'Ferrari', 'McLaren',
        'Alpine', 'Aston Martin', 'AlphaTauri', 'Alfa Romeo',
        'Williams', 'Haas'
      ];
      
      const randomType = soundTypes[Math.floor(Math.random() * soundTypes.length)];
      const randomTeam = teams[Math.floor(Math.random() * teams.length)];
      
      return this.createMockSound(
        index + 400, 
        `${randomTeam} ${randomType}`, 
        ['f1', 'formula1', 'racing', 'motorsport', randomTeam.toLowerCase().replace(' ', '-')]
      );
    });
    
    return {
      success: true,
      data: {
        count: results.length,
        results,
        next: null,
        previous: null
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get engine sounds
   */
  async getEngineSounds(params?: { 
    page?: number, 
    pageSize?: number,
    sort?: SoundSearchParams['sort']
  }): Promise<ProviderResponse<SoundSearchResults>> {
    // Generate mock engine sounds
    const pageSize = params?.pageSize || 15;
    const results: SoundMetadata[] = Array(pageSize).fill(null).map((_, index) => {
      const engineTypes = [
        'V8', 'V6', 'V12', 'Inline 4', 'Inline 6', 
        'Flat 6', 'Rotary', 'Electric', 'Hybrid', 'Turbo',
        'Supercharged', 'Diesel', 'Two-Stroke'
      ];
      
      const actions = [
        'Idle', 'Revving', 'Start', 'Shutdown', 'Acceleration',
        'Deceleration', 'Throttle Blip', 'Cold Start', 'Load'
      ];
      
      const randomEngine = engineTypes[Math.floor(Math.random() * engineTypes.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      return this.createMockSound(
        index + 500, 
        `${randomEngine} Engine ${randomAction}`, 
        ['engine', 'motor', 'car', randomEngine.toLowerCase().replace(' ', '-'), randomAction.toLowerCase()]
      );
    });
    
    return {
      success: true,
      data: {
        count: results.length,
        results,
        next: null,
        previous: null
      },
      provider: this.name,
      timestamp: Date.now()
    };
  }
  
  /**
   * Create a mock sound metadata object
   */
  private createMockSound(id: number, name: string, tags: string[] = []): SoundMetadata {
    // Generate random duration between 1 and 60 seconds
    const duration = Math.random() * 59 + 1;
    // Generate random filesize between 100KB and 5MB
    const filesize = Math.floor(Math.random() * 4900000) + 100000;
    // Generate random rating between 3 and 5
    const rating = Math.random() * 2 + 3;
    // Generate random download count between 10 and 10000
    const downloads = Math.floor(Math.random() * 9990) + 10;
    
    // Generate random creation date within the last 5 years
    const now = new Date();
    const pastDate = new Date(now.getFullYear() - Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    // Default tags if none provided
    const soundTags = tags.length > 0 ? tags : ['audio', 'sound', 'effect', 'sample'];
    
    return {
      id,
      name,
      url: `https://example.com/sounds/${id}`,
      license: 'Creative Commons 0',
      username: `user_${Math.floor(Math.random() * 1000)}`,
      description: `This is a mock sound for ${name}`,
      created: pastDate.toISOString(),
      duration,
      filesize,
      type: 'audio/mp3',
      samplerate: 44100,
      bitrate: 320,
      bitdepth: 16,
      channels: 2,
      download: `https://example.com/sounds/${id}/download`,
      previews: {
        'preview-hq-mp3': `https://example.com/sounds/${id}/preview-hq.mp3`,
        'preview-lq-mp3': `https://example.com/sounds/${id}/preview-lq.mp3`,
        'preview-hq-ogg': `https://example.com/sounds/${id}/preview-hq.ogg`,
        'preview-lq-ogg': `https://example.com/sounds/${id}/preview-lq.ogg`
      },
      images: {
        waveform_m: `https://example.com/sounds/${id}/waveform-m.png`,
        waveform_l: `https://example.com/sounds/${id}/waveform-l.png`,
        spectral_m: `https://example.com/sounds/${id}/spectral-m.png`,
        spectral_l: `https://example.com/sounds/${id}/spectral-l.png`
      },
      num_downloads: downloads,
      avg_rating: rating,
      num_ratings: Math.floor(Math.random() * 100) + 1,
      tags: soundTags
    };
  }
}

/**
 * Factory function to create a Mock Sound provider
 */
export function createMockSoundProvider(): MockSoundProvider {
  return new MockSoundProvider();
}

/**
 * Factory function to create all sound providers
 */
export function createSoundProviders(): BaseProvider[] {
  return [
    createFreesoundProvider() // Using only authentic data from Freesound API
  ];
}
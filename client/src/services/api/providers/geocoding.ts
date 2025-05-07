/**
 * Geocoding API Providers
 * 
 * Implements API providers for geocoding-related services:
 * - Forward geocoding (address to coordinates)
 * - Reverse geocoding (coordinates to address)
 * - IP-based geolocation
 */

import { APIDataWarehouseCore } from '../core';
import { 
  APICategory, 
  APIProvider, 
  APIRequest, 
  APIResponse, 
  GeocodingResult 
} from '../types';

// IPInfo Provider for IP-based geolocation
export class IPInfoProvider implements APIProvider {
  name: string = 'IPInfo';
  category: APICategory;
  priority: number = 0;
  defaultCacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours
  timeout: number = 5000; // 5 seconds
  
  // Rate limiting properties
  rateLimitPerMinute: number = 50; // Default for free tier is 50k/month
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  constructor(category: APICategory, priority: number = 10) {
    this.category = category;
    this.priority = priority;
  }
  
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    // Get API key from core
    const token = (request.params?.token as string) || 
                 this.getAPIKey('IPINFO');
    
    // Check rate limiting
    if (this.shouldThrottle()) {
      throw new Error(`Rate limit exceeded for ${this.name}`);
    }
    
    // Track this request for rate limiting
    this.trackRequest();
    
    try {
      // Build URL - default to current IP if none specified
      let endpoint = 'json'; // Default endpoint for current IP
      
      // If a specific IP is requested, use it
      if (request.params?.ip) {
        endpoint = `${request.params.ip}/json`;
      }
      
      // Add custom endpoint if provided
      if (request.endpoint) {
        endpoint = request.endpoint;
      }
      
      const url = new URL(`https://ipinfo.io/${endpoint}`);
      
      // Add token if available
      if (token) {
        url.searchParams.append('token', token);
      }
      
      // Execute the request
      const response = await fetch(url.toString(), {
        headers: request.headers || {},
        signal: AbortSignal.timeout(
          request.timeout || this.timeout
        ),
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`IPInfo API error: ${response.status} - ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Transform the response to our standard format
      const transformedData = this.transformToGeocodingResult(data);
      
      return {
        data: transformedData as any as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`IPInfo API error:`, error);
      throw error;
    }
  }
  
  // Transform IPInfo data to our standardized GeocodingResult format
  private transformToGeocodingResult(data: any): GeocodingResult {
    // Parse the loc field which contains "lat,lon"
    const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
    
    return {
      lat,
      lon,
      display_name: [data.city, data.region, data.country]
        .filter(Boolean)
        .join(', '),
      address: {
        country: data.country,
        country_code: data.country,
        state: data.region,
        city: data.city,
        district: data.district,
        postcode: data.postal,
      },
      type: 'ip',
      importance: 0.5,
      source: this.name,
    };
  }
  
  // Get API key with proper fallbacks
  private getAPIKey(service: string): string | null {
    // Check environment variables
    // @ts-ignore: Environment variable access
    const envKey = (import.meta.env as any)[`VITE_${service}_API_KEY`];
    if (envKey) return envKey;
    
    // Check localStorage
    try {
      const storageKey = localStorage.getItem(`${service.toLowerCase()}_api_key`);
      if (storageKey) return storageKey;
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return null;
  }
  
  // Rate limiting: check if we should throttle this request
  private shouldThrottle(): boolean {
    const now = Date.now();
    const minuteElapsed = (now - this.lastRequestTime) > 60000;
    
    if (minuteElapsed) {
      // Reset counter after a minute has passed
      this.requestsThisMinute = 0;
      return false;
    }
    
    return this.requestsThisMinute >= this.rateLimitPerMinute;
  }
  
  // Rate limiting: track this request
  private trackRequest(): void {
    const now = Date.now();
    const minuteElapsed = (now - this.lastRequestTime) > 60000;
    
    if (minuteElapsed) {
      this.requestsThisMinute = 1;
    } else {
      this.requestsThisMinute++;
    }
    
    this.lastRequestTime = now;
  }
  
  // Health check
  async getHealthStatus(): Promise<'healthy' | 'degraded' | 'unavailable' | 'unknown'> {
    try {
      // Make a lightweight test request
      const token = this.getAPIKey('IPINFO');
      const url = token ? 
        `https://ipinfo.io/json?token=${token}` : 
        'https://ipinfo.io/json';
      
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(3000) 
      });
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    } catch (error) {
      return 'unavailable';
    }
  }
}

// OpenStreetMap Nominatim Provider for forward and reverse geocoding (free, no API key required)
export class NominatimProvider implements APIProvider {
  name: string = 'Nominatim (OSM)';
  category: APICategory;
  priority: number = 0;
  defaultCacheTTL: number = 7 * 24 * 60 * 60 * 1000; // 7 days (addresses don't change often)
  timeout: number = 5000; // 5 seconds
  
  // Rate limiting properties (Nominatim's usage policy is max 1 request per second)
  rateLimitPerMinute: number = 60; // Being conservative
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  constructor(category: APICategory, priority: number = 5) {
    this.category = category;
    this.priority = priority;
  }
  
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    // Check rate limiting
    if (this.shouldThrottle()) {
      throw new Error(`Rate limit exceeded for ${this.name}`);
    }
    
    // Track this request for rate limiting
    this.trackRequest();
    
    // Build URL based on category
    let url: URL;
    
    if (this.category === APICategory.GEOCODING) {
      // Forward geocoding (address to coordinates)
      if (!request.params?.q) {
        throw new Error('Query parameter "q" is required for forward geocoding');
      }
      
      url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.append('q', request.params.q as string);
      url.searchParams.append('format', 'json');
      url.searchParams.append('limit', (request.params.limit || 5).toString());
    } else if (this.category === APICategory.REVERSE_GEOCODING) {
      // Reverse geocoding (coordinates to address)
      if (!request.params?.lat || !request.params?.lon) {
        throw new Error('Latitude and longitude are required for reverse geocoding');
      }
      
      url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.append('lat', request.params.lat.toString());
      url.searchParams.append('lon', request.params.lon.toString());
      url.searchParams.append('format', 'json');
    } else {
      throw new Error(`Unsupported category: ${this.category}`);
    }
    
    // Add common parameters
    url.searchParams.append('addressdetails', '1');
    
    // Add extra parameters if provided
    if (request.params?.zoom) {
      url.searchParams.append('zoom', request.params.zoom.toString());
    }
    
    try {
      // Execute the request
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'PADDOCK20 Geocoding (paddock20@example.com)',
          ...request.headers
        },
        signal: AbortSignal.timeout(
          request.timeout || this.timeout
        ),
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status} - ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Transform the response to our standard format
      let transformedData;
      
      if (this.category === APICategory.GEOCODING) {
        // Forward geocoding returns an array
        transformedData = Array.isArray(data) ? 
          data.map(item => this.transformToGeocodingResult(item)) : 
          [];
      } else {
        // Reverse geocoding returns a single object
        transformedData = this.transformToGeocodingResult(data);
      }
      
      return {
        data: transformedData as any as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Nominatim API error:`, error);
      throw error;
    }
  }
  
  // Transform Nominatim data to our standardized GeocodingResult format
  private transformToGeocodingResult(data: any): GeocodingResult {
    if (!data || data.error) {
      return {
        lat: 0,
        lon: 0,
        display_name: 'Unknown',
        address: {},
        source: this.name,
      };
    }
    
    return {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      display_name: data.display_name,
      address: {
        country: data.address?.country,
        country_code: data.address?.country_code,
        state: data.address?.state,
        county: data.address?.county,
        city: data.address?.city || data.address?.town || data.address?.village,
        district: data.address?.suburb || data.address?.neighborhood,
        street: data.address?.road,
        postcode: data.address?.postcode,
      },
      boundingbox: data.boundingbox,
      type: data.type,
      importance: data.importance,
      source: this.name,
    };
  }
  
  // Rate limiting: check if we should throttle this request
  private shouldThrottle(): boolean {
    const now = Date.now();
    const secondElapsed = (now - this.lastRequestTime) > 1000;
    
    return !secondElapsed;
  }
  
  // Rate limiting: track this request
  private trackRequest(): void {
    this.lastRequestTime = Date.now();
  }
  
  // Health check
  async getHealthStatus(): Promise<'healthy' | 'degraded' | 'unavailable' | 'unknown'> {
    try {
      // Make a lightweight test request
      const response = await fetch(
        'https://nominatim.openstreetmap.org/search?q=london&format=json&limit=1',
        { 
          headers: { 'User-Agent': 'PADDOCK20 Geocoding (paddock20@example.com)' },
          signal: AbortSignal.timeout(3000) 
        }
      );
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    } catch (error) {
      return 'unavailable';
    }
  }
}

/**
 * Register all geocoding-related providers with the API Data Warehouse
 * @param core API Data Warehouse core instance
 */
export function registerGeocodingProviders(core: APIDataWarehouseCore): void {
  // Register provider for IP-based geolocation
  core.registerProvider(
    APICategory.GEOCODING,
    new IPInfoProvider(APICategory.GEOCODING, 10) // Primary provider for IP geolocation
  );
  
  // Register providers for forward geocoding (address to coordinates)
  core.registerProvider(
    APICategory.GEOCODING,
    new NominatimProvider(APICategory.GEOCODING, 5) // For address lookups
  );
  
  // Register providers for reverse geocoding (coordinates to address)
  core.registerProvider(
    APICategory.REVERSE_GEOCODING,
    new NominatimProvider(APICategory.REVERSE_GEOCODING, 10) // Primary provider
  );
}
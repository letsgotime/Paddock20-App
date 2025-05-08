/**
 * IPInfo API Provider
 * 
 * Implements the API provider interface for the IPInfo API.
 * This provider supports IP-based geolocation and reverse geocoding.
 */

import { APIProvider, APICategory, APIRequest, APIResponse, GeocodingResult } from '../types';
import { apiWarehouse } from '../APIDataWarehouse';

// IPInfo specific configuration
interface IPInfoConfig {
  token?: string;
  baseUrl?: string;
}

// Default configuration
const DEFAULT_CONFIG: IPInfoConfig = {
  baseUrl: 'https://ipinfo.io',
};

// Service name for API key lookup
const SERVICE_NAME = 'IPINFO';

export class IPInfoProvider implements APIProvider {
  // Provider metadata
  public name: string = 'IPInfo';
  public category: APICategory;
  public priority: number;
  public defaultCacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours
  
  // Rate limiting (Free tier: 50,000 requests per month ~= 1,600 per day)
  public rateLimitPerMinute: number = 50;
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  // Configuration
  private config: IPInfoConfig;

  constructor(
    category: APICategory, 
    priority: number = 1,
    config: Partial<IPInfoConfig> = {}
  ) {
    this.category = category;
    this.priority = priority;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an API request to IPInfo
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    // Get token from warehouse or config
    const token = this.config.token || apiWarehouse.getAPIKey(SERVICE_NAME);
    if (!token) {
      throw new Error(`No token available for ${this.name}`);
    }

    // Rate limiting
    if (this.shouldThrottle()) {
      throw new Error(`Rate limit exceeded for ${this.name}`);
    }
    this.trackRequest();

    try {
      // Build the URL
      const baseUrl = this.config.baseUrl;
      let endpoint = request.endpoint || '';
      
      // If no specific IP is requested, use the current client IP
      if (!endpoint) {
        endpoint = '/json';
      }
      
      const url = new URL(`${baseUrl}${endpoint}`);
      
      // Add the token parameter
      url.searchParams.append('token', token);
      
      // Add request-specific parameters
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
        });
      }

      // Make the request
      const response = await fetch(url.toString(), {
        headers: request.headers || {},
      });

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Invalid token for ${this.name}`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded for ${this.name}`);
        } else {
          throw new Error(`HTTP error ${response.status} from ${this.name}: ${response.statusText}`);
        }
      }

      // Parse the response
      const data = await response.json();
      
      // Transform the data to our standardized format
      const transformedData = this.transformData(data, this.category);
      
      return {
        data: transformedData as unknown as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error executing request to ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Check if the provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const token = this.config.token || apiWarehouse.getAPIKey(SERVICE_NAME);
      if (!token) {
        return false;
      }
      
      // Make a lightweight test request
      const response = await fetch(
        `${this.config.baseUrl}/8.8.8.8/json?token=${token}`
      );
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the remaining quota for this API
   */
  async getQuotaRemaining(): Promise<number> {
    // IPInfo doesn't provide a quota endpoint, so we estimate based on rate limits
    const minutesSinceLastRequest = (Date.now() - this.lastRequestTime) / (60 * 1000);
    if (minutesSinceLastRequest >= 1) {
      return this.rateLimitPerMinute;
    } else {
      return Math.max(0, this.rateLimitPerMinute - this.requestsThisMinute);
    }
  }

  /**
   * Get the health status of this provider
   */
  async getHealthStatus(): Promise<'healthy' | 'degraded' | 'unavailable'> {
    if (await this.isAvailable()) {
      const quotaRemaining = await this.getQuotaRemaining();
      if (quotaRemaining < this.rateLimitPerMinute * 0.1) {
        return 'degraded';
      } else {
        return 'healthy';
      }
    }
    return 'unavailable';
  }

  /**
   * Transform the raw API data to our standardized format
   */
  private transformData(data: any, category: APICategory): any {
    switch (category) {
      case APICategory.GEOCODING:
      case APICategory.REVERSE_GEOCODING:
        return this.transformGeocodingData(data);
      default:
        // For other categories, return the data as-is
        return data;
    }
  }

  /**
   * Transform IPInfo response to our geocoding format
   */
  private transformGeocodingData(data: any): GeocodingResult {
    // Split the loc field to get lat and lon
    const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
    
    const city = data.city || '';
    const region = data.region || '';
    const country = data.country || '';
    const postalCode = data.postal || '';
    
    return {
      lat,
      lon,
      display_name: [city, region, country].filter(Boolean).join(', '),
      address: {
        country,
        country_code: data.country,
        state: region,
        city,
        postcode: postalCode,
      },
      type: 'ip',
      importance: 0.5,
      source: this.name,
    };
  }

  /**
   * Check if we should throttle the request
   */
  private shouldThrottle(): boolean {
    const now = Date.now();
    const minutesSinceLastRequest = (now - this.lastRequestTime) / (60 * 1000);
    
    // Reset counter if more than a minute has passed
    if (minutesSinceLastRequest >= 1) {
      this.requestsThisMinute = 0;
      return false;
    }
    
    // Throttle if we've hit the rate limit
    return this.requestsThisMinute >= this.rateLimitPerMinute;
  }

  /**
   * Track a request for rate limiting
   */
  private trackRequest(): void {
    const now = Date.now();
    const minutesSinceLastRequest = (now - this.lastRequestTime) / (60 * 1000);
    
    // Reset counter if more than a minute has passed
    if (minutesSinceLastRequest >= 1) {
      this.requestsThisMinute = 1;
    } else {
      this.requestsThisMinute++;
    }
    
    this.lastRequestTime = now;
  }
}

// Factory function to create IPInfo providers
export function createIPInfoProvider(
  category: APICategory, 
  priority: number = 1,
  config: Partial<IPInfoConfig> = {}
): IPInfoProvider {
  return new IPInfoProvider(category, priority, config);
}
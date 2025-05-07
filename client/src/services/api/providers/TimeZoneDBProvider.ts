/**
 * TimeZoneDB API Provider
 * 
 * Implements the API provider interface for the TimeZoneDB API.
 * This provider supports timezone lookups and conversions.
 */

import { APIProvider, APICategory, APIRequest, APIResponse, TimeData } from '../types';
import { apiWarehouse } from '../APIDataWarehouse';

// TimeZoneDB specific configuration
interface TimeZoneDBConfig {
  apiKey?: string;
  baseUrl?: string;
}

// Default configuration
const DEFAULT_CONFIG: TimeZoneDBConfig = {
  baseUrl: 'https://api.timezonedb.com/v2.1',
};

// Service name for API key lookup
const SERVICE_NAME = 'TIMEZONEDB';

export class TimeZoneDBProvider implements APIProvider {
  // Provider metadata
  public name: string = 'TimeZoneDB';
  public category: APICategory;
  public priority: number;
  public defaultCacheTTL: number = 30 * 24 * 60 * 60 * 1000; // 30 days for timezone data
  
  // Rate limiting (Free tier: 1 call per second)
  public rateLimitPerMinute: number = 60;
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  // Configuration
  private config: TimeZoneDBConfig;

  constructor(
    category: APICategory, 
    priority: number = 1,
    config: Partial<TimeZoneDBConfig> = {}
  ) {
    this.category = category;
    this.priority = priority;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an API request to TimeZoneDB
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    // Get API key from warehouse or config
    const apiKey = this.config.apiKey || apiWarehouse.getAPIKey(SERVICE_NAME);
    if (!apiKey) {
      throw new Error(`No API key available for ${this.name}`);
    }

    // Rate limiting
    if (this.shouldThrottle()) {
      throw new Error(`Rate limit exceeded for ${this.name}`);
    }
    this.trackRequest();

    try {
      // Build the URL
      const baseUrl = this.config.baseUrl;
      const endpoint = request.endpoint || this.getEndpointForCategory();
      const url = new URL(`${baseUrl}/${endpoint}`);
      
      // Add common parameters
      url.searchParams.append('key', apiKey);
      url.searchParams.append('format', 'json');
      
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
          throw new Error(`Invalid API key for ${this.name}`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded for ${this.name}`);
        } else {
          throw new Error(`HTTP error ${response.status} from ${this.name}: ${response.statusText}`);
        }
      }

      // Parse the response
      const data = await response.json();
      
      // Check for API error
      if (data.status === 'FAILED') {
        throw new Error(`API error from ${this.name}: ${data.message}`);
      }
      
      // Transform the data to our standard format
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
      const apiKey = this.config.apiKey || apiWarehouse.getAPIKey(SERVICE_NAME);
      if (!apiKey) {
        return false;
      }
      
      // Make a lightweight test request
      const url = new URL(`${this.config.baseUrl}/get-time-zone`);
      url.searchParams.append('key', apiKey);
      url.searchParams.append('format', 'json');
      url.searchParams.append('by', 'position');
      url.searchParams.append('lat', '40.7128');
      url.searchParams.append('lng', '-74.0060');
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      return data.status === 'OK';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the remaining quota for this API
   */
  async getQuotaRemaining(): Promise<number> {
    // TimeZoneDB doesn't provide a quota endpoint, so we estimate based on rate limits
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
      case APICategory.TIME:
      case APICategory.TIMEZONE:
        return this.transformTimeData(data);
      default:
        // For other categories, return the data as-is
        return data;
    }
  }

  /**
   * Transform TimeZoneDB data to our time data format
   */
  private transformTimeData(data: any): TimeData {
    // Parse timestamp to Date object
    const date = new Date(data.timestamp * 1000);
    
    // Calculate sunrise and sunset times (estimated if not provided)
    // Using civil twilight approximation for sunrise/sunset
    const dayOfYear = this.getDayOfYear(date);
    const latitude = data.latitude || 0;
    
    // Use daylight savings information
    const isDST = data.dst === '1';
    
    // Parse timezone abbreviation
    const tzAbbr = data.abbreviation || '';
    
    // Parse timezone offset (in seconds)
    const tzOffset = data.gmtOffset;
    
    // Extract time components
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // 1-12
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    
    // Calculate approximate sunrise/sunset using simple formula
    // This is a very basic approximation and should be replaced with accurate calculations
    const { sunrise, sunset, dayLength, solarNoon } = this.estimateSunriseSunset(
      dayOfYear, latitude, tzOffset
    );
    
    return {
      timestamp: data.timestamp * 1000,
      iso8601: new Date(data.timestamp * 1000).toISOString(),
      timezone: {
        id: data.zoneName,
        name: data.zoneName,
        abbr: tzAbbr,
        offset: tzOffset,
        isDST,
      },
      calendar: {
        year,
        month,
        day,
        hour,
        minute,
        second,
      },
      sun: {
        rise: sunrise,
        set: sunset,
        noon: solarNoon,
        dayLength,
      },
      source: this.name,
    };
  }

  /**
   * Get the day of year (1-366)
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Estimate sunrise and sunset times based on latitude and day of year
   * This is a simple approximation!
   */
  private estimateSunriseSunset(dayOfYear: number, latitude: number, tzOffset: number): {
    sunrise: number;
    sunset: number;
    dayLength: number;
    solarNoon: number;
  } {
    // Simple formula for solar declination
    const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
    
    // Convert latitude to radians
    const latRad = (latitude * Math.PI) / 180;
    
    // Calculate day length in hours
    const dayLengthHours = 24 - (24 / Math.PI) * Math.acos(
      (Math.sin((0.8333 * Math.PI) / 180) + Math.sin(latRad) * Math.sin((declination * Math.PI) / 180)) /
      (Math.cos(latRad) * Math.cos((declination * Math.PI) / 180))
    );
    
    // Solar noon is approximately at 12:00 local time
    const solarNoonHour = 12;
    
    // Calculate sunrise and sunset hours
    const sunriseHour = solarNoonHour - dayLengthHours / 2;
    const sunsetHour = solarNoonHour + dayLengthHours / 2;
    
    // Convert to timestamps
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sunrise = new Date(todayDate.getTime() + sunriseHour * 60 * 60 * 1000 + tzOffset * 1000).getTime();
    const sunset = new Date(todayDate.getTime() + sunsetHour * 60 * 60 * 1000 + tzOffset * 1000).getTime();
    const solarNoon = new Date(todayDate.getTime() + solarNoonHour * 60 * 60 * 1000 + tzOffset * 1000).getTime();
    
    return {
      sunrise,
      sunset,
      dayLength: dayLengthHours * 60 * 60 * 1000, // Convert to milliseconds
      solarNoon,
    };
  }

  /**
   * Get the appropriate endpoint for the given category
   */
  private getEndpointForCategory(): string {
    switch (this.category) {
      case APICategory.TIME:
        return 'get-time-zone';
      case APICategory.TIMEZONE:
        return 'get-time-zone';
      default:
        return 'get-time-zone';
    }
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

// Factory function to create TimeZoneDB providers
export function createTimeZoneDBProvider(
  category: APICategory, 
  priority: number = 1,
  config: Partial<TimeZoneDBConfig> = {}
): TimeZoneDBProvider {
  return new TimeZoneDBProvider(category, priority, config);
}
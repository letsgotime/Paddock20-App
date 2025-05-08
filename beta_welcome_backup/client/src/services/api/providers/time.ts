/**
 * PADDOCK20 Time API Providers
 * 
 * This module contains providers for time and timezone related APIs.
 */

import { 
  APICategory, 
  APIProvider, 
  APIRequest, 
  APIResponse,
  HealthStatusType 
} from '../types/core';

import axios from 'axios';

/**
 * TimeZoneDB Provider
 * 
 * Implementation of the TimeZoneDB API for timezone data.
 * https://timezonedb.com/api
 */
export class TimeZoneDBProvider implements APIProvider {
  name = 'TimeZoneDB';
  category = APICategory.TIME;
  priority = 10;
  
  // Rate limiting - TimeZoneDB free tier has a limit of 1 request per second
  private requestsThisSecond = 0;
  private lastRequestTime = 0;
  
  /**
   * Execute a request to the TimeZoneDB API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    const apiKey = import.meta.env.VITE_TIMEZONEDB_API_KEY || process.env.TIMEZONEDB_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 'no_api_key',
          message: 'TimeZoneDB API key is missing',
          reason: 'AUTHENTICATION_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Apply rate limiting to avoid exceeding API limits
    await this.applyRateLimit();
    
    try {
      let endpoint = 'https://api.timezonedb.com/v2.1/get-time-zone';
      let params: Record<string, any> = {
        key: apiKey,
        format: 'json',
        by: 'position', // Default lookup method
        ...request.params,
      };
      
      // Ensure we have the necessary parameters based on the lookup method
      if (params.by === 'position' && (!params.lat || !params.lng)) {
        return {
          success: false,
          error: {
            code: 'missing_coordinates',
            message: 'Latitude and longitude are required for position-based lookup',
            reason: 'VALIDATION_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      } else if (params.by === 'zone' && !params.zone) {
        return {
          success: false,
          error: {
            code: 'missing_zone',
            message: 'Zone name is required for zone-based lookup',
            reason: 'VALIDATION_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      }
      
      // Different endpoint based on the request type
      switch (request.endpoint) {
        case 'get_time_zone':
          // Default endpoint is already set
          break;
          
        case 'list_time_zones':
          endpoint = 'https://api.timezonedb.com/v2.1/list-time-zone';
          break;
          
        case 'convert_time_zone':
          endpoint = 'https://api.timezonedb.com/v2.1/convert-time-zone';
          
          if (!params.from || !params.to || !params.time) {
            return {
              success: false,
              error: {
                code: 'missing_parameters',
                message: 'From timezone, to timezone, and time are required for conversion',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          break;
          
        default:
          // Default to get-time-zone
          break;
      }
      
      // Execute the request
      const response = await axios.get(endpoint, { params });
      
      // Check if the API returned an error status
      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: {
            code: response.data.status,
            message: response.data.message || 'Unknown TimeZoneDB error',
            reason: 'UNKNOWN_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      }
      
      // Process the response
      const transformedData = this.transformData<T>(response.data, request.endpoint);
      
      return {
        success: true,
        data: transformedData,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('TimeZoneDB API error:', error);
      
      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'unknown',
          message: error.message || 'Unknown error',
          reason: this.mapErrorReason(error),
          details: error.response?.data,
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Apply rate limiting to avoid exceeding API limits
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const secondsSinceLastRequest = (now - this.lastRequestTime) / 1000;
    
    // Reset counter if more than a second has passed
    if (secondsSinceLastRequest >= 1) {
      this.requestsThisSecond = 0;
    }
    
    // If we've hit the rate limit, wait until the next second
    if (this.requestsThisSecond >= 1) {
      const timeToWait = 1000 - (now % 1000) + 50; // Wait until next second + 50ms buffer
      await new Promise(resolve => setTimeout(resolve, timeToWait));
      this.requestsThisSecond = 0;
    }
    
    // Track this request
    this.requestsThisSecond++;
    this.lastRequestTime = now;
  }
  
  /**
   * Transform data based on the endpoint type
   */
  private transformData<T>(data: any, endpoint?: string): T {
    // For list-time-zone, add some calculated fields to each zone
    if (endpoint === 'list_time_zones' && Array.isArray(data.zones)) {
      data.zones = data.zones.map(zone => {
        // Add readable offset in hours
        const offsetHours = zone.gmtOffset / 3600;
        const offsetSign = offsetHours >= 0 ? '+' : '-';
        const offsetAbsHours = Math.abs(Math.floor(offsetHours));
        const offsetMinutes = Math.abs(Math.floor((offsetHours % 1) * 60));
        
        return {
          ...zone,
          offsetHours,
          offsetFormatted: `GMT${offsetSign}${offsetAbsHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`,
        };
      });
    }
    
    // For single time zone, add calculated fields
    if (endpoint === 'get_time_zone' || endpoint === 'convert_time_zone') {
      // Add readable offset in hours
      const offsetHours = data.gmtOffset / 3600;
      const offsetSign = offsetHours >= 0 ? '+' : '-';
      const offsetAbsHours = Math.abs(Math.floor(offsetHours));
      const offsetMinutes = Math.abs(Math.floor((offsetHours % 1) * 60));
      
      data.offsetHours = offsetHours;
      data.offsetFormatted = `GMT${offsetSign}${offsetAbsHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
      
      // Add parsed date
      if (data.timestamp) {
        data.dateTime = new Date(data.timestamp * 1000);
        data.localTimeFormatted = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: data.zoneName,
        }).format(data.dateTime);
      }
    }
    
    return data as T;
  }
  
  /**
   * Map error responses to standard error reasons
   */
  private mapErrorReason(error: any): 'NETWORK_ERROR' | 'AUTHENTICATION_ERROR' | 'RATE_LIMIT_ERROR' | 'SERVER_ERROR' | 'RESOURCE_NOT_FOUND' | 'UNKNOWN_ERROR' {
    const status = error.response?.status;
    
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
    
    switch (status) {
      case 401:
      case 403:
        return 'AUTHENTICATION_ERROR';
      case 404:
        return 'RESOURCE_NOT_FOUND';
      case 429:
        return 'RATE_LIMIT_ERROR';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
  
  /**
   * Check the health status of the TimeZoneDB API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    const apiKey = import.meta.env.VITE_TIMEZONEDB_API_KEY || process.env.TIMEZONEDB_API_KEY;
    
    if (!apiKey) {
      return 'unavailable';
    }
    
    try {
      // Simple health check - just verify we can connect and get a valid response
      const response = await axios.get('https://api.timezonedb.com/v2.1/list-time-zone', {
        params: {
          key: apiKey,
          format: 'json',
          fields: 'countryCode',
          country: 'US',
          limit: 1
        },
        timeout: 5000, // 5 second timeout
      });
      
      return (response.status === 200 && response.data.status === 'OK') ? 'healthy' : 'degraded';
    } catch (error: any) {
      // Check if it's an authentication issue or a rate limiting issue
      if (error.response?.status === 401 || error.response?.status === 403) {
        return 'unavailable'; // API key issue
      } else if (error.response?.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    }
  }
}

/**
 * WorldTime API Provider
 * 
 * Implementation of the WorldTime API as a fallback for timezone data.
 * Completely free with no authentication required.
 * http://worldtimeapi.org/
 */
export class WorldTimeProvider implements APIProvider {
  name = 'WorldTime';
  category = APICategory.TIME;
  priority = 5; // Lower priority than TimeZoneDB
  
  /**
   * Execute a request to the WorldTime API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    try {
      let endpoint = 'http://worldtimeapi.org/api';
      
      // Determine the specific endpoint based on the requested data
      switch (request.endpoint) {
        case 'get_time_zone':
          if (request.params?.timezone) {
            endpoint = `${endpoint}/timezone/${request.params.timezone}`;
          } else if (request.params?.lat && request.params?.lng) {
            // WorldTime API doesn't support lat/lng lookup directly
            // We would need to determine the timezone from coordinates first
            // For now, fallback to UTC as a safe default
            endpoint = `${endpoint}/ip`; // Use IP-based lookup as fallback
          } else {
            endpoint = `${endpoint}/ip`; // Default to IP-based lookup
          }
          break;
          
        case 'list_time_zones':
          endpoint = `${endpoint}/timezone`;
          break;
          
        default:
          endpoint = `${endpoint}/ip`; // Default to IP-based lookup
      }
      
      // Execute the request
      const response = await axios.get(endpoint);
      
      // Process the response data
      const transformedData = this.transformData<T>(response.data, request.endpoint);
      
      return {
        success: true,
        data: transformedData,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('WorldTime API error:', error);
      
      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'unknown',
          message: error.message || 'Unknown error',
          reason: this.mapErrorReason(error),
          details: error.response?.data,
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Transform data from WorldTime API format to our standard format
   */
  private transformData<T>(data: any, endpoint?: string): T {
    // If it's a list of timezones, return as is
    if (endpoint === 'list_time_zones' && Array.isArray(data)) {
      return {
        status: 'OK',
        zones: data.map(zone => ({
          zoneName: zone,
          countryCode: zone.split('/')[0],
          countryName: zone.split('/')[0],
        })),
      } as unknown as T;
    }
    
    // For single timezone data, transform to match TimeZoneDB format for consistency
    const utcOffset = data.utc_offset || '+00:00';
    const offsetHours = parseInt(utcOffset.substring(0, 3));
    const offsetMinutes = parseInt(utcOffset.substring(4, 6)) * (utcOffset[0] === '-' ? -1 : 1);
    const gmtOffset = (offsetHours * 3600) + (offsetMinutes * 60);
    
    return {
      status: 'OK',
      zoneName: data.timezone,
      countryCode: data.timezone ? data.timezone.split('/')[0] : 'Unknown',
      countryName: data.timezone ? data.timezone.split('/')[0] : 'Unknown',
      gmtOffset,
      dst: data.dst ? '1' : '0',
      timestamp: Math.floor(new Date(data.datetime).getTime() / 1000),
      formatted: data.datetime,
      abbreviation: data.abbreviation,
      offsetHours,
      offsetFormatted: utcOffset,
      dateTime: new Date(data.datetime),
      localTimeFormatted: new Date(data.datetime).toLocaleString(),
    } as unknown as T;
  }
  
  /**
   * Map error responses to standard error reasons
   */
  private mapErrorReason(error: any): 'NETWORK_ERROR' | 'RATE_LIMIT_ERROR' | 'SERVER_ERROR' | 'RESOURCE_NOT_FOUND' | 'UNKNOWN_ERROR' {
    const status = error.response?.status;
    
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
    
    switch (status) {
      case 404:
        return 'RESOURCE_NOT_FOUND';
      case 429:
        return 'RATE_LIMIT_ERROR';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
  
  /**
   * Check the health status of the WorldTime API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Simple health check - just verify we can connect
      const response = await axios.get('http://worldtimeapi.org/api/ip', {
        timeout: 5000, // 5 second timeout
      });
      
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (error: any) {
      if (error.response?.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    }
  }
}

/**
 * Register all time providers with the API Data Warehouse
 */
export function registerTimeProviders(warehouse: any): void {
  // Register TimeZoneDB provider
  const timeZoneDBProvider = new TimeZoneDBProvider();
  warehouse.registerProvider(APICategory.TIME, timeZoneDBProvider, 10);
  
  // Register WorldTime provider as a fallback
  const worldTimeProvider = new WorldTimeProvider();
  warehouse.registerProvider(APICategory.TIME, worldTimeProvider, 5);
  
  console.log(`Registered time providers: ${timeZoneDBProvider.name}, ${worldTimeProvider.name}`);
}
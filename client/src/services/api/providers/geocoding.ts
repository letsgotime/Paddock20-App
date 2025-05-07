/**
 * PADDOCK20 Geocoding API Providers
 * 
 * This module contains geocoding providers for the API Data Warehouse.
 * These providers convert between addresses/place names and coordinates.
 */

import { 
  APICategory, 
  APIProvider, 
  APIRequest, 
  APIResponse,
  HealthStatusType 
} from '../types/core';

/**
 * IP-based Location Provider
 * Uses IPInfo service to get approximate location from IP
 */
export class IPInfoProvider implements APIProvider {
  name = 'IPInfo';
  category = APICategory.GEOCODING;
  priority = 10;
  
  private token: string;
  private baseUrl = 'https://ipinfo.io';
  
  constructor(token?: string) {
    this.token = token || import.meta.env.VITE_IPINFO_TOKEN || '';
  }
  
  /**
   * Execute a geocoding API request
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    const { endpoint } = request;
    
    try {
      if (endpoint === 'ip_location') {
        return await this.getLocationFromIP() as unknown as APIResponse<T>;
      } else {
        return {
          success: false,
          error: {
            code: 'unsupported_endpoint',
            message: `IPInfo provider does not support the ${endpoint} endpoint`,
            reason: 'VALIDATION_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      }
    } catch (error) {
      console.error('IPInfo provider error:', error);
      
      return {
        success: false,
        error: {
          code: 'ipinfo_error',
          message: `IPInfo API error: ${error instanceof Error ? error.message : String(error)}`,
          reason: 'UNKNOWN_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Get user's approximate location from their IP address
   */
  private async getLocationFromIP(): Promise<APIResponse<any>> {
    // Check if we have a token
    const authParam = this.token ? `?token=${this.token}` : '';
    
    // Call the IPInfo API
    const response = await fetch(`${this.baseUrl}/json${authParam}`);
    
    if (!response.ok) {
      const status = response.status;
      let reason = 'API_ERROR';
      
      if (status === 401 || status === 403) {
        reason = 'AUTH_ERROR';
      } else if (status === 429) {
        reason = 'RATE_LIMIT';
      }
      
      return {
        success: false,
        error: {
          code: `ipinfo_${status}`,
          message: `IPInfo API error: ${response.statusText}`,
          reason: reason as any,
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract coordinates from "loc" which is a string like "37.7749,-122.4194"
    let lat = null;
    let lon = null;
    
    if (data.loc && typeof data.loc === 'string') {
      const [latStr, lonStr] = data.loc.split(',');
      lat = parseFloat(latStr);
      lon = parseFloat(lonStr);
    }
    
    // Verify coordinates are valid
    if (isNaN(lat!) || isNaN(lon!)) {
      return {
        success: false,
        error: {
          code: 'invalid_coordinates',
          message: 'IPInfo returned invalid coordinates',
          reason: 'API_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Transform data to standardized format
    const transformedData = {
      location: {
        lat,
        lon,
        city: data.city,
        region: data.region,
        country: data.country,
        postal: data.postal,
        timezone: data.timezone,
        ip: data.ip,
      },
      accuracy: 'low', // IP-based location is generally low accuracy
      source: 'ipinfo',
    };
    
    return {
      success: true,
      data: transformedData,
      fromCache: false,
      provider: this.name,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Check the health status of the IPInfo API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Use a simple API call to check health
      const authParam = this.token ? `?token=${this.token}` : '';
      const response = await fetch(`${this.baseUrl}/json${authParam}`);
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else if (response.status === 401 || response.status === 403) {
        return 'unavailable'; // Authentication issues
      } else {
        return 'degraded'; // Other issues
      }
    } catch (error) {
      console.error('IPInfo health check error:', error);
      return 'unavailable';
    }
  }
}

/**
 * Open Street Map Geocoding Provider (Nominatim)
 * Uses Nominatim service for address-to-coordinate and reverse geocoding
 */
export class NominatimProvider implements APIProvider {
  name = 'OpenStreetMap';
  category = APICategory.GEOCODING;
  priority = 5;
  
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent = 'PADDOCK20-Geocoding-App';
  
  /**
   * Execute a geocoding API request
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    const { endpoint, params } = request;
    
    try {
      switch (endpoint) {
        case 'geocode':
          // Address to coordinates
          return await this.forwardGeocode(params) as unknown as APIResponse<T>;
          
        case 'reverse':
          // Coordinates to address
          return await this.reverseGeocode(params) as unknown as APIResponse<T>;
          
        default:
          return {
            success: false,
            error: {
              code: 'unsupported_endpoint',
              message: `Nominatim provider does not support the ${endpoint} endpoint`,
              reason: 'VALIDATION_ERROR',
            },
            fromCache: false,
            provider: this.name,
          };
      }
    } catch (error) {
      console.error('Nominatim provider error:', error);
      
      return {
        success: false,
        error: {
          code: 'nominatim_error',
          message: `Nominatim API error: ${error instanceof Error ? error.message : String(error)}`,
          reason: 'UNKNOWN_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Forward geocoding (address to coordinates)
   */
  private async forwardGeocode(params: any): Promise<APIResponse<any>> {
    const { query, limit = 1 } = params || {};
    
    if (!query) {
      return {
        success: false,
        error: {
          code: 'missing_query',
          message: 'A search query is required for forward geocoding',
          reason: 'VALIDATION_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Call the Nominatim API
    const apiUrl = new URL(`${this.baseUrl}/search`);
    apiUrl.searchParams.append('q', query);
    apiUrl.searchParams.append('format', 'json');
    apiUrl.searchParams.append('limit', limit.toString());
    
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent': this.userAgent,
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: `nominatim_${response.status}`,
          message: `Nominatim API error: ${response.statusText}`,
          reason: 'API_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Parse the response
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return {
        success: false,
        error: {
          code: 'no_results',
          message: 'No results found for the provided query',
          reason: 'API_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Transform the results
    const transformedData = data.map((item: any) => ({
      location: {
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        name: item.display_name,
        type: item.type,
        class: item.class,
        importance: item.importance,
      },
      accuracy: 'high', // Address-based geocoding is generally high accuracy
      source: 'nominatim',
    }));
    
    return {
      success: true,
      data: limit === 1 ? transformedData[0] : transformedData,
      fromCache: false,
      provider: this.name,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Reverse geocoding (coordinates to address)
   */
  private async reverseGeocode(params: any): Promise<APIResponse<any>> {
    const { lat, lon } = params || {};
    
    if (lat === undefined || lon === undefined) {
      return {
        success: false,
        error: {
          code: 'missing_coordinates',
          message: 'Latitude and longitude are required for reverse geocoding',
          reason: 'VALIDATION_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Call the Nominatim API
    const apiUrl = new URL(`${this.baseUrl}/reverse`);
    apiUrl.searchParams.append('lat', lat.toString());
    apiUrl.searchParams.append('lon', lon.toString());
    apiUrl.searchParams.append('format', 'json');
    
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent': this.userAgent,
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: `nominatim_${response.status}`,
          message: `Nominatim API error: ${response.statusText}`,
          reason: 'API_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Parse the response
    const data = await response.json();
    
    if (!data || data.error) {
      return {
        success: false,
        error: {
          code: 'nominatim_error',
          message: data.error || 'Unknown Nominatim error',
          reason: 'API_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    // Transform the results
    const transformedData = {
      location: {
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        name: data.display_name,
        type: data.type,
        class: data.class,
      },
      address: data.address,
      accuracy: 'high',
      source: 'nominatim',
    };
    
    return {
      success: true,
      data: transformedData,
      fromCache: false,
      provider: this.name,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Check the health status of the Nominatim API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Use a simple API call to check health
      const response = await fetch(`${this.baseUrl}/search?q=London&format=json&limit=1`, {
        headers: {
          'User-Agent': this.userAgent,
        },
      });
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else if (response.status >= 500) {
        return 'unavailable'; // Server error
      } else {
        return 'degraded'; // Other issues
      }
    } catch (error) {
      console.error('Nominatim health check error:', error);
      return 'unavailable';
    }
  }
}

/**
 * Register all geocoding providers with the API Data Warehouse
 */
export function registerGeocodingProviders(warehouse: any): void {
  // Register IPInfo provider
  const ipInfoProvider = new IPInfoProvider();
  warehouse.registerProvider(APICategory.GEOCODING, ipInfoProvider, 10);
  
  // Register Nominatim provider
  const nominatimProvider = new NominatimProvider();
  warehouse.registerProvider(APICategory.GEOCODING, nominatimProvider, 5);
  
  console.log(`Registered geocoding providers: ${ipInfoProvider.name}, ${nominatimProvider.name}`);
}
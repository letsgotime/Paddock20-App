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

import axios from 'axios';

/**
 * IPInfo Provider
 * 
 * Implementation of the IPInfo API provider for geocoding.
 */
export class IPInfoProvider implements APIProvider {
  name = 'IPInfo';
  category = APICategory.GEOCODING;
  priority = 10;
  
  /**
   * Execute a request to the IPInfo API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    const token = import.meta.env.VITE_IPINFO_TOKEN || process.env.IPINFO_TOKEN;
    
    try {
      let endpoint: string;
      let params: Record<string, any> = {};
      
      // Handle different endpoints
      switch (request.endpoint) {
        case 'current':
          // Get location from current IP
          endpoint = 'https://ipinfo.io/json';
          if (token) {
            params.token = token;
          }
          break;
        
        case 'lookup':
          // Look up specific IP
          if (!request.params?.ip) {
            return {
              success: false,
              error: {
                code: 'missing_ip',
                message: 'IP address is required for lookup',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          
          endpoint = `https://ipinfo.io/${request.params.ip}/json`;
          if (token) {
            params.token = token;
          }
          break;
          
        default:
          endpoint = 'https://ipinfo.io/json';
          if (token) {
            params.token = token;
          }
      }
      
      // Execute the request
      const response = await axios.get(endpoint, { params });
      
      // Transform to standardized format
      const transformedData = this.transformData<T>(response.data);
      
      return {
        success: true,
        data: transformedData,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('IPInfo API error:', error);
      
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
   * Transform IPInfo data to our standardized format
   */
  private transformData<T>(data: any): T {
    // Parse the coordinates from the loc field "lat,lon"
    let lat = 0, lon = 0;
    if (data.loc && typeof data.loc === 'string') {
      const [latitude, longitude] = data.loc.split(',').map(parseFloat);
      lat = latitude;
      lon = longitude;
    }
    
    return {
      name: data.city || 'Unknown',
      country: data.country || '',
      region: data.region || '',
      city: data.city || '',
      postal: data.postal || '',
      lat,
      lon,
      ip: data.ip,
      timezone: data.timezone,
      provider: 'ipinfo',
    } as unknown as T;
  }
  
  /**
   * Map error responses to standard error reasons
   */
  private mapErrorReason(error: any): string {
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
   * Check the health status of the IPInfo API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Simple health check - just verify we can connect
      const response = await axios.get('https://ipinfo.io/json', {
        timeout: 3000, // 3 second timeout
      });
      
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (error: any) {
      // Check if it's just an authentication issue or a real service problem
      if (error.response?.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    }
  }
}

/**
 * Nominatim Provider (OpenStreetMap)
 * 
 * Implementation of the Nominatim API provider for geocoding.
 */
export class NominatimProvider implements APIProvider {
  name = 'OpenStreetMap';
  category = APICategory.GEOCODING;
  priority = 5;
  
  /**
   * Execute a request to the Nominatim API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    try {
      let endpoint: string;
      let params: Record<string, any> = {
        format: 'json',
      };
      
      // Handle different endpoints
      switch (request.endpoint) {
        case 'search':
          // Search by query (address, place name, etc.)
          if (!request.params?.q) {
            return {
              success: false,
              error: {
                code: 'missing_query',
                message: 'Query parameter is required for search',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          
          endpoint = 'https://nominatim.openstreetmap.org/search';
          params = {
            ...params,
            q: request.params.q,
            limit: request.params.limit || 5,
            addressdetails: 1,
          };
          break;
          
        case 'reverse':
          // Reverse geocoding (coordinates to address)
          if (!request.params?.lat || !request.params?.lon) {
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
          
          endpoint = 'https://nominatim.openstreetmap.org/reverse';
          params = {
            ...params,
            lat: request.params.lat,
            lon: request.params.lon,
            zoom: request.params.zoom || 18,
            addressdetails: 1,
          };
          break;
          
        default:
          return {
            success: false,
            error: {
              code: 'unsupported_endpoint',
              message: `Endpoint '${request.endpoint}' is not supported by this provider`,
              reason: 'VALIDATION_ERROR',
            },
            fromCache: false,
            provider: this.name,
          };
      }
      
      // Add application identifier
      const headers = {
        'User-Agent': 'PADDOCK20/1.0 (info@gotime.studio)',
      };
      
      // Execute the request
      const response = await axios.get(endpoint, { params, headers });
      
      // Transform to standardized format
      const transformedData = this.transformData<T>(request.endpoint, response.data);
      
      return {
        success: true,
        data: transformedData,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('Nominatim API error:', error);
      
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
   * Transform Nominatim data to our standardized format
   */
  private transformData<T>(endpoint: string, data: any): T {
    if (endpoint === 'search') {
      if (!Array.isArray(data) || data.length === 0) {
        return [] as unknown as T;
      }
      
      return data.map((item: any) => ({
        name: item.display_name || 'Unknown',
        country: item.address?.country || '',
        region: item.address?.state || '',
        city: item.address?.city || item.address?.town || item.address?.village || '',
        postal: item.address?.postcode || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        provider: 'osm',
      })) as unknown as T;
    } else if (endpoint === 'reverse') {
      return {
        name: data.display_name || 'Unknown',
        country: data.address?.country || '',
        region: data.address?.state || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        postal: data.address?.postcode || '',
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        provider: 'osm',
      } as unknown as T;
    }
    
    return data as T;
  }
  
  /**
   * Map error responses to standard error reasons
   */
  private mapErrorReason(error: any): string {
    const status = error.response?.status;
    
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
    
    switch (status) {
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
   * Check the health status of the Nominatim API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Simple health check - just verify we can connect with a sample query
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: 'London',
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'PADDOCK20/1.0 (info@gotime.studio)',
        },
        timeout: 3000, // 3 second timeout
      });
      
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (error: any) {
      // Check if it's just a rate limiting issue or a real service problem
      if (error.response?.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
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
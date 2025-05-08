/**
 * PADDOCK20 Motorsports API Providers
 * 
 * This module contains API providers for motorsports-related data.
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
 * Ergast F1 API Provider
 * 
 * Implementation of the Ergast F1 API for Formula 1 data.
 * Free without registration, provides historical F1 race data.
 * https://ergast.com/mrd/
 */
export class ErgastF1Provider implements APIProvider {
  name = 'ErgastF1';
  category = APICategory.AUTOMOTIVE;
  priority = 10;
  
  // Rate limiting - Ergast API has a limit of 4 requests per second
  private requestsThisSecond = 0;
  private lastRequestTime = 0;
  
  /**
   * Execute a request to the Ergast F1 API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    try {
      // Apply rate limiting to avoid exceeding API limits
      await this.applyRateLimit();
      
      let endpoint = 'https://ergast.com/api/f1';
      let params: Record<string, any> = {
        ...request.params,
        limit: request.params?.limit || 30,
      };
      
      // Determine the specific endpoint based on the requested data
      switch (request.endpoint) {
        case 'current_season':
          endpoint = `${endpoint}/current.json`;
          break;
          
        case 'season':
          if (!params.year) {
            return {
              success: false,
              error: {
                code: 'missing_year',
                message: 'Year parameter is required for season data',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/${params.year}.json`;
          break;
          
        case 'race_results':
          if (!params.year || !params.round) {
            return {
              success: false,
              error: {
                code: 'missing_parameters',
                message: 'Year and round parameters are required for race results',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/${params.year}/${params.round}/results.json`;
          break;
          
        case 'qualifying_results':
          if (!params.year || !params.round) {
            return {
              success: false,
              error: {
                code: 'missing_parameters',
                message: 'Year and round parameters are required for qualifying results',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/${params.year}/${params.round}/qualifying.json`;
          break;
          
        case 'driver_standings':
          if (params.year && params.round) {
            endpoint = `${endpoint}/${params.year}/${params.round}/driverStandings.json`;
          } else if (params.year) {
            endpoint = `${endpoint}/${params.year}/driverStandings.json`;
          } else {
            endpoint = `${endpoint}/current/driverStandings.json`;
          }
          break;
          
        case 'constructor_standings':
          if (params.year && params.round) {
            endpoint = `${endpoint}/${params.year}/${params.round}/constructorStandings.json`;
          } else if (params.year) {
            endpoint = `${endpoint}/${params.year}/constructorStandings.json`;
          } else {
            endpoint = `${endpoint}/current/constructorStandings.json`;
          }
          break;
          
        case 'driver_info':
          if (!params.driverId) {
            return {
              success: false,
              error: {
                code: 'missing_driver_id',
                message: 'Driver ID parameter is required for driver information',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/drivers/${params.driverId}.json`;
          break;
          
        case 'constructor_info':
          if (!params.constructorId) {
            return {
              success: false,
              error: {
                code: 'missing_constructor_id',
                message: 'Constructor ID parameter is required for constructor information',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/constructors/${params.constructorId}.json`;
          break;
          
        case 'circuit_info':
          if (!params.circuitId) {
            return {
              success: false,
              error: {
                code: 'missing_circuit_id',
                message: 'Circuit ID parameter is required for circuit information',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/circuits/${params.circuitId}.json`;
          break;
          
        case 'next_race':
          endpoint = `${endpoint}/current/next.json`;
          break;
          
        case 'last_race':
          endpoint = `${endpoint}/current/last/results.json`;
          break;
          
        default:
          endpoint = `${endpoint}/current.json`;
      }
      
      // Execute the request
      const response = await axios.get(endpoint);
      
      // Process the response and transform the data if needed
      const transformedData = this.transformData<T>(response.data);
      
      return {
        success: true,
        data: transformedData,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('Ergast F1 API error:', error);
      
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
    if (this.requestsThisSecond >= 4) {
      const timeToWait = 1000 - (now % 1000) + 50; // Wait until next second + 50ms buffer
      await new Promise(resolve => setTimeout(resolve, timeToWait));
      this.requestsThisSecond = 0;
    }
    
    // Track this request
    this.requestsThisSecond++;
    this.lastRequestTime = now;
  }
  
  /**
   * Transform the API response data to a standardized format
   */
  private transformData<T>(data: any): T {
    // The Ergast API response is already well-structured, 
    // but we might want to simplify or normalize it
    
    // For now, just return the MRData part which contains the actual data
    return data.MRData as unknown as T;
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
   * Check the health status of the Ergast F1 API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Simple health check - just verify we can connect
      const response = await axios.get('https://ergast.com/api/f1/current.json', {
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
 * NHTSA Vehicle API Provider
 * 
 * Implementation of the NHTSA Vehicle API for automotive data.
 * Free without registration, provides vehicle specifications and safety information.
 * https://vpic.nhtsa.dot.gov/api/
 */
export class NHTSAVehicleProvider implements APIProvider {
  name = 'NHTSA';
  category = APICategory.AUTOMOTIVE;
  priority = 5; // Lower priority than motorsports but still important
  
  /**
   * Execute a request to the NHTSA API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    try {
      let endpoint = 'https://vpic.nhtsa.dot.gov/api/vehicles';
      let params: Record<string, any> = {
        ...request.params,
        format: 'json',
      };
      
      // Determine the specific endpoint based on the requested data
      switch (request.endpoint) {
        case 'decode_vin':
          if (!params.vin) {
            return {
              success: false,
              error: {
                code: 'missing_vin',
                message: 'VIN parameter is required for VIN decoding',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/DecodeVin/${params.vin}`;
          break;
          
        case 'decode_vin_extended':
          if (!params.vin) {
            return {
              success: false,
              error: {
                code: 'missing_vin',
                message: 'VIN parameter is required for extended VIN decoding',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/DecodeVinExtended/${params.vin}`;
          break;
          
        case 'get_makes':
          endpoint = `${endpoint}/GetAllMakes`;
          break;
          
        case 'get_models_for_make':
          if (!params.make) {
            return {
              success: false,
              error: {
                code: 'missing_make',
                message: 'Make parameter is required for getting models',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/GetModelsForMake/${params.make}`;
          break;
          
        case 'get_makes_for_year':
          if (!params.year) {
            return {
              success: false,
              error: {
                code: 'missing_year',
                message: 'Year parameter is required for getting makes by year',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `${endpoint}/GetMakesForVehicleType/${params.year}`;
          break;
          
        case 'get_vehicle_types':
          endpoint = `${endpoint}/GetVehicleTypesForMake/${params.make || ''}`;
          break;
          
        case 'get_recalls':
          if (!params.make || !params.model || !params.year) {
            return {
              success: false,
              error: {
                code: 'missing_parameters',
                message: 'Make, model, and year parameters are required for getting recalls',
                reason: 'VALIDATION_ERROR',
              },
              fromCache: false,
              provider: this.name,
            };
          }
          endpoint = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${params.make}&model=${params.model}&modelYear=${params.year}`;
          break;
          
        default:
          endpoint = `${endpoint}/GetAllMakes`;
      }
      
      // Execute the request
      const response = await axios.get(endpoint, { params });
      
      return {
        success: true,
        data: response.data as T,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('NHTSA API error:', error);
      
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
   * Check the health status of the NHTSA API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Simple health check - just verify we can connect
      const response = await axios.get('https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json', {
        timeout: 5000, // 5 second timeout
      });
      
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (error: any) {
      return 'unavailable';
    }
  }
}

/**
 * Register all motorsports and automotive providers with the API Data Warehouse
 */
export function registerMotorsportsProviders(warehouse: any): void {
  // Register Ergast F1 provider
  const ergastF1Provider = new ErgastF1Provider();
  warehouse.registerProvider(APICategory.AUTOMOTIVE, ergastF1Provider, 10);
  
  // Register NHTSA Vehicle provider
  const nhtsaVehicleProvider = new NHTSAVehicleProvider();
  warehouse.registerProvider(APICategory.AUTOMOTIVE, nhtsaVehicleProvider, 5);
  
  console.log(`Registered motorsports providers: ${ergastF1Provider.name}, ${nhtsaVehicleProvider.name}`);
}
import { BaseProvider, ProviderResponse } from '../core/provider';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// Types for aviation data - based on the Aviationstack API
export interface Airport {
  airport_name: string;
  iata_code: string;
  icao_code: string;
  latitude: number;
  longitude: number;
  geoname_id: string;
  timezone: string;
  country_name: string;
  country_iso2: string;
  city_iata_code: string;
}

export interface Airline {
  airline_name: string;
  airline_iata: string;
  airline_icao: string;
  airline_country: string;
  callsign: string;
  fleet_size: number;
  fleet_average_age: number;
}

export interface Flight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    delay: number;
    scheduled: string;
    estimated: string;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    baggage: string;
    delay: number;
    scheduled: string;
    estimated: string;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  flight: {
    number: string;
    iata: string;
    icao: string;
    codeshared: null | {
      airline_name: string;
      airline_iata: string;
      airline_icao: string;
      flight_number: string;
      flight_iata: string;
      flight_icao: string;
    };
  };
  aircraft: null | {
    registration: string;
    iata: string;
    icao: string;
    icao24: string;
  };
  live: null | {
    updated: string;
    latitude: number;
    longitude: number;
    altitude: number;
    direction: number;
    speed_horizontal: number;
    speed_vertical: number;
    is_ground: boolean;
  };
}

export interface NearbyFlightsResponse {
  timestamp: string;
  location: {
    lat: number;
    lon: number;
  };
  radius: number;
  nearby_airports: number;
  flights: Flight[];
  data_attribution: string;
}

// Local storage with TTL helper
const localStorage = createLocalStorageWithExpiry();

/**
 * Aviation API Provider
 * 
 * This provider integrates with our backend aviation API endpoints, which in turn
 * use the Aviationstack API to fetch flight, airport, and airline information
 */
export class AviationProvider extends BaseProvider {
  private cachePrefix = 'aviation_cache';
  private cacheTTL = 30 * 60 * 1000; // 30 minutes cache for most data
  
  constructor() {
    super('Aviation', 'aviation', 7); // Higher priority (7/10)
  }
  
  /**
   * Get nearby flights based on location
   */
  async getNearbyFlights(lat: number, lon: number, radius: number = 100): Promise<ProviderResponse<NearbyFlightsResponse>> {
    try {
      // Create cache key
      const cacheKey = `${this.cachePrefix}_nearby_${lat}_${lon}_${radius}`;
      
      // Check cache first
      const cachedData = localStorage.getItem<NearbyFlightsResponse>(cacheKey);
      if (cachedData) {
        console.log('Using cached aviation nearby flights data');
        return {
          success: true,
          data: cachedData,
          provider: this.name,
          timestamp: Date.now()
        };
      }
      
      // Make request to backend API
      const result = await this.makeRequest<NearbyFlightsResponse>({
        method: 'GET',
        url: `/api/aviation/nearby`,
        params: { lat, lon, radius }
      });
      
      if (result.error || !result.data) {
        return this.handleError(
          new Error(result.error || 'Failed to fetch nearby flights'),
          'Failed to fetch aviation data'
        );
      }
      
      // Cache the result
      localStorage.setItem(cacheKey, result.data, this.cacheTTL);
      
      return {
        success: true,
        data: result.data,
        provider: this.name,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.handleError(
        error,
        'An error occurred while fetching nearby flights'
      );
    }
  }
  
  /**
   * Get airports data
   */
  async getAirports(params: Record<string, any> = {}): Promise<ProviderResponse<{ data: Airport[] }>> {
    try {
      // Create cache key
      const cacheKey = `${this.cachePrefix}_airports_${JSON.stringify(params)}`;
      
      // Check cache first, use longer TTL for airports (they rarely change)
      const cachedData = localStorage.getItem<{ data: Airport[] }>(cacheKey);
      if (cachedData) {
        console.log('Using cached aviation airports data');
        return {
          success: true,
          data: cachedData,
          provider: this.name,
          timestamp: Date.now()
        };
      }
      
      // Make request to backend API
      const result = await this.makeRequest<{ data: Airport[] }>({
        method: 'GET',
        url: `/api/aviation/airports`,
        params
      });
      
      if (result.error || !result.data) {
        return this.handleError(
          new Error(result.error || 'Failed to fetch airports'),
          'Failed to fetch aviation airport data'
        );
      }
      
      // Cache the result for a day (airports don't change often)
      localStorage.setItem(cacheKey, result.data, 24 * 60 * 60 * 1000);
      
      return {
        success: true,
        data: result.data,
        provider: this.name,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.handleError(
        error,
        'An error occurred while fetching airport data'
      );
    }
  }
  
  /**
   * Get flights data
   */
  async getFlights(params: Record<string, any> = {}): Promise<ProviderResponse<{ data: Flight[] }>> {
    try {
      // Create cache key
      const cacheKey = `${this.cachePrefix}_flights_${JSON.stringify(params)}`;
      
      // Check cache first
      const cachedData = localStorage.getItem<{ data: Flight[] }>(cacheKey);
      if (cachedData) {
        console.log('Using cached aviation flights data');
        return {
          success: true,
          data: cachedData,
          provider: this.name,
          timestamp: Date.now()
        };
      }
      
      // Make request to backend API
      const result = await this.makeRequest<{ data: Flight[] }>({
        method: 'GET',
        url: `/api/aviation/flights`,
        params
      });
      
      if (result.error || !result.data) {
        return this.handleError(
          new Error(result.error || 'Failed to fetch flights'),
          'Failed to fetch aviation flight data'
        );
      }
      
      // Cache the result
      localStorage.setItem(cacheKey, result.data, this.cacheTTL);
      
      return {
        success: true,
        data: result.data,
        provider: this.name,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.handleError(
        error,
        'An error occurred while fetching flight data'
      );
    }
  }
  
  /**
   * Get airlines data
   */
  async getAirlines(params: Record<string, any> = {}): Promise<ProviderResponse<{ data: Airline[] }>> {
    try {
      // Create cache key
      const cacheKey = `${this.cachePrefix}_airlines_${JSON.stringify(params)}`;
      
      // Check cache first - long TTL for airlines (they rarely change)
      const cachedData = localStorage.getItem<{ data: Airline[] }>(cacheKey);
      if (cachedData) {
        console.log('Using cached aviation airlines data');
        return {
          success: true,
          data: cachedData,
          provider: this.name,
          timestamp: Date.now()
        };
      }
      
      // Make request to backend API
      const result = await this.makeRequest<{ data: Airline[] }>({
        method: 'GET',
        url: `/api/aviation/airlines`,
        params
      });
      
      if (result.error || !result.data) {
        return this.handleError(
          new Error(result.error || 'Failed to fetch airlines'),
          'Failed to fetch aviation airline data'
        );
      }
      
      // Cache the result for a day (airlines don't change often)
      localStorage.setItem(cacheKey, result.data, 24 * 60 * 60 * 1000);
      
      return {
        success: true,
        data: result.data,
        provider: this.name,
        timestamp: Date.now()
      };
    } catch (error) {
      return this.handleError(
        error,
        'An error occurred while fetching airline data'
      );
    }
  }
}

// Export singleton instance
export const aviationProvider = new AviationProvider();
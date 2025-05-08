/**
 * Aviationstack API Service
 * 
 * Implements the Aviationstack aviation API with:
 * - Ultra-aggressive caching (7+ days for most requests)
 * - Request counting and limiting (max 100 calls per month)
 * - Detailed usage analytics
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1';
const AVIATIONSTACK_API_KEY = '4c5bc681f630bd4d4dd2441022089466';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Rate limiting & cache configuration
const CACHE_TTL_DAYS = 14; // 14 days cache to keep API usage extremely low (only ~3 calls per month)
const AVIATIONSTACK_CACHE_KEY = 'aviationstack_cache';
const USAGE_STATS_KEY = 'aviationstack_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'aviationstack_last_request_timestamp';

// Monthly request limit (free tier is 100/month, strict limit)
const MONTHLY_REQUEST_LIMIT = 96; // Setting to 96 to provide a small safety margin

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for API response from Aviationstack
export interface AviationstackResponse<T> {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: T[];
}

export interface AviationstackFlight {
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

export interface AviationstackAirport {
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

export interface AviationstackAirline {
  airline_name: string;
  airline_iata: string;
  airline_icao: string;
  airline_country: string;
  callsign: string;
  fleet_size: number;
  fleet_average_age: number;
}

// Interface for usage statistics
interface UsageStats {
  requestsThisMonth: number;
  monthlyQuota: number;
  monthStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    endpoint: string;
    query: string;
    cacheHit: boolean;
  }[];
}

/**
 * Aviationstack Service class for aviation data
 */
class AviationstackService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private isLoadingCache: boolean = false;
  private usageStats: UsageStats;
  private lastRequestTime: number = 0;
  
  constructor() {
    // Initialize usage stats
    const savedStats = localStorage.getItem<UsageStats>(USAGE_STATS_KEY);
    
    if (savedStats) {
      this.usageStats = savedStats;
      
      // Check if we need to reset the monthly counter
      if (this.shouldResetMonthlyCounter()) {
        this.resetMonthlyCounter();
      }
    } else {
      // Initialize new usage stats
      this.usageStats = {
        requestsThisMonth: 0,
        monthlyQuota: MONTHLY_REQUEST_LIMIT,
        monthStartTimestamp: this.getCurrentMonthStart(),
        lastResetTimestamp: Date.now(),
        apiCallLog: []
      };
      this.saveUsageStats();
    }
    
    this.loadCacheFromStorage();
    
    // Get last request time from storage
    const lastRequestTime = localStorage.getItem<number>(LAST_REQUEST_TIMESTAMP_KEY);
    if (lastRequestTime) {
      this.lastRequestTime = lastRequestTime;
    }
  }
  
  /**
   * Load cache from persistent storage
   */
  private async loadCacheFromStorage(): Promise<void> {
    if (this.isLoadingCache) return;
    this.isLoadingCache = true;
    
    try {
      const cachedData = localStorage.getItem(AVIATIONSTACK_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Aviationstack cache entries`);
      }
    } catch (error) {
      console.error('Failed to load Aviationstack cache from storage:', error);
    } finally {
      this.isLoadingCache = false;
    }
  }
  
  /**
   * Save current cache to persistent storage
   */
  private saveCache(): void {
    try {
      const cacheObject: Record<string, any> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      localStorage.setItem(AVIATIONSTACK_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Aviationstack cache to storage:', error);
    }
  }
  
  /**
   * Save usage statistics to storage
   */
  private saveUsageStats(): void {
    localStorage.setItem(USAGE_STATS_KEY, this.usageStats);
  }
  
  /**
   * Get the start timestamp of the current month
   */
  private getCurrentMonthStart(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }
  
  /**
   * Check if the monthly counter should be reset
   */
  private shouldResetMonthlyCounter(): boolean {
    const currentMonthStart = this.getCurrentMonthStart();
    return currentMonthStart > this.usageStats.monthStartTimestamp;
  }
  
  /**
   * Reset the monthly API call counter
   */
  private resetMonthlyCounter(): void {
    console.log('Resetting Aviationstack monthly API counter');
    this.usageStats.requestsThisMonth = 0;
    this.usageStats.monthStartTimestamp = this.getCurrentMonthStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(endpoint: string, query: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsThisMonth++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
      endpoint,
      query,
      cacheHit
    });
    
    // Trim the log if it gets too large
    if (this.usageStats.apiCallLog.length > 100) {
      this.usageStats.apiCallLog = this.usageStats.apiCallLog.slice(-100);
    }
    
    this.saveUsageStats();
  }
  
  /**
   * Check if we've exceeded our monthly API call quota
   */
  private hasExceededQuota(): boolean {
    return this.usageStats.requestsThisMonth >= this.usageStats.monthlyQuota;
  }
  
  /**
   * Generate a cache key for a request
   */
  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }
  
  /**
   * Make a generic API request with cache
   */
  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    cacheDays: number = CACHE_TTL_DAYS
  ): Promise<T> {
    const queryDescription = params.flight_iata || params.airline_iata || params.flight_icao || JSON.stringify(params);
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Aviationstack monthly API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cacheKey = this.getCacheKey(endpoint, params);
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall(endpoint, queryDescription, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Use cache if not expired
      if (cacheAgeDays < cacheDays) {
        console.log(`Using cached Aviationstack data (${cacheAgeDays.toFixed(1)} days old) for ${endpoint}`);
        this.recordApiCall(endpoint, queryDescription, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const url = `${AVIATIONSTACK_BASE_URL}${endpoint}`;
      
      // Add API key to params
      const requestParams = {
        access_key: AVIATIONSTACK_API_KEY,
        ...params
      };
      
      // Make the API request
      const response = await axios.get(url, {
        params: requestParams,
        headers: {
          'User-Agent': USER_AGENT
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Check for errors
      if (response.data.error) {
        throw new Error(response.data.error.info || 'Unknown API error');
      }
      
      // Cache successful response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      this.saveCache();
      
      // Record API call
      this.recordApiCall(endpoint, queryDescription, false);
      return response.data;
    } catch (error) {
      console.error(`Error with Aviationstack API request to ${endpoint}:`, error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for ${endpoint}`);
        return cachedData.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get real-time flights data
   * @param params Query parameters for the API
   */
  async getRealTimeFlights(params: Record<string, any> = {}): Promise<AviationstackResponse<AviationstackFlight>> {
    return this.makeRequest<AviationstackResponse<AviationstackFlight>>('/flights', params);
  }
  
  /**
   * Get information about a specific flight by IATA code
   * @param flightIata IATA flight code (e.g., 'BA123')
   */
  async getFlightByIata(flightIata: string): Promise<AviationstackResponse<AviationstackFlight>> {
    return this.makeRequest<AviationstackResponse<AviationstackFlight>>('/flights', { flight_iata: flightIata });
  }
  
  /**
   * Get information about a specific flight by ICAO code
   * @param flightIcao ICAO flight code (e.g., 'BAW123')
   */
  async getFlightByIcao(flightIcao: string): Promise<AviationstackResponse<AviationstackFlight>> {
    return this.makeRequest<AviationstackResponse<AviationstackFlight>>('/flights', { flight_icao: flightIcao });
  }
  
  /**
   * Get flights for a specific date
   * @param date Date in YYYY-MM-DD format
   */
  async getFlightsByDate(date: string): Promise<AviationstackResponse<AviationstackFlight>> {
    return this.makeRequest<AviationstackResponse<AviationstackFlight>>('/flights', { flight_date: date });
  }
  
  /**
   * Get flights by airline
   * @param airlineIata IATA airline code (e.g., 'BA' for British Airways)
   */
  async getFlightsByAirline(airlineIata: string): Promise<AviationstackResponse<AviationstackFlight>> {
    return this.makeRequest<AviationstackResponse<AviationstackFlight>>('/flights', { airline_iata: airlineIata });
  }
  
  /**
   * Get flights by flight status
   * @param status Flight status (e.g., 'scheduled', 'active', 'landed', 'cancelled', 'incident', 'diverted')
   */
  async getFlightsByStatus(status: string): Promise<AviationstackResponse<AviationstackFlight>> {
    return this.makeRequest<AviationstackResponse<AviationstackFlight>>('/flights', { flight_status: status });
  }
  
  /**
   * Get airport information
   * @param params Query parameters for the API
   */
  async getAirports(params: Record<string, any> = {}): Promise<AviationstackResponse<AviationstackAirport>> {
    // Use longer cache for airports data (airports don't change often)
    return this.makeRequest<AviationstackResponse<AviationstackAirport>>('/airports', params, 30);
  }
  
  /**
   * Get airline information
   * @param params Query parameters for the API
   */
  async getAirlines(params: Record<string, any> = {}): Promise<AviationstackResponse<AviationstackAirline>> {
    // Use longer cache for airlines data (airlines don't change often)
    return this.makeRequest<AviationstackResponse<AviationstackAirline>>('/airlines', params, 30);
  }
  
  /**
   * Get usage statistics and remaining quota
   */
  getUsageStats(): {
    requestsThisMonth: number;
    monthlyQuota: number;
    remainingRequests: number;
    percentageUsed: number;
    lastResetDate: Date;
    currentMonthStart: Date;
    recentCalls: {
      timestamp: Date;
      endpoint: string;
      query: string;
      cacheHit: boolean;
    }[];
  } {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      endpoint: call.endpoint,
      query: call.query,
      cacheHit: call.cacheHit
    })).reverse();
    
    return {
      requestsThisMonth: this.usageStats.requestsThisMonth,
      monthlyQuota: this.usageStats.monthlyQuota,
      remainingRequests: Math.max(0, this.usageStats.monthlyQuota - this.usageStats.requestsThisMonth),
      percentageUsed: (this.usageStats.requestsThisMonth / this.usageStats.monthlyQuota) * 100,
      lastResetDate: new Date(this.usageStats.lastResetTimestamp),
      currentMonthStart: new Date(this.usageStats.monthStartTimestamp),
      recentCalls
    };
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    let entries = 0;
    
    this.cache.forEach(entry => {
      entries++;
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    });
    
    const now = Date.now();
    const oldestDays = Math.floor((now - oldestTimestamp) / (1000 * 60 * 60 * 24));
    const newestDays = Math.floor((now - newestTimestamp) / (1000 * 60 * 60 * 24));
    
    return {
      entries,
      oldestEntryDays: oldestDays || 0,
      newestEntryDays: newestDays || 0,
      sizeKB: Math.round(JSON.stringify(Object.fromEntries(this.cache)).length / 1024)
    };
  }
  
  /**
   * Get the API attribution
   */
  getAttribution(): string {
    return '© Aviationstack API by APILayer';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(AVIATIONSTACK_CACHE_KEY);
    console.log('Aviationstack cache cleared');
  }
}

// Export singleton instance
export const aviationstackService = new AviationstackService();
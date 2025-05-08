/**
 * Weatherstack API Service
 * 
 * Implements the Weatherstack weather API with:
 * - Ultra-aggressive caching (21+ days for most locations)
 * - Request counting and limiting (max 96 calls per month)
 * - Detailed usage analytics
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const WEATHERSTACK_BASE_URL = 'http://api.weatherstack.com';
const WEATHERSTACK_API_KEY = '9dbddcedbf36393bd8925d91fb396207';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Rate limiting & cache configuration
const CACHE_TTL_DAYS = 21; // 21 days cache to keep API usage extremely low
const WEATHERSTACK_CACHE_KEY = 'weatherstack_cache';
const USAGE_STATS_KEY = 'weatherstack_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'weatherstack_last_request_timestamp';

// Monthly request limit (free tier is 100/month, we set slightly lower for safety)
const MONTHLY_REQUEST_LIMIT = 96;

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for API response from Weatherstack
export interface WeatherstackCurrentResponse {
  request: {
    type: string;
    query: string;
    language: string;
    unit: string;
  };
  location: {
    name: string;
    country: string;
    region: string;
    lat: string;
    lon: string;
    timezone_id: string;
    localtime: string;
    localtime_epoch: number;
    utc_offset: string;
  };
  current: {
    observation_time: string;
    temperature: number;
    weather_code: number;
    weather_icons: string[];
    weather_descriptions: string[];
    wind_speed: number;
    wind_degree: number;
    wind_dir: string;
    pressure: number;
    precip: number;
    humidity: number;
    cloudcover: number;
    feelslike: number;
    uv_index: number;
    visibility: number;
    is_day: string;
  };
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
 * Weatherstack Service class for weather data
 */
class WeatherstackService {
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
      const cachedData = localStorage.getItem(WEATHERSTACK_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Weatherstack cache entries`);
      }
    } catch (error) {
      console.error('Failed to load Weatherstack cache from storage:', error);
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
      
      localStorage.setItem(WEATHERSTACK_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Weatherstack cache to storage:', error);
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
    console.log('Resetting Weatherstack monthly API counter');
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
    const query = params.query || '';
    const units = params.units || 'm';
    return `${endpoint}:${query}:${units}`;
  }
  
  /**
   * Get current weather for a location
   * @param query Location name, coordinates, or IP address
   * @param units 'm' for metric, 'f' for Fahrenheit, 's' for scientific
   */
  async getCurrentWeather(query: string, units: 'm' | 'f' | 's' = 'm'): Promise<WeatherstackCurrentResponse | null> {
    if (!query.trim()) return null;
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Weatherstack monthly API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cacheKey = this.getCacheKey('current', { query, units });
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall('current', query, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    const params = {
      access_key: WEATHERSTACK_API_KEY,
      query,
      units
    };
    
    const cacheKey = this.getCacheKey('current', params);
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // For most locations, use a very long cache
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Weatherstack data (${cacheAgeDays.toFixed(1)} days old) for ${query}`);
        this.recordApiCall('current', query, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const endpoint = '/current';
      const url = `${WEATHERSTACK_BASE_URL}${endpoint}`;
      
      // Make the API request
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': USER_AGENT
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Check for errors in response
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
      this.recordApiCall('current', query, false);
      return response.data;
    } catch (error) {
      console.error('Error with Weatherstack API request:', error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for ${query}`);
        return cachedData.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get historical weather data for a location and date
   * This is a premium feature in Weatherstack
   */
  async getHistoricalWeather(query: string, date: string, units: 'm' | 'f' | 's' = 'm'): Promise<any | null> {
    // For free tier, we don't have access to historical data
    console.warn('Historical weather data requires Weatherstack premium subscription');
    throw new Error('Historical weather data requires Weatherstack premium subscription');
  }
  
  /**
   * Get weather forecast for a location
   * This is a premium feature in Weatherstack
   */
  async getForecastWeather(query: string, days: number = 7, units: 'm' | 'f' | 's' = 'm'): Promise<any | null> {
    // For free tier, we don't have access to forecast data
    console.warn('Weather forecast data requires Weatherstack premium subscription');
    throw new Error('Weather forecast data requires Weatherstack premium subscription');
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
    return '© Weatherstack API by APILayer';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(WEATHERSTACK_CACHE_KEY);
    console.log('Weatherstack cache cleared');
  }
}

// Export singleton instance
export const weatherstackService = new WeatherstackService();
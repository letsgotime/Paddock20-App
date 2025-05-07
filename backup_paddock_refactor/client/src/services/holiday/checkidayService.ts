/**
 * Checkiday API Service
 * 
 * Implements the Checkiday National Holiday API with:
 * - Aggressive caching (holidays don't change frequently)
 * - Request counting for stay within the free tier
 * - Holiday data access and filtering
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const CHECKIDAY_BASE_URL = 'https://api.checkiday.com';
const CHECKIDAY_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Rate limiting & cache configuration
const CACHE_TTL_DAYS = 14; // 14 days cache for holidays (they don't change frequently)
const CHECKIDAY_CACHE_KEY = 'checkiday_cache';
const USAGE_STATS_KEY = 'checkiday_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'checkiday_last_request_timestamp';

// Free tier limitations
const MONTHLY_REQUEST_LIMIT = 1000; // Set a safe limit for the free tier

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for API responses
export interface CheckidayHoliday {
  id: string;
  name: string;
  url: string;
  date: {
    month: number;
    day: number;
    year?: number;
  };
  alternate_names?: string[];
  adult?: boolean;
  hashtags?: string[];
}

export interface CheckidayResponse {
  timezone: string;
  date: string;
  adult: boolean;
  holidays: CheckidayHoliday[];
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
 * Checkiday Service class for holiday data
 */
class CheckidayService {
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
      const cachedData = localStorage.getItem(CHECKIDAY_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Checkiday cache entries`);
      }
    } catch (error) {
      console.error('Failed to load Checkiday cache from storage:', error);
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
      
      localStorage.setItem(CHECKIDAY_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Checkiday cache to storage:', error);
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
    console.log('Resetting Checkiday monthly API counter');
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
  private getCacheKey(endpoint: string, params: Record<string, any> = {}): string {
    const date = params.date || '';
    const adult = params.adult || false;
    return `${endpoint}:${date}:${adult}`;
  }
  
  /**
   * Get holidays for a specific date
   * @param date Date in format YYYY-MM-DD (defaults to today)
   * @param includeAdult Whether to include adult-oriented holidays
   */
  async getHolidays(date?: string, includeAdult: boolean = false): Promise<CheckidayResponse | null> {
    // Convert date to API format or use today
    const formattedDate = date || this.getTodayFormatted();
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Checkiday monthly API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cacheKey = this.getCacheKey('/v2/date', { date: formattedDate, adult: includeAdult });
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall('/v2/date', formattedDate, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    const params: Record<string, any> = {
      adult: includeAdult
    };
    
    // Add date if provided
    if (date) {
      params.date = formattedDate;
    }
    
    const cacheKey = this.getCacheKey('/v2/date', params);
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Holidays don't change often, so we can use a longer cache
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Checkiday data (${cacheAgeDays.toFixed(1)} days old) for ${formattedDate}`);
        this.recordApiCall('/v2/date', formattedDate, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const endpoint = '/v2/date';
      const url = `${CHECKIDAY_BASE_URL}${endpoint}`;
      
      // Make the API request
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': USER_AGENT,
          'X-API-Key': CHECKIDAY_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Check if the response has an error property
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Cache successful response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      this.saveCache();
      
      // Record API call
      this.recordApiCall('/v2/date', formattedDate, false);
      return response.data;
    } catch (error) {
      console.error('Error with Checkiday API request:', error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for ${formattedDate}`);
        return cachedData.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get today's holidays
   * @param includeAdult Whether to include adult-oriented holidays
   */
  async getTodaysHolidays(includeAdult: boolean = false): Promise<CheckidayResponse | null> {
    return this.getHolidays(undefined, includeAdult);
  }
  
  /**
   * Get detailed information about a specific holiday
   * @param id Holiday ID
   */
  async getHolidayDetails(id: string): Promise<any | null> {
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Checkiday monthly API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cacheKey = this.getCacheKey('/v2/holiday', { id });
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall('/v2/holiday', id, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    const cacheKey = this.getCacheKey('/v2/holiday', { id });
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Holiday details rarely change, so we can use a longer cache
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Checkiday data (${cacheAgeDays.toFixed(1)} days old) for holiday ${id}`);
        this.recordApiCall('/v2/holiday', id, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const endpoint = '/v2/holiday';
      const url = `${CHECKIDAY_BASE_URL}${endpoint}`;
      
      // Make the API request
      const response = await axios.get(url, {
        params: { id },
        headers: {
          'User-Agent': USER_AGENT,
          'X-API-Key': CHECKIDAY_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Check if the response has an error property
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Cache successful response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      this.saveCache();
      
      // Record API call
      this.recordApiCall('/v2/holiday', id, false);
      return response.data;
    } catch (error) {
      console.error('Error with Checkiday API request:', error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for holiday ${id}`);
        return cachedData.data;
      }
      
      throw error;
    }
  }

  /**
   * Search for holidays by keyword
   * @param query Search query
   * @param includeAdult Whether to include adult-oriented holidays
   */
  async searchHolidays(query: string, includeAdult: boolean = false): Promise<any | null> {
    if (!query.trim()) return null;
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Checkiday monthly API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cacheKey = this.getCacheKey('/v2/search', { query, adult: includeAdult });
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall('/v2/search', query, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    const params = {
      query,
      adult: includeAdult
    };
    
    const cacheKey = this.getCacheKey('/v2/search', params);
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Search results can change, but not too frequently
      if (cacheAgeDays < 7) { // Use a shorter cache for searches
        console.log(`Using cached Checkiday search data (${cacheAgeDays.toFixed(1)} days old) for "${query}"`);
        this.recordApiCall('/v2/search', query, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const endpoint = '/v2/search';
      const url = `${CHECKIDAY_BASE_URL}${endpoint}`;
      
      // Make the API request
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': USER_AGENT,
          'X-API-Key': CHECKIDAY_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Check if the response has an error property
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Cache successful response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      this.saveCache();
      
      // Record API call
      this.recordApiCall('/v2/search', query, false);
      return response.data;
    } catch (error) {
      console.error('Error with Checkiday API request:', error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for search "${query}"`);
        return cachedData.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get today's date formatted as YYYY-MM-DD
   */
  private getTodayFormatted(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    return '© Checkiday.com - National Holiday API by Westy92 LLC';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(CHECKIDAY_CACHE_KEY);
    console.log('Checkiday cache cleared');
  }
}

// Export singleton instance
export const checkidayService = new CheckidayService();
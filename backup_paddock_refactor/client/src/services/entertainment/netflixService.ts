/**
 * Netflix Catalog Service via uNoGS API
 * 
 * This service provides access to the uNoGS API for global Netflix catalog search.
 * API key: U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D
 * 
 * Features:
 * - Global Netflix catalog search
 * - New arrivals and leaving soon
 * - Film details including IMDB ratings
 * - Ultra-aggressive caching to stay within API limits
 * - Country-specific catalog browsing
 */

// Import utilities
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const UNOGS_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const UNOGS_BASE_URL = 'https://api.apilayer.com/unogs';

// Cache configuration - ultra-aggressive to stay within free tier limits
const CACHE_TTL_DAYS = 7; // 7 days for most data
const CATALOG_CACHE_KEY = 'netflix_catalog_cache';
const DETAILS_CACHE_KEY = 'netflix_details_cache';
const USAGE_STATS_KEY = 'netflix_api_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'netflix_last_request_timestamp';

// Request limits (conservative for free tier)
const DAILY_REQUEST_LIMIT = 5; // Be very conservative with API usage

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for search parameters
export interface NetflixSearchParams {
  query?: string;
  type?: 'movie' | 'series';
  genre_list?: string;
  country_list?: number;
  audio?: string;
  subtitle?: string;
  start_year?: number;
  end_year?: number;
  offset?: number;
  orderby?: string;
}

// Interface for a Netflix title
export interface NetflixTitle {
  id: string;
  title: string;
  img: string;
  vtype: string;
  nfid: number;
  synopsis: string;
  avgrating: number;
  year: number;
  runtime: string;
  imdbid: string;
  imdbrating: number;
  poster: string;
  top250: number;
  top250tv: number;
}

// Interface for Netflix title details
export interface NetflixTitleDetails extends NetflixTitle {
  download: boolean;
  titledate: string;
  released: string;
  rating: string;
  unogsdate: string;
  countries: {
    country: string;
    countrycode: string;
    expires?: string;
    new?: string;
  }[];
  genres: string[];
  audio: string[];
  subtitles: string[];
}

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dailyQuota: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    endpoint: string;
    cacheHit: boolean;
  }[];
}

// Country codes for Netflix
export const NETFLIX_COUNTRIES = [
  { id: 78, code: 'US', name: 'United States' },
  { id: 33, code: 'CA', name: 'Canada' },
  { id: 46, code: 'GB', name: 'United Kingdom' },
  { id: 45, code: 'FR', name: 'France' },
  { id: 39, code: 'DE', name: 'Germany' },
  { id: 29, code: 'AU', name: 'Australia' },
  { id: 65, code: 'JP', name: 'Japan' },
  { id: 67, code: 'KR', name: 'South Korea' },
  { id: 24, code: 'ES', name: 'Spain' },
  { id: 269, code: 'MX', name: 'Mexico' },
  { id: 337, code: 'BR', name: 'Brazil' }
];

/**
 * NetflixService class for catalog search functionality
 */
class NetflixService {
  private titleCache: Map<string, { data: any; timestamp: number }> = new Map();
  private detailsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private isLoadingCache: boolean = false;
  private usageStats: UsageStats;
  private lastRequestTime: number = 0;
  
  constructor() {
    // Initialize usage stats
    const savedStats = localStorage.getItem<UsageStats>(USAGE_STATS_KEY);
    
    if (savedStats) {
      this.usageStats = savedStats;
      
      // Check if we need to reset the daily counter
      if (this.shouldResetDailyCounter()) {
        this.resetDailyCounter();
      }
    } else {
      // Initialize new usage stats
      this.usageStats = {
        requestsToday: 0,
        dailyQuota: DAILY_REQUEST_LIMIT,
        dayStartTimestamp: this.getCurrentDayStart(),
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
      // Load title cache
      const cachedTitleData = localStorage.getItem(CATALOG_CACHE_KEY);
      if (cachedTitleData) {
        const parsedData = JSON.parse(cachedTitleData);
        
        // Reset the in-memory cache
        this.titleCache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.titleCache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.titleCache.size} Netflix title cache entries`);
      }
      
      // Load details cache
      const cachedDetailsData = localStorage.getItem(DETAILS_CACHE_KEY);
      if (cachedDetailsData) {
        const parsedData = JSON.parse(cachedDetailsData);
        
        // Reset the in-memory cache
        this.detailsCache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.detailsCache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.detailsCache.size} Netflix details cache entries`);
      }
    } catch (error) {
      console.error('Failed to load Netflix cache from storage:', error);
    } finally {
      this.isLoadingCache = false;
    }
  }
  
  /**
   * Save current title cache to persistent storage
   */
  private saveTitleCache(): void {
    try {
      const cacheObject: Record<string, any> = {};
      this.titleCache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Netflix title cache to storage:', error);
    }
  }
  
  /**
   * Save current details cache to persistent storage
   */
  private saveDetailsCache(): void {
    try {
      const cacheObject: Record<string, any> = {};
      this.detailsCache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      localStorage.setItem(DETAILS_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Netflix details cache to storage:', error);
    }
  }
  
  /**
   * Save usage statistics to storage
   */
  private saveUsageStats(): void {
    localStorage.setItem(USAGE_STATS_KEY, this.usageStats);
  }
  
  /**
   * Get the start timestamp of the current day
   */
  private getCurrentDayStart(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  
  /**
   * Check if the daily counter should be reset
   */
  private shouldResetDailyCounter(): boolean {
    const currentDayStart = this.getCurrentDayStart();
    return currentDayStart > this.usageStats.dayStartTimestamp;
  }
  
  /**
   * Reset the daily API call counter
   */
  private resetDailyCounter(): void {
    console.log('Resetting Netflix API daily counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(endpoint: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
      endpoint,
      cacheHit
    });
    
    // Trim the log if it gets too large
    if (this.usageStats.apiCallLog.length > 100) {
      this.usageStats.apiCallLog = this.usageStats.apiCallLog.slice(-100);
    }
    
    this.saveUsageStats();
  }
  
  /**
   * Check if we've exceeded our daily API call quota
   */
  private hasExceededQuota(): boolean {
    // Check if we need to reset first
    if (this.shouldResetDailyCounter()) {
      this.resetDailyCounter();
      return false;
    }
    return this.usageStats.requestsToday >= this.usageStats.dailyQuota;
  }
  
  /**
   * Generate a cache key for the search parameters
   */
  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${params ? JSON.stringify(params) : ''}`;
  }
  
  /**
   * Make an API request to uNoGS API
   * @param endpoint API endpoint
   * @param params Query parameters (optional)
   * @param detailsRequest Whether this is a details request (uses different cache)
   */
  private async makeRequest(endpoint: string, params?: any, detailsRequest: boolean = false): Promise<any> {
    // Validation
    if (!endpoint) {
      throw new Error('API endpoint cannot be empty');
    }
    
    const cacheKey = this.getCacheKey(endpoint, params);
    const cache = detailsRequest ? this.detailsCache : this.titleCache;
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Netflix API daily quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall(endpoint, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // For Netflix, we can use a longer cache time since the catalog doesn't update that often
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Netflix data (${cacheAgeDays.toFixed(1)} days old) for "${endpoint}"`);
        this.recordApiCall(endpoint, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    // Build the URL
    let url = `${UNOGS_BASE_URL}${endpoint}`;
    
    // Add query parameters if provided
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': UNOGS_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache successful response
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Save to persistent storage
      if (detailsRequest) {
        this.saveDetailsCache();
      } else {
        this.saveTitleCache();
      }
      
      // Record API call
      this.recordApiCall(endpoint, false);
      return data;
    } catch (error) {
      console.error(`Error with Netflix API request for "${endpoint}":`, error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for "${endpoint}"`);
        return cachedData.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Search the Netflix catalog
   * @param params Search parameters
   */
  async searchCatalog(params: NetflixSearchParams): Promise<NetflixTitle[]> {
    try {
      const result = await this.makeRequest('/search', params);
      return result.results || [];
    } catch (error) {
      console.error('Error searching Netflix catalog:', error);
      return [];
    }
  }
  
  /**
   * Get details for a specific Netflix title
   * @param netflixId Netflix ID
   */
  async getTitleDetails(netflixId: string): Promise<NetflixTitleDetails | null> {
    try {
      const result = await this.makeRequest(`/title/details/${netflixId}`, null, true);
      return result || null;
    } catch (error) {
      console.error(`Error getting Netflix title details for ID ${netflixId}:`, error);
      return null;
    }
  }
  
  /**
   * Get new releases on Netflix
   * @param countryId Country ID (default: 78 for US)
   * @param days Number of days to look back (default: 30)
   */
  async getNewReleases(countryId: number = 78, days: number = 30): Promise<NetflixTitle[]> {
    try {
      const result = await this.makeRequest('/newly-added', { 
        countrylist: countryId, 
        days 
      });
      return result.results || [];
    } catch (error) {
      console.error('Error getting new Netflix releases:', error);
      return [];
    }
  }
  
  /**
   * Get titles leaving Netflix soon
   * @param countryId Country ID (default: 78 for US)
   * @param days Number of days to look ahead (default: 30)
   */
  async getLeavingSoon(countryId: number = 78, days: number = 30): Promise<NetflixTitle[]> {
    try {
      const result = await this.makeRequest('/expiring', { 
        countrylist: countryId, 
        days 
      });
      return result.results || [];
    } catch (error) {
      console.error('Error getting titles leaving Netflix:', error);
      return [];
    }
  }
  
  /**
   * Get Netflix genres
   */
  async getGenres(): Promise<{id: string, name: string}[]> {
    try {
      const result = await this.makeRequest('/genres');
      return result || [];
    } catch (error) {
      console.error('Error getting Netflix genres:', error);
      return [];
    }
  }
  
  /**
   * Get API usage statistics
   */
  getUsageStats(): {
    requestsToday: number;
    dailyQuota: number;
    remainingRequests: number;
    percentageUsed: number;
    lastResetDate: Date;
    recentCalls: {
      timestamp: Date;
      endpoint: string;
      cacheHit: boolean;
    }[];
  } {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      endpoint: call.endpoint,
      cacheHit: call.cacheHit
    })).reverse();
    
    return {
      requestsToday: this.usageStats.requestsToday,
      dailyQuota: this.usageStats.dailyQuota,
      remainingRequests: Math.max(0, this.usageStats.dailyQuota - this.usageStats.requestsToday),
      percentageUsed: (this.usageStats.requestsToday / this.usageStats.dailyQuota) * 100,
      lastResetDate: new Date(this.usageStats.lastResetTimestamp),
      recentCalls
    };
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    let titleEntries = 0;
    let detailsEntries = 0;
    
    this.titleCache.forEach(() => {
      titleEntries++;
    });
    
    this.detailsCache.forEach(() => {
      detailsEntries++;
    });
    
    return {
      titleEntries,
      detailsEntries,
      totalEntries: titleEntries + detailsEntries,
      titleCacheSizeKB: Math.round(JSON.stringify(Object.fromEntries(this.titleCache)).length / 1024),
      detailsCacheSizeKB: Math.round(JSON.stringify(Object.fromEntries(this.detailsCache)).length / 1024)
    };
  }
  
  /**
   * Check if we've reached limit
   */
  hasReachedLimit(): boolean {
    return this.hasExceededQuota();
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.titleCache.clear();
    this.detailsCache.clear();
    localStorage.removeItem(CATALOG_CACHE_KEY);
    localStorage.removeItem(DETAILS_CACHE_KEY);
    console.log('Netflix cache cleared');
  }
}

// Export singleton instance
export const netflixService = new NetflixService();

// Export simplified functions for component use
export async function searchNetflix(query: string, type?: 'movie' | 'series'): Promise<NetflixTitle[]> {
  try {
    return await netflixService.searchCatalog({ 
      query, 
      type,
      offset: 0
    });
  } catch (error) {
    console.error('Error in searchNetflix:', error);
    return [];
  }
}

export async function getNetflixNewReleases(countryId?: number): Promise<NetflixTitle[]> {
  try {
    return await netflixService.getNewReleases(countryId);
  } catch (error) {
    console.error('Error in getNetflixNewReleases:', error);
    return [];
  }
}

export async function getNetflixLeavingSoon(countryId?: number): Promise<NetflixTitle[]> {
  try {
    return await netflixService.getLeavingSoon(countryId);
  } catch (error) {
    console.error('Error in getNetflixLeavingSoon:', error);
    return [];
  }
}

export async function getNetflixTitleDetails(netflixId: string): Promise<NetflixTitleDetails | null> {
  try {
    return await netflixService.getTitleDetails(netflixId);
  } catch (error) {
    console.error('Error in getNetflixTitleDetails:', error);
    return null;
  }
}
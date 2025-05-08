/**
 * Google Search API Service
 * 
 * Implements the APILayer Google Search API with:
 * - Organic search results
 * - Domain-specific search
 * - Multi-language support
 * - Result caching for efficiency
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const GOOGLE_SEARCH_BASE_URL = 'https://api.apilayer.com/google_search';
const GOOGLE_SEARCH_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Cache configuration
const CACHE_TTL_DAYS = 1; // 1 day cache for search results (they change frequently)
const GOOGLE_SEARCH_CACHE_KEY = 'google_search_cache';
const USAGE_STATS_KEY = 'google_search_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'google_search_last_request_timestamp';

// Request limits (conservative)
const DAILY_REQUEST_LIMIT = 50;

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for search parameters
export interface GoogleSearchParams {
  q: string;
  google_domain?: string;
  page?: number;
  gl?: string; // Country code for Google search (e.g., "us" for United States)
  hl?: string; // Language code (e.g., "en" for English)
  engine?: 'google';
  num?: number; // Number of results
  tbm?: 'isch' | 'nws' | 'vid'; // Type of search: images, news, videos
  safe?: 'active' | 'off'; // Safe search
}

// Interface for a search result
export interface GoogleSearchResult {
  position: number;
  title: string;
  link: string;
  domain: string;
  displayed_link: string;
  snippet_matched?: string[];
  snippet: string;
  rich_snippet?: any;
}

// Interface for search response
export interface GoogleSearchResponse {
  search_parameters: GoogleSearchParams;
  organic_results: GoogleSearchResult[];
}

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dailyQuota: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    query: string;
    cacheHit: boolean;
  }[];
}

/**
 * GoogleSearchService class for search functionality
 */
class GoogleSearchService {
  private cache: Map<string, { data: GoogleSearchResponse; timestamp: number }> = new Map();
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
      const cachedData = localStorage.getItem(GOOGLE_SEARCH_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Google Search cache entries`);
      }
    } catch (error) {
      console.error('Failed to load Google Search cache from storage:', error);
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
      
      localStorage.setItem(GOOGLE_SEARCH_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Google Search cache to storage:', error);
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
    console.log('Resetting Google Search daily API counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(query: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
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
  private getCacheKey(params: GoogleSearchParams): string {
    return JSON.stringify(params);
  }
  
  /**
   * Perform a Google search
   * @param params Search parameters
   */
  async search(params: GoogleSearchParams): Promise<GoogleSearchResponse> {
    // Validation
    if (!params.q || params.q.trim() === '') {
      throw new Error('Search query cannot be empty');
    }
    
    // Set up default parameters
    const searchParams: GoogleSearchParams = {
      ...params,
      google_domain: params.google_domain || 'google.com',
      gl: params.gl || 'us',
      hl: params.hl || 'en',
      engine: 'google',
      page: params.page || 1
    };
    
    const cacheKey = this.getCacheKey(searchParams);
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Google Search daily API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall(searchParams.q, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeHours = cacheAge / (1000 * 60 * 60);
      
      // Search results can change, so we use a shorter cache time
      if (cacheAgeHours < 24) { // 24 hours cache
        console.log(`Using cached Google Search data (${cacheAgeHours.toFixed(1)} hours old) for "${searchParams.q}"`);
        this.recordApiCall(searchParams.q, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const response = await axios.get(GOOGLE_SEARCH_BASE_URL, {
        params: searchParams,
        headers: {
          'User-Agent': USER_AGENT,
          'apikey': GOOGLE_SEARCH_API_KEY
        },
        timeout: 15000 // 15 second timeout
      });
      
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
      this.recordApiCall(searchParams.q, false);
      return response.data;
    } catch (error) {
      console.error(`Error with Google Search API request for "${searchParams.q}":`, error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for "${searchParams.q}"`);
        return cachedData.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Perform an automotive-specific search
   * @param query Search query
   * @param page Page number
   */
  async searchAutomotive(query: string, page: number = 1): Promise<GoogleSearchResponse> {
    // Add automotive keywords to the search query
    const automotiveQuery = `${query} car automotive vehicle`;
    
    return this.search({
      q: automotiveQuery,
      page
    });
  }
  
  /**
   * Search for vehicle information
   * @param make Vehicle make
   * @param model Vehicle model (optional)
   * @param year Vehicle year (optional)
   */
  async searchVehicle(make: string, model?: string, year?: number): Promise<GoogleSearchResponse> {
    let query = make;
    
    if (model) {
      query += ` ${model}`;
    }
    
    if (year) {
      query += ` ${year}`;
    }
    
    // Add automotive-specific terms
    query += ' specifications review';
    
    return this.search({
      q: query
    });
  }
  
  /**
   * Search for car maintenance information
   * @param issue Maintenance issue to search for
   * @param vehicle Vehicle information (optional)
   */
  async searchMaintenance(issue: string, vehicle?: string): Promise<GoogleSearchResponse> {
    let query = `car maintenance ${issue}`;
    
    if (vehicle) {
      query = `${vehicle} ${query}`;
    }
    
    return this.search({
      q: query
    });
  }
  
  /**
   * Search for driving routes
   * @param origin Origin location
   * @param destination Destination location
   */
  async searchDrivingRoutes(origin: string, destination: string): Promise<GoogleSearchResponse> {
    const query = `driving route from ${origin} to ${destination} driving directions`;
    
    return this.search({
      q: query
    });
  }
  
  /**
   * Search for automotive news
   * @param topic Specific news topic (optional)
   * @param days Number of days (optional, defaults to recent news)
   */
  async searchAutomotiveNews(topic?: string, days?: number): Promise<GoogleSearchResponse> {
    let query = 'automotive news';
    
    if (topic) {
      query = `${topic} ${query}`;
    }
    
    const params: GoogleSearchParams = {
      q: query,
      tbm: 'nws' // News search
    };
    
    return this.search(params);
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats(): {
    requestsToday: number;
    dailyQuota: number;
    remainingRequests: number;
    percentageUsed: number;
    lastResetDate: Date;
    dayStart: Date;
    recentCalls: {
      timestamp: Date;
      query: string;
      cacheHit: boolean;
    }[];
  } {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      query: call.query,
      cacheHit: call.cacheHit
    })).reverse();
    
    return {
      requestsToday: this.usageStats.requestsToday,
      dailyQuota: this.usageStats.dailyQuota,
      remainingRequests: Math.max(0, this.usageStats.dailyQuota - this.usageStats.requestsToday),
      percentageUsed: (this.usageStats.requestsToday / this.usageStats.dailyQuota) * 100,
      lastResetDate: new Date(this.usageStats.lastResetTimestamp),
      dayStart: new Date(this.usageStats.dayStartTimestamp),
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
    const oldestHours = Math.floor((now - oldestTimestamp) / (1000 * 60 * 60));
    const newestHours = Math.floor((now - newestTimestamp) / (1000 * 60 * 60));
    
    return {
      entries,
      oldestEntryHours: oldestHours || 0,
      newestEntryHours: newestHours || 0,
      sizeKB: Math.round(JSON.stringify(Object.fromEntries(this.cache)).length / 1024)
    };
  }
  
  /**
   * Get the API attribution
   */
  getAttribution(): string {
    return '© Google Search API by APILayer';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(GOOGLE_SEARCH_CACHE_KEY);
    console.log('Google Search cache cleared');
  }
}

// Export singleton instance
export const googleSearchService = new GoogleSearchService();

// Export a simpler search function for the explorer component
export async function searchGoogle(query: string): Promise<any> {
  try {
    return await googleSearchService.search({ q: query });
  } catch (error) {
    console.error('Error in searchGoogle:', error);
    throw error;
  }
}
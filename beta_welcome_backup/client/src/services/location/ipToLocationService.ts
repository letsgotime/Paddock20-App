/**
 * IP to Location API Service
 * 
 * Implements the APILayer IP to Location API with:
 * - IP-based geolocation
 * - Detailed location information (country, city, coordinates)
 * - ISP and connection details
 * - Currency and timezone information
 * - Aggressive caching to minimize API usage
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const IP_TO_LOCATION_BASE_URL = 'https://api.apilayer.com/ip_to_location';
const IP_TO_LOCATION_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Cache configuration
const CACHE_TTL_DAYS = 30; // 30 days cache (IP locations don't change often)
const IP_LOCATION_CACHE_KEY = 'ip_location_cache';
const USAGE_STATS_KEY = 'ip_location_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'ip_location_last_request_timestamp';

// Request limits (conservative)
const DAILY_REQUEST_LIMIT = 50;

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for API response
export interface IPLocationResponse {
  ip: string;
  type: 'ipv4' | 'ipv6';
  country_code: string;
  country_name: string;
  region_name: string;
  city: string;
  latitude: number;
  longitude: number;
  continent_code: string;
  continent_name: string;
  is_eu: boolean;
  connection: {
    asn: number;
    isp: string;
  };
  location: {
    capital: string;
    native_name: string;
    flag: string;
    top_level_domains: string[];
    calling_codes: string[];
  };
  currencies: {
    name: string;
    code: string;
    symbol: string;
  }[];
  timezones: string[];
}

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dailyQuota: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    ip: string;
    cacheHit: boolean;
  }[];
}

/**
 * IPToLocationService class for IP-based geolocation
 */
class IPToLocationService {
  private cache: Map<string, { data: IPLocationResponse; timestamp: number }> = new Map();
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
      const cachedData = localStorage.getItem(IP_LOCATION_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} IP location cache entries`);
      }
    } catch (error) {
      console.error('Failed to load IP location cache from storage:', error);
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
      
      localStorage.setItem(IP_LOCATION_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save IP location cache to storage:', error);
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
    console.log('Resetting IP to Location daily API counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(ip: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
      ip,
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
   * Get location information for the current user's IP
   * Will use the client's IP based on the request origin
   */
  async getCurrentLocation(): Promise<IPLocationResponse> {
    return this.getLocationByIP('');
  }
  
  /**
   * Get location information for a specific IP address
   * @param ip IP address to lookup, leave blank to use the client's IP
   */
  async getLocationByIP(ip: string = ''): Promise<IPLocationResponse> {
    // Sanitize IP (remove whitespace)
    ip = ip.trim();
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('IP to Location daily API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      if (ip && this.cache.has(ip)) {
        const cachedData = this.cache.get(ip);
        if (cachedData) {
          this.recordApiCall(ip, true);
          return cachedData.data;
        }
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    // Check cache first for specific IP
    if (ip && this.cache.has(ip)) {
      const cachedData = this.cache.get(ip);
      if (cachedData) {
        const cacheAge = Date.now() - cachedData.timestamp;
        const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
        
        // IP locations don't change often
        if (cacheAgeDays < CACHE_TTL_DAYS) {
          console.log(`Using cached IP location data (${cacheAgeDays.toFixed(1)} days old) for ${ip}`);
          this.recordApiCall(ip, true);
          return cachedData.data;
        }
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      // Construct the URL based on whether an IP was provided
      const url = ip 
        ? `${IP_TO_LOCATION_BASE_URL}/${encodeURIComponent(ip)}`
        : `${IP_TO_LOCATION_BASE_URL}/`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'apikey': IP_TO_LOCATION_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Get the actual IP from the response
      const actualIp = response.data.ip || ip;
      
      // Cache successful response
      this.cache.set(actualIp, {
        data: response.data,
        timestamp: Date.now()
      });
      this.saveCache();
      
      // Record API call
      this.recordApiCall(actualIp, false);
      return response.data;
    } catch (error) {
      console.error('Error with IP to Location API request:', error);
      
      // Try to return cached data if we have it for this IP, even if expired
      if (ip && this.cache.has(ip)) {
        const cachedData = this.cache.get(ip);
        if (cachedData) {
          console.log(`Using expired cached data after error for ${ip}`);
          return cachedData.data;
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Get the geographic coordinates from an IP address
   * @param ip IP address to lookup, leave blank to use the client's IP
   * @returns Latitude and longitude
   */
  async getCoordinatesFromIP(ip: string = ''): Promise<{ latitude: number, longitude: number }> {
    const location = await this.getLocationByIP(ip);
    return {
      latitude: location.latitude,
      longitude: location.longitude
    };
  }
  
  /**
   * Get country information from an IP address
   * @param ip IP address to lookup, leave blank to use the client's IP
   * @returns Country information
   */
  async getCountryFromIP(ip: string = ''): Promise<{
    country_code: string;
    country_name: string;
    capital: string;
    is_eu: boolean;
    calling_codes: string[];
  }> {
    const location = await this.getLocationByIP(ip);
    return {
      country_code: location.country_code,
      country_name: location.country_name,
      capital: location.location.capital,
      is_eu: location.is_eu,
      calling_codes: location.location.calling_codes
    };
  }
  
  /**
   * Get currency information from an IP address
   * @param ip IP address to lookup, leave blank to use the client's IP
   * @returns Currency information
   */
  async getCurrencyFromIP(ip: string = ''): Promise<{
    name: string;
    code: string;
    symbol: string;
  }[]> {
    const location = await this.getLocationByIP(ip);
    return location.currencies;
  }
  
  /**
   * Get timezone information from an IP address
   * @param ip IP address to lookup, leave blank to use the client's IP
   * @returns Timezone information
   */
  async getTimezoneFromIP(ip: string = ''): Promise<string[]> {
    const location = await this.getLocationByIP(ip);
    return location.timezones;
  }
  
  /**
   * Get ISP information from an IP address
   * @param ip IP address to lookup, leave blank to use the client's IP
   * @returns ISP information
   */
  async getISPFromIP(ip: string = ''): Promise<{
    asn: number;
    isp: string;
  }> {
    const location = await this.getLocationByIP(ip);
    return location.connection;
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
      ip: string;
      cacheHit: boolean;
    }[];
  } {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      ip: call.ip,
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
    return '© IP to Location API by APILayer';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(IP_LOCATION_CACHE_KEY);
    console.log('IP location cache cleared');
  }
}

// Export singleton instance
export const ipToLocationService = new IPToLocationService();
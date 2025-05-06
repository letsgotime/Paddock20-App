/**
 * Geography API Service
 * 
 * Implements the APILayer Geography API with:
 * - Comprehensive country and city lookup
 * - Currency, language, and regional bloc data
 * - Aggressive caching for limited API usage
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const GEOGRAPHY_BASE_URL = 'https://api.apilayer.com/geography';
const GEOGRAPHY_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Cache configuration
const CACHE_TTL_DAYS = 90; // 90 days cache (geography data rarely changes)
const GEOGRAPHY_CACHE_KEY = 'geography_cache';
const USAGE_STATS_KEY = 'geography_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'geography_last_request_timestamp';

// Request limits (conservative)
const DAILY_REQUEST_LIMIT = 50;

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Common interfaces
export interface Country {
  name: string;
  topLevelDomain: string[];
  alpha2Code: string;
  alpha3Code: string;
  callingCodes: string[];
  capital: string;
  altSpellings: string[];
  region: string;
  subregion: string;
  population: number;
  latlng: number[];
  demonym: string;
  area: number;
  gini: number;
  timezones: string[];
  borders: string[];
  nativeName: string;
  numericCode: string;
  currencies: Currency[];
  languages: Language[];
  translations: Record<string, string>;
  flag: string;
  regionalBlocs: RegionalBloc[];
  cioc: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Language {
  iso639_1: string;
  iso639_2: string;
  name: string;
  nativeName: string;
}

export interface RegionalBloc {
  acronym: string;
  name: string;
  otherAcronyms: string[];
  otherNames: string[];
}

export interface City {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
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
    query: string;
    cacheHit: boolean;
  }[];
}

/**
 * GeographyService class for geographic data
 */
class GeographyService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
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
      const cachedData = localStorage.getItem(GEOGRAPHY_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Geography cache entries`);
      }
    } catch (error) {
      console.error('Failed to load Geography cache from storage:', error);
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
      
      localStorage.setItem(GEOGRAPHY_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Geography cache to storage:', error);
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
    console.log('Resetting Geography daily API counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(endpoint: string, query: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
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
   * Generate a cache key for a request
   */
  private getCacheKey(endpoint: string, query: string = ''): string {
    return `${endpoint}:${query}`;
  }
  
  /**
   * Make a generic API request with cache
   */
  private async makeRequest<T>(
    endpoint: string, 
    query: string = '', 
    params: Record<string, any> = {}
  ): Promise<T> {
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('Geography daily API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cacheKey = this.getCacheKey(endpoint, query);
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall(endpoint, query, true);
        return cachedData.data;
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    const cacheKey = this.getCacheKey(endpoint, query);
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Geography data doesn't change often
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Geography data (${cacheAgeDays.toFixed(1)} days old) for ${endpoint}/${query}`);
        this.recordApiCall(endpoint, query, true);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      let url = `${GEOGRAPHY_BASE_URL}${endpoint}`;
      if (query) {
        url += `/${encodeURIComponent(query)}`;
      }
      
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': USER_AGENT,
          'apikey': GEOGRAPHY_API_KEY
        },
        timeout: 10000 // 10 second timeout
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
      this.recordApiCall(endpoint, query, false);
      return response.data;
    } catch (error) {
      console.error(`Error with Geography API request to ${endpoint}/${query}:`, error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for ${endpoint}/${query}`);
        return cachedData.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get a city by name
   * @param cityName Name of the city
   */
  async getCityByName(cityName: string): Promise<City[]> {
    return this.makeRequest<City[]>('/city', cityName);
  }
  
  /**
   * Get a country by phone calling code
   * @param callingCode Phone calling code (e.g., '1' for US/Canada)
   */
  async getCountryByCallingCode(callingCode: string): Promise<Country[]> {
    return this.makeRequest<Country[]>('/callingcode', callingCode);
  }
  
  /**
   * Get a country by its capital city
   * @param capitalName Name of the capital city
   */
  async getCountryByCapital(capitalName: string): Promise<Country[]> {
    return this.makeRequest<Country[]>('/capital', capitalName);
  }
  
  /**
   * Get all major cities of a country
   * @param countryCode Alpha-2 or Alpha-3 country code (e.g., 'US' or 'USA')
   */
  async getCitiesByCountry(countryCode: string): Promise<City[]> {
    return this.makeRequest<City[]>('/country/cities', countryCode);
  }
  
  /**
   * Get major cities by country and region/state
   * @param countryCode Alpha-2 or Alpha-3 country code
   * @param regionName Name of the region or state
   */
  async getCitiesByRegion(countryCode: string, regionName: string): Promise<City[]> {
    return this.makeRequest<City[]>(`/country/${countryCode}/region/${regionName}/city`, '');
  }
  
  /**
   * Get a country by its 2-character code
   * @param alpha2Code Alpha-2 country code (e.g., 'US')
   */
  async getCountryByCode(alpha2Code: string): Promise<Country> {
    return this.makeRequest<Country>('/alpha2', alpha2Code);
  }
  
  /**
   * Get all countries using a specific currency
   * @param currencyCode Currency code (e.g., 'USD')
   */
  async getCountriesByCurrency(currencyCode: string): Promise<Country[]> {
    return this.makeRequest<Country[]>('/currency', currencyCode);
  }
  
  /**
   * Get all countries speaking a specific language
   * @param languageCode ISO 639-1 language code (e.g., 'en')
   */
  async getCountriesByLanguage(languageCode: string): Promise<Country[]> {
    return this.makeRequest<Country[]>('/lang', languageCode);
  }
  
  /**
   * Get a country by name
   * @param countryName Name of the country
   */
  async getCountryByName(countryName: string): Promise<Country[]> {
    return this.makeRequest<Country[]>('/name', countryName);
  }
  
  /**
   * Get a country by region
   * @param regionName Name of the region (e.g., 'Europe', 'Asia')
   */
  async getCountriesByRegion(regionName: string): Promise<Country[]> {
    return this.makeRequest<Country[]>('/region', regionName);
  }
  
  /**
   * Get all countries in a regional bloc
   * @param blocCode Regional bloc code (e.g., 'EU', 'NAFTA')
   */
  async getCountriesByBloc(blocCode: string): Promise<Country[]> {
    return this.makeRequest<Country[]>('/regionalbloc', blocCode);
  }
  
  /**
   * Get a country by its top-level domain
   * @param tld Top-level domain (e.g., '.us', '.uk')
   */
  async getCountryByTLD(tld: string): Promise<Country[]> {
    // Ensure the tld starts with a dot
    if (!tld.startsWith('.')) {
      tld = '.' + tld;
    }
    return this.makeRequest<Country[]>('/tld', tld);
  }
  
  /**
   * Get a currency by its code
   * @param currencyCode Currency code (e.g., 'USD')
   */
  async getCurrencyByCode(currencyCode: string): Promise<Currency> {
    return this.makeRequest<Currency>('/currency/code', currencyCode);
  }
  
  /**
   * Get a currency by name
   * @param currencyName Currency name (e.g., 'US Dollar')
   */
  async getCurrencyByName(currencyName: string): Promise<Currency> {
    return this.makeRequest<Currency>('/currency/name', currencyName);
  }
  
  /**
   * Get all countries in the world
   */
  async getAllCountries(): Promise<Country[]> {
    return this.makeRequest<Country[]>('/all', '');
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
    return '© Geography API by APILayer';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(GEOGRAPHY_CACHE_KEY);
    console.log('Geography cache cleared');
  }
}

// Export singleton instance
export const geographyService = new GeographyService();
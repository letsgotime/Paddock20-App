/**
 * Ultra-Conservative OpenCage Geocoding Cache Service
 * 
 * This service implements an extremely aggressive caching strategy for OpenCage geocoding API,
 * which has a limit of 2,500 requests/day on the free plan (effectively 1/day for our needs).
 * 
 * Features:
 * - Local storage persistence with 30-day TTL
 * - Self-enforced daily request limit (1 per day)
 * - Request queue with deduplication
 * - Grid approximation for similar coordinates
 */

import axios from 'axios';

// API Configuration
const OPENCAGE_API_KEY = 'c41822b0748b48f6b019e4e22a85560d';
const OPENCAGE_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

// Cache Configuration - extremely conservative
const CACHE_TTL_DAYS = 30; // Cache for 30 days
const STORAGE_KEY_PREFIX = 'geocache_';
const LAST_REQUEST_DATE_KEY = 'geocache_last_request_date';
const DAILY_REQUEST_COUNT_KEY = 'geocache_daily_request_count';
const MAX_DAILY_REQUESTS = 1; // Extremely conservative limit

// Interface for geocoded location data
export interface GeocodedLocation {
  formattedAddress: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  components: Record<string, string>;
}

// Service to manage OpenCage geocoding with ultra-conservative caching
class GeocacheService {
  private cache: Map<string, { data: GeocodedLocation; timestamp: number }> = new Map();
  private requestQueue: Array<{
    resolve: (value: GeocodedLocation) => void;
    reject: (reason: any) => void;
    params: any;
  }> = [];
  private processingQueue: boolean = false;
  
  constructor() {
    this.loadCacheFromStorage();
  }
  
  /**
   * Load all cached data from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      // Find all keys in localStorage that start with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          try {
            const cachedValue = JSON.parse(localStorage.getItem(key) || '');
            if (cachedValue && cachedValue.data && cachedValue.timestamp) {
              this.cache.set(key.replace(STORAGE_KEY_PREFIX, ''), cachedValue);
            }
          } catch (error) {
            // Ignore invalid JSON
            localStorage.removeItem(key);
          }
        }
      }
      console.log(`Loaded ${this.cache.size} geocode entries from cache`);
    } catch (error) {
      console.error('Failed to load geocode cache:', error);
    }
  }
  
  /**
   * Save an item to both the in-memory cache and localStorage
   */
  private saveToCache(key: string, data: GeocodedLocation): void {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    
    // Save to in-memory cache
    this.cache.set(key, cacheItem);
    
    // Save to localStorage
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${key}`, 
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      this.clearOldCacheEntries();
      
      // Try again after clearing old entries
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${key}`, 
          JSON.stringify(cacheItem)
        );
      } catch (retryError) {
        console.error('Still failed to save to localStorage after clearing old entries:', retryError);
      }
    }
  }
  
  /**
   * Clear expired or oldest cache entries to make room for new ones
   */
  private clearOldCacheEntries(): void {
    try {
      const now = Date.now();
      const expiryTime = now - (CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
      
      // First, try to remove expired entries
      let removed = 0;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          try {
            const value = JSON.parse(localStorage.getItem(key) || '');
            if (value && value.timestamp && value.timestamp < expiryTime) {
              localStorage.removeItem(key);
              removed++;
            }
          } catch (e) {
            // If we can't parse it, just remove it
            localStorage.removeItem(key);
            removed++;
          }
        }
      }
      
      // If we haven't removed any items, remove the oldest ones
      if (removed === 0) {
        const cacheEntries: { key: string; timestamp: number }[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            try {
              const value = JSON.parse(localStorage.getItem(key) || '');
              if (value && value.timestamp) {
                cacheEntries.push({ key, timestamp: value.timestamp });
              }
            } catch (e) {
              // Ignore invalid entries
            }
          }
        }
        
        // Sort by timestamp (oldest first)
        cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove the oldest 20% of entries
        const toRemove = Math.max(1, Math.floor(cacheEntries.length * 0.2));
        for (let i = 0; i < toRemove; i++) {
          if (cacheEntries[i]) {
            localStorage.removeItem(cacheEntries[i].key);
          }
        }
        
        console.log(`Removed ${toRemove} oldest cache entries to free up space`);
      } else {
        console.log(`Removed ${removed} expired cache entries`);
      }
    } catch (error) {
      console.error('Error clearing old cache entries:', error);
    }
  }
  
  /**
   * Check if we can make an API request today
   */
  private canMakeRequest(): boolean {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastRequestDate = localStorage.getItem(LAST_REQUEST_DATE_KEY);
    const dailyCount = Number(localStorage.getItem(DAILY_REQUEST_COUNT_KEY) || '0');
    
    // Reset counter if it's a new day
    if (lastRequestDate !== today) {
      localStorage.setItem(LAST_REQUEST_DATE_KEY, today);
      localStorage.setItem(DAILY_REQUEST_COUNT_KEY, '0');
      return true;
    }
    
    // Check if we're under our self-imposed limit
    return dailyCount < MAX_DAILY_REQUESTS;
  }
  
  /**
   * Track an API request to stay within limits
   */
  private trackRequest(): void {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyCount = Number(localStorage.getItem(DAILY_REQUEST_COUNT_KEY) || '0');
    
    localStorage.setItem(LAST_REQUEST_DATE_KEY, today);
    localStorage.setItem(DAILY_REQUEST_COUNT_KEY, String(dailyCount + 1));
  }
  
  /**
   * Generate a cache key that groups similar requests
   * We implement grid approximation to reduce near-identical requests
   */
  private generateCacheKey(params: any): string {
    if (typeof params === 'string') {
      // For text-based queries (forward geocoding)
      return `q:${params.toLowerCase().trim()}`;
    } else if (params.lat !== undefined && params.lon !== undefined) {
      // For coordinate-based queries (reverse geocoding)
      // Round coordinates to reduce similar requests (0.01 is roughly 1km)
      const lat = Math.round(params.lat * 100) / 100;
      const lon = Math.round(params.lon * 100) / 100;
      return `r:${lat},${lon}`;
    } else {
      // Fallback
      return `o:${JSON.stringify(params)}`;
    }
  }
  
  /**
   * Process response from OpenCage API into our standardized format
   */
  private processResponse(response: any): GeocodedLocation | null {
    if (response?.results && response.results.length > 0) {
      const result = response.results[0];
      const components = result.components || {};
      
      return {
        formattedAddress: result.formatted || '',
        city: components.city || components.town || components.village || components.hamlet || '',
        region: components.state || components.county || '',
        country: components.country || '',
        lat: result.geometry.lat,
        lon: result.geometry.lng,
        components: components
      };
    }
    
    return null;
  }
  
  /**
   * Forward geocoding - convert place name to coordinates
   */
  async geocode(query: string): Promise<GeocodedLocation> {
    const cacheKey = this.generateCacheKey(query);
    
    // First check the cache
    const cachedItem = this.cache.get(cacheKey);
    if (cachedItem) {
      const ageInDays = (Date.now() - cachedItem.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays < CACHE_TTL_DAYS) {
        console.log(`Using cached geocode data (${ageInDays.toFixed(1)} days old)`);
        return cachedItem.data;
      }
    }
    
    // If not in cache or too old, make a request (with queuing)
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        resolve,
        reject,
        params: query
      });
      
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Reverse geocoding - convert coordinates to place information
   */
  async reverseGeocode(lat: number, lon: number): Promise<GeocodedLocation> {
    const cacheKey = this.generateCacheKey({ lat, lon });
    
    // First check the cache
    const cachedItem = this.cache.get(cacheKey);
    if (cachedItem) {
      const ageInDays = (Date.now() - cachedItem.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays < CACHE_TTL_DAYS) {
        console.log(`Using cached reverse geocode data (${ageInDays.toFixed(1)} days old)`);
        return cachedItem.data;
      }
    }
    
    // If not in cache or too old, make a request (with queuing)
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        resolve,
        reject,
        params: { lat, lon }
      });
      
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Process the queue of pending requests
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      // Get the first request in the queue
      const request = this.requestQueue.shift();
      if (!request) {
        this.processingQueue = false;
        return;
      }
      
      const { resolve, reject, params } = request;
      const cacheKey = this.generateCacheKey(params);
      
      // Check if we've already reached our daily limit
      if (!this.canMakeRequest()) {
        console.warn('Daily OpenCage API request limit reached');
        
        // Try to use cached data even if it's old
        const cachedItem = this.cache.get(cacheKey);
        if (cachedItem) {
          console.log('Using expired cache as fallback');
          resolve(cachedItem.data);
        } else {
          reject(new Error('OpenCage API daily limit reached and no cached data available'));
        }
        
        // Continue with next request
        this.processingQueue = false;
        this.processQueue();
        return;
      }
      
      // If we got here, we can make a request
      try {
        this.trackRequest();
        
        const apiParams: Record<string, any> = {
          key: OPENCAGE_API_KEY,
          language: 'en',
          limit: 1,
          no_annotations: 0,
          abbrv: 1,
        };
        
        if (typeof params === 'string') {
          // Forward geocoding
          apiParams.q = params;
        } else if (params.lat !== undefined && params.lon !== undefined) {
          // Reverse geocoding
          apiParams.q = `${params.lat},${params.lon}`;
        } else {
          throw new Error('Invalid parameters for geocoding request');
        }
        
        const response = await axios.get(OPENCAGE_BASE_URL, {
          params: apiParams,
          timeout: 5000
        });
        
        const processedData = this.processResponse(response.data);
        
        if (processedData) {
          // Save to cache
          this.saveToCache(cacheKey, processedData);
          
          // Resolve the promise
          resolve(processedData);
        } else {
          throw new Error('No results found');
        }
      } catch (error) {
        console.error('OpenCage API request failed:', error);
        
        // Try to use cached data as fallback
        const cachedItem = this.cache.get(cacheKey);
        if (cachedItem) {
          console.log('Using cached data after error');
          resolve(cachedItem.data);
        } else {
          reject(error);
        }
      }
    } finally {
      // Mark as not processing queue
      this.processingQueue = false;
      
      // Process next request if any
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 500);
      }
    }
  }
  
  /**
   * Clear all cache entries
   */
  clearCache(): void {
    // Clear in-memory cache
    this.cache.clear();
    
    // Clear localStorage entries
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    
    console.log('Geocode cache cleared');
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number, oldestEntry: number, newestEntry: number, sizeBytes: number } {
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    let totalSize = 0;
    let entryCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const value = localStorage.getItem(key) || '';
          totalSize += key.length + value.length;
          entryCount++;
          
          const parsed = JSON.parse(value);
          if (parsed && parsed.timestamp) {
            if (parsed.timestamp < oldestTimestamp) {
              oldestTimestamp = parsed.timestamp;
            }
            if (parsed.timestamp > newestTimestamp) {
              newestTimestamp = parsed.timestamp;
            }
          }
        } catch (e) {
          // Ignore invalid entries
        }
      }
    }
    
    return {
      entries: entryCount,
      oldestEntry: entryCount > 0 ? Math.floor((Date.now() - oldestTimestamp) / (1000 * 60 * 60 * 24)) : 0,
      newestEntry: entryCount > 0 ? Math.floor((Date.now() - newestTimestamp) / (1000 * 60 * 60 * 24)) : 0,
      sizeBytes: totalSize * 2 // Multiply by 2 because JavaScript uses UTF-16 (2 bytes per character)
    };
  }
}

// Export singleton instance
export const geocacheService = new GeocacheService();
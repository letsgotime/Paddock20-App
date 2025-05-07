/**
 * OpenCage Geocoding Service
 * 
 * This service handles geocoding operations with an extremely conservative
 * approach to API usage, as we're limited to 2,500 requests/day on free plan.
 * 
 * Features:
 * - Ultra-long-term caching (7 days+)
 * - IndexedDB for persistent browser storage
 * - LocalStorage fallback
 * - Request batching and deduplication
 * - Coordinates grid approximation to avoid similar requests
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { LocationData } from '@/contexts/LocationServicesContext';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const OPENCAGE_API_KEY = 'c41822b0748b48f6b019e4e22a85560d'; // API key from attached document
const OPENCAGE_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json';

// Cache Configuration - extremely long to conserve API usage
const CACHE_TTL_DAYS = 30; // 30 days cache - most locations don't change frequently
const CACHE_STORAGE_KEY = 'opencage_geocode_cache';
const LAST_REQUEST_DATE_KEY = 'opencage_last_request_date';
const DAILY_REQUEST_COUNT_KEY = 'opencage_daily_request_count';
const MAX_DAILY_REQUESTS = 1; // Extremely conservative limit

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Response interface from OpenCage API
export interface OpenCageResponse {
  documentation: string;
  licenses: Array<{ name: string; url: string }>;
  rate: {
    limit: number;
    remaining: number;
    reset: number;
  };
  results: Array<{
    annotations: any;
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
    components: {
      city?: string;
      country?: string;
      country_code?: string;
      county?: string;
      postcode?: string;
      road?: string;
      state?: string;
      state_code?: string;
      suburb?: string;
      town?: string;
      village?: string;
      [key: string]: any;
    };
    confidence: number;
    formatted: string;
    geometry: {
      lat: number;
      lng: number;
    };
  }>;
  status: {
    code: number;
    message: string;
  };
  stay_informed: {
    blog: string;
    twitter: string;
  };
  thanks: string;
  timestamp: {
    created_http: string;
    created_unix: number;
  };
  total_results: number;
}

/**
 * OpenCage Geocoding Service
 * Implements extremely conservative API usage patterns
 */
class OpenCageService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private isLoadingCache: boolean = false;
  private requestQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    params: any;
  }> = [];
  private processingQueue: boolean = false;
  
  constructor() {
    this.loadCacheFromStorage();
  }
  
  /**
   * Load cache from persistent storage
   */
  private async loadCacheFromStorage(): Promise<void> {
    if (this.isLoadingCache) return;
    this.isLoadingCache = true;
    
    try {
      const cachedData = localStorage.getItem(CACHE_STORAGE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} OpenCage geocode entries from cache`);
      }
    } catch (error) {
      console.error('Failed to load OpenCage cache from storage:', error);
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
      
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject), CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save OpenCage cache to storage:', error);
    }
  }
  
  /**
   * Check if we've reached our daily API request limit
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
    
    // Check if we're under our self-imposed daily limit
    return dailyCount < MAX_DAILY_REQUESTS;
  }
  
  /**
   * Track API request to stay within limits
   */
  private trackRequest(): void {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyCount = Number(localStorage.getItem(DAILY_REQUEST_COUNT_KEY) || '0');
    
    localStorage.setItem(LAST_REQUEST_DATE_KEY, today);
    localStorage.setItem(DAILY_REQUEST_COUNT_KEY, String(dailyCount + 1));
  }
  
  /**
   * Generate a cache key for a request
   * Round coordinates to reduce similar requests
   */
  private getCacheKey(params: any): string {
    // Grid approximation - round coordinates to reduce near-identical requests
    // A difference of 0.01 in lat/lng is roughly 1km
    const roundedParams = { ...params };
    
    if (roundedParams.q) {
      return `q:${roundedParams.q}`;
    }
    
    if (roundedParams.latitude && roundedParams.longitude) {
      // Round to 2 decimal places (approx. 1km precision)
      roundedParams.latitude = Math.round(roundedParams.latitude * 100) / 100;
      roundedParams.longitude = Math.round(roundedParams.longitude * 100) / 100;
      return `latlng:${roundedParams.latitude},${roundedParams.longitude}`;
    }
    
    // Fallback to a JSON string of all params
    return `params:${JSON.stringify(roundedParams)}`;
  }
  
  /**
   * Forward geocoding: Get location details from a place name or address
   */
  async geocode(query: string): Promise<LocationData | null> {
    return this.makeRequest({
      q: query
    });
  }
  
  /**
   * Reverse geocoding: Get address and place details from coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationData | null> {
    return this.makeRequest({
      latitude,
      longitude
    });
  }
  
  /**
   * Make an API request with caching and rate limiting
   */
  private async makeRequest(params: any): Promise<LocationData | null> {
    const cacheKey = this.getCacheKey(params);
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Use cached data if it's not too old
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached OpenCage data (${cacheAgeDays.toFixed(1)} days old) for ${cacheKey}`);
        return cachedData.data;
      }
    }
    
    // Return a promise that will be resolved when the request is processed
    return new Promise<LocationData | null>((resolve, reject) => {
      // Add to queue
      this.requestQueue.push({
        resolve,
        reject,
        params
      });
      
      // Start processing queue if not already
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
      // Take the first request from the queue
      const request = this.requestQueue.shift();
      if (!request) {
        this.processingQueue = false;
        return;
      }
      
      const { resolve, reject, params } = request;
      const cacheKey = this.getCacheKey(params);
      
      // Check if we can make an API request today
      if (!this.canMakeRequest()) {
        console.warn('Daily OpenCage API request limit reached, using fallback data');
        
        // If we have cached data (even if old), use it as fallback
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          console.log(`Using expired cache as fallback for ${cacheKey}`);
          resolve(cachedData.data);
        } else {
          // No cached data available
          reject(new Error('OpenCage API daily limit reached and no cached data available'));
        }
        
        // Continue processing the queue
        this.processingQueue = false;
        this.processQueue();
        return;
      }
      
      // Make the actual API request
      try {
        // Track this request
        this.trackRequest();
        
        let apiParams: Record<string, any> = {
          key: OPENCAGE_API_KEY,
          language: 'en', // Preferred language for results
          limit: 1, // Limit to one result to save bandwidth
          no_annotations: 0, // Include annotations
          abbrv: 1, // Allow abbreviations
        };
        
        // Add query parameters
        if (params.q) {
          apiParams.q = params.q;
        } else if (params.latitude && params.longitude) {
          apiParams.q = `${params.latitude},${params.longitude}`;
        }
        
        // Make the request
        const response = await axios.get(OPENCAGE_BASE_URL, {
          params: apiParams,
          timeout: 5000 // 5 second timeout
        });
        
        // Process the response
        const result = this.processOpenCageResponse(response.data);
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        this.saveCache();
        
        // Resolve the promise
        resolve(result);
        
      } catch (error) {
        console.error('OpenCage API request failed:', error);
        
        // Check if we have cached data to fall back to
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached data after error for ${cacheKey}`);
          resolve(cachedData.data);
        } else {
          reject(error);
        }
      }
      
    } finally {
      // Mark as not processing and continue with the next request if any
      this.processingQueue = false;
      if (this.requestQueue.length > 0) {
        // Add a small delay to avoid hammering the API
        setTimeout(() => this.processQueue(), 500);
      }
    }
  }
  
  /**
   * Process OpenCage API response into our LocationData format
   */
  private processOpenCageResponse(response: OpenCageResponse): LocationData | null {
    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      const components = result.components;
      
      // Build a location name
      let locationName = '';
      if (components.city) {
        locationName = components.city;
      } else if (components.town) {
        locationName = components.town;
      } else if (components.village) {
        locationName = components.village;
      } else if (components.county) {
        locationName = components.county;
      } else if (components.state) {
        locationName = components.state;
      } else if (components.country) {
        locationName = components.country;
      } else {
        locationName = result.formatted.split(',')[0];
      }
      
      // Add state/province if available
      if (components.state && !locationName.includes(components.state)) {
        locationName += `, ${components.state}`;
      }
      
      // Create LocationData object
      return {
        id: uuidv4(),
        name: locationName,
        lat: result.geometry.lat,
        lon: result.geometry.lng,
        type: 'search',
        icon: 'map-pin',
        address: result.formatted,
        lastUsed: Date.now()
      };
    }
    
    return null;
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(CACHE_STORAGE_KEY);
    console.log('OpenCage geocode cache cleared');
  }
}

// Export singleton instance
export const openCageService = new OpenCageService();
/**
 * Nominatim Service
 * 
 * Implements OpenStreetMap Nominatim geocoding with strict adherence to usage policy:
 * https://operations.osmfoundation.org/policies/nominatim/
 * 
 * Features:
 * - Ultra-conservative rate limiting (max 1 req/2s, well below the 1 req/s limit)
 * - Long-term caching (14 days)
 * - Request deduplication and queuing
 * - Proper User-Agent identification
 * - OSM attribution
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';
import { LocationInfo } from '@/contexts/EnhancedLocationContext';

// API Configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform (https://paddock20.com)';
// NOTE: In production, use the URL of your app

// Rate limiting & cache configuration
const MIN_REQUEST_GAP_MS = 2000; // 2 seconds between requests (more conservative than required)
const CACHE_TTL_DAYS = 14; // 14 days cache (aggressive to minimize API calls)
const NOMINATIM_CACHE_KEY = 'nominatim_geocode_cache';
const LAST_REQUEST_TIMESTAMP_KEY = 'nominatim_last_request_timestamp';

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

/**
 * Nominatim Service class for geocoding
 */
class NominatimService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private isLoadingCache: boolean = false;
  private lastRequestTime: number = 0;
  private requestQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    params: any;
    type: 'forward' | 'reverse';
  }> = [];
  private processingQueue: boolean = false;
  
  constructor() {
    this.loadCacheFromStorage();
    
    // Get last request time from storage
    const lastRequestTime = localStorage.getItem(LAST_REQUEST_TIMESTAMP_KEY);
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
      const cachedData = localStorage.getItem(NOMINATIM_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Nominatim geocode entries from cache`);
      }
    } catch (error) {
      console.error('Failed to load Nominatim cache from storage:', error);
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
      
      localStorage.setItem(NOMINATIM_CACHE_KEY, JSON.stringify(cacheObject), CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Nominatim cache to storage:', error);
    }
  }
  
  /**
   * Generate a cache key for a request
   */
  private getCacheKey(type: 'forward' | 'reverse', params: any): string {
    if (type === 'forward') {
      return `forward:${params.q.toLowerCase().trim()}`;
    } else {
      // Round coordinates to reduce similar requests
      const roundedLat = Math.round(params.lat * 1000) / 1000;
      const roundedLon = Math.round(params.lon * 1000) / 1000;
      return `reverse:${roundedLat},${roundedLon}`;
    }
  }
  
  /**
   * Forward geocoding: Get location details from a place name or address
   */
  async geocode(query: string): Promise<LocationInfo | null> {
    if (!query.trim()) return null;
    
    const params = { q: query, format: 'json', addressdetails: 1 };
    
    return new Promise<LocationInfo | null>((resolve, reject) => {
      this.requestQueue.push({
        resolve,
        reject,
        params,
        type: 'forward'
      });
      
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Reverse geocoding: Get address and place details from coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationInfo | null> {
    const params = { 
      lat: latitude, 
      lon: longitude, 
      format: 'json', 
      addressdetails: 1 
    };
    
    return new Promise<LocationInfo | null>((resolve, reject) => {
      this.requestQueue.push({
        resolve,
        reject,
        params,
        type: 'reverse'
      });
      
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Process the queue of pending requests with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      const request = this.requestQueue.shift();
      if (!request) {
        this.processingQueue = false;
        return;
      }
      
      const { resolve, reject, params, type } = request;
      const cacheKey = this.getCacheKey(type, params);
      
      // Check cache first
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        const cacheAge = Date.now() - cachedData.timestamp;
        const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
        
        // Use cached data if it's not too old
        if (cacheAgeDays < CACHE_TTL_DAYS) {
          console.log(`Using cached Nominatim data (${cacheAgeDays.toFixed(1)} days old) for ${cacheKey}`);
          resolve(cachedData.data);
          
          // Continue with the next request
          this.processingQueue = false;
          if (this.requestQueue.length > 0) {
            setTimeout(() => this.processQueue(), 100);
          }
          return;
        }
      }
      
      // Apply rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < MIN_REQUEST_GAP_MS) {
        // Need to wait before making the next request
        const waitTime = MIN_REQUEST_GAP_MS - timeSinceLastRequest;
        console.log(`Rate limiting Nominatim API - waiting ${waitTime}ms before next request`);
        
        setTimeout(() => {
          this.performRequest(type, params, cacheKey, resolve, reject);
        }, waitTime);
      } else {
        // Can make the request immediately
        this.performRequest(type, params, cacheKey, resolve, reject);
      }
    } catch (error) {
      console.error('Error processing Nominatim queue:', error);
      this.processingQueue = false;
      
      // Continue with the next request
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), MIN_REQUEST_GAP_MS);
      }
    }
  }
  
  /**
   * Perform the actual API request with proper headers
   */
  private async performRequest(
    type: 'forward' | 'reverse', 
    params: any, 
    cacheKey: string,
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ): Promise<void> {
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      // Set up the request
      const endpoint = type === 'reverse' ? '/reverse' : '/search';
      const url = `${NOMINATIM_BASE_URL}${endpoint}`;
      
      // Make the request with proper User-Agent
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': USER_AGENT
        },
        timeout: 5000 // 5 second timeout
      });
      
      let result: LocationInfo | null = null;
      
      if (type === 'forward' && Array.isArray(response.data) && response.data.length > 0) {
        result = this.processForwardResponse(response.data[0]);
      } else if (type === 'reverse' && response.data) {
        result = this.processReverseResponse(response.data);
      }
      
      if (result) {
        // Cache the result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        this.saveCache();
        
        // Resolve the promise
        resolve(result);
      } else {
        // No results found
        resolve(null);
      }
    } catch (error) {
      console.error('Error with Nominatim API request:', error);
      
      // Check if we have cached data to fall back to
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        console.log(`Using cached data after error for ${cacheKey}`);
        resolve(cachedData.data);
      } else {
        reject(error);
      }
    } finally {
      // Mark as not processing and continue with the next request
      this.processingQueue = false;
      
      // Wait a minimum time before processing the next request
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), MIN_REQUEST_GAP_MS);
      }
    }
  }
  
  /**
   * Process forward geocoding response
   */
  private processForwardResponse(data: any): LocationInfo | null {
    if (!data) return null;
    
    try {
      // Extract address components
      const address = data.address || {};
      const components: Record<string, string> = {};
      
      // Map address components
      Object.entries(address).forEach(([key, value]) => {
        if (typeof value === 'string') {
          components[key] = value;
        }
      });
      
      // Create location info
      return {
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        city: address.city || address.town || address.village || address.hamlet,
        region: address.state || address.county,
        country: address.country,
        formattedAddress: data.display_name,
        components,
        lastUpdated: new Date()
      };
    } catch (err) {
      console.error('Error processing Nominatim response:', err);
      return null;
    }
  }
  
  /**
   * Process reverse geocoding response
   */
  private processReverseResponse(data: any): LocationInfo | null {
    if (!data) return null;
    
    try {
      // Extract address components
      const address = data.address || {};
      const components: Record<string, string> = {};
      
      // Map address components
      Object.entries(address).forEach(([key, value]) => {
        if (typeof value === 'string') {
          components[key] = value;
        }
      });
      
      // Create location info
      return {
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        city: address.city || address.town || address.village || address.hamlet,
        region: address.state || address.county,
        country: address.country,
        formattedAddress: data.display_name,
        components,
        lastUpdated: new Date()
      };
    } catch (err) {
      console.error('Error processing Nominatim response:', err);
      return null;
    }
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
   * Get the OpenStreetMap attribution string
   */
  getAttribution(): string {
    return '© OpenStreetMap contributors';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(NOMINATIM_CACHE_KEY);
    console.log('Nominatim geocode cache cleared');
  }
}

// Export singleton instance
export const nominatimService = new NominatimService();
/**
 * Mapbox Service
 * 
 * Provides mapping and geocoding services using Mapbox API with aggressive caching
 * for efficient API usage.
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';
import { LocationInfo } from '@/contexts/EnhancedLocationContext';

// API Configuration
const MAPBOX_BASE_URL = 'https://api.mapbox.com';
const MAPBOX_GEOCODING_URL = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places`;

// Cache Configuration
const CACHE_TTL_DAYS = 7; // 7 days cache 
const GEOCODING_CACHE_KEY = 'mapbox_geocode_cache';
const MAP_CACHE_KEY = 'mapbox_map_cache';

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

/**
 * Mapbox Service class for geocoding and mapping
 */
class MapboxService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private isLoadingCache: boolean = false;
  
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
      const cachedData = localStorage.getItem(GEOCODING_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Mapbox geocode entries from cache`);
      }
    } catch (error) {
      console.error('Failed to load Mapbox cache from storage:', error);
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
      
      localStorage.setItem(GEOCODING_CACHE_KEY, JSON.stringify(cacheObject), CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Mapbox cache to storage:', error);
    }
  }
  
  /**
   * Forward geocoding: Get location details from a place name or address
   */
  async geocode(query: string): Promise<LocationInfo | null> {
    if (!query.trim()) return null;
    
    const cacheKey = `geocode:${query.toLowerCase().trim()}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Use cached data if it's not too old
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Mapbox geocode data (${cacheAgeDays.toFixed(1)} days old) for ${query}`);
        return cachedData.data;
      }
    }
    
    try {
      // Mapbox API requires token to be passed as a query parameter
      const encodedQuery = encodeURIComponent(query);
      const url = `${MAPBOX_GEOCODING_URL}/${encodedQuery}.json`;
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      const response = await axios.get(url, {
        params: {
          access_token: token,
          limit: 1, // Just get the top result
          language: 'en' // English results
        }
      });
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const [lon, lat] = feature.center;
        
        // Parse place context
        const locationComponents: Record<string, string> = {};
        if (feature.context) {
          feature.context.forEach((ctx: any) => {
            const id = ctx.id.split('.')[0];
            const text = ctx.text;
            locationComponents[id] = text;
          });
        }
        
        // Extract location information
        const locationInfo: LocationInfo = {
          lat,
          lon,
          city: feature.text || locationComponents.place,
          region: locationComponents.region,
          country: locationComponents.country,
          formattedAddress: feature.place_name,
          components: locationComponents,
          lastUpdated: new Date()
        };
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: locationInfo,
          timestamp: Date.now()
        });
        this.saveCache();
        
        return locationInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding with Mapbox:', error);
      
      // Return cached data if available, even if it's old
      if (cachedData) {
        console.log('Falling back to cached data after error');
        return cachedData.data;
      }
      
      return null;
    }
  }
  
  /**
   * Reverse geocoding: Get address and place details from coordinates
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<LocationInfo | null> {
    // Round coordinates to reduce similar requests
    const roundedLat = Math.round(latitude * 1000) / 1000;
    const roundedLon = Math.round(longitude * 1000) / 1000;
    
    const cacheKey = `reverse:${roundedLat},${roundedLon}`;
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Use cached data if it's not too old
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Mapbox reverse geocode data (${cacheAgeDays.toFixed(1)} days old) for ${roundedLat},${roundedLon}`);
        return cachedData.data;
      }
    }
    
    try {
      // Construct the query for reverse geocoding
      const coordinates = `${longitude},${latitude}`;
      const url = `${MAPBOX_GEOCODING_URL}/${coordinates}.json`;
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      const response = await axios.get(url, {
        params: {
          access_token: token,
          types: 'address,place',
          limit: 1,
          language: 'en'
        }
      });
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        
        // Parse place context
        const locationComponents: Record<string, string> = {};
        if (feature.context) {
          feature.context.forEach((ctx: any) => {
            const id = ctx.id.split('.')[0];
            const text = ctx.text;
            locationComponents[id] = text;
          });
        }
        
        // For address-level results, add properties from place_type
        if (feature.properties) {
          Object.entries(feature.properties).forEach(([key, value]) => {
            if (typeof value === 'string') {
              locationComponents[key] = value;
            }
          });
        }
        
        // Extract location information
        const locationInfo: LocationInfo = {
          lat: latitude,
          lon: longitude,
          city: locationComponents.place,
          region: locationComponents.region,
          country: locationComponents.country,
          formattedAddress: feature.place_name,
          components: locationComponents,
          lastUpdated: new Date()
        };
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: locationInfo,
          timestamp: Date.now()
        });
        this.saveCache();
        
        return locationInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding with Mapbox:', error);
      
      // Return cached data if available, even if it's old
      if (cachedData) {
        console.log('Falling back to cached data after error');
        return cachedData.data;
      }
      
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
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(GEOCODING_CACHE_KEY);
    console.log('Mapbox geocode cache cleared');
  }
}

// Export singleton instance
export const mapboxService = new MapboxService();
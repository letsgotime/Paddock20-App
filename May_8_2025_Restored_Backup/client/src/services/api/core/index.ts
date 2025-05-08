/**
 * API Data Warehouse Core
 * 
 * This is the central hub for all API operations in PADDOCK20.
 * It provides a unified interface for accessing various API services with
 * advanced features like caching, provider failover, and error recovery.
 */

import { APICategory, APIResponse, APIRequest, HealthStatus } from '../types/core';

/**
 * APIDataWarehouseCore Class
 * Manages all API requests, caching, and provider selection
 */
export class APIDataWarehouseCore {
  private providers: Map<APICategory, Array<any>> = new Map();
  private cache = {
    primary: new Map<string, { data: any; timestamp: number; ttl: number }>(),
    secondary: new Map<string, { data: any; timestamp: number; ttl: number }>(),
    offline: new Map<string, { data: any; timestamp: number; ttl: number }>(),
  };

  private static instance: APIDataWarehouseCore;

  constructor() {
    if (APIDataWarehouseCore.instance) {
      return APIDataWarehouseCore.instance;
    }
    APIDataWarehouseCore.instance = this;
    
    // Initialize cache with localStorage data if available
    this.loadCacheFromStorage();
    
    // Set up periodic cache maintenance
    setInterval(() => this.maintainCache(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Register a provider for a specific API category
   */
  registerProvider(category: APICategory, provider: any, priority = 0): void {
    if (!this.providers.has(category)) {
      this.providers.set(category, []);
    }
    
    const providers = this.providers.get(category)!;
    providers.push({ provider, priority });
    
    // Sort providers by priority (higher values = higher priority)
    providers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all registered providers for a category
   */
  getProviders(category: APICategory): Array<any> {
    return this.providers.get(category) || [];
  }

  /**
   * Execute an API request with caching and provider fallback
   */
  async fetch<T>(request: APIRequest): Promise<APIResponse<T>> {
    const { category, endpoint, params, cacheTTL = 60 * 60 * 1000 } = request;
    
    // Generate cache key
    const cacheKey = `${category}:${endpoint}:${JSON.stringify(params || {})}`;
    
    // Try to get from cache if caching is enabled
    if (cacheTTL > 0) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          provider: null,
        };
      }
    }
    
    // Get providers for this category
    const providers = this.getProviders(category);
    if (!providers.length) {
      return {
        success: false,
        error: {
          code: 'no_provider',
          message: `No providers available for ${category}`,
          reason: 'NO_PROVIDER',
        },
        fromCache: false,
        provider: null,
      };
    }
    
    // Try each provider in priority order
    const errors: any[] = [];
    for (const { provider } of providers) {
      try {
        const response = await provider.execute({ 
          ...request,
          endpoint: endpoint || 'default'
        });
        
        // Cache successful response if caching is enabled
        if (response.success && cacheTTL > 0) {
          this.saveToCache(cacheKey, response.data, cacheTTL);
        }
        
        return response;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        errors.push(error);
        // Continue to the next provider
      }
    }
    
    // All providers failed, try offline cache as last resort
    const offlineData = this.getFromOfflineCache(cacheKey);
    if (offlineData) {
      return {
        success: true,
        data: offlineData,
        fromCache: true,
        provider: null,
        stale: true
      };
    }
    
    // Return failure if all providers failed and no cache is available
    return {
      success: false,
      error: {
        code: 'all_providers_failed',
        message: 'All providers failed',
        reason: 'PROVIDER_ERROR',
        details: errors
      },
      fromCache: false,
      provider: null,
    };
  }
  
  /**
   * Health check for all registered providers
   */
  async getHealthStatus(): Promise<Record<APICategory, HealthStatus>> {
    const result: Record<APICategory, HealthStatus> = {} as any;
    
    for (const [category, providers] of this.providers.entries()) {
      if (!providers.length) {
        result[category] = {
          status: 'unavailable',
          details: 'No providers registered'
        };
        continue;
      }
      
      const healthChecks = await Promise.all(
        providers.map(async ({ provider }) => {
          try {
            const status = await provider.provider.getHealthStatus();
            return { provider: provider.provider.name, status };
          } catch (error) {
            return { provider: provider.provider.name, status: 'unavailable' };
          }
        })
      );
      
      // Determine overall status from individual provider statuses
      const overallStatus = this.determineOverallHealth(healthChecks);
      
      result[category] = {
        status: overallStatus,
        details: healthChecks
      };
    }
    
    return result;
  }
  
  /**
   * Determine overall health status from individual provider statuses
   */
  private determineOverallHealth(checks: Array<{ provider: string; status: string }>): 'healthy' | 'degraded' | 'unavailable' {
    const statuses = checks.map(check => check.status);
    
    // If any provider is healthy, the service is at least degraded
    if (statuses.includes('healthy')) {
      // If all are healthy, the service is healthy
      if (statuses.every(status => status === 'healthy')) {
        return 'healthy';
      }
      return 'degraded';
    }
    
    // If any provider is degraded, the service is degraded
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    
    // Otherwise, the service is unavailable
    return 'unavailable';
  }
  
  /**
   * Cache Management Functions
   */
  
  /**
   * Save data to primary and secondary caches
   */
  private saveToCache(key: string, data: any, ttl: number): void {
    const timestamp = Date.now();
    
    // Primary cache (in-memory)
    this.cache.primary.set(key, { data, timestamp, ttl });
    
    // Secondary cache (localStorage)
    try {
      const secondaryCacheKey = `paddock20_api_cache_${key}`;
      localStorage.setItem(secondaryCacheKey, JSON.stringify({ data, timestamp, ttl }));
    } catch (error) {
      console.warn('Failed to save to secondary cache:', error);
    }
    
    // Offline cache (long-term localStorage)
    try {
      const offlineCacheKey = `paddock20_api_offline_${key}`;
      localStorage.setItem(offlineCacheKey, JSON.stringify({ data, timestamp, ttl: ttl * 10 }));
    } catch (error) {
      console.warn('Failed to save to offline cache:', error);
    }
  }
  
  /**
   * Get data from primary or secondary cache if still valid
   */
  private getFromCache(key: string): any {
    const now = Date.now();
    
    // Check primary cache first (in-memory)
    const primaryCache = this.cache.primary.get(key);
    if (primaryCache && now - primaryCache.timestamp < primaryCache.ttl) {
      return primaryCache.data;
    }
    
    // Try secondary cache (localStorage)
    try {
      const secondaryCacheKey = `paddock20_api_cache_${key}`;
      const secondaryCacheStr = localStorage.getItem(secondaryCacheKey);
      
      if (secondaryCacheStr) {
        const secondaryCache = JSON.parse(secondaryCacheStr);
        if (now - secondaryCache.timestamp < secondaryCache.ttl) {
          // Move to primary cache for faster access next time
          this.cache.primary.set(key, secondaryCache);
          return secondaryCache.data;
        }
      }
    } catch (error) {
      console.warn('Failed to read from secondary cache:', error);
    }
    
    return null;
  }
  
  /**
   * Get data from offline cache regardless of age
   * Used as a last resort when all providers fail
   */
  private getFromOfflineCache(key: string): any {
    try {
      const offlineCacheKey = `paddock20_api_offline_${key}`;
      const offlineCacheStr = localStorage.getItem(offlineCacheKey);
      
      if (offlineCacheStr) {
        const offlineCache = JSON.parse(offlineCacheStr);
        return offlineCache.data;
      }
    } catch (error) {
      console.warn('Failed to read from offline cache:', error);
    }
    
    return null;
  }
  
  /**
   * Load cache data from localStorage on initialization
   */
  private loadCacheFromStorage(): void {
    try {
      // Load all secondary cache entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('paddock20_api_cache_')) {
          const cacheKey = key.replace('paddock20_api_cache_', '');
          const cacheStr = localStorage.getItem(key);
          
          if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            this.cache.secondary.set(cacheKey, cache);
            
            // Also add to primary cache if still valid
            const now = Date.now();
            if (now - cache.timestamp < cache.ttl) {
              this.cache.primary.set(cacheKey, cache);
            }
          }
        } else if (key?.startsWith('paddock20_api_offline_')) {
          const cacheKey = key.replace('paddock20_api_offline_', '');
          const cacheStr = localStorage.getItem(key);
          
          if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            this.cache.offline.set(cacheKey, cache);
          }
        }
      }
      
      console.log(`Loaded ${this.cache.primary.size} primary, ${this.cache.secondary.size} secondary, and ${this.cache.offline.size} offline cache entries`);
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }
  
  /**
   * Periodically maintain cache by removing expired entries
   */
  private maintainCache(): void {
    const now = Date.now();
    
    // Clean primary cache
    for (const [key, entry] of this.cache.primary.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.primary.delete(key);
      }
    }
    
    // Clean secondary cache (localStorage)
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('paddock20_api_cache_')) {
          const cacheStr = localStorage.getItem(key);
          
          if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            if (now - cache.timestamp > cache.ttl) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to maintain secondary cache:', error);
    }
    
    // Clean offline cache only if storage is running low
    try {
      if (localStorage.length > 100) { // Arbitrary threshold
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          if (key?.startsWith('paddock20_api_offline_')) {
            const cacheStr = localStorage.getItem(key);
            
            if (cacheStr) {
              const cache = JSON.parse(cacheStr);
              if (now - cache.timestamp > cache.ttl * 2) { // Double the TTL for offline cache
                localStorage.removeItem(key);
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to maintain offline cache:', error);
    }
  }
}

// Singleton instance
export const apiWarehouse = new APIDataWarehouseCore();

// Default export
export default apiWarehouse;
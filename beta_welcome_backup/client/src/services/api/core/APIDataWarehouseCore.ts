import { BaseProvider, ProviderResponse } from './provider';
import { ApiRequestConfig, ApiResponse, CacheEntry, CacheStorageTier, ProviderType } from './types';

/**
 * API Warehouse cache structure
 */
interface APICache {
  primary: Map<string, CacheEntry>;
  secondary: Map<string, CacheEntry>;
  offline: Map<string, CacheEntry>;
}

/**
 * Core class for the API Data Warehouse
 * Handles provider registration, request routing, caching and fallback strategies
 */
export class APIDataWarehouse {
  private providers: Map<string, BaseProvider> = new Map();
  private providersByType: Map<string, BaseProvider[]> = new Map();
  private cache: APICache;
  private requestQueue: Map<string, Promise<any>> = new Map();
  
  constructor() {
    // Initialize caches
    this.cache = {
      primary: new Map<string, CacheEntry>(), // Hot cache, typically in-memory
      secondary: new Map<string, CacheEntry>(), // Warm cache, could be indexed DB
      offline: new Map<string, CacheEntry>(), // Cold cache, for offline use
    };
    
    console.log('Loaded', this.cache.primary.size, 'primary,', 
      this.cache.secondary.size, 'secondary, and', 
      this.cache.offline.size, 'offline cache entries');
  }
  
  /**
   * Register a provider with the warehouse
   */
  registerProvider(provider: BaseProvider): void {
    // Register in main providers map
    this.providers.set(provider.name, provider);
    
    // Register in type-based provider map
    if (!this.providersByType.has(provider.type)) {
      this.providersByType.set(provider.type, []);
    }
    
    const typedProviders = this.providersByType.get(provider.type)!;
    typedProviders.push(provider);
    
    // Sort providers by priority (higher priority first)
    typedProviders.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get all registered provider types
   */
  getProviderTypes(): string[] {
    return Array.from(this.providersByType.keys());
  }
  
  /**
   * Get all providers of a specific type
   */
  getProvidersByType(type: ProviderType): BaseProvider[] {
    return this.providersByType.get(type as string) || [];
  }
  
  /**
   * Generate a cache key for a request
   */
  generateCacheKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join('&');
    
    return `${type}:${sortedParams}`;
  }
  
  /**
   * Store data in the cache
   */
  cacheData<T>(
    key: string,
    data: T,
    provider: string,
    tier: CacheStorageTier = 'primary',
    ttl: number = 5 * 60 * 1000, // 5 minutes default TTL
    priority: number = 5
  ): void {
    const expiresAt = Date.now() + ttl;
    
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      provider,
      expiresAt,
      priority,
    };
    
    this.cache[tier].set(key, entry);
    
    // If storing in primary, also store in secondary and offline for redundancy
    if (tier === 'primary') {
      this.cache.secondary.set(key, entry);
      this.cache.offline.set(key, entry);
    }
    // If storing in secondary, also store in offline
    else if (tier === 'secondary') {
      this.cache.offline.set(key, entry);
    }
  }
  
  /**
   * Retrieve data from the cache
   */
  getCachedData<T>(
    key: string,
    tiers: CacheStorageTier[] = ['primary', 'secondary', 'offline']
  ): { data: T | null; source: CacheStorageTier | null; timestamp: number; provider: string | null } {
    for (const tier of tiers) {
      const entry = this.cache[tier].get(key) as CacheEntry<T> | undefined;
      
      if (entry) {
        // Check if entry is still valid
        if (entry.expiresAt > Date.now()) {
          return {
            data: entry.data,
            source: tier,
            timestamp: entry.timestamp,
            provider: entry.provider,
          };
        } else {
          // If entry is expired, remove it from this tier
          this.cache[tier].delete(key);
        }
      }
    }
    
    return {
      data: null,
      source: null,
      timestamp: 0,
      provider: null,
    };
  }
  
  /**
   * Deduplicate concurrent requests
   */
  async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if there's already a request in flight for this key
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key) as Promise<T>;
    }
    
    // Create and store the promise
    const requestPromise = requestFn();
    this.requestQueue.set(key, requestPromise);
    
    try {
      // Wait for the request to complete
      const result = await requestPromise;
      // Remove from queue after completion
      this.requestQueue.delete(key);
      return result;
    } catch (error) {
      // Remove from queue if error
      this.requestQueue.delete(key);
      throw error;
    }
  }
  
  /**
   * Make a request through the appropriate provider
   */
  async request<T = any>(
    type: ProviderType,
    method: string,
    params: Record<string, any> = {},
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    // Generate a cache key for this request
    const cacheKey = config.cacheKey || this.generateCacheKey(`${type}.${method}`, params);
    
    // Try to get from cache first unless caching is disabled
    if (config.cacheTTL !== 0) {
      const cached = this.getCachedData<T>(cacheKey);
      
      if (cached.data) {
        const cacheAge = Math.round((Date.now() - cached.timestamp) / 1000 / 60);
        console.log(`Using ${cached.source} cache data (${cacheAge} minutes old old)`);
        console.log('Using cached weather data from', `${cached.source}`);
        return {
          data: cached.data,
          provider: cached.provider || undefined,
          source: cached.source || 'cache',
          timestamp: cached.timestamp,
          success: true,
        };
      }
    }
    
    // Get providers of the requested type
    const providers = this.getProvidersByType(type);
    
    if (providers.length === 0) {
      return {
        data: null,
        error: `No providers available for type: ${type}`,
        timestamp: Date.now(),
        success: false,
      };
    }
    
    // Use specified providers if provided, otherwise use all providers of this type
    const targetProviders = config.fallbackProviders
      ? providers.filter(p => config.fallbackProviders?.includes(p.name))
      : providers;
    
    if (targetProviders.length === 0) {
      return {
        data: null,
        error: `No matching providers found for type: ${type}`,
        timestamp: Date.now(),
        success: false,
      };
    }
    
    // Create a deduplicated request function that tries each provider in order
    return this.deduplicateRequest<ApiResponse<T>>(cacheKey, async () => {
      let lastError: string | undefined;
      
      // Try each provider in order (sorted by priority)
      for (const provider of targetProviders) {
        try {
          // Make sure the provider has the requested method
          if (typeof (provider as any)[method] !== 'function') {
            continue;
          }
          
          // Call the provider method
          const result = await (provider as any)[method](...Object.values(params)) as ProviderResponse<T>;
          
          // If successful, cache the result
          if (result.success && result.data) {
            // Cache the result if caching is enabled
            if (config.cacheTTL !== 0) {
              this.cacheData(
                cacheKey,
                result.data,
                provider.name,
                'primary',
                config.cacheTTL || 5 * 60 * 1000, // 5 minutes default or custom TTL
                provider.priority
              );
            }
            
            return {
              data: result.data,
              provider: provider.name,
              source: 'api',
              timestamp: result.timestamp,
              success: true,
            };
          } else {
            lastError = result.error;
          }
        } catch (error: any) {
          lastError = error.message || 'Unknown error';
          console.error(`Error with provider ${provider.name}:`, error);
        }
      }
      
      // All providers failed
      return {
        data: null,
        error: lastError || 'All providers failed',
        timestamp: Date.now(),
        success: false,
      };
    });
  }
  
  /**
   * Clear all caches or a specific cache tier
   */
  clearCache(tier?: CacheStorageTier): void {
    if (tier) {
      this.cache[tier].clear();
    } else {
      this.cache.primary.clear();
      this.cache.secondary.clear();
      this.cache.offline.clear();
    }
  }
}
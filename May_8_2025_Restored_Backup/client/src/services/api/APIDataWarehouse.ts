/**
 * API Data Warehouse
 * 
 * A centralized system for managing API calls, caching responses,
 * and providing fallback mechanisms.
 * 
 * Key features:
 * - Centralized API key management
 * - Unified error handling with detailed logging
 * - Intelligent caching with TTL controls
 * - Fallback chains between providers
 * - Standardized data normalization
 * - Extensible plugin architecture for adding new API providers
 */

import { APIProvider, APIResponse, APIRequest, APICategory } from './types';

// Configuration interface for the data warehouse
interface WarehouseConfig {
  defaultCacheTTL: number; // Default cache time-to-live in ms
  defaultTimeout: number; // Default timeout for API calls in ms
  logLevel: 'error' | 'warn' | 'info' | 'debug'; // Logging verbosity
  recordMetrics: boolean; // Whether to record API call metrics
}

// Default configuration
const DEFAULT_CONFIG: WarehouseConfig = {
  defaultCacheTTL: 60 * 60 * 1000, // 1 hour
  defaultTimeout: 10000, // 10 seconds
  logLevel: 'warn',
  recordMetrics: true,
};

// Class to manage API providers, calls, and caching
export class APIDataWarehouse {
  private providers: Map<APICategory, APIProvider[]> = new Map();
  private cache: Map<string, { data: any, timestamp: number, ttl: number }> = new Map();
  private config: WarehouseConfig;
  private metrics: {
    calls: number;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    totalLatency: number;
  } = {
    calls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    totalLatency: 0,
  };

  constructor(config: Partial<WarehouseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logInfo('API Data Warehouse initialized');
  }

  /**
   * Register a new API provider
   * @param category - API category (weather, geocoding, etc)
   * @param provider - API provider implementation
   * @param priority - Priority level (higher = preferred)
   */
  registerProvider(category: APICategory, provider: APIProvider, priority: number = 0): void {
    if (!this.providers.has(category)) {
      this.providers.set(category, []);
    }

    const providers = this.providers.get(category)!;
    provider.priority = priority;
    providers.push(provider);
    
    // Sort providers by priority (highest first)
    providers.sort((a, b) => b.priority - a.priority);
    
    this.logInfo(`Registered provider "${provider.name}" for category "${category}" with priority ${priority}`);
  }

  /**
   * Make an API request with automatic fallback between providers
   * @param category - API category (weather, geocoding, etc)
   * @param request - API request parameters
   * @returns Promise with API response
   */
  async request<T>(category: APICategory, request: APIRequest): Promise<APIResponse<T>> {
    const startTime = Date.now();
    this.metrics.calls++;

    // Check if we have a cached response
    const cacheKey = this.getCacheKey(category, request);
    const cachedResponse = this.getFromCache<T>(cacheKey);
    if (cachedResponse) {
      this.metrics.cacheHits++;
      this.logDebug(`Cache hit for ${category} request`);
      return {
        ...cachedResponse,
        fromCache: true,
        providers: [],
      };
    }

    this.metrics.cacheMisses++;
    this.logDebug(`Cache miss for ${category} request`);

    // Get providers for the requested category
    const providers = this.providers.get(category) || [];
    if (providers.length === 0) {
      this.logError(`No providers registered for category "${category}"`);
      throw new Error(`No providers registered for API category "${category}"`);
    }

    // Try each provider in order of priority
    const errors: Error[] = [];
    const providersUsed: string[] = [];
    
    for (const provider of providers) {
      try {
        this.logDebug(`Trying provider "${provider.name}" for ${category} request`);
        providersUsed.push(provider.name);
        
        // Make the request
        const response = await Promise.race([
          provider.execute<T>(request),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout calling ${provider.name}`)), 
                      request.timeout || this.config.defaultTimeout);
          })
        ]);

        // Calculate metrics
        const latency = Date.now() - startTime;
        this.metrics.totalLatency += latency;
        
        // Cache the successful response
        const ttl = request.cacheTTL || provider.defaultCacheTTL || this.config.defaultCacheTTL;
        this.addToCache(cacheKey, response, ttl);
        
        this.logInfo(`Successfully used provider "${provider.name}" for ${category} request (${latency}ms)`);
        
        // Return the successful response
        return {
          ...response,
          fromCache: false,
          providers: providersUsed,
          latency,
        };
      } catch (error) {
        this.logWarn(`Provider "${provider.name}" failed for ${category} request: ${error.message}`);
        errors.push(error);
        
        // Try the next provider
        continue;
      }
    }

    // All providers failed
    this.metrics.errors++;
    this.logError(`All providers failed for ${category} request`);
    
    // Throw an error with all the provider errors
    throw new Error(
      `All providers failed for ${category} request: ${errors.map(e => e.message).join(', ')}`
    );
  }

  /**
   * Get an API key for a specific service
   * @param service - Service name
   * @returns API key or null if not found
   */
  getAPIKey(service: string): string | null {
    // First check environment variables with VITE_ prefix (for client-side)
    const envKey = `VITE_${service.toUpperCase()}_API_KEY`;
    const key = import.meta.env[envKey];
    
    if (key) {
      this.logDebug(`Found API key for ${service} in environment variables`);
      return key;
    }
    
    // Then check for service-specific local storage keys
    try {
      const localStorageKey = `${service.toLowerCase()}_api_key`;
      const storedKey = localStorage.getItem(localStorageKey);
      
      if (storedKey) {
        this.logDebug(`Found API key for ${service} in localStorage`);
        return storedKey;
      }
    } catch (error) {
      // Ignore localStorage errors (could be disabled)
    }
    
    this.logWarn(`No API key found for service "${service}"`);
    return null;
  }

  /**
   * Set an API key for a specific service
   * @param service - Service name
   * @param key - API key
   */
  setAPIKey(service: string, key: string): void {
    try {
      const localStorageKey = `${service.toLowerCase()}_api_key`;
      localStorage.setItem(localStorageKey, key);
      this.logInfo(`Set API key for service "${service}"`);
    } catch (error) {
      this.logError(`Failed to save API key for service "${service}": ${error.message}`);
    }
  }

  /**
   * Get cached data by key
   * @param key - Cache key
   * @returns Cached data or null if not found or expired
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache entry has expired
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.logDebug(`Cache expired for key "${key}"`);
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  /**
   * Add data to cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds
   */
  private addToCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.logDebug(`Added to cache: "${key}" (TTL: ${ttl}ms)`);
  }

  /**
   * Generate a cache key from category and request
   * @param category - API category
   * @param request - API request
   * @returns Cache key
   */
  private getCacheKey(category: APICategory, request: APIRequest): string {
    // Create a string representation of the request params for caching
    const paramsString = JSON.stringify(request.params || {});
    return `${category}:${request.endpoint}:${paramsString}`;
  }

  /**
   * Get API request metrics
   * @returns Current metrics
   */
  getMetrics() {
    const avgLatency = this.metrics.calls > 0 
      ? Math.round(this.metrics.totalLatency / this.metrics.calls) 
      : 0;
    
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.calls > 0 
        ? (this.metrics.cacheHits / this.metrics.calls) 
        : 0,
      avgLatency,
    };
  }

  /**
   * Reset metrics counters
   */
  resetMetrics() {
    this.metrics = {
      calls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      totalLatency: 0,
    };
    this.logDebug('Metrics reset');
  }

  /**
   * Clear the cache
   * @param category - Optional category to clear (or all if not specified)
   */
  clearCache(category?: APICategory) {
    if (category) {
      // Delete only entries for this category
      const prefix = `${category}:`;
      [...this.cache.keys()]
        .filter(key => key.startsWith(prefix))
        .forEach(key => this.cache.delete(key));
      
      this.logInfo(`Cleared cache for category "${category}"`);
    } else {
      // Clear all cache
      this.cache.clear();
      this.logInfo('Cleared entire cache');
    }
  }

  /**
   * Log an error message
   * @param message - Message to log
   */
  private logError(message: string): void {
    if (['error', 'warn', 'info', 'debug'].includes(this.config.logLevel)) {
      console.error(`[API Warehouse] ${message}`);
    }
  }

  /**
   * Log a warning message
   * @param message - Message to log
   */
  private logWarn(message: string): void {
    if (['warn', 'info', 'debug'].includes(this.config.logLevel)) {
      console.warn(`[API Warehouse] ${message}`);
    }
  }

  /**
   * Log an info message
   * @param message - Message to log
   */
  private logInfo(message: string): void {
    if (['info', 'debug'].includes(this.config.logLevel)) {
      console.info(`[API Warehouse] ${message}`);
    }
  }

  /**
   * Log a debug message
   * @param message - Message to log
   */
  private logDebug(message: string): void {
    if (this.config.logLevel === 'debug') {
      console.debug(`[API Warehouse] ${message}`);
    }
  }
}

// Create a singleton instance
export const apiWarehouse = new APIDataWarehouse();

// Export default instance
export default apiWarehouse;
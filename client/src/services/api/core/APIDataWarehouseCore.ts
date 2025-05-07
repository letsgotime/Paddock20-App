/**
 * PADDOCK20 API Data Warehouse Core System
 * 
 * The central nervous system of the API Airport - routing all API traffic with
 * precision, reliability, and blazing speed. This is the foundation that all 
 * API integrations are built upon.
 * 
 * Key features:
 * - High-performance request routing
 * - Multi-level intelligent caching system
 * - Comprehensive error handling and recovery
 * - Real-time monitoring and diagnostics
 * - Dynamic provider fallback mechanisms
 * - Request deduplication and batching
 * - Extensive metric collection and analysis
 */

import { 
  APIProvider, 
  APIResponse, 
  APIRequest, 
  APICategory, 
  CacheLevel, 
  LogLevel, 
  MetricsData, 
  HealthStatus, 
  HealthStatusType
} from '../types/core';

// Runtime configuration interface for the data warehouse
interface WarehouseConfig {
  cacheTTL: {
    [CacheLevel.PRIMARY]: number;   // Primary (hot) cache TTL in ms
    [CacheLevel.SECONDARY]: number; // Secondary cache TTL in ms
    [CacheLevel.OFFLINE]: number;   // Offline fallback cache TTL in ms
  };
  defaultTimeout: number;          // Default timeout for API calls in ms
  logLevel: LogLevel;              // Logging verbosity
  metricsEnabled: boolean;         // Whether to collect detailed metrics
  retryConfig: {
    maxRetries: number;            // Maximum number of retry attempts
    baseDelay: number;             // Base delay before first retry in ms
    maxDelay: number;              // Maximum delay between retries in ms
  };
  deduplicate: boolean;            // Whether to deduplicate identical in-flight requests
  requestBatching: boolean;        // Whether to batch similar requests
  monitoringEnabled: boolean;      // Whether to enable real-time monitoring
}

// Default configuration
const DEFAULT_CONFIG: WarehouseConfig = {
  cacheTTL: {
    [CacheLevel.PRIMARY]: 30 * 60 * 1000,      // 30 minutes
    [CacheLevel.SECONDARY]: 24 * 60 * 60 * 1000, // 24 hours
    [CacheLevel.OFFLINE]: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  defaultTimeout: 10000, // 10 seconds
  logLevel: LogLevel.WARN,
  metricsEnabled: true,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
  },
  deduplicate: true,
  requestBatching: true,
  monitoringEnabled: true,
};

/**
 * The API Data Warehouse Core System
 * Managing all aspects of API communication, caching, and error handling
 */
export class APIDataWarehouseCore {
  private providers: Map<APICategory, APIProvider[]> = new Map();
  private cache: {
    [CacheLevel.PRIMARY]: Map<string, { data: any, timestamp: number, ttl: number }>;
    [CacheLevel.SECONDARY]: Map<string, { data: any, timestamp: number, ttl: number }>;
    [CacheLevel.OFFLINE]: Map<string, { data: any, timestamp: number, ttl: number }>;
  };
  private inFlightRequests: Map<string, Promise<any>> = new Map();
  private config: WarehouseConfig;
  private metrics: MetricsData = {
    totalRequests: 0,
    cachedResponses: {
      [CacheLevel.PRIMARY]: 0,
      [CacheLevel.SECONDARY]: 0,
      [CacheLevel.OFFLINE]: 0,
    },
    cacheMisses: 0,
    errors: {
      total: 0,
      byCategory: {},
      byProvider: {},
    },
    latency: {
      total: 0,
      count: 0,
      min: Number.MAX_SAFE_INTEGER,
      max: 0,
      byCategory: {},
    },
    fallbacks: {
      successful: 0,
      failed: 0,
    },
    retries: {
      total: 0,
      successful: 0,
    },
    lastUpdated: Date.now(),
  };

  // Webhook subscribers for real-time monitoring
  private monitors: Array<(event: string, data: any) => void> = [];

  constructor(config: Partial<WarehouseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize cache system
    this.cache = {
      [CacheLevel.PRIMARY]: new Map(),
      [CacheLevel.SECONDARY]: new Map(),
      [CacheLevel.OFFLINE]: new Map(),
    };
    
    // Setup persistence for offline cache
    this.initializeOfflineCache();
    
    this.log(LogLevel.INFO, 'API Data Warehouse Core initialized', { config: this.config });
    
    // Set up periodic maintenance
    setInterval(() => this.performMaintenance(), 15 * 60 * 1000); // Every 15 minutes
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
    
    this.log(LogLevel.INFO, 'Provider registered', { 
      category, 
      provider: provider.name, 
      priority 
    });
    
    // Initialize provider-specific metrics
    if (!this.metrics.errors.byProvider[provider.name]) {
      this.metrics.errors.byProvider[provider.name] = 0;
    }
  }

  /**
   * Execute an API request with intelligent routing, caching and fallback
   * @param category - API category (weather, geocoding, etc)
   * @param request - API request parameters
   * @returns Promise with API response
   */
  async request<T>(category: APICategory, request: APIRequest): Promise<APIResponse<T>> {
    this.metrics.totalRequests++;
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Create a combined cache key
    const cacheKey = this.getCacheKey(category, request);
    
    // Check if this exact request is already in flight (deduplication)
    if (this.config.deduplicate && this.inFlightRequests.has(cacheKey)) {
      this.log(LogLevel.DEBUG, 'Deduplicated request', { category, cacheKey });
      return this.inFlightRequests.get(cacheKey) as Promise<APIResponse<T>>;
    }
    
    // Create a promise for this request
    const requestPromise = this.executeRequest<T>(category, request, cacheKey, requestId, startTime);
    
    // Register as in-flight if deduplication is enabled
    if (this.config.deduplicate) {
      this.inFlightRequests.set(cacheKey, requestPromise);
      
      // Clean up after the request completes
      requestPromise.finally(() => {
        this.inFlightRequests.delete(cacheKey);
      });
    }
    
    return requestPromise;
  }

  /**
   * Execute the actual request with caching, fallbacks and retries
   */
  private async executeRequest<T>(
    category: APICategory, 
    request: APIRequest, 
    cacheKey: string,
    requestId: string,
    startTime: number
  ): Promise<APIResponse<T>> {
    // Skip cache if requested
    if (!request.cacheControl?.noCache) {
      // Check each cache level
      for (const level of [CacheLevel.PRIMARY, CacheLevel.SECONDARY, CacheLevel.OFFLINE]) {
        const cached = this.getFromCache<T>(cacheKey, level);
        if (cached) {
          this.metrics.cachedResponses[level]++;
          
          // Log cache hit
          this.log(LogLevel.DEBUG, `Cache hit (${level})`, { 
            category, 
            cacheKey,
            age: Date.now() - cached.timestamp 
          });
          
          // If using secondary or offline cache, trigger a background refresh
          if (level !== CacheLevel.PRIMARY && !request.noBackgroundRefresh) {
            this.refreshInBackground(category, request, cacheKey);
          }
          
          // Calculate latency metrics for cache hits
          const latency = Date.now() - startTime;
          this.updateLatencyMetrics(category, latency);
          
          // Return cached data
          return {
            ...cached,
            fromCache: true,
            cacheLevel: level,
            requestId,
          };
        }
      }
    }

    // No cache hit, make a fresh request
    this.metrics.cacheMisses++;
    
    // Monitor this request
    this.emitMonitoringEvent('requestStart', {
      requestId,
      category,
      timestamp: startTime,
    });
    
    try {
      // Get providers for the requested category
      const providers = this.providers.get(category) || [];
      if (providers.length === 0) {
        throw new Error(`No providers registered for API category "${category}"`);
      }

      // Try each provider in order of priority with retry logic
      const errors: Error[] = [];
      const providersAttempted: string[] = [];
      let response: APIResponse<T> | null = null;
      
      for (const provider of providers) {
        providersAttempted.push(provider.name);
        
        try {
          // Attempt with retries
          response = await this.executeWithRetry<T>(provider, request, category, requestId);
          
          // If we got here, the request succeeded
          break;
        } catch (error) {
          this.log(LogLevel.WARN, `Provider "${provider.name}" failed`, { 
            error: error.message, 
            category,
            requestId,
          });
          
          // Update provider-specific error metrics
          this.metrics.errors.byProvider[provider.name] = 
            (this.metrics.errors.byProvider[provider.name] || 0) + 1;
          
          // Store the error and try the next provider
          errors.push(error);
          continue;
        }
      }

      // If no provider succeeded
      if (!response) {
        this.metrics.fallbacks.failed++;
        this.metrics.errors.total++;
        
        // Update category-specific error metrics
        this.metrics.errors.byCategory[category] = 
          (this.metrics.errors.byCategory[category] || 0) + 1;
        
        this.emitMonitoringEvent('requestFailed', {
          requestId,
          category,
          errors: errors.map(e => e.message),
          providersAttempted,
          duration: Date.now() - startTime,
        });
        
        throw new Error(
          `All providers failed for ${category} request: ${errors.map(e => e.message).join(', ')}`
        );
      }
      
      // Calculate latency metrics
      const latency = Date.now() - startTime;
      this.updateLatencyMetrics(category, latency);
      
      // Update fallback metrics if we used a fallback
      if (providersAttempted.length > 1) {
        this.metrics.fallbacks.successful++;
      }
      
      // Cache successful response at appropriate levels if caching is allowed
      if (!request.cacheControl?.noStore) {
        const ttl = request.cacheTTL || this.config.cacheTTL;
        this.addToCache(cacheKey, response, CacheLevel.PRIMARY, ttl[CacheLevel.PRIMARY]);
        this.addToCache(cacheKey, response, CacheLevel.SECONDARY, ttl[CacheLevel.SECONDARY]);
        this.addToCache(cacheKey, response, CacheLevel.OFFLINE, ttl[CacheLevel.OFFLINE]);
      }
      
      // Add request metadata
      const enhancedResponse: APIResponse<T> = {
        ...response,
        fromCache: false,
        timestamp: Date.now(),
        providersAttempted,
        latency,
        requestId,
      };
      
      // Monitor successful completion
      this.emitMonitoringEvent('requestComplete', {
        requestId,
        category,
        providersAttempted,
        duration: latency,
        fromCache: false,
      });
      
      return enhancedResponse;
    } catch (error) {
      // Monitor failure
      this.emitMonitoringEvent('requestFailed', {
        requestId,
        category,
        error: error.message,
        duration: Date.now() - startTime,
      });
      
      throw error;
    }
  }

  /**
   * Execute a request to a provider with retry logic
   */
  private async executeWithRetry<T>(
    provider: APIProvider, 
    request: APIRequest,
    category: APICategory,
    requestId: string
  ): Promise<APIResponse<T>> {
    const { maxRetries, baseDelay, maxDelay } = this.config.retryConfig;
    let attempt = 0;
    
    while (true) {
      attempt++;
      
      try {
        // Log the attempt
        if (attempt > 1) {
          this.log(LogLevel.INFO, `Retry attempt ${attempt}/${maxRetries + 1}`, {
            provider: provider.name,
            category,
            requestId,
          });
          
          this.metrics.retries.total++;
        }
        
        // Execute the request with timeout protection
        const response = await Promise.race([
          provider.execute<T>(request),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout calling ${provider.name}`)), 
                      request.timeout || provider.timeout || this.config.defaultTimeout);
          })
        ]);
        
        // If we got here, the request succeeded
        if (attempt > 1) {
          this.metrics.retries.successful++;
        }
        
        return response;
      } catch (error) {
        // Don't retry if we've hit the limit or the error is not retryable
        const isRetryable = !(
          error.message.includes('authentication') || 
          error.message.includes('authorization') ||
          error.message.includes('not found') ||
          error.message.includes('invalid') ||
          error.status === 400 ||
          error.status === 401 ||
          error.status === 403 ||
          error.status === 404
        );
        
        if (attempt > maxRetries || !isRetryable) {
          throw error;
        }
        
        // Calculate backoff delay with jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
          maxDelay
        );
        
        // Log the backoff
        this.log(LogLevel.DEBUG, `Backing off for ${Math.round(delay)}ms`, {
          provider: provider.name,
          category,
          attempt,
          requestId,
        });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Refresh cache data in the background
   */
  private refreshInBackground(category: APICategory, request: APIRequest, cacheKey: string): void {
    // Don't block, just fire and forget
    setTimeout(async () => {
      try {
        this.log(LogLevel.DEBUG, 'Background refresh started', { category, cacheKey });
        
        // Execute as a normal request but with a flag to prevent further background refreshes
        await this.request(category, {
          ...request,
          noBackgroundRefresh: true,
        });
        
        this.log(LogLevel.DEBUG, 'Background refresh completed', { category, cacheKey });
      } catch (error) {
        this.log(LogLevel.WARN, 'Background refresh failed', { 
          category, 
          cacheKey,
          error: error.message,
        });
      }
    }, 0);
  }

  /**
   * Get API keys for a specific service
   * @param service - Service name
   * @returns API key or null if not found
   */
  getAPIKey(service: string): string | null {
    // First check environment variables with VITE_ prefix (for client-side)
    const envKey = `VITE_${service.toUpperCase()}_API_KEY`;
    // @ts-ignore: Environment variable access
    const key = (import.meta.env as any)[envKey];
    
    if (key) {
      this.log(LogLevel.DEBUG, `Using API key from environment for "${service}"`);
      return key;
    }
    
    // Then check for service-specific local storage keys
    try {
      const localStorageKey = `${service.toLowerCase()}_api_key`;
      const storedKey = localStorage.getItem(localStorageKey);
      
      if (storedKey) {
        this.log(LogLevel.DEBUG, `Using API key from localStorage for "${service}"`);
        return storedKey;
      }
    } catch (error) {
      // Ignore localStorage errors (could be disabled)
    }
    
    this.log(LogLevel.WARN, `No API key found for service "${service}"`);
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
      this.log(LogLevel.INFO, `API key set for service "${service}"`);
    } catch (error) {
      this.log(LogLevel.ERROR, `Failed to save API key for service "${service}"`, { 
        error: error.message 
      });
    }
  }

  /**
   * Get cached data by key and level
   * @param key - Cache key
   * @param level - Cache level
   * @returns Cached data or null if not found or expired
   */
  private getFromCache<T>(key: string, level: CacheLevel): APIResponse<T> | null {
    const cached = this.cache[level].get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache entry has expired
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.log(LogLevel.DEBUG, `Cache expired for key "${key}" at level ${level}`);
      this.cache[level].delete(key);
      return null;
    }
    
    return cached.data as APIResponse<T>;
  }

  /**
   * Add data to cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param level - Cache level
   * @param ttl - Time to live in milliseconds
   */
  private addToCache(key: string, data: any, level: CacheLevel, ttl: number): void {
    this.cache[level].set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    
    this.log(LogLevel.DEBUG, `Added to cache at level ${level}`, { 
      key, 
      ttl: `${Math.round(ttl / 1000 / 60)} minutes`
    });
    
    // Persist offline cache
    if (level === CacheLevel.OFFLINE) {
      this.persistOfflineCache();
    }
  }

  /**
   * Generate a cache key from category and request
   */
  private getCacheKey(category: APICategory, request: APIRequest): string {
    // Create a string representation of the request params for caching
    const paramsString = JSON.stringify(request.params || {});
    return `${category}:${request.endpoint || 'default'}:${paramsString}`;
  }

  /**
   * Initialize the offline cache from localStorage
   */
  private initializeOfflineCache(): void {
    try {
      const storedCache = localStorage.getItem('api_warehouse_offline_cache');
      if (storedCache) {
        const parsed = JSON.parse(storedCache);
        
        // Validate and convert to Map
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, value]) => {
            this.cache[CacheLevel.OFFLINE].set(key, value as any);
          });
          
          this.log(LogLevel.INFO, 'Offline cache restored', { 
            entries: this.cache[CacheLevel.OFFLINE].size 
          });
        }
      }
    } catch (error) {
      this.log(LogLevel.WARN, 'Failed to restore offline cache', { error: error.message });
    }
  }

  /**
   * Persist the offline cache to localStorage
   */
  private persistOfflineCache(): void {
    try {
      // Convert Map to object for storage
      const cacheObj = Object.fromEntries(this.cache[CacheLevel.OFFLINE].entries());
      
      // Store with throttling to prevent excessive writes
      this.throttle('persistOfflineCache', () => {
        localStorage.setItem('api_warehouse_offline_cache', JSON.stringify(cacheObj));
        this.log(LogLevel.DEBUG, 'Offline cache persisted', { 
          entries: this.cache[CacheLevel.OFFLINE].size 
        });
      }, 10000); // Throttle to at most once every 10 seconds
    } catch (error) {
      this.log(LogLevel.WARN, 'Failed to persist offline cache', { error: error.message });
    }
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(category: APICategory, latency: number): void {
    // Update global metrics
    this.metrics.latency.total += latency;
    this.metrics.latency.count++;
    this.metrics.latency.min = Math.min(this.metrics.latency.min, latency);
    this.metrics.latency.max = Math.max(this.metrics.latency.max, latency);
    
    // Update category-specific metrics
    if (!this.metrics.latency.byCategory[category]) {
      this.metrics.latency.byCategory[category] = {
        total: 0,
        count: 0,
        min: Number.MAX_SAFE_INTEGER,
        max: 0,
      };
    }
    
    const categoryMetrics = this.metrics.latency.byCategory[category];
    categoryMetrics.total += latency;
    categoryMetrics.count++;
    categoryMetrics.min = Math.min(categoryMetrics.min, latency);
    categoryMetrics.max = Math.max(categoryMetrics.max, latency);
    
    // Update last updated timestamp
    this.metrics.lastUpdated = Date.now();
  }

  /**
   * Throttle a function call
   */
  private throttleTimers: Record<string, number> = {};
  private throttle(key: string, fn: () => void, delay: number): void {
    // Clear existing timer
    if (this.throttleTimers[key]) {
      clearTimeout(this.throttleTimers[key]);
    }
    
    // Set new timer
    this.throttleTimers[key] = window.setTimeout(() => {
      fn();
      delete this.throttleTimers[key];
    }, delay);
  }

  /**
   * Perform routine maintenance on the cache and metrics
   */
  private performMaintenance(): void {
    this.log(LogLevel.DEBUG, 'Performing routine maintenance');
    
    // Snapshot metrics
    this.saveMetricsSnapshot();
    
    // Clean up expired cache entries
    this.cleanupExpiredCache();
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    // Check each cache level
    for (const level of [CacheLevel.PRIMARY, CacheLevel.SECONDARY, CacheLevel.OFFLINE]) {
      for (const [key, entry] of this.cache[level].entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache[level].delete(key);
          expiredCount++;
        }
      }
    }
    
    if (expiredCount > 0) {
      this.log(LogLevel.DEBUG, `Cleaned up ${expiredCount} expired cache entries`);
    }
    
    // Persist updated offline cache if there were changes
    if (expiredCount > 0) {
      this.persistOfflineCache();
    }
  }

  /**
   * Save a snapshot of current metrics
   */
  private saveMetricsSnapshot(): void {
    try {
      // Store metrics history with a timestamp
      const timestamp = Date.now();
      
      // Calculate aggregate metrics
      const avgLatency = this.metrics.latency.count > 0 
        ? Math.round(this.metrics.latency.total / this.metrics.latency.count)
        : 0;
      
      const cacheHitRate = this.metrics.totalRequests > 0
        ? (this.metrics.cachedResponses[CacheLevel.PRIMARY] + 
           this.metrics.cachedResponses[CacheLevel.SECONDARY] + 
           this.metrics.cachedResponses[CacheLevel.OFFLINE]) / this.metrics.totalRequests
        : 0;
      
      // Create a snapshot
      const snapshot = {
        timestamp,
        requestCount: this.metrics.totalRequests,
        cacheHitRate,
        avgLatency,
        errorRate: this.metrics.totalRequests > 0 
          ? this.metrics.errors.total / this.metrics.totalRequests
          : 0,
        metrics: { ...this.metrics },
      };
      
      // Store in localStorage with rotation (keep last 24 hours)
      let history = [];
      try {
        const storedHistory = localStorage.getItem('api_warehouse_metrics_history');
        if (storedHistory) {
          history = JSON.parse(storedHistory);
        }
      } catch (error) {
        // Start with empty history if there's an error
        history = [];
      }
      
      // Add new snapshot
      history.push(snapshot);
      
      // Only keep recent history (last 24 snapshots = 6 hours at 15-minute intervals)
      if (history.length > 24) {
        history = history.slice(-24);
      }
      
      // Store updated history
      localStorage.setItem('api_warehouse_metrics_history', JSON.stringify(history));
      
      this.log(LogLevel.DEBUG, 'Metrics snapshot saved', { 
        snapshotCount: history.length,
        avgLatency,
        cacheHitRate: `${Math.round(cacheHitRate * 100)}%`,
      });
    } catch (error) {
      this.log(LogLevel.WARN, 'Failed to save metrics snapshot', { error: error.message });
    }
  }

  /**
   * Register a monitoring callback
   */
  registerMonitor(callback: (event: string, data: any) => void): () => void {
    if (!this.config.monitoringEnabled) {
      this.log(LogLevel.WARN, 'Monitoring is disabled, callback will not receive events');
    }
    
    this.monitors.push(callback);
    
    // Return a function to unregister
    return () => {
      this.monitors = this.monitors.filter(cb => cb !== callback);
    };
  }

  /**
   * Emit a monitoring event
   */
  private emitMonitoringEvent(event: string, data: any): void {
    if (!this.config.monitoringEnabled || this.monitors.length === 0) {
      return;
    }
    
    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }
    
    // Notify all monitors
    for (const monitor of this.monitors) {
      try {
        monitor(event, data);
      } catch (error) {
        this.log(LogLevel.WARN, 'Monitor callback error', { error: error.message });
      }
    }
  }

  /**
   * Get health status for all registered providers
   */
  async getHealthStatus(): Promise<Record<APICategory, HealthStatus>> {
    const result: Partial<Record<APICategory, HealthStatus>> = {};
    
    for (const category of Array.from(this.providers.keys())) {
      result[category] = await this.getCategoryHealthStatus(category);
    }
    
    return result as Record<APICategory, HealthStatus>;
  }

  /**
   * Get health status for a specific category
   */
  async getCategoryHealthStatus(category: APICategory): Promise<HealthStatus> {
    const providers = this.providers.get(category) || [];
    
    if (providers.length === 0) {
      return {
        status: 'unavailable',
        providers: [],
        message: 'No providers registered',
      };
    }
    
    // Check all providers
    const providerStatuses = await Promise.all(
      providers.map(async provider => {
        try {
          const status = await provider.getHealthStatus?.() || 'unknown';
          
          return {
            name: provider.name,
            status,
            priority: provider.priority,
          };
        } catch (error) {
          return {
            name: provider.name,
            status: 'unavailable' as const,
            priority: provider.priority,
            error: error.message,
          };
        }
      })
    );
    
    // Determine overall status
    // If primary provider is healthy, we're good
    const primaryProvider = providerStatuses[0];
    if (primaryProvider?.status === 'healthy') {
      return {
        status: 'healthy',
        providers: providerStatuses,
        primaryProvider: primaryProvider.name,
      };
    }
    
    // If primary is degraded but we have a healthy fallback, we're still operational
    if (primaryProvider?.status === 'degraded') {
      const hasHealthyFallback = providerStatuses.slice(1).some(p => p.status === 'healthy');
      
      return {
        status: hasHealthyFallback ? 'healthy' : 'degraded',
        providers: providerStatuses,
        primaryProvider: primaryProvider.name,
        message: hasHealthyFallback 
          ? 'Primary provider degraded but fallback available' 
          : 'Primary provider degraded',
      };
    }
    
    // If primary is unavailable but we have any operational fallback, we're degraded
    const operationalFallback = providerStatuses.slice(1).find(p => 
      p.status === 'healthy' || p.status === 'degraded'
    );
    
    if (operationalFallback) {
      return {
        status: 'degraded',
        providers: providerStatuses,
        primaryProvider: operationalFallback.name,
        message: 'Using fallback provider',
      };
    }
    
    // If all providers are unavailable, we're unavailable
    return {
      status: 'unavailable',
      providers: providerStatuses,
      message: 'All providers unavailable',
    };
  }

  /**
   * Get API request metrics
   */
  getMetrics(): MetricsData & { 
    avgLatency: number;
    cacheHitRate: number;
    errorRate: number;
  } {
    // Calculate derived metrics
    const avgLatency = this.metrics.latency.count > 0 
      ? Math.round(this.metrics.latency.total / this.metrics.latency.count)
      : 0;
    
    const totalCacheHits = 
      this.metrics.cachedResponses[CacheLevel.PRIMARY] + 
      this.metrics.cachedResponses[CacheLevel.SECONDARY] + 
      this.metrics.cachedResponses[CacheLevel.OFFLINE];
    
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? totalCacheHits / this.metrics.totalRequests
      : 0;
    
    const errorRate = this.metrics.totalRequests > 0 
      ? this.metrics.errors.total / this.metrics.totalRequests
      : 0;
    
    return {
      ...this.metrics,
      avgLatency,
      cacheHitRate,
      errorRate,
    };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): Array<{
    timestamp: number;
    requestCount: number;
    cacheHitRate: number;
    avgLatency: number;
    errorRate: number;
  }> {
    try {
      const storedHistory = localStorage.getItem('api_warehouse_metrics_history');
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (error) {
      this.log(LogLevel.WARN, 'Failed to retrieve metrics history', { error: error.message });
    }
    
    return [];
  }

  /**
   * Reset metrics counters
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      cachedResponses: {
        [CacheLevel.PRIMARY]: 0,
        [CacheLevel.SECONDARY]: 0,
        [CacheLevel.OFFLINE]: 0,
      },
      cacheMisses: 0,
      errors: {
        total: 0,
        byCategory: {},
        byProvider: {},
      },
      latency: {
        total: 0,
        count: 0,
        min: Number.MAX_SAFE_INTEGER,
        max: 0,
        byCategory: {},
      },
      fallbacks: {
        successful: 0,
        failed: 0,
      },
      retries: {
        total: 0,
        successful: 0,
      },
      lastUpdated: Date.now(),
    };
    
    this.log(LogLevel.INFO, 'Metrics reset');
  }

  /**
   * Clear the cache
   * @param level - Cache level to clear (or all if not specified)
   * @param category - Optional category to clear (or all if not specified)
   */
  clearCache(level?: CacheLevel, category?: APICategory): void {
    if (level && category) {
      // Clear specific category at specific level
      const prefix = `${category}:`;
      let count = 0;
      
      for (const key of this.cache[level].keys()) {
        if (key.startsWith(prefix)) {
          this.cache[level].delete(key);
          count++;
        }
      }
      
      this.log(LogLevel.INFO, `Cleared ${count} cache entries`, { level, category });
    } else if (level) {
      // Clear entire level
      const count = this.cache[level].size;
      this.cache[level].clear();
      
      this.log(LogLevel.INFO, `Cleared ${count} cache entries at level ${level}`);
    } else if (category) {
      // Clear category at all levels
      const prefix = `${category}:`;
      let totalCount = 0;
      
      for (const level of [CacheLevel.PRIMARY, CacheLevel.SECONDARY, CacheLevel.OFFLINE]) {
        let levelCount = 0;
        
        for (const key of this.cache[level].keys()) {
          if (key.startsWith(prefix)) {
            this.cache[level].delete(key);
            levelCount++;
          }
        }
        
        totalCount += levelCount;
      }
      
      this.log(LogLevel.INFO, `Cleared ${totalCount} cache entries for category ${category}`);
    } else {
      // Clear all cache
      let totalCount = 0;
      
      for (const level of [CacheLevel.PRIMARY, CacheLevel.SECONDARY, CacheLevel.OFFLINE]) {
        totalCount += this.cache[level].size;
        this.cache[level].clear();
      }
      
      this.log(LogLevel.INFO, `Cleared entire cache (${totalCount} entries)`);
    }
    
    // Persist updated offline cache
    this.persistOfflineCache();
  }

  /**
   * Logging with severity levels
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level > this.config.logLevel) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const prefix = `[API Warehouse ${LogLevel[level]}]`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(prefix, message, data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data);
        break;
      case LogLevel.DEBUG:
        console.debug(prefix, message, data);
        break;
    }
    
    // Emit monitoring event for errors and warnings
    if (level <= LogLevel.WARN) {
      this.emitMonitoringEvent('log', {
        level: LogLevel[level],
        message,
        data,
        timestamp,
      });
    }
  }
}

// Create and export the singleton instance
export const apiWarehouse = new APIDataWarehouseCore();

// Export default for convenience
export default apiWarehouse;
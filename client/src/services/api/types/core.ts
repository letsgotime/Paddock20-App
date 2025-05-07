/**
 * API Data Warehouse Core Types
 * 
 * This file defines the foundational types used by the API Data Warehouse system.
 * Provides a standardized interface for all API interactions.
 */

/**
 * API categories supported by the data warehouse
 */
export enum APICategory {
  // Weather and location services
  WEATHER = 'weather',
  WEATHER_FORECAST = 'weather_forecast',
  WEATHER_ALERTS = 'weather_alerts',
  WEATHER_HISTORICAL = 'weather_historical',
  GEOCODING = 'geocoding',
  REVERSE_GEOCODING = 'reverse_geocoding',
  TIME = 'time',
  TIMEZONE = 'timezone',
  
  // Automotive services
  AUTOMOTIVE = 'automotive',
  OBD = 'obd',
  MAINTENANCE = 'maintenance',
  TIRE = 'tire',
  FUEL = 'fuel',
  VEHICLE_VALUE = 'vehicle_value',
  VEHICLE_SPECS = 'vehicle_specs',
  
  // Aviation related services
  AVIATION = 'aviation',
  AVIATION_WEATHER = 'aviation_weather',
  
  // Media services
  MUSIC = 'music',
  IMAGE = 'image',
  VIDEO = 'video',
  
  // Authentication and user management
  AUTH = 'auth',
  USER_PROFILE = 'user_profile',
  
  // Storage services
  STORAGE = 'storage',
  
  // Communication services
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  
  // Finance services
  PAYMENT = 'payment',
  SUBSCRIPTION = 'subscription',
  
  // Other services
  ANALYTICS = 'analytics',
  AI = 'ai',
  OTHER = 'other',
}

/**
 * Cache levels supported by the data warehouse
 */
export enum CacheLevel {
  PRIMARY = 'primary',       // Hot cache (short TTL)
  SECONDARY = 'secondary',   // Warm cache (medium TTL)
  OFFLINE = 'offline',       // Cold cache (long TTL, persisted)
}

/**
 * Log levels supported by the data warehouse
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Health status of an API provider
 */
export type HealthStatusType = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

/**
 * Health status object
 */
export interface HealthStatus {
  status: HealthStatusType;
  providers: Array<{
    name: string;
    status: HealthStatusType;
    priority: number;
    error?: string;
  }>;
  primaryProvider?: string;
  message?: string;
}

/**
 * API request metrics
 */
export interface MetricsData {
  totalRequests: number;
  cachedResponses: {
    [CacheLevel.PRIMARY]: number;
    [CacheLevel.SECONDARY]: number;
    [CacheLevel.OFFLINE]: number;
  };
  cacheMisses: number;
  errors: {
    total: number;
    byCategory: Record<string, number>;
    byProvider: Record<string, number>;
  };
  latency: {
    total: number;
    count: number;
    min: number;
    max: number;
    byCategory: Record<string, {
      total: number;
      count: number;
      min: number;
      max: number;
    }>;
  };
  fallbacks: {
    successful: number;
    failed: number;
  };
  retries: {
    total: number;
    successful: number;
  };
  lastUpdated: number;
}

/**
 * Standardized API request
 */
export interface APIRequest {
  // Core request properties
  endpoint?: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  
  // Optional configuration
  timeout?: number;       // Request timeout in ms
  cacheTTL?: {            // Custom cache TTL for this request
    [CacheLevel.PRIMARY]?: number;
    [CacheLevel.SECONDARY]?: number;
    [CacheLevel.OFFLINE]?: number;
  };
  cacheControl?: {        // Cache control options
    noCache?: boolean;    // Skip cache lookup
    noStore?: boolean;    // Don't store response in cache
  };
  priority?: 'high' | 'normal' | 'low';
  noBackgroundRefresh?: boolean; // Prevent background refresh
  retryConfig?: {
    maxRetries?: number;  // Maximum retries
    baseDelay?: number;   // Base delay for retry
    maxDelay?: number;    // Maximum delay for retry
  };
}

/**
 * Standardized API response
 */
export interface APIResponse<T = any> {
  // Core response data
  data: T;
  
  // Metadata
  fromCache?: boolean;
  cacheLevel?: CacheLevel;
  timestamp?: number;
  providersAttempted?: string[];
  latency?: number;
  requestId?: string;
  
  // Error info (if present but request succeeded via fallback)
  warnings?: string[];
}

/**
 * API Provider interface
 * This abstraction allows for easily swapping or cascading between different API providers
 */
export interface APIProvider {
  // Provider metadata
  name: string;
  category: APICategory;
  priority: number;
  defaultCacheTTL?: number;
  
  // Configuration
  timeout?: number;
  rateLimitPerMinute?: number;
  
  // Core provider methods
  execute<T>(request: APIRequest): Promise<APIResponse<T>>;
  isAvailable?(): Promise<boolean>;
  
  // Status and health
  getQuotaRemaining?(): Promise<number>;
  getHealthStatus?(): Promise<HealthStatusType>;
}
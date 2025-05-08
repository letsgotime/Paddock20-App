/**
 * API Data Warehouse Core Types
 * 
 * This file defines the core types and interfaces used throughout the API Data Warehouse.
 */

/**
 * API Categories
 * 
 * Defines the different categories of API services available in the system.
 */
export enum APICategory {
  WEATHER = 'weather',
  GEOCODING = 'geocoding',
  TIME = 'time',
  AUTOMOTIVE = 'automotive',
  MUSIC = 'music',
  AUTH = 'auth',
  STORAGE = 'storage',
  MEDIA = 'media',
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Cache levels
 */
export enum CacheLevel {
  PRIMARY = 'primary',    // Fast-access, short-lived cache (memory)
  SECONDARY = 'secondary', // Medium-term cache (indexed DB)
  OFFLINE = 'offline',    // Long-term, persistent cache (for offline use)
}

/**
 * Error reasons
 */
export type ErrorReason = 
  | 'NETWORK_ERROR'      // Network connection issues
  | 'PROVIDER_ERROR'     // Provider-specific errors
  | 'AUTHENTICATION_ERROR' // Auth errors (API keys, tokens, etc.)
  | 'RATE_LIMIT_ERROR'   // Rate limiting or quotas
  | 'TIMEOUT_ERROR'      // Request timeout
  | 'VALIDATION_ERROR'   // Input validation issues
  | 'RESOURCE_NOT_FOUND' // Requested resource doesn't exist
  | 'PERMISSION_ERROR'   // Permission or access issues
  | 'SERVER_ERROR'       // Server-side errors
  | 'UNKNOWN_ERROR'      // Unspecified or unknown errors
  | 'NO_PROVIDER';       // No provider available for request

/**
 * API Error
 */
export interface APIError {
  code: string;
  message: string;
  reason: ErrorReason;
  details?: any;
}

/**
 * Health status types
 */
export type HealthStatusType = 'healthy' | 'degraded' | 'unavailable';

/**
 * Health status
 */
export interface HealthStatus {
  status: HealthStatusType;
  timestamp: number;
  details?: any;
  providers?: Record<string, HealthStatusType>;
}

/**
 * API Request
 * 
 * Standard format for all API requests within the system.
 */
export interface APIRequest {
  category: APICategory;
  endpoint: string;
  params?: Record<string, any>;
  cacheTTL?: number;
  cacheControl?: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    noCache?: boolean;
    noStore?: boolean;
  };
  noBackgroundRefresh?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * API Response
 * 
 * Standard format for all API responses within the system.
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  fromCache: boolean;
  stale?: boolean;
  cacheLevel?: CacheLevel;
  provider: string | null;
  timestamp?: number;
  providersAttempted?: string[];
}

/**
 * API Provider
 * 
 * Interface that all API providers must implement.
 */
export interface APIProvider {
  name: string;
  category: APICategory;
  priority: number;
  timeout?: number;
  execute<T>(request: APIRequest): Promise<APIResponse<T>>;
  getHealthStatus(): Promise<HealthStatusType>;
}

/**
 * Provider Registry
 * 
 * Map of API categories to their available providers.
 */
export type ProviderRegistry = Record<APICategory, APIProvider[]>;

/**
 * Metrics Data for API performance monitoring
 */
export interface MetricsData {
  requestCount: number;
  errorCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  responseTimeP95: number;
  lastErrors: Array<{
    timestamp: number;
    error: APIError;
    request: APIRequest;
  }>;
}
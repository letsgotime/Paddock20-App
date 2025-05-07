/**
 * API Data Warehouse Type Definitions
 * 
 * This file contains all the type definitions used by the API Data Warehouse.
 */

/**
 * API Categories
 * Each category represents a group of related API services.
 */
export enum APICategory {
  WEATHER = 'weather',
  GEOCODING = 'geocoding',
  AUTOMOTIVE = 'automotive',
  TIME = 'time',
  MUSIC = 'music',
  AUTH = 'auth',
  STORAGE = 'storage',
  MEDIA = 'media',
  // Add more categories as needed
}

/**
 * Available cache levels
 */
export enum CacheLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  OFFLINE = 'offline',
}

/**
 * API Error Reason
 * Standardized error categories for easier handling
 */
export type APIErrorReason = 
  | 'NETWORK_ERROR'  // Connection issues
  | 'RATE_LIMIT'     // Rate limiting from the provider
  | 'AUTH_ERROR'     // Authentication/authorization failure
  | 'API_ERROR'      // Remote API returned an error
  | 'TIMEOUT'        // Request timed out
  | 'VALIDATION_ERROR' // Request validation failed
  | 'NO_PROVIDER'    // No provider available for the category
  | 'PROVIDER_ERROR' // Provider-specific error
  | 'CACHE_ERROR'    // Cache-related error
  | 'UNKNOWN_ERROR'; // Unclassified/unexpected error

/**
 * API Error
 * Standardized error format
 */
export interface APIError {
  code: string;          // Error code (provider-specific or standardized)
  message: string;       // Human-readable error message
  reason: APIErrorReason; // Categorized reason
  details?: any;         // Additional error details
}

/**
 * API Request
 * Standard format for all API requests
 */
export interface APIRequest {
  category: APICategory;  // API category
  endpoint?: string;      // Specific endpoint within the category
  params?: any;           // Request parameters
  headers?: Record<string, string>; // Optional headers
  timeout?: number;       // Optional timeout in milliseconds
  cacheTTL?: number;      // Time-to-live for cache in milliseconds (0 = no cache)
  allowStale?: boolean;   // Whether to allow stale cached data if fresh fails
}

/**
 * API Response
 * Standard format for all API responses
 */
export interface APIResponse<T> {
  success: boolean;      // Whether the request was successful
  data?: T;              // Response data (if successful)
  error?: APIError;      // Error information (if unsuccessful)
  fromCache: boolean;    // Whether this response came from cache
  provider: string | null; // Which provider fulfilled the request
  stale?: boolean;       // Whether the data is stale (older than preferred)
  timestamp?: number;    // When this response was generated
}

/**
 * Health Status Type
 * Indicates the health of a service or provider
 */
export type HealthStatusType = 'healthy' | 'degraded' | 'unavailable';

/**
 * Health Status
 * Information about the health of a service or provider
 */
export interface HealthStatus {
  status: HealthStatusType;    // Overall status
  details?: any;               // Additional health information
}

/**
 * API Provider Interface
 * Standard interface that all providers must implement
 */
export interface APIProvider {
  name: string;
  category: APICategory;
  priority: number;
  
  // Execute an API request
  execute<T>(request: APIRequest): Promise<APIResponse<T>>;
  
  // Check health status
  getHealthStatus(): Promise<HealthStatusType>;
  
  // Optional settings
  settings?: {
    rateLimitPerMinute?: number;
    timeout?: number;
    retries?: number;
  };
}

/**
 * Provider Registry
 * Used to manage multiple providers for each category
 */
export interface ProviderRegistry {
  [category: string]: APIProvider[];
}
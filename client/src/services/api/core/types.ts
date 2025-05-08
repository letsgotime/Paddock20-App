import { AxiosRequestConfig } from 'axios';

/**
 * Extended Axios request configuration
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  cacheKey?: string;
  cacheTTL?: number; // Time to live in milliseconds
  priority?: number; // 1-10, with 10 being highest priority
  retryCount?: number;
  retryDelay?: number;
  retryBackoff?: boolean;
  fallbackProviders?: string[];
}

/**
 * API response structure with additional metadata
 */
export interface ApiResponse<T = any> {
  data: T | null;
  provider?: string;
  source?: 'api' | 'cache' | 'offline';
  timestamp: number;
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * API cache entry
 */
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  provider: string;
  expiresAt: number;
  priority?: number;
}

/**
 * Cache storage tiers
 */
export type CacheStorageTier = 'primary' | 'secondary' | 'offline';

/**
 * Provider category types
 */
export type ProviderType = 
  | 'weather' 
  | 'geocoding' 
  | 'map' 
  | 'time' 
  | 'automotive' 
  | 'music' 
  | 'media'
  | 'storage'
  | 'auth';

/**
 * Provider registration interface
 */
export interface ProviderRegistration {
  name: string;
  type: ProviderType;
  provider: any;
  priority: number;
}
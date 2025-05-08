/**
 * API Data Warehouse Core
 * 
 * This module implements the core functionality of the API Data Warehouse.
 */

import { 
  APICategory, 
  APIProvider, 
  APIRequest, 
  APIResponse,
  HealthStatusType,
  ProviderRegistry 
} from './types/core';

class APIDataWarehouse {
  private providers: ProviderRegistry = {};
  private cache = {
    primary: new Map<string, { data: any; timestamp: number; ttl: number }>(),
    secondary: new Map<string, { data: any; timestamp: number; ttl: number }>(),
    offline: new Map<string, { data: any; timestamp: number; ttl: number }>(),
  };
  
  constructor() {
    console.log('Loaded', 
      this.cache.primary.size, 'primary,',
      this.cache.secondary.size, 'secondary, and',
      this.cache.offline.size, 'offline cache entries'
    );
  }
  
  /**
   * Register a provider for a specific API category
   */
  registerProvider(category: APICategory, provider: APIProvider, priority?: number): void {
    if (!this.providers[category]) {
      this.providers[category] = [];
    }
    
    // Set priority if provided
    if (priority !== undefined) {
      provider.priority = priority;
    }
    
    this.providers[category].push(provider);
    
    // Sort providers by priority (highest first)
    this.providers[category].sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get all providers for a category
   */
  getProviders(category: APICategory): APIProvider[] {
    return this.providers[category] || [];
  }
  
  /**
   * Execute an API request with the best available provider
   */
  async fetch<T>(request: APIRequest): Promise<APIResponse<T>> {
    const category = request.category;
    const providers = this.getProviders(category);
    
    if (!providers || providers.length === 0) {
      return {
        success: false,
        error: {
          code: 'no_provider',
          message: `No provider available for ${category}`,
          reason: 'NO_PROVIDER',
        },
        fromCache: false,
        provider: null,
      };
    }
    
    // Try providers in priority order
    for (const provider of providers) {
      try {
        const response = await provider.execute<T>(request);
        return response;
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
      }
    }
    
    // If all providers failed
    return {
      success: false,
      error: {
        code: 'all_providers_failed',
        message: `All providers for ${category} failed`,
        reason: 'PROVIDER_ERROR',
      },
      fromCache: false,
      provider: null,
    };
  }
  
  /**
   * Check the health of all API categories
   */
  async getHealthStatus(): Promise<Record<string, { status: HealthStatusType, details?: any }>> {
    const status: Record<string, { status: HealthStatusType, details?: any }> = {};
    
    for (const [category, providers] of Object.entries(this.providers)) {
      if (providers.length === 0) {
        status[category] = { status: 'unavailable' };
        continue;
      }
      
      // Check the highest priority provider
      const highestPriorityProvider = providers[0];
      try {
        const providerStatus = await highestPriorityProvider.getHealthStatus();
        status[category] = { status: providerStatus };
      } catch (error) {
        console.error(`Failed to check health for ${category}:`, error);
        status[category] = { status: 'unavailable' };
      }
    }
    
    return status;
  }
}

// Create singleton instance
export const apiWarehouse = new APIDataWarehouse();
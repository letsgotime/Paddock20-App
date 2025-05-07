/**
 * API Data Warehouse - Main Export
 * 
 * This file exports all the necessary components of the API Data Warehouse
 * for easy consumption by other parts of the application.
 */

import { apiWarehouse } from './core';
import { APICategory, APIRequest, APIResponse, HealthStatusType } from './types/core';
import { registerWeatherProviders } from './providers/weather';
import { registerGeocodingProviders } from './providers/geocoding';

/**
 * Initialize the API Data Warehouse with specified providers
 */
export function initializeAPIWarehouse(options: {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  providersList?: string[];
}): void {
  console.info('🏎️ PADDOCK20: Initializing API Data Warehouse');
  
  // Set up logging level
  const logLevel = options.logLevel || 'info';
  
  // Register requested providers
  const requestedProviders = options.providersList || ['weather', 'geocoding'];
  
  // Register available providers
  if (requestedProviders.includes('weather')) {
    registerWeatherProviders(apiWarehouse);
    console.info('🏎️ PADDOCK20: Weather API providers registered');
  }
  
  if (requestedProviders.includes('geocoding')) {
    registerGeocodingProviders(apiWarehouse);
    console.info('🏎️ PADDOCK20: Geocoding API providers registered');
  }
  
  // Log unimplemented providers
  const implementedProviders = ['weather', 'geocoding'];
  const unimplementedProviders = requestedProviders.filter(
    provider => !implementedProviders.includes(provider)
  );
  
  if (unimplementedProviders.length > 0) {
    console.warn('Some requested API providers are not yet implemented:', unimplementedProviders);
  }
  
  console.info('🏎️ PADDOCK20: API Data Warehouse initialized with providers: weather, geocoding');
}

// Initialize by default with basic providers
if (typeof window !== 'undefined') {
  // Only auto-initialize in browser environment
  setTimeout(() => {
    if (!window.__apiWarehouseInitialized) {
      initializeAPIWarehouse({
        logLevel: 'warn',
        providersList: ['weather', 'geocoding']
      });
      window.__apiWarehouseInitialized = true;
    }
  }, 0);
}

/**
 * Fetch data from the API Warehouse
 * 
 * This is the main function to use for getting data from any API.
 * It handles caching, failover, and error handling automatically.
 */
export async function fetchAPI<T>(request: APIRequest): Promise<APIResponse<T>> {
  return await apiWarehouse.fetch<T>(request);
}

/**
 * Check the health of all API services
 * 
 * Useful for displaying service status to users and monitoring.
 */
export async function checkAPIHealth(): Promise<{
  status: HealthStatusType;
  providers: Record<string, HealthStatusType>;
}> {
  try {
    const healthStatus = await apiWarehouse.getHealthStatus();
    let worstStatus: HealthStatusType = 'healthy';
    
    // Determine overall status from individual provider statuses
    const providers: Record<string, HealthStatusType> = {};
    
    for (const [category, health] of Object.entries(healthStatus)) {
      providers[category] = health.status;
      
      // Track worst status (unavailable > degraded > healthy)
      if (health.status === 'unavailable') {
        worstStatus = 'unavailable';
      } else if (health.status === 'degraded' && worstStatus !== 'unavailable') {
        worstStatus = 'degraded';
      }
    }
    
    return {
      status: worstStatus,
      providers,
    };
  } catch (error) {
    console.error('Error checking API health:', error);
    return {
      status: 'unavailable',
      providers: {}
    };
  }
}

// Add TypeScript declaration for window
declare global {
  interface Window {
    __apiWarehouseInitialized?: boolean;
  }
}

// Export everything for direct access
export { apiWarehouse, APICategory };
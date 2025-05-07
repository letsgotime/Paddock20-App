/**
 * PADDOCK20 API Data Warehouse
 * 
 * The central hub for all API interactions in the PADDOCK20 application.
 * Provides a unified interface for accessing various API services while
 * handling caching, error recovery, and provider fallbacks.
 */

// Export the core API Data Warehouse
export { apiWarehouse, APIDataWarehouseCore } from './core';

// Export types
export * from './types';

// Initialize function to set up the API Data Warehouse
import { apiWarehouse } from './core';

/**
 * Initialize the API Data Warehouse with the available providers
 * This should be called early in the application bootstrap process
 */
export function initializeAPIWarehouse(config?: {
  providersList?: string[];
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}): void {
  console.info('🏎️ PADDOCK20: Initializing API Data Warehouse');
  
  // Currently available providers
  const availableProviders = [
    'weather',
    'geocoding'
  ];
  
  // Determine which providers to load (intersection of requested and available)
  const requested = config?.providersList || availableProviders;
  const providersToLoad = requested.filter(p => availableProviders.includes(p));
  
  // Report on any requested providers that aren't available
  const unavailableProviders = requested.filter(p => !availableProviders.includes(p));
  if (unavailableProviders.length > 0) {
    console.warn('Some requested API providers are not yet implemented:', unavailableProviders);
  }
  
  // Load core weather providers
  if (providersToLoad.includes('weather')) {
    import('./providers/weather').then(module => {
      module.registerWeatherProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Weather API providers registered');
    }).catch(err => {
      console.warn('Failed to load Weather API providers:', err);
    });
  }
  
  // Load geocoding providers
  if (providersToLoad.includes('geocoding')) {
    import('./providers/geocoding').then(module => {
      module.registerGeocodingProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Geocoding API providers registered');
    }).catch(err => {
      console.warn('Failed to load Geocoding API providers:', err);
    });
  }
  
  console.info(`🏎️ PADDOCK20: API Data Warehouse initialized with providers: ${providersToLoad.join(', ')}`);
}

/**
 * API Health check function
 */
export async function checkAPIHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unavailable';
  providers: Record<string, 'healthy' | 'degraded' | 'unavailable' | 'unknown'>;
  details: any;
}> {
  try {
    const health = await apiWarehouse.getHealthStatus();
    
    // Calculate overall status
    let overallStatus: 'healthy' | 'degraded' | 'unavailable' = 'healthy';
    const providers: Record<string, 'healthy' | 'degraded' | 'unavailable' | 'unknown'> = {};
    
    // Check each category
    for (const [category, status] of Object.entries(health)) {
      providers[category] = status.status;
      
      // Update overall status (degraded if any category is degraded, unavailable if all are unavailable)
      if (status.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      } else if (status.status === 'unavailable' && overallStatus !== 'unavailable') {
        // Only mark as unavailable if all checked so far are unavailable
        const checkedSoFar = Object.values(providers);
        if (checkedSoFar.every(s => s === 'unavailable')) {
          overallStatus = 'unavailable';
        } else {
          overallStatus = 'degraded';
        }
      }
    }
    
    return {
      status: overallStatus,
      providers,
      details: health,
    };
  } catch (error) {
    console.error('API health check failed:', error);
    return {
      status: 'unavailable',
      providers: {},
      details: { error: error.message },
    };
  }
}

// Export default for convenience
export default apiWarehouse;
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
 * Initialize the API Data Warehouse with all providers
 * This should be called early in the application bootstrap process
 */
export function initializeAPIWarehouse(config?: {
  providersList?: string[];
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}): void {
  console.info('🏎️ PADDOCK20: Initializing API Data Warehouse');
  
  // Dynamically import all providers based on the requested list
  const allProviders = [
    'weather',
    'geocoding',
    'time',
    'automotive',
    'music',
    'auth',
    'storage',
    'media'
  ];
  
  // Determine which providers to load
  const providersToLoad = config?.providersList || allProviders;
  
  // Load core providers immediately
  import('./providers/weather').then(module => {
    if (providersToLoad.includes('weather')) {
      module.registerWeatherProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Weather API providers registered');
    }
  }).catch(err => {
    console.warn('Failed to load Weather API providers:', err);
  });
  
  import('./providers/geocoding').then(module => {
    if (providersToLoad.includes('geocoding')) {
      module.registerGeocodingProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Geocoding API providers registered');
    }
  }).catch(err => {
    console.warn('Failed to load Geocoding API providers:', err);
  });
  
  import('./providers/time').then(module => {
    if (providersToLoad.includes('time')) {
      module.registerTimeProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Time API providers registered');
    }
  }).catch(err => {
    console.warn('Failed to load Time API providers:', err);
  });
  
  // Load other providers as needed
  if (providersToLoad.includes('automotive')) {
    import('./providers/automotive').then(module => {
      module.registerAutomotiveProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Automotive API providers registered');
    }).catch(err => {
      console.warn('Failed to load Automotive API providers:', err);
    });
  }
  
  if (providersToLoad.includes('music')) {
    import('./providers/music').then(module => {
      module.registerMusicProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Music API providers registered');
    }).catch(err => {
      console.warn('Failed to load Music API providers:', err);
    });
  }
  
  if (providersToLoad.includes('auth')) {
    import('./providers/auth').then(module => {
      module.registerAuthProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Auth API providers registered');
    }).catch(err => {
      console.warn('Failed to load Auth API providers:', err);
    });
  }
  
  if (providersToLoad.includes('storage')) {
    import('./providers/storage').then(module => {
      module.registerStorageProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Storage API providers registered');
    }).catch(err => {
      console.warn('Failed to load Storage API providers:', err);
    });
  }
  
  if (providersToLoad.includes('media')) {
    import('./providers/media').then(module => {
      module.registerMediaProviders(apiWarehouse);
      console.info('🏎️ PADDOCK20: Media API providers registered');
    }).catch(err => {
      console.warn('Failed to load Media API providers:', err);
    });
  }
  
  console.info('🏎️ PADDOCK20: API Data Warehouse initialization complete');
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
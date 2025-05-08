// Import core API Warehouse functionality
import { APIDataWarehouse } from './core/APIDataWarehouseCore';

// Import the provider factory functions we've created
import { createCloudinaryProvider } from './providers/media';
import { createLastFmProvider } from './providers/music';

// Group providers by type for registration
const mediaProviders = (() => {
  try {
    return [createCloudinaryProvider()];
  } catch (error) {
    console.error('Failed to initialize media providers:', error);
    return [];
  }
})();

const musicProviders = (() => {
  try {
    return [createLastFmProvider()];
  } catch (error) {
    console.error('Failed to initialize music providers:', error);
    return [];
  }
})();

// Mock other provider types that aren't fully implemented yet
const weatherProviders = [];
const geocodingProviders = [];
// Other provider imports will go here when implemented

/**
 * Initialize and configure the API Data Warehouse
 */
export function initializeAPIWarehouse(): APIDataWarehouse {
  console.info('🏎️ PADDOCK20: Initializing API Data Warehouse');
  
  // Create the API Warehouse instance
  const warehouse = new APIDataWarehouse();
  
  // Register all providers
  try {
    // Register weather providers (mock for now)
    weatherProviders.forEach(provider => {
      warehouse.registerProvider(provider);
    });
    console.info('🏎️ PADDOCK20: Weather API providers registered');
    
    // Register geocoding providers (mock for now)
    geocodingProviders.forEach(provider => {
      warehouse.registerProvider(provider);
    });
    console.info('🏎️ PADDOCK20: Geocoding API providers registered');
    
    // Register media providers (Cloudinary)
    mediaProviders.forEach(provider => {
      warehouse.registerProvider(provider);
    });
    console.info('🏎️ PADDOCK20: Media API providers registered');
    
    // Register music providers (Last.fm)
    musicProviders.forEach(provider => {
      warehouse.registerProvider(provider);
    });
    console.info('🏎️ PADDOCK20: Music API providers registered');
    
    // Add other provider registrations here as they are implemented
    
    // Identify any missing requested providers
    const requestedTypes = ['weather', 'geocoding', 'time', 'automotive', 'music', 'auth', 'storage', 'media'];
    const implementedTypes = warehouse.getProviderTypes();
    const missingTypes = requestedTypes.filter(type => !implementedTypes.includes(type));
    
    if (missingTypes.length > 0) {
      console.warn('Some requested API providers are not yet implemented:', missingTypes);
    }
    
  } catch (error) {
    console.error('Error initializing API Data Warehouse:', error);
  }
  
  console.info('🏎️ PADDOCK20: API Data Warehouse initialized with providers:', warehouse.getProviderTypes());
  
  return warehouse;
}

// Create a singleton instance of the API Data Warehouse
let warehouseInstance: APIDataWarehouse | null = null;

/**
 * Get the singleton instance of the API Data Warehouse
 * This ensures we only create one instance throughout the application
 */
export function getAPIWarehouse(): APIDataWarehouse {
  if (!warehouseInstance) {
    warehouseInstance = initializeAPIWarehouse();
  }
  return warehouseInstance;
}

/**
 * Reset the API Data Warehouse
 * This is useful for testing or when we need to rebuild the warehouse with new providers
 */
export function resetAPIWarehouse(): void {
  warehouseInstance = null;
}

// Export a default instance for immediate use
export default getAPIWarehouse();
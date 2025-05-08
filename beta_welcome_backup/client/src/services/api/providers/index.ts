/**
 * API Providers Index
 * 
 * This file exports all API provider implementations for easy access.
 */

// Export provider classes and factory functions
export * from './OpenWeatherProvider';
export * from './AccuWeatherProvider';
export * from './IPInfoProvider';
export * from './TimeZoneDBProvider';

// Import types
import { APICategory } from '../types';
import { apiWarehouse } from '../APIDataWarehouse';

// Import provider factories
import { createOpenWeatherProvider } from './OpenWeatherProvider';
import { createAccuWeatherProvider } from './AccuWeatherProvider';
import { createIPInfoProvider } from './IPInfoProvider';
import { createTimeZoneDBProvider } from './TimeZoneDBProvider';

/**
 * Initialize all API providers with the data warehouse
 * This configures the fallback chains and priorities
 */
export function initializeProviders(): void {
  console.info('Initializing API providers...');
  
  // Weather providers
  apiWarehouse.registerProvider(
    APICategory.WEATHER,
    createOpenWeatherProvider(APICategory.WEATHER, 10), // Higher priority
  );
  apiWarehouse.registerProvider(
    APICategory.WEATHER,
    createAccuWeatherProvider(APICategory.WEATHER, 5), // Lower priority, fallback
  );
  
  // Weather forecast providers
  apiWarehouse.registerProvider(
    APICategory.WEATHER_FORECAST,
    createOpenWeatherProvider(APICategory.WEATHER_FORECAST, 10),
  );
  apiWarehouse.registerProvider(
    APICategory.WEATHER_FORECAST,
    createAccuWeatherProvider(APICategory.WEATHER_FORECAST, 5),
  );
  
  // Geocoding providers
  apiWarehouse.registerProvider(
    APICategory.GEOCODING,
    createIPInfoProvider(APICategory.GEOCODING, 10),
  );
  
  // Reverse geocoding providers
  apiWarehouse.registerProvider(
    APICategory.REVERSE_GEOCODING,
    createIPInfoProvider(APICategory.REVERSE_GEOCODING, 10),
  );
  
  // Time providers
  apiWarehouse.registerProvider(
    APICategory.TIME,
    createTimeZoneDBProvider(APICategory.TIME, 10),
  );
  
  // Timezone providers
  apiWarehouse.registerProvider(
    APICategory.TIMEZONE,
    createTimeZoneDBProvider(APICategory.TIMEZONE, 10),
  );
  
  console.info('API providers initialization complete!');
}

/**
 * Check health of all API providers
 * @returns Object with health status for each category
 */
export async function checkProvidersHealth(): Promise<Record<APICategory, 'healthy' | 'degraded' | 'unavailable'>> {
  const result: Partial<Record<APICategory, 'healthy' | 'degraded' | 'unavailable'>> = {};
  
  // Check each category
  for (const category of Object.values(APICategory)) {
    try {
      // Get providers for this category
      const providers = apiWarehouse['providers'].get(category) || [];
      
      // If no providers, mark as unavailable
      if (providers.length === 0) {
        result[category] = 'unavailable';
        continue;
      }
      
      // Check the highest priority provider first
      const highestPriorityProvider = providers[0];
      const status = await highestPriorityProvider.getHealthStatus();
      
      // If the primary provider is healthy, we're good
      if (status === 'healthy') {
        result[category] = 'healthy';
        continue;
      }
      
      // If degraded, check if we have a healthy fallback
      if (status === 'degraded') {
        if (providers.length > 1) {
          const fallbackStatus = await providers[1].getHealthStatus();
          result[category] = fallbackStatus === 'healthy' ? 'healthy' : 'degraded';
        } else {
          result[category] = 'degraded';
        }
        continue;
      }
      
      // If primary is unavailable, try fallbacks
      for (let i = 1; i < providers.length; i++) {
        const fallbackStatus = await providers[i].getHealthStatus();
        if (fallbackStatus !== 'unavailable') {
          result[category] = fallbackStatus;
          break;
        }
      }
      
      // If all providers are unavailable or we didn't set a status
      if (!result[category]) {
        result[category] = 'unavailable';
      }
    } catch (error) {
      console.error(`Error checking health for ${category}:`, error);
      result[category] = 'unavailable';
    }
  }
  
  return result as Record<APICategory, 'healthy' | 'degraded' | 'unavailable'>;
}
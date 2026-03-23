/**
 * PADDOCK20 API Service
 * 
 * Unified API interface for the entire application, built around the modern
 * APIDataWarehouse architecture that ensures a robust, multi-tiered approach
 * to data acquisition, transformation, and delivery.
 */

import { APIDataWarehouse } from './core/APIDataWarehouseCore';
import { initializeWeatherProviders } from './providers';
import { ProviderResponse } from './core/provider';

// Create our singleton data warehouse instance
export const dataWarehouse = new APIDataWarehouse();

// Initialize all providers
export function initializeApiService(): void {
  console.log('Initializing API Service...');
  
  try {
    // Register weather providers
    initializeWeatherProviders(dataWarehouse);
    
    // Log successful initialization
    console.log('API Service successfully initialized');
  } catch (error) {
    console.error('Error initializing API Service:', error);
  }
}

/**
 * Get current weather for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param units Units system (imperial or metric)
 * @returns Weather data with automotive enhancements
 */
export async function getWeather(
  lat: number,
  lon: number,
  units: string = 'imperial'
): Promise<ProviderResponse> {
  try {
    // Get all providers of type 'weather'
    const weatherProviders = dataWarehouse.getProvidersByType('weather');
    if (!weatherProviders || weatherProviders.length === 0) {
      return {
        success: false,
        data: null,
        error: 'No weather providers available',
        provider: 'API Service',
        timestamp: Date.now()
      };
    }
    
    // Find the OpenWeather provider
    const openWeatherProvider = weatherProviders.find(p => p.name === 'OpenWeather API');
    if (!openWeatherProvider) {
      return {
        success: false,
        data: null,
        error: 'OpenWeather provider not available',
        provider: 'API Service',
        timestamp: Date.now()
      };
    }
    
    // Get weather data from the provider
    return openWeatherProvider.getCurrentWeather(lat, lon, units);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || 'Error getting weather data',
      provider: 'API Service',
      timestamp: Date.now()
    };
  }
}

/**
 * Get weather forecast for a location
 * @param lat Latitude
 * @param lon Longitude
 * @param units Units system (imperial or metric)
 * @returns Forecast data with automotive enhancements
 */
export async function getForecast(
  lat: number,
  lon: number,
  units: string = 'imperial'
): Promise<ProviderResponse> {
  try {
    // Get all providers of type 'weather'
    const weatherProviders = dataWarehouse.getProvidersByType('weather');
    if (!weatherProviders || weatherProviders.length === 0) {
      return {
        success: false,
        data: null,
        error: 'No weather providers available',
        provider: 'API Service',
        timestamp: Date.now()
      };
    }
    
    // Find the OpenWeather provider
    const openWeatherProvider = weatherProviders.find(p => p.name === 'OpenWeather API');
    if (!openWeatherProvider) {
      return {
        success: false,
        data: null,
        error: 'OpenWeather provider not available',
        provider: 'API Service',
        timestamp: Date.now()
      };
    }
    
    // Get forecast data from the provider
    return openWeatherProvider.getForecast(lat, lon, units);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || 'Error getting forecast data',
      provider: 'API Service',
      timestamp: Date.now()
    };
  }
}

/**
 * Get detailed weather and automotive analytics for a location
 * Creates a comprehensive data package for the Weather Paddock component
 */
export async function getWeatherPaddockData(
  lat: number,
  lon: number,
  units: string = 'imperial'
): Promise<any> {
  try {
    // Get current weather
    const weatherResponse = await getWeather(lat, lon, units);
    
    // Get forecast
    const forecastResponse = await getForecast(lat, lon, units);
    
    // Return combined data
    return {
      current: weatherResponse.success ? weatherResponse.data : null,
      forecast: forecastResponse.success ? forecastResponse.data : null,
      timestamp: Date.now(),
      source: weatherResponse.provider,
      success: weatherResponse.success || forecastResponse.success
    };
  } catch (error: any) {
    console.error('Error getting weather paddock data:', error);
    return {
      success: false,
      error: error.message || 'Failed to load weather paddock data',
      timestamp: Date.now()
    };
  }
}

/**
 * Get nearby flights for a location
 */
export async function getNearbyFlights(
  lat: number,
  lon: number,
  radius: number = 100
): Promise<ProviderResponse> {
  try {
    // Get aviation provider
    const aviationProviders = dataWarehouse.getProvidersByType('aviation');
    if (!aviationProviders || aviationProviders.length === 0) {
      return {
        success: false,
        data: null,
        error: 'No aviation providers available',
        provider: 'API Service',
        timestamp: Date.now()
      };
    }
    
    // Find the aviation provider
    const aviationProvider = aviationProviders[0]; // Use the first one registered
    
    // Get flight data using the provider's method
    return (aviationProvider as any).getNearbyFlights(lat, lon, radius);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || 'Error getting aviation data',
      provider: 'API Service',
      timestamp: Date.now()
    };
  }
}

/**
 * Get airports
 */
export async function getAirports(params: Record<string, any> = {}): Promise<ProviderResponse> {
  try {
    // Get aviation provider
    const aviationProviders = dataWarehouse.getProvidersByType('aviation');
    if (!aviationProviders || aviationProviders.length === 0) {
      return {
        success: false,
        data: null,
        error: 'No aviation providers available',
        provider: 'API Service',
        timestamp: Date.now()
      };
    }
    
    // Find the aviation provider
    const aviationProvider = aviationProviders[0]; // Use the first one registered
    
    // Get airport data using the provider's method
    return (aviationProvider as any).getAirports(params);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || 'Error getting airport data',
      provider: 'API Service',
      timestamp: Date.now()
    };
  }
}

/**
 * Get flights
 */
export async function getFlights(params: Record<string, any> = {}): Promise<ProviderResponse> {
  try {
    // Get aviation provider
    const aviationProviders = dataWarehouse.getProvidersByType('aviation');
    if (!aviationProviders || aviationProviders.length === 0) {
      return {
        success: false,
        data: null,
        error: 'No aviation providers available',
        provider: 'API Service',
        timestamp: Date.now()
      };
    }
    
    // Find the aviation provider
    const aviationProvider = aviationProviders[0]; // Use the first one registered
    
    // Get flight data using the provider's method
    return (aviationProvider as any).getFlights(params);
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || 'Error getting flight data',
      provider: 'API Service',
      timestamp: Date.now()
    };
  }
}

// Export everything needed for the API Service
export default {
  initializeApiService,
  getWeather,
  getForecast,
  getWeatherPaddockData,
  getNearbyFlights,
  getAirports,
  getFlights,
  dataWarehouse
};
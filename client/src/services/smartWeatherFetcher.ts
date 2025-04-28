// --------------------------------------------
// 🚀 Smart Weather Fetcher: Using OpenWeather API
// --------------------------------------------

import { 
  fetchCurrentWeather, 
  fetchForecast, 
  fetchOneCall, 
  getAutomotiveWeatherData,
  fetchAllWeatherData
} from './openWeatherService';

/**
 * Smart Weather Fetcher using OpenWeather API
 * This provides comprehensive weather data for automotive applications
 */
export class SmartWeatherFetcher {
  private openweatherApiKey: string;
  
  constructor(openweatherApiKey: string) {
    this.openweatherApiKey = openweatherApiKey;
  }
  
  /**
   * Get current weather conditions
   */
  public async getCurrentWeather(latitude: number, longitude: number) {
    try {
      console.log('Using OpenWeather for current conditions');
      const openWeatherData = await fetchCurrentWeather(latitude, longitude);
      return {
        source: 'OpenWeather',
        data: openWeatherData
      };
    } catch (error) {
      console.error('OpenWeather failed for current conditions', error);
      throw new Error('Failed to fetch current weather data');
    }
  }
  
  /**
   * Get forecast data
   */
  public async getForecast(latitude: number, longitude: number) {
    try {
      console.log('Using OpenWeather for forecast');
      const openWeatherForecast = await fetchForecast(latitude, longitude);
      return {
        source: 'OpenWeather',
        data: openWeatherForecast
      };
    } catch (error) {
      console.error('OpenWeather failed for forecast', error);
      throw new Error('Failed to fetch forecast data');
    }
  }
  
  /**
   * Get comprehensive weather data (one call)
   */
  public async getOneCallData(latitude: number, longitude: number) {
    try {
      console.log('Using OpenWeather for comprehensive data');
      const openWeatherOneCall = await fetchOneCall(latitude, longitude);
      return {
        source: 'OpenWeather',
        data: openWeatherOneCall
      };
    } catch (error) {
      console.error('OpenWeather failed for one call data', error);
      throw new Error('Failed to fetch comprehensive weather data');
    }
  }
  
  /**
   * Get automotive weather data with F1-level metrics
   */
  public async getAutomotiveWeatherData(latitude: number, longitude: number) {
    try {
      console.log('Using OpenWeather for automotive data');
      const openWeatherAutomotiveData = await getAutomotiveWeatherData(latitude, longitude);
      return {
        source: 'OpenWeather',
        data: openWeatherAutomotiveData
      };
    } catch (error) {
      console.error('OpenWeather failed for automotive data', error);
      throw new Error('Failed to fetch automotive weather data');
    }
  }
  
  /**
   * Get all weather data in one call for efficiency
   */
  public async getAllWeatherData(latitude: number, longitude: number) {
    try {
      console.log('Using OpenWeather for all weather data');
      const allOpenWeatherData = await fetchAllWeatherData(latitude, longitude);
      return {
        source: 'OpenWeather',
        data: allOpenWeatherData
      };
    } catch (error) {
      console.error('OpenWeather failed for all weather data', error);
      throw new Error('Failed to fetch all weather data');
    }
  }
}

// Create a singleton instance for use throughout the app
let smartWeatherFetcher: SmartWeatherFetcher | null = null;

/**
 * Get or create the SmartWeatherFetcher instance
 */
export function getSmartWeatherFetcher(openweatherApiKey: string): SmartWeatherFetcher {
  if (!smartWeatherFetcher) {
    smartWeatherFetcher = new SmartWeatherFetcher(openweatherApiKey);
  }
  return smartWeatherFetcher;
}

/**
 * Reset the fetcher instance (useful for testing or when API keys change)
 */
export function resetSmartWeatherFetcher(): void {
  smartWeatherFetcher = null;
}
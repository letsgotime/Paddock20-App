// --------------------------------------------
// 🚀 Smart Weather Fetcher: AccuWeather → Fallback to OpenWeather
// --------------------------------------------

import { 
  fetchCurrentWeather, 
  fetchForecast, 
  fetchOneCall, 
  getAutomotiveWeatherData,
  fetchAllWeatherData
} from './openWeatherService';
import { getLocationKey, getCurrentConditions, getDailyForecast } from './accuWeatherService';

/**
 * Smart Weather Fetcher that tries AccuWeather first and falls back to OpenWeather
 * This provides redundancy in case one API has issues or reaches its limit
 */
export class SmartWeatherFetcher {
  private accuweatherApiKey: string;
  private openweatherApiKey: string;
  private lastUsedSource: 'AccuWeather' | 'OpenWeather' | null = null;
  
  constructor(accuweatherApiKey: string, openweatherApiKey: string) {
    this.accuweatherApiKey = accuweatherApiKey;
    this.openweatherApiKey = openweatherApiKey;
  }
  
  /**
   * Get the source of the last successful API call
   */
  public getLastUsedSource(): 'AccuWeather' | 'OpenWeather' | null {
    return this.lastUsedSource;
  }
  
  /**
   * Get current weather conditions, trying AccuWeather first,
   * then falling back to OpenWeather if needed
   */
  public async getCurrentWeather(latitude: number, longitude: number) {
    try {
      console.log('Trying AccuWeather for current conditions');
      // First try AccuWeather
      const locationKey = await getLocationKey(latitude, longitude);
      const accuWeatherData = await getCurrentConditions(locationKey);
      this.lastUsedSource = 'AccuWeather';
      return {
        source: 'AccuWeather',
        data: accuWeatherData
      };
    } catch (accuWeatherError) {
      console.warn('AccuWeather failed for current conditions, falling back to OpenWeather', accuWeatherError);
      
      try {
        // Fall back to OpenWeather
        const openWeatherData = await fetchCurrentWeather(latitude, longitude);
        this.lastUsedSource = 'OpenWeather';
        return {
          source: 'OpenWeather',
          data: openWeatherData
        };
      } catch (openWeatherError) {
        console.error('Both AccuWeather and OpenWeather failed for current conditions', openWeatherError);
        throw new Error('Failed to fetch current weather from both providers');
      }
    }
  }
  
  /**
   * Get forecast, trying AccuWeather first,
   * then falling back to OpenWeather if needed
   */
  public async getForecast(latitude: number, longitude: number) {
    try {
      console.log('Trying AccuWeather for forecast');
      // First try AccuWeather
      const locationKey = await getLocationKey(latitude, longitude);
      const accuWeatherForecast = await getDailyForecast(locationKey);
      this.lastUsedSource = 'AccuWeather';
      return {
        source: 'AccuWeather',
        data: accuWeatherForecast
      };
    } catch (accuWeatherError) {
      console.warn('AccuWeather failed for forecast, falling back to OpenWeather', accuWeatherError);
      
      try {
        // Fall back to OpenWeather
        const openWeatherForecast = await fetchForecast(latitude, longitude);
        this.lastUsedSource = 'OpenWeather';
        return {
          source: 'OpenWeather',
          data: openWeatherForecast
        };
      } catch (openWeatherError) {
        console.error('Both AccuWeather and OpenWeather failed for forecast', openWeatherError);
        throw new Error('Failed to fetch forecast from both providers');
      }
    }
  }
  
  /**
   * Get comprehensive weather data (one call),
   * trying AccuWeather first, then falling back to OpenWeather if needed
   */
  public async getOneCallData(latitude: number, longitude: number) {
    try {
      console.log('Trying AccuWeather for comprehensive data');
      // AccuWeather doesn't have a direct One Call equivalent,
      // so we need to make multiple calls to simulate it
      const locationKey = await getLocationKey(latitude, longitude);
      const current = await getCurrentConditions(locationKey);
      const forecast = await getDailyForecast(locationKey);
      
      // Combine the data
      const accuWeatherOneCall = {
        current,
        daily: forecast.DailyForecasts || [],
        // Add other needed properties
      };
      
      this.lastUsedSource = 'AccuWeather';
      return {
        source: 'AccuWeather',
        data: accuWeatherOneCall
      };
    } catch (accuWeatherError) {
      console.warn('AccuWeather failed for one call data, falling back to OpenWeather', accuWeatherError);
      
      try {
        // Fall back to OpenWeather
        const openWeatherOneCall = await fetchOneCall(latitude, longitude);
        this.lastUsedSource = 'OpenWeather';
        return {
          source: 'OpenWeather',
          data: openWeatherOneCall
        };
      } catch (openWeatherError) {
        console.error('Both AccuWeather and OpenWeather failed for one call data', openWeatherError);
        throw new Error('Failed to fetch comprehensive weather data from both providers');
      }
    }
  }
  
  /**
   * Get automotive weather data with F1-level metrics,
   * trying AccuWeather first, then falling back to OpenWeather if needed
   */
  public async getAutomotiveWeatherData(latitude: number, longitude: number) {
    try {
      console.log('Trying AccuWeather for automotive data');
      
      // For AccuWeather, we would need to call their specific endpoints
      // and then compute the automotive metrics ourselves
      const locationKey = await getLocationKey(latitude, longitude);
      // This is where we would compute AccuWeather automotive data
      // This would be a custom implementation similar to getAutomotiveWeatherData in openWeatherService
      
      // For now, we'll just throw an error to test the fallback path
      throw new Error('AccuWeather automotive data calculation not fully implemented');
      
    } catch (accuWeatherError) {
      console.warn('AccuWeather failed for automotive data, falling back to OpenWeather', accuWeatherError);
      
      try {
        // Fall back to OpenWeather, which we've already implemented
        const openWeatherAutomotiveData = await getAutomotiveWeatherData(latitude, longitude);
        this.lastUsedSource = 'OpenWeather';
        return {
          source: 'OpenWeather',
          data: openWeatherAutomotiveData
        };
      } catch (openWeatherError) {
        console.error('Both AccuWeather and OpenWeather failed for automotive data', openWeatherError);
        throw new Error('Failed to fetch automotive weather data from both providers');
      }
    }
  }
  
  /**
   * Get all weather data in one call for efficiency,
   * trying AccuWeather first, then falling back to OpenWeather if needed
   */
  public async getAllWeatherData(latitude: number, longitude: number) {
    try {
      console.log('Trying AccuWeather for all weather data');
      
      // For AccuWeather, we need multiple API calls
      // But for efficiency, we should implement proper caching
      // This implementation would be similar to fetchAllWeatherData in openWeatherService
      
      // For now, we'll just throw an error to test the fallback path
      throw new Error('AccuWeather all weather data fetch not fully implemented');
      
    } catch (accuWeatherError) {
      console.warn('AccuWeather failed for all weather data, falling back to OpenWeather', accuWeatherError);
      
      try {
        // Fall back to OpenWeather, which we've already implemented
        const allOpenWeatherData = await fetchAllWeatherData(latitude, longitude);
        this.lastUsedSource = 'OpenWeather';
        return {
          source: 'OpenWeather',
          data: allOpenWeatherData
        };
      } catch (openWeatherError) {
        console.error('Both AccuWeather and OpenWeather failed for all weather data', openWeatherError);
        throw new Error('Failed to fetch all weather data from both providers');
      }
    }
  }
}

// Create a singleton instance for use throughout the app
let smartWeatherFetcher: SmartWeatherFetcher | null = null;

/**
 * Get or create the SmartWeatherFetcher instance
 */
export function getSmartWeatherFetcher(
  accuweatherApiKey: string, 
  openweatherApiKey: string
): SmartWeatherFetcher {
  if (!smartWeatherFetcher) {
    smartWeatherFetcher = new SmartWeatherFetcher(accuweatherApiKey, openweatherApiKey);
  }
  return smartWeatherFetcher;
}

/**
 * Reset the fetcher instance (useful for testing or when API keys change)
 */
export function resetSmartWeatherFetcher(): void {
  smartWeatherFetcher = null;
}
/**
 * AccuWeather API Provider
 * 
 * Implements the API provider interface for the AccuWeather API.
 * This provider supports current conditions and forecasts.
 */

import { APIProvider, APICategory, APIRequest, APIResponse, WeatherData } from '../types';
import { apiWarehouse } from '../APIDataWarehouse';

// AccuWeather specific configuration
interface AccuWeatherConfig {
  apiKey?: string;
  language?: string;
  baseUrl?: string;
}

// Default configuration
const DEFAULT_CONFIG: AccuWeatherConfig = {
  language: 'en-us',
  baseUrl: 'https://dataservice.accuweather.com',
};

// Service name for API key lookup
const SERVICE_NAME = 'ACCUWEATHER';

export class AccuWeatherProvider implements APIProvider {
  // Provider metadata
  public name: string = 'AccuWeather';
  public category: APICategory;
  public priority: number;
  public defaultCacheTTL: number = 60 * 60 * 1000; // 1 hour
  
  // Rate limiting (Free tier: 50 calls per day ~= 2 per hour)
  public rateLimitPerMinute: number = 2;
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  // Configuration
  private config: AccuWeatherConfig;
  // Location key cache to reduce API calls
  private locationKeyCache: Map<string, string> = new Map();

  constructor(
    category: APICategory, 
    priority: number = 0, // Lower priority than OpenWeather by default
    config: Partial<AccuWeatherConfig> = {}
  ) {
    this.category = category;
    this.priority = priority;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an API request to AccuWeather
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    // Get API key from warehouse or config
    const apiKey = this.config.apiKey || apiWarehouse.getAPIKey(SERVICE_NAME);
    if (!apiKey) {
      throw new Error(`No API key available for ${this.name}`);
    }

    // Rate limiting
    if (this.shouldThrottle()) {
      throw new Error(`Rate limit exceeded for ${this.name}`);
    }
    this.trackRequest();

    try {
      // We need to get the location key first for most AccuWeather endpoints
      let locationKey: string | undefined;
      if (request.params?.lat && request.params?.lon) {
        const cacheKey = `${request.params.lat},${request.params.lon}`;
        if (this.locationKeyCache.has(cacheKey)) {
          locationKey = this.locationKeyCache.get(cacheKey);
        } else {
          // Get location key from coordinates
          locationKey = await this.getLocationKeyFromCoordinates(
            apiKey, 
            request.params.lat, 
            request.params.lon
          );
          this.locationKeyCache.set(cacheKey, locationKey);
        }
      } else if (request.params?.locationKey) {
        locationKey = request.params.locationKey;
      }

      if (!locationKey && this.category !== APICategory.GEOCODING) {
        throw new Error('Location key is required for AccuWeather weather requests');
      }

      // Build the URL
      const baseUrl = this.config.baseUrl;
      const endpoint = this.getEndpointForCategory(locationKey);
      const url = new URL(`${baseUrl}/${endpoint}`);
      
      // Add common parameters
      url.searchParams.append('apikey', apiKey);
      url.searchParams.append('language', this.config.language || 'en-us');
      
      // Add request-specific parameters (excluding those we've handled)
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          if (!['lat', 'lon', 'locationKey'].includes(key)) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      // Make the request
      const response = await fetch(url.toString(), {
        headers: request.headers || {},
      });

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(`Invalid API key for ${this.name}`);
        } else if (response.status === 403) {
          throw new Error(`Exceeded API key quota for ${this.name}`);
        } else {
          throw new Error(`HTTP error ${response.status} from ${this.name}: ${response.statusText}`);
        }
      }

      // Parse the response
      const data = await response.json();
      
      // Transform the data to our standard format
      const transformedData = this.transformData(data, this.category);
      
      return {
        data: transformedData as unknown as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error executing request to ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Check if the provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = this.config.apiKey || apiWarehouse.getAPIKey(SERVICE_NAME);
      if (!apiKey) {
        return false;
      }
      
      // Make a lightweight test request (e.g., getting the location key for a major city)
      const url = new URL(`${this.config.baseUrl}/locations/v1/cities/geoposition/search`);
      url.searchParams.append('apikey', apiKey);
      url.searchParams.append('q', '40.7128,-74.0060'); // New York coordinates
      
      const response = await fetch(url.toString());
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the remaining quota for this API
   */
  async getQuotaRemaining(): Promise<number> {
    // AccuWeather doesn't provide a quota endpoint, so we estimate based on rate limits
    const minutesSinceLastRequest = (Date.now() - this.lastRequestTime) / (60 * 1000);
    if (minutesSinceLastRequest >= 1) {
      return this.rateLimitPerMinute;
    } else {
      return Math.max(0, this.rateLimitPerMinute - this.requestsThisMinute);
    }
  }

  /**
   * Get the health status of this provider
   */
  async getHealthStatus(): Promise<'healthy' | 'degraded' | 'unavailable'> {
    if (await this.isAvailable()) {
      const quotaRemaining = await this.getQuotaRemaining();
      if (quotaRemaining < this.rateLimitPerMinute * 0.2) {
        return 'degraded';
      } else {
        return 'healthy';
      }
    }
    return 'unavailable';
  }

  /**
   * Get a location key from lat/lon
   */
  private async getLocationKeyFromCoordinates(apiKey: string, lat: number, lon: number): Promise<string> {
    const url = new URL(`${this.config.baseUrl}/locations/v1/cities/geoposition/search`);
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('q', `${lat},${lon}`);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to get location key: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data || !data.Key) {
      throw new Error('Location key not found in response');
    }
    
    return data.Key;
  }

  /**
   * Transform the raw API data to our standardized format
   */
  private transformData(data: any, category: APICategory): any {
    switch (category) {
      case APICategory.WEATHER:
        return this.transformCurrentConditions(data);
      case APICategory.WEATHER_FORECAST:
        return this.transformForecast(data);
      default:
        // For other categories, return the data as-is
        return data;
    }
  }

  /**
   * Transform current conditions data to our standardized format
   */
  private transformCurrentConditions(data: any): WeatherData {
    // AccuWeather returns current conditions as an array with one item
    const conditions = Array.isArray(data) ? data[0] : data;
    
    return {
      location: {
        name: conditions.LocalizedName || 'Unknown',
        lat: 0, // Not provided in current conditions
        lon: 0, // Not provided in current conditions
        country: conditions.Country?.LocalizedName || 'Unknown',
        timezone: conditions.TimeZone?.Name || 'UTC',
      },
      current: {
        temp: conditions.Temperature?.Imperial?.Value || 0,
        feels_like: conditions.RealFeelTemperature?.Imperial?.Value || 0,
        humidity: conditions.RelativeHumidity || 0,
        pressure: conditions.Pressure?.Imperial?.Value || 0,
        wind_speed: conditions.Wind?.Speed?.Imperial?.Value || 0,
        wind_direction: conditions.Wind?.Direction?.Degrees || 0,
        weather_description: conditions.WeatherText || 'Unknown',
        weather_icon: this.mapAccuWeatherIconToCode(conditions.WeatherIcon || 1),
        cloud_cover: conditions.CloudCover || 0,
        visibility: conditions.Visibility?.Imperial?.Value || 0,
        uv_index: conditions.UVIndex || 0,
        precipitation: conditions.PrecipitationSummary?.PastHour?.Imperial?.Value || 0,
        timestamp: new Date(conditions.EpochTime * 1000).getTime(),
      },
      source: this.name,
    };
  }

  /**
   * Transform forecast data to our standardized format
   */
  private transformForecast(data: any): WeatherData {
    // We'll use the first day's data for the main weather info
    const firstDay = data.DailyForecasts[0];
    
    const weather: WeatherData = {
      location: {
        name: data.Headline?.EffectiveLocation || 'Unknown',
        lat: 0, // Not provided in forecast
        lon: 0, // Not provided in forecast
        country: 'Unknown', // Not provided in forecast
        timezone: 'UTC', // Not provided in forecast
      },
      current: {
        temp: (firstDay.Temperature?.Maximum?.Value + firstDay.Temperature?.Minimum?.Value) / 2,
        feels_like: (firstDay.RealFeelTemperature?.Maximum?.Value + firstDay.RealFeelTemperature?.Minimum?.Value) / 2,
        humidity: 0, // Not provided in forecast
        pressure: 0, // Not provided in forecast
        wind_speed: firstDay.Day?.Wind?.Speed?.Value || 0,
        wind_direction: firstDay.Day?.Wind?.Direction?.Degrees || 0,
        weather_description: firstDay.Day?.IconPhrase || 'Unknown',
        weather_icon: this.mapAccuWeatherIconToCode(firstDay.Day?.Icon || 1),
        cloud_cover: 0, // Not provided in forecast
        visibility: 0, // Not provided in forecast
        uv_index: firstDay.AirAndPollen?.find((item: any) => item.Name === 'UVIndex')?.Value || 0,
        precipitation: firstDay.Day?.TotalLiquid?.Value || 0,
        timestamp: new Date(firstDay.EpochDate * 1000).getTime(),
      },
      daily: data.DailyForecasts.map((day: any) => ({
        date: new Date(day.EpochDate * 1000).toISOString(),
        temp_min: day.Temperature?.Minimum?.Value || 0,
        temp_max: day.Temperature?.Maximum?.Value || 0,
        weather_description: day.Day?.IconPhrase || 'Unknown',
        weather_icon: this.mapAccuWeatherIconToCode(day.Day?.Icon || 1),
        precipitation_chance: day.Day?.PrecipitationProbability || 0,
        sunrise: 0, // Not provided directly
        sunset: 0, // Not provided directly
      })),
      source: this.name,
    };
    
    return weather;
  }

  /**
   * Map AccuWeather icon codes to standardized codes (similar to OpenWeather)
   */
  private mapAccuWeatherIconToCode(iconNumber: number): string {
    // This is a simplified mapping - expand as needed
    const iconMap: Record<number, string> = {
      1: '01d', // Sunny
      2: '01d', // Mostly Sunny
      3: '02d', // Partly Sunny
      4: '03d', // Intermittent Clouds
      5: '04d', // Hazy Sunshine
      6: '04d', // Mostly Cloudy
      7: '04d', // Cloudy
      8: '04d', // Dreary
      11: '09d', // Fog
      12: '09d', // Showers
      13: '09d', // Mostly Cloudy w/ Showers
      14: '09d', // Partly Sunny w/ Showers
      15: '11d', // T-Storms
      16: '11d', // Mostly Cloudy w/ T-Storms
      17: '11d', // Partly Sunny w/ T-Storms
      18: '13d', // Rain
      19: '13d', // Flurries
      20: '13d', // Mostly Cloudy w/ Flurries
      21: '13d', // Partly Sunny w/ Flurries
      22: '13d', // Snow
      23: '13d', // Mostly Cloudy w/ Snow
      24: '13d', // Ice
      25: '13d', // Sleet
      26: '13d', // Freezing Rain
      29: '13d', // Rain and Snow
      30: '09d', // Hot
      31: '13d', // Cold
      32: '50d', // Windy
    };
    
    // For night icons (33-44), we'll map to night equivalents
    if (iconNumber >= 33 && iconNumber <= 44) {
      const dayIcon = iconMap[iconNumber - 32] || '01d';
      return dayIcon.replace('d', 'n');
    }
    
    return iconMap[iconNumber] || '01d';
  }

  /**
   * Get the appropriate endpoint for the given category and location key
   */
  private getEndpointForCategory(locationKey?: string): string {
    switch (this.category) {
      case APICategory.WEATHER:
        return `currentconditions/v1/${locationKey}`;
      case APICategory.WEATHER_FORECAST:
        return `forecasts/v1/daily/5day/${locationKey}`;
      case APICategory.GEOCODING:
        return 'locations/v1/cities/geoposition/search';
      default:
        return 'locations/v1/cities/geoposition/search';
    }
  }

  /**
   * Check if we should throttle the request
   */
  private shouldThrottle(): boolean {
    const now = Date.now();
    const minutesSinceLastRequest = (now - this.lastRequestTime) / (60 * 1000);
    
    // Reset counter if more than a minute has passed
    if (minutesSinceLastRequest >= 1) {
      this.requestsThisMinute = 0;
      return false;
    }
    
    // Throttle if we've hit the rate limit
    return this.requestsThisMinute >= this.rateLimitPerMinute;
  }

  /**
   * Track a request for rate limiting
   */
  private trackRequest(): void {
    const now = Date.now();
    const minutesSinceLastRequest = (now - this.lastRequestTime) / (60 * 1000);
    
    // Reset counter if more than a minute has passed
    if (minutesSinceLastRequest >= 1) {
      this.requestsThisMinute = 1;
    } else {
      this.requestsThisMinute++;
    }
    
    this.lastRequestTime = now;
  }
}

// Factory function to create AccuWeather providers
export function createAccuWeatherProvider(
  category: APICategory, 
  priority: number = 0,
  config: Partial<AccuWeatherConfig> = {}
): AccuWeatherProvider {
  return new AccuWeatherProvider(category, priority, config);
}
/**
 * OpenWeather API Provider
 * 
 * Implements the API provider interface for the OpenWeather API.
 * This provider supports current weather, forecasts, and one-call endpoints.
 */

import { APIProvider, APICategory, APIRequest, APIResponse, WeatherData } from '../types';
import { apiWarehouse } from '../APIDataWarehouse';

// OpenWeather specific configuration
interface OpenWeatherConfig {
  apiKey?: string;
  units?: 'metric' | 'imperial' | 'standard';
  language?: string;
  baseUrl?: string;
}

// Default configuration
const DEFAULT_CONFIG: OpenWeatherConfig = {
  units: 'imperial',
  language: 'en',
  baseUrl: 'https://api.openweathermap.org/data/2.5',
};

// Service name for API key lookup
const SERVICE_NAME = 'OPENWEATHER';

export class OpenWeatherProvider implements APIProvider {
  // Provider metadata
  public name: string = 'OpenWeather';
  public category: APICategory;
  public priority: number;
  public defaultCacheTTL: number = 30 * 60 * 1000; // 30 minutes
  
  // Rate limiting 
  public rateLimitPerMinute: number = 60;
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  // Configuration
  private config: OpenWeatherConfig;

  constructor(
    category: APICategory, 
    priority: number = 1,
    config: Partial<OpenWeatherConfig> = {}
  ) {
    this.category = category;
    this.priority = priority;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an API request to OpenWeather
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
      // Build the URL
      const baseUrl = this.config.baseUrl;
      const endpoint = request.endpoint || this.getEndpointForCategory();
      const url = new URL(`${baseUrl}/${endpoint}`);
      
      // Add common parameters
      url.searchParams.append('appid', apiKey);
      url.searchParams.append('units', this.config.units || 'imperial');
      url.searchParams.append('lang', this.config.language || 'en');
      
      // Add request-specific parameters
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
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
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded for ${this.name}`);
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
      
      // Make a lightweight test request
      const response = await fetch(
        `${this.config.baseUrl}/ping?appid=${apiKey}`
      );
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the remaining quota for this API
   */
  async getQuotaRemaining(): Promise<number> {
    // OpenWeather doesn't provide a quota endpoint, so we estimate based on rate limits
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
      if (quotaRemaining < this.rateLimitPerMinute * 0.1) {
        return 'degraded';
      } else {
        return 'healthy';
      }
    }
    return 'unavailable';
  }

  /**
   * Transform the raw API data to our standardized format
   */
  private transformData(data: any, category: APICategory): any {
    switch (category) {
      case APICategory.WEATHER:
        return this.transformWeatherData(data);
      case APICategory.WEATHER_FORECAST:
        return this.transformForecastData(data);
      default:
        // For other categories, return the data as-is
        return data;
    }
  }

  /**
   * Transform current weather data to our standardized format
   */
  private transformWeatherData(data: any): WeatherData {
    return {
      location: {
        name: data.name,
        lat: data.coord.lat,
        lon: data.coord.lon,
        country: data.sys.country,
        timezone: 'UTC', // OpenWeather doesn't provide timezone in current weather endpoint
      },
      current: {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed,
        wind_direction: data.wind.deg,
        weather_description: data.weather[0].description,
        weather_icon: data.weather[0].icon,
        cloud_cover: data.clouds.all,
        visibility: data.visibility / 1000, // Convert to km
        uv_index: 0, // Not provided in current weather endpoint
        precipitation: data.rain ? data.rain['1h'] || 0 : 0,
        timestamp: data.dt * 1000,
      },
      source: this.name,
    };
  }

  /**
   * Transform forecast data to our standardized format
   */
  private transformForecastData(data: any): WeatherData {
    const weather = this.transformWeatherData(data.city);
    
    // Add daily forecast data
    weather.daily = data.list.map((day: any) => ({
      date: new Date(day.dt * 1000).toISOString(),
      temp_min: day.temp.min,
      temp_max: day.temp.max,
      weather_description: day.weather[0].description,
      weather_icon: day.weather[0].icon,
      precipitation_chance: day.pop * 100, // Convert to percentage
      sunrise: day.sunrise * 1000,
      sunset: day.sunset * 1000,
    }));
    
    return weather;
  }

  /**
   * Get the appropriate endpoint for the given category
   */
  private getEndpointForCategory(): string {
    switch (this.category) {
      case APICategory.WEATHER:
        return 'weather';
      case APICategory.WEATHER_FORECAST:
        return 'forecast';
      default:
        return 'weather';
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

// Factory function to create OpenWeather providers
export function createOpenWeatherProvider(
  category: APICategory, 
  priority: number = 1,
  config: Partial<OpenWeatherConfig> = {}
): OpenWeatherProvider {
  return new OpenWeatherProvider(category, priority, config);
}
/**
 * PADDOCK20 Weather API Providers
 * 
 * This module contains weather data providers for the API Data Warehouse.
 */

import { 
  APICategory, 
  APIProvider, 
  APIRequest, 
  APIResponse,
  HealthStatusType 
} from '../types/core';

import axios from 'axios';

/**
 * OpenWeather Provider
 * 
 * Implementation of the OpenWeather API provider.
 */
export class OpenWeatherProvider implements APIProvider {
  name = 'OpenWeatherMap';
  category = APICategory.WEATHER;
  priority = 10;
  
  /**
   * Execute a request to the OpenWeather API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 'no_api_key',
          message: 'OpenWeather API key is missing',
          reason: 'AUTHENTICATION_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    try {
      let endpoint: string;
      let params: Record<string, any> = {
        ...request.params,
        appid: apiKey,
      };
      
      // Determine the appropriate OpenWeather endpoint
      switch (request.endpoint) {
        case 'current':
          endpoint = 'https://api.openweathermap.org/data/2.5/weather';
          break;
        case 'forecast':
          endpoint = 'https://api.openweathermap.org/data/2.5/forecast';
          break;
        case 'onecall':
          endpoint = 'https://api.openweathermap.org/data/3.0/onecall';
          break;
        case 'alerts':
          endpoint = 'https://api.openweathermap.org/data/2.5/onecall';
          params.exclude = 'current,minutely,hourly,daily';
          break;
        default:
          endpoint = 'https://api.openweathermap.org/data/2.5/weather';
      }
      
      // Set default units if not specified
      if (!params.units) {
        params.units = 'imperial';
      }
      
      // Execute the request
      const response = await axios.get(endpoint, { params });
      
      // Transform the response into a standardized format
      const transformedData = this.transformData<T>(request.endpoint, response.data);
      
      return {
        success: true,
        data: transformedData,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('OpenWeather API error:', error);
      
      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'unknown',
          message: error.message || 'Unknown error',
          reason: this.mapErrorReason(error),
          details: error.response?.data,
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Transform OpenWeather data to our standardized format
   */
  private transformData<T>(endpoint: string, data: any): T {
    // We need to transform the data based on the endpoint
    switch (endpoint) {
      case 'current':
        return {
          location: {
            name: data.name,
            lat: data.coord.lat,
            lon: data.coord.lon,
          },
          current: {
            timestamp: data.dt * 1000,
            temp: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            weather_description: data.weather[0].description,
            weather_icon: data.weather[0].icon,
            cloud_cover: data.clouds?.all || 0,
            wind_speed: data.wind.speed,
            wind_direction: data.wind.deg,
            visibility: data.visibility / 1000, // Convert to km
            uv_index: data.uvi || 0,
            precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
          },
        } as unknown as T;
      
      case 'forecast':
        return {
          location: {
            name: data.city.name,
            lat: data.city.coord.lat,
            lon: data.city.coord.lon,
          },
          daily: this.processForecastData(data),
        } as unknown as T;
      
      case 'alerts':
        return (data.alerts || []).map((alert: any) => ({
          title: alert.event,
          description: alert.description,
          start: alert.start * 1000,
          end: alert.end * 1000,
          severity: this.mapAlertSeverity(alert.tags),
        })) as unknown as T;
      
      default:
        return data as T;
    }
  }
  
  /**
   * Process forecast data from OpenWeather 5-day forecast
   */
  private processForecastData(data: any): any[] {
    const dailyForecasts: { [key: string]: any } = {};
    
    // Group by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          temps: [],
          icons: [],
          descriptions: [],
          precipitation_chances: [],
          precipitation_amounts: [],
          humidities: [],
          wind_speeds: [],
          wind_directions: [],
        };
      }
      
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].icons.push(item.weather[0].icon);
      dailyForecasts[date].descriptions.push(item.weather[0].description);
      dailyForecasts[date].precipitation_chances.push(item.pop || 0);
      dailyForecasts[date].precipitation_amounts.push(
        item.rain?.['3h'] || item.snow?.['3h'] || 0
      );
      dailyForecasts[date].humidities.push(item.main.humidity);
      dailyForecasts[date].wind_speeds.push(item.wind.speed);
      dailyForecasts[date].wind_directions.push(item.wind.deg);
    });
    
    // Convert to array and calculate averages
    return Object.entries(dailyForecasts).map(([date, stats]) => {
      const temps = stats.temps;
      return {
        date,
        weather_description: this.getMostFrequent(stats.descriptions),
        weather_icon: this.getMostFrequent(stats.icons),
        temp_min: Math.min(...temps),
        temp_max: Math.max(...temps),
        precipitation_chance: this.getAverage(stats.precipitation_chances),
        precipitation_amount: this.getAverage(stats.precipitation_amounts),
        humidity: this.getAverage(stats.humidities),
        wind_speed: this.getAverage(stats.wind_speeds),
        wind_direction: this.getAverage(stats.wind_directions),
        uv_index: 0, // Not available in 5-day forecast
      };
    });
  }
  
  /**
   * Get the most frequent item in an array
   */
  private getMostFrequent(arr: any[]): any {
    return arr.sort((a, b) => 
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }
  
  /**
   * Get the average of an array of numbers
   */
  private getAverage(arr: number[]): number {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
  
  /**
   * Map OpenWeather alert severity
   */
  private mapAlertSeverity(tags: string[]): string {
    if (tags.includes('Extreme') || tags.includes('Severe')) {
      return 'extreme';
    } else if (tags.includes('Moderate')) {
      return 'severe';
    } else {
      return 'moderate';
    }
  }
  
  /**
   * Map error responses to standard error reasons
   */
  private mapErrorReason(error: any): string {
    const status = error.response?.status;
    
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
    
    switch (status) {
      case 401:
        return 'AUTHENTICATION_ERROR';
      case 404:
        return 'RESOURCE_NOT_FOUND';
      case 429:
        return 'RATE_LIMIT_ERROR';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
  
  /**
   * Check the health status of the OpenWeather API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return 'unavailable';
    }
    
    try {
      // Simple health check - just verify we can connect
      const response = await axios.get(
        'https://api.openweathermap.org/data/2.5/weather', 
        { 
          params: {
            lat: 40.7128, // New York City
            lon: -74.0060,
            appid: apiKey,
            units: 'imperial',
          },
          timeout: 5000, // 5 second timeout
        }
      );
      
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (error: any) {
      // Check if it's just an authentication issue or a real service problem
      if (error.response?.status === 401) {
        return 'unavailable'; // API key issue
      } else if (error.response?.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    }
  }
}

/**
 * Weather.gov Provider
 * 
 * Implementation of the US National Weather Service API provider.
 */
export class WeatherGovProvider implements APIProvider {
  name = 'Weather.gov';
  category = APICategory.WEATHER;
  priority = 5;
  
  /**
   * Execute a request to the Weather.gov API
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    try {
      // Weather.gov requires a two-step process:
      // 1. Get the forecast office and grid coordinates
      // 2. Use those to get the actual forecast
      
      const { lat, lon } = request.params || {};
      
      if (!lat || !lon) {
        return {
          success: false,
          error: {
            code: 'missing_coordinates',
            message: 'Latitude and longitude are required',
            reason: 'VALIDATION_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      }
      
      // Step 1: Get metadata for the location
      const metadataUrl = `https://api.weather.gov/points/${lat},${lon}`;
      const metadataResponse = await axios.get(metadataUrl, {
        headers: {
          'User-Agent': '(PADDOCK20, info@gotime.studio)',
        },
      });
      
      const metadata = metadataResponse.data;
      const properties = metadata.properties;
      
      // Step 2: Fetch the appropriate data based on the endpoint
      let data: any;
      
      switch (request.endpoint) {
        case 'current':
          // Fetch stations and then observations
          const stationsUrl = properties.observationStations;
          const stationsResponse = await axios.get(stationsUrl, {
            headers: {
              'User-Agent': '(PADDOCK20, info@gotime.studio)',
            },
          });
          
          // Get the first station
          const station = stationsResponse.data.features[0].id;
          
          // Get current observations
          const observationsUrl = `${station}/observations/latest`;
          const observationsResponse = await axios.get(observationsUrl, {
            headers: {
              'User-Agent': '(PADDOCK20, info@gotime.studio)',
            },
          });
          
          data = this.transformCurrentData<T>(observationsResponse.data, properties);
          break;
          
        case 'forecast':
          // Get forecast data
          const forecastUrl = properties.forecast;
          const forecastResponse = await axios.get(forecastUrl, {
            headers: {
              'User-Agent': '(PADDOCK20, info@gotime.studio)',
            },
          });
          
          data = this.transformForecastData<T>(forecastResponse.data, properties);
          break;
          
        case 'alerts':
          // Get active alerts for the area
          const alertsUrl = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
          const alertsResponse = await axios.get(alertsUrl, {
            headers: {
              'User-Agent': '(PADDOCK20, info@gotime.studio)',
            },
          });
          
          data = this.transformAlertData<T>(alertsResponse.data);
          break;
          
        default:
          throw new Error(`Unsupported endpoint: ${request.endpoint}`);
      }
      
      return {
        success: true,
        data,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('Weather.gov API error:', error);
      
      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'unknown',
          message: error.message || 'Unknown error',
          reason: this.mapErrorReason(error),
          details: error.response?.data,
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Transform current observation data to our standard format
   */
  private transformCurrentData<T>(data: any, metadata: any): T {
    const observation = data.properties;
    
    // Convert temperature from C to F if needed
    const convertTemp = (temp: number | null) => {
      if (temp === null) return null;
      return temp * 9/5 + 32; // Convert C to F
    };
    
    return {
      location: {
        name: metadata.relativeLocation?.properties?.city || 'Unknown',
        lat: parseFloat(data.geometry.coordinates[1]),
        lon: parseFloat(data.geometry.coordinates[0]),
      },
      current: {
        timestamp: new Date(observation.timestamp).getTime(),
        temp: convertTemp(observation.temperature.value) || 0,
        feels_like: convertTemp(observation.windChill.value || observation.heatIndex.value || observation.temperature.value) || 0,
        humidity: observation.relativeHumidity.value || 0,
        pressure: observation.barometricPressure.value ? observation.barometricPressure.value / 100 : 0, // Convert to hPa
        weather_description: observation.textDescription || '',
        weather_icon: this.mapWeatherGovIconToOpenWeather(observation.icon),
        cloud_cover: observation.cloudLayers?.[0]?.amount || 0,
        wind_speed: observation.windSpeed.value ? observation.windSpeed.value * 2.237 : 0, // Convert m/s to mph
        wind_direction: observation.windDirection.value || 0,
        visibility: observation.visibility.value ? observation.visibility.value / 1000 : 0, // Convert to km
        uv_index: 0, // Not provided by Weather.gov
        precipitation: observation.precipitationLastHour?.value || 0,
      },
    } as unknown as T;
  }
  
  /**
   * Transform forecast data to our standard format
   */
  private transformForecastData<T>(data: any, metadata: any): T {
    const forecasts = data.properties.periods;
    
    // Group forecasts by day (weather.gov gives day/night separate entries)
    const dailyForecasts: { [key: string]: any } = {};
    
    forecasts.forEach((forecast: any) => {
      const date = new Date(forecast.startTime).toISOString().split('T')[0];
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temp_min: forecast.temperature,
          temp_max: forecast.temperature,
          weather_description: forecast.shortForecast,
          weather_icon: this.mapWeatherGovIconToOpenWeather(forecast.icon),
          precipitation_chance: this.extractPrecipitationChance(forecast.detailedForecast),
          precipitation_amount: 0, // Not explicitly provided
          humidity: 0, // Not explicitly provided
          wind_speed: this.extractWindSpeed(forecast.windSpeed),
          wind_direction: this.mapWindDirection(forecast.windDirection),
          uv_index: 0, // Not provided
        };
      } else {
        // Update min/max temps
        dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, forecast.temperature);
        dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, forecast.temperature);
      }
    });
    
    return {
      location: {
        name: metadata.relativeLocation?.properties?.city || 'Unknown',
        lat: metadata.relativeLocation?.geometry.coordinates[1] || 0,
        lon: metadata.relativeLocation?.geometry.coordinates[0] || 0,
      },
      daily: Object.values(dailyForecasts),
    } as unknown as T;
  }
  
  /**
   * Transform alert data to our standard format
   */
  private transformAlertData<T>(data: any): T {
    const alerts = data.features || [];
    
    return alerts.map((alert: any) => {
      const props = alert.properties;
      return {
        title: props.event,
        description: props.description,
        start: new Date(props.effective).getTime(),
        end: new Date(props.expires).getTime(),
        severity: this.mapAlertSeverity(props.severity),
      };
    }) as unknown as T;
  }
  
  /**
   * Map Weather.gov icon URLs to OpenWeather icon codes
   */
  private mapWeatherGovIconToOpenWeather(iconUrl: string | null): string {
    if (!iconUrl) return '01d'; // Default to clear day
    
    if (iconUrl.includes('skc')) return '01d'; // Clear
    if (iconUrl.includes('few')) return '02d'; // Few clouds
    if (iconUrl.includes('sct')) return '03d'; // Scattered clouds
    if (iconUrl.includes('bkn')) return '04d'; // Broken clouds
    if (iconUrl.includes('ovc')) return '04d'; // Overcast
    if (iconUrl.includes('rain') || iconUrl.includes('ra')) return '10d'; // Rain
    if (iconUrl.includes('snow') || iconUrl.includes('sn')) return '13d'; // Snow
    if (iconUrl.includes('sleet')) return '13d'; // Sleet
    if (iconUrl.includes('fzra')) return '09d'; // Freezing rain
    if (iconUrl.includes('fog') || iconUrl.includes('fg')) return '50d'; // Fog
    if (iconUrl.includes('wind')) return '01d'; // Wind
    if (iconUrl.includes('tsra')) return '11d'; // Thunderstorm
    
    return '01d'; // Default
  }
  
  /**
   * Extract precipitation chance from detailed forecast text
   */
  private extractPrecipitationChance(text: string): number {
    if (!text) return 0;
    
    const match = text.match(/Chance of precipitation is (\d+)%/);
    if (match && match[1]) {
      return parseInt(match[1], 10) / 100;
    }
    
    // Alternative search patterns
    if (text.includes('likely') || text.includes('probable')) {
      return 0.7;
    } else if (text.includes('chance') || text.includes('possible')) {
      return 0.4;
    } else if (text.includes('slight chance')) {
      return 0.2;
    }
    
    return 0;
  }
  
  /**
   * Extract wind speed in mph from text
   */
  private extractWindSpeed(text: string): number {
    if (!text) return 0;
    
    const match = text.match(/(\d+)(?:\s+to\s+(\d+))?\s+mph/);
    if (match) {
      if (match[2]) {
        // Range given, take average
        return (parseInt(match[1], 10) + parseInt(match[2], 10)) / 2;
      } else {
        return parseInt(match[1], 10);
      }
    }
    
    return 0;
  }
  
  /**
   * Map cardinal wind direction to degrees
   */
  private mapWindDirection(direction: string): number {
    const directions: { [key: string]: number } = {
      'N': 0,
      'NNE': 22.5,
      'NE': 45,
      'ENE': 67.5,
      'E': 90,
      'ESE': 112.5,
      'SE': 135,
      'SSE': 157.5,
      'S': 180,
      'SSW': 202.5,
      'SW': 225,
      'WSW': 247.5,
      'W': 270,
      'WNW': 292.5,
      'NW': 315,
      'NNW': 337.5,
    };
    
    return directions[direction] || 0;
  }
  
  /**
   * Map Weather.gov alert severity to standardized format
   */
  private mapAlertSeverity(severity: string): string {
    switch (severity) {
      case 'Extreme':
        return 'extreme';
      case 'Severe':
        return 'severe';
      case 'Moderate':
        return 'moderate';
      case 'Minor':
      case 'Unknown':
      default:
        return 'minor';
    }
  }
  
  /**
   * Map error responses to standard error reasons
   */
  private mapErrorReason(error: any): string {
    const status = error.response?.status;
    
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
    
    switch (status) {
      case 403:
        return 'AUTHENTICATION_ERROR';
      case 404:
        return 'RESOURCE_NOT_FOUND';
      case 429:
        return 'RATE_LIMIT_ERROR';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
  
  /**
   * Check the health status of the Weather.gov API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Simple health check - just verify we can connect
      const response = await axios.get(
        'https://api.weather.gov/stations', 
        {
          params: {
            limit: 1,
          },
          headers: {
            'User-Agent': '(PADDOCK20, info@gotime.studio)',
          },
          timeout: 5000, // 5 second timeout
        }
      );
      
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (error: any) {
      // Check if it's just an rate limiting or a real service problem
      if (error.response?.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    }
  }
}

/**
 * Register all weather providers with the API Data Warehouse
 */
export function registerWeatherProviders(warehouse: any): void {
  // Register OpenWeather provider
  const openWeatherProvider = new OpenWeatherProvider();
  warehouse.registerProvider(APICategory.WEATHER, openWeatherProvider, 10);
  
  // Register Weather.gov provider
  const weatherGovProvider = new WeatherGovProvider();
  warehouse.registerProvider(APICategory.WEATHER, weatherGovProvider, 5);
  
  console.log(`Registered weather providers: ${openWeatherProvider.name}, ${weatherGovProvider.name}`);
}
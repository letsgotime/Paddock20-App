/**
 * Weather API Providers
 * 
 * Implements API providers for weather-related services:
 * - Current weather
 * - Weather forecasts
 * - Weather alerts
 * - Historical weather data
 */

import { APIDataWarehouseCore } from '../core';
import { 
  APICategory, 
  APIProvider, 
  APIRequest, 
  APIResponse, 
  WeatherData 
} from '../types';

// OpenWeather API Provider
export class OpenWeatherProvider implements APIProvider {
  name: string = 'OpenWeather';
  category: APICategory;
  priority: number = 0;
  defaultCacheTTL: number = 30 * 60 * 1000; // 30 minutes
  timeout: number = 10000; // 10 seconds
  
  // Rate limiting properties
  rateLimitPerMinute: number = 60; // Default for free tier
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  constructor(category: APICategory, priority: number = 10) {
    this.category = category;
    this.priority = priority;
  }
  
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    // Get API key from core
    const apiKey = (request.params?.apiKey as string) || 
                   this.getAPIKey('OPENWEATHER');
    
    if (!apiKey) {
      throw new Error('OpenWeather API key is required');
    }
    
    // Check rate limiting
    if (this.shouldThrottle()) {
      throw new Error(`Rate limit exceeded for ${this.name}`);
    }
    
    // Track this request for rate limiting
    this.trackRequest();
    
    try {
      // Build URL based on category and endpoint
      let endpoint = request.endpoint;
      if (!endpoint) {
        switch (this.category) {
          case APICategory.WEATHER:
            endpoint = 'weather';
            break;
          case APICategory.WEATHER_FORECAST:
            endpoint = 'forecast';
            break;
          case APICategory.WEATHER_ALERTS:
            endpoint = 'onecall';
            break;
          case APICategory.WEATHER_HISTORICAL:
            endpoint = 'onecall/timemachine';
            break;
          default:
            throw new Error(`Unsupported API category: ${this.category}`);
        }
      }
      
      // Build full URL with base and query params
      const baseUrl = 'https://api.openweathermap.org/data/2.5';
      const url = new URL(`${baseUrl}/${endpoint}`);
      
      // Add API key
      url.searchParams.append('appid', apiKey);
      
      // Add imperial/metric units (default to imperial)
      url.searchParams.append('units', request.params?.units || 'imperial');
      
      // Add all other parameters
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          if (key !== 'apiKey' && key !== 'units') {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      // Execute the request
      const response = await fetch(url.toString(), {
        headers: request.headers || {},
        signal: AbortSignal.timeout(
          request.timeout || this.timeout
        ),
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} - ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Transform the response to our standard format
      const transformedData = this.transformWeatherData(data);
      
      return {
        data: transformedData as any as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`OpenWeather API error:`, error);
      throw error;
    }
  }
  
  // Transform OpenWeather data to our standardized WeatherData format
  private transformWeatherData(data: any): WeatherData {
    // Current weather endpoint
    if (data.main && data.weather) {
      return {
        location: {
          name: data.name || 'Unknown',
          lat: data.coord?.lat || 0,
          lon: data.coord?.lon || 0,
          country: data.sys?.country || '',
          timezone: 'UTC', // OpenWeather doesn't provide timezone in current weather endpoint
        },
        current: {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind_speed: data.wind?.speed || 0,
          wind_direction: data.wind?.deg || 0,
          weather_description: data.weather[0]?.description || '',
          weather_icon: data.weather[0]?.icon || '',
          cloud_cover: data.clouds?.all || 0,
          visibility: data.visibility ? data.visibility / 1000 : 0, // Convert to km
          uv_index: 0, // Not provided in this endpoint
          precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
          timestamp: data.dt ? data.dt * 1000 : Date.now(),
        },
        source: this.name,
      };
    }
    
    // Forecast endpoint
    if (data.list && Array.isArray(data.list)) {
      // Extract location from city
      const location = {
        name: data.city?.name || 'Unknown',
        lat: data.city?.coord?.lat || 0,
        lon: data.city?.coord?.lon || 0,
        country: data.city?.country || '',
        timezone: 'UTC', // OpenWeather doesn't provide timezone in forecast endpoint
      };
      
      // Use first item for current conditions
      const current = data.list[0] || {};
      
      // Create standardized daily forecast
      const daily = data.list
        .filter((item: any, index: number) => index % 8 === 0) // One item per day (3-hour intervals)
        .map((item: any) => ({
          date: new Date(item.dt * 1000).toISOString(),
          temp_min: item.main?.temp_min || 0,
          temp_max: item.main?.temp_max || 0,
          weather_description: item.weather?.[0]?.description || '',
          weather_icon: item.weather?.[0]?.icon || '',
          precipitation_chance: item.pop ? item.pop * 100 : 0,
          sunrise: data.city?.sunrise ? data.city.sunrise * 1000 : 0,
          sunset: data.city?.sunset ? data.city.sunset * 1000 : 0,
        }));
      
      // Create standardized hourly forecast
      const hourly = data.list.slice(0, 24).map((item: any) => ({
        timestamp: item.dt * 1000,
        temp: item.main?.temp || 0,
        feels_like: item.main?.feels_like || 0,
        weather_description: item.weather?.[0]?.description || '',
        weather_icon: item.weather?.[0]?.icon || '',
        precipitation_chance: item.pop ? item.pop * 100 : 0,
        humidity: item.main?.humidity || 0,
        wind_speed: item.wind?.speed || 0,
      }));
      
      return {
        location,
        current: {
          temp: current.main?.temp || 0,
          feels_like: current.main?.feels_like || 0,
          humidity: current.main?.humidity || 0,
          pressure: current.main?.pressure || 0,
          wind_speed: current.wind?.speed || 0,
          wind_direction: current.wind?.deg || 0,
          weather_description: current.weather?.[0]?.description || '',
          weather_icon: current.weather?.[0]?.icon || '',
          cloud_cover: current.clouds?.all || 0,
          visibility: current.visibility ? current.visibility / 1000 : 0,
          uv_index: 0, // Not provided in this endpoint
          precipitation: current.rain?.['3h'] ? current.rain['3h'] / 3 : 0, // Convert 3h to 1h
          timestamp: current.dt ? current.dt * 1000 : Date.now(),
        },
        daily,
        hourly,
        source: this.name,
      };
    }
    
    // OneCall endpoint (for alerts and more complete data)
    if (data.current && data.lat && data.lon) {
      // Extract alerts if present
      const alerts = data.alerts ? data.alerts.map((alert: any) => ({
        title: alert.event || 'Weather Alert',
        description: alert.description || '',
        severity: this.mapAlertSeverity(alert.event),
        start: alert.start * 1000,
        end: alert.end * 1000,
        source: alert.sender_name || this.name,
      })) : undefined;
      
      // Create standardized daily forecast
      const daily = data.daily ? data.daily.map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString(),
        temp_min: day.temp?.min || 0,
        temp_max: day.temp?.max || 0,
        weather_description: day.weather?.[0]?.description || '',
        weather_icon: day.weather?.[0]?.icon || '',
        precipitation_chance: day.pop ? day.pop * 100 : 0,
        sunrise: day.sunrise ? day.sunrise * 1000 : 0,
        sunset: day.sunset ? day.sunset * 1000 : 0,
      })) : undefined;
      
      // Create standardized hourly forecast
      const hourly = data.hourly ? data.hourly.map((hour: any) => ({
        timestamp: hour.dt * 1000,
        temp: hour.temp || 0,
        feels_like: hour.feels_like || 0,
        weather_description: hour.weather?.[0]?.description || '',
        weather_icon: hour.weather?.[0]?.icon || '',
        precipitation_chance: hour.pop ? hour.pop * 100 : 0,
        humidity: hour.humidity || 0,
        wind_speed: hour.wind_speed || 0,
      })) : undefined;
      
      return {
        location: {
          name: '', // OneCall doesn't provide location name
          lat: data.lat,
          lon: data.lon,
          country: '', // Not provided
          timezone: data.timezone || 'UTC',
        },
        current: {
          temp: data.current.temp,
          feels_like: data.current.feels_like,
          humidity: data.current.humidity,
          pressure: data.current.pressure,
          wind_speed: data.current.wind_speed,
          wind_direction: data.current.wind_deg,
          weather_description: data.current.weather?.[0]?.description || '',
          weather_icon: data.current.weather?.[0]?.icon || '',
          cloud_cover: data.current.clouds || 0,
          visibility: data.current.visibility ? data.current.visibility / 1000 : 0,
          uv_index: data.current.uvi || 0,
          precipitation: data.current.rain?.['1h'] || data.current.snow?.['1h'] || 0,
          timestamp: data.current.dt * 1000,
        },
        daily,
        hourly,
        alerts,
        source: this.name,
      };
    }
    
    // If data didn't match any expected format
    console.warn('Unknown OpenWeather API response format:', data);
    
    // Return minimal default data structure
    return {
      location: {
        name: 'Unknown',
        lat: 0,
        lon: 0,
        country: '',
        timezone: 'UTC',
      },
      current: {
        temp: 0,
        feels_like: 0,
        humidity: 0,
        pressure: 0,
        wind_speed: 0,
        wind_direction: 0,
        weather_description: 'Unknown',
        weather_icon: '',
        cloud_cover: 0,
        visibility: 0,
        uv_index: 0,
        precipitation: 0,
        timestamp: Date.now(),
      },
      source: this.name,
    };
  }
  
  // Helper to map alert event to severity
  private mapAlertSeverity(event: string): string {
    const event_lower = event.toLowerCase();
    
    if (event_lower.includes('extreme') || 
        event_lower.includes('severe') || 
        event_lower.includes('tornado') ||
        event_lower.includes('hurricane')) {
      return 'extreme';
    }
    
    if (event_lower.includes('warning')) {
      return 'warning';
    }
    
    if (event_lower.includes('watch')) {
      return 'watch';
    }
    
    if (event_lower.includes('advisory')) {
      return 'advisory';
    }
    
    return 'notice';
  }
  
  // Get API key with proper fallbacks
  private getAPIKey(service: string): string | null {
    // Check environment variables
    // @ts-ignore: Environment variable access
    const envKey = (import.meta.env as any)[`VITE_${service}_API_KEY`];
    if (envKey) return envKey;
    
    // Check localStorage
    try {
      const storageKey = localStorage.getItem(`${service.toLowerCase()}_api_key`);
      if (storageKey) return storageKey;
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return null;
  }
  
  // Rate limiting: check if we should throttle this request
  private shouldThrottle(): boolean {
    const now = Date.now();
    const minuteElapsed = (now - this.lastRequestTime) > 60000;
    
    if (minuteElapsed) {
      // Reset counter after a minute has passed
      this.requestsThisMinute = 0;
      return false;
    }
    
    return this.requestsThisMinute >= this.rateLimitPerMinute;
  }
  
  // Rate limiting: track this request
  private trackRequest(): void {
    const now = Date.now();
    const minuteElapsed = (now - this.lastRequestTime) > 60000;
    
    if (minuteElapsed) {
      this.requestsThisMinute = 1;
    } else {
      this.requestsThisMinute++;
    }
    
    this.lastRequestTime = now;
  }
  
  // Health check
  async getHealthStatus(): Promise<'healthy' | 'degraded' | 'unavailable' | 'unknown'> {
    const apiKey = this.getAPIKey('OPENWEATHER');
    
    if (!apiKey) {
      return 'unavailable';
    }
    
    try {
      // Make a lightweight test request
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=40.7128&lon=-74.006&appid=${apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    } catch (error) {
      return 'unavailable';
    }
  }
}

// Weather.gov (National Weather Service) Provider - Free, no API key required
export class WeatherGovProvider implements APIProvider {
  name: string = 'Weather.gov (NWS)';
  category: APICategory;
  priority: number = 0;
  defaultCacheTTL: number = 60 * 60 * 1000; // 1 hour (NWS data updates less frequently)
  timeout: number = 15000; // 15 seconds (NWS API can be slower)
  
  // Rate limiting properties - NWS recommends no more than 2 requests/second
  rateLimitPerMinute: number = 120;
  private lastRequestTime: number = 0;
  private requestsThisMinute: number = 0;
  
  constructor(category: APICategory, priority: number = 5) {
    this.category = category;
    this.priority = priority;
  }
  
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    // Check rate limiting
    if (this.shouldThrottle()) {
      throw new Error(`Rate limit exceeded for ${this.name}`);
    }
    
    // Track this request for rate limiting
    this.trackRequest();
    
    // For Weather.gov, we need geographical coordinates
    const lat = request.params?.lat;
    const lon = request.params?.lon;
    
    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required for Weather.gov API');
    }
    
    try {
      // Weather.gov requires a two-step process:
      // 1. Get the forecast grid point from coordinates
      // 2. Use the grid point to get actual forecast/data
      
      // Step 1: Get grid point
      const gridpointResponse = await fetch(
        `https://api.weather.gov/points/${lat},${lon}`,
        {
          headers: {
            "User-Agent": "PADDOCK20 Weather (paddock20@example.com)",
            ...request.headers
          },
          signal: AbortSignal.timeout(
            request.timeout || this.timeout
          ),
        }
      );
      
      if (!gridpointResponse.ok) {
        throw new Error(`Weather.gov API error: ${gridpointResponse.status} - ${gridpointResponse.statusText}`);
      }
      
      const gridpointData = await gridpointResponse.json();
      
      // Get the various endpoint URLs from the response
      const forecastUrl = gridpointData.properties.forecast;
      const forecastHourlyUrl = gridpointData.properties.forecastHourly;
      const stationUrl = gridpointData.properties.observationStations;
      
      // Step 2: Get the appropriate data based on the category
      let url;
      
      switch (this.category) {
        case APICategory.WEATHER:
          // For current weather, we need to get the nearest observation station
          // and then get its latest observation
          const stationsResponse = await fetch(stationUrl, {
            headers: {
              "User-Agent": "PADDOCK20 Weather (paddock20@example.com)",
              ...request.headers
            }
          });
          
          if (!stationsResponse.ok) {
            throw new Error(`Weather.gov Stations API error: ${stationsResponse.status}`);
          }
          
          const stationsData = await stationsResponse.json();
          
          // Get the first/nearest station
          if (!stationsData.features || !stationsData.features.length) {
            throw new Error('No observation stations found');
          }
          
          const nearestStation = stationsData.features[0].id;
          url = `${nearestStation}/observations/latest`;
          break;
          
        case APICategory.WEATHER_FORECAST:
          url = forecastUrl;
          break;
          
        case APICategory.WEATHER_ALERTS:
          url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
          break;
          
        default:
          throw new Error(`Unsupported API category: ${this.category}`);
      }
      
      // Make the final request
      const dataResponse = await fetch(url, {
        headers: {
          "User-Agent": "PADDOCK20 Weather (paddock20@example.com)",
          ...request.headers
        },
        signal: AbortSignal.timeout(
          request.timeout || this.timeout
        ),
      });
      
      if (!dataResponse.ok) {
        throw new Error(`Weather.gov Data API error: ${dataResponse.status}`);
      }
      
      const data = await dataResponse.json();
      
      // Transform the response to our standard format
      const transformedData = this.transformWeatherData(data, gridpointData);
      
      return {
        data: transformedData as any as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Weather.gov API error:`, error);
      throw error;
    }
  }
  
  // Transform Weather.gov data to our standardized WeatherData format
  private transformWeatherData(data: any, gridData: any): WeatherData {
    // Location data from grid point data
    const location = {
      name: gridData.properties?.relativeLocation?.properties?.city || 'Unknown',
      lat: gridData.geometry?.coordinates?.[1] || 0,
      lon: gridData.geometry?.coordinates?.[0] || 0,
      country: 'US', // Weather.gov only covers US
      timezone: gridData.properties?.timeZone || 'America/New_York',
    };
    
    // For observation data (current weather)
    if (data.properties?.temperature) {
      const props = data.properties;
      
      // Convert temperature from C to F if units are imperial
      const tempC = props.temperature.value || 0;
      const temp = this.celsiusToFahrenheit(tempC);
      
      // Convert feels like from C to F
      const feelsLikeC = props.windChill?.value !== null ? props.windChill.value : 
                         props.heatIndex?.value !== null ? props.heatIndex.value : tempC;
      const feelsLike = this.celsiusToFahrenheit(feelsLikeC);
      
      // Convert wind speed from m/s to mph
      const windSpeedMps = props.windSpeed?.value || 0;
      const windSpeed = windSpeedMps * 2.237;
      
      return {
        location,
        current: {
          temp,
          feels_like: feelsLike,
          humidity: props.relativeHumidity?.value || 0,
          pressure: props.barometricPressure?.value ? props.barometricPressure.value / 100 : 1013.25, // Convert Pa to hPa
          wind_speed: windSpeed,
          wind_direction: props.windDirection?.value || 0,
          weather_description: props.textDescription || '',
          weather_icon: this.mapIconFromWeatherGov(props.icon),
          cloud_cover: props.cloudLayers?.[0]?.amount === 'OVC' ? 100 : 
                      props.cloudLayers?.[0]?.amount === 'BKN' ? 75 :
                      props.cloudLayers?.[0]?.amount === 'SCT' ? 50 :
                      props.cloudLayers?.[0]?.amount === 'FEW' ? 25 : 0,
          visibility: props.visibility?.value ? props.visibility.value / 1000 : 10, // Convert m to km
          uv_index: 0, // Not provided
          precipitation: props.precipitationLastHour?.value || 0,
          timestamp: new Date(props.timestamp).getTime(),
        },
        source: this.name,
      };
    }
    
    // For forecast data
    if (data.properties?.periods && Array.isArray(data.properties.periods)) {
      const periods = data.properties.periods;
      const currentPeriod = periods[0] || {};
      
      // Create daily forecast
      const daily = periods.map(period => ({
        date: new Date(period.startTime).toISOString(),
        temp_min: period.isDaytime ? null : period.temperature,
        temp_max: period.isDaytime ? period.temperature : null,
        weather_description: period.shortForecast,
        weather_icon: this.mapIconFromWeatherGov(period.icon),
        precipitation_chance: period.probabilityOfPrecipitation?.value || 0,
        sunrise: 0, // Not provided
        sunset: 0, // Not provided
      }));
      
      // Fill in missing min/max temps by pairing day/night
      for (let i = 0; i < daily.length - 1; i++) {
        if (daily[i].temp_max && !daily[i].temp_min && daily[i+1]?.temp_min) {
          daily[i].temp_min = daily[i+1].temp_min;
        }
        if (!daily[i].temp_max && daily[i].temp_min && daily[i-1]?.temp_max) {
          daily[i].temp_max = daily[i-1].temp_max;
        }
      }
      
      return {
        location,
        current: {
          temp: currentPeriod.temperature || 0,
          feels_like: currentPeriod.temperature || 0, // Not provided in forecast
          humidity: 0, // Not provided in forecast
          pressure: 0, // Not provided in forecast
          wind_speed: currentPeriod.windSpeed ? this.parseWindSpeed(currentPeriod.windSpeed) : 0,
          wind_direction: currentPeriod.windDirection ? this.parseWindDirection(currentPeriod.windDirection) : 0,
          weather_description: currentPeriod.shortForecast || '',
          weather_icon: this.mapIconFromWeatherGov(currentPeriod.icon),
          cloud_cover: 0, // Not provided in forecast
          visibility: 0, // Not provided in forecast
          uv_index: 0, // Not provided in forecast
          precipitation: 0, // Not provided in forecast
          timestamp: new Date(currentPeriod.startTime).getTime(),
        },
        daily,
        source: this.name,
      };
    }
    
    // For alerts data
    if (data.features && Array.isArray(data.features)) {
      // Create alerts array
      const alerts = data.features.map((feature: any) => ({
        title: feature.properties?.headline || 'Weather Alert',
        description: feature.properties?.description || '',
        severity: feature.properties?.severity?.toLowerCase() || 'notice',
        start: new Date(feature.properties?.effective).getTime(),
        end: new Date(feature.properties?.expires).getTime(),
        source: feature.properties?.senderName || this.name,
      }));
      
      // For alerts only, we need minimal weather data
      return {
        location,
        current: {
          temp: 0,
          feels_like: 0,
          humidity: 0,
          pressure: 0,
          wind_speed: 0,
          wind_direction: 0,
          weather_description: alerts.length > 0 ? alerts[0].title : 'Unknown',
          weather_icon: '',
          cloud_cover: 0,
          visibility: 0,
          uv_index: 0,
          precipitation: 0,
          timestamp: Date.now(),
        },
        alerts,
        source: this.name,
      };
    }
    
    // If data didn't match any expected format
    console.warn('Unknown Weather.gov API response format:', data);
    
    // Return minimal default data structure
    return {
      location,
      current: {
        temp: 0,
        feels_like: 0,
        humidity: 0,
        pressure: 0,
        wind_speed: 0,
        wind_direction: 0,
        weather_description: 'Unknown',
        weather_icon: '',
        cloud_cover: 0,
        visibility: 0,
        uv_index: 0,
        precipitation: 0,
        timestamp: Date.now(),
      },
      source: this.name,
    };
  }
  
  // Helper: Convert Celsius to Fahrenheit
  private celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }
  
  // Helper: Extract wind speed from string like "10 mph"
  private parseWindSpeed(windSpeedStr: string): number {
    const match = windSpeedStr.match(/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  }
  
  // Helper: Convert cardinal direction to degrees
  private parseWindDirection(direction: string): number {
    const directions: Record<string, number> = {
      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    
    return directions[direction] || 0;
  }
  
  // Helper: Map Weather.gov icon URL to standardized icon code
  private mapIconFromWeatherGov(iconUrl: string = ''): string {
    if (!iconUrl) return '';
    
    // Extract time of day from URL
    const isDay = !iconUrl.includes('/night/');
    const daySuffix = isDay ? 'd' : 'n';
    
    // Map icon based on URL patterns
    if (iconUrl.includes('skc')) return `01${daySuffix}`; // Clear sky
    if (iconUrl.includes('few')) return `02${daySuffix}`; // Few clouds
    if (iconUrl.includes('sct')) return `03${daySuffix}`; // Scattered clouds
    if (iconUrl.includes('bkn')) return `04${daySuffix}`; // Broken clouds
    if (iconUrl.includes('ovc')) return `04${daySuffix}`; // Overcast
    
    if (iconUrl.includes('rain_showers')) return `09${daySuffix}`; // Showers
    if (iconUrl.includes('rain')) return `10${daySuffix}`; // Rain
    
    if (iconUrl.includes('tsra')) return `11${daySuffix}`; // Thunderstorm
    
    if (iconUrl.includes('snow')) return `13${daySuffix}`; // Snow
    if (iconUrl.includes('sleet')) return `13${daySuffix}`; // Sleet
    if (iconUrl.includes('fzra')) return `13${daySuffix}`; // Freezing rain
    
    if (iconUrl.includes('fog')) return `50${daySuffix}`; // Fog
    
    // Default
    return isDay ? '01d' : '01n';
  }
  
  // Rate limiting: check if we should throttle this request
  private shouldThrottle(): boolean {
    const now = Date.now();
    const minuteElapsed = (now - this.lastRequestTime) > 60000;
    
    if (minuteElapsed) {
      // Reset counter after a minute has passed
      this.requestsThisMinute = 0;
      return false;
    }
    
    return this.requestsThisMinute >= this.rateLimitPerMinute;
  }
  
  // Rate limiting: track this request
  private trackRequest(): void {
    const now = Date.now();
    const minuteElapsed = (now - this.lastRequestTime) > 60000;
    
    if (minuteElapsed) {
      this.requestsThisMinute = 1;
    } else {
      this.requestsThisMinute++;
    }
    
    this.lastRequestTime = now;
  }
  
  // Health check
  async getHealthStatus(): Promise<'healthy' | 'degraded' | 'unavailable' | 'unknown'> {
    try {
      // Make a lightweight test request
      const response = await fetch(
        'https://api.weather.gov/points/40.7128,-74.006',
        { 
          headers: { "User-Agent": "PADDOCK20 Weather (paddock20@example.com)" },
          signal: AbortSignal.timeout(5000) 
        }
      );
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else {
        return 'unavailable';
      }
    } catch (error) {
      return 'unavailable';
    }
  }
}

/**
 * Register all weather-related providers with the API Data Warehouse
 * @param core API Data Warehouse core instance
 */
export function registerWeatherProviders(core: APIDataWarehouseCore): void {
  // Register providers for current weather
  core.registerProvider(
    APICategory.WEATHER,
    new OpenWeatherProvider(APICategory.WEATHER, 10) // Primary provider
  );
  
  core.registerProvider(
    APICategory.WEATHER,
    new WeatherGovProvider(APICategory.WEATHER, 5) // Secondary provider
  );
  
  // Register providers for weather forecasts
  core.registerProvider(
    APICategory.WEATHER_FORECAST,
    new OpenWeatherProvider(APICategory.WEATHER_FORECAST, 10) // Primary provider
  );
  
  core.registerProvider(
    APICategory.WEATHER_FORECAST,
    new WeatherGovProvider(APICategory.WEATHER_FORECAST, 5) // Secondary provider
  );
  
  // Register provider for weather alerts
  core.registerProvider(
    APICategory.WEATHER_ALERTS,
    new OpenWeatherProvider(APICategory.WEATHER_ALERTS, 10) // Primary provider
  );
  
  core.registerProvider(
    APICategory.WEATHER_ALERTS,
    new WeatherGovProvider(APICategory.WEATHER_ALERTS, 5) // Secondary provider
  );
  
  // Register provider for historical weather data
  core.registerProvider(
    APICategory.WEATHER_HISTORICAL,
    new OpenWeatherProvider(APICategory.WEATHER_HISTORICAL, 10) // Only OpenWeather supports historical
  );
}
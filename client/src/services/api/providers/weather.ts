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

/**
 * OpenWeather API Provider
 * Provider for OpenWeatherMap API (https://openweathermap.org/api)
 * 
 * Capabilities:
 * - Current weather
 * - Forecast (5 day / 3 hour)
 * - Historical weather
 */
export class OpenWeatherProvider implements APIProvider {
  name = 'OpenWeatherMap';
  category = APICategory.WEATHER;
  priority = 10; // Highest priority weather provider
  
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  }
  
  /**
   * Execute a weather API request
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    const { endpoint, params } = request;
    
    // Check if we have an API key
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          code: 'no_api_key',
          message: 'No OpenWeather API key available',
          reason: 'AUTH_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
    
    try {
      // Determine which endpoint to use
      let url = '';
      let queryParams: Record<string, any> = {
        ...params,
        appid: this.apiKey,
      };
      
      switch (endpoint) {
        case 'current':
          url = `${this.baseUrl}/weather`;
          break;
        case 'forecast':
          url = `${this.baseUrl}/forecast`;
          break;
        case 'onecall':
          url = `${this.baseUrl}/onecall`;
          break;
        default:
          url = `${this.baseUrl}/weather`; // Default to current weather
      }
      
      // Convert from internal format to OpenWeather format
      if (params?.lat !== undefined && params?.lon !== undefined) {
        queryParams.lat = params.lat;
        queryParams.lon = params.lon;
      } else if (params?.city) {
        queryParams.q = params.city;
      }
      
      if (params?.units) {
        queryParams.units = params.units; // 'metric', 'imperial'
      }
      
      // Build URL with query parameters
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      const fullUrl = `${url}?${queryString}`;
      
      // Execute request
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Handle errors
      if (!response.ok) {
        const errorText = await response.text();
        let reason = 'API_ERROR';
        
        if (response.status === 401) {
          reason = 'AUTH_ERROR';
        } else if (response.status === 429) {
          reason = 'RATE_LIMIT';
        } else if (response.status >= 500) {
          reason = 'API_ERROR';
        }
        
        return {
          success: false,
          error: {
            code: `openweather_${response.status}`,
            message: `OpenWeather API error: ${errorText}`,
            reason: reason as any,
          },
          fromCache: false,
          provider: this.name,
        };
      }
      
      // Parse response
      const data = await response.json();
      
      // Transform to standard format if needed
      let transformedData: any;
      
      if (endpoint === 'current') {
        transformedData = this.transformCurrentWeather(data);
      } else if (endpoint === 'forecast') {
        transformedData = this.transformForecast(data);
      } else {
        transformedData = data; // Use as-is
      }
      
      // Return success response
      return {
        success: true,
        data: transformedData as T,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('OpenWeatherMap provider error:', error);
      
      return {
        success: false,
        error: {
          code: 'openweather_error',
          message: `OpenWeather API error: ${error instanceof Error ? error.message : String(error)}`,
          reason: 'UNKNOWN_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Check the health status of the OpenWeather API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Use a simple API call to check health
      const response = await fetch(`${this.baseUrl}/weather?q=London&appid=${this.apiKey}`);
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else if (response.status === 401) {
        return 'unavailable'; // Authentication issues
      } else {
        return 'degraded'; // Other issues
      }
    } catch (error) {
      console.error('OpenWeather health check error:', error);
      return 'unavailable';
    }
  }
  
  /**
   * Transform OpenWeather current weather to standardized format
   */
  private transformCurrentWeather(data: any): any {
    if (!data) return null;
    
    return {
      location: {
        lat: data.coord?.lat,
        lon: data.coord?.lon,
        name: data.name,
        timezone: null, // Not provided in current weather
      },
      current: {
        timestamp: data.dt * 1000,
        temp: data.main?.temp,
        feels_like: data.main?.feels_like,
        humidity: data.main?.humidity,
        pressure: data.main?.pressure,
        weather_description: data.weather?.[0]?.description || 'Unknown',
        weather_icon: data.weather?.[0]?.icon || '01d',
        cloud_cover: data.clouds?.all || 0,
        wind_speed: data.wind?.speed || 0,
        wind_direction: data.wind?.deg || 0,
        visibility: (data.visibility || 10000) / 1000, // Convert m to km
        uv_index: 0, // Not provided in current weather
        precipitation: data.rain?.['1h'] || data.rain?.['3h'] || 0,
      }
    };
  }
  
  /**
   * Transform OpenWeather forecast to standardized format
   */
  private transformForecast(data: any): any {
    if (!data || !data.list) return null;
    
    // Organize forecast data by day
    const forecastsByDay = new Map<string, any[]>();
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0];
      
      if (!forecastsByDay.has(dayKey)) {
        forecastsByDay.set(dayKey, []);
      }
      
      forecastsByDay.get(dayKey)!.push(item);
    });
    
    // Create daily summary for each day
    const dailyForecasts = Array.from(forecastsByDay.entries()).map(([date, items]) => {
      // Find min/max temperatures
      const temps = items.map(item => item.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      
      // Get primary weather condition for the day (most frequent)
      const weatherCounts = new Map<string, number>();
      items.forEach(item => {
        const weather = item.weather[0]?.main || 'Unknown';
        weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
      });
      
      let primaryWeather = items[0].weather[0];
      let maxCount = 0;
      
      for (const [weather, count] of weatherCounts.entries()) {
        if (count > maxCount) {
          const matchingItem = items.find(item => item.weather[0]?.main === weather);
          if (matchingItem) {
            primaryWeather = matchingItem.weather[0];
            maxCount = count;
          }
        }
      }
      
      // Calculate average values
      const avgHumidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;
      const avgWindSpeed = items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length;
      const avgWindDirection = items.reduce((sum, item) => sum + item.wind.deg, 0) / items.length;
      
      // Calculate precipitation chance and amount
      const precipitationItems = items.filter(item => item.pop > 0 || item.rain);
      const precipitationChance = precipitationItems.length > 0
        ? items.reduce((sum, item) => sum + (item.pop || 0), 0) / items.length * 100
        : 0;
      
      const precipitationAmount = precipitationItems.reduce((sum, item) => {
        return sum + (item.rain?.['3h'] || 0);
      }, 0);
      
      // Use sunrise/sunset if available (from city data)
      let sunrise = null;
      let sunset = null;
      
      if (data.city && date === new Date().toISOString().split('T')[0]) {
        sunrise = data.city.sunrise * 1000;
        sunset = data.city.sunset * 1000;
      }
      
      return {
        date,
        weather_description: primaryWeather?.description || 'Unknown',
        weather_icon: primaryWeather?.icon || '01d',
        temp_min: minTemp,
        temp_max: maxTemp,
        precipitation_chance: precipitationChance,
        precipitation_amount: precipitationAmount,
        humidity: avgHumidity,
        wind_speed: avgWindSpeed,
        wind_direction: avgWindDirection,
        uv_index: 0, // Not provided in forecast
        sunrise,
        sunset,
      };
    });
    
    return {
      location: {
        lat: data.city?.coord?.lat,
        lon: data.city?.coord?.lon,
        name: data.city?.name,
        timezone: null, // Not directly provided
      },
      daily: dailyForecasts,
      hourly: data.list.map((item: any) => ({
        timestamp: item.dt * 1000,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        weather_description: item.weather[0]?.description || 'Unknown',
        weather_icon: item.weather[0]?.icon || '01d',
        precipitation_chance: (item.pop || 0) * 100,
        precipitation_amount: item.rain?.['3h'] || 0,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        visibility: (item.visibility || 10000) / 1000, // Convert m to km
      })),
    };
  }
}

/**
 * Weather.gov (NWS) API Provider
 * Provider for the National Weather Service API (https://weather.gov)
 * 
 * Capabilities:
 * - Current weather
 * - Forecast (7 day)
 * - Weather alerts
 */
export class WeatherGovProvider implements APIProvider {
  name = 'Weather.gov';
  category = APICategory.WEATHER;
  priority = 5; // Lower priority than OpenWeather
  
  private baseUrl = 'https://api.weather.gov';
  private userAgent = 'PADDOCK20-Weather-App';
  
  /**
   * Execute a Weather.gov API request
   */
  async execute<T>(request: APIRequest): Promise<APIResponse<T>> {
    const { endpoint, params } = request;
    
    try {
      // Weather.gov requires a point request first to get grid coordinates
      const { lat, lon } = params || {};
      
      if (!lat || !lon) {
        return {
          success: false,
          error: {
            code: 'missing_coordinates',
            message: 'Latitude and longitude are required for Weather.gov API',
            reason: 'VALIDATION_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      }
      
      // First get the grid point for the coordinates
      const pointResponse = await fetch(`${this.baseUrl}/points/${lat},${lon}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (!pointResponse.ok) {
        return {
          success: false,
          error: {
            code: `weathergov_point_${pointResponse.status}`,
            message: `Weather.gov point API error: ${await pointResponse.text()}`,
            reason: 'API_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      }
      
      const pointData = await pointResponse.json();
      const { office, gridX, gridY } = pointData.properties;
      
      if (!office || gridX === undefined || gridY === undefined) {
        return {
          success: false,
          error: {
            code: 'invalid_grid',
            message: 'Weather.gov did not return valid grid coordinates',
            reason: 'API_ERROR',
          },
          fromCache: false,
          provider: this.name,
        };
      }
      
      // Now get the requested data
      let data: any;
      
      switch (endpoint) {
        case 'current':
          data = await this.fetchCurrentConditions(office, gridX, gridY);
          break;
        case 'forecast':
          data = await this.fetchForecast(office, gridX, gridY, params?.hourly);
          break;
        case 'alerts':
          data = await this.fetchAlerts(lat, lon);
          break;
        default:
          data = await this.fetchCurrentConditions(office, gridX, gridY);
      }
      
      if (!data.success) {
        return data; // Return error response
      }
      
      // Transform to standard format
      let transformedData: any;
      
      if (endpoint === 'current') {
        transformedData = this.transformCurrentWeather(data.data, lat, lon);
      } else if (endpoint === 'forecast') {
        transformedData = this.transformForecast(data.data, lat, lon);
      } else if (endpoint === 'alerts') {
        transformedData = this.transformAlerts(data.data);
      } else {
        transformedData = data.data;
      }
      
      return {
        success: true,
        data: transformedData as T,
        fromCache: false,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Weather.gov provider error:', error);
      
      return {
        success: false,
        error: {
          code: 'weathergov_error',
          message: `Weather.gov API error: ${error instanceof Error ? error.message : String(error)}`,
          reason: 'UNKNOWN_ERROR',
        },
        fromCache: false,
        provider: this.name,
      };
    }
  }
  
  /**
   * Check the health status of the Weather.gov API
   */
  async getHealthStatus(): Promise<HealthStatusType> {
    try {
      // Use a simple API call to check health
      const response = await fetch(`${this.baseUrl}/points/39.7456,-97.0892`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (response.ok) {
        return 'healthy';
      } else if (response.status === 429) {
        return 'degraded'; // Rate limited
      } else if (response.status >= 500) {
        return 'unavailable'; // Server error
      } else {
        return 'degraded'; // Other issues
      }
    } catch (error) {
      console.error('Weather.gov health check error:', error);
      return 'unavailable';
    }
  }
  
  /**
   * Fetch current conditions from Weather.gov
   */
  private async fetchCurrentConditions(office: string, gridX: number, gridY: number): Promise<any> {
    try {
      // Get current observations
      const stationsResponse = await fetch(`${this.baseUrl}/gridpoints/${office}/${gridX},${gridY}/stations`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (!stationsResponse.ok) {
        return {
          success: false,
          error: {
            code: `weathergov_stations_${stationsResponse.status}`,
            message: `Weather.gov stations API error: ${await stationsResponse.text()}`,
            reason: 'API_ERROR',
          },
        };
      }
      
      const stationsData = await stationsResponse.json();
      const stations = stationsData.features.slice(0, 3).map((s: any) => s.properties.stationIdentifier);
      
      if (!stations || stations.length === 0) {
        return {
          success: false,
          error: {
            code: 'no_stations',
            message: 'No weather stations found for this location',
            reason: 'API_ERROR',
          },
        };
      }
      
      // Get observations from the nearest station
      const observationsResponse = await fetch(`${this.baseUrl}/stations/${stations[0]}/observations/latest`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (!observationsResponse.ok) {
        return {
          success: false,
          error: {
            code: `weathergov_observations_${observationsResponse.status}`,
            message: `Weather.gov observations API error: ${await observationsResponse.text()}`,
            reason: 'API_ERROR',
          },
        };
      }
      
      return {
        success: true,
        data: await observationsResponse.json(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'weathergov_current_error',
          message: `Weather.gov current conditions error: ${error instanceof Error ? error.message : String(error)}`,
          reason: 'UNKNOWN_ERROR',
        },
      };
    }
  }
  
  /**
   * Fetch forecast from Weather.gov
   */
  private async fetchForecast(office: string, gridX: number, gridY: number, hourly?: boolean): Promise<any> {
    try {
      // Get forecast
      const endpoint = hourly ? 'forecast/hourly' : 'forecast';
      const forecastResponse = await fetch(`${this.baseUrl}/gridpoints/${office}/${gridX},${gridY}/${endpoint}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (!forecastResponse.ok) {
        return {
          success: false,
          error: {
            code: `weathergov_forecast_${forecastResponse.status}`,
            message: `Weather.gov forecast API error: ${await forecastResponse.text()}`,
            reason: 'API_ERROR',
          },
        };
      }
      
      return {
        success: true,
        data: await forecastResponse.json(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'weathergov_forecast_error',
          message: `Weather.gov forecast error: ${error instanceof Error ? error.message : String(error)}`,
          reason: 'UNKNOWN_ERROR',
        },
      };
    }
  }
  
  /**
   * Fetch alerts from Weather.gov
   */
  private async fetchAlerts(lat: number, lon: number): Promise<any> {
    try {
      // Get zone for the coordinates
      const zoneResponse = await fetch(`${this.baseUrl}/points/${lat},${lon}/zone`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (!zoneResponse.ok) {
        return {
          success: false,
          error: {
            code: `weathergov_zone_${zoneResponse.status}`,
            message: `Weather.gov zone API error: ${await zoneResponse.text()}`,
            reason: 'API_ERROR',
          },
        };
      }
      
      const zoneData = await zoneResponse.json();
      const zoneId = zoneData.id;
      
      if (!zoneId) {
        return {
          success: false,
          error: {
            code: 'no_zone',
            message: 'No weather zone found for this location',
            reason: 'API_ERROR',
          },
        };
      }
      
      // Get alerts for the zone
      const alertsResponse = await fetch(`${this.baseUrl}/alerts/active/zone/${zoneId}`, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/geo+json',
        },
      });
      
      if (!alertsResponse.ok) {
        return {
          success: false,
          error: {
            code: `weathergov_alerts_${alertsResponse.status}`,
            message: `Weather.gov alerts API error: ${await alertsResponse.text()}`,
            reason: 'API_ERROR',
          },
        };
      }
      
      return {
        success: true,
        data: await alertsResponse.json(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'weathergov_alerts_error',
          message: `Weather.gov alerts error: ${error instanceof Error ? error.message : String(error)}`,
          reason: 'UNKNOWN_ERROR',
        },
      };
    }
  }
  
  /**
   * Transform Weather.gov current weather to standardized format
   */
  private transformCurrentWeather(data: any, lat: number, lon: number): any {
    if (!data || !data.properties) return null;
    
    const props = data.properties;
    
    // Convert temperature from C to F if needed
    const tempC = props.temperature.value;
    const tempF = tempC !== null ? (tempC * 9/5) + 32 : null;
    
    // Convert wind speed from km/h to mph if needed
    const windSpeedKph = props.windSpeed.value;
    const windSpeedMph = windSpeedKph !== null ? windSpeedKph * 0.621371 : null;
    
    return {
      location: {
        lat,
        lon,
        name: props.station || 'Unknown',
        timezone: null, // Not provided directly
      },
      current: {
        timestamp: new Date(props.timestamp).getTime(),
        temp: tempF,
        feels_like: null, // Not provided directly
        humidity: props.relativeHumidity.value,
        pressure: props.barometricPressure.value / 100, // Convert Pa to hPa
        weather_description: props.textDescription || 'Unknown',
        weather_icon: this.getWeatherIcon(props.icon, props.textDescription),
        cloud_cover: null, // Not provided directly
        wind_speed: windSpeedMph,
        wind_direction: props.windDirection.value,
        visibility: props.visibility.value / 1000, // Convert m to km
        uv_index: null, // Not provided
        precipitation: props.precipitationLastHour.value || 0,
      }
    };
  }
  
  /**
   * Transform Weather.gov forecast to standardized format
   */
  private transformForecast(data: any, lat: number, lon: number): any {
    if (!data || !data.properties || !data.properties.periods) return null;
    
    // Group forecast periods by date
    const periodsByDate = new Map<string, any[]>();
    
    data.properties.periods.forEach((period: any) => {
      const date = new Date(period.startTime).toISOString().split('T')[0];
      
      if (!periodsByDate.has(date)) {
        periodsByDate.set(date, []);
      }
      
      periodsByDate.get(date)!.push(period);
    });
    
    // Create daily forecasts
    const dailyForecasts = Array.from(periodsByDate.entries()).map(([date, periods]) => {
      // Find daytime and nighttime periods
      const dayPeriod = periods.find(p => p.isDaytime);
      const nightPeriod = periods.find(p => !p.isDaytime);
      
      // Use appropriate periods for min/max temps
      const maxTemp = dayPeriod?.temperature;
      const minTemp = nightPeriod?.temperature;
      
      // Use daytime description and icon if available
      const description = dayPeriod?.shortForecast || periods[0]?.shortForecast || 'Unknown';
      const icon = this.getWeatherIcon(dayPeriod?.icon || periods[0]?.icon, description);
      
      // Calculate precipitation chance (look for phrases like "30 percent chance")
      let precipChance = 0;
      const detailedForecast = (dayPeriod?.detailedForecast || '') + (nightPeriod?.detailedForecast || '');
      const percentMatch = detailedForecast.match(/(\d+)\s*percent\s*chance/i);
      if (percentMatch && percentMatch[1]) {
        precipChance = parseInt(percentMatch[1], 10);
      }
      
      return {
        date,
        weather_description: description,
        weather_icon: icon,
        temp_min: minTemp || null,
        temp_max: maxTemp || null,
        precipitation_chance: precipChance,
        precipitation_amount: null, // Not provided directly
        humidity: null, // Not provided directly
        wind_speed: dayPeriod?.windSpeed ? this.parseWindSpeed(dayPeriod.windSpeed) : null,
        wind_direction: null, // Only provided as text
        uv_index: null, // Not provided
        sunrise: null, // Not provided
        sunset: null, // Not provided
      };
    });
    
    // Create hourly forecasts if available
    const hourlyForecasts = data.properties.periods.map((period: any) => {
      const startTime = new Date(period.startTime).getTime();
      
      return {
        timestamp: startTime,
        temp: period.temperature,
        feels_like: null, // Not provided
        weather_description: period.shortForecast,
        weather_icon: this.getWeatherIcon(period.icon, period.shortForecast),
        precipitation_chance: 0, // Not provided directly
        precipitation_amount: 0, // Not provided directly
        humidity: null, // Not provided
        wind_speed: this.parseWindSpeed(period.windSpeed),
        visibility: null, // Not provided
      };
    });
    
    return {
      location: {
        lat,
        lon,
        name: null, // Not provided directly
        timezone: null, // Not provided directly
      },
      daily: dailyForecasts,
      hourly: hourlyForecasts,
    };
  }
  
  /**
   * Transform Weather.gov alerts to standardized format
   */
  private transformAlerts(data: any): any[] {
    if (!data || !data.features) return [];
    
    return data.features.map((feature: any) => {
      const props = feature.properties;
      
      return {
        title: props.event,
        description: props.description,
        start: new Date(props.effective).getTime(),
        end: new Date(props.expires).getTime(),
        severity: props.severity.toLowerCase(),
        source: 'NWS',
      };
    });
  }
  
  /**
   * Map Weather.gov icon URL or description to standardized icon code
   */
  private getWeatherIcon(iconUrl?: string, description?: string): string {
    // Default icon for clear conditions
    let icon = '01d';
    
    // If no iconUrl or description, return default
    if (!iconUrl && !description) {
      return icon;
    }
    
    // Try to extract time of day from icon URL
    const isDay = !iconUrl || !iconUrl.includes('night');
    const timeOfDay = isDay ? 'd' : 'n';
    
    // Map description to icon code
    const desc = (description || '').toLowerCase();
    
    if (desc.includes('thunderstorm')) {
      icon = '11';
    } else if (desc.includes('rain') && desc.includes('snow')) {
      icon = '13';
    } else if (desc.includes('freezing') && desc.includes('rain')) {
      icon = '13';
    } else if (desc.includes('rain') || desc.includes('shower')) {
      if (desc.includes('light')) {
        icon = '10';
      } else {
        icon = '09';
      }
    } else if (desc.includes('snow') || desc.includes('flurr')) {
      icon = '13';
    } else if (desc.includes('fog') || desc.includes('mist')) {
      icon = '50';
    } else if (desc.includes('cloud')) {
      if (desc.includes('scattered') || desc.includes('partly')) {
        icon = '03';
      } else if (desc.includes('broken') || desc.includes('mostly')) {
        icon = '04';
      } else {
        icon = '02';
      }
    } else if (desc.includes('clear') || desc.includes('sunny')) {
      icon = '01';
    } else if (desc.includes('overcast')) {
      icon = '04';
    } else {
      // Try to extract from icon URL
      if (iconUrl) {
        if (iconUrl.includes('thunderstorm')) {
          icon = '11';
        } else if (iconUrl.includes('rain_snow')) {
          icon = '13';
        } else if (iconUrl.includes('rain') || iconUrl.includes('shower')) {
          icon = '09';
        } else if (iconUrl.includes('snow')) {
          icon = '13';
        } else if (iconUrl.includes('fog') || iconUrl.includes('mist')) {
          icon = '50';
        } else if (iconUrl.includes('sct')) {
          icon = '03';
        } else if (iconUrl.includes('bkn')) {
          icon = '04';
        } else if (iconUrl.includes('ovc')) {
          icon = '04';
        } else if (iconUrl.includes('few')) {
          icon = '02';
        } else if (iconUrl.includes('skc') || iconUrl.includes('clear')) {
          icon = '01';
        }
      }
    }
    
    return icon + timeOfDay;
  }
  
  /**
   * Parse wind speed from text (e.g. "10 to 15 mph" -> 12.5)
   */
  private parseWindSpeed(text: string): number | null {
    if (!text) return null;
    
    // Try to extract numeric values
    const numbers = text.match(/\d+/g);
    if (!numbers || numbers.length === 0) return null;
    
    // If range ("10 to 15 mph"), use average
    if (numbers.length >= 2) {
      return (parseInt(numbers[0], 10) + parseInt(numbers[1], 10)) / 2;
    }
    
    // Single value
    return parseInt(numbers[0], 10);
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
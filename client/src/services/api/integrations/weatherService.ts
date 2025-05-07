/**
 * Weather Service Integration
 * 
 * Bridges the API Data Warehouse with the existing WeatherContext and ConsolidatedWeatherContext.
 * Provides standardized methods for weather-related operations using the warehouse system.
 */

import { apiWarehouse } from '../core';
import { 
  APICategory, 
  WeatherData, 
  AutomotiveWeatherMetrics 
} from '../types';

// Initialize flag to track if providers are registered
let providersInitialized = false;

/**
 * Ensure weather providers are initialized
 */
function ensureProvidersInitialized() {
  if (providersInitialized) return;
  
  // Import and register providers dynamically
  import('../providers/weather').then(module => {
    module.registerWeatherProviders(apiWarehouse);
    console.info('🏎️ PADDOCK20: Weather API providers registered');
    providersInitialized = true;
  }).catch(err => {
    console.error('Failed to initialize weather providers:', err);
  });
}

/**
 * Convert temperature between units
 */
function convertTemperature(value: number, fromUnit: 'imperial' | 'metric', toUnit: 'imperial' | 'metric'): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    // F to C
    return (value - 32) * 5/9;
  } else {
    // C to F
    return (value * 9/5) + 32;
  }
}

/**
 * Calculate automotive-specific weather metrics
 */
function calculateAutomotiveMetrics(weatherData: WeatherData, unit: 'imperial' | 'metric'): AutomotiveWeatherMetrics {
  // Extract values from weather data
  const temp = unit === 'imperial' ? weatherData.current.temp : convertTemperature(weatherData.current.temp, 'imperial', 'metric');
  const humidity = weatherData.current.humidity;
  const precipitation = weatherData.current.precipitation;
  const windSpeed = weatherData.current.wind_speed;
  const weatherDesc = weatherData.current.weather_description.toLowerCase();
  
  // Track surface temperature estimation (typically 10-30°F higher than air temp in sunlight)
  const isRainy = weatherDesc.includes('rain') || weatherDesc.includes('drizzle') || precipitation > 0.1;
  const isSnowy = weatherDesc.includes('snow') || weatherDesc.includes('ice');
  const isCloudy = weatherDesc.includes('cloud') || weatherData.current.cloud_cover > 50;
  const isSunny = !isCloudy && !isRainy && !isSnowy;
  
  // Track temperature adjustment based on conditions
  let trackTempAdjustment = 0;
  if (isSunny) trackTempAdjustment = 20; // Track much hotter in full sun
  else if (isCloudy) trackTempAdjustment = 10; // Track somewhat hotter in clouds
  else if (isRainy) trackTempAdjustment = 0; // Track same temp in rain
  else if (isSnowy) trackTempAdjustment = -5; // Track colder in snow
  
  // Track temperature in Fahrenheit
  const trackTemp = unit === 'imperial' 
    ? Math.round(temp + trackTempAdjustment)
    : Math.round(convertTemperature(temp, 'metric', 'imperial') + trackTempAdjustment);
  
  // Determine track condition
  let trackCondition = 'Dry';
  let gripLevel = 'Optimal';
  
  if (isSnowy) {
    trackCondition = 'Snow-covered';
    gripLevel = 'Very Poor';
  } else if (isRainy) {
    trackCondition = 'Wet';
    gripLevel = precipitation > 0.3 ? 'Poor' : 'Reduced';
  } else if (humidity > 90) {
    trackCondition = 'Damp';
    gripLevel = 'Good';
  }
  
  // Tire compound recommendation based on conditions
  let compound = 'Medium';
  if (trackTemp > 100) compound = 'Hard';
  else if (trackTemp < 70) compound = 'Soft';
  
  if (isRainy || isSnowy) compound = 'Wet';
  
  // Tire pressure recommendations (simplified)
  const frontPsi = Math.round(30 + (trackTemp > 90 ? -2 : trackTemp < 50 ? 2 : 0));
  const rearPsi = Math.round(32 + (trackTemp > 90 ? -2 : trackTemp < 50 ? 2 : 0));
  
  // Tire warmup time
  const warmupTimeMinutes = trackTemp < 50 ? 10 : trackTemp < 70 ? 7 : 5;
  
  // Visibility assessment
  let visibilityLevel = 'Excellent';
  if (isRainy && precipitation > 0.5) visibilityLevel = 'Poor';
  else if (isRainy) visibilityLevel = 'Reduced';
  else if (isSnowy) visibilityLevel = 'Poor';
  else if (weatherDesc.includes('fog') || weatherDesc.includes('mist')) visibilityLevel = 'Poor';
  else if (isCloudy && humidity > 80) visibilityLevel = 'Moderate';
  
  // Wind impact
  let windImpact = 'Negligible';
  if (windSpeed > 25) windImpact = 'High';
  else if (windSpeed > 15) windImpact = 'Moderate';
  else if (windSpeed > 10) windImpact = 'Low';
  
  // Sunglare risk
  let sunglareRisk = 'Low';
  const hour = new Date().getHours();
  if (isSunny && (hour < 10 || hour > 16)) sunglareRisk = 'High';
  else if (isSunny) sunglareRisk = 'Moderate';
  
  // Hydroplaning risk
  let hydroplaningRisk = 'Low';
  if (isRainy && precipitation > 0.5) hydroplaningRisk = 'High';
  else if (isRainy) hydroplaningRisk = 'Moderate';
  
  // Braking distance
  const brakingDistancePercent = 
    isSnowy ? 200 : // 200% of normal
    isRainy && precipitation > 0.3 ? 150 : // 150% of normal
    isRainy ? 130 : // 130% of normal
    humidity > 90 ? 110 : // 110% of normal
    100; // Normal
  
  let brakingDescription = 'Normal';
  if (brakingDistancePercent >= 200) brakingDescription = 'Extremely Extended';
  else if (brakingDistancePercent >= 150) brakingDescription = 'Significantly Extended';
  else if (brakingDistancePercent >= 120) brakingDescription = 'Extended';
  else if (brakingDistancePercent >= 110) brakingDescription = 'Slightly Extended';
  
  // Power delivery recommendation
  let powerDeliveryRec = 'Normal';
  let tractionControlSetting = 'Normal';
  
  if (isSnowy) {
    powerDeliveryRec = 'Extremely Gentle';
    tractionControlSetting = 'Maximum';
  } else if (isRainy && precipitation > 0.3) {
    powerDeliveryRec = 'Very Gentle';
    tractionControlSetting = 'High';
  } else if (isRainy) {
    powerDeliveryRec = 'Gentle';
    tractionControlSetting = 'Medium';
  } else if (trackTemp < 50) {
    powerDeliveryRec = 'Cautious';
    tractionControlSetting = 'Medium';
  }
  
  return {
    trackSurface: {
      temperature: trackTemp,
      condition: trackCondition,
      gripLevel,
    },
    tireRecommendations: {
      compound,
      pressure: {
        frontPsi,
        rearPsi,
      },
      warmupTimeMinutes,
    },
    drivingConditions: {
      visibilityLevel,
      windImpact,
      sunglareRisk,
      hydroplaningRisk,
      brakingDistance: {
        percent: brakingDistancePercent,
        description: brakingDescription,
      },
      powerDelivery: {
        recommendation: powerDeliveryRec,
        tractionControlSetting,
      },
    },
  };
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(
  lat: number,
  lon: number,
  unit: 'imperial' | 'metric' = 'imperial'
): Promise<{ weatherData: WeatherData, automotiveMetrics: AutomotiveWeatherMetrics }> {
  // Ensure providers are initialized
  ensureProvidersInitialized();
  
  try {
    // Get weather data from the warehouse
    const response = await apiWarehouse.request<WeatherData>(APICategory.WEATHER, {
      params: {
        lat,
        lon,
        units: unit,
      },
    });
    
    // Calculate automotive metrics
    const automotiveMetrics = calculateAutomotiveMetrics(response.data, unit);
    
    // Log source of data
    if (response.fromCache) {
      console.log(`Using cached weather data from ${response.cacheLevel} cache`);
    } else {
      console.log(`Using fresh weather data from ${response.data.source}`);
    }
    
    return {
      weatherData: response.data,
      automotiveMetrics,
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * Get weather forecast for a location
 */
export async function getWeatherForecast(
  lat: number,
  lon: number,
  unit: 'imperial' | 'metric' = 'imperial'
): Promise<WeatherData> {
  // Ensure providers are initialized
  ensureProvidersInitialized();
  
  try {
    // Get forecast data from the warehouse
    const response = await apiWarehouse.request<WeatherData>(APICategory.WEATHER_FORECAST, {
      params: {
        lat,
        lon,
        units: unit,
      },
    });
    
    // Log source of data
    if (response.fromCache) {
      console.log(`Using cached forecast data from ${response.cacheLevel} cache`);
    } else {
      console.log(`Using fresh forecast data from ${response.data.source}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

/**
 * Get weather alerts for a location
 */
export async function getWeatherAlerts(
  lat: number,
  lon: number
): Promise<Array<{
  title: string;
  description: string;
  severity: string;
  start: number;
  end: number;
  source?: string;
}>> {
  // Ensure providers are initialized
  ensureProvidersInitialized();
  
  try {
    // Get alerts data from the warehouse
    const response = await apiWarehouse.request<WeatherData>(APICategory.WEATHER_ALERTS, {
      params: {
        lat,
        lon,
        units: 'imperial',
      },
    });
    
    // Extract alerts
    return response.data.alerts || [];
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Convert weather data to format expected by the legacy WeatherContext
 */
export function convertToLegacyWeatherData(weatherData: WeatherData): any {
  // Basic mapping to legacy format
  return {
    coord: {
      lon: weatherData.location.lon,
      lat: weatherData.location.lat
    },
    weather: [
      {
        id: 800, // Placeholder ID
        main: weatherData.current.weather_description.split(' ')[0],
        description: weatherData.current.weather_description,
        icon: weatherData.current.weather_icon
      }
    ],
    base: "stations",
    main: {
      temp: weatherData.current.temp,
      feels_like: weatherData.current.feels_like,
      temp_min: weatherData.daily?.[0]?.temp_min || weatherData.current.temp,
      temp_max: weatherData.daily?.[0]?.temp_max || weatherData.current.temp,
      pressure: weatherData.current.pressure,
      humidity: weatherData.current.humidity,
      sea_level: weatherData.current.pressure,
      grnd_level: weatherData.current.pressure
    },
    visibility: weatherData.current.visibility * 1000, // Convert from km to m
    wind: {
      speed: weatherData.current.wind_speed,
      deg: weatherData.current.wind_direction
    },
    clouds: {
      all: weatherData.current.cloud_cover
    },
    dt: Math.floor(weatherData.current.timestamp / 1000),
    sys: {
      country: weatherData.location.country,
      sunrise: weatherData.daily?.[0]?.sunrise ? Math.floor(weatherData.daily[0].sunrise / 1000) : undefined,
      sunset: weatherData.daily?.[0]?.sunset ? Math.floor(weatherData.daily[0].sunset / 1000) : undefined,
    },
    timezone: 0, // To be filled by caller
    id: 0, // To be filled by caller
    name: weatherData.location.name,
    cod: 200
  };
}

/**
 * Convert weather forecast data to format expected by the legacy ForecastContext
 */
export function convertToLegacyForecastData(weatherData: WeatherData): any {
  if (!weatherData.daily || weatherData.daily.length === 0) {
    return null;
  }
  
  // Basic mapping to legacy format
  return {
    cod: "200",
    message: 0,
    cnt: weatherData.daily.length,
    list: weatherData.daily.map(day => ({
      dt: new Date(day.date).getTime() / 1000,
      main: {
        temp: (day.temp_min + day.temp_max) / 2,
        feels_like: (day.temp_min + day.temp_max) / 2,
        temp_min: day.temp_min,
        temp_max: day.temp_max,
        pressure: weatherData.current.pressure,
        humidity: weatherData.current.humidity,
        sea_level: weatherData.current.pressure,
        grnd_level: weatherData.current.pressure,
        temp_kf: 0
      },
      weather: [
        {
          id: 800, // Placeholder ID
          main: day.weather_description.split(' ')[0],
          description: day.weather_description,
          icon: day.weather_icon
        }
      ],
      clouds: {
        all: weatherData.current.cloud_cover
      },
      wind: {
        speed: weatherData.current.wind_speed,
        deg: weatherData.current.wind_direction,
        gust: weatherData.current.wind_speed * 1.5 // Estimate gust
      },
      visibility: weatherData.current.visibility * 1000,
      pop: day.precipitation_chance / 100,
      sys: {
        pod: "d" // Day part
      },
      dt_txt: day.date
    })),
    city: {
      id: 0,
      name: weatherData.location.name,
      coord: {
        lat: weatherData.location.lat,
        lon: weatherData.location.lon
      },
      country: weatherData.location.country,
      population: 0,
      timezone: 0,
      sunrise: weatherData.daily[0]?.sunrise ? Math.floor(weatherData.daily[0].sunrise / 1000) : 0,
      sunset: weatherData.daily[0]?.sunset ? Math.floor(weatherData.daily[0].sunset / 1000) : 0
    }
  };
}

/**
 * Check health of weather-related API providers
 */
export async function checkWeatherServicesHealth(): Promise<{
  weather: 'healthy' | 'degraded' | 'unavailable';
  forecast: 'healthy' | 'degraded' | 'unavailable';
  alerts: 'healthy' | 'degraded' | 'unavailable';
}> {
  // Ensure providers are initialized
  ensureProvidersInitialized();
  
  try {
    // Get health status from warehouse
    const health = await apiWarehouse.getHealthStatus();
    
    return {
      weather: health[APICategory.WEATHER]?.status || 'unavailable',
      forecast: health[APICategory.WEATHER_FORECAST]?.status || 'unavailable',
      alerts: health[APICategory.WEATHER_ALERTS]?.status || 'unavailable',
    };
  } catch (error) {
    console.error('Error checking weather services health:', error);
    return {
      weather: 'unavailable',
      forecast: 'unavailable',
      alerts: 'unavailable',
    };
  }
}
/**
 * Weather Integration
 * 
 * This file bridges the API Data Warehouse with the ConsolidatedWeatherContext.
 * It provides methods to fetch weather data using the warehouse system.
 */

import { apiWarehouse } from '../APIDataWarehouse';
import { APICategory, WeatherData, AutomotiveWeatherMetrics } from '../types';
import { initializeProviders } from '../providers';

// Initialize providers on module load
let initialized = false;

/**
 * Ensure providers are initialized
 */
function ensureInitialized() {
  if (!initialized) {
    initializeProviders();
    initialized = true;
  }
}

/**
 * Convert temperature from one unit to another
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
 * Calculate automotive weather metrics
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
export async function getWeather(
  lat: number,
  lon: number,
  unit: 'imperial' | 'metric' = 'imperial'
): Promise<{ weatherData: WeatherData, automotiveMetrics: AutomotiveWeatherMetrics }> {
  ensureInitialized();
  
  try {
    // Get the weather data from the warehouse
    const response = await apiWarehouse.request<WeatherData>(APICategory.WEATHER, {
      endpoint: 'weather',
      params: {
        lat,
        lon,
        units: unit,
      },
      cacheTTL: 30 * 60 * 1000, // 30 minutes
    });
    
    // Calculate automotive metrics
    const automotiveMetrics = calculateAutomotiveMetrics(response.data, unit);
    
    return {
      weatherData: response.data,
      automotiveMetrics,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
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
  ensureInitialized();
  
  try {
    // Get the forecast data from the warehouse
    const response = await apiWarehouse.request<WeatherData>(APICategory.WEATHER_FORECAST, {
      endpoint: 'forecast',
      params: {
        lat,
        lon,
        units: unit,
      },
      cacheTTL: 3 * 60 * 60 * 1000, // 3 hours
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

/**
 * Get location information from IP address
 */
export async function getLocationFromIP(): Promise<{ lat: number, lon: number, displayName: string }> {
  ensureInitialized();
  
  try {
    const response = await apiWarehouse.request(APICategory.GEOCODING, {
      endpoint: '',
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    return {
      lat: response.data.lat,
      lon: response.data.lon,
      displayName: response.data.display_name,
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    throw error;
  }
}

/**
 * Get timezone information for a location
 */
export async function getTimezone(lat: number, lon: number): Promise<string> {
  ensureInitialized();
  
  try {
    const response = await apiWarehouse.request(APICategory.TIMEZONE, {
      endpoint: 'get-time-zone',
      params: {
        by: 'position',
        lat,
        lng: lon,
      },
      cacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    return response.data.timezone.id;
  } catch (error) {
    console.error('Error getting timezone:', error);
    return 'UTC'; // Default fallback
  }
}

/**
 * Check health of weather-related API providers
 */
export async function checkWeatherServicesHealth(): Promise<{
  weather: 'healthy' | 'degraded' | 'unavailable';
  forecast: 'healthy' | 'degraded' | 'unavailable';
  geocoding: 'healthy' | 'degraded' | 'unavailable';
  timezone: 'healthy' | 'degraded' | 'unavailable';
}> {
  ensureInitialized();
  
  const providers = apiWarehouse['providers'];
  const result = {
    weather: 'unavailable' as const,
    forecast: 'unavailable' as const,
    geocoding: 'unavailable' as const,
    timezone: 'unavailable' as const,
  };
  
  // Check weather providers
  const weatherProviders = providers.get(APICategory.WEATHER) || [];
  if (weatherProviders.length > 0) {
    try {
      result.weather = await weatherProviders[0].getHealthStatus();
      if (result.weather === 'unavailable' && weatherProviders.length > 1) {
        result.weather = await weatherProviders[1].getHealthStatus();
      }
    } catch (error) {
      console.error('Error checking weather providers health:', error);
    }
  }
  
  // Check forecast providers
  const forecastProviders = providers.get(APICategory.WEATHER_FORECAST) || [];
  if (forecastProviders.length > 0) {
    try {
      result.forecast = await forecastProviders[0].getHealthStatus();
      if (result.forecast === 'unavailable' && forecastProviders.length > 1) {
        result.forecast = await forecastProviders[1].getHealthStatus();
      }
    } catch (error) {
      console.error('Error checking forecast providers health:', error);
    }
  }
  
  // Check geocoding providers
  const geocodingProviders = providers.get(APICategory.GEOCODING) || [];
  if (geocodingProviders.length > 0) {
    try {
      result.geocoding = await geocodingProviders[0].getHealthStatus();
    } catch (error) {
      console.error('Error checking geocoding providers health:', error);
    }
  }
  
  // Check timezone providers
  const timezoneProviders = providers.get(APICategory.TIMEZONE) || [];
  if (timezoneProviders.length > 0) {
    try {
      result.timezone = await timezoneProviders[0].getHealthStatus();
    } catch (error) {
      console.error('Error checking timezone providers health:', error);
    }
  }
  
  return result;
}
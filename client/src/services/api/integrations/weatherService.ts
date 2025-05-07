/**
 * Weather Service Integration
 * 
 * This module provides integration between the API Data Warehouse
 * and the existing weather systems in the application.
 */

import { APICategory } from '../types/core';
import { fetchAPI } from '../index';
import { Location } from '@/contexts/EnhancedWeatherContext';

// Standard interfaces for weather data
export interface StandardWeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  current: {
    timestamp: number;
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    weather_description: string;
    weather_icon: string;
    cloud_cover: number;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    uv_index: number;
    precipitation: number;
  };
}

export interface StandardForecastData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  daily: Array<{
    date: string;
    weather_description: string;
    weather_icon: string;
    temp_min: number;
    temp_max: number;
    precipitation_chance: number;
    precipitation_amount: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    uv_index: number;
    sunrise?: number;
    sunset?: number;
  }>;
  hourly?: Array<{
    timestamp: number;
    temp: number;
    feels_like?: number;
    weather_description: string;
    weather_icon: string;
    precipitation_chance: number;
    precipitation_amount: number;
    humidity: number;
    wind_speed: number;
    visibility?: number;
  }>;
}

export interface StandardAlertData {
  title: string;
  description: string;
  start: number;
  end: number;
  severity: string;
}

/**
 * Fetch consolidated weather data for a location
 */
export async function fetchConsolidatedWeatherData(
  location: Location,
  unit: 'metric' | 'imperial' = 'imperial'
): Promise<{
  weatherData: any;
  forecastData: any;
  oneCallData: any;
  automotiveWeatherData: any;
  alerts: StandardAlertData[];
}> {
  console.log('Starting weather fetch process...');
  
  try {
    // Fetch current weather
    const currentWeatherResponse = await fetchAPI<StandardWeatherData>({
      category: APICategory.WEATHER,
      endpoint: 'current',
      params: {
        lat: location.lat,
        lon: location.lon,
        units: unit,
      },
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
    
    // Fetch forecast
    const forecastResponse = await fetchAPI<StandardForecastData>({
      category: APICategory.WEATHER,
      endpoint: 'forecast',
      params: {
        lat: location.lat,
        lon: location.lon,
        units: unit,
      },
      cacheTTL: 60 * 60 * 1000, // 1 hour
    });
    
    // Fetch alerts (if available)
    let alerts: StandardAlertData[] = [];
    try {
      const alertsResponse = await fetchAPI<StandardAlertData[]>({
        category: APICategory.WEATHER,
        endpoint: 'alerts',
        params: {
          lat: location.lat,
          lon: location.lon,
        },
        cacheTTL: 10 * 60 * 1000, // 10 minutes
      });
      
      if (alertsResponse.success) {
        alerts = alertsResponse.data || [];
      }
    } catch (error) {
      console.warn('Failed to fetch weather alerts:', error);
    }
    
    // Process and combine the data
    const weatherData = currentWeatherResponse.success ? currentWeatherResponse.data : null;
    const forecastData = forecastResponse.success ? forecastResponse.data : null;
    
    // Calculate automotive weather metrics
    const automotiveWeatherData = calculateAutomotiveWeatherData(weatherData, forecastData, alerts);
    
    if (currentWeatherResponse.fromCache) {
      console.log('Using cached weather data from', 
        currentWeatherResponse.stale ? 'stale cache' : 'primary');
    } else {
      console.log('Using fresh weather data from provider:', currentWeatherResponse.provider);
    }
    
    // Return all data
    return {
      weatherData,
      forecastData,
      oneCallData: null, // For compatibility with existing code
      automotiveWeatherData,
      alerts,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Calculate automotive-specific weather metrics
 */
function calculateAutomotiveWeatherData(
  weatherData: StandardWeatherData | null,
  forecastData: StandardForecastData | null,
  alerts: StandardAlertData[]
): any {
  if (!weatherData || !weatherData.current) {
    return {
      driving: {
        quality: 3,
        risks: [],
        recommendedSettings: {}
      },
      detailing: {
        quality: 3,
        recommendations: []
      }
    };
  }
  
  const current = weatherData.current;
  const today = forecastData?.daily?.[0];
  
  // Driving quality assessment (1-5, 5 is best)
  let drivingQuality = 5; // Start with perfect
  const drivingRisks: string[] = [];
  const recommendedSettings: Record<string, any> = {};
  
  // Assess precipitation
  if (current.precipitation > 0) {
    if (current.precipitation > 10) {
      drivingQuality -= 2; // Heavy rain
      drivingRisks.push('Heavy precipitation reducing visibility and traction');
      recommendedSettings.wipers = 'high';
      recommendedSettings.headlights = 'on';
      recommendedSettings.drivingMode = 'rain';
    } else {
      drivingQuality -= 1; // Light rain
      drivingRisks.push('Light precipitation may reduce traction');
      recommendedSettings.wipers = 'low';
      recommendedSettings.headlights = 'on';
    }
  }
  
  // Assess visibility
  if (current.visibility < 5) {
    drivingQuality -= 2;
    drivingRisks.push('Reduced visibility conditions');
    recommendedSettings.headlights = 'on';
    recommendedSettings.fogLights = current.visibility < 1 ? 'on' : 'off';
  } else if (current.visibility < 8) {
    drivingQuality -= 1;
    drivingRisks.push('Slightly reduced visibility');
    recommendedSettings.headlights = 'on';
  }
  
  // Assess wind
  if (current.wind_speed > 30) {
    drivingQuality -= 2;
    drivingRisks.push('High winds may affect vehicle stability');
  } else if (current.wind_speed > 20) {
    drivingQuality -= 1;
    drivingRisks.push('Moderate winds may be noticeable while driving');
  }
  
  // Consider alerts
  if (alerts && alerts.length > 0) {
    // Check for severe alerts
    const severeAlerts = alerts.filter(alert => 
      alert.severity === 'severe' || 
      alert.severity === 'extreme' ||
      alert.title.toLowerCase().includes('warning')
    );
    
    if (severeAlerts.length > 0) {
      drivingQuality = Math.min(drivingQuality, 2); // Cap at 2 for severe alerts
      severeAlerts.forEach(alert => {
        drivingRisks.push(`Weather alert: ${alert.title}`);
      });
    }
  }
  
  // Ensure quality is within bounds
  drivingQuality = Math.max(1, Math.min(5, drivingQuality));
  
  // Detailing quality assessment (1-5, 5 is best)
  let detailingQuality = 5;
  const detailingRecommendations: string[] = [];
  
  // Check precipitation
  if (current.precipitation > 0 || (today && today.precipitation_chance > 30)) {
    detailingQuality = 1;
    detailingRecommendations.push('Precipitation present or likely - detailing not recommended');
  } else if (today && today.precipitation_chance > 10) {
    detailingQuality = 3;
    detailingRecommendations.push('Chance of precipitation later - consider quick detailing only');
  }
  
  // Check humidity and temperature for optimal detailing
  if (current.humidity > 80) {
    detailingQuality = Math.min(detailingQuality, 3);
    detailingRecommendations.push('High humidity may affect product drying time');
  }
  
  // Check temperature
  if (current.temp > 90) {
    detailingQuality = Math.min(detailingQuality, 2);
    detailingRecommendations.push('High temperature may cause products to dry too quickly');
  } else if (current.temp < 40) {
    detailingQuality = Math.min(detailingQuality, 2);
    detailingRecommendations.push('Low temperature may affect product application');
  }
  
  // Check wind for dust and debris
  if (current.wind_speed > 15) {
    detailingQuality = Math.min(detailingQuality, 2);
    detailingRecommendations.push('Windy conditions may introduce dust and debris');
  }
  
  // Return combined automotive weather data
  return {
    driving: {
      quality: drivingQuality,
      risks: drivingRisks,
      recommendedSettings
    },
    detailing: {
      quality: detailingQuality,
      recommendations: detailingRecommendations
    }
  };
}
/**
 * Consolidated Weather Service
 * 
 * This service centralizes all weather API calls to a single endpoint
 * Improves resilience, reduces API calls, and enhances caching
 */

import { Location, OneCallData, WeatherData, ForecastData } from '@/lib/weather';
import { AutomotiveWeatherData } from '@/contexts/FixedWeatherContext';

// Set the OpenWeather API key
// In a production app, this should be injected from environment variables
const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY || import.meta.env.OPENWEATHER_API_KEY;
// Fallback coordinates if geolocation fails
const DEFAULT_COORDINATES = { lat: 40.7128, lon: -74.006 }; // New York City

/**
 * Fetch all weather data in a single call from our backend
 * This reduces API usage and helps with caching
 */
export async function fetchConsolidatedWeatherData(
  location: Location,
  unit: 'metric' | 'imperial' = 'imperial'
): Promise<{
  weatherData: WeatherData | null;
  oneCallData: OneCallData | null;
  forecastData: ForecastData | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  cacheTimestamp?: number;
}> {
  const { lat, lon } = location;
  const units = unit === 'imperial' ? 'imperial' : 'metric';
  const exclude = 'minutely'; // Exclude minutely data to reduce payload size

  try {
    // Set a reasonable timeout to prevent indefinite waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Call our server-side consolidated weather endpoint to fetch and cache all weather data
    const response = await fetch(
      `/api/weather/consolidated?lat=${lat}&lon=${lon}&units=${units}&exclude=${exclude}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Check for rate limit errors
      if (response.status === 429) {
        console.warn('Weather API rate limited. Using cached data if available.');
        throw new Error('Weather API rate limited. Using cached data.');
      }
      
      // Check for unauthorized errors (like expired API key)
      if (response.status === 401) {
        console.warn('Weather API authentication failed. Check your API key.');
        throw new Error('Weather API authentication failed.');
      }
      
      // Other error handling
      const errorText = await response.text();
      throw new Error(`Weather API error: ${response.status} - ${errorText}`);
    }

    // Parse the consolidated data from the server
    const data = await response.json();
    
    // Add a timestamp to track when this data was received
    data.cacheTimestamp = Date.now();
    
    return data;
  } catch (error) {
    // Re-throw the error to be handled by the caller
    console.error("Error fetching consolidated weather data:", error);
    throw error;
  }
}

/**
 * Get forecast summary with key information for automotive use
 */
export function getForecastSummary(forecast: ForecastData | null) {
  if (!forecast || !forecast.list || forecast.list.length === 0) {
    return {
      tempRange: { min: null, max: null },
      conditions: [],
      precipitation: false
    };
  }

  // Get the next 12 hours (or fewer if not available)
  const next12Hours = forecast.list.slice(0, 4);
  
  // Find min/max temperatures
  const temps = next12Hours.map(item => item.main.temp);
  const tempRange = {
    min: Math.min(...temps),
    max: Math.max(...temps)
  };

  // Get unique weather conditions
  const conditionsSet = new Set();
  next12Hours.forEach(item => {
    if (item.weather && item.weather.length > 0) {
      conditionsSet.add(item.weather[0].main);
    }
  });
  const conditions = Array.from(conditionsSet) as string[];

  // Check if precipitation expected
  const precipitation = next12Hours.some(item => 
    (item.rain && item.rain['3h'] > 0) || 
    (item.snow && item.snow['3h'] > 0) ||
    (item.weather && item.weather.some(w => 
      ['Rain', 'Snow', 'Drizzle', 'Thunderstorm'].includes(w.main)
    ))
  );

  return { tempRange, conditions, precipitation };
}

/**
 * Get road and driving conditions based on current weather
 */
export function getDrivingConditions(data: OneCallData | null) {
  if (!data || !data.current) {
    return {
      roadCondition: 'Unknown',
      visibility: 'Unknown',
      riskLevel: 'Unknown'
    };
  }

  const { weather, rain, snow, visibility = 10000 } = data.current;
  const weatherMain = weather?.[0]?.main || 'Clear';
  const weatherDesc = weather?.[0]?.description || '';
  
  // Determine road condition
  let roadCondition = 'Dry';
  if (snow || weatherMain === 'Snow') {
    roadCondition = 'Snow Covered';
  } else if (rain || ['Rain', 'Thunderstorm', 'Drizzle'].includes(weatherMain)) {
    roadCondition = 'Wet';
  } else if (weatherDesc.includes('fog') || weatherDesc.includes('mist')) {
    roadCondition = 'Damp';
  } else if (weatherMain === 'Haze' || weatherMain === 'Dust' || weatherMain === 'Sand') {
    roadCondition = 'Dusty';
  }
  
  // Determine visibility
  let visibilityCategory = 'Excellent';
  if (visibility < 1000) {
    visibilityCategory = 'Very Poor';
  } else if (visibility < 4000) {
    visibilityCategory = 'Poor';
  } else if (visibility < 7000) {
    visibilityCategory = 'Moderate';
  } else if (visibility < 9000) {
    visibilityCategory = 'Good';
  }
  
  // Determine risk level
  let riskLevel = 'Low';
  if (roadCondition === 'Snow Covered' || visibilityCategory === 'Very Poor') {
    riskLevel = 'High';
  } else if (roadCondition === 'Wet' || visibilityCategory === 'Poor') {
    riskLevel = 'Moderate';
  } else if (roadCondition === 'Damp' || visibilityCategory === 'Moderate') {
    riskLevel = 'Low-Moderate';
  }
  
  return { roadCondition, visibility: visibilityCategory, riskLevel };
}
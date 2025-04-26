import { Location, WeatherData, ForecastData } from 'shared/schema';

// Get the OpenWeatherMap API key from environment variables
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "default_key";

// Base URL for OpenWeatherMap API
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current weather data for a specific location
 */
export const getWeatherData = async (location: Location, unit: 'metric' | 'imperial'): Promise<WeatherData> => {
  try {
    const url = `${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&units=${unit}&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return data as WeatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error(`Failed to fetch weather data: ${(error as Error).message}`);
  }
};

/**
 * Get hourly forecast for a specific location
 */
export const getHourlyForecast = async (location: Location, unit: 'metric' | 'imperial'): Promise<ForecastData> => {
  try {
    const url = `${BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&units=${unit}&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Forecast API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return data as ForecastData;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw new Error(`Failed to fetch forecast data: ${(error as Error).message}`);
  }
};

/**
 * Search for a location by name and return coordinates
 */
export const searchLocation = async (query: string): Promise<Location> => {
  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geocoding API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error(`No location found for: ${query}`);
    }
    
    const result = data[0];
    return {
      id: Date.now().toString(), // Generate unique ID for this location
      name: result.name,
      lat: result.lat,
      lon: result.lon
    };
  } catch (error) {
    console.error('Error searching location:', error);
    throw new Error(`Failed to search location: ${(error as Error).message}`);
  }
};

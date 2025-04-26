import { Location, WeatherData, ForecastData } from 'shared/schema';

/**
 * Get current weather data for a specific location
 */
export const getWeatherData = async (location: Location, unit: 'metric' | 'imperial'): Promise<WeatherData> => {
  try {
    // Use our server-side proxy endpoint
    const url = `/api/weather?lat=${location.lat}&lon=${location.lon}&units=${unit}`;
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
    // Use our server-side proxy endpoint
    const url = `/api/forecast?lat=${location.lat}&lon=${location.lon}&units=${unit}`;
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
    // Use our server-side proxy endpoint
    const url = `/api/location?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geocoding API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error(`No location found for: ${query}`);
    }
    
    return data as Location;
  } catch (error) {
    console.error('Error searching location:', error);
    throw new Error(`Failed to search location: ${(error as Error).message}`);
  }
};

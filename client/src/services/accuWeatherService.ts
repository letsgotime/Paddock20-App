import axios from 'axios';

/**
 * Get AccuWeather location key from lat/lon coordinates
 * Location key is required for all other AccuWeather API calls
 */
export async function getLocationKey(latitude: number, longitude: number): Promise<{ Key: string }> {
  try {
    const response = await axios.get(`/api/accuweather/location?lat=${latitude}&lon=${longitude}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AccuWeather location key:', error);
    throw error;
  }
}

/**
 * Get current conditions for a location
 */
export async function fetchCurrentConditions(locationKey: string) {
  try {
    const response = await axios.get(`/api/accuweather/current-conditions/${locationKey}`);
    return response.data[0]; // AccuWeather returns an array with a single item
  } catch (error) {
    console.error('Error fetching current conditions:', error);
    throw error;
  }
}

/**
 * Get daily forecast for a location
 */
export async function fetchDailyForecast(locationKey: string) {
  try {
    const response = await axios.get(`/api/accuweather/daily-forecast/${locationKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily forecast:', error);
    throw error;
  }
}

/**
 * Get hourly forecasts for the next 12 hours
 */
export async function fetchHourlyForecast(locationKey: string) {
  try {
    const response = await axios.get(`/api/accuweather/hourly-forecast/${locationKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
}

/**
 * Get indices specific to driving activities
 * This includes indices for various outdoor activities
 */
export async function fetchDrivingIndices(locationKey: string) {
  try {
    const response = await axios.get(`/api/accuweather/indices/${locationKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching driving indices:', error);
    throw error;
  }
}

/**
 * Interface for automotive weather data
 */
export interface AutomotiveWeatherData {
  locationKey: string;
  timestamp: number;
  surfaceConditions: {
    asphalt: {
      temperature: number;
      condition: string;
    };
    concrete: {
      temperature: number;
      condition: string;
    };
    gravel: {
      temperature: number;
      condition: string;
    };
  };
  drivingRisk: {
    overall: string;
    visibility: string;
    traction: string;
    score: number;
    index?: number;
    description?: string;
  };
  washConditions: {
    recommended: boolean;
    uv: string;
    pollen: string;
    drying: string;
    rainProbabilityNext24h: number;
  };
  detailingConditions: {
    recommended: boolean;
    humidity: string;
    temperature: string;
    wind: string;
    lighting: string;
  };
}

/**
 * Get comprehensive automotive-specific weather data
 * Includes surface temperatures, driving risk, car wash and detailing conditions
 */
export async function fetchAutomotiveData(locationKey: string): Promise<AutomotiveWeatherData> {
  try {
    const response = await axios.get(`/api/accuweather/automotive/${locationKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching automotive weather data:', error);
    throw error;
  }
}

/**
 * Get all AccuWeather data needed for a comprehensive weather display
 */
export async function fetchAllAccuWeatherData(latitude: number, longitude: number) {
  try {
    // First get location key
    const locationData = await getLocationKey(latitude, longitude);
    const locationKey = locationData.Key;
    
    // Fetch data in parallel
    const [currentConditions, dailyForecast, hourlyForecast, drivingIndices, automotiveData] = 
      await Promise.all([
        fetchCurrentConditions(locationKey),
        fetchDailyForecast(locationKey),
        fetchHourlyForecast(locationKey),
        fetchDrivingIndices(locationKey),
        fetchAutomotiveData(locationKey)
      ]);
    
    return {
      locationKey,
      locationName: locationData.LocalizedName,
      country: locationData.Country?.LocalizedName,
      currentConditions,
      dailyForecast,
      hourlyForecast, 
      drivingIndices,
      automotiveData
    };
  } catch (error) {
    console.error('Error fetching all AccuWeather data:', error);
    throw error;
  }
}
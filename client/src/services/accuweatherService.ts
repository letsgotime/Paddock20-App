import axios from 'axios';

// Base URL for AccuWeather API calls
const ACCU_BASE_URL = 'https://dataservice.accuweather.com';

/**
 * Get AccuWeather location key from lat/lon coordinates
 * Location key is required for all other AccuWeather API calls
 */
export async function getLocationKey(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await axios.get(`/api/accuweather/location`, {
      params: { lat: latitude, lon: longitude }
    });
    
    if (response.data && response.data.Key) {
      return response.data.Key;
    }
    throw new Error('No location key found');
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
    return response.data[0]; // API returns an array with a single item
  } catch (error) {
    console.error('Error fetching AccuWeather current conditions:', error);
    throw error;
  }
}

/**
 * Get daily forecast for a location
 */
export async function fetchDailyForecast(locationKey: string) {
  try {
    const response = await axios.get(`/api/accuweather/daily-forecast/${locationKey}`);
    return response.data.DailyForecasts[0]; // Get first day forecast
  } catch (error) {
    console.error('Error fetching AccuWeather daily forecast:', error);
    throw error;
  }
}

/**
 * Get minutecast precipitation data for precise short-term forecasts
 */
export async function fetchMinuteCast(locationKey: string) {
  try {
    const response = await axios.get(`/api/accuweather/minutecast/${locationKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AccuWeather minutecast:', error);
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
    console.error('Error fetching AccuWeather hourly forecast:', error);
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
    return response.data.filter((index: any) => 
      index.ID === 1 || // Driving index
      index.ID === 10   // Road Construction index
    );
  } catch (error) {
    console.error('Error fetching AccuWeather indices:', error);
    throw error;
  }
}
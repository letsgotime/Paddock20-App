/**
 * Direct AccuWeather API service for the Paddock20 Portal
 * Implementation follows the AccuWeather flow diagram
 */

const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;
const BASE_URL = "https://dataservice.accuweather.com";

// Cache for API responses with expiration times
interface CacheEntry {
  data: any;
  expires: number; // Timestamp when this entry expires
}

const apiCache: Record<string, CacheEntry> = {};

/**
 * Get data from cache if valid, otherwise fetch from API
 * Implements AccuWeather best practice of using cache expiration
 */
async function getCachedOrFetch(url: string) {
  const now = Date.now();
  const cacheEntry = apiCache[url];
  
  // If we have a valid cache entry, return it
  if (cacheEntry && now < cacheEntry.expires) {
    console.log('Using cached data for:', url);
    return cacheEntry.data;
  }
  
  // Otherwise fetch fresh data
  console.log('Fetching fresh data for:', url);
  
  // Add randomization to refresh times (best practice from AccuWeather)
  // This prevents all users from hitting API at same time
  const jitter = Math.floor(Math.random() * 5 * 60 * 1000); // Random up to 5 minutes
  const cacheTime = 30 * 60 * 1000 + jitter; // 30 minutes + jitter
  
  const response = await fetch(url, {
    headers: {
      'Accept-Encoding': 'gzip,deflate', // Use GZIP per AccuWeather best practice
    }
  });
  
  // Set expiration based on response headers if available
  let expiresTimestamp = now + cacheTime;
  const expiresHeader = response.headers.get('Expires');
  if (expiresHeader) {
    const expiresDate = new Date(expiresHeader);
    if (!isNaN(expiresDate.getTime())) {
      expiresTimestamp = expiresDate.getTime();
    }
  }
  
  const data = await response.json();
  
  // Store in cache
  apiCache[url] = {
    data,
    expires: expiresTimestamp
  };
  
  return data;
}

/**
 * Step 1: Find location key based on GPS coordinates
 * This is the first call in the AccuWeather flow diagram
 */
export async function getLocationKey(lat: number, lon: number) {
  try {
    console.log('Fetching AccuWeather location key with coordinates:', lat, lon);
    const url = `${BASE_URL}/locations/v1/cities/geoposition/search?apikey=${API_KEY}&q=${lat},${lon}`;
    const data = await getCachedOrFetch(url);
    console.log('Got location key:', data.Key);
    return data.Key;
  } catch (error) {
    console.error('Error fetching AccuWeather location key:', error);
    throw error;
  }
}

/**
 * Step 2: Fetch Current Conditions using LocationKey
 */
export async function fetchCurrentConditions(locationKey: string) {
  try {
    const url = `${BASE_URL}/currentconditions/v1/${locationKey}?apikey=${API_KEY}&details=true`;
    const data = await getCachedOrFetch(url);
    return data[0]; // AccuWeather returns an array with a single item
  } catch (error) {
    console.error('Error fetching current conditions:', error);
    throw error;
  }
}

/**
 * Step 3: Fetch Daily Forecast
 */
export async function fetchDailyForecast(locationKey: string) {
  try {
    const url = `${BASE_URL}/forecasts/v1/daily/1day/${locationKey}?apikey=${API_KEY}&details=true`;
    const data = await getCachedOrFetch(url);
    return data.DailyForecasts[0];
  } catch (error) {
    console.error('Error fetching daily forecast:', error);
    throw error;
  }
}

/**
 * Step 4: Fetch MinuteCast (directly using lat/lon)
 */
export async function fetchMinuteCast(lat: number, lon: number) {
  try {
    const url = `${BASE_URL}/forecasts/v1/minute/1hour?apikey=${API_KEY}&q=${lat},${lon}&details=true`;
    const data = await getCachedOrFetch(url);
    return data;
  } catch (error) {
    console.error('Error fetching minutecast:', error);
    throw error;
  }
}

/**
 * Fetch all weather data needed for the automotive dashboard
 */
export async function fetchAllAccuWeatherData(latitude: number, longitude: number) {
  try {
    console.log('Fetching all AccuWeather data for coordinates:', latitude, longitude);
    
    // Step 1: Get location key
    const locationKey = await getLocationKey(latitude, longitude);
    
    // Steps 2-4: Fetch all data in parallel
    const [currentConditions, dailyForecast, minuteCast] = await Promise.all([
      fetchCurrentConditions(locationKey),
      fetchDailyForecast(locationKey),
      fetchMinuteCast(latitude, longitude)
    ]);
    
    return {
      locationKey,
      currentConditions,
      dailyForecast,
      minuteCast
    };
  } catch (error) {
    console.error('Error fetching all AccuWeather data:', error);
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
    rainProbabilityNext24h?: number;
  };
  detailingConditions: {
    recommended: boolean;
    humidity: string;
    temperature?: string;
    wind?: string;
    lighting?: string;
  };
}
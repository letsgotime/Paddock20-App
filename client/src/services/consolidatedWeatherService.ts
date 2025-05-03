/**
 * Consolidated Weather Service
 * 
 * This service combines multiple weather API calls into a single request
 * to reduce API rate limiting issues and optimize data fetching.
 */

import { OneCallData, Location } from '@/lib/weather';

// Define the structure of consolidated weather response
export interface ConsolidatedWeatherData {
  oneCallData: OneCallData;
  automotiveWeatherData: any; // Using any since the structure can vary
  lastUpdated: string;
  cacheTimestamp: number;
}

/**
 * Fetch all required weather data in a single API call
 * This drastically reduces API usage and helps avoid rate limiting
 */
export async function fetchConsolidatedWeatherData(
  location: Location,
  unit: 'metric' | 'imperial' = 'imperial'
): Promise<ConsolidatedWeatherData> {
  // Check cache first
  try {
    const cachedData = getCachedWeatherData(location, unit);
    if (cachedData) {
      console.log('Using cached consolidated weather data', {
        cacheAge: `${Math.round((Date.now() - cachedData.cacheTimestamp) / 60000)} minutes old`,
        location: location
      });
      return cachedData;
    }
  } catch (error) {
    console.warn('Error reading from consolidated weather cache:', error);
  }

  try {
    // Make a single API call that returns all needed weather data
    // This endpoint should be implemented on the server to combine multiple API calls
    const response = await fetch(
      `/api/consolidated-weather?lat=${location.lat}&lon=${location.lon}&units=${unit}`
    );

    if (!response.ok) {
      // If we get a rate limit response, try to use cached data
      if (response.status === 429) {
        const expiredCachedData = getExpiredCachedWeatherData(location);
        if (expiredCachedData) {
          console.log('Using expired cache due to rate limiting', {
            cacheAge: `${Math.round((Date.now() - expiredCachedData.cacheTimestamp) / 60000)} minutes old`
          });
          return {
            ...expiredCachedData,
            // Add a flag to indicate this is from expired cache
            oneCallData: {
              ...expiredCachedData.oneCallData,
              rateLimitedResponse: true
            }
          };
        }
      }
      throw new Error(`Weather API error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    
    // Cache the successful response
    const consolidatedData: ConsolidatedWeatherData = {
      oneCallData: data.oneCallData,
      automotiveWeatherData: data.automotiveWeatherData,
      lastUpdated: new Date().toISOString(),
      cacheTimestamp: Date.now()
    };
    
    setCachedWeatherData(location, unit, consolidatedData);
    
    return consolidatedData;
  } catch (error) {
    console.error('Error fetching consolidated weather data:', error);
    throw error;
  }
}

// Cache key for consolidated weather data
const CACHE_KEY = 'cachedConsolidatedWeatherData';

// Cache duration - 4 hours
const CACHE_DURATION = 4 * 60 * 60 * 1000;

// Cache duration for expired cache - 24 hours
const EXPIRED_CACHE_DURATION = 24 * 60 * 60 * 1000;

// Cache interface
interface CachedData {
  data: ConsolidatedWeatherData;
  location: {
    lat: number;
    lon: number;
  };
  unit: 'metric' | 'imperial';
  timestamp: number;
}

/**
 * Get cached weather data if it's still valid
 */
function getCachedWeatherData(
  location: Location,
  unit: 'metric' | 'imperial'
): ConsolidatedWeatherData | null {
  try {
    const cachedDataString = localStorage.getItem(CACHE_KEY);
    if (!cachedDataString) return null;
    
    const cachedData: CachedData = JSON.parse(cachedDataString);
    
    // Calculate if cache is still valid (within duration window)
    const cacheAge = Date.now() - cachedData.timestamp;
    const isCacheValid = cacheAge < CACHE_DURATION;
    
    // Check if the location is close enough (within ~5km) and unit matches
    const isSameLocation = 
      Math.abs(cachedData.location.lat - location.lat) < 0.05 && 
      Math.abs(cachedData.location.lon - location.lon) < 0.05;
    const isSameUnit = cachedData.unit === unit;
    
    // If cache is valid, location is close enough, and unit matches, use cached data
    if (isCacheValid && isSameLocation && isSameUnit) {
      return cachedData.data;
    }
  } catch (error) {
    console.error('Error reading weather cache:', error);
  }
  
  return null;
}

/**
 * Get expired cached weather data (for use during rate limiting)
 */
function getExpiredCachedWeatherData(location: Location): ConsolidatedWeatherData | null {
  try {
    const cachedDataString = localStorage.getItem(CACHE_KEY);
    if (!cachedDataString) return null;
    
    const cachedData: CachedData = JSON.parse(cachedDataString);
    
    // Calculate if cache is still within extended duration window
    const cacheAge = Date.now() - cachedData.timestamp;
    const isWithinExtendedDuration = cacheAge < EXPIRED_CACHE_DURATION;
    
    // Check if the location is close enough
    const isSameLocation = 
      Math.abs(cachedData.location.lat - location.lat) < 0.05 && 
      Math.abs(cachedData.location.lon - location.lon) < 0.05;
    
    // If cache is within extended duration and location is close enough, use it
    if (isWithinExtendedDuration && isSameLocation) {
      return cachedData.data;
    }
  } catch (error) {
    console.error('Error reading expired weather cache:', error);
  }
  
  return null;
}

/**
 * Cache weather data for future use
 */
function setCachedWeatherData(
  location: Location,
  unit: 'metric' | 'imperial',
  data: ConsolidatedWeatherData
): void {
  try {
    const cacheData: CachedData = {
      data,
      location: {
        lat: location.lat,
        lon: location.lon
      },
      unit,
      timestamp: Date.now()
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching weather data:', error);
  }
}
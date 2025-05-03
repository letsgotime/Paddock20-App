/**
 * Weather State Manager
 * 
 * This service centralizes our weather state management functions
 * to improve resilience and optimize for caching
 */

import { type Location } from '@/lib/weather';
import { fetchConsolidatedWeatherData } from './consolidatedWeatherService';

/**
 * Initialize or update all the weather-related state with a successful fetch
 */
export function updateWeatherStateFromFetch(
  data: any,
  setters: {
    setLastUpdated: (date: Date) => void;
    setFailureCount: (count: number | ((prev: number) => number)) => void;
    setIsUsingFallbackData: (value: boolean) => void;
    setNextRefreshTime: (date: Date) => void;
    setCacheExpiryTime: (date: Date) => void;
    setCacheAge: (value: string) => void;
  }
) {
  const now = new Date();
  
  // Update state with fresh data
  setters.setFailureCount(0);
  setters.setLastUpdated(now);
  setters.setIsUsingFallbackData(false);
  
  // Set next auto-refresh time (60 minutes from now)
  const nextRefresh = new Date(now.getTime() + 60 * 60 * 1000);
  setters.setNextRefreshTime(nextRefresh);
  
  // Set cache expiry time (8 hours from now)
  const cacheExpiry = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  setters.setCacheExpiryTime(cacheExpiry);
  
  // Set cache age
  setters.setCacheAge("Just updated");
  
  return true;
}

/**
 * Handle weather fetch failures with appropriate fallback behaviors
 */
export function handleWeatherFetchFailure(
  error: Error,
  setters: {
    setFailureCount: (count: number | ((prev: number) => number)) => void;
    setIsUsingFallbackData: (value: boolean) => void;
  }
) {
  // Log the error for debugging
  console.error("Weather API error:", error);
  
  // Increment the failure counter
  setters.setFailureCount((prev: number) => prev + 1);
  
  // Check for rate limiting issues
  const errorString = String(error);
  const isRateLimitError = errorString.includes('429') || 
                          errorString.includes('rate limit') || 
                          errorString.includes('too many requests');
  
  // Mark as using fallback data for rate limit errors
  if (isRateLimitError) {
    setters.setIsUsingFallbackData(true);
  }
  
  return isRateLimitError;
}

/**
 * Calculate and update cache age based on timestamp
 */
export function updateCacheAge(
  cacheTimestamp: number | undefined,
  setCacheAge: (value: string) => void
) {
  if (!cacheTimestamp) {
    setCacheAge("Unknown");
    return;
  }
  
  const now = new Date();
  const cacheAgeMinutes = Math.round((now.getTime() - cacheTimestamp) / 60000);
  
  if (cacheAgeMinutes < 1) {
    setCacheAge("Just updated");
  } else if (cacheAgeMinutes < 60) {
    setCacheAge(`${cacheAgeMinutes} minutes old`);
  } else {
    const cacheAgeHours = Math.round(cacheAgeMinutes / 60);
    setCacheAge(`${cacheAgeHours} hour${cacheAgeHours > 1 ? 's' : ''} old`);
  }
}

/**
 * Format location coordinates for display and APIs
 */
export function formatLocationCoordinates(location: Location): string {
  return `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
}

/**
 * Refreshes weather data with appropriate state updates
 */
export async function performWeatherRefresh(
  location: Location | null,
  unit: 'metric' | 'imperial',
  setters: {
    setLastUpdated: (date: Date) => void;
    setFailureCount: (count: number | ((prev: number) => number)) => void;
    setIsUsingFallbackData: (value: boolean) => void;
    setNextRefreshTime: (date: Date) => void;
    setCacheExpiryTime: (date: Date) => void;
    setCacheAge: (value: string) => void;
  }
) {
  // Only proceed if we have a location
  if (!location) {
    console.warn('Cannot refresh weather: No location selected');
    return null;
  }
  
  try {
    console.log('Refreshing weather data for:', 
               location.name || `${location.lat},${location.lon}`);
    
    // This single API call replaces multiple separate API calls
    const data = await fetchConsolidatedWeatherData(location, unit);
    
    // Update all our state
    updateWeatherStateFromFetch(data, setters);
    
    return data;
  } catch (error: any) {
    console.error('Error refreshing consolidated weather data:', error);
    handleWeatherFetchFailure(error, setters);
    throw error;
  }
}
/**
 * Weather State Manager
 * 
 * This service centralizes our weather state management functions
 * to improve resilience and optimize for caching
 */

import { type Location } from '@/lib/weather';
import { fetchConsolidatedWeatherData } from './consolidatedWeatherService';

// Cache TTL constants
const PRIMARY_CACHE_TTL_MINUTES = 60; // 1 hour for primary cache
const SECONDARY_CACHE_TTL_HOURS = 8;  // 8 hours for secondary cache

/**
 * Save weather data to both primary and secondary caches
 */
export function saveToWeatherCaches(location: Location, unit: string, data: any) {
  const now = new Date();
  
  try {
    // Generate cache keys
    const primaryCacheKey = `weather_primary_cache_${location.lat}_${location.lon}_${unit}`;
    const secondaryCacheKey = `weather_secondary_cache_${location.lat}_${location.lon}_${unit}`;
    
    // Create cache object with timestamp
    const cacheObject = {
      timestamp: now.toISOString(),
      data: data
    };
    
    // Save to primary cache
    localStorage.setItem(primaryCacheKey, JSON.stringify(cacheObject));
    
    // Also save to secondary (long-term) cache
    localStorage.setItem(secondaryCacheKey, JSON.stringify(cacheObject));
    
    console.log('Weather data saved to both primary and secondary caches');
    return true;
  } catch (error) {
    console.error('Failed to save weather data to caches:', error);
    return false;
  }
}

/**
 * Try to retrieve data from weather caches, checking primary first, then secondary
 * Returns null if no valid cache data is available
 */
export function getFromWeatherCaches(
  location: Location, 
  unit: string, 
  forceRefresh: boolean = false,
  setCacheAge: (value: string) => void
): { data: any, source: 'primary' | 'secondary' | null } {
  if (forceRefresh) {
    return { data: null, source: null };
  }
  
  try {
    const now = new Date();
    const primaryCacheKey = `weather_primary_cache_${location.lat}_${location.lon}_${unit}`;
    const secondaryCacheKey = `weather_secondary_cache_${location.lat}_${location.lon}_${unit}`;
    
    // Try primary cache first
    const primaryCacheStr = localStorage.getItem(primaryCacheKey);
    if (primaryCacheStr) {
      const primaryCache = JSON.parse(primaryCacheStr);
      const primaryCacheTime = new Date(primaryCache.timestamp);
      const primaryCacheAgeMins = (now.getTime() - primaryCacheTime.getTime()) / (1000 * 60);
      
      if (primaryCacheAgeMins < PRIMARY_CACHE_TTL_MINUTES) {
        // Primary cache is still valid
        const formattedAge = formatCacheAge(primaryCacheAgeMins);
        setCacheAge(formattedAge);
        console.log(`Using primary cache data (${formattedAge} old)`);
        return { data: primaryCache.data, source: 'primary' };
      }
    }
    
    // Try secondary cache next
    const secondaryCacheStr = localStorage.getItem(secondaryCacheKey);
    if (secondaryCacheStr) {
      const secondaryCache = JSON.parse(secondaryCacheStr);
      const secondaryCacheTime = new Date(secondaryCache.timestamp);
      const secondaryCacheAgeHours = (now.getTime() - secondaryCacheTime.getTime()) / (1000 * 60 * 60);
      
      if (secondaryCacheAgeHours < SECONDARY_CACHE_TTL_HOURS) {
        // Secondary cache is still valid
        const formattedAge = formatCacheAge(secondaryCacheAgeHours * 60);
        setCacheAge(`${formattedAge} (backup cache)`);
        console.log(`Using secondary backup cache data (${formattedAge} old)`);
        return { data: secondaryCache.data, source: 'secondary' };
      }
    }
    
    // No valid cache data found
    return { data: null, source: null };
  } catch (error) {
    console.error('Error reading from weather caches:', error);
    return { data: null, source: null };
  }
}

/**
 * Format cache age for display
 */
export function formatCacheAge(ageInMinutes: number): string {
  if (ageInMinutes < 1) return "Just now";
  if (ageInMinutes < 60) return `${Math.round(ageInMinutes)} minutes old`;
  return `${Math.round(ageInMinutes / 60)} hours old`;
}

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
  const nextRefresh = new Date(now.getTime() + PRIMARY_CACHE_TTL_MINUTES * 60 * 1000);
  setters.setNextRefreshTime(nextRefresh);
  
  // Set cache expiry time (8 hours from now)
  const cacheExpiry = new Date(now.getTime() + SECONDARY_CACHE_TTL_HOURS * 60 * 60 * 1000);
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
/**
 * TheRundown API Service
 * 
 * This service provides access to TheRundown API for sports data, including:
 * - Sports list
 * - Events data
 * - Motorsports events
 * - Ultra-aggressive caching to stay within free tier limits (20 requests per day)
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const RUNDOWN_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const RUNDOWN_BASE_URL = 'https://therundown-therundown-v1.p.rapidapi.com';

// Cache configuration - ultra-aggressive to stay within free tier limits
const CACHE_TTL_DAYS = 1; // 1 day for most data
const CACHE_TTL_HOURS = 6; // 6 hours for frequently changing data
const SPORTS_CACHE_KEY = 'therundown_sports_cache';
const EVENTS_CACHE_KEY = 'therundown_events_cache';
const MOTORSPORTS_CACHE_KEY = 'therundown_motorsports_cache';
const USAGE_STATS_KEY = 'therundown_usage_stats';

// Request limits (conservative)
const DAILY_REQUEST_LIMIT = 18; // Conservative limit (actual is 20)

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    endpoint: string;
    cacheHit: boolean;
  }[];
}

/**
 * Initialize or get usage statistics
 */
function getUsageStats(): UsageStats {
  const savedStats = localStorage.getItem<UsageStats>(USAGE_STATS_KEY);
  
  if (savedStats) {
    // Check if we need to reset the daily counter
    if (shouldResetDailyCounter(savedStats)) {
      return resetDailyCounter(savedStats);
    }
    return savedStats;
  }
  
  // Initialize new usage stats
  return {
    requestsToday: 0,
    dayStartTimestamp: getCurrentDayStart(),
    lastResetTimestamp: Date.now(),
    apiCallLog: []
  };
}

/**
 * Save usage statistics to storage
 */
function saveUsageStats(stats: UsageStats): void {
  localStorage.setItem(USAGE_STATS_KEY, stats);
}

/**
 * Get the start timestamp of the current day
 */
function getCurrentDayStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/**
 * Check if the daily counter should be reset
 */
function shouldResetDailyCounter(stats: UsageStats): boolean {
  const currentDayStart = getCurrentDayStart();
  return currentDayStart > stats.dayStartTimestamp;
}

/**
 * Reset the daily API call counter
 */
function resetDailyCounter(stats: UsageStats): UsageStats {
  console.log('Resetting TheRundown API daily counter');
  return {
    ...stats,
    requestsToday: 0,
    dayStartTimestamp: getCurrentDayStart(),
    lastResetTimestamp: Date.now()
  };
}

/**
 * Record an API call in the usage statistics
 */
function recordApiCall(endpoint: string, cacheHit: boolean): void {
  const stats = getUsageStats();
  
  // Only increment the counter for actual API calls (not cache hits)
  if (!cacheHit) {
    stats.requestsToday++;
  }
  
  // Log the call details
  stats.apiCallLog.push({
    timestamp: Date.now(),
    endpoint,
    cacheHit
  });
  
  // Trim the log if it gets too large
  if (stats.apiCallLog.length > 100) {
    stats.apiCallLog = stats.apiCallLog.slice(-100);
  }
  
  saveUsageStats(stats);
}

/**
 * Check if we've exceeded our daily API call quota
 */
function hasExceededQuota(): boolean {
  const stats = getUsageStats();
  return stats.requestsToday >= DAILY_REQUEST_LIMIT;
}

/**
 * Get a list of all sports from TheRundown API
 */
export async function getSportsList(): Promise<any> {
  const cacheKey = 'sports_list';
  
  // Check cache first
  const cachedData = localStorage.getItem<any>(SPORTS_CACHE_KEY);
  if (cachedData && cachedData[cacheKey]) {
    recordApiCall('/sports', true);
    return cachedData[cacheKey];
  }
  
  // Check if we've exceeded our quota
  if (hasExceededQuota()) {
    console.warn('TheRundown API daily quota exceeded, refusing to make new requests');
    throw new Error('API quota exceeded and no cached data available');
  }
  
  try {
    const response = await axios.get(`${RUNDOWN_BASE_URL}/sports`, {
      headers: {
        'X-RapidAPI-Key': RUNDOWN_API_KEY,
        'X-RapidAPI-Host': 'therundown-therundown-v1.p.rapidapi.com'
      }
    });
    
    // Store in cache
    const cache = cachedData || {};
    cache[cacheKey] = response.data;
    localStorage.setItem(SPORTS_CACHE_KEY, cache, CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    
    // Record API call
    recordApiCall('/sports', false);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching sports list:', error);
    throw error;
  }
}

/**
 * Get events for a specific sport
 */
export async function getEvents(sportId: number): Promise<any> {
  const cacheKey = `events_sport_${sportId}`;
  
  // Check cache first
  const cachedData = localStorage.getItem<any>(EVENTS_CACHE_KEY);
  if (cachedData && cachedData[cacheKey]) {
    const cacheTimestamp = cachedData[`${cacheKey}_timestamp`] || 0;
    const cacheAge = Date.now() - cacheTimestamp;
    
    // Use cache if it's less than 6 hours old
    if (cacheAge < CACHE_TTL_HOURS * 60 * 60 * 1000) {
      recordApiCall(`/sports/${sportId}/events`, true);
      return cachedData[cacheKey];
    }
  }
  
  // Check if we've exceeded our quota
  if (hasExceededQuota()) {
    console.warn('TheRundown API daily quota exceeded, refusing to make new requests');
    
    // Return cached data even if expired
    if (cachedData && cachedData[cacheKey]) {
      recordApiCall(`/sports/${sportId}/events`, true);
      return cachedData[cacheKey];
    }
    
    throw new Error('API quota exceeded and no cached data available');
  }
  
  try {
    const response = await axios.get(`${RUNDOWN_BASE_URL}/sports/${sportId}/events`, {
      headers: {
        'X-RapidAPI-Key': RUNDOWN_API_KEY,
        'X-RapidAPI-Host': 'therundown-therundown-v1.p.rapidapi.com'
      }
    });
    
    // Store in cache
    const cache = cachedData || {};
    cache[cacheKey] = response.data;
    cache[`${cacheKey}_timestamp`] = Date.now();
    localStorage.setItem(EVENTS_CACHE_KEY, cache, CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    
    // Record API call
    recordApiCall(`/sports/${sportId}/events`, false);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for sport ID ${sportId}:`, error);
    
    // Return cached data even if expired, as fallback
    if (cachedData && cachedData[cacheKey]) {
      recordApiCall(`/sports/${sportId}/events`, true);
      return cachedData[cacheKey];
    }
    
    throw error;
  }
}

/**
 * Get motorsports events
 * This is a special case as it combines events from multiple motorsport IDs
 */
export async function getMotorsportsEvents(): Promise<any> {
  const cacheKey = 'motorsports_events';
  
  // Check cache first
  const cachedData = localStorage.getItem<any>(MOTORSPORTS_CACHE_KEY);
  if (cachedData && cachedData[cacheKey]) {
    const cacheTimestamp = cachedData[`${cacheKey}_timestamp`] || 0;
    const cacheAge = Date.now() - cacheTimestamp;
    
    // Use cache if it's less than 6 hours old
    if (cacheAge < CACHE_TTL_HOURS * 60 * 60 * 1000) {
      recordApiCall('/motorsports/events', true);
      return cachedData[cacheKey];
    }
  }
  
  // Check if we've exceeded our quota
  if (hasExceededQuota()) {
    console.warn('TheRundown API daily quota exceeded, refusing to make new requests');
    
    // Return cached data even if expired
    if (cachedData && cachedData[cacheKey]) {
      recordApiCall('/motorsports/events', true);
      return cachedData[cacheKey];
    }
    
    throw new Error('API quota exceeded and no cached data available');
  }
  
  try {
    // Motorsports IDs (this is an approximation, may need adjustment)
    // F1, NASCAR, IndyCar, etc.
    const motorsportIds = [13, 14, 15];
    let allEvents: any[] = [];
    
    // Fetch events for each motorsport ID
    for (const id of motorsportIds) {
      try {
        const response = await axios.get(`${RUNDOWN_BASE_URL}/sports/${id}/events`, {
          headers: {
            'X-RapidAPI-Key': RUNDOWN_API_KEY,
            'X-RapidAPI-Host': 'therundown-therundown-v1.p.rapidapi.com'
          }
        });
        
        if (response.data && response.data.events) {
          allEvents = [...allEvents, ...response.data.events];
        }
        
        // Record API call
        recordApiCall(`/sports/${id}/events`, false);
      } catch (error) {
        console.warn(`Error fetching events for motorsport ID ${id}:`, error);
        // Continue with next ID
      }
    }
    
    // Create combined response
    const combinedResponse = {
      events: allEvents
    };
    
    // Store in cache
    const cache = cachedData || {};
    cache[cacheKey] = combinedResponse;
    cache[`${cacheKey}_timestamp`] = Date.now();
    localStorage.setItem(MOTORSPORTS_CACHE_KEY, cache, CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    
    return combinedResponse;
  } catch (error) {
    console.error('Error fetching motorsports events:', error);
    
    // Return cached data even if expired, as fallback
    if (cachedData && cachedData[cacheKey]) {
      recordApiCall('/motorsports/events', true);
      return cachedData[cacheKey];
    }
    
    // Return empty result set instead of throwing
    return { events: [] };
  }
}

// Export usage statistics functions
export function getApiUsage(): { requestsToday: number, dailyLimit: number, remainingRequests: number } {
  const stats = getUsageStats();
  return {
    requestsToday: stats.requestsToday,
    dailyLimit: DAILY_REQUEST_LIMIT,
    remainingRequests: Math.max(0, DAILY_REQUEST_LIMIT - stats.requestsToday)
  };
}

export function clearCache(): void {
  localStorage.removeItem(SPORTS_CACHE_KEY);
  localStorage.removeItem(EVENTS_CACHE_KEY);
  localStorage.removeItem(MOTORSPORTS_CACHE_KEY);
  console.log('TheRundown cache cleared');
}
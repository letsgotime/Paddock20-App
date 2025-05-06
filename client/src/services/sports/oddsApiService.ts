/**
 * The Odds API Service - Sports odds and scores
 * 
 * This service provides access to The Odds API for sports odds and scores.
 * API key: U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D
 * Limits: 500 requests per month
 * 
 * Documentation: https://the-odds-api.com/
 */

import { createCachedFunction } from '@/utils/storageUtils';

const API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const BASE_URL = 'https://api.the-odds-api.com/v4';

// Cache configuration - aggressive caching to stay within free tier limits
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes
const LONG_CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours for less frequently changing data

// Cached implementation of the getSports function to minimize API calls
export const getSports = createCachedFunction(
  async (): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/sports?apiKey=${API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sports list:', error);
      throw error;
    }
  },
  'theOddsAPI_sports',
  LONG_CACHE_TIME // Sports change very infrequently
);

// Get odds for a specific sport
export const getOdds = createCachedFunction(
  async (sport: string, regions: string = 'us', markets: string = 'h2h'): Promise<any> => {
    try {
      const response = await fetch(
        `${BASE_URL}/sports/${sport}/odds?apiKey=${API_KEY}&regions=${regions}&markets=${markets}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching odds for ${sport}:`, error);
      throw error;
    }
  },
  (sport, regions, markets) => `theOddsAPI_odds_${sport}_${regions}_${markets}`,
  CACHE_TIME
);

// Get scores for a specific sport
export const getScores = createCachedFunction(
  async (sport: string, dateFormat: string = 'iso'): Promise<any> => {
    try {
      const response = await fetch(
        `${BASE_URL}/sports/${sport}/scores?apiKey=${API_KEY}&daysFrom=1&dateFormat=${dateFormat}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching scores for ${sport}:`, error);
      throw error;
    }
  },
  (sport, dateFormat) => `theOddsAPI_scores_${sport}_${dateFormat}`,
  CACHE_TIME
);

// Get upcoming events for a specific sport
export const getEvents = createCachedFunction(
  async (sport: string, dateFormat: string = 'iso'): Promise<any> => {
    try {
      const response = await fetch(
        `${BASE_URL}/sports/${sport}/scores?apiKey=${API_KEY}&daysFrom=3&dateFormat=${dateFormat}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching events for ${sport}:`, error);
      throw error;
    }
  },
  (sport, dateFormat) => `theOddsAPI_events_${sport}_${dateFormat}`,
  CACHE_TIME
);

// Export usage meter function to track API usage
export const getApiUsageRemaining = async (): Promise<number> => {
  try {
    // Make a lightweight call to check remaining requests
    const response = await fetch(`${BASE_URL}/sports?apiKey=${API_KEY}`);
    
    // Extract the remaining requests from headers
    const remainingRequests = parseInt(response.headers.get('x-requests-remaining') || '0', 10);
    
    return remainingRequests;
  } catch (error) {
    console.error('Error checking API usage:', error);
    return 0; // Default to 0 if there's an error
  }
};
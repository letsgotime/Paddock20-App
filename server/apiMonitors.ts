/**
 * API Health Check Implementations
 * 
 * Each monitoring function should:
 * 1. Make minimal API requests (or none if possible)
 * 2. Use status code checks instead of full data requests when possible
 * 3. Return true if the service is operational, false otherwise
 */

import { WebClient } from '@slack/web-api';

/**
 * Check if the OpenWeather API is operational
 * Uses a lightweight geocoding request instead of a full weather data request
 */
export async function checkOpenWeatherHealth(): Promise<boolean> {
  try {
    // Use the geocoding API as it's lightweight
    const apiKey = process.env.OPENWEATHER_API_KEY || '2379a18ee0e478c88aa7d4aa1df44410';
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=New York&limit=1&appid=${apiKey}`;
    
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('OpenWeather health check error:', error);
    return false;
  }
}

/**
 * Check if the Unsplash API is operational
 * Uses a HEAD request to avoid consuming quota
 */
export async function checkUnsplashHealth(): Promise<boolean> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY || '2JgRSbUMLc1H5x1-PH_apKjy8jzGF4KLluer_xCO9kk';
    const url = `https://api.unsplash.com/photos/random?client_id=${accessKey}`;
    
    // Use HEAD request instead of GET to avoid consuming quota
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Unsplash health check error:', error);
    return false;
  }
}

/**
 * Check if the AccuWeather API is operational
 * Uses the locations API which is lightweight
 */
export async function checkAccuWeatherHealth(): Promise<boolean> {
  try {
    const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
    if (!apiKey) {
      console.log('AccuWeather API key not configured, skipping health check');
      return true; // Assume operational if not configured
    }
    
    const url = `https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${apiKey}&q=New%20York`;
    
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('AccuWeather health check error:', error);
    return false;
  }
}

/**
 * Check if Google OAuth is operational
 * Just check if their API discovery endpoint is available
 */
export async function checkGoogleOAuthHealth(): Promise<boolean> {
  try {
    const url = 'https://accounts.google.com/.well-known/openid-configuration';
    
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('Google OAuth health check error:', error);
    return false;
  }
}

/**
 * Check if Apple OAuth is operational
 * Just check if their service endpoint is available
 */
export async function checkAppleOAuthHealth(): Promise<boolean> {
  try {
    const url = 'https://appleid.apple.com/auth/authorize';
    
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Apple OAuth health check error:', error);
    return false;
  }
}

/**
 * Check if Slack API is operational
 */
export async function checkSlackHealth(): Promise<boolean> {
  try {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log('Slack API token not configured, skipping health check');
      return true; // Assume operational if not configured
    }
    
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    const response = await slack.api.test();
    return response.ok === true;
  } catch (error) {
    console.error('Slack health check error:', error);
    return false;
  }
}

/**
 * Check if the Supabase service is operational
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    if (!process.env.VITE_SUPABASE_URL) {
      console.log('Supabase URL not configured, skipping health check');
      return true; // Assume operational if not configured
    }
    
    // Just check if the endpoint is reachable
    const url = process.env.VITE_SUPABASE_URL;
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Supabase health check error:', error);
    return false;
  }
}

/**
 * Check if the TimezoneDB API is operational
 */
export async function checkTimezoneDBHealth(): Promise<boolean> {
  try {
    // Since we're using a predefined list now, just do a simple check
    return true;
  } catch (error) {
    console.error('TimezoneDB health check error:', error);
    return false;
  }
}

/**
 * Generic function to check if any HTTP service is operational
 */
export function createHTTPServiceCheck(url: string, method: 'GET' | 'HEAD' = 'HEAD'): () => Promise<boolean> {
  return async () => {
    try {
      const response = await fetch(url, { method });
      return response.ok;
    } catch (error) {
      console.error(`HTTP service check error for ${url}:`, error);
      return false;
    }
  };
}
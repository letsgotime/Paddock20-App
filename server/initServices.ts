/**
 * Service Registration Module
 * This module centralizes the registration of all monitored services
 */

import { registerService, CHECK_INTERVAL } from './healthMonitor';
import { 
  checkOpenWeatherHealth, 
  checkAccuWeatherHealth,
  checkUnsplashHealth,
  checkGoogleOAuthHealth,
  checkAppleOAuthHealth,
  checkSlackHealth,
  checkSupabaseHealth,
  checkTimezoneDBHealth,
  checkAviationstackHealth,
  checkSmartcarHealth
} from './apiMonitors';

/**
 * Register all API services with the health monitoring system
 */
export function registerAllServices(): void {
  console.log('Registering services with health monitoring system...');
  
  // Register OpenWeather API
  registerService(
    'OpenWeather API',
    'https://api.openweathermap.org',
    checkOpenWeatherHealth,
    CHECK_INTERVAL
  );
  console.log('Registered OpenWeather API for health monitoring');

  // Register AccuWeather API if API key is available
  if (process.env.VITE_ACCUWEATHER_API_KEY) {
    registerService(
      'AccuWeather API',
      'https://dataservice.accuweather.com',
      checkAccuWeatherHealth,
      CHECK_INTERVAL
    );
    console.log('Registered AccuWeather API for health monitoring');
  }

  // Register Unsplash API if API key is available
  if (process.env.UNSPLASH_ACCESS_KEY) {
    registerService(
      'Unsplash API',
      'https://api.unsplash.com',
      checkUnsplashHealth,
      CHECK_INTERVAL
    );
    console.log('Registered Unsplash API for health monitoring');
  }

  // Register Google OAuth always since it's a public service
  registerService(
    'Google OAuth',
    'https://accounts.google.com',
    checkGoogleOAuthHealth,
    CHECK_INTERVAL * 2 // Check less frequently - public service rarely goes down
  );
  console.log('Registered Google OAuth for health monitoring');

  // Register Apple OAuth always since it's a public service
  registerService(
    'Apple OAuth',
    'https://appleid.apple.com',
    checkAppleOAuthHealth,
    CHECK_INTERVAL * 2
  );
  console.log('Registered Apple OAuth for health monitoring');

  // Register Slack API if token is available
  if (process.env.SLACK_BOT_TOKEN) {
    registerService(
      'Slack API',
      'https://slack.com/api',
      checkSlackHealth,
      CHECK_INTERVAL
    );
    console.log('Registered Slack API for health monitoring');
  }

  // Register Supabase API if URL is available
  if (process.env.VITE_SUPABASE_URL) {
    registerService(
      'Supabase API',
      process.env.VITE_SUPABASE_URL,
      checkSupabaseHealth,
      CHECK_INTERVAL
    );
    console.log('Registered Supabase API for health monitoring');
  }

  // Register TimezoneDB API if key is available
  if (process.env.TIMEZONEDB_API_KEY) {
    registerService(
      'TimezoneDB API',
      'https://api.timezonedb.com',
      checkTimezoneDBHealth,
      CHECK_INTERVAL
    );
    console.log('Registered TimezoneDB API for health monitoring');
  }

  // Register Aviationstack API
  registerService(
    'Aviationstack API',
    'http://api.aviationstack.com',
    checkAviationstackHealth,
    CHECK_INTERVAL
  );
  console.log('Registered Aviationstack API for health monitoring');

  // Register Smartcar API if credentials are available
  if (process.env.SMARTCAR_CLIENT_ID && process.env.SMARTCAR_CLIENT_SECRET) {
    registerService(
      'Smartcar API',
      'https://auth.smartcar.com',
      checkSmartcarHealth,
      CHECK_INTERVAL
    );
    console.log('Registered Smartcar API for health monitoring');
  }

  console.log('Service registration complete');
}
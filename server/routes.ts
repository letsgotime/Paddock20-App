import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertVehicleSchema, 
  insertTireSchema, 
  insertMaintenanceRecordSchema, 
  insertMaintenanceFlagSchema, 
  insertGlossTrackingSchema,
  insertGlossLogSchema
} from "@shared/schema";
import { handleGoogleOAuth2Callback, handleAppleOAuth2Callback } from "./oauth";
import { checkSlackIntegration, initializeSlackClient, shareVehicleToSlack, shareEventToSlack } from "./slack";
import { setupAuth } from "./auth";
import twoFactorRoutes from "./routes/twoFactorRoutes";

// OpenWeather API keys - updated May 1, 2025
const OPENWEATHER_API_KEYS = {
  default: process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410", // General key
  onecall: process.env.ONECALL_API_KEY || "653c5104ce3e922c371a315209765d2f",     // Special key for 3.0
  test: "a92e04c47567a757154c09cffe03c6da",                                      // Test key
  city: "efb847e5d07e14ba140f7b62b960f46d",                                      // City lookup
  replit: "2f65956ce6685c39a594c3dd0bff75ea",                                    // Replit key
  backup: "76de113a4adab13f0e3b6a8b6510c2a9"                                     // Backup key
};

// Use the default key for general purposes
const OPENWEATHER_API_KEY = OPENWEATHER_API_KEYS.default;

// Special key for OneCall API 3.0
const ONECALL_API_KEY = OPENWEATHER_API_KEYS.onecall;

// Variable to store user-provided API keys
let userProvidedOpenWeatherKey: string | null = null;

// Cache structures for weather data to avoid repetitive API calls
interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Cache for weather data to reduce API calls
const weatherDataCache = new Map<string, CachedData<any>>();

// Cache for geocoding results to avoid repetitive API calls
const geocodeCache = new Map<string, CachedData<any>>();

// Legacy API Health Monitoring System
// This tracks the status of our external weather API - use the new global system instead
interface WeatherApiStatus {
  lastChecked: Date;
  isOperational: boolean;
  lastError: string | null;
  consecutiveFailures: number;
  checkInterval: number; // in milliseconds
}

// Rate limiter to prevent exceeding API limits
interface RateLimiter {
  oneCallLastCalled: Date | null;
  oneCallMinInterval: number; // minimum time between calls in milliseconds
  weatherLastCalled: Date | null;
  weatherMinInterval: number;
  forecastLastCalled: Date | null;
  forecastMinInterval: number;
  geocodeLastCalled: Date | null;
  geocodeMinInterval: number;
}

const apiHealthStatus: WeatherApiStatus = {
  lastChecked: new Date(0), // Set to epoch time to force immediate check
  isOperational: true, // Assume operational until first check
  lastError: null,
  consecutiveFailures: 0,
  checkInterval: CHECK_INTERVAL // 4 hours in milliseconds
};

// Initialize rate limiter to prevent hitting API rate limits
const rateLimiter: RateLimiter = {
  oneCallLastCalled: null,
  oneCallMinInterval: 60000, // 60 seconds between OneCall API requests - account is temporarily blocked
  weatherLastCalled: null,
  weatherMinInterval: 5000, // 5 seconds between Weather API requests
  forecastLastCalled: null,
  forecastMinInterval: 10000, // 10 seconds between Forecast API requests
  geocodeLastCalled: null,
  geocodeMinInterval: 5000 // 5 seconds between Geocode API requests
};

/**
 * Check if an API can be called based on rate limiting rules
 * @param apiType The type of API being called
 * @returns True if the API can be called, false if it should be rate limited
 */
function canCallApi(apiType: 'oneCall' | 'weather' | 'forecast' | 'geocode'): boolean {
  const now = new Date();
  
  switch (apiType) {
    case 'oneCall':
      if (!rateLimiter.oneCallLastCalled) {
        rateLimiter.oneCallLastCalled = now;
        return true;
      }
      
      const oneCallElapsed = now.getTime() - rateLimiter.oneCallLastCalled.getTime();
      if (oneCallElapsed < rateLimiter.oneCallMinInterval) {
        return false;
      }
      
      rateLimiter.oneCallLastCalled = now;
      return true;
      
    case 'weather':
      if (!rateLimiter.weatherLastCalled) {
        rateLimiter.weatherLastCalled = now;
        return true;
      }
      
      const weatherElapsed = now.getTime() - rateLimiter.weatherLastCalled.getTime();
      if (weatherElapsed < rateLimiter.weatherMinInterval) {
        return false;
      }
      
      rateLimiter.weatherLastCalled = now;
      return true;
      
    case 'forecast':
      if (!rateLimiter.forecastLastCalled) {
        rateLimiter.forecastLastCalled = now;
        return true;
      }
      
      const forecastElapsed = now.getTime() - rateLimiter.forecastLastCalled.getTime();
      if (forecastElapsed < rateLimiter.forecastMinInterval) {
        return false;
      }
      
      rateLimiter.forecastLastCalled = now;
      return true;
      
    case 'geocode':
      if (!rateLimiter.geocodeLastCalled) {
        rateLimiter.geocodeLastCalled = now;
        return true;
      }
      
      const geocodeElapsed = now.getTime() - rateLimiter.geocodeLastCalled.getTime();
      if (geocodeElapsed < rateLimiter.geocodeMinInterval) {
        return false;
      }
      
      rateLimiter.geocodeLastCalled = now;
      return true;
  }
}

// Debug value to track server restarts
const SERVER_START_TIME = new Date();

// List of common timezones for the WorldClock component
const commonTimezones = [
  // North America
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',

  // Europe
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Monaco',
  'Europe/Brussels',
  'Europe/Amsterdam',
  'Europe/Zurich',
  
  // Asia
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Dubai',
  'Asia/Shanghai',
  'Asia/Seoul',
  
  // Oceania
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  
  // South America
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  
  // Middle East & Africa
  'Africa/Johannesburg',
  'Africa/Cairo'
];

// Import health monitoring system
import {
  registerService,
  checkServiceHealth,
  startHealthMonitoring,
  CHECK_INTERVAL
} from './healthMonitor';

import {
  checkOpenWeatherHealth,
  checkUnsplashHealth,
  checkAccuWeatherHealth,
  checkGoogleOAuthHealth,
  checkAppleOAuthHealth,
  checkSlackHealth,
  checkSupabaseHealth,
  checkTimezoneDBHealth
} from './apiMonitors';

/**
 * Checks if the OpenWeather API is operational without making a full data request
 * This is a lightweight test that minimizes API usage - legacy function, use the monitor system instead
 */
async function checkWeatherApiHealth(): Promise<boolean> {
  // Delegate to the health monitoring system
  return await checkServiceHealth('OpenWeather API');
}

// Import 2FA routes
import twoFactorRoutes from './routes/twoFactorRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register the Two-Factor Authentication Routes
  app.use(twoFactorRoutes);
  // Setup user authentication system
  setupAuth(app);
  
  // Using only OpenWeather API for all weather services
  
  // Consolidated weather API endpoint
  app.get('/api/weather/consolidated', async (req, res) => {
    try {
      // Ensure we're only returning JSON
      res.setHeader('Content-Type', 'application/json');
      
      const { lat, lon, units = 'imperial' } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ 
          error: 'Missing required parameters: lat and lon are required' 
        });
      }
      
      // Generate a cache key based on coordinates and units
      const cacheKey = `consolidated:${lat}:${lon}:${units}`;
      
      // Check if we have valid cached data
      const now = Date.now();
      const cachedData = weatherDataCache.get(cacheKey);
      
      if (cachedData && (now - cachedData.timestamp < 2 * 60 * 60 * 1000)) {
        console.log(`Using cached consolidated weather data for ${lat},${lon}`);
        return res.json(cachedData.data);
      }
      
      // Initialize the API key to use - either user provided or default
      const apiKey = userProvidedOpenWeatherKey || OPENWEATHER_API_KEY;
      
      // Log for debugging
      console.log(`Using OpenWeather API key: ${apiKey}`);
      console.log(`OpenWeather API key from env: ${process.env.OPENWEATHER_API_KEY}`);
      
      // Make weather API request
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
      console.log(`Making request to: ${weatherUrl}`);
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      const weatherData = await weatherResponse.json();
      
      // Make forecast API request
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      const forecastData = await forecastResponse.json();
      
      // Make onecall API request - try/catch so we can still return weather data without OneCall
      let oneCallData;
      try {
        // Try the OneCall API key first
        const onecallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely&appid=${ONECALL_API_KEY || apiKey}`;
        const onecallResponse = await fetch(onecallUrl);
        if (!onecallResponse.ok) {
          console.warn(`OneCall API error: ${onecallResponse.status} - falling back to basic weather data`);
          // Generate basic equivalent to oneCallData from the weather and forecast data
          oneCallData = {
            lat: Number(lat),
            lon: Number(lon),
            timezone: "UTC", // Default since we don't have this data
            current: {
              dt: weatherData.dt,
              sunrise: weatherData.sys.sunrise,
              sunset: weatherData.sys.sunset,
              temp: weatherData.main.temp,
              feels_like: weatherData.main.feels_like,
              pressure: weatherData.main.pressure,
              humidity: weatherData.main.humidity,
              dew_point: 0, // Not available in basic API
              uvi: 0, // Not available in basic API
              clouds: weatherData.clouds.all,
              visibility: weatherData.visibility,
              wind_speed: weatherData.wind.speed,
              wind_deg: weatherData.wind.deg,
              weather: weatherData.weather,
              rain: weatherData.rain || {}
            },
            hourly: forecastData.list.slice(0, 24).map(item => ({
              dt: item.dt,
              temp: item.main.temp,
              feels_like: item.main.feels_like,
              pressure: item.main.pressure,
              humidity: item.main.humidity,
              dew_point: 0,
              uvi: 0,
              clouds: item.clouds.all,
              visibility: item.visibility || 10000,
              wind_speed: item.wind.speed,
              wind_deg: item.wind.deg,
              weather: item.weather,
              pop: item.pop || 0
            })),
            daily: [] // Not available from basic forecast, would require additional logic to generate
          };
        } else {
          oneCallData = await onecallResponse.json();
        }
      } catch (error) {
        console.error("Error fetching OneCall data, falling back to basic weather:", error);
        // Generate basic equivalent to oneCallData from the weather and forecast data
        oneCallData = {
          lat: Number(lat),
          lon: Number(lon),
          timezone: "UTC", // Default since we don't have this data
          current: {
            dt: weatherData.dt,
            sunrise: weatherData.sys.sunrise,
            sunset: weatherData.sys.sunset,
            temp: weatherData.main.temp,
            feels_like: weatherData.main.feels_like,
            pressure: weatherData.main.pressure,
            humidity: weatherData.main.humidity,
            dew_point: 0, // Not available in basic API
            uvi: 0, // Not available in basic API
            clouds: weatherData.clouds.all,
            visibility: weatherData.visibility,
            wind_speed: weatherData.wind.speed,
            wind_deg: weatherData.wind.deg,
            weather: weatherData.weather,
            rain: weatherData.rain || {}
          },
          hourly: forecastData.list.slice(0, 24).map(item => ({
            dt: item.dt,
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            pressure: item.main.pressure,
            humidity: item.main.humidity,
            dew_point: 0,
            uvi: 0,
            clouds: item.clouds.all,
            visibility: item.visibility || 10000,
            wind_speed: item.wind.speed,
            wind_deg: item.wind.deg,
            weather: item.weather,
            pop: item.pop || 0
          })),
          daily: [] // Not available from basic forecast, would require additional logic to generate
        };
      }
      
      // Create basic automotive weather data from OneCall data
      const automotiveWeatherData = {
        location: {
          lat: Number(lat),
          lon: Number(lon),
          timezone: oneCallData.timezone
        },
        current_time: new Date(oneCallData.current.dt * 1000).toISOString(),
        sunrise_time: new Date(oneCallData.current.sunrise * 1000).toISOString(),
        sunset_time: new Date(oneCallData.current.sunset * 1000).toISOString(),
        conditions: {
          summary: oneCallData.current.weather[0].description,
          icon: oneCallData.current.weather[0].icon,
          air_temperature: oneCallData.current.temp,
          feels_like: oneCallData.current.feels_like,
          humidity: oneCallData.current.humidity,
          pressure: oneCallData.current.pressure,
          wind_speed: oneCallData.current.wind_speed,
          wind_direction: oneCallData.current.wind_deg,
          cloud_cover: oneCallData.current.clouds,
          precipitation: oneCallData.current.rain ? oneCallData.current.rain['1h'] : 0,
          uv_index: oneCallData.current.uvi,
          solar_radiation: null
        },
        automotive_metrics: {
          track_surface: {
            temperature: Math.round(oneCallData.current.temp * 1.2), // Simplified estimate
            condition: oneCallData.current.rain ? 'Wet' : 'Dry',
            grip_level: oneCallData.current.rain ? 'Low' : 'High'
          },
          tire_temperature_estimates: {
            soft_compound: Math.round(oneCallData.current.temp * 1.5),
            medium_compound: Math.round(oneCallData.current.temp * 1.3),
            hard_compound: Math.round(oneCallData.current.temp * 1.1),
            street_performance: Math.round(oneCallData.current.temp * 1.2),
            all_season: Math.round(oneCallData.current.temp * 1.0)
          },
          drive_recommendations: {
            tire_warmup_minutes: {
              performance: oneCallData.current.temp < 60 ? 10 : 5,
              street: oneCallData.current.temp < 60 ? 7 : 3,
              all_season: oneCallData.current.temp < 60 ? 5 : 2
            },
            torque_management: {
              recommended_percentage: oneCallData.current.rain ? 70 : 100,
              traction_control: oneCallData.current.rain ? 'Recommended' : 'Optional'
            },
            tire_pressure_adjustment: oneCallData.current.temp < 50 ? 2 : 0,
            braking_points: oneCallData.current.rain ? 'Early' : 'Standard'
          },
          visibility_assessment: oneCallData.current.visibility > 9000 ? 'Excellent' : 'Reduced',
          sunglare_risk: (oneCallData.current.weather[0].id === 800 && 
                          oneCallData.current.dt > oneCallData.current.sunrise &&
                          oneCallData.current.dt < oneCallData.current.sunset) ? 'High' : 'Low'
        },
        hourly_forecast: oneCallData.hourly.slice(0, 12).map((hour: any) => ({
          time: new Date(hour.dt * 1000).toISOString(),
          temperature: hour.temp,
          conditions: hour.weather[0].description,
          precipitation_chance: hour.pop * 100
        })),
        alerts: oneCallData.alerts || [],
        data_sources: {
          weather: 'OpenWeather API',
          solar: 'Estimated'
        }
      };
      
      // Combine all data into a single response
      const consolidatedData = {
        weatherData,
        forecastData,
        oneCallData,
        automotiveWeatherData,
        timestamp: now
      };
      
      // Cache the response
      weatherDataCache.set(cacheKey, {
        data: consolidatedData,
        timestamp: now
      });
      
      // Send the consolidated response
      return res.json(consolidatedData);
    } catch (error: any) {
      console.error('Error in consolidated weather endpoint:', error.message);
      
      // Check if error is due to rate limiting
      if (error.response && error.response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          message: error.message
        });
      }
      
      return res.status(500).json({
        error: 'Failed to fetch weather data',
        message: error.message
      });
    }
  });
  
  // Immediately check API health on startup
  await checkWeatherApiHealth();
  
  // Simple test endpoint for debugging
  app.get('/api/test', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({
      message: 'API test endpoint is working',
      server_start_time: SERVER_START_TIME.toISOString(),
      current_time: new Date().toISOString(),
      openweather_api_key_length: OPENWEATHER_API_KEY ? OPENWEATHER_API_KEY.length : 0,
      source: 'direct-api'
    });
  });
  
  // Environment variables check endpoint
  app.get('/api/env-check', (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Check for existence of environment variables without exposing their values
    const envStatus = {
      OPENWEATHER_API_KEY: {
        exists: Boolean(process.env.OPENWEATHER_API_KEY),
        length: process.env.OPENWEATHER_API_KEY?.length || 0
      },
      UNSPLASH_ACCESS_KEY: {
        exists: Boolean(process.env.UNSPLASH_ACCESS_KEY),
        length: process.env.UNSPLASH_ACCESS_KEY?.length || 0,
        value_first_char: process.env.UNSPLASH_ACCESS_KEY ? process.env.UNSPLASH_ACCESS_KEY.charAt(0) : null
      },
      VITE_UNSPLASH_ACCESS_KEY: {
        exists: Boolean(process.env.VITE_UNSPLASH_ACCESS_KEY),
        length: process.env.VITE_UNSPLASH_ACCESS_KEY?.length || 0,
        value_first_char: process.env.VITE_UNSPLASH_ACCESS_KEY ? process.env.VITE_UNSPLASH_ACCESS_KEY.charAt(0) : null
      },
      VITE_ACCUWEATHER_API_KEY: {
        exists: Boolean(process.env.VITE_ACCUWEATHER_API_KEY),
        length: process.env.VITE_ACCUWEATHER_API_KEY?.length || 0
      },
      SLACK_BOT_TOKEN: {
        exists: Boolean(process.env.SLACK_BOT_TOKEN)
      },
      SLACK_CHANNEL_ID: {
        exists: Boolean(process.env.SLACK_CHANNEL_ID)
      },
      NODE_ENV: process.env.NODE_ENV
    };
    
    res.json({
      env_status: envStatus,
      timestamp: new Date().toISOString()
    });
  });
  
  // Unsplash health check endpoint
  app.get('/api/unsplash-health', async (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || process.env.VITE_UNSPLASH_ACCESS_KEY;
    
    if (!unsplashKey) {
      return res.status(500).json({
        status: 'error',
        message: 'Unsplash API key not found in environment',
        env_vars: {
          UNSPLASH_ACCESS_KEY_exists: Boolean(process.env.UNSPLASH_ACCESS_KEY),
          VITE_UNSPLASH_ACCESS_KEY_exists: Boolean(process.env.VITE_UNSPLASH_ACCESS_KEY)
        }
      });
    }
    
    try {
      // Try a simple request to the Unsplash API
      const response = await fetch(`https://api.unsplash.com/photos/random?client_id=${unsplashKey}`);
      
      if (response.ok) {
        const data = await response.json();
        res.json({
          status: 'operational',
          message: 'Unsplash API is working',
          details: {
            photo_id: data.id,
            username: data.user?.username
          }
        });
      } else {
        const errorText = await response.text();
        res.status(response.status).json({
          status: 'error',
          message: `Unsplash API returned error: ${response.status}`,
          details: errorText
        });
      }
    } catch (error) {
      console.error('Unsplash health check error:', error);
      res.status(500).json({
        status: 'error',
        message: (error as Error).message
      });
    }
  });
  
  // API Key validation endpoints
  app.post('/api/validate-key/openweather', async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ valid: false, message: 'API key is required' });
      }
      
      // Make a test call to the OpenWeather API to validate the key
      const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`;
      const response = await fetch(testUrl);
      
      if (response.ok) {
        // Store the key in memory for server-side use
        console.log(`User-provided OpenWeather API key validated successfully`);
        
        return res.json({ valid: true });
      } else {
        const errorData = await response.json();
        return res.status(400).json({ 
          valid: false, 
          message: `OpenWeather API key validation failed: ${errorData.message || response.statusText}`
        });
      }
    } catch (error) {
      console.error('Error validating OpenWeather API key:', error);
      res.status(500).json({ 
        valid: false, 
        message: error instanceof Error ? error.message : 'Unknown error validating API key'
      });
    }
  });
  
  // Endpoint to use a user-provided API key for subsequent requests
  app.post('/api/use-key', (req, res) => {
    try {
      const { service, apiKey } = req.body;
      
      if (!service || !apiKey) {
        return res.status(400).json({ success: false, message: 'Service and API key are required' });
      }
      
      // For OpenWeather, store the key in a special variable that will be checked in the openweather routes
      if (service === 'openweather') {
        userProvidedOpenWeatherKey = apiKey;
        console.log(`Using user-provided OpenWeather API key for future requests`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error storing user-provided API key:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error storing API key'
      });
    }
  });
  
  // Weather API proxy routes
  app.get('/api/weather', async (req, res) => {
    try {
      // Check API health status and schedule check if needed
      const isHealthy = await checkWeatherApiHealth();
      if (!isHealthy) {
        console.warn('OpenWeather API may be experiencing issues. Attempting request anyway...');
      }

      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      // Check rate limiting
      if (!canCallApi('weather')) {
        return res.status(429).json({ 
          message: 'Rate limit exceeded. Please try again in a few seconds.',
          rateLimit: true,
          retryAfter: Math.ceil(rateLimiter.weatherMinInterval / 1000)
        });
      }
      
      // Generate cache key
      const cacheKey = `weather:${lat}:${lon}:${units || 'metric'}`;
      
      // Check cache - extended to 60 minutes to prevent rate limiting
      const cachedData = weatherDataCache.get(cacheKey);
      if (cachedData && (new Date().getTime() - cachedData.timestamp < 60 * 60 * 1000)) {
        console.log(`Using cached weather data for: ${lat},${lon}`);
        return res.json(cachedData.data);
      }

      // Use user-provided key if available, otherwise use the default key
      const apiKey = userProvidedOpenWeatherKey || OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      
      console.log(`Fetching OpenWeather data for: ${lat},${lon}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Update health status on failure
        apiHealthStatus.isOperational = false;
        apiHealthStatus.lastError = `Weather API error: ${response.status}`;
        apiHealthStatus.consecutiveFailures += 1;
        throw new Error(`Weather API error: ${response.status} - ${await response.text()}`);
      }
      
      // Reset failure count on success
      if (apiHealthStatus.consecutiveFailures > 0) {
        apiHealthStatus.consecutiveFailures = 0;
        apiHealthStatus.isOperational = true;
        apiHealthStatus.lastError = null;
      }
      
      const data = await response.json();
      
      // Cache the response
      weatherDataCache.set(cacheKey, {
        data,
        timestamp: new Date().getTime()
      });
      
      res.json(data);
    } catch (error) {
      console.error('OpenWeather API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch weather data' });
    }
  });

  app.get('/api/forecast', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      // Use user-provided key if available, otherwise use the default key
      const apiKey = userProvidedOpenWeatherKey || OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('OpenWeather Forecast API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch forecast data' });
    }
  });
  
  // OneCall API route
  app.get('/api/onecall', async (req, res) => {
    try {
      const { lat, lon, units, exclude } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      // Check rate limiting
      if (!canCallApi('oneCall')) {
        return res.status(429).json({ 
          message: 'Rate limit exceeded. Please try again in a few seconds.',
          rateLimit: true,
          retryAfter: Math.ceil(rateLimiter.oneCallMinInterval / 1000)
        });
      }
      
      // Generate cache key
      const cacheKey = `onecall:${lat}:${lon}:${units || 'metric'}:${exclude || ''}`;
      
      // Check cache - OneCall data expires after 2 hours (increased to reduce API calls due to rate limiting)
      const cachedData = weatherDataCache.get(cacheKey);
      if (cachedData && (new Date().getTime() - cachedData.timestamp < 120 * 60 * 1000)) {
        console.log(`Using cached OneCall data for: ${lat},${lon}`);
        return res.json(cachedData.data);
      }
      
      // TEMPORARY SOLUTION: If we reach here, we need to fallback to latest cached data or sample data
      // Look for any cached data for this location first (from any unit type)
      for (const [key, value] of weatherDataCache.entries()) {
        if (key.startsWith(`onecall:${lat}:${lon}`)) {
          console.log(`Using older cached OneCall data for: ${lat},${lon} (cache key: ${key})`);
          return res.json(value.data);
        }
      }
      
      // If no cached data found for this location, provide fallback sample data
      console.log(`No cached OneCall data available for: ${lat},${lon}. Using fallback data.`);
      
      // Use fallback sample data (based on previous successful API call)
      const fallbackData = {
        "lat": parseFloat(lat as string),
        "lon": parseFloat(lon as string),
        "timezone": "America/New_York",
        "timezone_offset": -14400,
        "current": {
          "dt": Math.floor(Date.now() / 1000),
          "sunrise": Math.floor(Date.now() / 1000) - 10800,
          "sunset": Math.floor(Date.now() / 1000) + 10800,
          "temp": 72.1,
          "feels_like": 71.8,
          "pressure": 1018,
          "humidity": 52,
          "dew_point": 52.9,
          "uvi": 8.6,
          "clouds": 5,
          "visibility": 10000,
          "wind_speed": 6.91,
          "wind_deg": 230,
          "wind_gust": 12.5,
          "weather": [
            {
              "id": 800,
              "main": "Clear",
              "description": "clear sky",
              "icon": "01d"
            }
          ]
        },
        "daily": [
          {
            "dt": Math.floor(Date.now() / 1000),
            "sunrise": Math.floor(Date.now() / 1000) - 10800,
            "sunset": Math.floor(Date.now() / 1000) + 10800,
            "temp": {
              "day": 72.1,
              "min": 52.3,
              "max": 74.2,
              "night": 61.3,
              "eve": 70.3,
              "morn": 53.1
            },
            "feels_like": {
              "day": 71.8,
              "night": 60.8,
              "eve": 69.6,
              "morn": 52.9
            },
            "pressure": 1018,
            "humidity": 52,
            "weather": [
              {
                "id": 800,
                "main": "Clear",
                "description": "clear sky",
                "icon": "01d"
              }
            ],
            "clouds": 5,
            "pop": 0,
            "uvi": 8.6
          }
        ],
        "_info": "IMPORTANT: This is fallback data because the API is temporarily unavailable. API will be active in 24 hours."
      };
      
      // Cache the fallback data with current timestamp
      weatherDataCache.set(cacheKey, {
        data: fallbackData,
        timestamp: new Date().getTime()
      });
      
      res.json(fallbackData);
      return;
      
      // The following code is temporarily disabled until API rate limit resets
      /* 
      let response;
      let data;
      let errorMessages = [];
      
      // Use user-provided key if available, otherwise use the primary key
      const primaryKey = userProvidedOpenWeatherKey || ONECALL_API_KEY;
      const primaryUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units || 'metric'}${exclude ? `&exclude=${exclude}` : ''}&appid=${primaryKey}`;
      
      // Log the endpoint being used (without exposing API key)
      console.log(`Using OneCall API 3.0 endpoint with lat=${lat}, lon=${lon}, units=${units || 'metric'}`);
      console.log(`Fetching OneCall data for: ${lat},${lon}`);
      
      try {
        // First try with the primary key
        response = await fetch(primaryUrl);
        
        if (response.ok) {
          data = await response.json();
        } else {
          // If primary key fails with 429 (rate limit), try backup keys
          const errorText = await response.text();
          errorMessages.push(`Primary key failed: ${response.status} - ${errorText}`);
          
          if (response.status === 429) {
            console.log('OneCall API rate limited, trying backup keys...');
            
            // Try alternative keys in sequence
            const backupKeys = ['backup', 'test', 'city', 'replit'];
            
            for (const keyName of backupKeys) {
              const apiKey = OPENWEATHER_API_KEYS[keyName];
              if (!apiKey) continue;
              
              console.log(`Trying backup key: ${keyName}`);
              const backupUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units || 'metric'}${exclude ? `&exclude=${exclude}` : ''}&appid=${apiKey}`;
              
              try {
                const backupResponse = await fetch(backupUrl);
                
                if (backupResponse.ok) {
                  console.log(`Backup key ${keyName} worked successfully`);
                  data = await backupResponse.json();
                  break; // Success! Exit the loop
                } else {
                  const backupErrorText = await backupResponse.text();
                  errorMessages.push(`Backup key ${keyName} failed: ${backupResponse.status} - ${backupErrorText}`);
                }
              } catch (backupError) {
                errorMessages.push(`Backup key ${keyName} error: ${(backupError as Error).message}`);
              }
            }
          }
        }
      } catch (error) {
        errorMessages.push(`Primary request error: ${(error as Error).message}`);
      }
      
      // If all attempts failed, throw an error with details
      if (!data) {
        throw new Error(`OneCall API error: All keys failed. Details: ${errorMessages.join(' | ')}`);
      }
      
      // Cache the response
      weatherDataCache.set(cacheKey, {
        data,
        timestamp: new Date().getTime()
      });
      
      res.json(data);
      */
    } catch (error) {
      console.error('OpenWeather OneCall API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch OneCall data' });
    }
  });
  
  // Geocoding API to search for locations by name
  app.get('/api/geocode', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const limit = 5; // Limit number of results
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=${limit}&appid=${OPENWEATHER_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Geocoding API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to search location' });
    }
  });
  
  // Reverse geocoding API to get location name from coordinates
  app.get('/api/reverse-geocode', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Reverse geocoding API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to get location name' });
    }
  });
  
  // Time zone API for the WorldClock component
  app.get('/api/timezones', (req, res) => {
    try {
      // Return the predefined list of common timezones
      res.json(commonTimezones);
    } catch (error) {
      console.error('Error fetching timezones:', error);
      res.status(500).json({ message: 'Failed to fetch timezones' });
    }
  });
  
  // API Key testing endpoint - tests all keys against all services
  app.get('/api/test-weather-keys', async (req, res) => {
    try {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Test location - Charlotte, NC
      const lat = 35.2271;
      const lon = -80.8431;
      
      // Results object to store test results for each key
      const results: Record<string, any> = {};
      
      // Test each key against each service
      for (const [keyName, apiKey] of Object.entries(OPENWEATHER_API_KEYS)) {
        results[keyName] = {
          key: apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4), // Show only first/last 4 chars
          weather: { status: 'not_tested' },
          forecast: { status: 'not_tested' },
          onecall_v25: { status: 'not_tested' },
          onecall_v30: { status: 'not_tested' },
          geocode: { status: 'not_tested' }
        };
        
        // Test Current Weather API
        try {
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
          const weatherResponse = await fetch(weatherUrl);
          
          if (weatherResponse.ok) {
            results[keyName].weather = { 
              status: 'success',
              code: weatherResponse.status
            };
          } else {
            const errorText = await weatherResponse.text();
            results[keyName].weather = { 
              status: 'error',
              code: weatherResponse.status,
              message: errorText
            };
          }
        } catch (error) {
          results[keyName].weather = { 
            status: 'error',
            message: (error as Error).message
          };
        }
        
        // Test OneCall API 2.5
        try {
          const onecallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
          const onecallResponse = await fetch(onecallUrl);
          
          if (onecallResponse.ok) {
            results[keyName].onecall_v25 = { 
              status: 'success',
              code: onecallResponse.status
            };
          } else {
            const errorText = await onecallResponse.text();
            results[keyName].onecall_v25 = { 
              status: 'error',
              code: onecallResponse.status,
              message: errorText
            };
          }
        } catch (error) {
          results[keyName].onecall_v25 = { 
            status: 'error',
            message: (error as Error).message
          };
        }
        
        // Test OneCall API 3.0
        try {
          const onecall3Url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
          const onecall3Response = await fetch(onecall3Url);
          
          if (onecall3Response.ok) {
            results[keyName].onecall_v30 = { 
              status: 'success',
              code: onecall3Response.status
            };
          } else {
            const errorText = await onecall3Response.text();
            results[keyName].onecall_v30 = { 
              status: 'error',
              code: onecall3Response.status,
              message: errorText
            };
          }
        } catch (error) {
          results[keyName].onecall_v30 = { 
            status: 'error',
            message: (error as Error).message
          };
        }
        
        // Test Geocoding API
        try {
          const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=Charlotte&limit=1&appid=${apiKey}`;
          const geocodeResponse = await fetch(geocodeUrl);
          
          if (geocodeResponse.ok) {
            results[keyName].geocode = { 
              status: 'success',
              code: geocodeResponse.status
            };
          } else {
            const errorText = await geocodeResponse.text();
            results[keyName].geocode = { 
              status: 'error',
              code: geocodeResponse.status,
              message: errorText
            };
          }
        } catch (error) {
          results[keyName].geocode = { 
            status: 'error',
            message: (error as Error).message
          };
        }
        
        // Test Forecast API
        try {
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
          const forecastResponse = await fetch(forecastUrl);
          
          if (forecastResponse.ok) {
            results[keyName].forecast = { 
              status: 'success',
              code: forecastResponse.status
            };
          } else {
            const errorText = await forecastResponse.text();
            results[keyName].forecast = { 
              status: 'error',
              code: forecastResponse.status,
              message: errorText
            };
          }
        } catch (error) {
          results[keyName].forecast = { 
            status: 'error',
            message: (error as Error).message
          };
        }
      }
      
      res.json({
        message: 'API key testing completed',
        timestamp: new Date().toISOString(),
        results
      });
    } catch (error) {
      console.error('API key testing error:', error);
      res.status(500).json({ 
        status: 'error',
        message: (error as Error).message
      });
    }
  });

  // API Health check endpoint
  app.get('/api/weather-health', async (req, res) => {
    try {
      // Force a health check regardless of time interval
      apiHealthStatus.lastChecked = new Date(0); // Set to epoch time to force check
      const isOperational = await checkWeatherApiHealth();
      
      res.json({
        status: isOperational ? 'operational' : 'degraded',
        lastChecked: apiHealthStatus.lastChecked,
        consecutiveFailures: apiHealthStatus.consecutiveFailures,
        lastError: apiHealthStatus.lastError
      });
    } catch (error) {
      console.error('Health check endpoint error:', error);
      res.status(500).json({ 
        status: 'error',
        message: (error as Error).message
      });
    }
  });

  // Dew point calculation function using Magnus-Tetens formula
  function calculateDewPoint(tempCelsius: number, relativeHumidity: number): number {
    // Convert temp to Celsius if using imperial units
    const tempC = tempCelsius > 100 ? (tempCelsius - 32) * 5/9 : tempCelsius;
    
    // Constants for the Magnus-Tetens formula
    const a = 17.27;
    const b = 237.7;
    
    // Calculate the gamma value
    const gamma = (a * tempC) / (b + tempC) + Math.log(relativeHumidity / 100.0);
    
    // Calculate the dew point
    const dewPoint = (b * gamma) / (a - gamma);
    
    return Math.round(dewPoint * 10) / 10; // Round to 1 decimal place
  }

  // Advanced Automotive Weather API with F1-level metrics
  app.get('/api/automotive-weather', async (req, res) => {
    console.log('Automotive weather API called with params:', req.query);
    try {
      const { lat, lon, units = 'imperial' } = req.query;

      if (!lat || !lon) {
        console.log('Missing lat or lon params');
        return res.status(400).json({ error: "Missing latitude or longitude" });
      }
      
      // Generate cache key
      const cacheKey = `automotive:${lat}:${lon}:${units}`;
      
      // Check cache - Automotive weather data expires after 2 hours
      const cachedData = weatherDataCache.get(cacheKey);
      if (cachedData && (new Date().getTime() - cachedData.timestamp < 120 * 60 * 1000)) {
        console.log(`Using cached automotive weather data for: ${lat},${lon}`);
        return res.json(cachedData.data);
      }

      // Fetch standard weather data first
      let weatherData;
      
      // Attempt to fetch real data
      try {
        console.log(`Fetching weather data from OpenWeather for automotive calculations: lat=${lat}, lon=${lon}`);
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`
        );
        
        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          console.error(`OpenWeather API error: ${weatherResponse.status} - ${errorText}`);
          throw new Error(`OpenWeather API error: ${weatherResponse.status} - ${errorText}`);
        }
        
        weatherData = await weatherResponse.json();
        console.log('Successfully fetched weather data from OpenWeather');
      } catch (fetchError) {
        console.log('Failed to fetch current weather for automotive data. Using fallback data.', fetchError);
        
        // Use fallback data based on the most recent recording when API is unavailable
        weatherData = {
          main: {
            temp: 72.1, 
            feels_like: 71.8,
            humidity: 52,
            pressure: 1018
          },
          wind: {
            speed: 6.91,
            deg: 230
          },
          weather: [
            {
              main: "Clear",
              description: "clear sky",
              icon: "01d"
            }
          ],
          visibility: 10000,
          clouds: {
            all: 5
          },
          rain: null,
          snow: null,
          _info: "FALLBACK DATA: API will be active in 24 hours"
        };
      }
      
      // If there's no weather data at this point, return a default response
      if (!weatherData) {
        console.error("Failed to get any weather data for automotive calculations");
        // Return a default response with basic weather data
        return res.json({
          lat: parseFloat(lat as string),
          lon: parseFloat(lon as string),
          surfaces: {
            asphalt: { 
              temperature: 70,
              condition: "Dry",
              gripLevel: "Moderate"
            },
            concrete: {
              temperature: 68,
              condition: "Dry",
              gripLevel: "Moderate"
            }
          },
          performance: {
            tireWarmupTime: {
              sport: 2,
              summer: 5,
              allSeason: 8,
              winter: 12
            },
            enginePerformance: {
              airDensityFactor: 0.95,
              powerAdjustment: 0,
              torqueAdjustment: 0
            },
            aerodynamicPerformance: {
              efficiency: 0.85,
              downforceAdjustment: 0
            },
            coolingEfficiency: 0.85,
            brakingPerformance: {
              effectiveCoefficient: 0.85,
              distanceAdjustment: 0,
              heatDissipation: "Normal"
            }
          },
          drivingConditions: {
            riskLevel: "Low",
            traction: "Good",
            visibility: "Excellent",
            advisories: ["Normal driving conditions", "No special precautions needed"]
          }
        });
      }
      
      // Calculate automotive specific data
      
      // Calculate surface temperatures (asphalt gets hotter than air temp in sun, cooler in rain)
      const temp = weatherData.main.temp;
      const clouds = weatherData.clouds?.all || 0;
      const weatherCondition = weatherData.weather[0]?.main?.toLowerCase() || '';
      const humidity = weatherData.main.humidity;
      const windSpeed = weatherData.wind?.speed || 0;
      const rain = weatherData.rain?.['1h'] || 0;
      const snow = weatherData.snow?.['1h'] || 0;
      const visibility = weatherData.visibility || 10000;
      const pressure = weatherData.main.pressure;
      
      // Calculate dew point temperature (essential weather data)
      const dewPoint = calculateDewPoint(temp, humidity);
      
      // Surface temperature calculations
      const asphaltTemp = calculateAsphaltTemp(temp, clouds, weatherCondition, rain, snow);
      const concreteTemp = calculateConcreteTemp(temp, clouds, weatherCondition, rain, snow);
      
      // Surface condition based on weather
      const surfaceCondition = getSurfaceCondition(weatherCondition, rain, snow, temp);
      
      // Grip levels based on conditions
      const asphaltGrip = calculateGripLevel(surfaceCondition, asphaltTemp, humidity);
      const concreteGrip = calculateGripLevel(surfaceCondition, concreteTemp, humidity);
      
      // Tire warmup calculations (in minutes)
      const tireWarmup = {
        sport: calculateTireWarmup(temp, surfaceCondition, 'sport'),
        summer: calculateTireWarmup(temp, surfaceCondition, 'summer'),
        allSeason: calculateTireWarmup(temp, surfaceCondition, 'allSeason'),
        winter: calculateTireWarmup(temp, surfaceCondition, 'winter')
      };
      
      // Engine performance adjustments
      const airDensityFactor = calculateAirDensityFactor(temp, pressure, humidity);
      const powerAdjustment = calculatePowerAdjustment(airDensityFactor, temp);
      const torqueAdjustment = calculateTorqueAdjustment(airDensityFactor);
      
      // Aerodynamic performance
      const aeroEfficiency = calculateAeroEfficiency(temp, windSpeed);
      const downforceAdjustment = calculateDownforceAdjustment(temp, airDensityFactor);
      
      // Cooling efficiency
      const coolingEfficiency = calculateCoolingEfficiency(temp, windSpeed, humidity);
      
      // Braking performance
      const brakingEfficiency = calculateBrakingEfficiency(surfaceCondition, asphaltTemp);
      const brakingDistanceAdjustment = calculateBrakingDistanceAdjustment(brakingEfficiency);
      const heatDissipation = getHeatDissipationRate(temp, humidity, windSpeed);
      
      // Risk assessment
      const riskLevel = calculateRiskLevel(weatherCondition, visibility, windSpeed, rain, snow);
      const tractionLevel = getTractionLevel(surfaceCondition, asphaltGrip);
      const visibilityLevel = getVisibilityLevel(visibility, weatherCondition);
      
      // Generate driving advisories based on conditions
      const advisories = generateDrivingAdvisories(weatherCondition, riskLevel, surfaceCondition, temp);
      
      // F1-style automotive weather response - restructured to match client expectations
      const automotiveWeatherData = {
        location: {
          lat: parseFloat(lat as string),
          lon: parseFloat(lon as string),
          timezone: weatherData.timezone || "America/New_York"
        },
        current_time: new Date().toISOString(),
        sunrise_time: new Date(new Date().setHours(6, 30, 0, 0)).toISOString(), // Fallback
        sunset_time: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(), // Fallback
        
        // Basic weather conditions
        conditions: {
          summary: weatherData.weather[0]?.description || weatherCondition,
          icon: weatherData.weather[0]?.icon || "01d",
          air_temperature: temp,
          feels_like: weatherData.main?.feels_like || temp,
          humidity: humidity,
          pressure: pressure,
          wind_speed: windSpeed,
          wind_direction: weatherData.wind?.deg || 0,
          cloud_cover: clouds,
          precipitation: rain + snow,
          uv_index: 2, // Default UV value
          solar_radiation: null
        },
        
        // Automotive metrics - matching the expected client interface
        automotive_metrics: {
          track_surface: {
            temperature: asphaltTemp,
            condition: surfaceCondition,
            grip_level: asphaltGrip
          },
          tire_temperature_estimates: {
            soft_compound: asphaltTemp + 15,
            medium_compound: asphaltTemp + 10,
            hard_compound: asphaltTemp + 5,
            street_performance: asphaltTemp + 7,
            all_season: asphaltTemp + 2
          },
          drive_recommendations: {
            tire_warmup_minutes: {
              performance: tireWarmup.sport,
              street: tireWarmup.summer,
              all_season: tireWarmup.allSeason
            },
            torque_management: {
              recommended_percentage: Math.round(100 - (riskLevel === "High" ? 30 : riskLevel === "Moderate" ? 15 : 0)),
              traction_control: riskLevel === "High" ? "On" : riskLevel === "Moderate" ? "Sport" : "Driver Choice"
            },
            tire_pressure_adjustment: surfaceCondition === "Wet" ? -2 : asphaltTemp > 90 ? 1 : 0,
            braking_points: "Standard"
          },
          visibility_assessment: visibilityLevel,
          sunglare_risk: weatherCondition === "clear" && clouds < 30 ? "Moderate" : "Low"
        },
        
        // Hourly forecast stub
        hourly_forecast: [
          {
            time: new Date().toISOString(),
            temperature: temp,
            conditions: weatherData.weather[0]?.main || weatherCondition,
            precipitation_chance: 0
          }
        ],
        
        // Alerts
        alerts: [],
        
        // Data sources
        data_sources: {
          weather: "OpenWeatherMap",
          solar: "Estimated"
        }
      };
      
      console.log('Successfully generated automotive weather data, sending response');
      return res.json(automotiveWeatherData);
    } catch (error) {
      console.error("Error generating automotive weather data:", error);
      // Send a default response instead of an error
      console.log('Sending fallback response due to error');
      // Using consistent structure with the primary response
      return res.json({
        location: {
          lat: parseFloat(req.query.lat as string),
          lon: parseFloat(req.query.lon as string),
          timezone: "America/New_York"
        },
        current_time: new Date().toISOString(),
        sunrise_time: new Date(new Date().setHours(6, 30, 0, 0)).toISOString(),
        sunset_time: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
        
        conditions: {
          summary: "Clear sky",
          icon: "01d",
          air_temperature: 72,
          feels_like: 72,
          humidity: 50,
          pressure: 1013,
          wind_speed: 5,
          wind_direction: 180,
          cloud_cover: 10,
          precipitation: 0,
          uv_index: 2,
          solar_radiation: null
        },
        
        automotive_metrics: {
          track_surface: {
            temperature: 78,
            condition: "Dry",
            grip_level: "Optimal"
          },
          tire_temperature_estimates: {
            soft_compound: 93,
            medium_compound: 88,
            hard_compound: 83,
            street_performance: 85,
            all_season: 80
          },
          drive_recommendations: {
            tire_warmup_minutes: {
              performance: 2,
              street: 5,
              all_season: 8
            },
            torque_management: {
              recommended_percentage: 100,
              traction_control: "Driver Choice"
            },
            tire_pressure_adjustment: 0,
            braking_points: "Standard"
          },
          visibility_assessment: "Excellent",
          sunglare_risk: "Low"
        },
        
        hourly_forecast: [
          {
            time: new Date().toISOString(),
            temperature: 72,
            conditions: "Clear",
            precipitation_chance: 0
          }
        ],
        
        alerts: [],
        
        data_sources: {
          weather: "Fallback Data",
          solar: "Estimated"
        }
      });
    }
  });
  
  // Helper functions for automotive weather calculations
  
  // Calculate asphalt temperature based on air temperature and conditions
  function calculateAsphaltTemp(airTemp: number, cloudCover: number, weatherCondition: string, rain: number, snow: number): number {
    // Base calculation: asphalt heats up more than air temperature in sun
    let asphaltTemp = airTemp;
    
    // Adjust for cloud cover (less sun = less surface heating)
    const sunExposureFactor = 1 - (cloudCover / 100) * 0.7;
    
    // In sunny conditions, asphalt can be 20-30 degrees hotter than air
    if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
      asphaltTemp += 20 * sunExposureFactor;
    } else if (cloudCover < 70 && !weatherCondition.includes('rain') && !weatherCondition.includes('snow')) {
      // Partly cloudy still allows some heating
      asphaltTemp += 10 * sunExposureFactor;
    }
    
    // Rain and snow cool the surface
    if (rain > 0) {
      asphaltTemp -= Math.min(10, rain * 5); // More rain, more cooling
    }
    
    if (snow > 0) {
      asphaltTemp = Math.min(asphaltTemp, 32); // Snow keeps surface at or below freezing
    }
    
    return asphaltTemp;
  }
  
  // Calculate concrete temperature (generally cooler than asphalt)
  function calculateConcreteTemp(airTemp: number, cloudCover: number, weatherCondition: string, rain: number, snow: number): number {
    // Concrete heats up less than asphalt but retains heat longer
    const asphaltTemp = calculateAsphaltTemp(airTemp, cloudCover, weatherCondition, rain, snow);
    
    // Concrete temperature is typically 70-80% of the differential between asphalt and air
    const differential = asphaltTemp - airTemp;
    return airTemp + (differential * 0.75);
  }
  
  // Determine surface condition based on weather
  function getSurfaceCondition(weatherCondition: string, rain: number, snow: number, temp: number): string {
    if (snow > 0) {
      return 'Snow-covered';
    }
    
    if (rain > 0.5) {
      return 'Wet';
    }
    
    if (rain > 0 && rain <= 0.5) {
      return 'Damp';
    }
    
    if (weatherCondition.includes('fog') || weatherCondition.includes('mist')) {
      return 'Moist';
    }
    
    if (temp < 32) {
      return 'Cold';
    }
    
    if (temp > 90) {
      return 'Hot';
    }
    
    return 'Dry';
  }
  
  // Calculate grip level based on surface condition
  function calculateGripLevel(surfaceCondition: string, surfaceTemp: number, humidity: number): string {
    if (surfaceCondition === 'Snow-covered') {
      return 'Extremely Low';
    }
    
    if (surfaceCondition === 'Wet') {
      return 'Low';
    }
    
    if (surfaceCondition === 'Damp' || surfaceCondition === 'Moist') {
      return 'Moderate';
    }
    
    if (surfaceCondition === 'Cold' && surfaceTemp < 45) {
      return 'Reduced';
    }
    
    if (surfaceCondition === 'Hot' && surfaceTemp > 130) {
      return 'Degrading';
    }
    
    if (humidity > 85) {
      return 'Slightly Reduced';
    }
    
    return 'Optimal';
  }
  
  // Calculate tire warmup time in minutes
  function calculateTireWarmup(airTemp: number, surfaceCondition: string, tireType: string): number {
    // Base warmup times by tire type (minutes)
    const baseWarmup = {
      sport: 3,
      summer: 5,
      allSeason: 7,
      winter: 10
    };
    
    // Temperature adjustment factor
    let tempFactor = 1.0;
    
    if (airTemp < 40) {
      tempFactor = 1.8; // Cold temps require longer warmup
    } else if (airTemp < 55) {
      tempFactor = 1.4;
    } else if (airTemp > 85) {
      tempFactor = 0.8; // Hot temps shorten warmup
    }
    
    // Surface condition adjustment
    let surfaceFactor = 1.0;
    
    if (surfaceCondition === 'Wet' || surfaceCondition === 'Damp') {
      surfaceFactor = 1.5;
    } else if (surfaceCondition === 'Snow-covered') {
      surfaceFactor = 2.0;
    } else if (surfaceCondition === 'Cold') {
      surfaceFactor = 1.3;
    }
    
    // Calculate adjusted warmup time and round to nearest half minute
    return Math.round(baseWarmup[tireType as keyof typeof baseWarmup] * tempFactor * surfaceFactor * 2) / 2;
  }
  
  // Calculate air density factor based on temperature, pressure, and humidity
  function calculateAirDensityFactor(temp: number, pressure: number, humidity: number): number {
    // Simplified air density calculation (relative to standard conditions)
    // Standard conditions: 59°F (15°C), 29.92 inHg (1013.25 hPa), 0% humidity
    
    // Temperature factor (air density decreases as temperature increases)
    const tempFactor = 518.7 / (temp + 459.67); // Convert F to Rankine
    
    // Pressure factor (air density increases with pressure)
    const pressureFactor = pressure / 1013.25;
    
    // Humidity factor (humid air is less dense than dry air)
    const humidityFactor = 1 - (humidity / 100) * 0.02;
    
    return tempFactor * pressureFactor * humidityFactor;
  }
  
  // Calculate power adjustment based on air density
  function calculatePowerAdjustment(airDensityFactor: number, temp: number): number {
    // Power adjustment in percentage
    // Higher air density = more power, lower air density = less power
    const basePowerAdjustment = (airDensityFactor - 1) * 100;
    
    // Additional temp-based adjustment for very cold engines
    let tempAdjustment = 0;
    if (temp < 32) {
      tempAdjustment = -3; // Cold engines produce less power
    } else if (temp > 100) {
      tempAdjustment = -2; // Hot engines lose some efficiency
    }
    
    return Math.round(basePowerAdjustment + tempAdjustment);
  }
  
  // Calculate torque adjustment based on air density
  function calculateTorqueAdjustment(airDensityFactor: number): number {
    // Torque adjustment in percentage, slightly less affected than power
    return Math.round((airDensityFactor - 1) * 80);
  }
  
  // Calculate aerodynamic efficiency based on temperature and wind
  function calculateAeroEfficiency(temp: number, windSpeed: number): number {
    // Base efficiency (percentage)
    let efficiency = 100;
    
    // Temperature adjustments
    if (temp < 32) {
      efficiency -= 2; // Colder air is denser, slightly increasing drag
    } else if (temp > 95) {
      efficiency += 3; // Hotter air is less dense, slightly reducing drag
    }
    
    // Wind adjustments
    if (windSpeed > 15) {
      efficiency -= 5; // High winds reduce predictability of aero
    }
    
    return efficiency;
  }
  
  // Calculate downforce adjustment based on temperature and air density
  function calculateDownforceAdjustment(temp: number, airDensityFactor: number): number {
    // Downforce adjustment in percentage
    // Higher air density = more downforce, lower air density = less downforce
    return Math.round((airDensityFactor - 1) * 100);
  }
  
  // Calculate cooling efficiency based on temperature, wind speed, and humidity
  function calculateCoolingEfficiency(temp: number, windSpeed: number, humidity: number): string {
    if (temp > 95) {
      return 'Reduced';
    }
    
    if (temp < 40) {
      return 'Excellent';
    }
    
    if (windSpeed > 10) {
      return 'Enhanced';
    }
    
    if (humidity > 80 && temp > 80) {
      return 'Diminished';
    }
    
    return 'Normal';
  }
  
  // Calculate braking efficiency coefficient based on surface conditions
  function calculateBrakingEfficiency(surfaceCondition: string, surfaceTemp: number): number {
    // Base coefficient (1.0 = ideal)
    let coefficient = 1.0;
    
    // Surface condition adjustments
    switch (surfaceCondition) {
      case 'Dry':
        coefficient = 1.0;
        break;
      case 'Hot':
        coefficient = surfaceTemp > 140 ? 0.95 : 0.98; // Very hot surfaces reduce grip slightly
        break;
      case 'Cold':
        coefficient = surfaceTemp < 32 ? 0.8 : 0.9; // Cold surfaces reduce grip
        break;
      case 'Moist':
        coefficient = 0.9;
        break;
      case 'Damp':
        coefficient = 0.8;
        break;
      case 'Wet':
        coefficient = 0.7;
        break;
      case 'Snow-covered':
        coefficient = 0.3;
        break;
      default:
        coefficient = 1.0;
    }
    
    return coefficient;
  }
  
  // Calculate braking distance adjustment (percentage increase)
  function calculateBrakingDistanceAdjustment(brakingEfficiency: number): number {
    // Convert efficiency coefficient to percentage increase in stopping distance
    return Math.round((1 / brakingEfficiency - 1) * 100);
  }
  
  // Determine brake heat dissipation rate
  function getHeatDissipationRate(temp: number, humidity: number, windSpeed: number): string {
    if (temp > 90 && humidity > 80) {
      return 'Poor';
    }
    
    if (temp > 80) {
      return 'Reduced';
    }
    
    if (temp < 40 && windSpeed > 10) {
      return 'Excellent';
    }
    
    if (windSpeed > 15) {
      return 'Enhanced';
    }
    
    return 'Normal';
  }
  
  // Calculate overall risk level based on weather conditions
  function calculateRiskLevel(weatherCondition: string, visibility: number, windSpeed: number, rain: number, snow: number): string {
    if (snow > 0.5 || visibility < 100 || (rain > 1 && windSpeed > 25)) {
      return 'High';
    }
    
    if (rain > 0.5 || visibility < 1000 || weatherCondition.includes('storm') || windSpeed > 35) {
      return 'Moderate';
    }
    
    if (rain > 0 || weatherCondition.includes('fog') || visibility < 3000 || windSpeed > 20) {
      return 'Low';
    }
    
    return 'Minimal';
  }
  
  // Determine traction level based on surface condition and grip
  function getTractionLevel(surfaceCondition: string, gripLevel: string): string {
    if (surfaceCondition === 'Snow-covered' || gripLevel === 'Extremely Low') {
      return 'Very Poor';
    }
    
    if (surfaceCondition === 'Wet' || gripLevel === 'Low') {
      return 'Poor';
    }
    
    if (surfaceCondition === 'Damp' || surfaceCondition === 'Moist' || gripLevel === 'Moderate' || gripLevel === 'Reduced') {
      return 'Moderate';
    }
    
    if (gripLevel === 'Slightly Reduced' || gripLevel === 'Degrading') {
      return 'Good';
    }
    
    return 'Excellent';
  }
  
  // Determine visibility level
  function getVisibilityLevel(visibility: number, weatherCondition: string): string {
    if (visibility < 100 || weatherCondition.includes('heavy fog')) {
      return 'Extremely Poor';
    }
    
    if (visibility < 500 || weatherCondition.includes('fog')) {
      return 'Poor';
    }
    
    if (visibility < 2000 || weatherCondition.includes('mist')) {
      return 'Moderate';
    }
    
    if (visibility < 5000 || weatherCondition.includes('haze')) {
      return 'Good';
    }
    
    return 'Excellent';
  }
  
  // Generate driving advisories based on conditions
  function generateDrivingAdvisories(weatherCondition: string, riskLevel: string, surfaceCondition: string, temp: number): string[] {
    const advisories: string[] = [];
    
    // Risk-based advisories
    if (riskLevel === 'High') {
      advisories.push('Extreme caution advised. Consider postponing performance driving.');
    } else if (riskLevel === 'Moderate') {
      advisories.push('Exercise heightened caution. Reduce speeds by 30% in corners.');
    }
    
    // Surface condition advisories
    if (surfaceCondition === 'Wet' || surfaceCondition === 'Damp') {
      advisories.push('Reduced traction in all areas. Extend braking zones by 40-50%.');
      advisories.push('Avoid standing water and painted road markings.');
    } else if (surfaceCondition === 'Snow-covered') {
      advisories.push('Winter tires or chains strongly recommended.');
      advisories.push('Extremely limited traction. Gentle inputs required.');
    } else if (surfaceCondition === 'Cold' && temp < 45) {
      advisories.push('Extended tire warm-up period required for optimal grip.');
    } else if (surfaceCondition === 'Hot' && temp > 95) {
      advisories.push('Tire pressures will increase significantly during driving.');
    }
    
    // Weather-specific advisories
    if (weatherCondition.includes('thunderstorm')) {
      advisories.push('Lightning risk. Seek shelter if conditions worsen.');
    } else if (weatherCondition.includes('fog')) {
      advisories.push('Use low-beam headlights and reduce speed to match visibility.');
    }
    
    // If no specific advisories, add a generic one
    if (advisories.length === 0) {
      advisories.push('Good driving conditions. Standard performance driving practices recommended.');
    }
    
    return advisories;
  }

  // Vehicle Management Routes
  app.post('/api/vehicles', async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create vehicle' });
    }
  });

  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicles' });
    }
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicle' });
    }
  });

  app.patch('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      
      const updatedVehicle = await storage.updateVehicle(id, vehicleData);
      
      if (!updatedVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(updatedVehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to update vehicle' });
    }
  });

  app.delete('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVehicle(id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to delete vehicle' });
    }
  });

  // Tire Management Routes
  app.post('/api/tires', async (req, res) => {
    try {
      const tireData = insertTireSchema.parse(req.body);
      const tire = await storage.createTire(tireData);
      res.status(201).json(tire);
    } catch (error) {
      console.error('Error creating tire:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create tire' });
    }
  });

  app.get('/api/vehicles/:vehicleId/tires', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const tires = await storage.getTiresByVehicle(vehicleId);
      res.json(tires);
    } catch (error) {
      console.error('Error fetching tires:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch tires' });
    }
  });

  // Maintenance Records Routes
  app.post('/api/maintenance-records', async (req, res) => {
    try {
      const recordData = insertMaintenanceRecordSchema.parse(req.body);
      const record = await storage.createMaintenanceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create maintenance record' });
    }
  });

  app.get('/api/vehicles/:vehicleId/maintenance-records', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const records = await storage.getMaintenanceRecordsByVehicle(vehicleId);
      res.json(records);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance records' });
    }
  });

  // Maintenance Flags Routes
  app.post('/api/maintenance-flags', async (req, res) => {
    try {
      const flagData = insertMaintenanceFlagSchema.parse(req.body);
      const flag = await storage.createMaintenanceFlag(flagData);
      res.status(201).json(flag);
    } catch (error) {
      console.error('Error creating maintenance flag:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create maintenance flag' });
    }
  });

  app.get('/api/vehicles/:vehicleId/maintenance-flags', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const flags = await storage.getMaintenanceFlagsByVehicle(vehicleId);
      res.json(flags);
    } catch (error) {
      console.error('Error fetching maintenance flags:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance flags' });
    }
  });

  // Gloss Tracking Routes (for paint protection/detailing)
  app.post('/api/gloss-tracking', async (req, res) => {
    try {
      const glossData = insertGlossTrackingSchema.parse(req.body);
      const glossTracking = await storage.createGlossTracking(glossData);
      res.status(201).json(glossTracking);
    } catch (error) {
      console.error('Error creating gloss tracking:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create gloss tracking' });
    }
  });

  app.get('/api/vehicles/:vehicleId/gloss-tracking', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const glossTracking = await storage.getGlossTrackingByVehicle(vehicleId);
      res.json(glossTracking);
    } catch (error) {
      console.error('Error fetching gloss tracking:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss tracking' });
    }
  });

  // Gloss Logs Routes (for detailing sessions)
  app.post('/api/gloss-logs', async (req, res) => {
    try {
      const logData = insertGlossLogSchema.parse(req.body);
      const glossLog = await storage.createGlossLog(logData);
      res.status(201).json(glossLog);
    } catch (error) {
      console.error('Error creating gloss log:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create gloss log' });
    }
  });

  app.get('/api/gloss-tracking/:glossTrackingId/logs', async (req, res) => {
    try {
      const glossTrackingId = parseInt(req.params.glossTrackingId);
      const logs = await storage.getGlossLogsByTracking(glossTrackingId);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching gloss logs:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss logs' });
    }
  });

  // Demo data initialization
  app.post('/api/init-demo-data', async (req, res) => {
    try {
      // Create demo vehicle
      const vehicle = await storage.createVehicle({
        make: 'Ferrari',
        model: '488 GTB',
        year: 2019,
        color: 'Rosso Corsa',
        vin: 'ZFF79ALA7K0240372',
        licensePlate: 'PDCK-20',
        purchaseDate: new Date('2023-01-15'),
        mileage: 8500
      });
      
      // Create tires for the vehicle
      await storage.createTire({
        vehicleId: vehicle.id,
        brand: 'Michelin',
        model: 'Pilot Sport 4S',
        frontSize: '245/35ZR20',
        rearSize: '305/30ZR20',
        dateInstalled: new Date('2023-03-10'),
        mileageInstalled: 7200,
        currentTreadDepth: 6.5,
        notes: 'High performance summer tires'
      });
      
      // Create maintenance records
      await storage.createMaintenanceRecord({
        vehicleId: vehicle.id,
        serviceType: 'Oil Change',
        serviceDate: new Date('2023-06-15'),
        mileage: 8000,
        serviceCost: 450,
        serviceProvider: 'Ferrari of Central Florida',
        notes: 'Shell Helix Ultra 5W-40, OEM filter'
      });
      
      // Create maintenance flag for upcoming service
      await storage.createMaintenanceFlag({
        vehicleId: vehicle.id,
        flagType: 'Scheduled Maintenance',
        notes: 'Annual service due',
        dueDate: new Date('2023-12-15'),
        dueMileage: 10000,
        isDue: false,
        isUrgent: false
      });
      
      // Create gloss tracking for paint protection
      const glossTracking = await storage.createGlossTracking({
        vehicleId: vehicle.id,
        currentProduct: 'Ceramic Pro 9H',
        appliedDate: new Date('2023-02-20'),
        nextWaxDate: new Date('2024-02-20'),
        protectionLevel: 9,
        glossLevel: 9,
        beadingRating: 10,
        notes: 'Full ceramic coating with 5-year warranty'
      });
      
      // Create gloss log entry
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        logDate: new Date('2023-05-10'),
        productUsed: 'Ceramic Pro Sport',
        processType: 'Maintenance Coat',
        notes: 'Applied maintenance coat after spring detail'
      });
      
      // Create another gloss log entry
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        logDate: new Date('2023-08-15'),
        productUsed: 'Ceramic Pro Sport',
        processType: 'Maintenance Coat',
        notes: 'Applied after summer track day event'
      });
      
      res.status(201).json({ message: 'Demo data initialized successfully' });
    } catch (error) {
      console.error('Error initializing demo data:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to initialize demo data' });
    }
  });

  // OAuth callback routes
  app.get('/oauth2callback', handleGoogleOAuth2Callback);
  app.get('/apple-oauth2callback', handleAppleOAuth2Callback);
  
  // Google OAuth token exchange endpoint
  app.post('/api/google-auth/token', async (req, res) => {
    try {
      const { code, redirectUri } = req.body;
      
      if (!code || !redirectUri) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Import axios for making HTTP requests
      const axios = require('axios');
      
      // Exchange authorization code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });
      
      // Return tokens to client
      res.json(tokenResponse.data);
    } catch (error) {
      console.error('Error exchanging Google auth code for token:', error.message);
      res.status(500).json({ error: 'Failed to exchange authorization code for token' });
    }
  });

  // Social Media Integration Routes
  
  // Check if Slack integration is configured
  app.get('/api/social/slack/status', async (req, res) => {
    const isConfigured = await checkSlackIntegration();
    res.json({ 
      configured: isConfigured,
      message: isConfigured ? 
        'Slack integration is configured and working.' : 
        'Slack integration is not configured. Please add your SLACK_BOT_TOKEN and SLACK_CHANNEL_ID to environment variables.'
    });
  });
  
  // Share vehicle to Slack
  app.post('/api/social/slack/share-vehicle', async (req, res) => {
    try {
      const { vehicleId } = req.body;
      
      if (!vehicleId) {
        return res.status(400).json({ message: 'Vehicle ID is required' });
      }
      
      const vehicle = await storage.getVehicle(vehicleId);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      const result = await shareVehicleToSlack(vehicle);
      
      if (result) {
        res.json({ success: true, message: 'Vehicle shared to Slack successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to share vehicle to Slack. Check your Slack integration.' });
      }
    } catch (error) {
      console.error('Error sharing vehicle to Slack:', error);
      res.status(500).json({ success: false, message: 'An error occurred while sharing to Slack' });
    }
  });
  
  // Share event to Slack
  app.post('/api/social/slack/share-event', async (req, res) => {
    try {
      const { eventId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
      }
      
      // Retrieve event from storage (once implemented)
      // const event = await storage.getEvent(eventId);
      
      // For now, use the provided event data directly
      const event = req.body;
      
      const result = await shareEventToSlack(event);
      
      if (result) {
        res.json({ success: true, message: 'Event shared to Slack successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to share event to Slack. Check your Slack integration.' });
      }
    } catch (error) {
      console.error('Error sharing event to Slack:', error);
      res.status(500).json({ success: false, message: 'An error occurred while sharing to Slack' });
    }
  });

  // Initialize Slack client on server startup
  initializeSlackClient();


  
  const httpServer = createServer(app);
  return httpServer;
}
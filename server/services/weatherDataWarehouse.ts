/**
 * OpenWeather API Data Warehouse
 * 
 * This module provides a centralized in-memory caching system for weather data,
 * with intelligent cache invalidation, multiple cache layers, and failover mechanisms.
 * 
 * Features:
 * - Dual-layer caching (primary and secondary) for improved reliability
 * - Built-in rate limiting to prevent API quota exhaustion
 * - Automatic fallback to secondary cache when primary fails
 * - Support for multiple API key management with automatic failover
 * - Consolidated fetch methods for all weather-related API endpoints
 */

import axios, { AxiosResponse } from 'axios';
import { EventEmitter } from 'events';

// OpenWeather API keys
// Updated to use a pool of keys for improved reliability and higher rate limits
const API_KEYS = {
  default: process.env.OPENWEATHER_API_KEY || '',
  onecall: process.env.ONECALL_API_KEY || '',     // Special key for 3.0 API
  forecast: process.env.FORECAST_API_KEY || '',   // Dedicated forecast key
  backup: process.env.BACKUP_WEATHER_KEY || ''    // Fallback key
};

// Cache invalidation timeouts (in milliseconds)
const CACHE_TIMEOUTS = {
  primary: 30 * 60 * 1000,    // Primary cache: 30 minutes
  secondary: 2 * 60 * 60 * 1000, // Secondary cache: 2 hours
  stale: 24 * 60 * 60 * 1000   // Stale but usable data: 24 hours
};

// Rate limiting settings (in milliseconds)
const RATE_LIMITS = {
  general: 1000,      // 1 second between general API calls
  onecall: 10 * 1000, // 10 seconds between OneCall API calls (more expensive)
  perKey: 5 * 1000    // 5 seconds between calls with the same key
};

// Base URLs for OpenWeather API
const API_URLS = {
  v2_5: 'https://api.openweathermap.org/data/2.5',
  v3_0: 'https://api.openweathermap.org/data/3.0'
};

// Interface definitions for cache storage
interface CachedWeatherData {
  data: any;
  timestamp: number;
  source?: string; // API endpoint source
  apiKey?: string; // Which API key was used (without revealing the key itself)
}

interface CacheStructure {
  primary: Map<string, CachedWeatherData>;
  secondary: Map<string, CachedWeatherData>;
}

// Key usage tracking to prevent overusing specific API keys
interface KeyUsage {
  key: string;
  lastUsed: number;
  errorCount: number;
  totalCalls: number;
}

/**
 * The Weather Data Warehouse class for centralized weather data management
 */
class WeatherDataWarehouse extends EventEmitter {
  private cache: CacheStructure;
  private keyUsage: Map<string, KeyUsage>;
  private lastApiCall: Map<string, number>;
  private initialized: boolean;
  
  constructor() {
    super();
    this.cache = {
      primary: new Map<string, CachedWeatherData>(),
      secondary: new Map<string, CachedWeatherData>()
    };
    this.keyUsage = new Map<string, KeyUsage>();
    this.lastApiCall = new Map<string, number>();
    this.initialized = false;
    
    // Initialize key usage tracking
    this.initializeKeyTracking();
  }
  
  /**
   * Initialize the key tracking system
   */
  private initializeKeyTracking(): void {
    // Initialize tracking for all API keys
    Object.entries(API_KEYS).forEach(([name, key]) => {
      if (key && key.length > 0) {
        this.keyUsage.set(name, {
          key,
          lastUsed: 0,
          errorCount: 0,
          totalCalls: 0
        });
      }
    });
    
    this.initialized = true;
    console.log(`Weather API Data Warehouse initialized with ${this.keyUsage.size} API keys`);
  }
  
  /**
   * Select the best API key to use based on usage patterns and errors
   */
  private selectApiKey(endpoint: 'weather' | 'forecast' | 'onecall'): string {
    // If endpoint is onecall, prefer the dedicated key
    if (endpoint === 'onecall' && this.keyUsage.has('onecall')) {
      return this.keyUsage.get('onecall')!.key;
    }
    
    // If endpoint is forecast, prefer the dedicated key
    if (endpoint === 'forecast' && this.keyUsage.has('forecast')) {
      return this.keyUsage.get('forecast')!.key;
    }
    
    // Otherwise use the default key
    if (this.keyUsage.has('default')) {
      return this.keyUsage.get('default')!.key;
    }
    
    // Fallback to any available key
    for (const [name, usage] of this.keyUsage.entries()) {
      if (usage.errorCount < 3) { // Avoid keys with too many errors
        return usage.key;
      }
    }
    
    // If no good key is found, use the first one
    const firstKey = this.keyUsage.values().next().value;
    return firstKey ? firstKey.key : '';
  }
  
  /**
   * Check if we can make an API call (rate limiting)
   */
  private canMakeApiCall(endpoint: 'weather' | 'forecast' | 'onecall'): boolean {
    const now = Date.now();
    const lastCall = this.lastApiCall.get(endpoint) || 0;
    
    // Get the appropriate rate limit
    let rateLimit = RATE_LIMITS.general;
    if (endpoint === 'onecall') {
      rateLimit = RATE_LIMITS.onecall;
    }
    
    // Check if enough time has passed
    if (now - lastCall < rateLimit) {
      return false;
    }
    
    // Update last call time
    this.lastApiCall.set(endpoint, now);
    return true;
  }
  
  /**
   * Track API key usage
   */
  private trackKeyUsage(keyName: string, success: boolean): void {
    const usage = this.keyUsage.get(keyName);
    if (!usage) return;
    
    usage.lastUsed = Date.now();
    usage.totalCalls++;
    
    if (!success) {
      usage.errorCount++;
    } else {
      // Reset error count on success
      usage.errorCount = 0;
    }
    
    this.keyUsage.set(keyName, usage);
  }
  
  /**
   * Get a key name from the actual API key value
   */
  private getKeyNameFromValue(keyValue: string): string {
    for (const [name, usage] of this.keyUsage.entries()) {
      if (usage.key === keyValue) {
        return name;
      }
    }
    return 'unknown';
  }
  
  /**
   * Cache data in both primary and secondary caches
   */
  private cacheData(cacheKey: string, data: any, source: string, apiKey: string): void {
    const timestamp = Date.now();
    const cachedData: CachedWeatherData = {
      data,
      timestamp,
      source,
      apiKey: this.getKeyNameFromValue(apiKey)
    };
    
    // Store in both caches
    this.cache.primary.set(cacheKey, cachedData);
    this.cache.secondary.set(cacheKey, cachedData);
    
    // Emit cache update event
    this.emit('cache:update', {
      key: cacheKey,
      timestamp,
      source
    });
    
    console.log(`Weather data saved to both primary and secondary caches`);
  }
  
  /**
   * Get data from cache with automatic fallback
   */
  private getCachedData(cacheKey: string): { data: any, source: 'primary' | 'secondary' | 'expired' | null } {
    const now = Date.now();
    
    // Try primary cache first
    const primaryData = this.cache.primary.get(cacheKey);
    if (primaryData && (now - primaryData.timestamp < CACHE_TIMEOUTS.primary)) {
      return { data: primaryData.data, source: 'primary' };
    }
    
    // Try secondary cache next
    const secondaryData = this.cache.secondary.get(cacheKey);
    if (secondaryData && (now - secondaryData.timestamp < CACHE_TIMEOUTS.secondary)) {
      return { data: secondaryData.data, source: 'secondary' };
    }
    
    // If we have expired data but not too old, use it temporarily
    if (secondaryData && (now - secondaryData.timestamp < CACHE_TIMEOUTS.stale)) {
      return { data: secondaryData.data, source: 'expired' };
    }
    
    return { data: null, source: null };
  }
  
  /**
   * Fetch current weather data
   */
  async fetchWeatherData(lat: number | string, lon: number | string, units: string = 'imperial'): Promise<any> {
    const cacheKey = `weather:${lat}:${lon}:${units}`;
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData.data) {
      console.log(`Using ${cachedData.source} cache for weather data`);
      
      // If using expired or secondary cache, refresh in background
      if (cachedData.source === 'secondary' || cachedData.source === 'expired') {
        console.log(`Using ${cachedData.source} cache. Refreshing in background...`);
        this.fetchWeatherDataFromApi(lat, lon, units)
          .then(freshData => {
            if (freshData) {
              this.cacheData(cacheKey, freshData, 'api-refresh', 
                this.selectApiKey('weather'));
            }
          })
          .catch(err => console.error('Error refreshing weather data:', err));
      }
      
      return cachedData.data;
    }
    
    // Cache miss, fetch from API
    console.log('Fetching fresh weather data...');
    const data = await this.fetchWeatherDataFromApi(lat, lon, units);
    
    if (data) {
      this.cacheData(cacheKey, data, 'api', this.selectApiKey('weather'));
    }
    
    return data;
  }
  
  /**
   * Direct API fetch for current weather
   */
  private async fetchWeatherDataFromApi(lat: number | string, lon: number | string, units: string): Promise<any> {
    if (!this.canMakeApiCall('weather')) {
      console.log('Rate limited: Too many weather API calls. Try again later.');
      throw new Error('Rate limited: Too many weather API calls. Try again later.');
    }
    
    const apiKey = this.selectApiKey('weather');
    const keyName = this.getKeyNameFromValue(apiKey);
    
    try {
      const url = `${API_URLS.v2_5}/weather`;
      console.log(`Making request to: ${url}?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey.substring(0, 5)}...`);
      
      const response = await axios.get(url, {
        params: {
          lat,
          lon,
          units,
          appid: apiKey
        },
        timeout: 10000 // 10 second timeout
      });
      
      this.trackKeyUsage(keyName, true);
      return response.data;
    } catch (error: any) {
      this.trackKeyUsage(keyName, false);
      console.error(`Weather API error with key ${keyName}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Fetch forecast data
   */
  async fetchForecastData(lat: number | string, lon: number | string, units: string = 'imperial'): Promise<any> {
    const cacheKey = `forecast:${lat}:${lon}:${units}`;
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData.data) {
      console.log(`Using ${cachedData.source} cache for forecast data`);
      
      // If using expired or secondary cache, refresh in background
      if (cachedData.source === 'secondary' || cachedData.source === 'expired') {
        this.fetchForecastDataFromApi(lat, lon, units)
          .then(freshData => {
            if (freshData) {
              this.cacheData(cacheKey, freshData, 'api-refresh', 
                this.selectApiKey('forecast'));
            }
          })
          .catch(err => console.error('Error refreshing forecast data:', err));
      }
      
      return cachedData.data;
    }
    
    // Cache miss, fetch from API
    const data = await this.fetchForecastDataFromApi(lat, lon, units);
    
    if (data) {
      this.cacheData(cacheKey, data, 'api', this.selectApiKey('forecast'));
    }
    
    return data;
  }
  
  /**
   * Direct API fetch for forecast
   */
  private async fetchForecastDataFromApi(lat: number | string, lon: number | string, units: string): Promise<any> {
    if (!this.canMakeApiCall('forecast')) {
      throw new Error('Rate limited: Too many forecast API calls. Try again later.');
    }
    
    const apiKey = this.selectApiKey('forecast');
    const keyName = this.getKeyNameFromValue(apiKey);
    
    try {
      const url = `${API_URLS.v2_5}/forecast`;
      const response = await axios.get(url, {
        params: {
          lat,
          lon,
          units,
          appid: apiKey
        },
        timeout: 10000 // 10 second timeout
      });
      
      this.trackKeyUsage(keyName, true);
      return response.data;
    } catch (error: any) {
      this.trackKeyUsage(keyName, false);
      console.error(`Forecast API error with key ${keyName}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Fetch OneCall data (with v3.0 support)
   */
  async fetchOneCallData(lat: number | string, lon: number | string, units: string = 'imperial', exclude: string = 'minutely'): Promise<any> {
    const cacheKey = `onecall:${lat}:${lon}:${units}:${exclude}`;
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData.data) {
      console.log(`Using ${cachedData.source} cache for OneCall data`);
      
      // If using expired or secondary cache, refresh in background
      if (cachedData.source === 'secondary' || cachedData.source === 'expired') {
        this.fetchOneCallDataFromApi(lat, lon, units, exclude)
          .then(freshData => {
            if (freshData) {
              this.cacheData(cacheKey, freshData, 'api-refresh', 
                this.selectApiKey('onecall'));
            }
          })
          .catch(err => console.error('Error refreshing OneCall data:', err));
      }
      
      return cachedData.data;
    }
    
    // Cache miss, fetch from API
    const data = await this.fetchOneCallDataFromApi(lat, lon, units, exclude);
    
    if (data) {
      this.cacheData(cacheKey, data, 'api', this.selectApiKey('onecall'));
    }
    
    return data;
  }
  
  /**
   * Direct API fetch for OneCall with v3.0 support
   */
  private async fetchOneCallDataFromApi(
    lat: number | string, 
    lon: number | string, 
    units: string,
    exclude: string
  ): Promise<any> {
    if (!this.canMakeApiCall('onecall')) {
      throw new Error('Rate limited: Too many OneCall API calls. Try again later.');
    }
    
    // Try v3.0 API first
    try {
      const apiKey = this.selectApiKey('onecall');
      const keyName = this.getKeyNameFromValue(apiKey);
      
      // New v3.0 endpoint
      const url = `${API_URLS.v3_0}/onecall`;
      console.log(`Making OneCall API request to: ${url}?lat=${lat}&lon=${lon}&units=${units}&exclude=${exclude}&appid=${apiKey.substring(0, 5)}...`);
      
      const response = await axios.get(url, {
        params: {
          lat,
          lon,
          units,
          exclude,
          appid: apiKey
        },
        timeout: 15000 // 15 second timeout for OneCall (more complex data)
      });
      
      this.trackKeyUsage(keyName, true);
      return response.data;
    } catch (error: any) {
      console.error('Error with OneCall v3.0 API:', error.message);
      
      // Fallback to v2.5 API
      try {
        console.log('Falling back to OneCall v2.5 API...');
        const apiKey = this.selectApiKey('weather'); // Use regular key for fallback
        const keyName = this.getKeyNameFromValue(apiKey);
        
        const url = `${API_URLS.v2_5}/onecall`;
        const response = await axios.get(url, {
          params: {
            lat,
            lon,
            units,
            exclude,
            appid: apiKey
          },
          timeout: 10000
        });
        
        this.trackKeyUsage(keyName, true);
        return response.data;
      } catch (fallbackError: any) {
        console.error('Error with OneCall v2.5 fallback:', fallbackError.message);
        throw fallbackError;
      }
    }
  }
  
  /**
   * Get consolidated weather data (all endpoints in one call)
   */
  async getConsolidatedWeatherData(
    lat: number | string, 
    lon: number | string, 
    units: string = 'imperial',
    exclude: string = 'minutely'
  ): Promise<any> {
    const cacheKey = `consolidated:${lat}:${lon}:${units}:${exclude}`;
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData.data) {
      console.log(`Using cached weather data from "${cachedData.source}"`);
      
      // If using expired or secondary cache, refresh in background
      if (cachedData.source === 'secondary' || cachedData.source === 'expired') {
        console.log(`Using ${cachedData.source} cache. Refreshing in background...`);
        this.fetchConsolidatedDataFromApi(lat, lon, units, exclude)
          .then(freshData => {
            if (freshData) {
              this.cacheData(cacheKey, freshData, 'api-refresh', 
                this.selectApiKey('weather'));
            }
          })
          .catch(err => console.error('Error refreshing consolidated data:', err));
      }
      
      return cachedData.data;
    }
    
    // Cache miss, fetch from API
    console.log('Fetching fresh weather data...');
    const data = await this.fetchConsolidatedDataFromApi(lat, lon, units, exclude);
    
    if (data) {
      // Validate the data structure before caching
      let isValid = true;
      
      if (!data.weatherData) {
        console.error('Missing weatherData in response');
        isValid = false;
      }
      
      if (!data.forecastData) {
        console.error('Missing forecastData in response');
        isValid = false;
      }
      
      if (!data.oneCallData) {
        console.error('Missing oneCallData in response');
        isValid = false;
      }
      
      if (isValid) {
        console.log('Weather data structure check:', {
          weatherData: !!data.weatherData,
          oneCallData: !!data.oneCallData,
          forecastData: !!data.forecastData,
          automotiveWeatherData: !!data.automotiveWeatherData
        });
        
        this.cacheData(cacheKey, data, 'api', this.selectApiKey('weather'));
      }
    }
    
    return data;
  }
  
  /**
   * Fetch consolidated weather data from all APIs
   */
  private async fetchConsolidatedDataFromApi(
    lat: number | string, 
    lon: number | string, 
    units: string,
    exclude: string
  ): Promise<any> {
    try {
      // Make all API calls in parallel
      const [weatherData, forecastData, oneCallData] = await Promise.all([
        this.fetchWeatherDataFromApi(lat, lon, units),
        this.fetchForecastDataFromApi(lat, lon, units),
        this.fetchOneCallDataFromApi(lat, lon, units, exclude)
      ]);
      
      // Try to get automotive data, but don't fail if it's not available
      let automotiveWeatherData;
      try {
        automotiveWeatherData = await this.generateAutomotiveData(weatherData, forecastData, oneCallData);
      } catch (autoError) {
        console.error('Error generating automotive weather data:', autoError);
        automotiveWeatherData = { 
          error: 'Automotive weather data unavailable',
          location: { lat, lon }
        };
      }
      
      // Combine all data
      return {
        weatherData,
        forecastData,
        oneCallData,
        automotiveWeatherData,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error fetching consolidated weather data:', error);
      throw error;
    }
  }
  
  /**
   * Generate automotive-specific weather data
   */
  private async generateAutomotiveData(weatherData: any, forecastData: any, oneCallData: any): Promise<any> {
    // This would be implemented with your custom automotive data logic
    // For now, we'll return a basic structure
    if (!weatherData) {
      throw new Error('Missing weather data for automotive calculations');
    }
    
    // Extract relevant data
    const { main, weather, wind, visibility } = weatherData;
    const mainCondition = weather && weather[0] ? weather[0].main : 'Clear';
    const temp = main ? main.temp : 0;
    const humidity = main ? main.humidity : 0;
    const pressure = main ? main.pressure : 1013;
    const windSpeed = wind ? wind.speed : 0;
    
    // Calculate some automotive-specific values
    const asphaltTemp = this.calculateAsphaltTemp(temp, 0, mainCondition, 0, 0);
    const concreteTemp = this.calculateConcreteTemp(temp, 0, mainCondition, 0, 0);
    const surfaceCondition = this.getSurfaceCondition(mainCondition, 0, 0, temp);
    
    // Create response object
    return {
      location: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        name: weatherData.name,
        country: weatherData.sys.country
      },
      conditions: {
        temperature: temp,
        humidity,
        pressure,
        windSpeed,
        visibility,
        weatherMain: mainCondition,
        weatherDescription: weather && weather[0] ? weather[0].description : 'Clear sky'
      },
      drivingConditions: {
        surfaceCondition,
        asphaltTemperature: asphaltTemp,
        concreteTemperature: concreteTemp,
        riskLevel: this.calculateRiskLevel(mainCondition, visibility, windSpeed, 0, 0),
        tractionLevel: this.getTractionLevel(surfaceCondition, this.calculateGripLevel(surfaceCondition, asphaltTemp, humidity)),
        visibilityLevel: this.getVisibilityLevel(visibility, mainCondition),
        brakingEfficiency: this.calculateBrakingEfficiency(surfaceCondition, asphaltTemp),
        advisories: this.generateDrivingAdvisories(mainCondition, 'Low', surfaceCondition, temp)
      },
      vehiclePerformance: {
        airDensityFactor: this.calculateAirDensityFactor(temp, pressure, humidity),
        coolingEfficiency: this.calculateCoolingEfficiency(temp, windSpeed, humidity),
        tireWarmupTime: this.calculateTireWarmup(temp, surfaceCondition, 'Standard')
      }
    };
  }
  
  /**
   * Calculate estimated asphalt temperature based on air temperature and conditions
   */
  private calculateAsphaltTemp(airTemp: number, cloudCover: number, weatherCondition: string, rain: number, snow: number): number {
    // Basic calculation - could be enhanced with more sophisticated models
    let modifier = 1.0;
    
    if (weatherCondition.includes('Clear') || weatherCondition.includes('Sun')) {
      modifier = 1.5; // Asphalt heats up more in direct sun
    } else if (weatherCondition.includes('Cloud')) {
      modifier = 1.2;
    } else if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      modifier = 0.8; // Rain cools asphalt
    } else if (weatherCondition.includes('Snow')) {
      modifier = 0.5; // Snow cools asphalt significantly
    }
    
    // Reduce heating effect as cloud cover increases
    modifier = modifier * (1 - (cloudCover / 100) * 0.3);
    
    // Rain and snow have cooling effects
    modifier = modifier - (rain * 0.1) - (snow * 0.2);
    
    // Calculate temperature difference
    let tempDiff = 0;
    if (airTemp > 70) {
      tempDiff = 15 * modifier; // Hot days create bigger difference
    } else if (airTemp > 50) {
      tempDiff = 10 * modifier;
    } else if (airTemp > 32) {
      tempDiff = 5 * modifier;
    } else {
      tempDiff = 2 * modifier; // Minimal difference in very cold weather
    }
    
    return airTemp + tempDiff;
  }
  
  /**
   * Calculate estimated concrete temperature
   */
  private calculateConcreteTemp(airTemp: number, cloudCover: number, weatherCondition: string, rain: number, snow: number): number {
    // Concrete heats up less than asphalt but retains heat longer
    // Similar calculation with adjusted modifiers
    let modifier = 1.0;
    
    if (weatherCondition.includes('Clear') || weatherCondition.includes('Sun')) {
      modifier = 1.2; // Less than asphalt
    } else if (weatherCondition.includes('Cloud')) {
      modifier = 1.1;
    } else if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      modifier = 0.9;
    } else if (weatherCondition.includes('Snow')) {
      modifier = 0.7;
    }
    
    // Reduce heating effect as cloud cover increases
    modifier = modifier * (1 - (cloudCover / 100) * 0.3);
    
    // Rain and snow have cooling effects
    modifier = modifier - (rain * 0.1) - (snow * 0.2);
    
    // Calculate temperature difference
    let tempDiff = 0;
    if (airTemp > 70) {
      tempDiff = 10 * modifier; // Less than asphalt
    } else if (airTemp > 50) {
      tempDiff = 7 * modifier;
    } else if (airTemp > 32) {
      tempDiff = 4 * modifier;
    } else {
      tempDiff = 2 * modifier;
    }
    
    return airTemp + tempDiff;
  }
  
  /**
   * Determine the surface condition based on weather
   */
  private getSurfaceCondition(weatherCondition: string, rain: number, snow: number, temp: number): string {
    if (weatherCondition.includes('Snow') || snow > 0) {
      if (temp > 32) {
        return 'Slushy';
      }
      return 'Snow-covered';
    }
    
    if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle') || rain > 0) {
      return 'Wet';
    }
    
    if (weatherCondition.includes('Fog') || weatherCondition.includes('Mist')) {
      return 'Damp';
    }
    
    if (temp < 32) {
      return 'Possibly Icy';
    }
    
    return 'Dry';
  }
  
  /**
   * Calculate grip level based on surface condition
   */
  private calculateGripLevel(surfaceCondition: string, surfaceTemp: number, humidity: number): string {
    if (surfaceCondition === 'Snow-covered') {
      return 'Very Low';
    }
    
    if (surfaceCondition === 'Slushy' || surfaceCondition === 'Possibly Icy') {
      return 'Low';
    }
    
    if (surfaceCondition === 'Wet') {
      if (surfaceTemp > 120) {
        return 'Moderate-Low'; // Hot wet surfaces can be slippery
      }
      return 'Moderate';
    }
    
    if (surfaceCondition === 'Damp') {
      if (humidity > 90) {
        return 'Moderate';
      }
      return 'Moderate-High';
    }
    
    // Dry conditions
    if (surfaceTemp < 50) {
      return 'Moderate-High'; // Cold dry surfaces
    }
    if (surfaceTemp > 140) {
      return 'Moderate-High'; // Very hot surfaces can reduce grip
    }
    return 'High';
  }
  
  /**
   * Calculate risk level for driving
   */
  private calculateRiskLevel(weatherCondition: string, visibility: number, windSpeed: number, rain: number, snow: number): string {
    let riskScore = 0;
    
    // Weather condition factors
    if (weatherCondition.includes('Thunderstorm')) {
      riskScore += 4;
    } else if (weatherCondition.includes('Snow')) {
      riskScore += 5;
    } else if (weatherCondition.includes('Rain')) {
      riskScore += 3;
    } else if (weatherCondition.includes('Fog') || weatherCondition.includes('Mist')) {
      riskScore += 4;
    }
    
    // Visibility factors (meters)
    if (visibility < 1000) {
      riskScore += 5;
    } else if (visibility < 3000) {
      riskScore += 3;
    } else if (visibility < 5000) {
      riskScore += 1;
    }
    
    // Wind speed factors (mph)
    if (windSpeed > 40) {
      riskScore += 4;
    } else if (windSpeed > 25) {
      riskScore += 2;
    } else if (windSpeed > 15) {
      riskScore += 1;
    }
    
    // Precipitation factors
    riskScore += Math.min(5, rain * 2); // Cap at 5
    riskScore += Math.min(5, snow * 2.5); // Cap at 5
    
    // Determine risk level
    if (riskScore >= 10) {
      return 'High';
    } else if (riskScore >= 5) {
      return 'Moderate';
    } else if (riskScore >= 2) {
      return 'Low';
    } else {
      return 'Minimal';
    }
  }
  
  /**
   * Get traction level description
   */
  private getTractionLevel(surfaceCondition: string, gripLevel: string): string {
    if (gripLevel === 'Very Low' || gripLevel === 'Low') {
      return 'Poor';
    }
    if (gripLevel === 'Moderate-Low' || gripLevel === 'Moderate') {
      return 'Fair';
    }
    if (gripLevel === 'Moderate-High') {
      return 'Good';
    }
    return 'Excellent';
  }
  
  /**
   * Get visibility level description
   */
  private getVisibilityLevel(visibility: number, weatherCondition: string): string {
    if (visibility < 500) {
      return 'Very Poor';
    }
    if (visibility < 2000 || weatherCondition.includes('Fog') || weatherCondition.includes('Heavy')) {
      return 'Poor';
    }
    if (visibility < 5000 || weatherCondition.includes('Mist') || weatherCondition.includes('Light Fog')) {
      return 'Moderate';
    }
    if (visibility < 10000) {
      return 'Good';
    }
    return 'Excellent';
  }
  
  /**
   * Generate driving advisories based on conditions
   */
  private generateDrivingAdvisories(weatherCondition: string, riskLevel: string, surfaceCondition: string, temp: number): string[] {
    const advisories: string[] = [];
    
    // Basic advisories based on weather condition
    if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
      advisories.push('Use caution on wet roads.');
      advisories.push('Increase following distance.');
    }
    
    if (weatherCondition.includes('Snow') || weatherCondition.includes('Sleet')) {
      advisories.push('Reduce speed significantly.');
      advisories.push('Avoid sudden movements with steering, throttle, or brakes.');
      advisories.push('Consider postponing travel if possible.');
    }
    
    if (weatherCondition.includes('Fog') || weatherCondition.includes('Mist')) {
      advisories.push('Use fog lights if available.');
      advisories.push('Reduce speed and increase following distance.');
    }
    
    if (weatherCondition.includes('Thunderstorm')) {
      advisories.push('Be cautious of hydroplaning on wet roads.');
      advisories.push('Watch for debris and pooled water.');
    }
    
    // Surface condition advisories
    if (surfaceCondition === 'Wet' || surfaceCondition === 'Damp') {
      advisories.push('Braking distances will be longer.');
    }
    
    if (surfaceCondition === 'Possibly Icy' || surfaceCondition === 'Snow-covered' || surfaceCondition === 'Slushy') {
      advisories.push('Drive very cautiously, especially on bridges and overpasses.');
      advisories.push('Use gentle inputs for all controls.');
    }
    
    // Temperature advisories
    if (temp > 100) {
      advisories.push('Check tire pressure as heat can cause over-inflation.');
      advisories.push('Monitor engine temperature in stop-and-go traffic.');
    }
    
    if (temp < 32) {
      advisories.push('Watch for black ice, especially in shaded areas.');
      advisories.push('Allow extra time for engine and cabin to warm up.');
    }
    
    // Risk level advisories
    if (riskLevel === 'High') {
      advisories.push('Consider postponing non-essential travel.');
    }
    
    // If no specific advisories, provide a general one
    if (advisories.length === 0) {
      advisories.push('Conditions are favorable for driving.');
    }
    
    return advisories;
  }
  
  /**
   * Calculate tire warmup time in minutes
   */
  private calculateTireWarmup(airTemp: number, surfaceCondition: string, tireType: string): number {
    let baseTime = 5; // Base warmup time in minutes
    
    // Adjust for temperature
    if (airTemp < 32) {
      baseTime += 10;
    } else if (airTemp < 50) {
      baseTime += 5;
    } else if (airTemp < 70) {
      baseTime += 2;
    } else if (airTemp > 90) {
      baseTime -= 2;
    }
    
    // Adjust for surface condition
    if (surfaceCondition !== 'Dry') {
      baseTime += 3;
    }
    
    // Adjust for tire type
    if (tireType === 'Summer') {
      if (airTemp < 45) {
        baseTime += 5; // Summer tires struggle in cold
      } else {
        baseTime -= 1;
      }
    } else if (tireType === 'Winter') {
      if (airTemp > 60) {
        baseTime += 2; // Winter tires struggle in heat
      } else {
        baseTime -= 1;
      }
    } else if (tireType === 'Performance') {
      baseTime -= 2; // Performance tires warm up faster
    }
    
    // Ensure minimum time
    return Math.max(1, baseTime);
  }
  
  /**
   * Calculate air density factor
   */
  private calculateAirDensityFactor(temp: number, pressure: number, humidity: number): number {
    // Simplified model for air density effect on performance
    // Higher values mean denser air (more drag, more power)
    const tempFactor = 1 - ((temp - 59) / 100); // 59°F is a reference temp
    const pressureFactor = pressure / 1013.25; // Standard pressure
    const humidityFactor = 1 - (humidity / 500); // Humidity makes air less dense
    
    return tempFactor * pressureFactor * humidityFactor;
  }
  
  /**
   * Calculate braking efficiency
   */
  private calculateBrakingEfficiency(surfaceCondition: string, surfaceTemp: number): number {
    // 1.0 = normal braking, lower is worse
    let efficiency = 1.0;
    
    if (surfaceCondition === 'Snow-covered') {
      efficiency = 0.3;
    } else if (surfaceCondition === 'Slushy') {
      efficiency = 0.4;
    } else if (surfaceCondition === 'Possibly Icy') {
      efficiency = 0.2; // Ice is worst
    } else if (surfaceCondition === 'Wet') {
      efficiency = 0.7;
    } else if (surfaceCondition === 'Damp') {
      efficiency = 0.8;
    }
    
    // Temperature effects on braking
    if (surfaceTemp > 140) {
      efficiency *= 0.9; // Very hot surface
    } else if (surfaceTemp < 32) {
      efficiency *= 0.8; // Very cold surface
    }
    
    return efficiency;
  }
  
  /**
   * Calculate cooling efficiency
   */
  private calculateCoolingEfficiency(temp: number, windSpeed: number, humidity: number): string {
    // Calculate a cooling score
    let score = 100;
    
    // Temperature effects
    if (temp > 90) {
      score -= 30;
    } else if (temp > 80) {
      score -= 20;
    } else if (temp > 70) {
      score -= 10;
    } else if (temp < 40) {
      score += 10; // Cold air helps cooling
    }
    
    // Wind effects (helps cooling)
    if (windSpeed > 10) {
      score += 10;
    }
    
    // Humidity effects (hinders cooling)
    if (humidity > 80) {
      score -= 20;
    } else if (humidity > 60) {
      score -= 10;
    }
    
    // Determine efficiency level
    if (score < 50) {
      return 'Poor';
    } else if (score < 70) {
      return 'Fair';
    } else if (score < 90) {
      return 'Good';
    } else {
      return 'Excellent';
    }
  }
  
  /**
   * Check the health of the OpenWeather API
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      // Try a simple API call to check health
      const apiKey = this.selectApiKey('weather');
      const response = await axios.get(`${API_URLS.v2_5}/weather`, {
        params: {
          q: 'London', // Use a common city for testing
          appid: apiKey
        },
        timeout: 5000 // Short timeout for health check
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('OpenWeather API health check failed:', error);
      return false;
    }
  }
  
  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.primary.clear();
    this.cache.secondary.clear();
    console.log('Weather data cache cleared');
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): object {
    return {
      primarySize: this.cache.primary.size,
      secondarySize: this.cache.secondary.size,
      keyCount: this.keyUsage.size,
      lastClear: this.lastApiCall.get('cache_clear') || 'Never'
    };
  }
}

// Export singleton instance
export const weatherWarehouse = new WeatherDataWarehouse();

// Export convenience functions
export const getWeatherData = (lat: number | string, lon: number | string, units?: string) => 
  weatherWarehouse.fetchWeatherData(lat, lon, units);

export const getForecastData = (lat: number | string, lon: number | string, units?: string) =>
  weatherWarehouse.fetchForecastData(lat, lon, units);

export const getOneCallData = (lat: number | string, lon: number | string, units?: string, exclude?: string) =>
  weatherWarehouse.fetchOneCallData(lat, lon, units, exclude);

export const getConsolidatedWeather = (lat: number | string, lon: number | string, units?: string, exclude?: string) =>
  weatherWarehouse.getConsolidatedWeatherData(lat, lon, units, exclude);

export const checkWeatherApiHealth = () => weatherWarehouse.checkApiHealth();

export default weatherWarehouse;
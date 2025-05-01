import type { Request, Response } from 'express';
import { ParsedQs } from 'qs';

// OpenWeather API key accessed from environment
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '2379a18ee0e478c88aa7d4aa1df44410';

// Cache implementation
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface WeatherCache {
  [key: string]: CacheEntry;
}

// Weather cache with 15 minute expiration by default
const weatherCache: WeatherCache = {};
const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_CACHE_EXPIRATION = 40 * 60 * 1000; // 40 minutes if rate limited
let isRateLimited = false;
let rateLimitResetTime = 0;

// Default Atlanta coordinates for initial cache
const DEFAULT_LAT = 33.749;
const DEFAULT_LON = -84.388;
const DEFAULT_UNITS = 'imperial';

// Initialize cache with default weather data to have fallback
// Sample data for Atlanta
const ATLANTA_INITIAL_DATA = {
  "location": {
    "name": "Atlanta",
    "country": "US",
    "coordinates": {
      "lat": 33.749,
      "lon": -84.388
    }
  },
  "currentConditions": {
    "temp": 72,
    "feels_like": 73,
    "pressure": 1015,
    "humidity": 65,
    "dew_point": 59,
    "uvi": 5,
    "wind_speed": 8,
    "wind_deg": 240,
    "wind_direction": "SW",
    "visibility": 10,
    "weather": [
      {
        "id": 800,
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      }
    ],
    "is_day": true
  },
  "drivingConditions": {
    "track_temp": 85,
    "track_condition": "Dry",
    "grip_index": 87,
    "grip_assessment": "Excellent",
    "track_evolution": "Steady Improvement",
    "track_evolution_trend": "Positive",
    "alert_level": "Low",
    "precipitation_intensity": "None",
    "precipitation_probability": 5
  },
  "tireData": {
    "optimal_compound": "Medium",
    "tire_temperature": {
      "surface": 85,
      "core": 80,
      "optimal_window": "75-90°F"
    },
    "pressure": {
      "recommendation": "Standard pressure recommended",
      "front_pressure_delta": 0,
      "rear_pressure_delta": 0,
      "pressure_buildup_rate": "Normal"
    },
    "wear": {
      "expected_wear_rate": "Normal",
      "wear_pattern": "Even",
      "graining_risk": "Low",
      "blistering_risk": "Low",
      "management_strategy": "Standard rotation schedule recommended"
    }
  },
  "performanceData": {
    "power_adjustment": 2,
    "torque_curve": {
      "low_end": "+1.5%",
      "mid_range": "+2%",
      "high_end": "+2.5%"
    },
    "cooling_efficiency": "Excellent",
    "engine_temperature_delta": "-2°F",
    "fuel_consumption_delta": "-1.5%",
    "aerodynamic_efficiency": 98,
    "downforce_effectiveness": "Optimal",
    "crosswind_effect": "Minimal",
    "braking_efficiency": 96
  },
  "drivingRecommendation": "Excellent driving conditions. Optimal grip and visibility with good cooling performance. Standard tire pressures recommended.",
  "forecastTrend": {
    "temperature": "Stable",
    "precipitation": "No significant changes expected",
    "wind": "Light to moderate winds continuing",
    "summary": "Consistent favorable conditions expected to continue"
  },
  "sunData": {
    "sunrise": 1686907200000,
    "sunset": 1686958800000,
    "glareRisk": "Low",
    "glareDirection": "None"
  }
};

/**
 * Generate cache key for weather requests
 */
function generateCacheKey(lat: string | string[] | ParsedQs | ParsedQs[], lon: string | string[] | ParsedQs | ParsedQs[], units: string): string {
  return `${lat}-${lon}-${units}`;
}

// Seed the cache with initial data
(function initializeCache() {
  const cacheKey = generateCacheKey(DEFAULT_LAT.toString(), DEFAULT_LON.toString(), DEFAULT_UNITS);
  const now = Date.now();
  
  weatherCache[cacheKey] = {
    data: ATLANTA_INITIAL_DATA,
    timestamp: now,
    expiresAt: now + CACHE_EXPIRATION
  };
  
  console.log('Weather cache initialized with Atlanta data');
})();

/**
 * Safely fetch with rate limit and error handling
 */
async function safeFetch(url: string, type: string): Promise<any> {
  try {
    const response = await fetch(url);
    
    // Handle rate limiting (429)
    if (response.status === 429) {
      console.warn(`OpenWeather API rate limit hit for ${type} endpoint`);
      isRateLimited = true;
      rateLimitResetTime = Date.now() + RATE_LIMIT_CACHE_EXPIRATION;
      throw new Error(`${type} API rate limit exceeded`);
    }
    
    // Handle other errors
    if (!response.ok) {
      throw new Error(`${type} API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    throw error;
  }
}

/**
 * Retrieves enhanced automotive-focused weather data
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getAutomotiveWeather(req: Request, res: Response) {
  try {
    const { lat, lon, units = 'imperial' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Check for rate limiting
    if (isRateLimited) {
      const now = Date.now();
      if (now < rateLimitResetTime) {
        // Still rate limited, check if we have cached data
        const cacheKey = generateCacheKey(lat, lon, units as string);
        const cachedData = weatherCache[cacheKey];
        
        if (cachedData) {
          console.log(`Serving cached weather data for ${lat},${lon} due to rate limit`);
          // Update the client about rate limiting
          res.set('X-Rate-Limited', 'true');
          res.set('X-Rate-Limit-Reset', new Date(rateLimitResetTime).toISOString());
          return res.json(cachedData.data);
        } else {
          // No cached data available - serve default data
          const defaultCacheKey = generateCacheKey(DEFAULT_LAT.toString(), DEFAULT_LON.toString(), DEFAULT_UNITS);
          
          if (weatherCache[defaultCacheKey]) {
            console.log(`Serving default Atlanta data during rate limit for ${lat},${lon}`);
            res.set('X-Rate-Limited', 'true');
            res.set('X-Default-Data', 'true');
            return res.json(weatherCache[defaultCacheKey].data);
          }
          
          // If even default data not available, return a 429
          return res.status(429).json({
            message: 'Weather API rate limited. Try again later.',
            retryAfter: new Date(rateLimitResetTime).toISOString()
          });
        }
      } else {
        // Rate limit expired, reset the flag
        console.log('OpenWeather API rate limit reset');
        isRateLimited = false;
      }
    }
    
    // Check if data is in cache and not expired
    const cacheKey = generateCacheKey(lat, lon, units as string);
    const now = Date.now();
    
    if (weatherCache[cacheKey] && weatherCache[cacheKey].expiresAt > now) {
      console.log(`Serving cached weather data for ${lat},${lon}`);
      return res.json(weatherCache[cacheKey].data);
    }
    
    // Data not in cache or expired, fetch from API
    console.log(`Fetching fresh weather data for ${lat},${lon}`);
    
    // Fetch current weather data
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`;
    
    // Fetch one-call forecast data
    const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`;
    
    // Fetch 5-day forecast for trends
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`;
    
    // Make parallel requests with safe fetch
    const [current, oneCall, forecast] = await Promise.all([
      safeFetch(currentUrl, 'Current weather'),
      safeFetch(oneCallUrl, 'One-call'),
      safeFetch(forecastUrl, 'Forecast')
    ]);
    
    // Generate enhanced automotive weather metrics
    const enhancedData = calculateAutomotiveMetrics(current, oneCall, forecast, units as string);
    
    // Store in cache
    weatherCache[cacheKey] = {
      data: enhancedData,
      timestamp: now,
      expiresAt: now + CACHE_EXPIRATION
    };
    
    // Return enhanced data
    return res.json(enhancedData);
  } catch (error) {
    console.error('Automotive weather API error:', error);
    
    // Special handling for rate limit errors
    if ((error as Error).message && (error as Error).message.includes('rate limit')) {
      isRateLimited = true;
      rateLimitResetTime = Date.now() + RATE_LIMIT_CACHE_EXPIRATION;
      
      // Check if we have cached data
      const cacheKey = generateCacheKey(
        req.query.lat as string, 
        req.query.lon as string, 
        req.query.units as string || 'imperial'
      );
      
      const cachedData = weatherCache[cacheKey];
      if (cachedData) {
        console.log(`Serving cached data for ${req.query.lat},${req.query.lon} after rate limit error`);
        res.set('X-Rate-Limited', 'true');
        res.set('X-Rate-Limit-Reset', new Date(rateLimitResetTime).toISOString());
        return res.json(cachedData.data);
      }
      
      // Serve default data if available
      const defaultCacheKey = generateCacheKey(DEFAULT_LAT.toString(), DEFAULT_LON.toString(), DEFAULT_UNITS);
      if (weatherCache[defaultCacheKey]) {
        console.log(`Serving default Atlanta data during rate limit for ${req.query.lat},${req.query.lon}`);
        res.set('X-Rate-Limited', 'true');
        res.set('X-Default-Data', 'true');
        return res.json(weatherCache[defaultCacheKey].data);
      }
      
      return res.status(429).json({
        message: 'Weather API rate limited. Try again later.',
        retryAfter: new Date(rateLimitResetTime).toISOString()
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: (error as Error).message || 'Failed to fetch automotive weather data' 
    });
  }
}

/**
 * Calculate enhanced driving-focused weather metrics
 */
function calculateAutomotiveMetrics(current: any, oneCall: any, forecast: any, units: any) {
  // Extract location info
  const location = {
    name: current.name,
    country: current.sys.country,
    coordinates: {
      lat: current.coord.lat,
      lon: current.coord.lon
    }
  };
  
  // Determine if it's currently daytime
  const isDay = isDaytime(
    Math.floor(Date.now() / 1000),
    current.sys.sunrise,
    current.sys.sunset
  );
  
  // Extract and enhance current conditions
  const currentConditions = {
    temp: current.main.temp,
    feels_like: current.main.feels_like,
    pressure: current.main.pressure,
    humidity: current.main.humidity,
    dew_point: calculateDewPoint(current.main.temp, current.main.humidity, units),
    uvi: oneCall.current.uvi,
    wind_speed: current.wind.speed,
    wind_deg: current.wind.deg,
    wind_direction: getWindDirection(current.wind.deg),
    visibility: current.visibility / 1000, // Convert to km
    weather: current.weather,
    is_day: isDay
  };
  
  // Calculate track surface temperature (typically 10-30°F higher than air temp depending on conditions)
  const trackTemp = calculateTrackTemp(
    currentConditions.temp,
    oneCall.current.clouds,
    current.weather[0].main,
    units
  );
  
  // Get sun position for glare risk assessment
  const sunPosition = calculateSunPosition(
    Math.floor(Date.now() / 1000),
    current.sys.sunrise,
    current.sys.sunset
  );
  
  // Calculate grip level (0-100, higher is better)
  const gripLevel = calculateGripLevel(
    current.weather[0].main,
    trackTemp,
    current.main.humidity,
    (oneCall.current.rain ? oneCall.current.rain['1h'] : 0) || 0,
    (oneCall.current.snow ? oneCall.current.snow['1h'] : 0) || 0
  );
  
  // Calculate track evolution (rate of rubber buildup)
  const trackEvolution = calculateTrackEvolution(
    current.weather[0].main,
    (oneCall.current.rain ? oneCall.current.rain['1h'] : 0) || 0,
    (oneCall.current.snow ? oneCall.current.snow['1h'] : 0) || 0,
    oneCall.current.clouds
  );
  
  // Determine track condition
  let trackCondition = 'Dry';
  
  if (current.weather[0].main.toLowerCase().includes('rain') || 
      current.weather[0].main.toLowerCase().includes('drizzle')) {
    trackCondition = 'Wet';
  } else if (current.weather[0].main.toLowerCase().includes('snow')) {
    trackCondition = 'Snow-covered';
  } else if (current.weather[0].main.toLowerCase().includes('ice') || 
             current.weather[0].main.toLowerCase().includes('sleet')) {
    trackCondition = 'Icy';
  } else if (current.main.humidity > 90 || 
             (oneCall.current.rain && oneCall.current.rain['1h'] > 0) ||
             current.weather[0].main.toLowerCase().includes('mist')) {
    trackCondition = 'Damp';
  } else if (gripLevel > 90) {
    trackCondition = 'Optimal';
  }
  
  // Calculate tire-related metrics
  const tireData = calculateTireMetrics(
    trackTemp, 
    currentConditions.temp, 
    trackCondition, 
    currentConditions.humidity,
    (oneCall.current.rain ? oneCall.current.rain['1h'] : 0) || 0
  );
  
  // Calculate weather impact on vehicle performance
  const performanceData = calculatePerformanceImpact(
    currentConditions.temp,
    currentConditions.pressure,
    currentConditions.humidity,
    currentConditions.wind_speed,
    currentConditions.wind_deg,
    current.weather[0].main,
    currentConditions.visibility,
    (oneCall.current.rain ? oneCall.current.rain['1h'] : 0) || 0,
    (oneCall.current.snow ? oneCall.current.snow['1h'] : 0) || 0
  );
  
  // Calculate risk level for driving
  const alertLevel = calculateAlertLevel(
    current.weather[0].main,
    currentConditions.visibility,
    currentConditions.wind_speed,
    (oneCall.current.rain ? oneCall.current.rain['1h'] : 0) || 0,
    (oneCall.current.snow ? oneCall.current.snow['1h'] : 0) || 0
  );
  
  // Generate driving recommendation based on conditions
  const drivingRecommendation = generateDrivingRecommendation(
    current.weather[0].main,
    trackTemp,
    gripLevel,
    currentConditions.visibility,
    performanceData.crosswind_effect
  );
  
  // Analyze forecast trend
  const forecastTrend = analyzeForecastTrend(forecast);
  
  // Assess risk of sun glare
  const glareRisk = assessGlareRisk(
    sunPosition,
    Math.floor(Date.now() / 1000),
    current.sys.sunrise,
    current.sys.sunset,
    oneCall.current.clouds
  );
  
  // Format the enhanced automotive weather data
  return {
    location,
    currentConditions,
    drivingConditions: {
      track_temp: trackTemp,
      track_condition: trackCondition,
      grip_index: gripLevel,
      grip_assessment: assessGrip(gripLevel),
      track_evolution: trackEvolution,
      track_evolution_trend: assessEvolution(trackEvolution),
      alert_level: alertLevel,
      precipitation_intensity: assessPrecipitation(
        (oneCall.current.rain ? oneCall.current.rain['1h'] : 0) || 0,
        (oneCall.current.snow ? oneCall.current.snow['1h'] : 0) || 0
      ),
      precipitation_probability: oneCall.hourly[0].pop * 100
    },
    tireData,
    performanceData,
    drivingRecommendation,
    forecastTrend,
    sunData: {
      sunrise: current.sys.sunrise * 1000, // Convert to milliseconds
      sunset: current.sys.sunset * 1000,   // Convert to milliseconds
      glareRisk: glareRisk.risk,
      glareDirection: glareRisk.direction
    }
  };
}

/**
 * Calculate estimated track temperature based on weather conditions
 */
function calculateTrackTemp(airTemp: any, cloudCover: any, condition: any, units: any) {
  const conditionLower = condition.toLowerCase();
  const isMetric = units === 'metric';
  
  // Base increases in track temp vs air temp
  let baseIncrease: number;
  
  if (isMetric) {
    baseIncrease = 5; // 5°C increase for metric
  } else {
    baseIncrease = 10; // 10°F increase for imperial
  }
  
  // Weather condition effects
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return airTemp - (isMetric ? 2 : 3); // Wet track is cooler than air temp
  } else if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
    return isMetric ? 0 : 32; // Freezing temperatures
  } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    // Sunny conditions increase track temperature significantly
    baseIncrease += (100 - cloudCover) / (isMetric ? 10 : 5);
  }
  
  // Cloud cover reduces the temperature increase (0-100% scale)
  const cloudEffect = cloudCover / (isMetric ? 10 : 5);
  
  return airTemp + baseIncrease - cloudEffect;
}

/**
 * Calculate sun position and glare risk
 */
function calculateSunPosition(now: any, sunrise: any, sunset: any) {
  if (now < sunrise || now > sunset) {
    return {
      elevation: -10, // Below horizon
      direction: 'None'
    };
  }
  
  const dayLength = sunset - sunrise;
  const timeElapsed = now - sunrise;
  const dayProgress = timeElapsed / dayLength;
  
  // Simple curve for sun elevation (0 at sunrise/sunset, maximum at mid-day)
  const elevation = Math.sin(dayProgress * Math.PI) * 90;
  
  // Direction (simplistic model - East in morning, West in evening)
  let direction: string;
  
  if (dayProgress < 0.25) {
    direction = 'East';
  } else if (dayProgress < 0.5) {
    direction = 'Southeast';
  } else if (dayProgress < 0.75) {
    direction = 'Southwest';
  } else {
    direction = 'West';
  }
  
  return {
    elevation,
    direction
  };
}

/**
 * Assess glare risk based on sun position
 */
function assessGlareRisk(sunPosition: any, now: any, sunrise: any, sunset: any, cloudCover: any) {
  if (now < sunrise || now > sunset) {
    return {
      risk: 'None',
      direction: 'None'
    };
  }
  
  // Higher risk at lower sun elevations when sun is in front of driver
  let risk: string;
  let direction = sunPosition.direction;
  
  if (cloudCover > 80) {
    risk = 'Low'; // High cloud cover reduces glare
  } else if (sunPosition.elevation < 20) {
    risk = 'Severe'; // Low sun angle creates worst glare
  } else if (sunPosition.elevation < 40) {
    risk = 'High';
  } else if (sunPosition.elevation < 60) {
    risk = 'Moderate';
  } else {
    risk = 'Low'; // Sun high in sky causes minimal glare
  }
  
  // Adjust for cloud cover
  if (cloudCover > 50 && risk !== 'Low') {
    if (risk === 'Severe') risk = 'High';
    else if (risk === 'High') risk = 'Moderate';
    else if (risk === 'Moderate') risk = 'Low';
  }
  
  return {
    risk,
    direction
  };
}

/**
 * Calculate grip level based on track conditions
 */
function calculateGripLevel(condition: any, trackTemp: any, humidity: any, rainVolume: any, snowVolume: any) {
  const conditionLower = condition.toLowerCase();
  let gripBase = 85; // Start with good grip by default
  
  // Weather condition impacts
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    gripBase = 50; // Wet conditions reduce grip
    gripBase -= rainVolume * 10; // Heavier rain reduces grip further
  } else if (conditionLower.includes('snow')) {
    gripBase = 20; // Snow dramatically reduces grip
    gripBase -= snowVolume * 5; // More snow, less grip
  } else if (conditionLower.includes('ice')) {
    gripBase = 10; // Ice has minimal grip
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    gripBase = 70; // Fog often means damp surfaces
  }
  
  // Temperature impacts - optimal range is different for different conditions
  let tempFactor = 0;
  if (conditionLower.includes('rain') || conditionLower.includes('wet')) {
    // For wet conditions, warmer is generally better up to a point
    if (trackTemp < 40) tempFactor = -10;
    else if (trackTemp < 60) tempFactor = -5;
    else if (trackTemp > 100) tempFactor = -5; // Too hot can cause hydroplaning
  } else {
    // For dry conditions, there's an ideal temperature range
    if (trackTemp < 50) tempFactor = -15; // Cold tires don't grip well
    else if (trackTemp < 70) tempFactor = -5;  // Cool but not ideal
    else if (trackTemp > 140) tempFactor = -20; // Too hot reduces grip
    else if (trackTemp > 120) tempFactor = -10; // Very hot reduces grip
  }
  
  // Humidity impacts - higher humidity can reduce grip in dry conditions
  let humidityFactor = 0;
  if (!conditionLower.includes('rain') && !conditionLower.includes('snow')) {
    if (humidity > 90) humidityFactor = -10; // Very humid air can make surfaces damp
    else if (humidity > 80) humidityFactor = -5;
  }
  
  // Calculate final grip level
  let gripLevel = gripBase + tempFactor + humidityFactor;
  
  // Ensure grip level stays within bounds
  return Math.max(0, Math.min(100, gripLevel));
}

/**
 * Calculate track evolution (rubber buildup)
 */
function calculateTrackEvolution(condition: any, rainVolume: any, snowVolume: any, cloudCover: any) {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('heavy rain') || rainVolume > 2.5) {
    return 'Washing Away';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || rainVolume > 0) {
    return 'Deteriorating';
  } else if (conditionLower.includes('snow') || snowVolume > 0) {
    return 'Resetting';
  } else if (cloudCover < 30) {
    return 'Rapid Improvement'; // Sunny conditions accelerate rubber buildup
  } else {
    return 'Steady Improvement';
  }
}

/**
 * Calculate tire-related metrics
 */
function calculateTireMetrics(trackTemp: any, airTemp: any, condition: any, humidity: any, rainVolume: any) {
  // Determine optimal tire compound based on conditions
  let optimalCompound: string;
  let optimalWindow: string;
  
  if (condition === 'Wet' || condition === 'Damp') {
    optimalCompound = 'Wet';
    optimalWindow = '50-85°F';
  } else if (trackTemp < 60) {
    optimalCompound = 'Soft';
    optimalWindow = '50-70°F';
  } else if (trackTemp < 85) {
    optimalCompound = 'Medium';
    optimalWindow = '75-90°F';
  } else {
    optimalCompound = 'Hard';
    optimalWindow = '85-110°F';
  }
  
  // Determine tire wear pattern based on conditions
  const wearPattern = getTireWearPattern(trackTemp, condition, humidity);
  
  // Determine recommended tire pressure adjustments
  let pressureRec: string;
  let frontDelta = 0;
  let rearDelta = 0;
  let pressureBuildupRate = 'Normal';
  
  if (condition === 'Wet' || condition === 'Damp') {
    pressureRec = 'Lower pressures recommended for wet conditions';
    frontDelta = -2.0;
    rearDelta = -2.0;
    pressureBuildupRate = 'Slow';
  } else if (trackTemp < 60) {
    pressureRec = 'Increase pressures to compensate for cold track';
    frontDelta = 1.5;
    rearDelta = 1.0;
    pressureBuildupRate = 'Slow';
  } else if (trackTemp > 100) {
    pressureRec = 'Decrease starting pressures for hot conditions';
    frontDelta = -1.0;
    rearDelta = -1.0;
    pressureBuildupRate = 'Rapid';
  } else {
    pressureRec = 'Standard pressure recommended';
    pressureBuildupRate = 'Normal';
  }
  
  // Calculate risk of various tire issues
  let grainingRisk = 'Low';
  let blisteringRisk = 'Low';
  
  if (condition !== 'Wet' && condition !== 'Damp') {
    if (trackTemp < 60) {
      grainingRisk = 'High';
    } else if (trackTemp < 70) {
      grainingRisk = 'Moderate';
    }
    
    if (trackTemp > 100) {
      blisteringRisk = 'High';
    } else if (trackTemp > 90) {
      blisteringRisk = 'Moderate';
    }
  }
  
  // Determine expected wear rate
  let wearRate = 'Normal';
  
  if (condition === 'Wet' || condition === 'Damp') {
    wearRate = 'Low';
  } else if (trackTemp > 100) {
    wearRate = 'High';
  } else if (trackTemp > 90) {
    wearRate = 'Accelerated';
  } else if (trackTemp < 60) {
    wearRate = 'Low';
  }
  
  // Determine management strategy
  let strategy: string;
  
  if (grainingRisk === 'High') {
    strategy = 'Monitor for graining, gentle warm-up recommended';
  } else if (blisteringRisk === 'High') {
    strategy = 'Watch for blistering, avoid prolonged high loads';
  } else if (wearRate === 'High') {
    strategy = 'Consider more frequent rotation, monitor wear closely';
  } else {
    strategy = 'Standard rotation schedule recommended';
  }
  
  return {
    optimal_compound: optimalCompound,
    tire_temperature: {
      surface: trackTemp,
      core: (trackTemp + airTemp) / 2, // Approximation of core temp
      optimal_window: optimalWindow
    },
    pressure: {
      recommendation: pressureRec,
      front_pressure_delta: frontDelta,
      rear_pressure_delta: rearDelta,
      pressure_buildup_rate: pressureBuildupRate
    },
    wear: {
      expected_wear_rate: wearRate,
      wear_pattern: wearPattern,
      graining_risk: grainingRisk,
      blistering_risk: blisteringRisk,
      management_strategy: strategy
    }
  };
}

/**
 * Calculate expected tire wear pattern
 */
function getTireWearPattern(trackTemp: any, condition: any, humidity: any) {
  if (condition === 'Wet' || condition === 'Damp') {
    return 'Even';
  } else if (trackTemp < 60) {
    return 'Center wear';  // Cold tires often lead to center wear
  } else if (trackTemp > 100) {
    return 'Edge wear';    // Hot conditions often lead to edge wear
  } else if (humidity > 85) {
    return 'Slightly uneven'; // High humidity can cause inconsistent grip
  } else {
    return 'Even';
  }
}

/**
 * Calculate performance impact metrics
 */
function calculatePerformanceImpact(
  temp: number,
  pressure: number,
  humidity: number,
  windSpeed: number,
  windDirection: number,
  condition: string,
  visibility: number,
  rainVolume: number,
  snowVolume: number
) {
  // Calculate air density factor based on temperature, pressure, and humidity
  const airDensityFactor = calculateAirDensityFactor(temp, pressure, humidity);
  
  // Calculate power and torque adjustments based on air density
  const powerAdjustment = calculatePowerAdjustment(airDensityFactor, temp);
  
  // Generate torque curve adjustments
  const torqueCurve = {
    low_end: `${(powerAdjustment * 0.8).toFixed(1)}%`,
    mid_range: `${powerAdjustment.toFixed(1)}%`,
    high_end: `${(powerAdjustment * 1.2).toFixed(1)}%`,
  };
  
  // Calculate cooling efficiency
  const coolingEfficiency = calculateCoolingEfficiency(temp, windSpeed, humidity);
  
  // Calculate expected engine temperature delta
  const engineTempDelta = (temp > 80) ? "+3°F" : (temp < 40) ? "-5°F" : "-2°F";
  
  // Calculate fuel consumption impact
  // Higher air density = better efficiency, but rain and snow worsen it
  let fuelConsumptionDelta: string;
  if (airDensityFactor > 1.05) {
    fuelConsumptionDelta = "-1.5%";
  } else if (airDensityFactor < 0.95) {
    fuelConsumptionDelta = "+2.0%";
  } else if (condition.toLowerCase().includes('rain')) {
    fuelConsumptionDelta = `+${(1 + rainVolume).toFixed(1)}%`;
  } else if (condition.toLowerCase().includes('snow')) {
    fuelConsumptionDelta = `+${(3 + snowVolume).toFixed(1)}%`;
  } else {
    fuelConsumptionDelta = "±0%";
  }
  
  // Calculate aerodynamic efficiency
  const aeroEfficiency = calculateAeroEfficiency(temp, windSpeed);
  
  // Calculate downforce effectiveness
  const downforceEffect = calculateDownforceAdjustment(temp, airDensityFactor);
  let downforceEffectiveness: string;
  
  if (downforceEffect > 1.05) {
    downforceEffectiveness = "Enhanced";
  } else if (downforceEffect < 0.95) {
    downforceEffectiveness = "Reduced";
  } else {
    downforceEffectiveness = "Optimal";
  }
  
  // Determine crosswind effect
  let crosswindEffect: string;
  // Wind angles between 45-135 or 225-315 degrees have significant crosswind component
  const isCrosswind = (windDirection > 45 && windDirection < 135) || 
                     (windDirection > 225 && windDirection < 315);
  
  if (isCrosswind && windSpeed > 15) {
    crosswindEffect = "Severe";
  } else if (isCrosswind && windSpeed > 8) {
    crosswindEffect = "Moderate";
  } else if (isCrosswind && windSpeed > 3) {
    crosswindEffect = "Slight";
  } else {
    crosswindEffect = "Minimal";
  }
  
  // Calculate braking effectiveness
  let brakingEfficiency = 100; // Start at 100%
  
  // Wet conditions reduce braking effectiveness
  if (condition.toLowerCase().includes('rain')) {
    brakingEfficiency -= (rainVolume * 10);
  } else if (condition.toLowerCase().includes('snow')) {
    brakingEfficiency -= (30 + snowVolume * 5);
  } else if (condition.toLowerCase().includes('ice')) {
    brakingEfficiency = 40; // Ice severely impacts braking
  } else if (humidity > 90) {
    brakingEfficiency -= 5; // Very high humidity can make surfaces damp
  }
  
  // Temperature impacts brake performance too
  if (temp < 40) {
    brakingEfficiency -= 5; // Cold brakes take longer to warm up
  }
  
  // Keep braking efficiency within reasonable bounds
  brakingEfficiency = Math.max(30, Math.min(100, brakingEfficiency));
  
  // Calculate braking distance adjustment
  const brakingDistanceAdjustment = calculateBrakingDistanceAdjustment(brakingEfficiency);
  
  // Determine heat dissipation rate for brakes and engine
  const heatDissipationRate = getHeatDissipationRate(temp, humidity, windSpeed);
  
  return {
    power_adjustment: powerAdjustment,
    torque_curve: torqueCurve,
    cooling_efficiency: coolingEfficiency,
    engine_temperature_delta: engineTempDelta,
    fuel_consumption_delta: fuelConsumptionDelta,
    aerodynamic_efficiency: aeroEfficiency,
    downforce_effectiveness: downforceEffectiveness,
    crosswind_effect: crosswindEffect,
    braking_efficiency: brakingEfficiency,
    braking_distance_adjustment: brakingDistanceAdjustment,
    heat_dissipation: heatDissipationRate
  };
}

function calculateAirDensityFactor(temp: number, pressure: number, humidity: number): number {
  // Very simplified air density calculation
  // Higher pressure = higher density
  // Higher temp = lower density
  // Higher humidity = lower density
  
  const pressureFactor = pressure / 1013.25; // Normalize to standard pressure
  const tempFactor = 273.15 / (273.15 + temp); // Higher temp = lower density
  const humidityFactor = 1 - (humidity / 1000); // Humidity slightly reduces density
  
  return pressureFactor * tempFactor * humidityFactor;
}

function calculatePowerAdjustment(airDensityFactor: number, temp: number): number {
  // Base power adjustment due to air density
  // Higher density = more power for naturally aspirated engines
  let powerAdj = (airDensityFactor - 1) * 100;
  
  // Temperature effects on power
  // Cold air is denser and contains more oxygen
  if (temp < 50) {
    powerAdj += 2; // Cold air bonus
  } else if (temp > 90) {
    powerAdj -= 1; // Hot air penalty
  }
  
  return Math.round(powerAdj * 10) / 10; // Round to 1 decimal place
}

function calculateTorqueAdjustment(airDensityFactor: number): number {
  // Similar to power but with less variation
  return (airDensityFactor - 1) * 80;
}

function calculateAeroEfficiency(temp: number, windSpeed: number): number {
  // Base efficiency is 100%
  let efficiency = 100;
  
  // Temperature has minor effect on air viscosity
  if (temp < 32) efficiency += 1;
  else if (temp > 90) efficiency -= 2;
  
  // Wind can disrupt optimal aero
  if (windSpeed > 15) efficiency -= 8;
  else if (windSpeed > 8) efficiency -= 3;
  
  return efficiency;
}

function calculateDownforceAdjustment(temp: number, airDensityFactor: number): number {
  // Downforce is directly related to air density
  return airDensityFactor;
}

function calculateCoolingEfficiency(temp: number, windSpeed: number, humidity: number): string {
  if (temp < 50) {
    return "Excellent"; // Cold weather is great for cooling
  } else if (temp < 70) {
    return "Very Good";
  } else if (temp < 85) {
    if (windSpeed > 8) return "Good"; // Wind helps with cooling
    return "Good";
  } else if (temp < 95) {
    if (humidity > 80) return "Moderate"; // Humidity reduces cooling efficiency
    if (windSpeed > 8) return "Good";
    return "Moderate";
  } else {
    if (humidity > 80) return "Poor";
    if (windSpeed > 12) return "Moderate";
    return "Poor";
  }
}

function calculateBrakingDistanceAdjustment(brakingEfficiency: number): number {
  // Convert braking efficiency percentage to a multiplier for braking distance
  // Lower efficiency = longer braking distance
  // E.g., 80% efficiency = 1.25x braking distance (1/0.8 = 1.25)
  return Math.round((100 / brakingEfficiency) * 100) / 100;
}

function getHeatDissipationRate(temp: number, humidity: number, windSpeed: number): string {
  if (temp < 60) {
    if (windSpeed > 10) return "Rapid";
    return "Good";
  } else if (temp < 80) {
    if (humidity > 80) return "Moderate"; // High humidity reduces heat dissipation
    if (windSpeed > 10) return "Good";
    return "Moderate";
  } else {
    if (humidity > 80) return "Poor";
    if (windSpeed > 15) return "Moderate";
    return "Poor";
  }
}

/**
 * Map grip assessment to numeric value
 */
const GRIP_ASSESSMENTS = {
  "Excellent": 90,
  "Good": 75,
  "Moderate": 60,
  "Poor": 40,
  "Very Poor": 20
};

/**
 * Calculate alert level based on severe weather conditions
 */
function calculateAlertLevel(condition: any, visibility: any, windSpeed: any, rainVolume: any, snowVolume: any) {
  const conditionLower = condition.toLowerCase();
  const visibilityLevel = getVisibilityLevel(visibility, conditionLower);
  
  // Determine overall alert level
  if (
    conditionLower.includes('tornado') ||
    conditionLower.includes('hurricane') ||
    conditionLower.includes('blizzard') ||
    (conditionLower.includes('storm') && rainVolume > 15) ||
    (conditionLower.includes('flood')) ||
    (windSpeed > 50)
  ) {
    return 'Severe';
  } else if (
    (conditionLower.includes('snow') && snowVolume > 2) ||
    (conditionLower.includes('rain') && rainVolume > 10) ||
    (windSpeed > 35) ||
    visibilityLevel === 'Very Poor'
  ) {
    return 'High';
  } else if (
    (conditionLower.includes('rain') && rainVolume > 5) ||
    (conditionLower.includes('snow') && snowVolume > 0.5) ||
    (windSpeed > 25) ||
    visibilityLevel === 'Poor'
  ) {
    return 'Moderate';
  } else if (
    (conditionLower.includes('rain')) ||
    (conditionLower.includes('snow')) ||
    (windSpeed > 15) ||
    visibilityLevel === 'Moderate'
  ) {
    return 'Low';
  }
  
  return 'Minimal';
}

/**
 * Generate driving recommendations based on conditions
 */
function generateDrivingRecommendation(condition: any, trackTemp: any, gripIndex: any, visibility: any, crossWindEffect: any) {
  const conditionLower = condition.toLowerCase();
  const gripLevel = gripAssessmentToValue(assessGrip(gripIndex));
  
  let recommendation = '';
  
  // Base recommendation on grip level
  if (gripLevel > 80) {
    recommendation = 'Excellent driving conditions. Optimal grip and visibility.';
  } else if (gripLevel > 60) {
    recommendation = 'Good driving conditions with adequate grip.';
  } else if (gripLevel > 40) {
    recommendation = 'Moderate driving conditions. Use caution and reduce speed slightly.';
  } else if (gripLevel > 20) {
    recommendation = 'Poor driving conditions. Significantly reduce speed and increase following distance.';
  } else {
    recommendation = 'Extremely hazardous conditions. Consider postponing travel if possible.';
  }
  
  // Additional condition-specific advice
  if (conditionLower.includes('rain')) {
    recommendation += ' Wet roads reduce traction and braking effectiveness.';
  } else if (conditionLower.includes('snow')) {
    recommendation += ' Snow-covered roads require gentle inputs and greatly reduced speeds.';
  } else if (conditionLower.includes('ice')) {
    recommendation += ' Icy conditions are extremely dangerous. Avoid sudden inputs and maintain large following distances.';
  } else if (conditionLower.includes('fog') || visibility < 5) {
    recommendation += ' Reduced visibility requires lower speeds and use of appropriate lighting.';
  }
  
  // Tire temperature recommendations
  if (trackTemp < 50) {
    recommendation += ' Cold surface temperatures will reduce grip until tires warm up.';
  } else if (trackTemp > 100) {
    recommendation += ' Hot surface temperatures may cause increased tire wear.';
  }
  
  // Crosswind recommendations
  if (crossWindEffect === 'Severe' || crossWindEffect === 'Moderate') {
    recommendation += ' Strong crosswinds may affect vehicle stability, particularly at higher speeds.';
  }
  
  return recommendation;
}

/**
 * Analyze 5-day forecast data for trend information
 */
function analyzeForecastTrend(forecastData: any) {
  // Get data points for analysis (every 8 hours = 3 points per day)
  const temps = forecastData.list.slice(0, 15).map((item: any) => item.main.temp);
  const precip = forecastData.list.slice(0, 15).map((item: any) => {
    return (item.rain ? item.rain['3h'] : 0) || (item.snow ? item.snow['3h'] : 0) || 0;
  });
  const winds = forecastData.list.slice(0, 15).map((item: any) => item.wind.speed);
  
  // Analyze temperature trend
  const tempAvg = temps.reduce((sum: number, val: number) => sum + val, 0) / temps.length;
  const tempEnd = temps.slice(-3).reduce((sum: number, val: number) => sum + val, 0) / 3;
  const tempStart = temps.slice(0, 3).reduce((sum: number, val: number) => sum + val, 0) / 3;
  
  let tempTrend: string;
  if (tempEnd > tempStart + 10) {
    tempTrend = "Warming significantly";
  } else if (tempEnd > tempStart + 5) {
    tempTrend = "Warming";
  } else if (tempEnd < tempStart - 10) {
    tempTrend = "Cooling significantly";
  } else if (tempEnd < tempStart - 5) {
    tempTrend = "Cooling";
  } else {
    tempTrend = "Stable";
  }
  
  // Analyze precipitation trend
  const hasPrecip = precip.some((p: number) => p > 0);
  const precipCount = precip.filter((p: number) => p > 0).length;
  const isPrecipIncreasing = precip.slice(9).filter((p: number) => p > 0).length > 
                            precip.slice(0, 5).filter((p: number) => p > 0).length;
  
  let precipTrend: string;
  if (!hasPrecip) {
    precipTrend = "No precipitation expected";
  } else if (precipCount > 10) {
    precipTrend = "Persistent precipitation expected";
  } else if (precipCount > 5) {
    precipTrend = "Intermittent precipitation expected";
  } else if (isPrecipIncreasing) {
    precipTrend = "Increasing chance of precipitation";
  } else {
    precipTrend = "Occasional precipitation possible";
  }
  
  // Analyze wind trend
  const windAvg = winds.reduce((sum: number, val: number) => sum + val, 0) / winds.length;
  const maxWind = Math.max(...winds);
  
  let windTrend: string;
  if (maxWind > 20) {
    windTrend = "Strong winds expected";
  } else if (maxWind > 15) {
    windTrend = "Moderate winds expected";
  } else if (windAvg > 10) {
    windTrend = "Breezy conditions continuing";
  } else {
    windTrend = "Light to moderate winds continuing";
  }
  
  // Generate overall summary
  let summary: string;
  
  if (tempTrend.includes("significantly") || precipCount > 8 || maxWind > 20) {
    summary = `Significant weather changes expected. ${tempTrend}. ${precipTrend}. ${windTrend}.`;
  } else if (!hasPrecip && tempTrend === "Stable" && maxWind < 15) {
    summary = "Consistent favorable conditions expected to continue";
  } else {
    summary = `${tempTrend} temperatures. ${precipTrend}. ${windTrend}.`;
  }
  
  return {
    temperature: tempTrend,
    precipitation: precipTrend,
    wind: windTrend,
    summary: summary
  };
}

/**
 * Convert wind direction degrees to human-readable direction
 */
function getWindDirection(degrees: any) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Determine if it's currently daytime
 */
function isDaytime(currentTime: any, sunrise: any, sunset: any) {
  return currentTime >= sunrise && currentTime <= sunset;
}

/**
 * Calculate dew point if not provided
 */
function calculateDewPoint(temp: any, humidity: any, units: any) {
  if (units === 'metric') {
    // Calculation for Celsius
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
    return (b * alpha) / (a - alpha);
  } else {
    // Calculation for Fahrenheit (converted from Celsius calculation)
    const tempC = (temp - 32) * 5/9;
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100.0);
    const dewPointC = (b * alpha) / (a - alpha);
    return (dewPointC * 9/5) + 32;
  }
}

/**
 * Assess grip level quality
 */
function assessGrip(gripIndex: any) {
  if (gripIndex >= 85) return 'Excellent';
  if (gripIndex >= 70) return 'Good';
  if (gripIndex >= 50) return 'Moderate';
  if (gripIndex >= 30) return 'Poor';
  return 'Very Poor';
}

/**
 * Convert grip assessment string to numeric value
 */
function gripAssessmentToValue(assessment: any) {
  return GRIP_ASSESSMENTS[assessment] || 50; // Default to moderate if not found
}

/**
 * Assess track evolution trend
 */
function assessEvolution(evolutionValue: any) {
  if (evolutionValue === 'Rapid Improvement') return 'Positive';
  if (evolutionValue === 'Steady Improvement') return 'Positive';
  if (evolutionValue === 'Deteriorating') return 'Negative';
  if (evolutionValue === 'Washing Away') return 'Negative';
  if (evolutionValue === 'Resetting') return 'Negative';
  return 'Neutral';
}

/**
 * Assess precipitation intensity
 */
function assessPrecipitation(rainVolume: any, snowVolume: any) {
  const totalPrecip = rainVolume + (snowVolume * 10); // Snow has greater impact
  
  if (totalPrecip === 0) return 'None';
  if (totalPrecip < 1) return 'Light';
  if (totalPrecip < 4) return 'Moderate';
  if (totalPrecip < 10) return 'Heavy';
  return 'Severe';
}

function getVisibilityLevel(visibility: number, condition: string): string {
  if (visibility < 0.1) {
    return 'Very Poor';
  } else if (visibility < 0.5) {
    return 'Poor';
  } else if (visibility < 2) {
    return 'Moderate';
  } else if (visibility < 5) {
    return 'Good';
  } else {
    return 'Excellent';
  }
}
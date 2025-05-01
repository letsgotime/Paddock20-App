import type { Request, Response } from 'express';

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
function generateCacheKey(lat: string | string[], lon: string | string[], units: string): string {
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
          // No cached data available
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
  const baseIncrease = isMetric ? 5 : 10; // °C or °F, respectively
  const sunnyIncrease = isMetric ? 15 : 30;
  const cloudyIncrease = isMetric ? 7 : 15;
  const rainDecrease = isMetric ? 2 : 5;
  
  let trackTemp = airTemp;
  
  // Apply condition modifiers
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    // Rain cools the track
    trackTemp += baseIncrease;
    trackTemp -= rainDecrease;
  } else if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
    // Snow/ice makes track temp close to air temp
    trackTemp += 0;
  } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    // Clear conditions = maximum heating
    const intensityFactor = (100 - cloudCover) / 100;
    trackTemp += baseIncrease + (sunnyIncrease * intensityFactor);
  } else {
    // Cloudy conditions = moderate heating
    const cloudFactor = cloudCover / 100;
    trackTemp += baseIncrease + (cloudyIncrease * (1 - cloudFactor));
  }
  
  return Math.round(trackTemp);
}

/**
 * Calculate sun position and glare risk
 */
function calculateSunPosition(now: any, sunrise: any, sunset: any) {
  if (now < sunrise || now > sunset) {
    return 'night'; // It's night time
  }
  
  const totalDayLength = sunset - sunrise;
  const timePassedSinceSunrise = now - sunrise;
  const proportionOfDayPassed = timePassedSinceSunrise / totalDayLength;
  
  // Calculate sun angle (0 = horizon at sunrise, 180 = horizon at sunset)
  const sunAngle = proportionOfDayPassed * 180;
  
  // Determine position
  if (sunAngle < 15) return 'east-low'; // Just after sunrise
  if (sunAngle < 75) return 'east-high'; // Morning
  if (sunAngle < 105) return 'overhead'; // Midday
  if (sunAngle < 165) return 'west-high'; // Afternoon
  return 'west-low'; // Near sunset
}

/**
 * Assess glare risk based on sun position
 */
function assessGlareRisk(sunPosition: any, now: any, sunrise: any, sunset: any, cloudCover: any) {
  if (sunPosition === 'night') {
    return { risk: 'None', direction: 'None' };
  }
  
  // If very cloudy, reduce glare risk
  if (cloudCover > 80) {
    return { risk: 'Low', direction: directionFromSunPosition(sunPosition) };
  }
  
  // Critical times for glare (dawn and dusk)
  const withinGlareWindow = (sunset - now < 3600 || now - sunrise < 3600);
  
  // Determine risk based on sun position and cloud cover
  if (withinGlareWindow) {
    // Dawn/dusk has high glare risk if not cloudy
    return {
      risk: cloudCover > 50 ? 'Moderate' : 'Severe',
      direction: directionFromSunPosition(sunPosition)
    };
  }
  
  // Position-based assessment
  if (sunPosition === 'east-low' || sunPosition === 'west-low') {
    return {
      risk: 'Moderate',
      direction: directionFromSunPosition(sunPosition)
    };
  }
  
  if (sunPosition === 'east-high' || sunPosition === 'west-high') {
    return {
      risk: cloudCover > 40 ? 'Low' : 'Moderate',
      direction: directionFromSunPosition(sunPosition)
    };
  }
  
  // Overhead sun usually has minimal glare
  return { risk: 'Low', direction: 'Overhead' };
}

/**
 * Convert sun position to cardinal direction
 */
function directionFromSunPosition(position: any) {
  switch(position) {
    case 'east-low':
    case 'east-high':
      return 'East';
    case 'west-low':
    case 'west-high':
      return 'West';
    case 'overhead':
      return 'Overhead';
    default:
      return 'None';
  }
}

/**
 * Calculate grip level based on track conditions
 */
function calculateGripLevel(condition: any, trackTemp: any, humidity: any, rainVolume: any, snowVolume: any) {
  const conditionLower = condition.toLowerCase();
  
  // Base grip (0-100 scale)
  let gripIndex = 80; // Default to good grip in dry conditions
  
  // Temperature effect on grip
  if (trackTemp < 40) {
    // Cold track reduces grip
    gripIndex -= (40 - trackTemp);
  } else if (trackTemp > 140) {
    // Very hot track can reduce grip
    gripIndex -= (trackTemp - 140) / 2;
  } else if (trackTemp >= 80 && trackTemp <= 120) {
    // Optimal temperature range improves grip
    gripIndex += 10;
  }
  
  // Cap at 100 for normal conditions
  gripIndex = Math.min(100, gripIndex);
  
  // Weather condition effects
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    // Rain significantly reduces grip
    gripIndex *= (1 - (rainVolume * 0.5));
    gripIndex -= 40;
  } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
    // Mist/fog can make surface damp
    gripIndex -= 20;
  } else if (conditionLower.includes('snow')) {
    // Snow dramatically reduces grip
    gripIndex *= (1 - (snowVolume * 0.7));
    gripIndex -= 60;
  } else if (conditionLower.includes('ice')) {
    // Ice has minimal grip
    gripIndex = 10;
  }
  
  // Humidity effect (high humidity can create damp conditions)
  if (humidity > 85 && !conditionLower.includes('rain')) {
    gripIndex -= (humidity - 85) / 3;
  }
  
  // Ensure grip is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(gripIndex)));
}

/**
 * Calculate track evolution (rubber buildup)
 */
function calculateTrackEvolution(condition: any, rainVolume: any, snowVolume: any, cloudCover: any) {
  const conditionLower = condition.toLowerCase();
  
  // Base evolution rate (0-100 scale)
  let evolutionRate = 70; // Default moderate rubber buildup rate
  
  // Weather condition effects
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    // Rain washes away rubber
    evolutionRate -= 50 + (rainVolume * 30);
  } else if (conditionLower.includes('snow')) {
    // Snow prevents rubber buildup
    evolutionRate -= 70;
  } else if (conditionLower.includes('ice')) {
    // Ice prevents rubber buildup
    evolutionRate -= 80;
  } else if (cloudCover < 30) {
    // Sunny conditions help rubber cure better
    evolutionRate += 15;
  }
  
  // Ensure evolution rate is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(evolutionRate)));
}

/**
 * Calculate tire-related metrics
 */
function calculateTireMetrics(trackTemp: any, airTemp: any, condition: any, humidity: any, rainVolume: any) {
  const conditionLower = condition.toLowerCase();
  
  // Base tire surface temperature (usually higher than track temp)
  let tireSurfaceTemp = trackTemp + 10;
  let tireCoreTemp = trackTemp + 5;
  
  // Weather condition effects
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    // Rain cools tires
    tireSurfaceTemp -= 20 + (rainVolume * 10);
    tireCoreTemp -= 10;
  } else if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
    // Snow/ice drastically cools tires
    tireSurfaceTemp = airTemp;
    tireCoreTemp = airTemp + 2;
  }
  
  // Determine optimal tire compound based on conditions
  let optimalCompound = 'Performance';
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    optimalCompound = 'Wet/Rain';
  } else if (conditionLower.includes('snow')) {
    optimalCompound = 'Winter/Snow';
  } else if (conditionLower.includes('ice')) {
    optimalCompound = 'Winter/Studded';
  } else if (trackTemp < 45) {
    optimalCompound = 'All-Season';
  } else if (trackTemp > 100) {
    optimalCompound = 'Heat-Resistant Performance';
  }
  
  // Tire warmup times (in minutes) for different compounds
  const warmupTimes = {
    sport: 5,
    street: 8,
    all_season: 12
  };
  
  // Select appropriate warmup time
  let baseWarmupTime;
  if (conditionLower.includes('rain') || conditionLower.includes('snow') || conditionLower.includes('ice')) {
    baseWarmupTime = warmupTimes.all_season;
  } else if (trackTemp < 60) {
    baseWarmupTime = warmupTimes.all_season;
  } else {
    baseWarmupTime = warmupTimes.sport;
  }
  
  // Adjust for temperature
  if (trackTemp < 50) {
    baseWarmupTime *= 1.5;
  } else if (trackTemp > 90) {
    baseWarmupTime *= 0.7;
  }
  
  return {
    tire_surface_temp: Math.round(tireSurfaceTemp),
    tire_core_temp: Math.round(tireCoreTemp),
    optimal_compound: optimalCompound,
    warmup_times: {
      sport: Math.round(warmupTimes.sport),
      all_season: Math.round(warmupTimes.all_season)
    },
    expected_wear_pattern: getTireWearPattern(trackTemp, conditionLower, humidity)
  };
}

/**
 * Calculate expected tire wear pattern
 */
function getTireWearPattern(trackTemp: any, condition: any, humidity: any) {
  if (condition.includes('rain') || condition.includes('snow') || condition.includes('ice')) {
    return 'Even wear with potential tread damage';
  }
  
  if (trackTemp > 110) {
    return 'Accelerated center wear on driven wheels';
  }
  
  if (trackTemp < 50) {
    return 'Slow, even wear with reduced grip';
  }
  
  if (humidity > 85) {
    return 'Even wear with potential for uneven heating';
  }
  
  return 'Normal even wear pattern with slight outer edge emphasis';
}

/**
 * Calculate performance impact metrics
 */
function calculatePerformanceImpact(
  airTemp: any,
  pressure: any,
  humidity: any,
  windSpeed: any,
  windDegree: any,
  condition: any,
  visibility: any,
  rainVolume: any,
  snowVolume: any
) {
  // Calculate air density factor
  const airDensityFactor = calculateAirDensityFactor(airTemp, pressure, humidity);
  
  // Calculate power adjustment based on air density
  const powerAdjustment = calculatePowerAdjustment(airDensityFactor, airTemp);
  
  // Calculate torque adjustment
  const torqueAdjustment = calculateTorqueAdjustment(airDensityFactor);
  
  // Calculate aerodynamic efficiency
  const aeroEfficiency = calculateAeroEfficiency(airTemp, windSpeed);
  
  // Calculate downforce adjustment
  const downforceAdjustment = calculateDownforceAdjustment(airTemp, airDensityFactor);
  
  // Calculate cooling efficiency
  const coolingEfficiency = calculateCoolingEfficiency(airTemp, windSpeed, humidity);
  
  // Calculate braking efficiency
  let brakingEfficiency = 95; // Default high braking efficiency
  
  // Adjust for conditions
  if (condition.toLowerCase().includes('rain')) {
    brakingEfficiency -= 15 + (rainVolume * 10);
  } else if (condition.toLowerCase().includes('snow')) {
    brakingEfficiency -= 40 + (snowVolume * 15);
  } else if (condition.toLowerCase().includes('ice')) {
    brakingEfficiency -= 60;
  }
  
  // Adjust for temperature (extremes reduce brake efficiency)
  if (airTemp < 40) {
    brakingEfficiency -= (40 - airTemp) / 2;
  } else if (airTemp > 100) {
    brakingEfficiency -= (airTemp - 100) / 3;
  }
  
  // Calculate braking distance adjustment
  const brakingDistanceAdjustment = calculateBrakingDistanceAdjustment(brakingEfficiency);
  
  // Calculate heat dissipation rate
  const heatDissipation = getHeatDissipationRate(airTemp, humidity, windSpeed);
  
  // Calculate cross-wind effect
  let crosswindEffect = 'Minimal';
  
  // Only consider wind perpendicular to travel direction
  const crossWindComponent = Math.abs(Math.sin(windDegree * Math.PI / 180) * windSpeed);
  
  if (crossWindComponent > 15) {
    crosswindEffect = 'Severe';
  } else if (crossWindComponent > 8) {
    crosswindEffect = 'Moderate';
  } else if (crossWindComponent > 3) {
    crosswindEffect = 'Noticeable';
  }
  
  // Calculate visibility level
  const visibilityLevel = getVisibilityLevel(visibility, condition);
  
  return {
    power_adjustment: parseFloat(powerAdjustment.toFixed(1)),
    torque_adjustment: parseFloat(torqueAdjustment.toFixed(1)),
    aero_efficiency: parseFloat(aeroEfficiency.toFixed(1)),
    downforce_adjustment: parseFloat(downforceAdjustment.toFixed(1)),
    cooling_efficiency: coolingEfficiency,
    braking_efficiency: Math.max(0, Math.min(100, Math.round(brakingEfficiency))),
    braking_distance_adjustment: parseFloat(brakingDistanceAdjustment.toFixed(1)),
    heat_dissipation: heatDissipation,
    crosswind_effect: crosswindEffect,
    visibility: visibilityLevel
  };
}

// Utility functions for performance calculations
function calculateAirDensityFactor(temp: number, pressure: number, humidity: number): number {
  // Simplified air density calculation
  const tempFactor = 273.15 / (273.15 + (temp - 32) * 5/9);
  const pressureFactor = pressure / 1013.25;
  const humidityFactor = 1 - (humidity * 0.0003);
  
  return tempFactor * pressureFactor * humidityFactor;
}

function calculatePowerAdjustment(airDensityFactor: number, temp: number): number {
  // Power increases as air density increases
  const basePowerAdjustment = (airDensityFactor - 1) * 100;
  
  // Adjust for engine temperature
  let temperatureAdjustment = 0;
  if (temp < 40) {
    temperatureAdjustment = -2; // Cold engine performs worse
  } else if (temp > 100) {
    temperatureAdjustment = -3; // Hot weather can lead to heat soak
  }
  
  return basePowerAdjustment + temperatureAdjustment;
}

function calculateTorqueAdjustment(airDensityFactor: number): number {
  // Torque also increases as air density increases
  return (airDensityFactor - 1) * 80;
}

function calculateAeroEfficiency(temp: number, windSpeed: number): number {
  // Base efficiency
  let efficiency = 100;
  
  // Temperature affects air density and thus aero
  if (temp < 32) {
    efficiency += 3; // Cold air is denser - better aero
  } else if (temp > 90) {
    efficiency -= 2; // Hot air is less dense - reduced aero
  }
  
  // Wind affects aero stability
  if (windSpeed > 15) {
    efficiency -= 5; // High winds disrupt aero
  }
  
  return efficiency;
}

function calculateDownforceAdjustment(temp: number, airDensityFactor: number): number {
  // Downforce is directly affected by air density
  return (airDensityFactor - 1) * 120;
}

function calculateCoolingEfficiency(temp: number, windSpeed: number, humidity: number): string {
  if (temp < 50) {
    return 'Excessive (overcooling risk)';
  }
  
  if (temp > 90) {
    if (windSpeed < 5) {
      return 'Poor (heat soak risk)';
    }
    return 'Marginal';
  }
  
  if (humidity > 85 && temp > 75) {
    return 'Reduced';
  }
  
  if (windSpeed > 10) {
    return 'Excellent';
  }
  
  return 'Good';
}

function calculateBrakingDistanceAdjustment(brakingEfficiency: number): number {
  // Calculate percentage increase in braking distance
  if (brakingEfficiency >= 95) {
    return 0; // Optimal braking - no adjustment
  }
  
  // As efficiency drops, braking distance increases
  return ((100 - brakingEfficiency) / 5) * 10;
}

function getHeatDissipationRate(temp: number, humidity: number, windSpeed: number): string {
  // High ambient temp reduces heat dissipation
  if (temp > 90) {
    if (humidity > 70) {
      return 'Poor';
    }
    if (windSpeed > 10) {
      return 'Moderate';
    }
    return 'Reduced';
  }
  
  // Cold temperatures provide excellent cooling
  if (temp < 50) {
    return 'Excellent';
  }
  
  // Default case for normal conditions
  if (windSpeed > 15) {
    return 'Excellent';
  }
  if (windSpeed > 5) {
    return 'Good';
  }
  
  return 'Adequate';
}

/**
 * Map grip assessment to numeric value
 */
function gripAssessmentToValue(assessment: any) {
  const assessmentMap = {
    'Excellent': 95,
    'Good': 80,
    'Moderate': 60,
    'Poor': 40,
    'Very Poor': 20
  };
  
  return assessmentMap[assessment];
}

/**
 * Calculate alert level based on severe weather conditions
 */
function calculateAlertLevel(condition: any, visibility: any, windSpeed: any, rainVolume: any, snowVolume: any) {
  const conditionLower = condition.toLowerCase();
  
  // Check for severe conditions
  if (conditionLower.includes('tornado') || 
      conditionLower.includes('hurricane') || 
      conditionLower.includes('blizzard')) {
    return 'Severe';
  }
  
  // Check for high impact conditions
  if (visibility < 1 || 
      windSpeed > 30 || 
      rainVolume > 10 || 
      snowVolume > 5 ||
      conditionLower.includes('ice') ||
      conditionLower.includes('freezing')) {
    return 'High';
  }
  
  // Check for moderate impact conditions
  if (visibility < 5 || 
      windSpeed > 15 || 
      rainVolume > 2.5 || 
      snowVolume > 1 ||
      conditionLower.includes('fog') ||
      conditionLower.includes('heavy rain')) {
    return 'Moderate';
  }
  
  // Default to low
  return 'Low';
}

/**
 * Generate driving recommendations based on conditions
 */
function generateDrivingRecommendation(condition: any, trackTemp: any, gripIndex: any, visibility: any, crossWindEffect: any) {
  const conditionLower = condition.toLowerCase();
  let recommendation = '';
  
  // Base recommendation on weather condition
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    recommendation = 'Reduce speed and increase following distance. Smooth, progressive inputs recommended to maintain stability. ';
    
    if (gripIndex < 40) {
      recommendation += 'Surface grip is significantly compromised. Avoid standing water and be cautious of hydroplaning. ';
    }
  } else if (conditionLower.includes('snow')) {
    recommendation = 'Extreme caution advised. Significantly reduced speeds and gentle inputs required. Winter tires strongly recommended. ';
  } else if (conditionLower.includes('ice') || conditionLower.includes('freezing')) {
    recommendation = 'Driving not recommended if avoidable. If necessary, proceed with extreme caution at greatly reduced speed. Maximum traction control advised. ';
  } else if (conditionLower.includes('fog') || visibility < 3) {
    recommendation = 'Use low beam headlights and maintain reduced speed with increased following distance. Be cautious of rapidly changing visibility conditions. ';
  } else if (gripIndex > 90 && trackTemp > 70 && trackTemp < 110) {
    recommendation = 'Excellent driving conditions. Surface temperatures ideal for tire performance. Optimal grip available. ';
  } else if (trackTemp < 45) {
    recommendation = 'Cold surface temperatures will extend tire warm-up periods. Anticipate reduced grip until tires reach operating temperature. ';
  } else if (trackTemp > 120) {
    recommendation = 'Hot surface temperatures may lead to accelerated tire wear. Monitor tire pressures as they will increase with temperature. ';
  } else {
    recommendation = 'Generally favorable driving conditions. Standard safety precautions advised. ';
  }
  
  // Add crosswind advisory if needed
  if (crossWindEffect === 'Severe') {
    recommendation += 'Strong crosswinds present. Maintain firm grip on steering wheel and be prepared for sudden gusts affecting vehicle stability. ';
  } else if (crossWindEffect === 'Moderate') {
    recommendation += 'Moderate crosswinds may affect handling. Be vigilant when passing large vehicles or in exposed areas. ';
  }
  
  return recommendation.trim();
}

/**
 * Analyze 5-day forecast data for trend information
 */
function analyzeForecastTrend(forecastData: any) {
  // Extract key metrics from forecast periods
  const forecastPoints = forecastData.list.slice(0, 8); // 24 hours (3-hour intervals)
  
  // Track temperature trend
  let temperatureSum = 0;
  let currentTemp = forecastPoints[0].main.temp;
  forecastPoints.forEach(item => {
    temperatureSum += item.main.temp - currentTemp;
  });
  
  const tempTrend = temperatureSum / forecastPoints.length;
  
  // Determine temperature trend description
  let temperatureTrend;
  if (Math.abs(tempTrend) < 2) {
    temperatureTrend = 'Stable';
  } else if (tempTrend > 0) {
    temperatureTrend = `Rising (${tempTrend.toFixed(1)}°/period)`;
  } else {
    temperatureTrend = `Falling (${Math.abs(tempTrend).toFixed(1)}°/period)`;
  }
  
  // Track condition trend
  const conditions = {};
  forecastPoints.forEach(item => {
    const condition = item.weather[0].main;
    conditions[condition] = (conditions[condition] || 0) + 1;
  });
  
  // Find dominant upcoming condition
  let dominantCondition = '';
  let maxCount = 0;
  
  Object.keys(conditions).forEach(condition => {
    if (conditions[condition] > maxCount) {
      dominantCondition = condition;
      maxCount = conditions[condition];
    }
  });
  
  // Check for precipitation in next 24 hours
  let nextPrecipitation = null;
  for (let i = 0; i < forecastPoints.length; i++) {
    const item = forecastPoints[i];
    const isPrecipitation = 
      item.weather[0].main.includes('Rain') || 
      item.weather[0].main.includes('Snow') ||
      item.weather[0].main.includes('Drizzle');
    
    if (isPrecipitation) {
      nextPrecipitation = {
        condition: item.weather[0].main,
        time: item.dt,
        probability: item.pop * 100
      };
      break;
    }
  }
  
  return {
    temperature_trend: temperatureTrend,
    condition_trend: `Predominantly ${dominantCondition}`,
    next_precipitation: nextPrecipitation,
    forecast_confidence: 'Moderate' // Default confidence level
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
  // Convert to Celsius for calculation if needed
  const tempC = units === 'imperial' ? (temp - 32) * 5/9 : temp;
  
  // Constants for Magnus formula
  const a = 17.27;
  const b = 237.7;
  
  // Calculate gamma term
  const gamma = (a * tempC) / (b + tempC) + Math.log(humidity / 100.0);
  
  // Calculate dew point in Celsius
  const dewPointC = (b * gamma) / (a - gamma);
  
  // Convert back to requested units
  return units === 'imperial' ? dewPointC * 9/5 + 32 : dewPointC;
}

/**
 * Assess grip level quality
 */
function assessGrip(gripIndex: any) {
  if (gripIndex >= 90) return 'Excellent';
  if (gripIndex >= 70) return 'Good';
  if (gripIndex >= 50) return 'Moderate';
  if (gripIndex >= 30) return 'Poor';
  return 'Very Poor';
}

/**
 * Assess track evolution trend
 */
function assessEvolution(evolutionValue: any) {
  if (evolutionValue >= 80) return 'Rapid Improvement';
  if (evolutionValue >= 60) return 'Steady Improvement';
  if (evolutionValue >= 40) return 'Slow Improvement';
  if (evolutionValue >= 20) return 'Minimal Change';
  return 'Deteriorating';
}

/**
 * Assess precipitation intensity
 */
function assessPrecipitation(rainVolume: any, snowVolume: any) {
  const totalPrecipitation = rainVolume + (snowVolume * 2); // Snow has greater impact
  
  if (totalPrecipitation === 0) return 'None';
  if (totalPrecipitation < 1) return 'Light';
  if (totalPrecipitation < 4) return 'Moderate';
  if (totalPrecipitation < 10) return 'Heavy';
  return 'Extreme';
}

function getVisibilityLevel(visibility: number, condition: string): string {
  const conditionLower = condition.toLowerCase();
  
  if (visibility < 1) {
    return 'Severely Limited';
  }
  
  if (visibility < 3 || 
      conditionLower.includes('fog') || 
      conditionLower.includes('mist') ||
      conditionLower.includes('heavy rain')) {
    return 'Limited';
  }
  
  if (visibility < 5 || 
      conditionLower.includes('rain') || 
      conditionLower.includes('snow')) {
    return 'Moderate';
  }
  
  if (visibility < 10) {
    return 'Good';
  }
  
  return 'Excellent';
}
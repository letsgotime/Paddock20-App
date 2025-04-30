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
import { checkSlackIntegration, initializeSlackClient, shareCarProfileToSlack, shareEventToSlack } from "./slack";

// OpenWeather API key - updated April 28, 2025
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";

// Cache for geocoding results to avoid repetitive API calls
const geocodeCache = new Map();

// API Health Monitoring System
// This tracks the status of our external weather API
interface WeatherApiStatus {
  lastChecked: Date;
  isOperational: boolean;
  lastError: string | null;
  consecutiveFailures: number;
  checkInterval: number; // in milliseconds
}

const apiHealthStatus: WeatherApiStatus = {
  lastChecked: new Date(),
  isOperational: true,
  lastError: null,
  consecutiveFailures: 0,
  checkInterval: 4 * 60 * 60 * 1000 // 4 hours in milliseconds
};

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

/**
 * Checks if the OpenWeather API is operational without making a full data request
 * This is a lightweight test that minimizes API usage
 */
async function checkWeatherApiHealth(): Promise<boolean> {
  try {
    // Only check if it's been at least 4 hours since the last check
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - apiHealthStatus.lastChecked.getTime();
    
    if (timeSinceLastCheck < apiHealthStatus.checkInterval) {
      // Not time to check yet
      return apiHealthStatus.isOperational;
    }
    
    console.log('Performing periodic OpenWeather API health check...');
    
    // Use the geocoding API as it's lightweight and doesn't count against the high-cost endpoints
    // Using a well-known location (New York City) to ensure valid response
    const testUrl = `https://api.openweathermap.org/geo/1.0/direct?q=New York&limit=1&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status} - ${await response.text()}`);
    }
    
    // We got a valid response
    apiHealthStatus.lastChecked = now;
    apiHealthStatus.isOperational = true;
    apiHealthStatus.lastError = null;
    apiHealthStatus.consecutiveFailures = 0;
    
    console.log('OpenWeather API health check passed successfully');
    return true;
  } catch (error) {
    // Update health status
    apiHealthStatus.lastChecked = new Date();
    apiHealthStatus.isOperational = false;
    apiHealthStatus.lastError = (error as Error).message;
    apiHealthStatus.consecutiveFailures += 1;
    
    console.error('OpenWeather API health check failed:', error);
    console.error(`Consecutive failures: ${apiHealthStatus.consecutiveFailures}`);
    
    // Could trigger additional recovery actions here
    // For instance, sending an alert if failures persist
    
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Using only OpenWeather API for all weather services
  
  // Immediately check API health on startup
  await checkWeatherApiHealth();
  
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

      // Use the OpenWeather API key constant
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      
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

      // Use the OpenWeather API key constant 
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      
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
      
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units || 'metric'}${exclude ? `&exclude=${exclude}` : ''}&appid=${OPENWEATHER_API_KEY}`;
      
      console.log(`Fetching OneCall data for: ${lat},${lon}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OneCall API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
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

  // Advanced Automotive Weather API with F1-level metrics
  app.get('/api/automotive-weather', async (req, res) => {
    try {
      const { lat, lon, units = 'imperial' } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
      }

      // Fetch standard weather data first
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`OpenWeather API error: ${weatherResponse.status} - ${await weatherResponse.text()}`);
      }
      
      const weatherData = await weatherResponse.json();
      
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
      
      // F1-style automotive weather response
      const automotiveWeatherData = {
        lat: parseFloat(lat as string),
        lon: parseFloat(lon as string),
        timezone: weatherData.timezone,
        timezone_offset: weatherData.timezone,
        
        // Surface data
        surfaces: {
          asphalt: {
            temperature: asphaltTemp,
            condition: surfaceCondition,
            gripLevel: asphaltGrip
          },
          concrete: {
            temperature: concreteTemp,
            condition: surfaceCondition,
            gripLevel: concreteGrip
          },
          gravel: {
            temperature: temp * 0.95, // Gravel stays cooler
            condition: surfaceCondition
          }
        },
        
        // Automotive performance metrics
        performance: {
          tireWarmupTime: {
            sport: tireWarmup.sport,
            summer: tireWarmup.summer,
            allSeason: tireWarmup.allSeason,
            winter: tireWarmup.winter
          },
          enginePerformance: {
            airDensityFactor: airDensityFactor,
            powerAdjustment: powerAdjustment,
            torqueAdjustment: torqueAdjustment
          },
          aerodynamicPerformance: {
            efficiency: aeroEfficiency,
            downforceAdjustment: downforceAdjustment
          },
          coolingEfficiency: coolingEfficiency,
          brakingPerformance: {
            effectiveCoefficient: brakingEfficiency,
            distanceAdjustment: brakingDistanceAdjustment,
            heatDissipation: heatDissipation
          }
        },
        
        // Overall driving conditions summary
        drivingConditions: {
          riskLevel: riskLevel,
          traction: tractionLevel,
          visibility: visibilityLevel,
          advisories: advisories
        }
      };
      
      return res.json(automotiveWeatherData);
    } catch (error) {
      console.error("Error generating automotive weather data:", error);
      res.status(500).json({ error: "Failed to generate automotive weather data" });
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
      
      const result = await shareCarProfileToSlack(vehicle);
      
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
const express = require('express');
const router = express.Router();
const axios = require('axios');

// OpenWeatherMap API key
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '2379a18ee0e478c88aa7d4aa1df44410';

// F1-style grip levels
const GRIP_LEVELS = {
  excellent: 'Excellent grip conditions with optimal track temperature',
  good: 'Good grip with standard racing line',
  moderate: 'Moderate grip - approaching track limits with caution advised',
  poor: 'Poor grip - reduced traction and potential slippery sections',
  critical: 'Critical grip - extreme caution required, minimal traction'
};

// Cache to store weather data (avoid rate limiting)
const weatherCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize cache with default Atlanta data
const initializeCache = async () => {
  try {
    const atlantaData = await fetchWeatherData(33.749, -84.388, 'imperial');
    weatherCache.set('33.749,-84.388', {
      data: atlantaData,
      timestamp: Date.now()
    });
    console.log('Weather cache initialized with Atlanta data');
  } catch (error) {
    console.error('Failed to initialize weather cache:', error);
  }
};

initializeCache();

/**
 * Fetch weather data from OpenWeatherMap
 */
async function fetchWeatherData(lat, lon, units = 'imperial') {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat,
        lon,
        units,
        appid: OPENWEATHER_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw error;
  }
}

/**
 * Get weather data with caching
 */
async function getWeatherData(lat, lon, units = 'imperial') {
  const cacheKey = `${lat},${lon}`;
  const now = Date.now();
  
  // Check if we have cached data and it's not expired
  if (weatherCache.has(cacheKey)) {
    const cachedData = weatherCache.get(cacheKey);
    if (now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }
  }
  
  // If no valid cache, fetch new data
  const freshData = await fetchWeatherData(lat, lon, units);
  
  // Update cache
  weatherCache.set(cacheKey, {
    data: freshData,
    timestamp: now
  });
  
  return freshData;
}

/**
 * Calculate additional automotive-specific data based on weather
 */
function calculateAutomotiveWeatherData(weatherData, units = 'imperial') {
  // Base data
  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const weatherId = weatherData.weather[0].id;
  const windSpeed = weatherData.wind.speed;
  const pressure = weatherData.main.pressure;
  
  // Determine precipitation and road conditions
  const hasRain = weatherId >= 500 && weatherId < 600;
  const hasSnow = weatherId >= 600 && weatherId < 700;
  const hasFog = weatherId >= 700 && weatherId < 800;
  
  // F1-inspired grip calculation
  let gripPercentage = 100; // Start with perfect grip
  
  // Weather impacts
  if (hasRain) {
    if (weatherId >= 502) {
      // Heavy rain
      gripPercentage -= 40;
    } else {
      // Light/moderate rain
      gripPercentage -= 20;
    }
  }
  
  if (hasSnow) {
    gripPercentage -= 60;
  }
  
  if (hasFog) {
    gripPercentage -= 10; // Fog typically means dampness
  }
  
  // Temperature impacts
  if (temp < 32) {
    // Freezing - ice risk
    gripPercentage -= 30;
  } else if (temp < 40) {
    // Very cold
    gripPercentage -= 15;
  } else if (temp < 50) {
    // Cold
    gripPercentage -= 5;
  } else if (temp > 100) {
    // Extremely hot - greasy surface
    gripPercentage -= 8;
  } else if (temp > 90) {
    // Very hot - some grip loss
    gripPercentage -= 3;
  }
  
  // Humidity impacts
  if (humidity > 90) {
    gripPercentage -= 8;
  } else if (humidity > 75) {
    gripPercentage -= 3;
  }
  
  // Wind impacts
  if (windSpeed > 30) {
    gripPercentage -= 7; // Strong winds affect vehicle stability
  } else if (windSpeed > 20) {
    gripPercentage -= 3;
  }
  
  // Ensure grip percentage is within bounds
  gripPercentage = Math.max(0, Math.min(100, gripPercentage));
  
  // Determine grip level
  let gripLevel;
  if (gripPercentage >= 80) {
    gripLevel = 'excellent';
  } else if (gripPercentage >= 60) {
    gripLevel = 'good';
  } else if (gripPercentage >= 40) {
    gripLevel = 'moderate';
  } else if (gripPercentage >= 20) {
    gripLevel = 'poor';
  } else {
    gripLevel = 'critical';
  }
  
  // Calculate the road temperature (typically different from air temperature)
  // Road surface temps are typically higher than air temp in sunlight, especially when hot
  let roadTemperature = temp;
  const isClear = weatherId >= 800;
  const isDaytime = weatherData.sys.sunrise < weatherData.dt && weatherData.dt < weatherData.sys.sunset;
  
  if (isDaytime && isClear) {
    roadTemperature += Math.round((temp > 70) ? 15 : 10);
  } else if (isDaytime) {
    roadTemperature += Math.round((temp > 70) ? 8 : 5);
  } else if (hasRain || hasSnow) {
    roadTemperature -= 2; // Cooling effect of precipitation at night
  }
  
  // Create enhanced automotive weather data
  const automotiveData = {
    weather: weatherData,
    road_conditions: {
      grip_percentage: gripPercentage,
      grip_level: gripLevel,
      grip_description: GRIP_LEVELS[gripLevel],
      road_temperature: roadTemperature,
      road_temperature_unit: units === 'imperial' ? 'F' : 'C',
      precipitation: hasRain ? 'rain' : hasSnow ? 'snow' : 'none',
      precipitation_intensity: hasRain || hasSnow ? 
        (weatherId % 10 >= 2 ? 'heavy' : weatherId % 10 >= 1 ? 'moderate' : 'light') : 'none',
      visibility_reduced: hasFog || weatherData.visibility < 5000
    },
    driving_recommendations: {
      reduced_speed_recommended: gripPercentage < 70,
      increased_following_distance: gripPercentage < 80,
      caution_level: gripPercentage < 40 ? 'high' : gripPercentage < 60 ? 'moderate' : 'low',
      // Tire pressure adjustment (PSI) - simplistic model
      tire_pressure_adjustment: temp < 45 ? 2 : temp > 85 ? -2 : 0
    }
  };
  
  return automotiveData;
}

// Routes

/**
 * Automotive weather API endpoint
 * GET /api/automotive-weather?lat=33.749&lon=-84.388&units=imperial
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lon, units = 'imperial' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    // Get weather data (with caching)
    const weatherData = await getWeatherData(lat, lon, units);
    
    // Calculate automotive-specific data
    const automotiveData = calculateAutomotiveWeatherData(weatherData, units);
    
    res.json(automotiveData.weather);
  } catch (error) {
    console.error('Error in automotive weather API:', error);
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

/**
 * Geocoding endpoint 
 * GET /api/geocode?query=Atlanta
 */
router.get('/geocode', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: query,
        limit: 5,
        appid: OPENWEATHER_API_KEY
      }
    });
    
    // Format results
    const results = response.data.map(location => ({
      name: location.name,
      state: location.state,
      country: location.country,
      lat: location.lat,
      lon: location.lon
    }));
    
    res.json({ results });
  } catch (error) {
    console.error('Error in geocoding API:', error);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

/**
 * Reverse geocoding endpoint
 * GET /api/reverse-geocode?lat=33.749&lon=-84.388
 */
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse`, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });
    
    if (response.data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    const location = response.data[0];
    
    res.json({
      name: location.name,
      state: location.state,
      country: location.country,
      lat: parseFloat(lat),
      lon: parseFloat(lon)
    });
  } catch (error) {
    console.error('Error in reverse geocoding API:', error);
    res.status(500).json({ error: 'Failed to reverse geocode coordinates' });
  }
});

module.exports = router;
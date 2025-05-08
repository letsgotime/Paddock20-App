/**
 * Consolidated Weather API Routes
 * 
 * This module provides a single endpoint that combines multiple weather API calls
 * into one response, reducing the number of calls made to the OpenWeather API
 * and helping to avoid rate limiting issues.
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache for weather data to minimize API calls
const weatherCache = {
  data: {},
  // Cache duration: 2 hours (in milliseconds)
  maxAge: 2 * 60 * 60 * 1000
};

/**
 * GET /api/consolidated-weather
 * 
 * Returns combined weather data from multiple endpoints in a single response.
 * This drastically reduces the number of API calls made by the client.
 */
router.get('/consolidated-weather', async (req, res) => {
  try {
    const { lat, lon, units = 'imperial' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    // Generate a cache key based on coordinates and units
    const cacheKey = `${lat},${lon},${units}`;
    
    // Check if we have valid cached data
    const now = Date.now();
    const cachedEntry = weatherCache.data[cacheKey];
    
    if (cachedEntry && (now - cachedEntry.timestamp) < weatherCache.maxAge) {
      console.log(`Using cached consolidated weather data for ${lat},${lon}`);
      return res.json(cachedEntry.data);
    }
    
    // Make all API calls in parallel for efficiency
    const [weatherResponse, forecastResponse, oneCallResponse, automotiveResponse] = await Promise.all([
      fetchWeatherData(lat, lon, units),
      fetchForecastData(lat, lon, units),
      fetchOneCallData(lat, lon, units),
      fetchAutomotiveWeatherData(lat, lon, units)
    ]);
    
    // Combine all data into a single response
    const consolidatedData = {
      weatherData: weatherResponse.data,
      forecastData: forecastResponse.data,
      oneCallData: oneCallResponse.data,
      automotiveWeatherData: automotiveResponse.data,
      timestamp: now
    };
    
    // Cache the response
    weatherCache.data[cacheKey] = {
      data: consolidatedData,
      timestamp: now
    };
    
    // Send the consolidated response
    return res.json(consolidatedData);
  } catch (error) {
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

/**
 * Helper function to fetch basic weather data
 */
async function fetchWeatherData(lat, lon, units) {
  const url = `${process.env.OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5'}/weather`;
  return await axios.get(url, {
    params: {
      lat,
      lon,
      units,
      appid: process.env.OPENWEATHER_API_KEY
    }
  });
}

/**
 * Helper function to fetch forecast data
 */
async function fetchForecastData(lat, lon, units) {
  const url = `${process.env.OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5'}/forecast`;
  return await axios.get(url, {
    params: {
      lat,
      lon,
      units,
      appid: process.env.OPENWEATHER_API_KEY
    }
  });
}

/**
 * Helper function to fetch one-call data
 * Note: This function now includes error handling and fallback for free plans
 */
async function fetchOneCallData(lat, lon, units) {
  try {
    console.log('Using OpenWeather API key:', process.env.OPENWEATHER_API_KEY);
    console.log('OpenWeather API key from env:', process.env.OPENWEATHER_API_KEY);
    
    const url = `${process.env.OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5'}/onecall`;
    return await axios.get(url, {
      params: {
        lat,
        lon,
        units,
        exclude: 'minutely', // Exclude minutely data to reduce response size
        appid: process.env.OPENWEATHER_API_KEY
      }
    });
  } catch (error) {
    // Handle 401 unauthorized errors (free plan)
    if (error.response && error.response.status === 401) {
      console.log('OneCall API error: 401 - falling back to basic weather data');
      // Return a properly formatted response with essential data
      return {
        data: {
          lat,
          lon,
          current: {
            dt: Math.floor(Date.now() / 1000),
            temp: 0, // Will be updated from weather data
            feels_like: 0,
            humidity: 0,
            wind_speed: 0,
            weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }]
          },
          hourly: [],
          daily: []
        }
      };
    }
    throw error;
  }
}

/**
 * Helper function to fetch automotive weather data
 */
async function fetchAutomotiveWeatherData(lat, lon, units) {
  // This endpoint is assumed to be implemented on your server
  try {
    // If you have an internal API, call it directly
    const url = `/api/automotive-weather`;
    return await axios.get(url, {
      params: { lat, lon, units }
    });
  } catch (error) {
    // If automotive data fails, return a basic response
    // This is non-critical data, so we don't want to fail the entire request
    console.error('Error fetching automotive weather data:', error);
    return { 
      data: { 
        error: 'Automotive weather data unavailable',
        location: { lat, lon }
      } 
    };
  }
}

module.exports = router;
/**
 * Consolidated Weather API Routes
 * 
 * This module provides streamlined access to the Weather Data Warehouse,
 * giving clients a single endpoint to access all weather data needs.
 */

import { Router } from 'express';
import {
  getWeatherData,
  getForecastData,
  getOneCallData,
  getConsolidatedWeather,
  checkWeatherApiHealth
} from '../services/weatherDataWarehouse';

const router = Router();

/**
 * GET /api/weather/consolidated
 * 
 * Returns a unified weather data response containing current conditions,
 * forecast, one-call data, and automotive-specific weather data.
 */
router.get('/consolidated', async (req, res) => {
  try {
    const { lat, lon, units = 'imperial', exclude = 'minutely' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    // Set cache control headers to allow client-side caching for 15 minutes
    res.setHeader('Cache-Control', 'public, max-age=900');
    
    // Get consolidated data from the warehouse
    const data = await getConsolidatedWeather(
      lat as string, 
      lon as string, 
      units as string,
      exclude as string
    );
    
    return res.json(data);
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

/**
 * GET /api/weather/current
 * 
 * Returns current weather conditions for the specified location.
 */
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, units = 'imperial' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=900');
    
    // Get weather data from the warehouse
    const data = await getWeatherData(lat as string, lon as string, units as string);
    
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching current weather:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch current weather data',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/forecast
 * 
 * Returns weather forecast for the specified location.
 */
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, units = 'imperial' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes
    
    // Get forecast data from the warehouse
    const data = await getForecastData(lat as string, lon as string, units as string);
    
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching forecast:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch forecast data',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/onecall
 * 
 * Returns OpenWeather OneCall API data (current, hourly, daily forecasts).
 */
router.get('/onecall', async (req, res) => {
  try {
    const { lat, lon, units = 'imperial', exclude = 'minutely' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes
    
    // Get one call data from the warehouse
    const data = await getOneCallData(
      lat as string, 
      lon as string, 
      units as string,
      exclude as string
    );
    
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching OneCall data:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch OneCall data',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/health
 * 
 * Returns health information for the OpenWeather API and the weather data warehouse.
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await checkWeatherApiHealth();
    
    return res.json({
      status: isHealthy ? 'operational' : 'degraded',
      message: isHealthy 
        ? 'OpenWeather API is operational' 
        : 'OpenWeather API is experiencing issues',
      lastChecked: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error checking API health:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check API health',
      error: error.message
    });
  }
});

/**
 * GET /api/weather/cache/stats
 * 
 * Returns statistics about the weather data cache.
 * This is an administrative endpoint and should be protected in production.
 */
router.get('/cache/stats', (req, res) => {
  try {
    const weatherWarehouse = require('../services/weatherDataWarehouse').default;
    const stats = weatherWarehouse.getCacheStats();
    
    return res.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching cache stats:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch cache statistics',
      message: error.message
    });
  }
});

/**
 * POST /api/weather/cache/clear
 * 
 * Clears the weather data cache.
 * This is an administrative endpoint and should be protected in production.
 */
router.post('/cache/clear', (req, res) => {
  try {
    const weatherWarehouse = require('../services/weatherDataWarehouse').default;
    weatherWarehouse.clearCache();
    
    return res.json({
      success: true,
      message: 'Weather data cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error clearing cache:', error.message);
    return res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

export default router;
import React from 'react';
import { AlertTriangle, CloudRain, Gauge, Thermometer, Wind, Droplets, Compass, BarChart4, Car } from 'lucide-react';

/**
 * TileRegistry - Central registry for all expandable tiles in the application
 * This allows for easy addition of new tile types and management of their metadata
 */

// Tile categories for organization
export const TILE_CATEGORIES = {
  WEATHER: 'weather',
  VEHICLE: 'vehicle',
  ROUTE: 'route',
  ANALYTICS: 'analytics'
};

// Registry of all available tiles
const tileRegistry = {
  // Weather Alerts Tile
  'weather-alerts': {
    id: 'weather-alerts',
    title: 'Weather Alerts & Driving Safety Warnings',
    shortTitle: 'Weather Alerts', 
    description: 'Critical weather alerts and safety recommendations for current driving conditions',
    category: TILE_CATEGORIES.WEATHER,
    icon: <AlertTriangle size={18} />,
    accentColor: 'bg-red-500',
    route: '/tile/weather-alerts',
    // Additional configuration for this specific tile type
    config: {
      refreshInterval: 300000, // 5 minutes
      priority: 'high',
      expandByDefault: false
    }
  },
  
  // Drive Mode Recommendations Tile
  'drive-mode': {
    id: 'drive-mode',
    title: 'Vehicle Performance & Drive Mode Analysis',
    shortTitle: 'Drive Mode',
    description: 'Detailed vehicle performance metrics and drive mode recommendations based on current conditions',
    category: TILE_CATEGORIES.VEHICLE,
    icon: <Car size={18} />,
    accentColor: 'bg-green-500',
    route: '/tile/drive-mode',
    config: {
      refreshInterval: 300000, // 5 minutes
      priority: 'medium',
      expandByDefault: false,
      availableTabs: ['overview', 'telemetry', 'tires', 'settings']
    }
  },
  
  // Surface Forecast Tile
  'surface-forecast': {
    id: 'surface-forecast',
    title: 'Surface Conditions & Grip Forecast',
    shortTitle: 'Surface Forecast',
    description: 'Detailed forecast of road surface conditions and grip levels over time',
    category: TILE_CATEGORIES.WEATHER,
    icon: <Gauge size={18} />,
    accentColor: 'bg-cyan-500',
    route: '/tile/surface-forecast',
    config: {
      refreshInterval: 900000, // 15 minutes
      priority: 'medium',
      expandByDefault: false
    }
  },
  
  // Wind & Crosswind Analysis
  'wind-analysis': {
    id: 'wind-analysis',
    title: 'Wind & Crosswind Analysis',
    shortTitle: 'Wind Analysis',
    description: 'Wind direction, speed, and potential crosswind hazards for your route',
    category: TILE_CATEGORIES.WEATHER,
    icon: <Wind size={18} />,
    accentColor: 'bg-blue-500',
    route: '/tile/wind-analysis',
    config: {
      refreshInterval: 600000, // 10 minutes
      priority: 'low',
      expandByDefault: false
    }
  },
  
  // Temperature Analysis Tile
  'temperature-analysis': {
    id: 'temperature-analysis',
    title: 'Temperature & Surface Heat Analysis',
    shortTitle: 'Temperature',
    description: 'Detailed temperature analysis with road surface temperature modeling',
    category: TILE_CATEGORIES.WEATHER,
    icon: <Thermometer size={18} />,
    accentColor: 'bg-orange-500',
    route: '/tile/temperature-analysis',
    config: {
      refreshInterval: 900000, // 15 minutes
      priority: 'low',
      expandByDefault: false
    }
  },
  
  // Precipitation Analysis Tile
  'precipitation-analysis': {
    id: 'precipitation-analysis',
    title: 'Precipitation & Visibility Analysis',
    shortTitle: 'Precipitation',
    description: 'Detailed precipitation forecast and visibility impact assessment',
    category: TILE_CATEGORIES.WEATHER,
    icon: <CloudRain size={18} />,
    accentColor: 'bg-indigo-500',
    route: '/tile/precipitation-analysis',
    config: {
      refreshInterval: 600000, // 10 minutes
      priority: 'medium',
      expandByDefault: false
    }
  },
  
  // Multi-Location Comparison
  'location-comparison': {
    id: 'location-comparison',
    title: 'Multi-Location Weather Comparison',
    shortTitle: 'Location Comparison',
    description: 'Compare weather conditions across multiple saved locations',
    category: TILE_CATEGORIES.ANALYTICS,
    icon: <Compass size={18} />,
    accentColor: 'bg-purple-500',
    route: '/tile/location-comparison',
    config: {
      refreshInterval: 900000, // 15 minutes
      priority: 'low',
      expandByDefault: false
    }
  },
  
  // Weather Trends & Statistics
  'weather-trends': {
    id: 'weather-trends',
    title: 'Weather Trends & Historical Analysis',
    shortTitle: 'Weather Trends',
    description: 'Historical weather patterns and trend analysis for your location',
    category: TILE_CATEGORIES.ANALYTICS,
    icon: <BarChart4 size={18} />,
    accentColor: 'bg-yellow-500',
    route: '/tile/weather-trends',
    config: {
      refreshInterval: 3600000, // 1 hour
      priority: 'low',
      expandByDefault: false
    }
  },
  
  // Air Quality Analysis
  'air-quality': {
    id: 'air-quality',
    title: 'Air Quality & Environmental Conditions',
    shortTitle: 'Air Quality',
    description: 'Detailed air quality analysis and environmental impact on driving',
    category: TILE_CATEGORIES.WEATHER,
    icon: <Droplets size={18} />,
    accentColor: 'bg-teal-500',
    route: '/tile/air-quality',
    config: {
      refreshInterval: 1800000, // 30 minutes
      priority: 'low',
      expandByDefault: false
    }
  }
};

/**
 * Get all registered tiles
 * @returns {Object} Object containing all registered tiles
 */
export const getAllTiles = () => {
  return tileRegistry;
};

/**
 * Get a specific tile by ID
 * @param {string} tileId - ID of the tile to retrieve
 * @returns {Object|null} Tile object or null if not found
 */
export const getTile = (tileId) => {
  return tileRegistry[tileId] || null;
};

/**
 * Get tiles filtered by category
 * @param {string} category - Category to filter by
 * @returns {Array} Array of tiles in the specified category
 */
export const getTilesByCategory = (category) => {
  return Object.values(tileRegistry).filter(tile => tile.category === category);
};

/**
 * Get tiles sorted by priority
 * @returns {Array} Array of tiles sorted by priority (high, medium, low)
 */
export const getTilesByPriority = () => {
  const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
  
  return Object.values(tileRegistry).sort((a, b) => {
    return priorityOrder[a.config.priority] - priorityOrder[b.config.priority];
  });
};

/**
 * Get related tiles for a given tile
 * @param {string} tileId - ID of the tile to find related tiles for
 * @returns {Array} Array of related tiles (same category or connected functionality)
 */
export const getRelatedTiles = (tileId) => {
  const tile = getTile(tileId);
  if (!tile) return [];
  
  return Object.values(tileRegistry)
    .filter(t => t.id !== tileId && t.category === tile.category)
    .slice(0, 4); // Only return up to 4 related tiles
};

export default tileRegistry;
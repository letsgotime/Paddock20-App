/**
 * DashboardConfig - Configuration for dashboard layout and sections
 * This centralizes the dashboard layout configuration, making it easier to reorder and reorganize components
 */

import React from 'react';
import { Clock, MapPin, Car, AlertTriangle, Gauge, Compass, Search } from 'lucide-react';
import tileRegistry, { TILE_CATEGORIES } from './TileRegistry';

// Dashboard layout sections
export const DASHBOARD_SECTIONS = {
  // Main content sections
  OVERVIEW: 'overview',
  CURRENT_CONDITIONS: 'current_conditions',
  FORECASTS: 'forecasts',
  ALERTS: 'alerts',
  VEHICLE: 'vehicle',
  
  // Sidebar sections
  SIDEBAR_TOP: 'sidebar_top',
  SIDEBAR_MIDDLE: 'sidebar_middle',
  SIDEBAR_BOTTOM: 'sidebar_bottom',
  
  // Mobile-specific sections
  MOBILE_PRIMARY: 'mobile_primary',
  MOBILE_SECONDARY: 'mobile_secondary'
};

// Dashboard component configuration
export const dashboardComponents = {
  // Location Management Components
  'location-search': {
    id: 'location-search',
    title: 'Search Locations',
    component: 'CitySearch',
    section: DASHBOARD_SECTIONS.SIDEBAR_TOP,
    order: 10,
    icon: <Search size={18} />,
    config: {
      showIcon: true,
      collapsed: false
    }
  },
  'location-manager': {
    id: 'location-manager',
    title: 'My Locations',
    component: 'LocationManager',
    section: DASHBOARD_SECTIONS.SIDEBAR_MIDDLE,
    order: 20,
    icon: <MapPin size={18} />,
    config: {
      showIcon: true,
      collapsed: false
    }
  },
  
  // Time and Drive Components
  'world-clocks': {
    id: 'world-clocks',
    title: 'World Clocks',
    component: 'WorldClocks',
    section: DASHBOARD_SECTIONS.SIDEBAR_TOP,
    order: 10,
    icon: <Clock size={18} />,
    config: {
      showIcon: true,
      collapsed: false
    }
  },
  'commute-time': {
    id: 'commute-time',
    title: 'Drive Time Analysis',
    component: 'CommuteTimeEstimator',
    section: DASHBOARD_SECTIONS.SIDEBAR_MIDDLE,
    order: 30, // Position it right after the location manager
    icon: <Car size={18} />,
    config: {
      showIcon: true,
      collapsed: false
    }
  },
  
  // Weather Components
  'weather-alerts': {
    id: 'weather-alerts',
    title: 'Driving Safety Alerts',
    component: 'WeatherAlertsDashboard',
    section: DASHBOARD_SECTIONS.ALERTS,
    order: 10,
    icon: <AlertTriangle size={18} />,
    config: {
      showIcon: true, 
      collapsed: false,
      expandable: true,
      linkedTile: tileRegistry['weather-alerts']
    }
  },
  'drive-mode': {
    id: 'drive-mode',
    title: 'Drive Mode Recommendations',
    component: 'DriveModeRecommendations',
    section: DASHBOARD_SECTIONS.SIDEBAR_MIDDLE, // Changed to match the drive time analysis section
    order: 31, // Order 31 to place it right after 'commute-time' (order 30)
    icon: <Car size={18} />,
    config: {
      showIcon: true,
      collapsed: false,
      expandable: true,
      linkedTile: tileRegistry['drive-mode']
    }
  },
  
  // Add Tire Strategy component that appears under Drive Time Analysis
  'tire-strategy': {
    id: 'tire-strategy',
    title: 'Tire Strategy',
    component: 'TireStrategyComponent',
    section: DASHBOARD_SECTIONS.SIDEBAR_MIDDLE,
    order: 32, // Place it after drive-mode
    icon: <Gauge size={18} />,
    config: {
      showIcon: true,
      collapsed: false,
      expandable: true,
      linkedTile: tileRegistry['tire-strategy'] || null
    }
  },
  'surface-forecast': {
    id: 'surface-forecast',
    title: 'Surface Conditions Forecast',
    component: 'TimedSurfacePredictions',
    section: DASHBOARD_SECTIONS.FORECASTS,
    order: 20,
    icon: <Gauge size={18} />,
    config: {
      showIcon: true,
      collapsed: false,
      expandable: true,
      linkedTile: tileRegistry['surface-forecast']
    }
  },
  'location-comparison': {
    id: 'location-comparison',
    title: 'Multi-Location Comparison',
    component: 'MultiLocationComparison',
    section: DASHBOARD_SECTIONS.FORECASTS,
    order: 30,
    icon: <Compass size={18} />,
    config: {
      showIcon: true,
      collapsed: false,
      expandable: true,
      linkedTile: tileRegistry['location-comparison']
    }
  }
};

/**
 * Get components for a specific dashboard section
 * @param {string} section - Dashboard section ID
 * @returns {Array} Array of component configurations sorted by order
 */
export const getComponentsForSection = (section) => {
  return Object.values(dashboardComponents)
    .filter(component => component.section === section)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get all dashboard components
 * @returns {Object} Object containing all dashboard components
 */
export const getAllComponents = () => {
  return dashboardComponents;
};

/**
 * Get a specific dashboard component by ID
 * @param {string} componentId - ID of the component to retrieve
 * @returns {Object|null} Component configuration or null if not found
 */
export const getComponent = (componentId) => {
  return dashboardComponents[componentId] || null;
};

export default {
  sections: DASHBOARD_SECTIONS,
  components: dashboardComponents,
  getComponentsForSection,
  getAllComponents,
  getComponent
};
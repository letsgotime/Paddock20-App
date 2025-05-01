import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as ExternalAppService from '../services/ExternalAppService';
import * as DeepLinkOptimizer from '../services/DeepLinkOptimizer';
import { useWeather } from './WeatherContext';
import { useVehicles } from './VehicleContext';
import { useLocations } from './LocationContext';

// Create the navigation context
export const NavigationContext = createContext();

// Custom hook to use the navigation context
export const useNavigation = () => useContext(NavigationContext);

// Define navigation modes
export const NAVIGATION_MODES = {
  DRIVING: 'driving',
  WALKING: 'walking',
  TRANSIT: 'transit',
  CYCLING: 'bicycling'
};

// Define optimization levels
export const OPTIMIZATION_LEVELS = {
  NONE: 'none',
  BASIC: 'basic',
  WEATHER_AWARE: 'weather',
  ADVANCED: 'advanced'
};

// Navigation Provider component
export const NavigationProvider = ({ children }) => {
  // Get data from other contexts
  const weatherContext = useWeather();
  const vehicleContext = useVehicles();
  const locationContext = useLocations();
  
  // State for navigation preferences
  const [preferredApp, setPreferredAppState] = useState(() => {
    return localStorage.getItem('preferredNavigationApp') || ExternalAppService.getDefaultNavigationAppForPlatform();
  });
  
  const [navigationMode, setNavigationModeState] = useState(() => {
    return localStorage.getItem('navigationMode') || NAVIGATION_MODES.DRIVING;
  });
  
  const [optimizationLevel, setOptimizationLevelState] = useState(() => {
    return localStorage.getItem('navigationOptimizationLevel') || OPTIMIZATION_LEVELS.WEATHER_AWARE;
  });
  
  const [avoidOptions, setAvoidOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('navigationAvoidOptions');
      return saved ? JSON.parse(saved) : {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      };
    } catch (e) {
      return {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      };
    }
  });
  
  // Navigation history
  const [navigationHistory, setNavigationHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('navigationHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Current route plan
  const [currentRoute, setCurrentRoute] = useState(null);
  
  // Departure time
  const [departureTime, setDepartureTime] = useState(null); // null = now
  
  // Save to localStorage when preferences change
  
  // Preferred app
  const setPreferredApp = useCallback((app) => {
    setPreferredAppState(app);
    localStorage.setItem('preferredNavigationApp', app);
    ExternalAppService.setPreferredNavigationApp(app);
  }, []);
  
  // Navigation mode
  const setNavigationMode = useCallback((mode) => {
    setNavigationModeState(mode);
    localStorage.setItem('navigationMode', mode);
  }, []);
  
  // Optimization level
  const setOptimizationLevel = useCallback((level) => {
    setOptimizationLevelState(level);
    localStorage.setItem('navigationOptimizationLevel', level);
  }, []);
  
  // Update avoid options
  const updateAvoidOptions = useCallback((options) => {
    setAvoidOptions(prev => {
      const updated = { ...prev, ...options };
      localStorage.setItem('navigationAvoidOptions', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Add to navigation history
  const addToNavigationHistory = useCallback((route) => {
    setNavigationHistory(prev => {
      // Add timestamp if not present
      const routeWithTimestamp = {
        ...route,
        timestamp: route.timestamp || Date.now()
      };
      
      // Add to beginning of array, limit to 20 entries
      const updated = [routeWithTimestamp, ...prev].slice(0, 20);
      localStorage.setItem('navigationHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Clear navigation history
  const clearNavigationHistory = useCallback(() => {
    setNavigationHistory([]);
    localStorage.removeItem('navigationHistory');
  }, []);
  
  // Get available navigation apps
  const getAvailableNavigationApps = useCallback(() => {
    // This would typically check device capabilities
    // For now, we return all supported apps
    return [
      { id: 'google', name: 'Google Maps', icon: ExternalAppService.APP_ICONS.google },
      { id: 'apple', name: 'Apple Maps', icon: ExternalAppService.APP_ICONS.apple },
      { id: 'waze', name: 'Waze', icon: ExternalAppService.APP_ICONS.waze }
    ];
  }, []);
  
  // Open route in external navigation app
  const openExternalNavigation = useCallback((route, app = preferredApp) => {
    try {
      // Get current data
      const weatherData = weatherContext?.weatherData || null;
      const selectedVehicle = vehicleContext?.selectedVehicle || null;
      
      // Prepare route parameters
      const routeParams = {
        ...route,
        travelMode: navigationMode,
        avoidTolls: avoidOptions.avoidTolls,
        avoidHighways: avoidOptions.avoidHighways,
        avoidFerries: avoidOptions.avoidFerries,
        departureTime: departureTime || new Date()
      };
      
      // Determine if we should optimize
      const shouldOptimize = optimizationLevel !== OPTIMIZATION_LEVELS.NONE;
      
      // Set optimization options based on level
      const optimizationOptions = {
        prioritizeSafety: optimizationLevel === OPTIMIZATION_LEVELS.ADVANCED,
        avoidFloodRisks: optimizationLevel !== OPTIMIZATION_LEVELS.BASIC,
        avoidHighWindAreas: optimizationLevel === OPTIMIZATION_LEVELS.ADVANCED,
        includeRestStops: optimizationLevel === OPTIMIZATION_LEVELS.ADVANCED,
        accountForRushHour: optimizationLevel !== OPTIMIZATION_LEVELS.BASIC,
        addWeatherAlerts: optimizationLevel !== OPTIMIZATION_LEVELS.NONE,
        preferredApp: app
      };
      
      // Open optimized or regular navigation
      let success;
      
      if (shouldOptimize && weatherData) {
        success = DeepLinkOptimizer.openOptimizedNavigation(
          routeParams,
          weatherData,
          selectedVehicle,
          optimizationOptions
        );
      } else {
        success = ExternalAppService.openExternalNavigation(routeParams, app);
      }
      
      // Add to history if successful
      if (success) {
        addToNavigationHistory(route);
        
        // Update current route
        setCurrentRoute(route);
      }
      
      return success;
    } catch (error) {
      console.error('Error opening external navigation:', error);
      return false;
    }
  }, [
    preferredApp, weatherContext, vehicleContext, navigationMode, 
    avoidOptions, departureTime, optimizationLevel, addToNavigationHistory
  ]);
  
  // Generate shareable link
  const generateShareableLink = useCallback((route) => {
    try {
      // Get current data
      const weatherData = weatherContext?.weatherData || null;
      const selectedVehicle = vehicleContext?.selectedVehicle || null;
      
      // Prepare route parameters
      const routeParams = {
        ...route,
        travelMode: navigationMode,
        avoidTolls: avoidOptions.avoidTolls,
        avoidHighways: avoidOptions.avoidHighways,
        avoidFerries: avoidOptions.avoidFerries
      };
      
      // Determine if we should optimize
      const shouldOptimize = optimizationLevel !== OPTIMIZATION_LEVELS.NONE;
      
      // Generate shareable link
      let shareData;
      
      if (shouldOptimize && weatherData) {
        shareData = DeepLinkOptimizer.generateOptimizedShareableLink(
          routeParams,
          weatherData,
          selectedVehicle
        );
      } else {
        shareData = ExternalAppService.generateShareableMapLink(routeParams);
      }
      
      return shareData;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      return {
        text: 'Check out this route!',
        url: window.location.href
      };
    }
  }, [
    weatherContext, vehicleContext, navigationMode, 
    avoidOptions, optimizationLevel
  ]);
  
  // Get recommended departure windows
  const getRecommendedDepartureWindows = useCallback((route, lookAheadHours = 24) => {
    try {
      // Need weather data and hourly forecast
      if (!weatherContext?.weatherData || !weatherContext.weatherData.hourlyForecast) {
        return [];
      }
      
      return DeepLinkOptimizer.getRecommendedDepartureWindows(
        route,
        weatherContext.weatherData,
        lookAheadHours
      );
    } catch (error) {
      console.error('Error getting recommended departure windows:', error);
      return [];
    }
  }, [weatherContext]);
  
  // Get weather delay estimate
  const getWeatherDelayEstimate = useCallback((route) => {
    try {
      // Need weather data
      if (!weatherContext?.weatherData) {
        return 0;
      }
      
      return DeepLinkOptimizer.getWeatherDelayEstimate(
        route,
        weatherContext.weatherData
      );
    } catch (error) {
      console.error('Error getting weather delay estimate:', error);
      return 0;
    }
  }, [weatherContext]);
  
  // Plan route from one location to another
  const planRoute = useCallback((origin, destination, waypoints = []) => {
    try {
      // Create route object
      const route = {
        // Origin
        originLat: origin.coordinates?.lat,
        originLon: origin.coordinates?.lon,
        originName: origin.name,
        originId: origin.id,
        
        // Destination
        destLat: destination.coordinates?.lat,
        destLon: destination.coordinates?.lon,
        destName: destination.name,
        destId: destination.id,
        
        // Waypoints
        waypoints: waypoints.map(wp => ({
          lat: wp.coordinates?.lat,
          lon: wp.coordinates?.lon,
          name: wp.name,
          id: wp.id
        }))
      };
      
      // Set as current route
      setCurrentRoute(route);
      
      return route;
    } catch (error) {
      console.error('Error planning route:', error);
      return null;
    }
  }, []);
  
  // Context value
  const contextValue = {
    // Preferences
    preferredApp,
    setPreferredApp,
    navigationMode,
    setNavigationMode,
    optimizationLevel,
    setOptimizationLevel,
    avoidOptions,
    updateAvoidOptions,
    departureTime,
    setDepartureTime,
    
    // Routes
    currentRoute,
    setCurrentRoute,
    navigationHistory,
    addToNavigationHistory,
    clearNavigationHistory,
    
    // Actions
    openExternalNavigation,
    generateShareableLink,
    getRecommendedDepartureWindows,
    getWeatherDelayEstimate,
    planRoute,
    
    // Utilities
    getAvailableNavigationApps,
    NAVIGATION_MODES,
    OPTIMIZATION_LEVELS
  };
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;
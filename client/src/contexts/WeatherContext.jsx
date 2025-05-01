import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useUnits, UNIT_SYSTEMS } from './UnitsContext';
import { useLocations } from './LocationContext';

// Default location - Atlanta
const DEFAULT_LOCATION = { lat: 33.749, lon: -84.388 };

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Refs to prevent infinite loops
  const initialFetchDone = useRef(false);
  const fetchInProgress = useRef(false);
  
  // Get unit context
  const unitsContext = useUnits();
  const locationContext = useLocations();
  
  // Fetch weather data - memoized to avoid recreation on renders
  const fetchWeatherData = useCallback(async (lat = DEFAULT_LOCATION.lat, lon = DEFAULT_LOCATION.lon) => {
    // Prevent concurrent fetches
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping...");
      return weatherData;
    }
      
    fetchInProgress.current = true;
    
    try {
      console.log(`Fetching weather data for ${lat},${lon} in ${unitsContext.unitSystem}`);
      
      if (!refreshing) {
        setLoading(true);
      }
      
      const response = await fetch(`/api/automotive-weather?lat=${lat}&lon=${lon}&units=${unitsContext.unitSystem}`);
      
      if (response.status === 429) {
        throw new Error("Weather API rate limit exceeded. Using cached data.");
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Weather data received successfully");
      
      setWeatherData(data);
      setLastUpdated(new Date());
      setError(null);
      return data;
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err);
      
      // Keep existing data if we have it
      return weatherData;
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchInProgress.current = false;
    }
  // Removed weatherData from dependency array - it causes infinite loops
  }, [unitsContext.unitSystem, refreshing]);
  
  // Fetch for current location
  const fetchCurrentLocationWeather = useCallback(async () => {
    // Skip if a fetch is already in progress
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping geolocation request...");
      return weatherData;
    }
    
    try {
      if (navigator.geolocation) {
        setLoading(true);
        
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        console.log(`Got location: ${latitude}, ${longitude}`);
        
        return await fetchWeatherData(latitude, longitude);
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (err) {
      console.error("Error getting location:", err);
      
      // Fall back to default if we have no data yet
      if (!weatherData) {
        return await fetchWeatherData();
      }
      return weatherData;
    }
  }, [fetchWeatherData]);
  
  // Initial data fetch - only on mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchWeatherData();
      
      // Setup periodic refresh every 15 minutes
      const refreshInterval = setInterval(() => {
        console.log("Performing scheduled refresh");
        setRefreshing(true);
        
        if (weatherData?.location?.coordinates) {
          const { lat, lon } = weatherData.location.coordinates;
          fetchWeatherData(lat, lon).catch(console.error);
        } else {
          fetchWeatherData().catch(console.error);
        }
      }, 15 * 60 * 1000); // 15 minutes
      
      return () => clearInterval(refreshInterval);
    }
  }, []); // Empty dependency array = only run on mount
  
  // Refresh when units change - debounced to prevent rapid firing
  const unitsChangeTimeoutRef = useRef(null);
  
  useEffect(() => {
    // Make sure we have data and initial fetch is done
    if (!initialFetchDone.current || !weatherData?.location?.coordinates || loading) {
      return;
    }
    
    // Clear any existing timeout
    if (unitsChangeTimeoutRef.current) {
      clearTimeout(unitsChangeTimeoutRef.current);
    }
    
    // Set a new timeout to debounce the fetch
    unitsChangeTimeoutRef.current = setTimeout(() => {
      // Only fetch if we're not already fetching
      if (!fetchInProgress.current) {
        setRefreshing(true);
        const { lat, lon } = weatherData.location.coordinates;
        fetchWeatherData(lat, lon).catch(console.error);
      }
    }, 300); // Short debounce
    
    // Cleanup
    return () => {
      if (unitsChangeTimeoutRef.current) {
        clearTimeout(unitsChangeTimeoutRef.current);
      }
    };
  }, [unitsContext.unitSystem]);
  
  const getFormattedLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Format temperature with units
  const getFormattedTemperature = (temp) => {
    if (!temp && temp !== 0) return 'N/A';
    
    return unitsContext.formatTemperature(
      temp, 
      unitsContext.unitSystem === UNIT_SYSTEMS.IMPERIAL 
        ? unitsContext.TEMPERATURE_UNITS.FAHRENHEIT 
        : unitsContext.TEMPERATURE_UNITS.CELSIUS
    );
  };
  
  // Fetch for saved location
  const fetchLocationWeather = useCallback(async (locationId) => {
    // Skip if fetch is already in progress
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping saved location fetch...");
      return weatherData;
    }
    
    if (!locationContext) return weatherData;
    
    const location = locationContext.locations.find(
      loc => loc.id.toString() === locationId.toString()
    );
    
    if (location?.coordinates) {
      const { lat, lon } = location.coordinates;
      return await fetchWeatherData(lat, lon);
    }
    
    return weatherData;
  }, [fetchWeatherData, locationContext]);
  
  // State variables for city search already declared above
  
  // Context value
  const value = {
    weatherData,
    loading,
    error,
    lastUpdated,
    getFormattedLastUpdated,
    getFormattedTemperature,
    fetchWeatherData,
    fetchCurrentLocationWeather,
    fetchLocationWeather,
    showLocationPrompt,
    setShowLocationPrompt,
    citySearchOpen, 
    setCitySearchOpen,
    refreshing
  };
  
  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
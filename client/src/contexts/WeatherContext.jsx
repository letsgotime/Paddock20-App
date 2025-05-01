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
  
  // Cache the last requested coordinates to prevent redundant fetches
  const lastRequestRef = useRef({ lat: null, lon: null, timestamp: 0, units: null });
  
  // Minimum time between fetches for the same coordinates (5 minutes = 300000ms)
  const MIN_FETCH_INTERVAL = 300000;
  
  // Fetch weather data - memoized to avoid recreation on renders
  const fetchWeatherData = useCallback(async (lat = DEFAULT_LOCATION.lat, lon = DEFAULT_LOCATION.lon) => {
    // Prevent concurrent fetches
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping...");
      return weatherData;
    }
    
    // Check if this is a duplicate request within the throttle window
    const now = Date.now();
    const lastRequest = lastRequestRef.current;
    const isSameCoordinates = 
      lastRequest.lat === lat && 
      lastRequest.lon === lon &&
      lastRequest.units === unitsContext.unitSystem;
    const isWithinThrottleWindow = (now - lastRequest.timestamp) < MIN_FETCH_INTERVAL;
    
    if (isSameCoordinates && isWithinThrottleWindow && weatherData) {
      console.log(`Throttling fetch for ${lat},${lon} - last fetched ${Math.round((now - lastRequest.timestamp)/1000)}s ago`);
      return weatherData;
    }
      
    fetchInProgress.current = true;
    
    try {
      console.log(`Fetching weather data for ${lat},${lon} in ${unitsContext.unitSystem}`);
      
      if (!refreshing) {
        setLoading(true);
      }
      
      // Update the last request details before the fetch
      lastRequestRef.current = {
        lat,
        lon,
        units: unitsContext.unitSystem,
        timestamp: now
      };
      
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
      
      // Add a small delay before allowing new fetches to prevent rapid succession calls
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 500);
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
      console.log("Performing initial weather data fetch");
      initialFetchDone.current = true;
      
      // Initial fetch with artificial delay to prevent race conditions
      setTimeout(() => {
        if (!fetchInProgress.current) {
          fetchWeatherData().catch(console.error);
        }
      }, 100);
      
      // Setup periodic refresh every 15 minutes
      const refreshInterval = setInterval(() => {
        console.log("Performing scheduled refresh");
        
        // Only refresh if we're not already fetching
        if (!fetchInProgress.current) {
          setRefreshing(true);
          
          if (weatherData?.location?.coordinates) {
            const { lat, lon } = weatherData.location.coordinates;
            fetchWeatherData(lat, lon).catch(console.error);
          } else {
            fetchWeatherData().catch(console.error);
          }
        } else {
          console.log("Skipping scheduled refresh - fetch already in progress");
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
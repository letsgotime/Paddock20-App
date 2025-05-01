import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  
  // Get unit context
  const unitsContext = useUnits();
  const locationContext = useLocations();
  
  // Fetch weather data - memoized to avoid recreation on renders
  const fetchWeatherData = useCallback(async (lat = DEFAULT_LOCATION.lat, lon = DEFAULT_LOCATION.lon) => {
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
    }
  }, [unitsContext.unitSystem, refreshing, weatherData]);
  
  // Fetch for current location
  const fetchCurrentLocationWeather = useCallback(async () => {
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
      
      // Fall back to default
      return await fetchWeatherData();
    }
  }, [fetchWeatherData]);
  
  // Initial data fetch
  useEffect(() => {
    // On component mount, fetch data once
    if (!weatherData && !loading) {
      fetchWeatherData();
    }
    
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
  }, [fetchWeatherData, weatherData, loading]);
  
  // Refresh when units change
  useEffect(() => {
    if (weatherData?.location?.coordinates && !loading) {
      setRefreshing(true);
      const { lat, lon } = weatherData.location.coordinates;
      fetchWeatherData(lat, lon).catch(console.error);
    }
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
    if (!locationContext) return;
    
    const location = locationContext.locations.find(
      loc => loc.id.toString() === locationId.toString()
    );
    
    if (location?.coordinates) {
      const { lat, lon } = location.coordinates;
      return await fetchWeatherData(lat, lon);
    }
  }, [fetchWeatherData, locationContext]);
  
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
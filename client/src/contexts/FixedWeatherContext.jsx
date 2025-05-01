import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useUnits, UNIT_SYSTEMS } from './UnitsContext';

// Default location - Atlanta
const DEFAULT_LOCATION = { lat: 33.749, lon: -84.388 };

const FixedWeatherContext = createContext(null);

export function FixedWeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Refs to prevent infinite loops
  const initialFetchDone = useRef(false);
  const fetchInProgress = useRef(false);
  
  // Get unit context
  const unitsContext = useUnits();
  
  // Function to fetch weather data
  const fetchWeatherData = async (lat = DEFAULT_LOCATION.lat, lon = DEFAULT_LOCATION.lon) => {
    // Prevent concurrent fetches
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping...");
      return;
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
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchInProgress.current = false;
    }
  };
  
  // Function to get current location weather
  const fetchCurrentLocationWeather = async () => {
    try {
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchWeatherData(latitude, longitude);
              resolve();
            },
            (err) => {
              console.error("Geolocation error:", err);
              reject(err);
            }
          );
        });
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (err) {
      console.error("Error getting location:", err);
      
      // Fall back to default
      return await fetchWeatherData();
    }
  };
  
  // Initial data fetch - ONLY ONE TIME on component mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchWeatherData();
      
      // Setup refresh every 15 minutes
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
  }, []);
  
  // Refresh when units change - but only if we have data
  useEffect(() => {
    if (initialFetchDone.current && weatherData?.location?.coordinates) {
      setRefreshing(true);
      const { lat, lon } = weatherData.location.coordinates;
      fetchWeatherData(lat, lon).catch(console.error);
    }
  }, [unitsContext.unitSystem]);
  
  // Format time functions
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
    refreshing
  };
  
  return (
    <FixedWeatherContext.Provider value={value}>
      {children}
    </FixedWeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(FixedWeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a FixedWeatherProvider');
  }
  return context;
}
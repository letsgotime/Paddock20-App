import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation } from '../hooks/useLocation';
import { useUnits } from '../hooks/useUnits';

// Default Atlanta coordinates
const DEFAULT_COORDINATES = {
  lat: 33.749,
  lon: -84.388
};

export const WeatherContext = createContext();

/**
 * WeatherProvider - Context provider for weather data
 */
const WeatherProvider = ({ children }) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { activeLocationData } = useLocation();
  const { units } = useUnits();

  // Fetch weather data when location or units change
  useEffect(() => {
    if (activeLocationData) {
      fetchWeatherData(activeLocationData.lat, activeLocationData.lon, units);
    } else {
      console.log('No active location data');
      console.log('Performing initial weather data fetch');
      // Default to Atlanta if no location is active
      fetchWeatherData(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lon, units);
    }
  }, [activeLocationData, units]);

  // Fetch weather data for a location
  const fetchWeatherData = async (lat, lon, units = 'imperial') => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching weather data for ${lat},${lon} in ${units}`);

      const response = await axios.get('/api/automotive-weather', {
        params: { lat, lon, units }
      });

      console.log('Weather data received successfully');
      setCurrentWeather(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch weather data for a specific location (used by location manager)
  const fetchWeatherForLocation = async (location) => {
    try {
      console.log(`Fetching weather for ${location.name}`);
      const response = await axios.get('/api/automotive-weather', {
        params: { lat: location.lat, lon: location.lon, units }
      });
      
      return response.data;
    } catch (err) {
      console.error(`Error fetching weather for ${location.name}:`, err);
      return null;
    }
  };

  // The context value
  const contextValue = {
    currentWeather,
    forecastData,
    isLoading,
    error,
    fetchWeatherData,
    fetchWeatherForLocation,
    getDefaultWeather: () => fetchWeatherData(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lon, units)
  };

  return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  );
};

export default WeatherProvider;
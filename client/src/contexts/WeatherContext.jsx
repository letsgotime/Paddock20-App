import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useUnits } from '../hooks/useUnits';

// Create the Weather Context
export const WeatherContext = createContext();

// Sample cached weather data for Atlanta (the default location)
const DEFAULT_WEATHER = {
  coord: { lon: -84.3880, lat: 33.7490 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  main: {
    temp: 75,
    feels_like: 74,
    temp_min: 70,
    temp_max: 78,
    pressure: 1015,
    humidity: 60
  },
  visibility: 10000,
  wind: { speed: 5, deg: 220 },
  clouds: { all: 0 },
  dt: 1600000000,
  sys: {
    type: 1,
    id: 4548,
    country: 'US',
    sunrise: 1599989621,
    sunset: 1600034717
  },
  timezone: -14400,
  id: 4180439,
  name: 'Atlanta',
  cod: 200
};

// Provider component
export const WeatherProvider = ({ children }) => {
  const { activeLocationData, savedLocations } = useLocation();
  const { units } = useUnits();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationWeatherCache, setLocationWeatherCache] = useState({});
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  // Use coordsString for cache keys (e.g., "33.749,-84.388")
  const getCoordsString = useCallback((location) => {
    if (!location) return null;
    return `${location.lat},${location.lon}`;
  }, []);
  
  // Fetch weather data for given coordinates
  const fetchWeatherData = useCallback(async (location) => {
    if (!location || !location.lat || !location.lon) {
      console.error('Invalid location data for weather fetch', location);
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    const coordsString = getCoordsString(location);
    
    try {
      console.log(`Fetching weather data for ${coordsString} in ${units}`);
      
      // Check cache first (and if it's not too old)
      const cachedData = locationWeatherCache[coordsString];
      const now = new Date();
      
      if (cachedData && (now.getTime() - cachedData.timestamp) < 5 * 60 * 1000) {
        console.log('Using cached weather data');
        return cachedData.data;
      }
      
      // Fetch from API
      const response = await fetch(`/api/automotive-weather?lat=${location.lat}&lon=${location.lon}&units=${units}`);
      
      if (!response.ok) {
        throw new Error(`Error status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Weather data received successfully');
      
      // Update cache
      setLocationWeatherCache(prev => ({
        ...prev,
        [coordsString]: {
          data,
          timestamp: now.getTime()
        }
      }));
      
      setLastFetchTime(now);
      return data;
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [units, locationWeatherCache, getCoordsString]);
  
  // Load weather for active location 
  useEffect(() => {
    let isMounted = true;
    
    const loadWeatherForActiveLocation = async () => {
      if (!activeLocationData) {
        console.log('No active location data');
        setIsLoading(false);
        return;
      }
      
      console.log('Performing initial weather data fetch');
      // If a fetch is already in progress for this very same location (within 5 seconds),
      // avoid making multiple requests
      if (
        isLoading && 
        lastFetchTime && 
        (new Date().getTime() - lastFetchTime.getTime() < 5000)
      ) {
        console.log('Fetch already in progress, skipping...');
        return;
      }
      
      const weatherData = await fetchWeatherData(activeLocationData);
      
      if (isMounted && weatherData) {
        setCurrentWeather(weatherData);
      }
    };
    
    loadWeatherForActiveLocation();
    
    // Set up refresh interval (every 5 minutes)
    const interval = setInterval(() => {
      if (activeLocationData) {
        loadWeatherForActiveLocation();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeLocationData, fetchWeatherData, isLoading, lastFetchTime]);
  
  // Get cached weather for a specific location
  const getLocationWeather = useCallback((locationId) => {
    const location = savedLocations.find(loc => loc.id === locationId);
    if (!location) return null;
    
    const coordsString = getCoordsString(location);
    const cachedData = locationWeatherCache[coordsString];
    
    return cachedData?.data || null;
  }, [savedLocations, locationWeatherCache, getCoordsString]);
  
  // Refresh all saved locations' weather data
  const refreshAllLocations = useCallback(async () => {
    setIsLoading(true);
    
    const promises = savedLocations.map(location => fetchWeatherData(location));
    await Promise.all(promises);
    
    setIsLoading(false);
  }, [savedLocations, fetchWeatherData]);
  
  // The context value
  const contextValue = {
    currentWeather: currentWeather || DEFAULT_WEATHER,
    forecastData,
    weatherAlerts,
    isLoading,
    error,
    getLocationWeather,
    refreshAllLocations
  };
  
  return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  );
};

export default WeatherProvider;
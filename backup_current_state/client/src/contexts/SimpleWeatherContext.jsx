import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocations } from './LocationContext';
import { useUnits, UNIT_SYSTEMS } from './UnitsContext';

const WeatherContext = createContext();

export function SimpleWeatherProvider({ children }) {
  // Use null initial state to track first load
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default location is now Atlanta, GA
  const ATLANTA_COORDS = { lat: 33.7490, lon: -84.3880 };
  
  // Access location context for saved locations
  const locationContext = useLocations();
  
  // Access units context for unit preferences
  const unitsContext = useUnits();
  
  // Fetch weather data for a specific location
  const fetchWeatherData = async (lat = ATLANTA_COORDS.lat, lon = ATLANTA_COORDS.lon) => {
    console.log(`SimpleWeatherContext: Fetching weather data for ${lat},${lon} in ${unitsContext.unitSystem} units`);
    setLoading(true);
    
    // Create a timeout to ensure we always end loading state
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('SimpleWeatherContext: Loading timeout reached, forcing loading state to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    try {
      // Include units parameter in API request
      const response = await fetch(`/api/automotive-weather?lat=${lat}&lon=${lon}&units=${unitsContext.unitSystem}`);
      
      // Special handling for rate limit errors (429)
      if (response.status === 429) {
        const rateLimitError = new Error("Weather API rate limit exceeded, try again later");
        rateLimitError.status = 429;
        rateLimitError.isRateLimit = true;
        
        // Set a specific error message for the UI
        setError({
          message: "Weather API rate limit exceeded. Please try again later or select a different location.",
          status: 429,
          isRateLimit: true
        });
        
        // Don't attempt immediate retry for rate limit errors
        console.error('SimpleWeatherContext: API rate limit exceeded (429)');
        
        // If we've never loaded data before, open the city search dialog
        if (!weatherData && !citySearchOpen) {
          setCitySearchOpen(true);
        }
        
        throw rateLimitError;
      }
      else if (response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
        // Handle various server errors that might be related to rate limiting
        console.error(`SimpleWeatherContext: API error ${response.status} - ${response.statusText}`);
        
        const serverError = new Error(`Error fetching weather data: ${response.statusText}`);
        serverError.status = response.status;
        
        // Treat server errors as potential rate limiting
        if (!weatherData && !citySearchOpen) {
          setCitySearchOpen(true);
        }
        
        throw serverError;
      }
      else if (!response.ok) {
        console.error(`SimpleWeatherContext: API error ${response.status} - ${response.statusText}`);
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('SimpleWeatherContext: Weather data received successfully');
      
      // Validate that we have the expected data structure
      if (!data || !data.location || !data.currentConditions) {
        throw new Error('Invalid weather data structure received');
      }
      
      setWeatherData(data);
      setLastUpdated(new Date());
      setError(null);
      
      // If this is a saved location, add it to recent locations
      if (locationContext && lat && lon) {
        const location = locationContext.locations.find(
          loc => Math.abs(loc.coordinates.lat - lat) < 0.001 && 
                Math.abs(loc.coordinates.lon - lon) < 0.001
        );
        
        if (location) {
          locationContext.addToRecentLocations(location);
          setActiveLocation(location);
        } else {
          setActiveLocation({
            coordinates: { lat, lon },
            name: data.location?.name || 'Current Location'
          });
        }
      }
      
      clearTimeout(loadingTimeout);
      return data;
    } catch (err) {
      console.error('SimpleWeatherContext: Error fetching weather data:', err);
      
      // Only set generic error if it's not already a rate limit error
      if (!err.isRateLimit) {
        setError(err);
      }
      
      // On first load, retry once after a short delay
      // But only if it's not a rate limit error (429)
      if (!weatherData && (!err.status || err.status !== 429)) {
        console.log('SimpleWeatherContext: First load failed, scheduling retry');
        setTimeout(() => {
          console.log('SimpleWeatherContext: Retrying weather data fetch after initial error');
          fetch(`/api/automotive-weather?lat=${lat}&lon=${lon}&units=${unitsContext.unitSystem}`)
            .then(res => {
              if (res.status === 429) {
                throw { 
                  message: "Weather API rate limit exceeded. Please try again later.",
                  status: 429,
                  isRateLimit: true 
                };
              }
              if (!res.ok) throw new Error(`Retry API error: ${res.status}`);
              return res.json();
            })
            .then(data => {
              console.log('SimpleWeatherContext: Retry successful, setting weather data');
              setWeatherData(data);
              setLastUpdated(new Date());
              setError(null);
            })
            .catch(retryErr => {
              console.error('SimpleWeatherContext: Weather data retry failed:', retryErr);
              
              // If retry failed with rate limit, show location dialog
              if (retryErr.status === 429 && !citySearchOpen) {
                setCitySearchOpen(true);
              }
            })
            .finally(() => setLoading(false));
        }, 5000); // Longer retry delay to avoid rate limits
      }
      
      throw err;
    } finally {
      clearTimeout(loadingTimeout);
      setLoading(false);
    }
  };
  
  // Fetch weather for current location
  const fetchCurrentLocationWeather = async () => {
    try {
      console.log('SimpleWeatherContext: Attempting to get current location');
      if (navigator.geolocation) {
        setLoading(true);
        
        // Get current position
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        console.log(`SimpleWeatherContext: Got current location: ${latitude}, ${longitude}`);
        
        // Fetch weather for current location
        return await fetchWeatherData(latitude, longitude);
      } else {
        throw new Error('Geolocation is not supported by this browser');
      }
    } catch (err) {
      console.error('SimpleWeatherContext: Error fetching current location weather:', err);
      // Fall back to default location
      return await fetchWeatherData();
    }
  };
  
  // Fetch weather for a saved location
  const fetchLocationWeather = async (locationId) => {
    if (!locationContext) {
      console.error('SimpleWeatherContext: Location context not available');
      return null;
    }
    
    const location = locationContext.locations.find(loc => loc.id.toString() === locationId.toString());
    
    if (location && location.coordinates) {
      console.log(`SimpleWeatherContext: Fetching weather for saved location: ${location.name}`);
      setActiveLocation(location);
      return await fetchWeatherData(location.coordinates.lat, location.coordinates.lon);
    } else {
      console.error('SimpleWeatherContext: Location not found:', locationId);
      return null;
    }
  };
  
  // Refetch data when unit preferences change
  useEffect(() => {
    if (weatherData && activeLocation) {
      console.log('SimpleWeatherContext: Units changed, refetching weather data');
      const { lat, lon } = activeLocation.coordinates || weatherData.location.coordinates;
      fetchWeatherData(lat, lon)
        .catch(err => {
          console.error('SimpleWeatherContext: Unit change refetch failed:', err);
        });
    }
  }, [unitsContext.unitSystem]);
  
  // Fetch weather data on mount - use default location
  useEffect(() => {
    console.log('SimpleWeatherContext: Initial weather data fetch');
    
    // Only fetch on initial mount if we don't have data yet
    if (!weatherData) {
      fetchWeatherData()
        .catch(err => {
          console.error('SimpleWeatherContext: Initial weather fetch failed:', err);
        });
    }
    
    // Set up auto-refresh interval (every 15 minutes)
    const refreshInterval = setInterval(() => {
      console.log('SimpleWeatherContext: Performing scheduled refresh');
      if (weatherData && weatherData.location && weatherData.location.coordinates) {
        const { lat, lon } = weatherData.location.coordinates;
        fetchWeatherData(lat, lon)
          .catch(err => {
            console.error('SimpleWeatherContext: Weather refresh failed:', err);
          });
      } else {
        fetchWeatherData()
          .catch(err => {
            console.error('SimpleWeatherContext: Default weather refresh failed:', err);
          });
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => {
      console.log('SimpleWeatherContext: Clearing refresh interval');
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Format time for last updated
  const getFormattedLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get formatted temperature
  const getFormattedTemperature = (temp) => {
    if (!temp && temp !== 0) return 'N/A';
    
    return unitsContext.formatTemperature(
      temp, 
      unitsContext.unitSystem === UNIT_SYSTEMS.IMPERIAL 
        ? unitsContext.TEMPERATURE_UNITS.FAHRENHEIT 
        : unitsContext.TEMPERATURE_UNITS.CELSIUS
    );
  };
  
  // Expose the context value
  const value = {
    weatherData,
    loading,
    error,
    lastUpdated,
    activeLocation,
    showLocationPrompt,
    setShowLocationPrompt,
    citySearchOpen,
    setCitySearchOpen,
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
    getFormattedLastUpdated,
    fetchWeatherData,
    fetchCurrentLocationWeather,
    fetchLocationWeather,
    setActiveLocation,
    getFormattedTemperature
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
    throw new Error('useWeather must be used within a SimpleWeatherProvider');
  }
  return context;
}
/**
 * Enhanced Weather Context
 * 
 * A modern, robust weather context that uses the API Data Warehouse
 * to provide weather data and forecasts with intelligent caching,
 * provider failover, and enhanced automotive metrics.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchConsolidatedWeatherData } from '@/services/api/integrations/weatherService';
import { WeatherData, ForecastData, OneCallData } from '@/lib/weather';
import { AutomotiveWeatherData } from './ConsolidatedWeatherContext';
import { apiWarehouse, checkAPIHealth } from '@/services/api/index';
import { getUnitFromStorage, getSavedLocationsFromStorage, storeSavedLocations, storeUnit } from '@/utils/localStorage';

export interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface EnhancedWeatherContextType {
  // Current state
  currentLocation: Location | null;
  savedLocations: Location[];
  unit: 'metric' | 'imperial';
  
  // Weather data
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  oneCallData: OneCallData | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  
  // Status
  isLoading: boolean;
  lastUpdated: number | null;
  error: string | null;
  serviceHealth: {
    weather: 'healthy' | 'degraded' | 'unavailable';
    forecast: 'healthy' | 'degraded' | 'unavailable';
    alerts: 'healthy' | 'degraded' | 'unavailable';
  };
  
  // Actions
  setCurrentLocation: (location: Location) => void;
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (location: Location) => void;
  setUnit: (unit: 'metric' | 'imperial') => void;
  refreshWeather: () => Promise<void>;
  checkServiceHealth: () => Promise<void>;
  
  // Custom flags
  isDrivingConditionsUnfavorable: boolean;
}

export const EnhancedWeatherContext = createContext<EnhancedWeatherContextType | null>(null);

export const EnhancedWeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Location and preferences state
  const [currentLocation, setCurrentLocationState] = useState<Location | null>(null);
  const [savedLocations, setSavedLocationsState] = useState<Location[]>(getSavedLocationsFromStorage() || []);
  const [unit, setUnitState] = useState<'metric' | 'imperial'>(getUnitFromStorage() || 'imperial');
  
  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [automotiveWeatherData, setAutomotiveWeatherData] = useState<AutomotiveWeatherData | null>(null);
  
  // Status state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceHealth, setServiceHealth] = useState<{
    weather: 'healthy' | 'degraded' | 'unavailable';
    forecast: 'healthy' | 'degraded' | 'unavailable';
    alerts: 'healthy' | 'degraded' | 'unavailable';
  }>({
    weather: 'healthy',
    forecast: 'healthy',
    alerts: 'healthy',
  });
  
  // Custom flags
  const [isDrivingConditionsUnfavorable, setIsDrivingConditionsUnfavorable] = useState<boolean>(false);
  
  // Hooks
  const { toast } = useToast();
  
  // Fetch weather data for the current location
  const fetchWeatherData = useCallback(async () => {
    if (!currentLocation) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Location or unit changed, fetching weather');
      
      const result = await fetchConsolidatedWeatherData(currentLocation, unit);
      
      // Update state with the weather data
      setWeatherData(result.weatherData);
      setForecastData(result.forecastData);
      setOneCallData(result.oneCallData);
      setAutomotiveWeatherData(result.automotiveWeatherData);
      setLastUpdated(Date.now());
      
      // Determine if driving conditions are unfavorable
      if (result.automotiveWeatherData) {
        setIsDrivingConditionsUnfavorable(
          // Driving quality below 3 (out of 5)
          (result.automotiveWeatherData.driving.quality < 3) ||
          // Has alerts
          (result.alerts && result.alerts.length > 0) ||
          // Has risks related to road conditions
          (result.automotiveWeatherData.driving.risks.some(risk => 
            risk.toLowerCase().includes('road') || 
            risk.toLowerCase().includes('visibility') ||
            risk.toLowerCase().includes('braking')
          ))
        );
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(`Failed to fetch weather data: ${err instanceof Error ? err.message : String(err)}`);
      
      // Show toast on error
      toast({
        title: 'Weather Data Error',
        description: `Could not fetch weather data. ${err instanceof Error ? err.message : String(err)}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation, unit, toast]);
  
  // Refresh weather data
  const refreshWeather = useCallback(async () => {
    // Clear the cache for the current location before fetching
    if (currentLocation) {
      // TODO: Implement cache invalidation for specific location
      await fetchWeatherData();
    }
  }, [currentLocation, fetchWeatherData]);
  
  // Check service health
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await checkAPIHealth();
      
      setServiceHealth({
        weather: health.providers.weather || 'unavailable',
        forecast: health.providers.weather || 'unavailable',
        alerts: health.providers.weather || 'unavailable',
      });
      
      if (health.status !== 'healthy') {
        toast({
          title: `Weather Service ${health.status === 'degraded' ? 'Degraded' : 'Unavailable'}`,
          description: health.status === 'degraded' 
            ? 'Weather service is experiencing issues. Some data may be stale or unavailable.'
            : 'Weather service is currently unavailable. Displaying cached data if available.',
          variant: health.status === 'degraded' ? 'default' : 'destructive',
        });
      }
    } catch (err) {
      console.error('Error checking service health:', err);
    }
  }, [toast]);
  
  // Set current location with validation
  const setCurrentLocation = useCallback((location: Location) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      console.error('Invalid location:', location);
      toast({
        title: 'Invalid Location',
        description: 'The provided location is invalid.',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentLocationState(location);
  }, [toast]);
  
  // Add a location to saved locations
  const addSavedLocation = useCallback((location: Location) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      console.error('Invalid location:', location);
      return;
    }
    
    // Check if location already exists
    const exists = savedLocations.some(
      loc => loc.lat === location.lat && loc.lon === location.lon
    );
    
    if (!exists) {
      const updatedLocations = [...savedLocations, location];
      setSavedLocationsState(updatedLocations);
      storeSavedLocations(updatedLocations);
      
      toast({
        title: 'Location Saved',
        description: `"${location.name}" has been added to your saved locations.`,
      });
    }
  }, [savedLocations, toast]);
  
  // Remove a location from saved locations
  const removeSavedLocation = useCallback((location: Location) => {
    const updatedLocations = savedLocations.filter(
      loc => !(loc.lat === location.lat && loc.lon === location.lon)
    );
    
    setSavedLocationsState(updatedLocations);
    storeSavedLocations(updatedLocations);
    
    toast({
      title: 'Location Removed',
      description: `"${location.name}" has been removed from your saved locations.`,
    });
  }, [savedLocations, toast]);
  
  // Set unit with storage update
  const setUnit = useCallback((newUnit: 'metric' | 'imperial') => {
    setUnitState(newUnit);
    storeUnit(newUnit);
  }, []);
  
  // Effect to fetch weather when location or unit changes
  useEffect(() => {
    if (currentLocation) {
      fetchWeatherData();
    }
  }, [currentLocation, unit, fetchWeatherData]);
  
  // Effect to geolocation on initialization
  useEffect(() => {
    // Only get geolocation if no current location is set
    if (!currentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: Location = {
              name: 'Current Location',
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            setCurrentLocationState(location);
            console.log('Got geolocation on init:', location);
          },
          (error) => {
            console.error('Geolocation error:', error);
            
            // Default to first saved location if available
            if (savedLocations.length > 0) {
              setCurrentLocationState(savedLocations[0]);
            } else {
              // Default to Nashville
              setCurrentLocationState({
                name: 'Nashville',
                lat: 36.1627,
                lon: -86.7816,
              });
            }
          }
        );
      } else {
        console.error('Geolocation not supported');
        
        // Default to first saved location if available
        if (savedLocations.length > 0) {
          setCurrentLocationState(savedLocations[0]);
        } else {
          // Default to Nashville
          setCurrentLocationState({
            name: 'Nashville',
            lat: 36.1627,
            lon: -86.7816,
          });
        }
      }
    }
  }, [currentLocation, savedLocations]);
  
  // Effect to check service health periodically
  useEffect(() => {
    // Check health on start
    checkServiceHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkServiceHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkServiceHealth]);
  
  // Construct context value
  const contextValue: EnhancedWeatherContextType = {
    // Current state
    currentLocation,
    savedLocations,
    unit,
    
    // Weather data
    weatherData,
    forecastData,
    oneCallData,
    automotiveWeatherData,
    
    // Status
    isLoading,
    lastUpdated,
    error,
    serviceHealth,
    
    // Actions
    setCurrentLocation,
    addSavedLocation,
    removeSavedLocation,
    setUnit,
    refreshWeather,
    checkServiceHealth,
    
    // Custom flags
    isDrivingConditionsUnfavorable,
  };
  
  return (
    <EnhancedWeatherContext.Provider value={contextValue}>
      {children}
    </EnhancedWeatherContext.Provider>
  );
};

// Custom hook to use the weather context
export const useEnhancedWeather = () => {
  const context = useContext(EnhancedWeatherContext);
  
  if (!context) {
    throw new Error('useEnhancedWeather must be used within an EnhancedWeatherProvider');
  }
  
  return context;
};
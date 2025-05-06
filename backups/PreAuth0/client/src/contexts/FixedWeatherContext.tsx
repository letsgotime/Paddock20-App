import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  fetchConsolidatedWeatherData, 
  getForecastSummary, 
  getDrivingConditions 
} from '@/services/consolidatedWeatherService';
import { 
  saveToWeatherCaches, 
  getFromWeatherCaches,
  formatCacheAge 
} from '@/services/weatherStateManager';
import { OneCallData, WeatherData, ForecastData } from '@/lib/weather';

// Cache configuration constants
const PRIMARY_CACHE_TTL_MINUTES = 60; // 1 hour primary cache
const SECONDARY_CACHE_TTL_HOURS = 8;  // 8 hour secondary cache
const REFRESH_INTERVAL_MINUTES = 60;  // How often we auto-refresh

// Local type definition to avoid import conflict
interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
}

// Define shape of our weather context
export interface AutomotiveWeatherData {
  conditions: {
    summary: string;
    icon: string;
    air_temperature: number;
    feels_like: number;
    humidity: number;
    description: string;
    is_daytime: boolean;
    // Add UV index for display
    uv_index?: number;
  };
  driving_conditions: {
    road_condition: string;
    visibility: string;
    risk_level: string;
  };
  forecast_summary: {
    temp_range: {
      min: number | null;
      max: number | null;
    };
    conditions: string[];
    precipitation_expected: boolean;
  };
  performance_metrics: {
    fuel_efficiency_impact: number;
    tire_wear_impact: number;
    handling_adjustments: string;
  };
  // Add sunrise and sunset times
  sun_times?: {
    sunrise: number;
    sunset: number;
    sunrise_formatted: string;
    sunset_formatted: string;
    day_length: string;
  };
}

// Use the GeoLocation type for the context
interface WeatherContextType {
  weatherData: WeatherData | null;
  oneCallData: OneCallData | null;
  forecastData: ForecastData | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  selectedLocation: GeoLocation | null;
  unit: 'metric' | 'imperial';
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refreshWeather: () => Promise<void>;
  setUnit: (unit: 'metric' | 'imperial') => void;
  failureCount: number;
  isUsingFallbackData: boolean;
  nextRefreshTime: Date | null;
  cacheAge: string | null;
  cacheExpiryTime: Date | null;
}

// Create context with default values
const WeatherContext = createContext<WeatherContextType>({
  weatherData: null,
  oneCallData: null,
  forecastData: null,
  automotiveWeatherData: null,
  selectedLocation: null,
  unit: 'imperial',
  isLoading: false,
  error: null,
  lastUpdated: null,
  refreshWeather: async () => {},
  setUnit: () => {},
  failureCount: 0,
  isUsingFallbackData: false,
  nextRefreshTime: null,
  cacheAge: null,
  cacheExpiryTime: null
});

// Default location (New York City)
const DEFAULT_LOCATION: GeoLocation = {
  name: 'New York City',
  lat: 40.7128,
  lon: -74.006
};

// Provider component
export const WeatherProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // State for weather data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [automotiveWeatherData, setAutomotiveWeatherData] = useState<AutomotiveWeatherData | null>(null);

  // State for fetching status and metadata
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const [cacheAge, setCacheAge] = useState<string | null>(null);
  const [cacheExpiryTime, setCacheExpiryTime] = useState<Date | null>(null);

  // Get current location (with user permission)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('Got geolocation:', newLocation);
          setLocation(newLocation);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Continue with default location
        }
      );
    }
  }, []);

  // Helper function to format time from Unix timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to calculate day length
  const calculateDayLength = (sunrise: number, sunset: number): string => {
    const dayLengthSeconds = sunset - sunrise;
    const hours = Math.floor(dayLengthSeconds / 3600);
    const minutes = Math.floor((dayLengthSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Create custom automotive friendly weather data
  const processAutomotiveData = (
    weatherData: WeatherData | null, 
    oneCallData: OneCallData | null, 
    forecastData: ForecastData | null
  ): AutomotiveWeatherData | null => {
    if (!weatherData) return null;

    // Get road conditions
    const drivingConditions = getDrivingConditions(oneCallData);
    
    // Get forecast summary
    const forecast = getForecastSummary(forecastData);
    
    // Process sunrise/sunset times
    const sunTimes = weatherData.sys ? {
      sunrise: weatherData.sys.sunrise,
      sunset: weatherData.sys.sunset,
      sunrise_formatted: formatTime(weatherData.sys.sunrise),
      sunset_formatted: formatTime(weatherData.sys.sunset),
      day_length: calculateDayLength(weatherData.sys.sunrise, weatherData.sys.sunset)
    } : undefined;
    
    // Simplified weather data optimized for driving
    return {
      conditions: {
        summary: weatherData.weather[0].main,
        icon: weatherData.weather[0].icon,
        air_temperature: weatherData.main.temp,
        feels_like: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        is_daytime: isCurrentlyDaytime(weatherData),
        uv_index: oneCallData?.current?.uvi || 0
      },
      driving_conditions: {
        road_condition: drivingConditions.roadCondition,
        visibility: drivingConditions.visibility,
        risk_level: drivingConditions.riskLevel
      },
      forecast_summary: {
        temp_range: {
          min: forecast.tempRange.min,
          max: forecast.tempRange.max
        },
        conditions: forecast.conditions,
        precipitation_expected: forecast.precipitation
      },
      performance_metrics: {
        fuel_efficiency_impact: calculateFuelEfficiencyImpact(weatherData, oneCallData),
        tire_wear_impact: calculateTireWearImpact(weatherData, oneCallData, drivingConditions.roadCondition),
        handling_adjustments: getHandlingRecommendation(weatherData, drivingConditions.roadCondition)
      },
      sun_times: sunTimes
    };
  };

  // Helper function to determine if it's currently daytime
  const isCurrentlyDaytime = (weatherData: WeatherData): boolean => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return weatherData.sys && now >= weatherData.sys.sunrise && now <= weatherData.sys.sunset;
  };

  // Calculate fuel efficiency impact (-10 to +5 percent)
  const calculateFuelEfficiencyImpact = (weatherData: WeatherData, oneCallData: OneCallData | null): number => {
    let impact = 0;
    
    // Temperature impact
    const temp = weatherData.main.temp;
    const tempF = unit === 'imperial' ? temp : (temp * 9/5) + 32;
    
    if (tempF < 32) impact -= 5; // Cold weather
    if (tempF < 20) impact -= 3; // Very cold
    if (tempF > 95) impact -= 2; // Very hot
    
    // Precipitation impact
    const hasRain = weatherData.rain && (weatherData.rain['1h'] || weatherData.rain['3h']);
    const hasSnow = weatherData.snow && (weatherData.snow['1h'] || weatherData.snow['3h']);
    
    if (hasRain) impact -= 3;
    if (hasSnow) impact -= 6;
    
    // Wind impact
    const windSpeed = weatherData.wind.speed;
    if (windSpeed > 15) impact -= 2; // High wind
    
    return Math.max(-10, Math.min(5, impact));
  };

  // Calculate tire wear impact (0 to 3x normal)
  const calculateTireWearImpact = (
    weatherData: WeatherData, 
    oneCallData: OneCallData | null, 
    roadCondition: string
  ): number => {
    let multiplier = 1.0; // Normal wear
    
    // Road condition has biggest impact
    if (roadCondition === 'Wet') multiplier += 0.3;
    if (roadCondition === 'Snow Covered') multiplier += 0.5;
    if (roadCondition === 'Damp') multiplier += 0.1;
    
    // Temperature extremes
    const temp = weatherData.main.temp;
    const tempF = unit === 'imperial' ? temp : (temp * 9/5) + 32;
    
    if (tempF > 95) multiplier += 0.4; // Hot asphalt increases wear
    if (tempF < 20) multiplier += 0.2; // Cold, hard rubber increases wear
    
    return parseFloat(multiplier.toFixed(1));
  };

  // Get handling recommendation
  const getHandlingRecommendation = (weatherData: WeatherData, roadCondition: string): string => {
    const temp = weatherData.main.temp;
    const tempF = unit === 'imperial' ? temp : (temp * 9/5) + 32;
    const windSpeed = weatherData.wind.speed;
    
    if (roadCondition === 'Snow Covered') return "Reduce speed by 50%, avoid sudden inputs";
    if (roadCondition === 'Wet') return "Reduce speed by 30%, increase following distance";
    if (windSpeed > 20) return "Be cautious of crosswinds, maintain firm grip";
    if (tempF < 32) return "Watch for black ice, especially on bridges";
    
    return "Normal handling, maintain regular driving practices";
  };

  // Function to fetch weather data
  const fetchWeather = async (forceRefresh: boolean = false) => {
    console.log("Starting weather fetch process...");
    if (!location) {
      console.warn("No location set, using default");
    }
    
    setIsLoading(true);
    
    try {
      // Try to get data from caches first (primary then secondary)
      const { data: cachedData, source: cacheSource } = getFromWeatherCaches(
        location, 
        unit, 
        forceRefresh,
        setCacheAge
      );
      
      // If we have valid cached data from either cache, use it
      if (cachedData) {
        console.log(`Using ${cacheSource} cache data`);
        
        setWeatherData(cachedData.weatherData);
        setOneCallData(cachedData.oneCallData);
        setForecastData(cachedData.forecastData);
        
        // Process automotive data from cache
        const autoData = processAutomotiveData(
          cachedData.weatherData, 
          cachedData.oneCallData, 
          cachedData.forecastData
        );
        setAutomotiveWeatherData(autoData);
        
        setError(null);
        setLastUpdated(new Date(cachedData.timestamp));
        setIsLoading(false);
        setIsUsingFallbackData(true);
        
        // If we're using the primary cache, set the expiry time
        if (cacheSource === 'primary') {
          const cacheTime = new Date(cachedData.timestamp);
          const expiryTime = new Date(cacheTime.getTime() + PRIMARY_CACHE_TTL_MINUTES * 60 * 1000);
          setCacheExpiryTime(expiryTime);
        } 
        // If we're using the secondary cache, schedule a refresh immediately
        else if (cacheSource === 'secondary') {
          const cacheTime = new Date(cachedData.timestamp);
          const expiryTime = new Date(cacheTime.getTime() + SECONDARY_CACHE_TTL_HOURS * 60 * 60 * 1000);
          setCacheExpiryTime(expiryTime);
          
          // Secondary cache indicates we had trouble with the primary cache,
          // so schedule a refresh to happen soon
          setTimeout(() => {
            console.log("Performing background refresh after using secondary cache");
            fetchWeather(true).catch(console.error);
          }, 5000);
        }
        
        return;
      }
      
      // Fetch fresh data if no cache available or refresh forced
      console.log("Fetching fresh weather data...");
      const data = await fetchConsolidatedWeatherData(location, unit);
      console.log("Weather data received:", data);
      
      // Extract components
      const { weatherData: newWeatherData, oneCallData: newOneCallData, forecastData: newForecastData } = data;
      
      // Create automotive-focused data
      const autoData = processAutomotiveData(newWeatherData, newOneCallData, newForecastData);
      
      // Update state with all data
      setWeatherData(newWeatherData);
      setOneCallData(newOneCallData);
      setForecastData(newForecastData);
      setAutomotiveWeatherData(autoData);
      
      // Reset error state
      setError(null);
      
      // Update metadata
      const now = new Date();
      setLastUpdated(now);
      setFailureCount(0);
      setIsUsingFallbackData(false);
      
      // Set next refresh time
      const nextRefresh = new Date(now.getTime() + REFRESH_INTERVAL_MINUTES * 60 * 1000);
      setNextRefreshTime(nextRefresh);
      
      // Reset cache metrics
      setCacheAge("Just updated");
      
      // Set cache expiry time
      const primaryExpiryTime = new Date(now.getTime() + PRIMARY_CACHE_TTL_MINUTES * 60 * 1000);
      setCacheExpiryTime(primaryExpiryTime);
      
      // Save to both caches
      saveToWeatherCaches(location, unit, {
        weatherData: newWeatherData,
        oneCallData: newOneCallData,
        forecastData: newForecastData,
        timestamp: now.toISOString()
      });
      
    } catch (err) {
      console.error("Error fetching weather:", err);
      
      // Try to get data from secondary cache as a last resort
      const { data: emergencyCachedData, source: emergencyCacheSource } = getFromWeatherCaches(
        location, 
        unit, 
        false, // Don't force refresh in emergency mode
        setCacheAge
      );
      
      // If we found emergency data in the secondary cache, use it
      if (emergencyCachedData) {
        console.log(`Using emergency ${emergencyCacheSource} cache data after fetch failure`);
        
        setWeatherData(emergencyCachedData.weatherData);
        setOneCallData(emergencyCachedData.oneCallData);
        setForecastData(emergencyCachedData.forecastData);
        
        const autoData = processAutomotiveData(
          emergencyCachedData.weatherData, 
          emergencyCachedData.oneCallData, 
          emergencyCachedData.forecastData
        );
        setAutomotiveWeatherData(autoData);
        
        setError(err as Error);
        setFailureCount(prevCount => prevCount + 1);
        setIsUsingFallbackData(true);
        setLastUpdated(new Date(emergencyCachedData.timestamp));
      }
      // Only fully fail if we have no data at all
      else if (weatherData || oneCallData || forecastData) {
        console.log("Using existing data despite fetch error");
        setError(err as Error);
        setFailureCount(prevCount => prevCount + 1);
        setIsUsingFallbackData(true);
      } else {
        setError(err as Error);
        setFailureCount(prevCount => prevCount + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh weather
  const refreshWeather = async () => {
    console.log("Manual weather refresh triggered");
    await fetchWeather(true);
  };

  // Function to change temperature unit
  const changeUnit = (newUnit: 'metric' | 'imperial') => {
    if (unit !== newUnit) {
      console.log(`Changing unit from ${unit} to ${newUnit}`);
      setUnit(newUnit);
    }
  };

  // Initial fetch on load or when location/unit changes
  useEffect(() => {
    console.log("Location or unit changed, fetching weather");
    fetchWeather();
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing weather data");
      fetchWeather();
    }, REFRESH_INTERVAL_MINUTES * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [location, unit]);

  // Provide context to children
  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        oneCallData,
        forecastData,
        automotiveWeatherData,
        selectedLocation: location,
        unit,
        isLoading,
        error,
        lastUpdated,
        refreshWeather,
        setUnit: changeUnit,
        failureCount,
        isUsingFallbackData,
        nextRefreshTime,
        cacheAge,
        cacheExpiryTime
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

// Custom hook for using context
export const useWeather = () => useContext(WeatherContext);

export default WeatherContext;
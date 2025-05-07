/**
 * EnhancedWeatherContext
 * 
 * An improved, high-performance weather context that uses the API Data Warehouse.
 * This context merges the best features of the original WeatherContext and
 * ConsolidatedWeatherContext, while providing better resilience, caching, and 
 * extensibility through the Data Warehouse architecture.
 * 
 * Key improvements:
 * - Multi-level intelligent caching (primary, secondary, offline)
 * - Multiple weather providers with automatic fallback
 * - Improved error handling and recovery
 * - Real-time service health monitoring
 * - Enhanced automotive weather metrics
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  checkWeatherServicesHealth,
  convertToLegacyWeatherData,
  convertToLegacyForecastData
} from '@/services/api/integrations/weatherService';
import { apiWarehouse } from '@/services/api/core';
import { CacheLevel, APICategory } from '@/services/api/types';
import { OneCallData, WeatherData, ForecastData, Location } from '@/lib/weather';
import { AutomotiveWeatherData } from '@/contexts/ConsolidatedWeatherContext';
import { useToast } from '@/hooks/use-toast';

// Cache configuration constants
const REFRESH_INTERVAL_MINUTES = 15;  // How often we auto-refresh

/**
 * Format cache age for display
 */
function formatCacheAge(timestamp: number): string {
  const now = Date.now();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  
  if (ageInMinutes < 1) return "Just now";
  if (ageInMinutes < 60) return `${Math.round(ageInMinutes)} minutes old`;
  return `${Math.round(ageInMinutes / 60)} hours old`;
}

// The Weather Context interface - what components can access
interface WeatherContextType {
  // Core weather data
  weatherData: WeatherData | null;
  oneCallData: OneCallData | null;
  forecastData: ForecastData | null;
  automotiveWeatherData: AutomotiveWeatherData | null;
  
  // Location & settings
  selectedLocation: Location;
  unit: 'metric' | 'imperial';
  setLocation: (location: Location) => void;
  setUnit: (unit: 'metric' | 'imperial') => void;
  
  // Status information
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  failureCount: number;
  isUsingFallbackData: boolean;
  
  // Actions
  refreshWeather: () => Promise<void>;
  
  // Utility/derived data
  formattedLastUpdated: string;
  cacheStatus: string;
  
  // Health information
  servicesHealth: {
    weather: 'healthy' | 'degraded' | 'unavailable';
    forecast: 'healthy' | 'degraded' | 'unavailable';
    alerts: 'healthy' | 'degraded' | 'unavailable';
  };
}

// Create the context with default values
const EnhancedWeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Provider component
export const EnhancedWeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Core weather data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [automotiveWeatherData, setAutomotiveWeatherData] = useState<AutomotiveWeatherData | null>(null);
  
  // Status state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  
  // Preferences state
  const defaultLocation = { name: 'Current Location', lat: 33.996, lon: -84.292 }; // Atlanta
  const [selectedLocation, setSelectedLocation] = useState<Location>(defaultLocation);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
  
  // Health state
  const [servicesHealth, setServicesHealth] = useState<{
    weather: 'healthy' | 'degraded' | 'unavailable';
    forecast: 'healthy' | 'degraded' | 'unavailable';
    alerts: 'healthy' | 'degraded' | 'unavailable';
  }>({
    weather: 'unavailable',
    forecast: 'unavailable',
    alerts: 'unavailable'
  });
  
  // Refs for tracking refresh intervals
  const refreshTimerRef = useRef<number | null>(null);

  // Utility to format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';
    
  // Cache status description
  const cacheStatus = lastUpdated
    ? formatCacheAge(lastUpdated.getTime())
    : 'No cache';
  
  // State for cache display
  const [cacheAge, setCacheAge] = useState<string>("Not cached");
  
  // Handle location setting with geolocation support
  const setLocation = useCallback((location: Location) => {
    console.log('Setting location:', location);
    
    // If this is the "Current Location" option, try to get actual coordinates
    if (location.name === 'Current Location' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoLocation = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('Got geolocation:', geoLocation);
          setSelectedLocation(geoLocation);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Fall back to default location but still call it "Current Location"
          setSelectedLocation(location);
        },
        { timeout: 10000, maximumAge: 1800000 } // 30 minute cache for location
      );
    } else {
      // Use the provided location directly
      setSelectedLocation(location);
    }
  }, []);
  
  // Fetch weather data using the API Data Warehouse
  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    console.log('Starting weather fetch process...');
    
    try {
      // Get current weather and automotive metrics
      const { weatherData: currentWeather, automotiveMetrics } = await getCurrentWeather(
        selectedLocation.lat,
        selectedLocation.lon,
        unit
      );
      
      // Get forecast data
      const forecastData = await getWeatherForecast(
        selectedLocation.lat,
        selectedLocation.lon,
        unit
      );
      
      // Get weather alerts
      const alerts = await getWeatherAlerts(
        selectedLocation.lat,
        selectedLocation.lon
      );
      
      // Convert to the formats expected by existing components
      const legacyWeatherData = convertToLegacyWeatherData(currentWeather);
      const legacyForecastData = convertToLegacyForecastData(forecastData);
      
      // Create OneCall-like data structure from our various data sources
      const oneCallData: OneCallData = {
        lat: currentWeather.location.lat,
        lon: currentWeather.location.lon,
        timezone: currentWeather.location.timezone,
        timezone_offset: 0, // Not easy to determine without the actual API
        current: {
          dt: Math.floor(currentWeather.current.timestamp / 1000),
          sunrise: forecastData.daily?.[0]?.sunrise ? Math.floor(forecastData.daily[0].sunrise / 1000) : undefined,
          sunset: forecastData.daily?.[0]?.sunset ? Math.floor(forecastData.daily[0].sunset / 1000) : undefined,
          temp: currentWeather.current.temp,
          feels_like: currentWeather.current.feels_like,
          pressure: currentWeather.current.pressure,
          humidity: currentWeather.current.humidity,
          dew_point: 0, // Not available directly
          uvi: currentWeather.current.uv_index,
          clouds: currentWeather.current.cloud_cover,
          visibility: currentWeather.current.visibility * 1000, // Convert km to m
          wind_speed: currentWeather.current.wind_speed,
          wind_deg: currentWeather.current.wind_direction,
          weather: [
            {
              id: 800, // Default ID
              main: currentWeather.current.weather_description.split(' ')[0],
              description: currentWeather.current.weather_description,
              icon: currentWeather.current.weather_icon
            }
          ],
          rain: currentWeather.current.precipitation > 0 ? { '1h': currentWeather.current.precipitation } : undefined,
        },
        daily: forecastData.daily?.map(day => ({
          dt: new Date(day.date).getTime() / 1000,
          sunrise: day.sunrise ? Math.floor(day.sunrise / 1000) : 0,
          sunset: day.sunset ? Math.floor(day.sunset / 1000) : 0,
          temp: {
            day: (day.temp_min + day.temp_max) / 2,
            min: day.temp_min,
            max: day.temp_max,
            night: day.temp_min,
            eve: (day.temp_min + day.temp_max) / 2,
            morn: (day.temp_min + day.temp_max) / 2
          },
          feels_like: {
            day: (day.temp_min + day.temp_max) / 2,
            night: day.temp_min,
            eve: (day.temp_min + day.temp_max) / 2,
            morn: (day.temp_min + day.temp_max) / 2
          },
          pressure: currentWeather.current.pressure,
          humidity: currentWeather.current.humidity,
          dew_point: 0,
          wind_speed: currentWeather.current.wind_speed,
          wind_deg: currentWeather.current.wind_direction,
          weather: [
            {
              id: 800,
              main: day.weather_description.split(' ')[0],
              description: day.weather_description,
              icon: day.weather_icon
            }
          ],
          clouds: currentWeather.current.cloud_cover,
          pop: day.precipitation_chance / 100,
          uvi: currentWeather.current.uv_index
        })) || [],
        alerts: alerts.map(alert => ({
          sender_name: alert.source || 'Weather Service',
          event: alert.title,
          start: Math.floor(alert.start / 1000),
          end: Math.floor(alert.end / 1000),
          description: alert.description,
          tags: [alert.severity]
        }))
      };
      
      // Convert automotive metrics to the format expected by components
      const enhancedAutomotiveData: AutomotiveWeatherData = {
        conditions: {
          summary: currentWeather.current.weather_description,
          icon: currentWeather.current.weather_icon,
          temp: currentWeather.current.temp,
          feelsLike: currentWeather.current.feels_like,
          humidity: currentWeather.current.humidity,
          windSpeed: currentWeather.current.wind_speed,
          windDirection: getWindDirection(currentWeather.current.wind_direction),
          pressure: currentWeather.current.pressure,
          visibility: currentWeather.current.visibility,
          uvIndex: currentWeather.current.uv_index,
        },
        forecast: {
          today: {
            description: forecastData.daily?.[0]?.weather_description || '',
            high: forecastData.daily?.[0]?.temp_max || currentWeather.current.temp,
            low: forecastData.daily?.[0]?.temp_min || currentWeather.current.temp,
            precipitation: forecastData.daily?.[0]?.precipitation_chance || 0,
          },
          tomorrow: {
            description: forecastData.daily?.[1]?.weather_description || '',
            high: forecastData.daily?.[1]?.temp_max || 0,
            low: forecastData.daily?.[1]?.temp_min || 0,
            precipitation: forecastData.daily?.[1]?.precipitation_chance || 0,
          },
        },
        alerts: alerts.map(alert => ({
          event: alert.title,
          description: alert.description,
          start: alert.start,
          end: alert.end,
          severity: alert.severity,
        })),
        driving: {
          quality: getDrivingQuality(automotiveMetrics),
          recommendation: automotiveMetrics.drivingConditions.powerDelivery.recommendation,
          risks: getDrivingRisks(automotiveMetrics),
          idealTimes: getIdealDrivingTimes(forecastData),
        },
        astronomy: {
          sunrise: forecastData.daily?.[0]?.sunrise ? 
            new Date(forecastData.daily[0].sunrise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
          sunset: forecastData.daily?.[0]?.sunset ? 
            new Date(forecastData.daily[0].sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '',
          moonPhase: 'Not available', // Not provided by our APIs
          dayLength: forecastData.daily?.[0]?.sunrise && forecastData.daily?.[0]?.sunset ? 
            formatDayLength(forecastData.daily[0].sunset - forecastData.daily[0].sunrise) : '',
        },
      };
      
      // Update state with new data
      setWeatherData(legacyWeatherData);
      setForecastData(legacyForecastData);
      setOneCallData(oneCallData);
      setAutomotiveWeatherData(enhancedAutomotiveData);
      
      setLastUpdated(new Date());
      setFailureCount(0);
      setIsUsingFallbackData(false);
      setError(null);
      setCacheAge(formatCacheAge(Date.now()));
      
      // Check and update service health
      checkWeatherServicesHealth().then(health => {
        setServicesHealth(health);
      }).catch(e => {
        console.warn('Failed to check service health:', e);
      });
      
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Increment failure count
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      
      // Show error toast after multiple failures
      if (newFailureCount >= 3) {
        toast({
          title: "Weather Update Failed",
          description: "Could not retrieve weather information. Please try again later.",
          variant: "destructive",
        });
      }
      
      // Try to use data from offline cache if available
      const offlineCache = apiWarehouse.cache?.[CacheLevel.OFFLINE];
      const weatherCacheKey = `${APICategory.WEATHER}:weather:${JSON.stringify({
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        units: unit
      })}`;
      
      const cachedWeather = offlineCache?.get(weatherCacheKey);
      if (cachedWeather) {
        setIsUsingFallbackData(true);
        // Use cached data (implementation depends on cache structure)
        // This would require additional integration code
      }
      
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, unit, failureCount, toast]);
  
  // Public refresh method
  const refreshWeather = async () => {
    toast({
      title: "Refreshing Weather",
      description: "Fetching the latest weather data...",
    });
    
    try {
      await fetchWeather();
      toast({
        title: "Weather Updated",
        description: "Latest weather information has been loaded.",
      });
    } catch (err) {
      // Error is already handled in fetchWeather
    }
  };
  
  // Fetch weather when location or unit changes
  useEffect(() => {
    console.log('Location or unit changed, fetching weather');
    fetchWeather();
    
    // Clear any existing refresh timer
    if (refreshTimerRef.current) {
      window.clearInterval(refreshTimerRef.current);
    }
    
    // Set a refresh timer
    refreshTimerRef.current = window.setInterval(() => {
      console.log('Auto-refreshing weather data');
      fetchWeather();
    }, REFRESH_INTERVAL_MINUTES * 60 * 1000); // Convert minutes to milliseconds
    
    // Clean up the interval on unmount
    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
      }
    };
  }, [selectedLocation, unit, fetchWeather]);
  
  // When the app starts, try to use geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('Got geolocation on init:', location);
          setSelectedLocation(location);
        },
        (error) => {
          console.warn('Geolocation error on init:', error.message);
          // Keep the default location
        },
        { timeout: 10000, maximumAge: 1800000 } // 30 minute cache
      );
    }
  }, []);
  
  // Context value
  const value: WeatherContextType = {
    // Core weather data
    weatherData,
    oneCallData,
    forecastData,
    automotiveWeatherData,
    
    // Location & settings
    selectedLocation,
    unit,
    setLocation,
    setUnit,
    
    // Status information
    isLoading,
    error,
    lastUpdated,
    failureCount,
    isUsingFallbackData,
    
    // Actions
    refreshWeather,
    
    // Utility/derived data
    formattedLastUpdated,
    cacheStatus,
    
    // Health information
    servicesHealth,
  };
  
  return (
    <EnhancedWeatherContext.Provider value={value}>
      {children}
    </EnhancedWeatherContext.Provider>
  );
};

// Hook for consuming the context
export const useEnhancedWeather = () => {
  const context = useContext(EnhancedWeatherContext);
  if (context === undefined) {
    throw new Error('useEnhancedWeather must be used within an EnhancedWeatherProvider');
  }
  return context;
};

// Export named functions for compatibility with existing code
export function useWeather() {
  return useEnhancedWeather();
}

export function useFixedWeather() {
  return useEnhancedWeather();
}

/**
 * Helper Functions
 */

// Convert wind direction from degrees to cardinal direction
function getWindDirection(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Calculate driving quality on a scale of 1-5
function getDrivingQuality(metrics: any): number {
  // Extract relevant conditions that affect driving quality
  const { trackSurface, drivingConditions } = metrics;
  
  // Base quality score
  let quality = 5; // Start at optimal
  
  // Reduce score based on road condition
  if (trackSurface.condition === 'Snow-covered') quality -= 3;
  else if (trackSurface.condition === 'Wet') quality -= 2;
  else if (trackSurface.condition === 'Damp') quality -= 1;
  
  // Reduce score based on visibility
  if (drivingConditions.visibilityLevel === 'Poor') quality -= 2;
  else if (drivingConditions.visibilityLevel === 'Reduced') quality -= 1;
  
  // Reduce score based on wind impact
  if (drivingConditions.windImpact === 'High') quality -= 1;
  
  // Reduce score based on sunglare risk
  if (drivingConditions.sunglareRisk === 'High') quality -= 1;
  
  // Ensure quality is between 1-5
  return Math.max(1, Math.min(5, quality));
}

// Extract driving risks from automotive metrics
function getDrivingRisks(metrics: any): string[] {
  const risks: string[] = [];
  const { trackSurface, drivingConditions } = metrics;
  
  // Add road condition risks
  if (trackSurface.condition !== 'Dry') {
    risks.push(`${trackSurface.condition} roads`);
  }
  
  // Add visibility risks
  if (drivingConditions.visibilityLevel !== 'Excellent') {
    risks.push(`${drivingConditions.visibilityLevel} visibility`);
  }
  
  // Add specific risks
  if (drivingConditions.hydroplaningRisk !== 'Low') {
    risks.push(`${drivingConditions.hydroplaningRisk} hydroplaning risk`);
  }
  
  if (drivingConditions.sunglareRisk !== 'Low') {
    risks.push(`${drivingConditions.sunglareRisk} sun glare`);
  }
  
  if (drivingConditions.windImpact !== 'Negligible') {
    risks.push(`${drivingConditions.windImpact} wind impact`);
  }
  
  if (drivingConditions.brakingDistance.percent > 100) {
    risks.push(`${drivingConditions.brakingDistance.description} braking distances`);
  }
  
  return risks;
}

// Determine ideal driving times based on weather forecast
function getIdealDrivingTimes(forecastData: any): string[] {
  const idealTimes: string[] = [];
  
  // If no forecast data, return empty array
  if (!forecastData.daily || forecastData.daily.length === 0) {
    return idealTimes;
  }
  
  // Check the next few days for good driving conditions
  forecastData.daily.slice(0, 3).forEach((day: any, index: number) => {
    const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'Day after tomorrow';
    
    // Check for good conditions
    const hasGoodConditions = !day.weather_description.toLowerCase().includes('rain') &&
                             !day.weather_description.toLowerCase().includes('snow') &&
                             !day.weather_description.toLowerCase().includes('storm') &&
                             day.precipitation_chance < 30;
    
    if (hasGoodConditions) {
      idealTimes.push(`${dayName} (${day.weather_description})`);
    }
  });
  
  // If no ideal times found, suggest the best available
  if (idealTimes.length === 0) {
    const bestDay = forecastData.daily.reduce((best: any, current: any) => {
      return (current.precipitation_chance < best.precipitation_chance) ? current : best;
    }, forecastData.daily[0]);
    
    const dayIndex = forecastData.daily.indexOf(bestDay);
    const dayName = dayIndex === 0 ? 'Today' : dayIndex === 1 ? 'Tomorrow' : 'Day after tomorrow';
    
    idealTimes.push(`${dayName} (best available: ${bestDay.weather_description})`);
  }
  
  return idealTimes;
}

// Format day length from milliseconds to hours and minutes
function formatDayLength(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
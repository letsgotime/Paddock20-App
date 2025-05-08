import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { useLocationServices } from '@/contexts/LocationServicesContext';
import { CarFront, Droplets, Sun, Wind, Thermometer, AlertTriangle, Gauge, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface SurfaceCondition {
  temperature: number;
  condition: string;
}

interface SurfaceConditions {
  asphalt: SurfaceCondition;
  concrete: SurfaceCondition;
  gravel: SurfaceCondition;
}

interface DrivingRisk {
  overall: string;
  visibility: string;
  traction: string;
  score: number;
  index?: number;
  description?: string;
}

interface WashConditions {
  recommended: boolean;
  uv: string;
  pollen: string;
  drying: string;
  rainProbabilityNext24h: number;
}

interface DetailingConditions {
  recommended: boolean;
  humidity: string;
  temperature: string;
  wind: string;
  lighting: string;
}

interface AutomotiveWeatherData {
  locationKey: string;
  timestamp: number;
  surfaceConditions: SurfaceConditions;
  drivingRisk: DrivingRisk;
  washConditions: WashConditions;
  detailingConditions: DetailingConditions;
}

const AutomotiveWeatherPanel: React.FC = () => {
  const { weatherData, unit, selectedLocation } = useWeather();
  const [automotiveData, setAutomotiveData] = useState<AutomotiveWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track previous location to prevent unnecessary API calls
  const prevLocationRef = useRef<string | null>(null);
  const apiCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastApiCallRef = useRef<number>(0);

  // Fetch automotive weather data using OpenWeather API when coordinates change
  useEffect(() => {
    // Clean up any existing timeout to prevent memory leaks
    return () => {
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }
    };
  }, []);

  // We've moved to using the new LocationServicesContext as the primary 
  // source of data, including automotive weather data.
  // The useWeather() hook still works but will eventually be deprecated.
  
  // Import and use the LocationServicesContext
  const locationServices = useLocationServices();
  
  useEffect(() => {
    // Don't proceed if we don't have weather data
    if (!weatherData || !weatherData.coord) return;
    
    // Create a location key for tracking changes
    const locationKey = `${weatherData.coord.lat.toFixed(4)},${weatherData.coord.lon.toFixed(4)}`;
    
    // Check if this is the same location we already fetched data for
    if (prevLocationRef.current === locationKey) {
      return;
    }
    
    // Update previous location ref
    prevLocationRef.current = locationKey;
    
    // Rather than making a direct API call here, we'll use data from the LocationServicesContext
    // This prevents the API flooding issue by centralizing all weather data requests
    if (locationServices.automotiveWeather) {
      // If we already have data in the context, use it
      processAutomotiveData(locationServices.automotiveWeather);
    } else {
      // If no data is available in the context, trigger a refresh but don't make a direct API call
      // This will update all components that use the LocationServicesContext when complete
      console.log('No automotive weather data found in context, requesting refresh');
      locationServices.refreshWeather()
        .catch(err => {
          console.error('Failed to refresh weather data:', err);
          setError(new Error('Failed to load automotive weather data'));
        });
    }
  }, [weatherData, unit, selectedLocation, locationServices, locationServices.automotiveWeather]);
  
  // This function now processes data from the context rather than making API calls
  const processAutomotiveData = (automotiveData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Directly use the data from the context
      // Check if we have valid data structure
      if (!automotiveData || !automotiveData.current) {
        throw new Error('Invalid automotive weather data structure');
      }
      
      const current = automotiveData.current;
      const daily = automotiveData.daily?.[0];
      
      // Determine surface conditions based on weather
      const getCondition = () => {
        if (current.rain) return 'Wet';
        if (current.snow) return 'Snow';
        if (current.humidity > 90) return 'Damp';
        return 'Dry';
      };
      
      // Calculate surface temperatures (asphalt heats up more than air)
      const airTemp = current.temp;
      // Check for day/night based on data structure
      const isDaytime = current.dt > (automotiveData.sunrise || 0) && 
                       current.dt < (automotiveData.sunset || 0);
      const cloudCover = current.clouds;
      const uvIndex = current.uvi;
      
      // Surface temperature adjustments
      const sunEffect = isDaytime ? (100 - cloudCover) / 100 : 0;
      const asphaltTemp = airTemp + (sunEffect * 15); // Asphalt can be up to 15° warmer in full sun
      const concreteTemp = airTemp + (sunEffect * 10); // Concrete about 10° warmer
      const gravelTemp = airTemp + (sunEffect * 5);    // Gravel somewhat warmer
      
      // Create a synthetic automotive data object using OpenWeather data
      const condition = getCondition();
      // Create safe location key even if weatherData is null
      const locationKey = weatherData && weatherData.coord ? 
        `${weatherData.coord.lat},${weatherData.coord.lon}` : 
        `${locationServices.currentLocation?.lat || 0},${locationServices.currentLocation?.lon || 0}`;
        
      const formattedData: AutomotiveWeatherData = {
        locationKey,
        timestamp: current.dt,
        surfaceConditions: {
          asphalt: { temperature: asphaltTemp, condition },
          concrete: { temperature: concreteTemp, condition },
          gravel: { temperature: gravelTemp, condition }
        },
        drivingRisk: {
          overall: uvIndex > 8 ? 'High' : 
                  current.wind_speed > 30 ? 'Moderate' : 
                  condition !== 'Dry' ? 'Moderate' : 'Low',
          visibility: current.visibility > 9000 ? 'Good' : 
                    current.visibility > 5000 ? 'Moderate' : 'Poor',
          traction: condition === 'Dry' ? 'Good' : 
                   condition === 'Damp' ? 'Moderate' : 'Poor',
          score: condition === 'Dry' ? 2 : 
                condition === 'Damp' ? 5 : 8,
          description: `Weather conditions suggest ${condition.toLowerCase()} surfaces with ${current.weather[0].description}.`
        },
        washConditions: {
          recommended: !current.rain && !current.snow && current.humidity < 80,
          uv: uvIndex < 3 ? 'Low' : uvIndex < 6 ? 'Moderate' : 'High',
          pollen: 'Moderate', // OpenWeather doesn't provide pollen data
          drying: current.humidity < 60 ? 'Excellent' : 
                 current.humidity < 75 ? 'Good' : 'Fair',
          rainProbabilityNext24h: daily ? Math.round(daily.pop * 100) : 0
        },
        detailingConditions: {
          recommended: !current.rain && !current.snow && 
                       current.humidity < 70 && 
                       current.wind_speed < 15 &&
                       current.clouds > 30 && current.clouds < 80,
          humidity: `${current.humidity}%`,
          temperature: `${Math.round(current.temp)}${unit === 'metric' ? '°C' : '°F'}`,
          wind: `${Math.round(current.wind_speed)} ${unit === 'metric' ? 'm/s' : 'mph'}`,
          lighting: current.clouds > 30 && current.clouds < 80 ? 
                   'Good diffused light' : 
                   (current.clouds <= 30 ? 'Direct sunlight' : 'Overcast')
        }
      };
      
      setAutomotiveData(formattedData);
    } catch (err) {
      console.error('Error fetching automotive weather data:', err);
      setError(err as Error);
      // Only show toast on first error
      if (!error) {
        toast({
          title: 'Unable to load automotive weather data',
          description: 'Weather API error: ' + (err as Error).message,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-blue-900/40 shadow-lg p-6 animate-pulse">
        <h2 className="font-orbitron text-[#1982FC] text-xl mb-4">Loading Automotive Data...</h2>
        <div className="h-8 bg-gray-800/50 rounded mb-4"></div>
        <div className="h-8 bg-gray-800/50 rounded mb-4"></div>
        <div className="h-8 bg-gray-800/50 rounded"></div>
      </div>
    );
  }

  if (error || !automotiveData) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-blue-900/40 shadow-lg p-6">
        <h2 className="font-orbitron text-[#1982FC] text-xl mb-4 flex items-center">
          <CarFront className="mr-2 h-5 w-5" />
          Automotive Weather
        </h2>
        <div className="p-6 bg-black/50 backdrop-blur-sm rounded-lg text-center border border-red-900/30">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-200 font-medium">Unable to load automotive data</p>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            {error ? error.message : 'Data unavailable for this location'}
          </p>
        </div>
      </div>
    );
  }

  // Format temperature based on the selected unit
  const formatTemp = (temp: number) => {
    if (unit === 'metric') {
      // Convert from Fahrenheit to Celsius if needed
      return Math.round((temp - 32) * 5 / 9);
    }
    return Math.round(temp);
  };

  // Get appropriate styling for surface condition
  const getConditionStyle = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'dry':
        return 'text-green-400';
      case 'damp':
        return 'text-yellow-400';
      case 'wet':
      case 'rain':
      case 'drizzle':
        return 'text-blue-400';
      case 'snow':
      case 'ice':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  // Get appropriate styling for risk level
  const getRiskStyle = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'high':
        return 'text-orange-400';
      case 'severe':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  // Get appropriate styling for recommended/not recommended
  const getRecommendedStyle = (recommended: boolean) => {
    return recommended ? 'text-green-400' : 'text-red-400';
  };

  // Get appropriate styling for UV level
  const getUVStyle = (uv: string) => {
    switch (uv.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'high':
      case 'very high':
      case 'extreme':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const { surfaceConditions, drivingRisk, washConditions, detailingConditions } = automotiveData;
  const tempUnit = unit === 'metric' ? '°C' : '°F';

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-blue-900/40 shadow-lg p-6">
      <h2 className="font-orbitron text-[#1982FC] text-xl mb-4 flex items-center">
        <CarFront className="mr-2 h-5 w-5" />
        Automotive Weather Intelligence
      </h2>

      {/* Surface Temperatures Panel */}
      <div className="mb-6">
        <h3 className="text-gray-200 font-medium mb-3 flex items-center">
          <Thermometer className="mr-2 h-4 w-4 text-[#1982FC]" />
          Surface Temperatures
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800/50">
            <h4 className="text-sm text-gray-400 mb-1">Asphalt</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions.asphalt.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions.asphalt.condition)}`}>
              {surfaceConditions.asphalt.condition}
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800/50">
            <h4 className="text-sm text-gray-400 mb-1">Concrete</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions.concrete.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions.concrete.condition)}`}>
              {surfaceConditions.concrete.condition}
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800/50">
            <h4 className="text-sm text-gray-400 mb-1">Gravel</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions.gravel.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions.gravel.condition)}`}>
              {surfaceConditions.gravel.condition}
            </p>
          </div>
        </div>
      </div>

      {/* Driving Conditions Panel */}
      <div className="mb-6">
        <h3 className="text-gray-200 font-medium mb-3 flex items-center">
          <Shield className="mr-2 h-4 w-4 text-[#1982FC]" />
          Driving Conditions
        </h3>
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Overall Risk:</span>
            <span className={`font-medium ${getRiskStyle(drivingRisk.overall)}`}>
              {drivingRisk.overall}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Visibility:</span>
            <span className="font-medium">{drivingRisk.visibility}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Traction:</span>
            <span className="font-medium">{drivingRisk.traction}</span>
          </div>
          {drivingRisk.description && (
            <p className="text-sm text-gray-300 mt-2 italic border-l-2 border-[#1982FC]/30 pl-3">
              {drivingRisk.description}
            </p>
          )}
        </div>
      </div>

      {/* Car Care Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Car Wash Panel */}
        <div>
          <h3 className="text-gray-200 font-medium mb-3 flex items-center">
            <Droplets className="mr-2 h-4 w-4 text-[#1982FC]" />
            Wash Conditions
          </h3>
          <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800/50 h-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Recommended:</span>
              <span className={`font-medium ${getRecommendedStyle(washConditions.recommended)}`}>
                {washConditions.recommended ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">UV Impact:</span>
              <span className={`font-medium ${getUVStyle(washConditions.uv)}`}>
                {washConditions.uv}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Drying:</span>
              <span className="font-medium">{washConditions.drying}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rain Risk (24h):</span>
              <span className="font-medium">{washConditions.rainProbabilityNext24h}%</span>
            </div>
          </div>
        </div>

        {/* Detailing Panel */}
        <div>
          <h3 className="text-gray-200 font-medium mb-3 flex items-center">
            <Sun className="mr-2 h-4 w-4 text-[#1982FC]" />
            Detailing Conditions
          </h3>
          <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800/50 h-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Recommended:</span>
              <span className={`font-medium ${getRecommendedStyle(detailingConditions.recommended)}`}>
                {detailingConditions.recommended ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Humidity:</span>
              <span className="font-medium">{detailingConditions.humidity}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Wind:</span>
              <span className="font-medium">{detailingConditions.wind}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Lighting:</span>
              <span className="font-medium text-sm">{detailingConditions.lighting}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomotiveWeatherPanel;
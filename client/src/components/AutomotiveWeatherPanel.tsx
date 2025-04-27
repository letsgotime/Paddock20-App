import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { getLocationKey, fetchAutomotiveData } from '@/services/accuweatherService';
import { CarFront, Droplets, Sun, Wind, Thermometer, AlertTriangle, Gauge } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const { weatherData, unit } = useWeather();
  const [automotiveData, setAutomotiveData] = useState<AutomotiveWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch automotive weather data when coordinates change
  useEffect(() => {
    const fetchData = async () => {
      if (!weatherData || !weatherData.coord) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First get the AccuWeather location key
        try {
          const locationKeyData = await getLocationKey(
            weatherData.coord.lat, 
            weatherData.coord.lon
          );
          
          // Check if we have a valid location key response
          if (!locationKeyData) {
            throw new Error('No data received from AccuWeather location API');
          }
          
          // The response should be an object with a Key property
          const locationKey = typeof locationKeyData === 'object' && 
                             locationKeyData !== null && 
                             'Key' in locationKeyData ? 
                             String(locationKeyData.Key) : null;
          
          if (!locationKey) {
            throw new Error('Invalid location key format received from AccuWeather');
          }
          
          // Then get the automotive-specific data
          const data = await fetchAutomotiveData(locationKey);
          setAutomotiveData(data);
        } catch (locationErr) {
          console.error('Error fetching AccuWeather location key:', locationErr);
          
          // Since AccuWeather API is failing, use a fallback error message
          throw new Error('AccuWeather services currently unavailable');
        }
      } catch (err) {
        console.error('Error fetching automotive weather data:', err);
        setError(err as Error);
        toast({
          title: 'Unable to load automotive weather data',
          description: 'AccuWeather API services currently unavailable',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weatherData]);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Loading Automotive Weather Data...</h2>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (error || !automotiveData) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Automotive Weather Data</h2>
        <div className="p-4 bg-gray-950 rounded-lg text-center">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-300">Unable to load automotive weather data</p>
          <p className="text-sm text-gray-500 mt-2">
            {error ? error.message : 'Data unavailable for this location'}
          </p>
        </div>
      </div>
    );
  }

  // Format temperature based on the selected unit
  const formatTemp = (temp: number) => {
    if (unit === 'metric') {
      // Convert from Fahrenheit to Celsius
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
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="font-orbitron text-blue-400 text-xl mb-4 flex items-center">
        <CarFront className="mr-2 h-5 w-5" />
        Automotive Weather Conditions
      </h2>

      {/* Surface Temperatures Panel */}
      <div className="mb-6">
        <h3 className="text-gray-300 font-medium mb-3 flex items-center">
          <Thermometer className="mr-2 h-4 w-4" />
          Surface Temperatures
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Asphalt</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions.asphalt.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions.asphalt.condition)}`}>
              {surfaceConditions.asphalt.condition}
            </p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">Concrete</h4>
            <p className="text-xl font-semibold">
              {formatTemp(surfaceConditions.concrete.temperature)}{tempUnit}
            </p>
            <p className={`text-sm ${getConditionStyle(surfaceConditions.concrete.condition)}`}>
              {surfaceConditions.concrete.condition}
            </p>
          </div>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
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
        <h3 className="text-gray-300 font-medium mb-3 flex items-center">
          <Gauge className="mr-2 h-4 w-4" />
          Driving Conditions
        </h3>
        <div className="bg-black bg-opacity-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Overall Risk:</span>
            <span className={`font-medium ${getRiskStyle(drivingRisk.overall)}`}>
              {drivingRisk.overall}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Visibility:</span>
            <span className="font-medium">{drivingRisk.visibility}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Traction:</span>
            <span className="font-medium">{drivingRisk.traction}</span>
          </div>
          {drivingRisk.description && (
            <p className="text-sm text-gray-300 mt-2 italic">{drivingRisk.description}</p>
          )}
        </div>
      </div>

      {/* Car Care Panel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Car Wash Panel */}
        <div>
          <h3 className="text-gray-300 font-medium mb-3 flex items-center">
            <Droplets className="mr-2 h-4 w-4" />
            Wash Conditions
          </h3>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Recommended:</span>
              <span className={`font-medium ${getRecommendedStyle(washConditions.recommended)}`}>
                {washConditions.recommended ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">UV Impact:</span>
              <span className={`font-medium ${getUVStyle(washConditions.uv)}`}>
                {washConditions.uv}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
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
          <h3 className="text-gray-300 font-medium mb-3 flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            Detailing Conditions
          </h3>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Recommended:</span>
              <span className={`font-medium ${getRecommendedStyle(detailingConditions.recommended)}`}>
                {detailingConditions.recommended ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Humidity:</span>
              <span className="font-medium">{detailingConditions.humidity}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
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
import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { CarFront, Droplets, Sun, Wind, Thermometer, AlertTriangle, Gauge } from 'lucide-react';
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
  const { weatherData, unit } = useWeather();
  const [automotiveData, setAutomotiveData] = useState<AutomotiveWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch automotive weather data using OpenWeather API when coordinates change
  useEffect(() => {
    const fetchData = async () => {
      if (!weatherData || !weatherData.coord) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get data from our OpenWeather automotive endpoint
        const response = await axios.get('/api/automotive-weather', {
          params: {
            lat: weatherData.coord.lat,
            lon: weatherData.coord.lon
          }
        });
        
        if (!response.data) {
          throw new Error('No data received from OpenWeather API');
        }
        
        // Process the OpenWeather data to match our display format
        const openWeatherData = response.data;
        const current = openWeatherData.current;
        const daily = openWeatherData.daily?.[0];
        
        // Determine surface conditions based on weather
        const getCondition = () => {
          if (current.rain) return 'Wet';
          if (current.snow) return 'Snow';
          if (current.humidity > 90) return 'Damp';
          return 'Dry';
        };
        
        // Calculate surface temperatures (asphalt heats up more than air)
        const airTemp = current.temp;
        const isDaytime = current.dt > openWeatherData.current.sunrise && 
                         current.dt < openWeatherData.current.sunset;
        const cloudCover = current.clouds;
        const uvIndex = current.uvi;
        
        // Surface temperature adjustments
        const sunEffect = isDaytime ? (100 - cloudCover) / 100 : 0;
        const asphaltTemp = airTemp + (sunEffect * 15); // Asphalt can be up to 15° warmer in full sun
        const concreteTemp = airTemp + (sunEffect * 10); // Concrete about 10° warmer
        const gravelTemp = airTemp + (sunEffect * 5);    // Gravel somewhat warmer
        
        // Create a synthetic automotive data object using OpenWeather data
        const condition = getCondition();
        const formattedData: AutomotiveWeatherData = {
          locationKey: `${weatherData.coord.lat},${weatherData.coord.lon}`,
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
        toast({
          title: 'Unable to load automotive weather data',
          description: 'Weather API error: ' + (err as Error).message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weatherData, unit]);

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
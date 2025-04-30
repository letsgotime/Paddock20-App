import React, { useState, useEffect } from 'react';
import { Cloud, Wind, Droplets, Thermometer, RefreshCw, CornerDownRight } from 'lucide-react';

interface WeatherData {
  name?: string;
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: Array<{
    description?: string;
    icon?: string;
    main?: string;
  }>;
  wind?: {
    speed?: number;
    deg?: number;
  };
  visibility?: number;
  rain?: {
    '1h'?: number;
  };
  clouds?: {
    all?: number;
  };
}

interface OneCallData {
  current?: {
    uvi?: number;
    dew_point?: number;
  };
  hourly?: Array<{
    dt: number;
    temp: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number; // Probability of precipitation
  }>;
}

/**
 * Track Conditions Telemetry Component
 * 
 * F1-styled telemetry display for track conditions using real weather data
 */
const TrackConditionsTelemetry: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data on component mount
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch current weather
      const weatherResponse = await fetch('/api/weather');
      if (!weatherResponse.ok) {
        throw new Error('Could not fetch weather data');
      }
      
      const weatherResult = await weatherResponse.json();
      setWeatherData(weatherResult);
      
      // Fetch one call data (for UV index and hourly forecast)
      const oneCallResponse = await fetch('/api/onecall');
      if (!oneCallResponse.ok) {
        console.warn('Could not fetch one call data, continuing with basic weather');
      } else {
        const oneCallResult = await oneCallResponse.json();
        setOneCallData(oneCallResult);
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Unable to load track conditions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate chance of rain in the next 3 hours
  const calculateRainChance = (): number => {
    if (!oneCallData?.hourly || oneCallData.hourly.length === 0) return 0;
    
    // Take average of precipitation probability for next 3 hours
    const next3Hours = oneCallData.hourly.slice(0, 3);
    const avgProbability = next3Hours.reduce((sum, hour) => sum + hour.pop, 0) / next3Hours.length;
    return Math.round(avgProbability * 100);
  };

  // Get track condition status based on weather
  const getTrackCondition = (): 'dry' | 'damp' | 'wet' => {
    if (!weatherData) return 'dry';
    
    // Check for rain in the last hour
    const recentRain = weatherData.rain?.['1h'] ?? 0;
    
    // Check for rain-related weather conditions
    const isRainy = weatherData.weather?.some(w => 
      w.main?.toLowerCase().includes('rain') || 
      w.main?.toLowerCase().includes('drizzle')
    ) ?? false;
    
    if (recentRain > 1 || (isRainy && recentRain > 0)) {
      return 'wet';
    } else if (recentRain > 0 || isRainy) {
      return 'damp';
    }
    
    return 'dry';
  };

  // Get wind speed in km/h
  const getWindSpeed = (): number => {
    if (!weatherData?.wind?.speed) return 0;
    // Convert m/s to km/h
    return Math.round(weatherData.wind.speed * 3.6);
  };

  // Calculate track grip level (0-100%)
  const calculateGripLevel = (): number => {
    const trackCondition = getTrackCondition();
    const humidity = weatherData?.main?.humidity ?? 50;
    const temperature = weatherData?.main?.temp ?? 20;
    const windSpeed = getWindSpeed();
    
    // Base grip level depends on track condition
    let baseGrip = trackCondition === 'dry' ? 90 : trackCondition === 'damp' ? 65 : 40;
    
    // Adjust for temperature (optimum around 25-30°C/77-86°F)
    const tempFactor = Math.max(0, 100 - Math.abs(temperature - 28) * 2) / 100;
    
    // Adjust for humidity (lower is better for grip)
    const humidityFactor = Math.max(0, 100 - humidity) / 100;
    
    // Adjust for wind (some wind can help dry the track)
    const windFactor = Math.min(windSpeed, 20) / 20;
    
    // Calculate final grip level
    const gripLevel = baseGrip * 0.6 + 
                     (tempFactor * 20) + 
                     (humidityFactor * 10) +
                     (windFactor * 10);
    
    return Math.min(100, Math.max(0, Math.round(gripLevel)));
  };

  // Format wind direction as string
  const getWindDirection = (): string => {
    if (!weatherData?.wind?.deg) return 'N/A';
    
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((weatherData.wind.deg % 360) / 45)) % 8;
    return directions[index];
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded mb-4 w-2/3"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-gray-800 rounded"></div>
          <div className="h-12 bg-gray-800 rounded"></div>
          <div className="h-12 bg-gray-800 rounded"></div>
          <div className="h-12 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg shadow-lg">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchWeatherData}
          className="mt-2 text-red-400 hover:text-red-300 flex items-center"
        >
          <RefreshCw size={14} className="mr-1" /> Try again
        </button>
      </div>
    );
  }

  const trackCondition = getTrackCondition();
  const trackGrip = calculateGripLevel();
  const rainChance = calculateRainChance();
  const location = weatherData?.name || 'Unknown Location';
  const temperature = weatherData?.main?.temp ? Math.round(weatherData.main.temp) : 'N/A';
  const humidity = weatherData?.main?.humidity || 'N/A';
  const windSpeed = getWindSpeed();
  const windDirection = getWindDirection();
  
  return (
    <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg border border-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-blue-500 font-orbitron">TRACK CONDITIONS</h3>
          <p className="text-gray-400 text-sm">{location}</p>
        </div>
        <button 
          onClick={fetchWeatherData}
          aria-label="Refresh track conditions"
          className="text-gray-400 hover:text-blue-400 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {/* F1-style telemetry grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Track status */}
        <div className="bg-gray-800/50 rounded-lg p-3 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            trackCondition === 'dry' ? 'bg-green-500' : 
            trackCondition === 'damp' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <div>
            <p className="text-xs text-gray-400">TRACK STATUS</p>
            <p className="text-xl font-bold capitalize">{trackCondition}</p>
          </div>
        </div>
        
        {/* Grip level */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400">GRIP LEVEL</p>
          <div className="flex items-center">
            <p className="text-xl font-bold">{trackGrip}%</p>
            <div className="ml-2 flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  trackGrip > 75 ? 'bg-green-500' : 
                  trackGrip > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${trackGrip}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Temperature */}
        <div className="bg-gray-800/50 rounded-lg p-3 flex">
          <Thermometer className="text-blue-400 mr-2" size={24} />
          <div>
            <p className="text-xs text-gray-400">AIR TEMP</p>
            <p className="text-xl font-bold">{temperature}°F</p>
          </div>
        </div>
        
        {/* Humidity */}
        <div className="bg-gray-800/50 rounded-lg p-3 flex">
          <Droplets className="text-blue-400 mr-2" size={24} />
          <div>
            <p className="text-xs text-gray-400">HUMIDITY</p>
            <p className="text-xl font-bold">{humidity}%</p>
          </div>
        </div>
        
        {/* Wind */}
        <div className="bg-gray-800/50 rounded-lg p-3 flex">
          <Wind className="text-blue-400 mr-2" size={24} />
          <div>
            <p className="text-xs text-gray-400">WIND</p>
            <div className="flex items-center">
              <p className="text-xl font-bold">{windSpeed} km/h</p>
              <CornerDownRight 
                size={14} 
                className="ml-2 text-gray-400"
                style={{ transform: `rotate(${(weatherData?.wind?.deg || 0)}deg)` }}
              />
              <span className="text-gray-400 text-sm ml-1">{windDirection}</span>
            </div>
          </div>
        </div>
        
        {/* Rain chance */}
        <div className="bg-gray-800/50 rounded-lg p-3 flex">
          <Cloud className="text-blue-400 mr-2" size={24} />
          <div>
            <p className="text-xs text-gray-400">CHANCE OF RAIN</p>
            <div className="flex items-center">
              <p className="text-xl font-bold">{rainChance}%</p>
              <div className="ml-2 flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${rainChance}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackConditionsTelemetry;
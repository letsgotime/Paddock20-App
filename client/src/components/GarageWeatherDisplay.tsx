import React, { useState, useEffect } from 'react';
import { Cloud, Thermometer, Wind, Droplets, Clock, MapPin, SunMoon, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    region?: string;
    country?: string;
    lat: number;
    lon: number;
    timezone_id?: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
  forecast?: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: {
        time: string;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        chance_of_rain: number;
        chance_of_snow: number;
      }[];
    }[];
  };
}

interface VehicleTempSettings {
  idealAmbientTemp?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  idealTirePressure?: {
    cold: {
      frontLeft: number;
      frontRight: number;
      rearLeft: number;
      rearRight: number;
    };
    hot: {
      frontLeft: number;
      frontRight: number;
      rearLeft: number;
      rearRight: number;
    };
    unit: 'PSI' | 'Bar' | 'kPa';
  };
  recommendedOilTemp?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  weatherRecommendations?: {
    rain: string;
    snow: string;
    hot: string;
    cold: string;
    highWind: string;
  };
  temperatureImpact?: {
    performance: string;
    handling: string;
    range: string;
    batteryLife: string;
  };
}

interface GarageWeatherDisplayProps {
  vehicleId: string;
  location?: { lat: number; lon: number };
  tempSettings?: VehicleTempSettings;
  timeZones?: string[];
}

const GarageWeatherDisplay: React.FC<GarageWeatherDisplayProps> = ({ 
  vehicleId, 
  location, 
  tempSettings,
  timeZones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'UTC']
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [worldTimes, setWorldTimes] = useState<{timezone: string, time: string}[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Fetch weather data for the vehicle's location
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use OpenWeather API with the API key from environment
        const apiKey = import.meta.env.VITE_ACCUWEATHER_API_KEY || import.meta.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
          throw new Error('Weather API key is not configured');
        }
        
        const response = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
    
    // Set up an interval to refresh weather data every 30 minutes
    const interval = window.setInterval(fetchWeatherData, 30 * 60 * 1000);
    setRefreshInterval(interval);
    
    // Clean up the interval when the component unmounts
    return () => {
      if (refreshInterval) {
        window.clearInterval(refreshInterval);
      }
    };
  }, [location]);
  
  // Fetch world times for the selected time zones
  useEffect(() => {
    const fetchWorldTimes = async () => {
      try {
        const times = timeZones.map(timezone => {
          const now = new Date();
          const options: Intl.DateTimeFormatOptions = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          };
          
          return {
            timezone,
            time: now.toLocaleTimeString('en-US', options)
          };
        });
        
        setWorldTimes(times);
      } catch (err) {
        console.error('Error fetching world times:', err);
      }
    };
    
    fetchWorldTimes();
    
    // Set up an interval to refresh time data every minute
    const interval = window.setInterval(fetchWorldTimes, 60 * 1000);
    
    // Clean up the interval when the component unmounts
    return () => window.clearInterval(interval);
  }, [timeZones]);
  
  // Get weather icon based on condition code
  const getWeatherIcon = (code: number) => {
    // Map the weather condition code to the appropriate Lucide icon
    if (code >= 200 && code < 300) return <CloudLightning className="h-6 w-6 text-amber-400" />;
    if (code >= 300 && code < 600) return <CloudRain className="h-6 w-6 text-blue-400" />;
    if (code >= 600 && code < 700) return <CloudSnow className="h-6 w-6 text-blue-200" />;
    if (code >= 700 && code < 800) return <CloudFog className="h-6 w-6 text-gray-400" />;
    if (code === 800) return <Sun className="h-6 w-6 text-amber-400" />;
    if (code > 800) return <Cloud className="h-6 w-6 text-gray-400" />;
    
    return <Cloud className="h-6 w-6 text-gray-400" />;
  };
  
  // Check if the current weather conditions are within ideal parameters
  const getWeatherRecommendation = () => {
    if (!weatherData || !tempSettings) return null;
    
    const temp = weatherData.current.temp_c;
    const isRaining = weatherData.current.precip_mm > 0;
    const isSnowing = weatherData.current.temp_c <= 0 && weatherData.current.precip_mm > 0;
    const isWindy = weatherData.current.wind_kph > 40;
    const isHot = temp > 30;
    const isCold = temp < 5;
    
    if (isSnowing && tempSettings.weatherRecommendations?.snow) {
      return {
        message: tempSettings.weatherRecommendations.snow,
        type: 'warning'
      };
    }
    
    if (isRaining && tempSettings.weatherRecommendations?.rain) {
      return {
        message: tempSettings.weatherRecommendations.rain,
        type: 'warning'
      };
    }
    
    if (isWindy) {
      return {
        message: tempSettings.weatherRecommendations?.highWind || 'High winds may affect handling',
        type: 'warning'
      };
    }
    
    if (isHot && tempSettings.weatherRecommendations?.hot) {
      return {
        message: tempSettings.weatherRecommendations.hot,
        type: 'warning'
      };
    }
    
    if (isCold && tempSettings.weatherRecommendations?.cold) {
      return {
        message: tempSettings.weatherRecommendations.cold,
        type: 'warning'
      };
    }
    
    return {
      message: 'Current weather conditions are optimal for driving',
      type: 'success'
    };
  };
  
  // Calculate recommended tire pressure based on temperature
  const getAdjustedTirePressure = () => {
    if (!weatherData || !tempSettings?.idealTirePressure) return null;
    
    const temp = weatherData.current.temp_c;
    const basePressure = tempSettings.idealTirePressure.cold;
    
    // Simplified pressure adjustment: add 1 PSI for every 5.6°C (10°F) drop in temperature
    // from a baseline of 20°C (68°F)
    const tempDiff = 20 - temp;
    const pressureAdjustment = Math.round((tempDiff / 5.6) * 10) / 10;
    
    return {
      frontLeft: Math.max(basePressure.frontLeft + pressureAdjustment, basePressure.frontLeft),
      frontRight: Math.max(basePressure.frontRight + pressureAdjustment, basePressure.frontRight),
      rearLeft: Math.max(basePressure.rearLeft + pressureAdjustment, basePressure.rearLeft),
      rearRight: Math.max(basePressure.rearRight + pressureAdjustment, basePressure.rearRight)
    };
  };
  
  if (loading) {
    return (
      <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800 animate-pulse">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-gray-800 mr-2">
            <Cloud className="h-5 w-5 text-gray-600" />
          </div>
          <div className="h-6 w-32 bg-gray-800 rounded"></div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-24 bg-gray-800 rounded"></div>
          <div className="h-4 w-full bg-gray-800 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !weatherData) {
    return (
      <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-gray-800 mr-2">
            <Cloud className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300">Weather</h3>
        </div>
        
        <div className="text-gray-400 text-sm">
          {error || 'Weather data is not available'}
        </div>
      </div>
    );
  }
  
  const weatherRecommendation = getWeatherRecommendation();
  const adjustedTirePressure = getAdjustedTirePressure();
  
  return (
    <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-blue-900/30 mr-2">
            <Cloud className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-300">Real-Time Weather</h3>
        </div>
        <div className="text-xs text-gray-500">
          Updated at {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center mb-3">
            <div>
              {getWeatherIcon(weatherData.current.condition.code)}
            </div>
            <div className="ml-2">
              <div className="text-2xl font-semibold text-white">
                {weatherData.current.temp_c}°C / {weatherData.current.temp_f}°F
              </div>
              <div className="text-gray-400">
                {weatherData.current.condition.text}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-sm text-gray-400">
              <Wind className="h-4 w-4 mr-2" />
              <span>Wind: {weatherData.current.wind_kph} km/h {weatherData.current.wind_dir}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <Droplets className="h-4 w-4 mr-2" />
              <span>Humidity: {weatherData.current.humidity}%</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <Thermometer className="h-4 w-4 mr-2" />
              <span>Feels like: {weatherData.current.feelslike_c}°C / {weatherData.current.feelslike_f}°F</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{weatherData.location.name}, {weatherData.location.country}</span>
            </div>
          </div>
        </div>
        
        <div>
          {tempSettings && (
            <div className="bg-gray-900/60 rounded-lg p-3 mb-3 border border-gray-800">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Vehicle Weather Impact</h4>
              
              {weatherRecommendation && (
                <div className={`text-sm mb-2 ${
                  weatherRecommendation.type === 'success' ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {weatherRecommendation.message}
                </div>
              )}
              
              {adjustedTirePressure && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-400 mb-1">
                    Recommended Cold Tire Pressure (Current Temp):
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800/80 p-1.5 rounded">
                      FL: {adjustedTirePressure.frontLeft} {tempSettings.idealTirePressure?.unit || 'PSI'}
                    </div>
                    <div className="bg-gray-800/80 p-1.5 rounded">
                      FR: {adjustedTirePressure.frontRight} {tempSettings.idealTirePressure?.unit || 'PSI'}
                    </div>
                    <div className="bg-gray-800/80 p-1.5 rounded">
                      RL: {adjustedTirePressure.rearLeft} {tempSettings.idealTirePressure?.unit || 'PSI'}
                    </div>
                    <div className="bg-gray-800/80 p-1.5 rounded">
                      RR: {adjustedTirePressure.rearRight} {tempSettings.idealTirePressure?.unit || 'PSI'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {worldTimes.length > 0 && (
            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                World Time Zones
              </h4>
              
              <div className="space-y-1.5">
                {worldTimes.map((item) => (
                  <div key={item.timezone} className="flex justify-between text-xs">
                    <span className="text-gray-400">{formatTimeZoneName(item.timezone)}</span>
                    <span className="text-white">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format time zone names
const formatTimeZoneName = (timezone: string) => {
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace('_', ' ');
};

export default GarageWeatherDisplay;
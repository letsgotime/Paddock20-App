import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  Cloud,
  Droplets,
  Wind,
  Gauge,
  Thermometer,
  Compass,
  Sun,
  Umbrella
} from 'lucide-react';
import { format } from 'date-fns';
import WeatherIcon from './WeatherIcon';

export interface F1WeatherData {
  time: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  pressure: number;
  uvi: number;
  clouds: number;
  visibility: number;
  pop?: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
}

const F1WeatherDashboard: React.FC = () => {
  const { oneCallData, forecastData, weatherData, unit, selectedLocation } = useWeather();
  const [trackConditions, setTrackConditions] = useState<string>('Dry');
  const [hourlyForecast, setHourlyForecast] = useState<F1WeatherData[]>([]);
  
  useEffect(() => {
    if (oneCallData?.current) {
      // Determine track conditions based on weather data
      const currentWeather = oneCallData.current.weather[0];
      const rainConditions = [200, 201, 202, 230, 231, 232, 300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503, 504, 511, 520, 521, 522, 531];
      
      if (rainConditions.includes(currentWeather.id)) {
        setTrackConditions('Wet');
      } else if (currentWeather.id >= 700 && currentWeather.id < 800) {
        setTrackConditions('Hazardous');
      } else {
        setTrackConditions('Dry');
      }
      
      // Process hourly forecast data
      if (oneCallData.hourly) {
        const next6Hours = oneCallData.hourly.slice(0, 6).map(hour => {
          return {
            time: format(new Date(hour.dt * 1000), 'HH:mm'),
            temp: Math.round(hour.temp),
            feels_like: Math.round(hour.feels_like),
            humidity: hour.humidity,
            wind_speed: hour.wind_speed,
            wind_deg: hour.wind_deg,
            pressure: hour.pressure,
            uvi: hour.uvi,
            clouds: hour.clouds,
            visibility: hour.visibility,
            pop: hour.pop,
            weather: hour.weather
          };
        });
        setHourlyForecast(next6Hours);
      }
    }
  }, [oneCallData]);
  
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };
  
  const getTrackConditionColor = (condition: string): string => {
    switch (condition) {
      case 'Dry':
        return 'text-green-500';
      case 'Wet':
        return 'text-blue-500';
      case 'Hazardous':
        return 'text-red-500';
      default:
        return 'text-white';
    }
  };
  
  const getUVLevel = (uvi: number): string => {
    if (uvi <= 2) return 'Low';
    if (uvi <= 5) return 'Moderate';
    if (uvi <= 7) return 'High';
    if (uvi <= 10) return 'Very High';
    return 'Extreme';
  };
  
  const getUVColor = (uvi: number): string => {
    if (uvi <= 2) return 'text-green-400';
    if (uvi <= 5) return 'text-yellow-400';
    if (uvi <= 7) return 'text-orange-400';
    if (uvi <= 10) return 'text-red-400';
    return 'text-purple-400';
  };

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';
  
  if (!weatherData || !oneCallData) {
    return (
      <Card className="bg-gray-900 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center py-10">
            <p className="text-gray-400">Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 shadow-xl border-gray-800">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="apex-header-green mb-2">F1-STYLE TRACK CONDITIONS</h2>
          <p className="text-lg mb-4">
            <span className="font-bold">{selectedLocation?.name || 'Current Location'}</span>
          </p>
        </div>
        
        {/* Current Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Weather Overview */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-400 uppercase">Current Conditions</h3>
                <p className="text-3xl font-bold">{Math.round(oneCallData.current.temp)}{tempUnit}</p>
                <p className="text-sm text-gray-400">Feels like {Math.round(oneCallData.current.feels_like)}{tempUnit}</p>
                <p className="capitalize mt-1">{oneCallData.current.weather[0].description}</p>
              </div>
              <WeatherIcon iconCode={oneCallData.current.weather[0].icon} size={64} />
            </div>
          </div>
          
          {/* Track Status */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-sm text-gray-400 uppercase">Track Status</h3>
            <p className={`text-3xl font-bold ${getTrackConditionColor(trackConditions)}`}>
              {trackConditions}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <Cloud className="h-4 w-4 text-blue-400 mr-2" />
                <span>{oneCallData.current.clouds}% cloud cover</span>
              </div>
              <div className="flex items-center">
                <Umbrella className="h-4 w-4 text-blue-400 mr-2" />
                <span>{Math.round((hourlyForecast[0]?.pop || 0) * 100)}% precip. chance</span>
              </div>
            </div>
          </div>
          
          {/* Weather Details */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-sm text-gray-400 uppercase">Weather Details</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center">
                <Wind className="h-4 w-4 text-blue-400 mr-2" />
                <span>{Math.round(oneCallData.current.wind_speed)} {speedUnit}</span>
              </div>
              <div className="flex items-center">
                <Compass className="h-4 w-4 text-blue-400 mr-2" />
                <span>{getWindDirection(oneCallData.current.wind_deg)}</span>
              </div>
              <div className="flex items-center">
                <Droplets className="h-4 w-4 text-blue-400 mr-2" />
                <span>{oneCallData.current.humidity}% humidity</span>
              </div>
              <div className="flex items-center">
                <Gauge className="h-4 w-4 text-blue-400 mr-2" />
                <span>{oneCallData.current.pressure} hPa</span>
              </div>
              <div className="flex items-center">
                <Sun className="h-4 w-4 text-yellow-400 mr-2" />
                <span className={getUVColor(oneCallData.current.uvi)}>
                  UV: {getUVLevel(oneCallData.current.uvi)}
                </span>
              </div>
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 text-red-400 mr-2" />
                <span>
                  {Math.round(forecastData?.list[0].main.temp_min || 0)}{tempUnit} / {Math.round(forecastData?.list[0].main.temp_max || 0)}{tempUnit}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hourly Forecast */}
        <div>
          <h3 className="apex-header-gray mb-4">SESSION FORECAST</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {hourlyForecast.map((hour, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="font-mono">{hour.time}</p>
                <WeatherIcon iconCode={hour.weather[0].icon} size={36} />
                <p className="text-lg font-bold">{hour.temp}{tempUnit}</p>
                <p className="text-xs">{Math.round((hour.pop || 0) * 100)}% ☔</p>
                <div className="flex justify-center items-center text-xs mt-1">
                  <Wind className="h-3 w-3 mr-1" />
                  {Math.round(hour.wind_speed)} {speedUnit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default F1WeatherDashboard;
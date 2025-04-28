import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getWeatherData, 
  getOneCallData, 
  defaultLocation, 
  formatTemperature,
  formatTime,
  getWeatherIconUrl
} from '@/services/openWeatherService';

const HomeWeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [oneCallData, setOneCallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('imperial');

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch basic weather data
        const currentWeather = await getWeatherData(defaultLocation, unit);
        setWeatherData(currentWeather);
        
        // Fetch one-call data for additional details
        const oneCallResult = await getOneCallData(defaultLocation, unit);
        setOneCallData(oneCallResult);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching weather for home widget:', err);
        setError('Failed to load weather data');
        setIsLoading(false);
      }
    }
    
    fetchWeatherData();
    
    // Refresh weather data every 15 minutes
    const refreshInterval = setInterval(fetchWeatherData, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [unit]);

  // Calculate tire pressure recommendation based on temperature
  const getTirePressureRecommendation = (temp) => {
    if (!temp) return { front: '32-34', rear: '30-32' };
    
    // Adjust tire pressure based on temperature (simplified logic)
    if (temp < 40) {
      return { front: '33-35', rear: '31-33' }; // Cold weather
    } else if (temp > 85) {
      return { front: '30-32', rear: '28-30' }; // Hot weather
    } else {
      return { front: '32-34', rear: '30-32' }; // Moderate weather
    }
  };

  // Calculate torque setting recommendation based on conditions
  const getTorqueSettingRecommendation = (weather, temp) => {
    if (!weather || !temp) return '100%';
    
    const weatherType = weather.toLowerCase();
    
    if (weatherType.includes('rain') || weatherType.includes('drizzle')) {
      return '75-80%'; // Wet conditions
    } else if (weatherType.includes('snow') || temp < 32) {
      return '50-60%'; // Snow or freezing conditions
    } else if (temp > 90) {
      return '90-95%'; // Very hot conditions
    } else {
      return '100%'; // Ideal conditions
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gradient-to-r from-gray-900 to-black rounded-lg animate-pulse">
        <p className="text-blue-400 font-orbitron">Loading Weather Data...</p>
      </div>
    );
  }

  if (error || !weatherData || !oneCallData) {
    return (
      <div className="p-4 bg-gradient-to-r from-gray-900 to-black rounded-lg">
        <p className="text-blue-400 font-orbitron mb-1">Drive Weather</p>
        <p className="text-sm text-gray-400">Weather data temporarily unavailable</p>
        <Link to="/weather" className="text-green-500 text-xs hover:text-green-400">
          Visit Weather Hub &rarr;
        </Link>
      </div>
    );
  }

  const { name } = defaultLocation;
  const { main, weather, wind, sys } = weatherData;
  const current = oneCallData.current;
  
  // Calculate surface temperature (simplified estimate)
  const surfaceTemp = (main.temp * 0.9) + (current.uvi * 0.5);
  const tirePressure = getTirePressureRecommendation(main.temp);
  const torqueSetting = getTorqueSettingRecommendation(weather[0].main, main.temp);

  return (
    <div className="p-4 bg-gradient-to-r from-gray-900 to-black rounded-lg border border-gray-800">
      <div className="flex justify-between items-start mb-3">
        <p className="text-blue-400 font-orbitron">Paddock20™ Drive Weather</p>
        <Link to="/weather" className="text-green-500 text-xs hover:text-green-400">
          Full Details &rarr;
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Left column - Weather data */}
        <div>
          <div className="flex items-center mb-2">
            <div>
              <p className="text-white text-lg font-semibold">{formatTemperature(main.temp, unit)}</p>
              <p className="text-gray-400 text-xs capitalize">{weather[0].description}</p>
            </div>
            {weather[0].icon && (
              <img 
                src={getWeatherIconUrl(weather[0].icon)} 
                alt={weather[0].description}
                className="h-12 w-12 ml-2"
              />
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Surface Temp:</span>
              <span className="text-white">{formatTemperature(surfaceTemp, unit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Wind:</span>
              <span className="text-white">{Math.round(wind.speed)} {unit === 'imperial' ? 'mph' : 'm/s'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Humidity:</span>
              <span className="text-white">{main.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pressure:</span>
              <span className="text-white">{main.pressure} hPa</span>
            </div>
          </div>
        </div>
        
        {/* Right column - Sunrise/Sunset and Drive checklist */}
        <div>
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1">Sun Times</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400">↑ {formatTime(sys.sunrise)}</p>
              </div>
              <div>
                <p className="text-gray-400">↓ {formatTime(sys.sunset)}</p>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 text-xs mb-1">Fun Drive Checklist</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Torque Settings:</span>
                <span className="text-green-500">{torqueSetting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tire PSI (F):</span>
                <span className="text-green-500">{tirePressure.front} psi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tire PSI (R):</span>
                <span className="text-green-500">{tirePressure.rear} psi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
        <span>{name}</span>
        <span>Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    </div>
  );
};

export default HomeWeatherWidget;
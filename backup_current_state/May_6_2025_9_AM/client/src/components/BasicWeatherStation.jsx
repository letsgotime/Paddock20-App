import React, { useState, useEffect } from 'react';
import { 
  getWeatherData, 
  getOneCallData, 
  defaultLocation, 
  formatTemperature,
  formatTime,
  getWeatherIconUrl
} from '../services/openWeatherService';

const BasicWeatherStation = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [oneCallData, setOneCallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('imperial');
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch basic weather data
        const currentWeather = await getWeatherData(selectedLocation, unit);
        setWeatherData(currentWeather);
        
        // Fetch one-call data for additional details
        const oneCallResult = await getOneCallData(selectedLocation, unit);
        setOneCallData(oneCallResult);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Failed to load weather data. Please try again.');
        setIsLoading(false);
      }
    }
    
    fetchWeatherData();
  }, [selectedLocation, unit]);

  // Toggle between metric and imperial units
  const toggleUnit = () => {
    setUnit(prevUnit => prevUnit === 'imperial' ? 'metric' : 'imperial');
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
        <p className="text-blue-400 text-xl font-orbitron mb-4">Loading Weather Data...</p>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black border border-red-900/30">
        <p className="text-blue-400 text-xl font-orbitron mb-2">Weather Dashboard</p>
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ⟳ Try again
        </button>
      </div>
    );
  }

  if (!weatherData || !oneCallData) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
        <p className="text-blue-400 text-xl font-orbitron mb-2">Weather Dashboard</p>
        <p className="text-gray-400">No weather data available</p>
      </div>
    );
  }

  const { name } = selectedLocation;
  const { main, weather, wind, sys } = weatherData;
  const current = oneCallData.current;
  const daily = oneCallData.daily?.[0] || {};

  return (
    <div className="rounded-lg bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-blue-400 font-orbitron text-2xl flex items-center">
            <span>{name}</span>
            {weather[0].icon && (
              <img 
                src={getWeatherIconUrl(weather[0].icon)} 
                alt={weather[0].description}
                className="h-12 w-12 ml-2"
              />
            )}
          </h2>
          <p className="text-gray-300 capitalize">{weather[0].description}</p>
        </div>
        <button 
          onClick={toggleUnit}
          className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 transition-colors text-sm"
        >
          {unit === 'imperial' ? '°F' : '°C'} → {unit === 'imperial' ? '°C' : '°F'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="flex items-end">
              <span className="text-white text-4xl font-semibold">
                {formatTemperature(main.temp, unit)}
              </span>
              <span className="text-gray-400 ml-2 text-lg">
                feels like {formatTemperature(main.feels_like, unit)}
              </span>
            </div>
            <div className="text-gray-400 flex mt-1">
              <span className="mr-4">H: {formatTemperature(daily.temp?.max || main.temp_max, unit)}</span>
              <span>L: {formatTemperature(daily.temp?.min || main.temp_min, unit)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Humidity</p>
              <p className="text-white">{main.humidity}%</p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Wind</p>
              <p className="text-white">{Math.round(wind.speed)} {unit === 'imperial' ? 'mph' : 'm/s'}</p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Pressure</p>
              <p className="text-white">{main.pressure} hPa</p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Visibility</p>
              <p className="text-white">{(weatherData.visibility / 1000).toFixed(1)} km</p>
            </div>
          </div>
        </div>

        <div>
          <div className="p-4 bg-black/30 rounded-lg mb-4">
            <h3 className="text-blue-400 font-orbitron text-md mb-2">Surface Conditions</h3>
            <p className="text-white mb-2">🔥 Surface Temperature: {formatTemperature(main.feels_like, unit)}</p>
            <p className="text-gray-300 text-sm">
              The current conditions offer {getGripStatus(weather[0].main, main.humidity, wind.speed)} grip.
              {main.humidity > 70 ? ' Surface moisture may reduce traction.' : ''}
            </p>
          </div>

          <div className="p-4 bg-black/30 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Sunrise</span>
              <span className="text-white">{formatTime(sys.sunrise)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Sunset</span>
              <span className="text-white">{formatTime(sys.sunset)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Powered by OpenWeather API
        </p>
      </div>
    </div>
  );
};

// Helper function to determine grip status based on weather conditions
function getGripStatus(weatherMain, humidity, windSpeed) {
  const weatherLowerCase = weatherMain.toLowerCase();
  
  if (weatherLowerCase.includes('rain') || weatherLowerCase.includes('drizzle')) {
    return 'reduced';
  } else if (weatherLowerCase.includes('snow') || weatherLowerCase.includes('ice')) {
    return 'extremely poor';
  } else if (weatherLowerCase.includes('fog') || weatherLowerCase.includes('mist')) {
    return 'moderate';
  } else if (humidity > 80) {
    return 'slightly reduced';
  } else if (windSpeed > 20) {
    return 'variable';
  } else {
    return 'excellent';
  }
}

export default BasicWeatherStation;
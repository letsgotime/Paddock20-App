import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Snowflake, Wind } from 'lucide-react';
import { useWeather } from '@/contexts/WeatherContext';
import { Link } from 'react-router-dom';

const WeatherWidget = () => {
  const { weatherData, isLoading, error, unit } = useWeather();
  const [weatherIcon, setWeatherIcon] = useState<React.ReactNode>(<Cloud className="h-8 w-8 text-blue-400" />);

  useEffect(() => {
    if (weatherData?.weather && weatherData.weather[0]) {
      const weatherId = weatherData.weather[0].id;
      
      // Set icon based on weather condition code
      if (weatherId >= 200 && weatherId < 300) {
        // Thunderstorm
        setWeatherIcon(<CloudRain className="h-8 w-8 text-blue-400" />);
      } else if (weatherId >= 300 && weatherId < 600) {
        // Rain and drizzle
        setWeatherIcon(<CloudRain className="h-8 w-8 text-blue-400" />);
      } else if (weatherId >= 600 && weatherId < 700) {
        // Snow
        setWeatherIcon(<Snowflake className="h-8 w-8 text-blue-400" />);
      } else if (weatherId >= 700 && weatherId < 800) {
        // Atmosphere (fog, mist, etc)
        setWeatherIcon(<Wind className="h-8 w-8 text-blue-400" />);
      } else if (weatherId === 800) {
        // Clear sky
        setWeatherIcon(<Sun className="h-8 w-8 text-yellow-400" />);
      } else {
        // Clouds
        setWeatherIcon(<Cloud className="h-8 w-8 text-blue-400" />);
      }
    }
  }, [weatherData]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 h-full">
        <h3 className="font-orbitron text-lg text-blue-500 mb-3">Current Weather</h3>
        <p className="text-red-400">Unable to load weather data</p>
        <Link to="/weather" className="text-green-500 text-sm hover:underline mt-4 inline-block">
          View full weather
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 h-full">
      <h3 className="font-orbitron text-lg text-blue-500 mb-3">Current Weather</h3>
      
      {weatherData ? (
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            {weatherIcon}
            <div className="ml-3">
              <p className="text-xl font-medium">
                {Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
              </p>
              <p className="text-gray-400 capitalize">
                {weatherData.weather[0].description}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div>
              <p className="text-gray-400">Humidity</p>
              <p>{weatherData.main.humidity}%</p>
            </div>
            <div>
              <p className="text-gray-400">Wind Speed</p>
              <p>{weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-1">Driving Conditions</p>
            <div className={`inline-block px-2 py-1 rounded text-xs ${
              weatherData.weather[0].id >= 300 && weatherData.weather[0].id < 800 ? 
              'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
            }`}>
              {weatherData.weather[0].id >= 300 && weatherData.weather[0].id < 800 ? 
                'Use Caution' : 'Favorable'}
            </div>
          </div>

          <Link to="/weather" className="text-green-500 text-sm hover:underline mt-4 inline-block">
            View full weather
          </Link>
        </div>
      ) : (
        <p className="text-gray-400">No weather data available</p>
      )}
    </div>
  );
};

export default WeatherWidget;
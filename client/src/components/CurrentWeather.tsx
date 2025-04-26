import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { MapPin, Thermometer, Droplets, Wind, Gauge } from 'lucide-react';

const CurrentWeather: React.FC = () => {
  const { weatherData, selectedLocation, unit } = useWeather();

  if (!weatherData || !selectedLocation) return null;

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Temperature unit symbol
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="flex items-center mb-4 md:mb-0">
          <MapPin className="text-yellow-400 h-8 w-8 mr-3" />
          <div>
            <h2 className="text-2xl font-orbitron text-white">{selectedLocation.name}</h2>
            <p className="text-gray-400">{currentDate}</p>
          </div>
        </div>
        <div className="flex items-center">
          <img 
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
            className="w-16 h-16"
          />
          <div className="text-center">
            <div className="text-4xl font-medium">{Math.round(weatherData.main.temp)}{tempUnit}</div>
            <div className="text-gray-400 capitalize">{weatherData.weather[0].description}</div>
          </div>
        </div>
      </div>

      {/* Current Weather Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-black rounded-lg p-4 flex flex-col items-center">
          <Thermometer className="text-blue-400 h-6 w-6 mb-2" />
          <div className="text-sm text-gray-400">Feels Like</div>
          <div className="text-xl font-medium">{Math.round(weatherData.main.feels_like)}{tempUnit}</div>
        </div>
        <div className="bg-black rounded-lg p-4 flex flex-col items-center">
          <Droplets className="text-blue-400 h-6 w-6 mb-2" />
          <div className="text-sm text-gray-400">Humidity</div>
          <div className="text-xl font-medium">{weatherData.main.humidity}%</div>
        </div>
        <div className="bg-black rounded-lg p-4 flex flex-col items-center">
          <Wind className="text-blue-400 h-6 w-6 mb-2" />
          <div className="text-sm text-gray-400">Wind</div>
          <div className="text-xl font-medium">{weatherData.wind.speed} {speedUnit}</div>
        </div>
        <div className="bg-black rounded-lg p-4 flex flex-col items-center">
          <Gauge className="text-blue-400 h-6 w-6 mb-2" />
          <div className="text-sm text-gray-400">Pressure</div>
          <div className="text-xl font-medium">{weatherData.main.pressure} hPa</div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;

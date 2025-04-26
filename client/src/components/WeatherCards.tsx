import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Thermometer, Droplets, Wind, Sunrise, Sunset, Waves } from 'lucide-react';

const WeatherCards: React.FC = () => {
  const { weatherData, unit } = useWeather();

  if (!weatherData) return null;

  // Temperature unit symbol
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';
  
  // Calculate surface temperature (approximation)
  const surfaceTemp = (weatherData.main.temp + 3).toFixed(1);
  
  // Format sunrise and sunset times
  const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const sunsetTime = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Calculate daylight duration
  const daylightDuration = (() => {
    const durationMs = (weatherData.sys.sunset - weatherData.sys.sunrise) * 1000;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  })();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Air Temperature Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-transform hover:translate-y-[-5px]">
        <div className="bg-blue-500 bg-opacity-20 px-6 py-3">
          <h3 className="text-blue-400 font-orbitron text-lg">Air Temperature</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Thermometer className="text-yellow-400 h-10 w-10" />
            <div className="text-right">
              <div className="text-4xl font-medium">{weatherData.main.temp.toFixed(1)}{tempUnit}</div>
              <div className="text-gray-400 text-sm">Current Reading</div>
            </div>
          </div>
          <div className="mt-6 text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Min</span>
              <span className="font-medium">{weatherData.main.temp_min.toFixed(1)}{tempUnit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Max</span>
              <span className="font-medium">{weatherData.main.temp_max.toFixed(1)}{tempUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Surface Temperature Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-transform hover:translate-y-[-5px]">
        <div className="bg-teal-500 bg-opacity-20 px-6 py-3">
          <h3 className="text-teal-400 font-orbitron text-lg">Surface Temperature</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Waves className="text-teal-400 h-10 w-10" />
            <div className="text-right">
              <div className="text-4xl font-medium">{surfaceTemp}{tempUnit}</div>
              <div className="text-gray-400 text-sm">Estimated</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="text-sm text-gray-400 mb-2">Surface temperatures are typically 2-4°C higher than air temperature during daylight hours.</div>
            <div className="flex items-center text-yellow-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Road surface estimation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Humidity Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-transform hover:translate-y-[-5px]">
        <div className="bg-blue-500 bg-opacity-20 px-6 py-3">
          <h3 className="text-blue-400 font-orbitron text-lg">Humidity</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Droplets className="text-yellow-400 h-10 w-10" />
            <div className="text-right">
              <div className="text-4xl font-medium">{weatherData.main.humidity}%</div>
              <div className="text-gray-400 text-sm">Current Reading</div>
            </div>
          </div>
          <div className="mt-6">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-black">
                <div 
                  style={{ width: `${weatherData.main.humidity}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Comfort level: <span className="text-white">
                {weatherData.main.humidity < 30 ? 'Dry' : weatherData.main.humidity > 70 ? 'Humid' : 'Moderate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wind Speed Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-transform hover:translate-y-[-5px]">
        <div className="bg-teal-500 bg-opacity-20 px-6 py-3">
          <h3 className="text-teal-400 font-orbitron text-lg">Wind Speed</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Wind className="text-teal-400 h-10 w-10" />
            <div className="text-right">
              <div className="text-4xl font-medium">{weatherData.wind.speed} {speedUnit}</div>
              <div className="flex items-center justify-end text-gray-400 text-sm">
                <svg
                  className="h-4 w-4 transform"
                  style={{ rotate: `${weatherData.wind.deg}deg` }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span className="ml-1">
                  {(() => {
                    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                    const index = Math.round(weatherData.wind.deg / 45) % 8;
                    return directions[index];
                  })()}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-gray-400">Wind Gusts:</span>
              <span className="font-medium">{weatherData.wind.gust ? `${weatherData.wind.gust} ${speedUnit}` : 'N/A'}</span>
            </div>
            <div className="text-sm text-gray-400">
              Beaufort Scale: <span className="text-white">
                {(() => {
                  const speed = weatherData.wind.speed;
                  if (speed < 0.5) return 'Calm';
                  if (speed < 1.5) return 'Light Air';
                  if (speed < 3.3) return 'Light Breeze';
                  if (speed < 5.5) return 'Gentle Breeze';
                  if (speed < 7.9) return 'Moderate Breeze';
                  if (speed < 10.7) return 'Fresh Breeze';
                  if (speed < 13.8) return 'Strong Breeze';
                  if (speed < 17.1) return 'Near Gale';
                  if (speed < 20.7) return 'Gale';
                  if (speed < 24.4) return 'Strong Gale';
                  if (speed < 28.4) return 'Storm';
                  if (speed < 32.6) return 'Violent Storm';
                  return 'Hurricane';
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sunrise/Sunset Card */}
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-transform hover:translate-y-[-5px]">
        <div className="bg-blue-500 bg-opacity-20 px-6 py-3">
          <h3 className="text-blue-400 font-orbitron text-lg">Sun Cycle</h3>
        </div>
        <div className="p-6">
          <div className="flex justify-around mb-4">
            <div className="text-center">
              <Sunrise className="text-yellow-400 h-6 w-6 mx-auto" />
              <div className="mt-2">
                <div className="text-xl font-medium">{sunriseTime}</div>
                <div className="text-xs text-gray-400">Sunrise</div>
              </div>
            </div>
            <div className="text-center">
              <Sunset className="text-yellow-400 h-6 w-6 mx-auto" />
              <div className="mt-2">
                <div className="text-xl font-medium">{sunsetTime}</div>
                <div className="text-xs text-gray-400">Sunset</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-1">Daylight Duration:</div>
            <div className="text-lg font-medium">{daylightDuration}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCards;

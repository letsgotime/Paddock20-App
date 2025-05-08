import React from 'react';
import { useWeather } from '@/contexts/ConsolidatedWeatherContext';

const HourlyForecast: React.FC = () => {
  const { forecastData, unit } = useWeather();

  if (!forecastData || !forecastData.list) return null;

  // Get hourly forecast for the next 24 hours
  const hourlyForecast = forecastData.list.slice(0, 8);

  // Temperature unit symbol
  const tempUnit = unit === 'metric' ? '°C' : '°F';

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg mb-8">
      <h3 className="text-xl font-orbitron text-blue-400 mb-4">24 Hour Forecast</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4 min-w-max">
          {hourlyForecast.map((hour, index) => {
            const date = new Date(hour.dt * 1000);
            const time = date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              hour12: true
            });
            
            return (
              <div key={index} className="bg-black rounded-lg p-3 text-center w-24 transition-transform hover:translate-y-[-5px]">
                <div className="text-sm text-gray-400">{time}</div>
                <img 
                  src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                  alt={hour.weather[0].description}
                  className="w-12 h-12 mx-auto my-1"
                />
                <div className="font-medium">{Math.round(hour.main.temp)}{tempUnit}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;

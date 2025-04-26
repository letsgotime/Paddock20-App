import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import WeatherIcon from './WeatherIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const FiveDayForecast: React.FC = () => {
  const { forecastData, unit } = useWeather();

  if (!forecastData) return null;

  // Process forecast data to get daily forecasts (OpenWeatherMap forecast data is in 3-hour intervals)
  const getDailyForecasts = () => {
    // Group forecast items by day
    const dailyData: Record<string, any[]> = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = format(date, 'yyyy-MM-dd');
      
      if (!dailyData[day]) {
        dailyData[day] = [];
      }
      
      dailyData[day].push(item);
    });
    
    // Get one forecast per day (noon forecast when available)
    const dailyForecasts = Object.keys(dailyData).map(day => {
      const dayData = dailyData[day];
      
      // Try to get forecast closest to noon for the day
      const noonForecast = dayData.reduce((closest, current) => {
        const currentDate = new Date(current.dt * 1000);
        const currentHour = currentDate.getHours();
        const closestDate = new Date(closest.dt * 1000);
        const closestHour = closestDate.getHours();
        
        // Get the item closest to noon (12:00)
        return Math.abs(currentHour - 12) < Math.abs(closestHour - 12) ? current : closest;
      });
      
      return {
        day,
        forecast: noonForecast
      };
    });
    
    // Return only the next 5 days
    return dailyForecasts.slice(0, 5);
  };

  const dailyForecasts = getDailyForecasts();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {dailyForecasts.map(({ day, forecast }) => {
          const date = new Date(forecast.dt * 1000);
          const dayName = format(date, 'EEEE'); // Monday, Tuesday, etc.
          const formattedDate = format(date, 'MMM d'); // Jan 1, Feb 2, etc.
          const tempUnit = unit === 'metric' ? '°C' : '°F';
          
          return (
            <Card key={day} className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-medium">{dayName}</CardTitle>
                <p className="text-center text-sm text-gray-400">{formattedDate}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <WeatherIcon 
                    iconCode={forecast.weather[0].icon} 
                    description={forecast.weather[0].description}
                    size={48}
                    className="text-blue-400 mb-2"
                  />
                  <div className="mt-2 text-center">
                    <p className="text-xl font-bold">{Math.round(forecast.main.temp)}{tempUnit}</p>
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>H: {Math.round(forecast.main.temp_max)}{tempUnit}</span>
                      <span className="mx-1">|</span>
                      <span>L: {Math.round(forecast.main.temp_min)}{tempUnit}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 w-full text-center text-xs">
                    <div className="bg-gray-800 rounded p-1">
                      <span className="block text-gray-400">Humidity</span>
                      <span>{forecast.main.humidity}%</span>
                    </div>
                    <div className="bg-gray-800 rounded p-1">
                      <span className="block text-gray-400">Wind</span>
                      <span>{forecast.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FiveDayForecast;
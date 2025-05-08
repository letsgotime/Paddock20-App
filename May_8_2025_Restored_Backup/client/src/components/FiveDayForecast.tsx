import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { format } from 'date-fns';

const FiveDayForecast: React.FC = () => {
  const { oneCallData, unit } = useWeather();
  
  if (!oneCallData || !oneCallData.daily) return null;

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  
  // Process OneCall API data to get daily forecasts
  const getDailyForecasts = () => {
    return oneCallData.daily?.slice(0, 5).map(day => {
      return {
        date: new Date(day.dt * 1000),
        minTemp: day.temp.min,
        maxTemp: day.temp.max,
        icon: day.weather[0].icon,
        description: day.weather[0].description,
        humidity: day.humidity,
        windSpeed: day.wind_speed,
        pop: day.pop,
        uvi: day.uvi
      };
    }) || [];
  };
  
  const dailyForecasts = getDailyForecasts();

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CalendarDays className="text-blue-400 mr-2 h-5 w-5" />
          <CardTitle>5-Day Forecast</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 divide-y divide-gray-800">
          {dailyForecasts.map((forecast, index) => (
            <div 
              key={index} 
              className="py-3 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-24">
                  <div className="font-medium">
                    {format(forecast.date, 'EEE')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {format(forecast.date, 'MMM d')}
                  </div>
                </div>
                <div className="flex items-center">
                  <WeatherIcon 
                    iconCode={forecast.icon} 
                    size={36} 
                    className="text-blue-400" 
                  />
                  <div className="ml-2 capitalize text-sm">
                    {forecast.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">{Math.round(forecast.maxTemp)}{tempUnit}</div>
                  <div className="text-sm text-gray-400">{Math.round(forecast.minTemp)}{tempUnit}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FiveDayForecast;
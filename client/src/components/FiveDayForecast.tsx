import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { format } from 'date-fns';

const FiveDayForecast: React.FC = () => {
  const { forecastData, unit } = useWeather();
  
  if (!forecastData) return null;

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  
  // Process forecast data to get daily forecasts
  // We need to group by day and get min/max temps for each day
  const getDailyForecasts = () => {
    const dailyData: {
      [key: string]: {
        date: Date;
        minTemp: number;
        maxTemp: number;
        icon: string;
        description: string;
        humidity: number;
        windSpeed: number;
      }
    } = {};
    
    // Group by day
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = format(date, 'yyyy-MM-dd');
      
      if (!dailyData[day]) {
        dailyData[day] = {
          date,
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        };
      } else {
        // Update min/max temperatures
        dailyData[day].minTemp = Math.min(dailyData[day].minTemp, item.main.temp_min);
        dailyData[day].maxTemp = Math.max(dailyData[day].maxTemp, item.main.temp_max);
        
        // Update icon to prefer daytime icons (those without 'n' suffix)
        if (!item.weather[0].icon.includes('n')) {
          dailyData[day].icon = item.weather[0].icon;
          dailyData[day].description = item.weather[0].description;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.values(dailyData)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5); // Get 5 days
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
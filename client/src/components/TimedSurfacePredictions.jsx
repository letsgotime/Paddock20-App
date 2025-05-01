import React from 'react';
import { useWeather } from '../contexts/WeatherContext';

/**
 * TimedSurfacePredictions - Shows how surface conditions will change over time
 * Forecasts how grip, temperature, and other conditions will evolve over the next few hours
 */
function TimedSurfacePredictions() {
  const { weatherData } = useWeather();
  
  if (!weatherData || !weatherData.hourly) {
    return null;
  }
  
  const { hourly, roadConditions = {} } = weatherData;
  
  // Only use next 6 hours for the forecast
  const nextHours = hourly.slice(0, 6);
  
  // Get the current grip level to use as a baseline
  const currentGripLevel = roadConditions.surface_grip || 'Good';
  
  // Generate grip forecast based on weather conditions for each hour
  const hourlyGripForecast = nextHours.map((hour, index) => {
    const conditions = hour.weather?.[0];
    const pop = hour.pop || 0; // Probability of precipitation
    const temp = hour.temp || 0;
    
    // Start with the current grip level
    let gripLevel = currentGripLevel;
    let gripTrend = 'stable';
    
    // Determine grip change based on weather conditions
    if (conditions && conditions.id) {
      // Rain/Snow conditions (200-699) reduce grip
      if (conditions.id >= 200 && conditions.id < 700) {
        if (pop >= 0.7) {
          gripLevel = 'Poor';
          gripTrend = 'decreasing';
        } else if (pop >= 0.4) {
          gripLevel = 'Reduced';
          gripTrend = 'decreasing';
        } else if (pop >= 0.2) {
          gripLevel = 'Fair';
          gripTrend = 'decreasing';
        }
      }
      // Fog/mist (700-799) slightly reduces grip
      else if (conditions.id >= 700 && conditions.id < 800) {
        if (gripLevel === 'Excellent') {
          gripLevel = 'Good';
          gripTrend = 'decreasing';
        } else if (gripLevel === 'Good') {
          gripLevel = 'Fair';
          gripTrend = 'decreasing';
        }
      }
      // Clear sky (800) improves grip over time if temperature is moderate
      else if (conditions.id === 800) {
        if (temp > 40 && temp < 100) {
          // Improvement happens gradually over time
          if (index > 0 && index < 3 && gripLevel === 'Fair') {
            gripLevel = 'Good';
            gripTrend = 'increasing';
          } else if (index >= 3 && gripLevel === 'Good') {
            gripLevel = 'Excellent';
            gripTrend = 'increasing';
          }
        }
      }
    }
    
    // If temperature is extreme, it affects grip
    if (temp > 100) {
      gripLevel = 'Reduced';
      gripTrend = 'decreasing';
    } else if (temp < 32) {
      gripLevel = 'Poor';
      gripTrend = 'decreasing';
    }
    
    // Format the timestamp
    const timestamp = new Date(hour.dt * 1000);
    const timeString = timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    return {
      time: timeString,
      timestamp,
      temperature: temp,
      conditions: conditions?.main || 'Clear',
      precipitation: pop * 100,
      gripLevel,
      gripTrend
    };
  });
  
  // Get class name for grip level
  const getGripLevelClass = (level) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-400';
      case 'reduced': return 'text-orange-400';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };
  
  // Get icon for grip trend
  const getGripTrendIcon = (trend) => {
    switch (trend.toLowerCase()) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      case 'stable': return '➡️';
      default: return '•';
    }
  };
  
  // Get icon for weather condition
  const getConditionIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'thunderstorm': return '⛈️';
      case 'drizzle':
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog': return '🌫️';
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      default: return '🌤️';
    }
  };

  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
        <span className="h-2 w-2 bg-cyan-500 rounded-full mr-2"></span>
        SURFACE CONDITION FORECAST
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full mb-3">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 text-left text-xs font-medium text-gray-400">Time</th>
              <th className="py-2 text-center text-xs font-medium text-gray-400">Weather</th>
              <th className="py-2 text-center text-xs font-medium text-gray-400">Temp</th>
              <th className="py-2 text-center text-xs font-medium text-gray-400">Precip</th>
              <th className="py-2 text-left text-xs font-medium text-gray-400">Grip Level</th>
              <th className="py-2 text-center text-xs font-medium text-gray-400">Trend</th>
            </tr>
          </thead>
          <tbody>
            {hourlyGripForecast.map((forecast, index) => (
              <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-3 pl-2 text-sm">{forecast.time}</td>
                <td className="py-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{getConditionIcon(forecast.conditions)}</span>
                    <span className="text-xs mt-1">{forecast.conditions}</span>
                  </div>
                </td>
                <td className="py-3 text-center font-medium">
                  {Math.round(forecast.temperature)}°F
                </td>
                <td className="py-3 text-center">
                  <span className={`text-sm ${forecast.precipitation > 50 ? 'text-blue-400' : 'text-gray-400'}`}>
                    {Math.round(forecast.precipitation)}%
                  </span>
                </td>
                <td className="py-3 text-sm font-medium">
                  <span className={getGripLevelClass(forecast.gripLevel)}>
                    {forecast.gripLevel}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-sm mr-1">{getGripTrendIcon(forecast.gripTrend)}</span>
                    <span className="text-xs capitalize">{forecast.gripTrend}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-900/60 rounded-md p-3 mt-3">
        <h4 className="text-xs font-medium text-blue-400 mb-2">Surface Analysis</h4>
        <p className="text-xs text-gray-300 mb-2">
          The forecast above shows how driving conditions will evolve over the next few hours. Pay attention to grip level changes when planning your drive.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/80 rounded p-2">
            <span className="font-medium text-green-400">Best Time to Drive: </span>
            {hourlyGripForecast.some(f => f.gripLevel === 'Excellent') ? (
              <span>Windows of excellent grip available</span>
            ) : hourlyGripForecast.some(f => f.gripLevel === 'Good') ? (
              <span>Good conditions available</span>
            ) : (
              <span className="text-yellow-400">Challenging conditions throughout</span>
            )}
          </div>
          <div className="bg-gray-800/80 rounded p-2">
            <span className="font-medium text-purple-400">Surface Note: </span>
            {hourlyGripForecast.some(f => f.gripTrend === 'decreasing' && (f.gripLevel === 'Reduced' || f.gripLevel === 'Poor')) ? (
              <span className="text-yellow-400">Watch for deteriorating conditions</span>
            ) : hourlyGripForecast.some(f => f.gripTrend === 'increasing') ? (
              <span className="text-green-400">Conditions improving over time</span>
            ) : (
              <span>Stable conditions expected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimedSurfacePredictions;
import React, { useState } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

/**
 * TimedSurfacePredictions - Shows how surface conditions will change over time
 * Forecasts how grip, temperature, and other conditions will evolve over the next few hours
 */
function TimedSurfacePredictions() {
  const { weatherData } = useWeather();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  // Full-screen styles to be applied conditionally
  const fullscreenStyles = isFullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 50,
    overflowY: 'auto',
    borderRadius: 0,
    padding: '1.5rem'
  } : {};

  return (
    <div 
      className={`bg-gray-800/80 rounded-lg border border-gray-700 p-4 transition-all duration-300 ${isFullscreen ? 'bg-gray-900' : ''}`}
      style={fullscreenStyles}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-cyan-500 rounded-full mr-2"></span>
          SURFACE CONDITION FORECAST
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      {/* Preview/collapsed view */}
      {!isExpanded && !isFullscreen && (
        <div className="cursor-pointer" onClick={() => setIsExpanded(true)}>
          <div className="bg-gray-900/60 rounded-md p-3 mb-3">
            <p className="text-sm mb-2">
              Surface conditions forecast for the next 6 hours
            </p>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400">Current Grip Level:</span>
                <span className={`ml-1 ${getGripLevelClass(currentGripLevel)}`}>{currentGripLevel}</span>
              </div>
              
              <div>
                <span className="text-xs text-gray-400">Trend:</span>
                <span className={`ml-1 ${hourlyGripForecast.some(f => f.gripTrend === 'decreasing') ? 'text-orange-400' : 'text-green-400'}`}>
                  {hourlyGripForecast.some(f => f.gripTrend === 'decreasing' && (f.gripLevel === 'Reduced' || f.gripLevel === 'Poor')) 
                    ? 'Deteriorating' 
                    : hourlyGripForecast.some(f => f.gripTrend === 'increasing') 
                      ? 'Improving' 
                      : 'Stable'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-blue-400 hover:text-blue-300">
            Click to view detailed surface condition forecast
          </div>
        </div>
      )}
      
      {/* Expanded or fullscreen view */}
      {(isExpanded || isFullscreen) && (
        <>
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
            
            {isFullscreen && (
              <div className="mt-5">
                <h4 className="text-sm font-medium text-blue-400 mb-3">Extended Surface Analysis</h4>
                
                <div className="bg-gray-800/80 rounded-md p-3">
                  <h5 className="text-xs font-medium text-white mb-2">Comparative Surface Evolution</h5>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-xs text-gray-400 mb-1">Start of Period</div>
                      <div className="flex items-center">
                        <span className={`font-medium ${getGripLevelClass(hourlyGripForecast[0].gripLevel)}`}>
                          {hourlyGripForecast[0].gripLevel}
                        </span>
                        <span className="text-gray-400 mx-2">at</span>
                        <span>{hourlyGripForecast[0].time}</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-xs text-gray-400 mb-1">Mid Period</div>
                      <div className="flex items-center">
                        <span className={`font-medium ${getGripLevelClass(hourlyGripForecast[Math.floor(hourlyGripForecast.length / 2)].gripLevel)}`}>
                          {hourlyGripForecast[Math.floor(hourlyGripForecast.length / 2)].gripLevel}
                        </span>
                        <span className="text-gray-400 mx-2">at</span>
                        <span>{hourlyGripForecast[Math.floor(hourlyGripForecast.length / 2)].time}</span>
                      </div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-xs text-gray-400 mb-1">End of Period</div>
                      <div className="flex items-center">
                        <span className={`font-medium ${getGripLevelClass(hourlyGripForecast[hourlyGripForecast.length - 1].gripLevel)}`}>
                          {hourlyGripForecast[hourlyGripForecast.length - 1].gripLevel}
                        </span>
                        <span className="text-gray-400 mx-2">at</span>
                        <span>{hourlyGripForecast[hourlyGripForecast.length - 1].time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TimedSurfacePredictions;
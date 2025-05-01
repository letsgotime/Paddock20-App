import React, { useState, useEffect } from 'react';
import { extractPrecipitationData } from '../services/openWeatherService';

function DetailedPrecipitationPanel({ weatherData, selectedLocation }) {
  const [precipData, setPrecipData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (weatherData) {
      try {
        const data = extractPrecipitationData(weatherData);
        setPrecipData(data);
      } catch (error) {
        console.error("Error processing precipitation data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [weatherData]);
  
  if (loading) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
          <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
          PRECIPITATION TELEMETRY
        </h3>
        <div className="flex justify-center py-5">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (!precipData) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
          <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
          PRECIPITATION TELEMETRY
        </h3>
        <div className="text-gray-400 text-sm text-center py-4">
          No precipitation data available
        </div>
      </div>
    );
  }
  
  // Get the color based on precipitation intensity
  const getIntensityColor = (intensity) => {
    if (intensity === 0) return 'text-green-500';
    if (intensity < 0.5) return 'text-blue-400';
    if (intensity < 2.5) return 'text-yellow-500';
    if (intensity < 10) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Get the color based on precipitation probability
  const getProbabilityColor = (probability) => {
    if (probability < 0.3) return 'text-green-500';
    if (probability < 0.5) return 'text-yellow-500';
    if (probability < 0.7) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Format precipitation intensity with appropriate units
  const formatIntensity = (intensity) => {
    if (intensity === 0) return 'None';
    if (intensity < 0.5) return 'Light';
    if (intensity < 2.5) return 'Moderate';
    if (intensity < 10) return 'Heavy';
    return 'Extreme';
  };
  
  // Icon for precipitation type
  const getPrecipIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'sleet': return '🌨️';
      case 'drizzle': return '🌦️';
      default: return '☀️';
    }
  };
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
        <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
        PRECIPITATION TELEMETRY {selectedLocation && `• ${selectedLocation.name}`}
      </h3>
      
      {/* Current precipitation status */}
      <div className="bg-gray-900/70 rounded-md p-3 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs text-gray-400">Current Conditions</div>
          <div className="flex items-center space-x-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${precipData.current.intensity > 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></span>
            <span className={precipData.current.intensity > 0 ? 'text-blue-400' : 'text-gray-500'}>
              {precipData.current.intensity > 0 ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-800/80 rounded p-2">
            <div className="text-xs text-gray-400 mb-1">Type</div>
            <div className="text-lg">{getPrecipIcon(precipData.current.type)}</div>
            <div className="text-sm capitalize">{precipData.current.type}</div>
          </div>
          <div className="bg-gray-800/80 rounded p-2">
            <div className="text-xs text-gray-400 mb-1">Intensity</div>
            <div className={`text-sm font-medium ${getIntensityColor(precipData.current.intensity)}`}>
              {formatIntensity(precipData.current.intensity)}
            </div>
            <div className="text-xs text-gray-400">{precipData.current.intensity.toFixed(1)} mm/h</div>
          </div>
          <div className="bg-gray-800/80 rounded p-2">
            <div className="text-xs text-gray-400 mb-1">Accumulation</div>
            <div className="text-sm font-medium">
              {precipData.current.accumulation > 0 
                ? `${precipData.current.accumulation.toFixed(1)} mm` 
                : 'None'}
            </div>
            <div className="text-xs text-gray-400">Last Hour</div>
          </div>
        </div>
        
        {/* Precipitation trends */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Trend Analysis</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Status</span>
              <span className={`text-sm ${precipData.trends.intensifying ? 'text-amber-500' : 'text-green-500'}`}>
                {precipData.trends.intensifying ? 'Intensifying' : 'Stable/Weakening'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Duration</span>
              <span className="text-sm">
                {precipData.trends.duration_estimate > 0 
                  ? `~${Math.round(precipData.trends.duration_estimate / 60)} hrs` 
                  : 'None expected'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Peak</span>
              <span className={`text-sm ${getIntensityColor(precipData.trends.expected_peak)}`}>
                {formatIntensity(precipData.trends.expected_peak)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hourly forecast */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-medium text-gray-400">HOURLY FORECAST</h4>
          <div className="text-xs text-gray-500">Next 6 Hours</div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {precipData.hourly_forecast.slice(0, 6).map((hour, index) => (
              <div 
                key={index} 
                className={`flex-shrink-0 w-16 p-2 rounded-md ${
                  hour.intensity > 0 || hour.probability > 0.4 
                    ? 'bg-blue-900/20 border border-blue-900/30' 
                    : 'bg-gray-900/70'
                }`}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-400">{hour.time}</div>
                  <div className="text-lg my-1">{getPrecipIcon(hour.type)}</div>
                  <div className={`text-xs ${getProbabilityColor(hour.probability)}`}>
                    {Math.round(hour.probability * 100)}%
                  </div>
                  {hour.intensity > 0 && (
                    <div className={`text-xs ${getIntensityColor(hour.intensity)}`}>
                      {hour.intensity.toFixed(1)} mm
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Daily forecast */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-medium text-gray-400">5-DAY OUTLOOK</h4>
          <div className="text-xs text-gray-500">Precipitation Only</div>
        </div>
        
        <div className="space-y-2">
          {precipData.daily_forecast.slice(0, 5).map((day, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center p-2 rounded-md ${
                day.probability > 0.4 
                  ? 'bg-blue-900/20 border border-blue-900/30' 
                  : 'bg-gray-900/70'
              }`}
            >
              <div className="flex items-center">
                <div className="text-lg mr-2">{getPrecipIcon(day.type)}</div>
                <div>
                  <div className="text-sm">{day.date}</div>
                  <div className="text-xs text-gray-400 capitalize">{day.type !== 'none' ? day.type : 'Clear'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm ${getProbabilityColor(day.probability)}`}>
                  {Math.round(day.probability * 100)}% 
                </div>
                {day.accumulation > 0 && (
                  <div className={`text-xs ${getIntensityColor(day.accumulation)}`}>
                    {day.accumulation.toFixed(1)} mm
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Driver impact note */}
        {precipData.current.intensity > 0 || precipData.hourly_forecast[0].probability > 0.5 ? (
          <div className="mt-3 p-2 bg-amber-900/20 border border-amber-900/30 rounded-md text-xs">
            <div className="text-amber-400 font-semibold mb-1">F1 PIT WALL ALERT:</div>
            <div className="text-gray-300">
              {precipData.current.intensity > 2 
                ? "Heavy precipitation affecting surface grip. Consider reducing speed in corners."
                : precipData.current.intensity > 0
                ? "Light precipitation detected. Monitor grip levels on corner entry."
                : "Precipitation expected soon. Prepare for changing conditions."}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DetailedPrecipitationPanel;
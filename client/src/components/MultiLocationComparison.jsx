import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';

/**
 * MultiLocationComparison - Allows side-by-side comparison of weather conditions
 * Helps users plan optimal driving routes based on multiple location weather conditions
 */
function MultiLocationComparison({ savedLocations = [] }) {
  const { fetchLocationWeather } = useWeather();
  const [locationWeatherData, setLocationWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch weather data for all saved locations
  useEffect(() => {
    const fetchAllLocationData = async () => {
      if (!savedLocations.length) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const weatherPromises = savedLocations.map(location => 
          fetchLocationWeather(location.coords.lat, location.coords.lon)
            .then(data => ({
              location,
              weatherData: data
            }))
            .catch(err => {
              console.error(`Error fetching weather for ${location.name}:`, err);
              return {
                location,
                weatherData: null,
                error: err.message || 'Failed to fetch weather data'
              };
            })
        );
        
        const results = await Promise.all(weatherPromises);
        setLocationWeatherData(results);
      } catch (err) {
        console.error('Error fetching location weather data:', err);
        setError('Failed to fetch weather data for locations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllLocationData();
  }, [savedLocations, fetchLocationWeather]);
  
  // Get condition icon based on weather code
  const getConditionIcon = (weatherCode) => {
    if (!weatherCode) return '🌤️';
    
    // Weather code mapping based on OpenWeather codes
    if (weatherCode < 300) return '⚡'; // Thunderstorm
    if (weatherCode < 400) return '🌧️'; // Drizzle
    if (weatherCode < 600) return '🌧️'; // Rain
    if (weatherCode < 700) return '❄️'; // Snow
    if (weatherCode < 800) return '🌫️'; // Atmosphere (fog, mist, etc)
    if (weatherCode === 800) return '☀️'; // Clear
    if (weatherCode < 900) return '☁️'; // Clouds
    return '🌤️'; // Default
  };
  
  // Format temperature with color based on value
  const formatTemperature = (temp) => {
    if (temp === undefined || temp === null) return '--';
    
    let colorClass = 'text-gray-300';
    if (temp > 90) colorClass = 'text-red-500';
    else if (temp > 80) colorClass = 'text-orange-400';
    else if (temp > 70) colorClass = 'text-yellow-300';
    else if (temp < 32) colorClass = 'text-blue-300';
    else if (temp < 50) colorClass = 'text-cyan-300';
    
    return <span className={colorClass}>{Math.round(temp)}°F</span>;
  };
  
  // Get precipitation display text
  const getPrecipitation = (weatherData) => {
    if (!weatherData) return '--';
    
    const hourly = weatherData.hourly?.[0];
    if (!hourly) return '0%';
    
    const prob = hourly.pop || 0;
    return `${Math.round(prob * 100)}%`;
  };
  
  // Get road condition indicator
  const getRoadCondition = (weatherData) => {
    if (!weatherData || !weatherData.roadConditions) {
      return { text: 'Unknown', color: 'text-gray-400' };
    }
    
    const gripLevel = weatherData.roadConditions.surface_grip || 'Unknown';
    
    let color = 'text-gray-400';
    switch (gripLevel.toLowerCase()) {
      case 'excellent':
        color = 'text-green-500';
        break;
      case 'good':
        color = 'text-green-400';
        break;
      case 'fair':
        color = 'text-yellow-400';
        break;
      case 'reduced':
        color = 'text-orange-400';
        break;
      case 'poor':
        color = 'text-red-500';
        break;
      default:
        color = 'text-gray-400';
    }
    
    return { text: gripLevel, color };
  };

  // Determine if location has active alerts
  const hasAlerts = (weatherData) => {
    return weatherData?.alerts && weatherData.alerts.length > 0;
  };

  if (!savedLocations.length) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
          LOCATION COMPARISON
        </h3>
        
        <div className="text-center py-6 text-gray-400">
          <p className="mb-2">Save multiple locations to compare driving conditions</p>
          <p className="text-xs">Add at least 2 locations to enable comparison</p>
        </div>
      </div>
    );
  }

  if (loading && !locationWeatherData.length) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
          LOCATION COMPARISON
        </h3>
        
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error && !locationWeatherData.length) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
          <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
          LOCATION COMPARISON
        </h3>
        
        <div className="text-center py-4 text-red-400">
          <p>Failed to load location comparison data</p>
          <p className="text-xs mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
        <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
        LOCATION COMPARISON
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 pl-2 pr-4 text-left text-xs font-medium text-gray-400">Location</th>
              <th className="py-2 px-2 text-center text-xs font-medium text-gray-400">Conditions</th>
              <th className="py-2 px-2 text-center text-xs font-medium text-gray-400">Temp</th>
              <th className="py-2 px-2 text-center text-xs font-medium text-gray-400">Precip</th>
              <th className="py-2 px-2 text-center text-xs font-medium text-gray-400">Wind</th>
              <th className="py-2 px-2 text-center text-xs font-medium text-gray-400">Road Grip</th>
              <th className="py-2 px-2 text-center text-xs font-medium text-gray-400">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {locationWeatherData.map((item, index) => {
              const { location, weatherData, error: locationError } = item;
              
              // If there was an error fetching this location's weather
              if (locationError) {
                return (
                  <tr key={location.id || index} className="border-b border-gray-700/50">
                    <td className="py-3 px-2 text-sm">{location.name}</td>
                    <td colSpan={6} className="py-3 px-2 text-center text-xs text-red-400">
                      Error loading data: {locationError}
                    </td>
                  </tr>
                );
              }
              
              const current = weatherData?.current;
              const roadCondition = getRoadCondition(weatherData);
              
              return (
                <tr key={location.id || index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 pl-2 pr-4 text-sm font-medium">{location.name}</td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg mb-1">{getConditionIcon(current?.weather?.[0]?.id)}</span>
                      <span className="text-xs">{current?.weather?.[0]?.main || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-medium">
                    {formatTemperature(current?.temp)}
                  </td>
                  <td className="py-3 px-2 text-center text-sm">
                    {getPrecipitation(weatherData)}
                  </td>
                  <td className="py-3 px-2 text-center text-sm">
                    {current?.wind_speed ? `${Math.round(current.wind_speed)} mph` : '--'}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-sm ${roadCondition.color}`}>
                      {roadCondition.text}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {hasAlerts(weatherData) ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center bg-red-500/80 rounded-full text-xs">
                        {weatherData.alerts.length}
                      </span>
                    ) : (
                      <span className="text-green-500 text-xs">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Driver's Choice</h4>
        <p className="text-xs text-gray-300">
          The comparison above can help you determine the best route for your drive based on current weather conditions.
        </p>
      </div>
    </div>
  );
}

export default MultiLocationComparison;
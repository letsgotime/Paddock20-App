import React, { useState, useEffect } from 'react';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default location (Charlotte)
  const DEFAULT_LOCATION = { lat: 35.2271, lon: -80.8431 };
  
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/automotive-weather?lat=${DEFAULT_LOCATION.lat}&lon=${DEFAULT_LOCATION.lon}&units=imperial`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchWeatherData();
    
    // Refresh every 15 minutes
    const intervalId = setInterval(fetchWeatherData, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Loading state
  if (loading && !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading telemetry data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-amber-500 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Weather Telemetry Unavailable</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // If we have data, render it
  if (weatherData) {
    const { location, currentConditions, drivingConditions, performanceData } = weatherData;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-4 text-blue-400">F1 Weather Telemetry</h1>
        <p className="mb-6">Professional-grade weather analytics for driving enthusiasts</p>
        
        <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">{location.name}</h2>
              <p className="text-gray-400 capitalize">{currentConditions.weather[0].description}</p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              <div className="text-4xl font-bold">{Math.round(currentConditions.temp)}°F</div>
              <div className="ml-4 flex flex-col">
                <div className="text-sm text-gray-300">Feels like: {Math.round(currentConditions.feels_like)}°F</div>
                <div className="text-sm text-gray-300">Track: {Math.round(drivingConditions.track_temp)}°F</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-lg font-medium">Wind</div>
              <div className="text-xl">{Math.round(currentConditions.wind_speed)} mph</div>
              <div className="text-xs text-gray-400">{currentConditions.wind_direction}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-lg font-medium">Humidity</div>
              <div className="text-xl">{currentConditions.humidity}%</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-lg font-medium">Grip</div>
              <div className="text-xl">{drivingConditions.grip_index}/100</div>
              <div className="text-xs text-gray-400">{drivingConditions.grip_assessment}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-lg font-medium">Visibility</div>
              <div className="text-xl">{currentConditions.visibility.toFixed(1)} km</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
              <h3 className="font-medium mb-2">Track Condition</h3>
              <p className="text-lg font-semibold">{drivingConditions.track_condition}</p>
              <p className="text-sm text-gray-300 mt-2">
                Precipitation: {drivingConditions.precipitation_intensity} 
                ({Math.round(drivingConditions.precipitation_probability)}% chance)
              </p>
            </div>
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
              <h3 className="font-medium mb-2">Performance Impact</h3>
              <div className="flex justify-between text-sm">
                <span>Braking Efficiency:</span>
                <span className="font-medium">{performanceData.braking_efficiency}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cooling:</span>
                <span className="font-medium">{performanceData.cooling_efficiency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Crosswind:</span>
                <span className="font-medium">{performanceData.crosswind_effect}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            <h3 className="font-medium mb-3">Driving Recommendation</h3>
            <p>{weatherData.drivingRecommendation}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback (should never happen if all states are properly handled)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <p>Something went wrong. Please refresh the page.</p>
    </div>
  );
}

export default App;
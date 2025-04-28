import React, { useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  weather: Array<{
    description: string;
    main: string;
    icon: string;
  }>;
  sunrise?: number;
  sunset?: number;
}

export default function SimplifiedDrivingConditions() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Default coordinates for Charlotte
        const lat = 35.2271;
        const lon = -80.8431;
        const units = 'imperial';
        
        const response = await fetch(`/api/onecall?lat=${lat}&lon=${lon}&units=${units}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        console.log("Weather data received:", data);
        
        if (data && data.current) {
          setWeather(data.current);
        } else {
          throw new Error("Invalid data format received from weather API");
        }
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError((err as Error).message || "Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
        <p className="text-blue-400 text-xl font-orbitron mb-4">Loading Drive Conditions...</p>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black border border-red-900/30">
        <p className="text-blue-400 text-xl font-orbitron mb-2">Today's Drive Conditions</p>
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ⟳ Try again
        </button>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
        <p className="text-blue-400 text-xl font-orbitron mb-2">Today's Drive Conditions</p>
        <p className="text-gray-400">No weather data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800">
      <h2 className="text-blue-400 font-orbitron text-2xl mb-6">☁️ Today's Drive Conditions</h2>
      
      <div className="text-white font-openSans text-base leading-relaxed space-y-3">
        <p>🌡️ Air Temperature: {weather.temp.toFixed(1)}°F</p>
        <p>🔥 Surface Temp: {weather.feels_like.toFixed(1)}°F (Feels Like)</p>
        <p>💨 Wind Speed: {weather.wind_speed.toFixed(1)} mph</p>
        <p>💧 Humidity: {weather.humidity}%</p>
        <p>📈 Barometric Pressure: {weather.pressure} hPa</p>
        
        {weather.sunrise && weather.sunset && (
          <>
            <p>🌅 Sunrise: {new Date(weather.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p>🌇 Sunset: {new Date(weather.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </>
        )}
        
        {weather.weather && weather.weather.length > 0 && (
          <div className="flex items-center gap-2">
            <span>☁️ Condition:</span>
            <span className="capitalize">{weather.weather[0].description}</span>
            {weather.weather[0].icon && (
              <img 
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt={weather.weather[0].description}
                className="w-10 h-10"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
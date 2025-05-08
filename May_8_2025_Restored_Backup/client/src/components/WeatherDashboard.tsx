import React, { useContext } from "react";
import { OpenWeatherContext } from "@/contexts/OpenWeatherContext";

const WeatherDashboard = () => {
  const { weatherData, loading, error } = useContext(OpenWeatherContext);

  if (loading) {
    return <p className="text-white">Loading weather data...</p>;
  }

  if (error || !weatherData) {
    return <p className="text-red-400">Failed to load weather data. Please check your connection or try again later.</p>;
  }

  const { temp, feels_like, pressure, humidity, wind_speed, sunrise, sunset, weather } = weatherData;

  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-700">
      <h2 className="text-blue-400 font-orbitron text-2xl mb-6">☁️ Drive Readiness — Today's Conditions</h2>

      <div className="text-white font-openSans text-base leading-relaxed space-y-3">
        <p>🌡️ Air Temperature: {temp}°F</p>
        <p>🔥 Surface Temp: {feels_like}°F (Feels Like)</p>
        <p>💨 Wind Speed: {wind_speed} mph</p>
        <p>💧 Humidity: {humidity}%</p>
        <p>📈 Barometric Pressure: {pressure} hPa</p>
        {sunrise && sunset && (
          <>
            <p>🌅 Sunrise: {new Date(sunrise * 1000).toLocaleTimeString()}</p>
            <p>🌇 Sunset: {new Date(sunset * 1000).toLocaleTimeString()}</p>
          </>
        )}
        {weather && weather.length > 0 && (
          <p>☁️ Condition: {weather[0].description}</p>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
import React, { useEffect, useState } from "react";
import { getLocationKey, fetchCurrentConditions, fetchDailyForecast, fetchMinuteCast } from "@/services/accuweatherService";
import { AlertCircle } from "lucide-react";

const WeatherDashboard = () => {
  const [currentConditions, setCurrentConditions] = useState<any>(null);
  const [dailyForecast, setDailyForecast] = useState<any>(null);
  const [minuteCast, setMinuteCast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              const locationKey = await getLocationKey(latitude, longitude);
              
              const current = await fetchCurrentConditions(locationKey);
              const daily = await fetchDailyForecast(locationKey);
              const minute = await fetchMinuteCast(locationKey);
              
              setCurrentConditions(current);
              setDailyForecast(daily);
              setMinuteCast(minute);
              setLoading(false);
            } catch (err) {
              console.error("Error fetching weather data:", err);
              setError("Failed to load weather data. Please try again later.");
              setLoading(false);
            }
          },
          (err) => {
            console.error("Geolocation error:", err);
            setError("Location access denied. Please enable location services to get weather information.");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Weather data fetch error:", err);
        setError("An unexpected error occurred. Please try again later.");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-700 flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-400/30 mb-4"></div>
          <div className="h-4 w-48 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-36 bg-gray-700/70 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-red-800 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-red-400 text-lg font-medium mb-2">Weather Data Unavailable</h3>
        <p className="text-gray-300 mb-4">{error}</p>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentConditions || !dailyForecast) {
    return <p className="text-white">Loading weather data...</p>;
  }

  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-700">
      <h2 className="text-blue-400 font-orbitron text-2xl mb-6">☁️ Drive Readiness</h2>

      <div className="text-white space-y-3 font-openSans text-base leading-relaxed">
        <p>Surface Temp: {currentConditions.Temperature.Imperial.Value}°F</p>
        <p>Wind: {currentConditions.Wind.Speed.Imperial.Value} mph</p>
        <p>Humidity: {currentConditions.RelativeHumidity}%</p>
        <p>Barometric Pressure: {currentConditions.Pressure.Imperial.Value} inHg</p>
        <p>UV Index: {currentConditions.UVIndexText}</p>
        <p>Sunrise: {new Date(dailyForecast.Sun.Rise).toLocaleTimeString()}</p>
        <p>Sunset: {new Date(dailyForecast.Sun.Set).toLocaleTimeString()}</p>
        <p>Rain in Next Hour: {minuteCast?.Summary || "Not available for your location"}</p>
      </div>
    </div>
  );
};

export default WeatherDashboard;
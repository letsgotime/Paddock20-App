import React, { createContext, useEffect, useState } from "react";

export const OpenWeatherContext = createContext<any>(null);

export const OpenWeatherProvider = ({ children }: { children: React.ReactNode }) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const latitude = 34.0522; // Default lat (replace with dynamic GPS later)
        const longitude = -118.2437; // Default lon (replace with dynamic GPS later)

        const response = await fetch(`/api/automotive-weather?lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        setWeatherData(data.current); // ✅ Store ONLY the "current" object
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError(true);
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  return (
    <OpenWeatherContext.Provider value={{ weatherData, loading, error }}>
      {children}
    </OpenWeatherContext.Provider>
  );
};
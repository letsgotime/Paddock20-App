import React from "react";
import OpenWeatherStation from "@/components/OpenWeatherStation";
import { WeatherProvider } from "@/contexts/WeatherContext";

const WeatherPage = () => {
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WeatherProvider>
        <OpenWeatherStation />
      </WeatherProvider>
    </div>
  );
};

export default WeatherPage;
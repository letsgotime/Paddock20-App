import React from "react";
import OpenWeatherStation from "@/components/OpenWeatherStation";
import OpenWeatherAutomotivePanel from "@/components/OpenWeatherAutomotivePanel";
import DrivingWeatherInsights from "@/components/DrivingWeatherInsights";
import { WeatherProvider } from "@/contexts/WeatherContext";
import { useWeather } from "@/contexts/WeatherContext";

// This component is used to access the weather context after the provider is set up
const WeatherPageContent = () => {
  const { selectedLocation } = useWeather();
  
  return (
    <>
      <OpenWeatherStation />
      
      {selectedLocation && (
        <div className="mt-8 space-y-8">
          <OpenWeatherAutomotivePanel />
          <DrivingWeatherInsights 
            latitude={selectedLocation.lat} 
            longitude={selectedLocation.lon} 
          />
        </div>
      )}
    </>
  );
};

const WeatherPage = () => {
  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WeatherProvider>
        <WeatherPageContent />
      </WeatherProvider>
    </div>
  );
};

export default WeatherPage;
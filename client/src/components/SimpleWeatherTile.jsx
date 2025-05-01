import React from "react";
import { useWeather } from "../contexts/WeatherContext";
import { Thermometer, Droplets, Wind, Cloud, CloudRain, Sun } from "lucide-react";

const SimpleWeatherTile = () => {
  const { weatherData: weather, loading, error } = useWeather();

  if (loading) return <p className="text-white">Loading weather...</p>;
  if (error || !weather) return <p className="text-red-400">Weather unavailable</p>;

  return (
    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 shadow-md w-full text-white">
      <h2 className="text-blue-400 font-orbitron text-xl mb-3">Drive Readiness Weather</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Tile 
          icon={<Thermometer className="text-red-500" />} 
          label="Air Temp" 
          value={`${weather?.current?.temp || 'N/A'}°F`} 
        />
        <Tile 
          icon={<Thermometer className="text-yellow-500" />} 
          label="Surface Temp" 
          value={`${weather?.current?.feels_like || 'N/A'}°F`} 
        />
        <Tile 
          icon={<Droplets className="text-blue-400" />} 
          label="Humidity" 
          value={`${weather?.current?.humidity || 'N/A'}%`} 
        />
        <Tile 
          icon={<Wind className="text-blue-300" />} 
          label="Wind" 
          value={`${weather?.current?.wind_speed || 'N/A'} mph`} 
        />
        <Tile 
          icon={<Cloud className="text-gray-300" />} 
          label="Conditions" 
          value={weather?.current?.weather?.[0]?.description || 'N/A'} 
        />
        <Tile 
          icon={<CloudRain className="text-cyan-300" />} 
          label="Dew Point" 
          value={`${weather?.current?.dew_point || 'N/A'}°F`} 
        />
        <Tile 
          icon={<Sun className="text-yellow-400" />} 
          label="UV Index" 
          value={weather?.current?.uvi || 'N/A'} 
        />
        <Tile 
          icon={<Thermometer className="text-green-400" />} 
          label="Pressure" 
          value={`${weather?.current?.pressure || 'N/A'} hPa`} 
        />
      </div>
    </div>
  );
};

const Tile = ({ icon, label, value }) => (
  <div className="flex flex-col items-center bg-zinc-800 p-3 rounded">
    <div className="flex items-center gap-2 mb-1">{icon} <span className="font-semibold">{label}</span></div>
    <div className="text-lg font-bold">{value}</div>
  </div>
);

export default SimpleWeatherTile;
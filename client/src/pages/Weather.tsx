import React from 'react';
import WeatherStation from '../components/WeatherStation';
import WeatherMoodGenerator from '../components/WeatherMoodGenerator';
import GarageWeatherStation from '../components/GarageWeatherStation';
import { useWeather } from '@/contexts/WeatherContext';

function Weather() {
  const { isLoading, error, weatherData } = useWeather();
  
  return (
    <div className="p-6 bg-black min-h-screen">
      <h1 className="font-orbitron text-4xl text-blue-500 mb-8 text-center">
        Paddock20™ Weather Center
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-xl">
        <GarageWeatherStation />
        <WeatherMoodGenerator />
      </div>

      <div className="mt-8">
        <h2 className="font-orbitron text-2xl text-green-500 mb-6">
          Comprehensive Weather Data
        </h2>
        <WeatherStation />
      </div>
    </div>
  );
}

export default Weather;
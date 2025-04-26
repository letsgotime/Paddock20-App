import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

function SimpleWeatherStation() {
  const { 
    unit, 
    setUnit, 
    isLoading, 
    error, 
    weatherData
  } = useWeather();

  const toggleTempUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  // Estimate surface temp roughly 3°F above air temp
  const getSurfaceTemp = (airTemp: number) => {
    if (unit === 'imperial') {
      return airTemp + 3;
    } else {
      return airTemp + 1.7; // roughly 3°F in Celsius
    }
  };

  if (isLoading) {
    return (
      <div className="text-white font-openSans text-center py-10">
        Loading Weather Data...
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="text-red-500 font-openSans text-center py-10">
        Failed to load weather data.
      </div>
    );
  }

  const surfaceTempApprox = getSurfaceTemp(weatherData.main.temp);
  const unitSymbol = unit === 'metric' ? 'C' : 'F';

  return (
    <div className="apex-card text-center">
      <h2 className="apex-header mb-6">
        Garage Weather Station
      </h2>

      <button
        onClick={toggleTempUnit}
        className="apex-button mb-6"
      >
        Switch to °{unit === 'imperial' ? 'C' : 'F'}
      </button>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-green-400 font-orbitron text-sm uppercase mb-2">Air Temp</h3>
          <p className="text-2xl text-white">{Math.round(weatherData.main.temp)}°{unitSymbol}</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-green-400 font-orbitron text-sm uppercase mb-2">Surface Temp (Approx)</h3>
          <p className="text-2xl text-white">{Math.round(surfaceTempApprox)}°{unitSymbol}</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-green-400 font-orbitron text-sm uppercase mb-2">Humidity</h3>
          <p className="text-2xl text-white">{weatherData.main.humidity}%</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-green-400 font-orbitron text-sm uppercase mb-2">Wind Speed</h3>
          <p className="text-2xl text-white">{Math.round(weatherData.wind.speed)} {unit === 'imperial' ? 'mph' : 'm/s'}</p>
        </div>
      </div>
    </div>
  );
}

export default SimpleWeatherStation;
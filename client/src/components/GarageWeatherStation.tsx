import React, { useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';

function GarageWeatherStation() {
  const { weatherData, isLoading, error } = useWeather();
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F'); // Default to Fahrenheit

  const toggleUnit = () => {
    setTempUnit(tempUnit === 'F' ? 'C' : 'F');
  };

  const convertTemp = (temp: number) => {
    if (tempUnit === 'F') {
      return Math.round(temp);
    } else {
      return Math.round((temp - 32) * 5/9);
    }
  };

  if (isLoading) {
    return <div className="text-white text-center p-10">Loading Weather...</div>;
  }

  if (error || !weatherData) {
    return <div className="text-red-500 text-center p-10">Weather data not available.</div>;
  }

  // Assume surface is about 3°F hotter than air temperature
  const surfaceTempApprox = weatherData.main.temp + 3;

  return (
    <div className="apex-card text-center">
      <h2 className="apex-header-green mb-6">Garage Weather Station</h2>
      <button onClick={toggleUnit} className="apex-button mb-6">
        Switch to °{tempUnit === 'F' ? 'C' : 'F'}
      </button>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Air Temp</h3>
          <p className="text-2xl text-white">{convertTemp(weatherData.main.temp)}°{tempUnit}</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Surface Temp (Approx)</h3>
          <p className="text-2xl text-white">{convertTemp(surfaceTempApprox)}°{tempUnit}</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Humidity</h3>
          <p className="text-2xl text-white">{weatherData.main.humidity}%</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Wind Speed</h3>
          <p className="text-2xl text-white">{Math.round(weatherData.wind.speed)} mph</p>
        </div>
      </div>
    </div>
  );
}

export default GarageWeatherStation;
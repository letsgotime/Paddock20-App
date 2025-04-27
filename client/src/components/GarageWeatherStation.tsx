import React, { useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';

function GarageWeatherStation() {
  const { weatherData, isLoading, error, unit, setUnit } = useWeather();
  const [displayUnit, setDisplayUnit] = useState<'F' | 'C'>(unit === 'imperial' ? 'F' : 'C');

  const toggleUnit = () => {
    const newUnit = displayUnit === 'F' ? 'C' : 'F';
    setDisplayUnit(newUnit);
    setUnit(newUnit === 'F' ? 'imperial' : 'metric');
  };

  const formatTemp = (temp: number) => {
    return Math.round(temp);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-white text-center p-6">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading Weather...</p>
      </div>
    </div>;
  }

  if (error || !weatherData) {
    return <div className="text-red-500 text-center p-10">Weather data not available.</div>;
  }

  // Assume surface is about 3° hotter than air temperature (in the same unit)
  const surfaceTempApprox = weatherData.main.temp + 3;
  const speedUnit = unit === 'imperial' ? 'mph' : 'm/s';

  return (
    <div className="apex-card text-center">
      <h2 className="apex-header-green mb-6">Garage Weather Station</h2>
      <button onClick={toggleUnit} className="apex-button mb-6">
        Switch to °{displayUnit === 'F' ? 'C' : 'F'}
      </button>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Air Temp</h3>
          <p className="text-2xl text-white">{formatTemp(weatherData.main.temp)}°{displayUnit}</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Surface Temp (Approx)</h3>
          <p className="text-2xl text-white">{formatTemp(surfaceTempApprox)}°{displayUnit}</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Humidity</h3>
          <p className="text-2xl text-white">{weatherData.main.humidity}%</p>
        </div>

        <div className="bg-black p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Wind Speed</h3>
          <p className="text-2xl text-white">{Math.round(weatherData.wind.speed)} {speedUnit}</p>
        </div>
      </div>
    </div>
  );
}

export default GarageWeatherStation;
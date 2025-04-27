import React, { useState, useEffect } from 'react';

function WeatherStation() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempUnit, setTempUnit] = useState('F'); // Default to Fahrenheit

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const city = "Charlotte"; // Change to your preferred city

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`);
        const data = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather:', error.message);
        setLoading(false);
      }
    }
    fetchWeather();
  }, [city, apiKey]);

  const toggleUnit = () => {
    setTempUnit(tempUnit === 'F' ? 'C' : 'F');
  };

  const convertTemp = (temp) => {
    return tempUnit === 'F' ? temp : ((temp - 32) * 5/9).toFixed(1);
  };

  if (loading) {
    return <div className="text-white text-center p-10">Loading Weather...</div>;
  }

  if (!weatherData || !weatherData.main || !weatherData.wind) {
    return <div className="text-red-500 text-center p-10">Weather data not available.</div>;
  }

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
          <p className="text-2xl text-white">{weatherData.wind.speed} mph</p>
        </div>
      </div>
    </div>
  );
}

export default WeatherStation;

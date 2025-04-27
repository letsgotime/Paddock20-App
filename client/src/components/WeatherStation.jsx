import React, { useState, useEffect } from 'react';

function WeatherStation() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempUnit, setTempUnit] = useState('F'); // Default to Fahrenheit
  const [apiKey, setApiKey] = useState('');
  
  // Using coordinates instead of city name
  const latitude = 34.0522; // Los Angeles latitude
  const longitude = -118.2437; // Los Angeles longitude

  // First, get the API key from the server
  useEffect(() => {
    async function getApiKey() {
      try {
        const response = await fetch('/api/weather-key');
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching API key:', error);
        setLoading(false);
      }
    }
    getApiKey();
  }, []);

  // Then, fetch weather data once we have the API key
  useEffect(() => {
    if (!apiKey) return; // Skip if we don't have an API key yet
    
    async function fetchWeather() {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`);
        const data = await response.json();
        console.log('Weather data:', data);
        setWeatherData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather:', error.message);
        setLoading(false);
      }
    }
    fetchWeather();
  }, [latitude, longitude, apiKey]);

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

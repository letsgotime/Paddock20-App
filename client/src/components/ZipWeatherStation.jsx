import React, { useState, useEffect } from 'react';

function ZipWeatherStation() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempUnit, setTempUnit] = useState('F');
  const [zipCode, setZipCode] = useState('90001'); // Default ZIP (Los Angeles)
  
  // Get api key from environment or weather-key endpoint
  const [apiKey, setApiKey] = useState(null);

  // First, fetch the API key
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch('/api/weather-key');
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching API key:', error.message);
      }
    }
    
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey) return; // Skip if we don't have an API key yet
    
    async function fetchWeather() {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&units=imperial&appid=${apiKey}`);
        const data = await response.json();
        console.log('Weather data by ZIP:', data);
        setWeatherData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error.message);
        setLoading(false);
      }
    }
    fetchWeather();
  }, [zipCode, apiKey]);

  const toggleUnit = () => {
    setTempUnit(tempUnit === 'F' ? 'C' : 'F');
  };

  const convertTemp = (temp) => {
    return tempUnit === 'F' ? temp : ((temp - 32) * 5/9).toFixed(1);
  };

  if (loading) {
    return <div className="text-white text-center p-10">Loading Weather...</div>;
  }

  if (!weatherData) {
    return <div className="text-red-500 text-center p-10">Weather data not available.</div>;
  }

  const surfaceTempApprox = weatherData.main.temp + 5; // More accurate garage surface delta

  return (
    <div className="apex-card text-center">
      <h2 className="apex-header-green mb-6">Garage Weather Station</h2>

      <form onSubmit={(e) => { e.preventDefault(); }}>
        <input
          type="text"
          placeholder="Enter ZIP Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="p-2 rounded-lg bg-black border border-gray-700 text-white font-openSans mb-4"
        />
      </form>

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

        <div className="bg-black p-4 rounded-lg col-span-2">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Barometric Pressure</h3>
          <p className="text-2xl text-white">{weatherData.main.pressure} hPa</p>
        </div>
      </div>
    </div>
  );
}

export default ZipWeatherStation;
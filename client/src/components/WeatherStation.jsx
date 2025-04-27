import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeatherMoodEmoji from './WeatherMoodEmoji';
import DrivingConditionEmoji from './DrivingConditionEmoji';
import WeatherVoiceOver from './WeatherVoiceOver';
import { Droplets, Wind, Sun, CloudRain } from 'lucide-react';

function WeatherStation() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempUnit, setTempUnit] = useState('F'); // Default to Fahrenheit
  const [apiKey, setApiKey] = useState('');
  const [oneCallData, setOneCallData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  
  // Using coordinates instead of city name
  const latitude = 34.0522; // Los Angeles latitude
  const longitude = -118.2437; // Los Angeles longitude
  
  // Helper to determine if it's night time
  const isNightTime = () => {
    if (!weatherData || !weatherData.sys) return false;
    const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
    return now < weatherData.sys.sunrise || now > weatherData.sys.sunset;
  };

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
    
    async function fetchWeatherData() {
      setLoading(true);
      try {
        // Fetch basic weather data
        const weatherResponse = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}&units=imperial`);
        const weatherResult = await weatherResponse.json();
        setWeatherData(weatherResult);
        
        // Fetch OneCall data with hourly and daily forecasts
        const oneCallResponse = await fetch(`/api/onecall?lat=${latitude}&lon=${longitude}&units=imperial`);
        const oneCallResult = await oneCallResponse.json();
        setOneCallData(oneCallResult);
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(`/api/forecast?lat=${latitude}&lon=${longitude}&units=imperial`);
        const forecastResult = await forecastResponse.json();
        setForecastData(forecastResult);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    }
    
    fetchWeatherData();
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
  const weatherCondition = weatherData.weather && weatherData.weather.length > 0 
    ? weatherData.weather[0].main 
    : '';
  const weatherDescription = weatherData.weather && weatherData.weather.length > 0 
    ? weatherData.weather[0].description
    : '';

  // Get precipitation amount - approximate from conditions if necessary
  const precipitation = 
    weatherDescription.includes('rain') || weatherDescription.includes('shower') 
      ? (weatherDescription.includes('light') ? 0.05 : 
         weatherDescription.includes('heavy') ? 0.4 : 0.2)
      : 0;

  return (
    <div className="apex-card text-center mb-8">
      <h2 className="apex-header-green mb-6">GARAGE WEATHER STATION</h2>
      
      {/* Weather Mood Emoji Display */}
      <WeatherMoodEmoji 
        weatherCondition={weatherCondition || weatherDescription} 
        isNight={isNightTime()}
      />
      
      <button onClick={toggleUnit} className="apex-button mb-6">
        Switch to °{tempUnit === 'F' ? 'C' : 'F'}
      </button>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Sun className="w-20 h-20 text-yellow-500" />
          </div>
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Air Temp</h3>
          <p className="text-2xl text-white">{convertTemp(weatherData.main.temp)}°{tempUnit}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Sun className="w-20 h-20 text-orange-500" />
          </div>
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Surface Temp</h3>
          <p className="text-2xl text-white">{convertTemp(surfaceTempApprox)}°{tempUnit}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Droplets className="w-20 h-20 text-blue-500" />
          </div>
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Humidity</h3>
          <p className="text-2xl text-white">{weatherData.main.humidity}%</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Wind className="w-20 h-20 text-cyan-500" />
          </div>
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Wind Speed</h3>
          <p className="text-2xl text-white">{weatherData.wind.speed} mph</p>
        </div>
      </div>

      {/* Driving Conditions */}
      <DrivingConditionEmoji 
        temperature={weatherData.main.temp}
        visibility={weatherData.visibility / 1609.34} // Convert meters to miles
        windSpeed={weatherData.wind.speed}
        precipitation={precipitation}
      />

      {/* Navigation Links */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <a 
          href={`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="apex-button"
        >
          Open Waze Navigation
        </a>
        <a 
          href={`http://maps.apple.com/?daddr=${latitude},${longitude}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="apex-button"
        >
          Open in Apple Maps
        </a>
      </div>
      
      {/* Accessibility Voice Over */}
      <WeatherVoiceOver 
        weatherData={weatherData}
        forecastData={forecastData}
        drivingCondition={
          DrivingConditionEmoji.getDrivingCondition(
            weatherData.main.temp,
            weatherData.visibility / 1609.34,
            weatherData.wind.speed,
            precipitation
          )
        }
      />

      {/* Seasonal Checklist Button */}
      <div className="mt-6">
        <Link to="/seasonal-checklist" className="apex-button">
          View Full Seasonal Checklist
        </Link>
      </div>

      {/* We'll add the iframe when we have the API key */}
      {/* <iframe
        width="100%"
        height="300"
        frameBorder="0"
        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}`}
        allowFullScreen
        className="rounded-lg"
      ></iframe> */}
    </div>
  );
}

export default WeatherStation;

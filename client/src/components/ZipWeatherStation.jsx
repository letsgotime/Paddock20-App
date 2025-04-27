import React, { useState, useEffect, useRef } from 'react';
import WeatherMoodEmoji from './WeatherMoodEmoji';
import DrivingConditionEmoji from './DrivingConditionEmoji';
import WeatherVoiceOver from './WeatherVoiceOver';
import { ARIA_LABELS } from '../lib/accessibility';

function ZipWeatherStation() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const inputRef = useRef(null);
  const statusRef = useRef(null);

  // Fetch weather API key from server
  const fetchWeatherData = async (zip) => {
    if (!zip || zip.length !== 5 || !/^\d+$/.test(zip)) {
      setError('Please enter a valid 5-digit ZIP code');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage('Loading weather data...');

    try {
      // Get API key from server
      const keyResponse = await fetch('/api/weather-key');
      const keyData = await keyResponse.json();
      const apiKey = keyData.apiKey;

      // Fetch current weather
      const weatherResponse = await fetch(`/api/weather?zip=${zip},us`);
      
      if (!weatherResponse.ok) {
        throw new Error(`ZIP code ${zip} not found or weather service unavailable`);
      }
      
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      // Fetch forecast
      const forecastResponse = await fetch(`/api/forecast?zip=${zip},us`);
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        setForecastData(forecastData);
      }
      
      setStatusMessage(`Weather data loaded for ${weatherData.name}`);
    } catch (error) {
      setError(error.message || 'Failed to fetch weather data');
      setStatusMessage('Error loading weather data');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData(zipCode);
  };

  // Handle input change
  const handleChange = (e) => {
    setZipCode(e.target.value);
  };

  // Handle keyboard navigation
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchWeatherData(zipCode);
    }
  };

  useEffect(() => {
    // Focus the input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="apex-card mb-8" aria-labelledby="zipWeatherHeading">
      <h2 id="zipWeatherHeading" className="apex-header-green mb-4 text-center">Search Weather by ZIP</h2>
      
      <form onSubmit={handleSubmit} aria-describedby="zipWeatherDescription" className="mb-6">
        <p id="zipWeatherDescription" className="text-gray-400 text-sm mb-4">
          Enter a ZIP code to get real-time weather and driving condition information.
        </p>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex-grow">
            <label htmlFor="zipCodeInput" className="sr-only">Enter ZIP Code</label>
            <input
              ref={inputRef}
              id="zipCodeInput"
              type="text"
              placeholder="Enter ZIP Code"
              value={zipCode}
              onChange={handleChange}
              onKeyDown={handleInputKeyDown}
              maxLength={5}
              className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white"
              aria-label={ARIA_LABELS.ZIP_SEARCH}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "zipError" : undefined}
            />
          </div>
          
          <button 
            type="submit" 
            className="apex-button"
            disabled={loading}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
        
        {error && (
          <div id="zipError" className="text-red-500 mt-2" role="alert">
            {error}
          </div>
        )}

        {/* Status message for screen readers */}
        <div 
          ref={statusRef}
          className="sr-only" 
          aria-live="polite"
          aria-atomic="true"
        >
          {statusMessage}
        </div>
      </form>

      {loading && (
        <div className="flex justify-center my-8" role="status" aria-label="Loading weather data">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && weatherData && (
        <div className="mt-4" role="region" aria-label="Weather information">
          {/* Weather mood emoji */}
          <WeatherMoodEmoji weatherData={weatherData} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-gray-900 rounded-lg shadow-inner">
              <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Temperature</h3>
              <p className="text-2xl text-white">{Math.round(weatherData.main?.temp)}°F</p>
              <p className="text-sm text-gray-400">Feels like: {Math.round(weatherData.main?.feels_like)}°F</p>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-lg shadow-inner">
              <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Conditions</h3>
              <p className="text-2xl text-white capitalize">{weatherData.weather?.[0]?.description || 'Unknown'}</p>
              <p className="text-sm text-gray-400">Humidity: {weatherData.main?.humidity}%</p>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-lg shadow-inner">
              <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Wind</h3>
              <p className="text-2xl text-white">{Math.round(weatherData.wind?.speed)} mph</p>
              <p className="text-sm text-gray-400">Direction: {weatherData.wind?.deg}°</p>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-lg shadow-inner">
              <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Pressure</h3>
              <p className="text-2xl text-white">{weatherData.main?.pressure} hPa</p>
              <p className="text-sm text-gray-400">Visibility: {(weatherData.visibility / 1000).toFixed(1)} km</p>
            </div>
          </div>
          
          {/* Driving conditions assessment */}
          <DrivingConditionEmoji weatherData={weatherData} />
          
          {/* Voice readout feature */}
          <WeatherVoiceOver 
            weatherData={weatherData} 
            forecastData={forecastData}
            drivingCondition={{
              score: 10, // This would come from DrivingConditionEmoji in a real implementation
              recommendation: 'Conditions are good for driving.'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ZipWeatherStation;
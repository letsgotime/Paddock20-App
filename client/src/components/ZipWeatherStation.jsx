import React, { useState, useEffect } from 'react';
import WeatherMoodEmoji from './WeatherMoodEmoji';
import DrivingConditionEmoji from './DrivingConditionEmoji';
import WeatherVoiceOver from './WeatherVoiceOver';
import { Droplets, Wind, Sun, CloudRain, Gauge } from 'lucide-react';

function ZipWeatherStation() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempUnit, setTempUnit] = useState('F');
  const [zipCode, setZipCode] = useState('90001'); // Default ZIP (Los Angeles)
  const [searchedZip, setSearchedZip] = useState('90001');
  
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
      setLoading(true);
      try {
        const response = await fetch(`/api/weather?zip=${searchedZip}&units=imperial`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
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
  }, [searchedZip, apiKey]);
  
  // Helper to determine if it's night time
  const isNightTime = () => {
    if (!weatherData || !weatherData.sys) return false;
    const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
    return now < weatherData.sys.sunrise || now > weatherData.sys.sunset;
  };

  const toggleUnit = () => {
    setTempUnit(tempUnit === 'F' ? 'C' : 'F');
  };

  const convertTemp = (temp) => {
    return tempUnit === 'F' ? temp : ((temp - 32) * 5/9).toFixed(1);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (zipCode.length >= 5) {
      setSearchedZip(zipCode);
    }
  };

  if (loading) {
    return <div className="text-gray-300 text-center p-10">Loading Weather for ZIP {searchedZip}...</div>;
  }

  if (!weatherData || !weatherData.main) {
    return <div className="text-red-500 text-center p-10">
      Weather data not available for ZIP {searchedZip}. Please try another ZIP code.
    </div>;
  }

  const surfaceTempApprox = weatherData.main.temp + 5; // More accurate garage surface delta
  
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
      <h2 className="apex-header-green mb-6">WEATHER BY ZIP CODE</h2>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 mb-6 items-center justify-center">
        <input
          type="text"
          placeholder="Enter ZIP Code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 5))}
          className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white font-openSans"
          maxLength={5}
        />
        <button type="submit" className="apex-button">Check Weather</button>
      </form>
      
      {/* Weather Location */}
      <div className="mb-6">
        <h3 className="text-xl text-gray-300">
          {weatherData.name}, {weatherData.sys.country} 
          <span className="text-sm text-gray-400 ml-2">({searchedZip})</span>
        </h3>
      </div>
      
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

        <div className="bg-gray-800 p-4 rounded-lg col-span-2 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Gauge className="w-20 h-20 text-teal-500" />
          </div>
          <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-2">Barometric Pressure</h3>
          <p className="text-2xl text-white">{weatherData.main.pressure} hPa</p>
        </div>
      </div>
      
      {/* Driving Conditions */}
      <DrivingConditionEmoji 
        temperature={weatherData.main.temp}
        visibility={weatherData.visibility / 1609.34} // Convert meters to miles
        windSpeed={weatherData.wind.speed}
        precipitation={precipitation}
      />
      
      {/* Accessibility Voice Over */}
      <WeatherVoiceOver 
        weatherData={weatherData}
        drivingCondition={{
          text: weatherCondition ? 'Moderate driving conditions' : 'Good driving conditions',
          drivingTip: precipitation > 0 
            ? 'Drive carefully on wet roads and allow for extra stopping distance.' 
            : 'Road conditions are generally good. Maintain safe driving practices.'
        }}
      />
      
      {/* Navigation Links */}
      {weatherData.coord && (
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <a 
            href={`https://waze.com/ul?ll=${weatherData.coord.lat},${weatherData.coord.lon}&navigate=yes`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="apex-button"
          >
            Open Waze Navigation
          </a>
          <a 
            href={`http://maps.apple.com/?daddr=${weatherData.coord.lat},${weatherData.coord.lon}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="apex-button"
          >
            Open in Apple Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default ZipWeatherStation;
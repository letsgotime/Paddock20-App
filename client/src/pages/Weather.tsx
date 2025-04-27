import React, { useState, useEffect } from 'react';
import WeatherStation from '../components/WeatherStation';
import WeatherMoodGenerator from '../components/WeatherMoodGenerator';
import GarageWeatherStation from '../components/GarageWeatherStation';
import { useWeather } from '@/contexts/WeatherContext';
import { Motion, Sun, CloudRain, Droplets, Wind, Thermometer, BarChart2, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper function to get time of day styling
const getTimeOfDayStyle = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 10) {
    return {
      gradient: 'from-amber-800 via-orange-700 to-black',
      name: 'Dawn',
      icon: <Sun className="h-5 w-5 text-amber-400" />
    };
  } else if (hour >= 10 && hour < 16) {
    return {
      gradient: 'from-blue-700 via-blue-600 to-black',
      name: 'Day',
      icon: <Sun className="h-5 w-5 text-yellow-400" />
    };
  } else if (hour >= 16 && hour < 20) {
    return {
      gradient: 'from-purple-900 via-pink-800 to-black',
      name: 'Dusk',
      icon: <Sun className="h-5 w-5 text-orange-400" />
    };
  } else {
    return {
      gradient: 'from-blue-900 via-indigo-900 to-black',
      name: 'Night',
      icon: <Moon className="h-5 w-5 text-gray-200" />
    };
  }
};

function Weather() {
  const { isLoading, error, weatherData, oneCallData, setLocation, unit, setUnit } = useWeather();
  const [timeStyle, setTimeStyle] = useState(getTimeOfDayStyle());
  const [showAlert, setShowAlert] = useState(true);
  const [featuredLocations, setFeaturedLocations] = useState([
    { name: 'Laguna Seca', lat: 36.5841, lng: -121.7536, type: 'Track' },
    { name: 'Nürburgring', lat: 50.3356, lng: 6.9470, type: 'Track' },
    { name: 'Monaco', lat: 43.7384, lng: 7.4246, type: 'Circuit' },
    { name: 'Tail of the Dragon', lat: 35.4759, lng: -83.9198, type: 'Road' }
  ]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStyle(getTimeOfDayStyle());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const handleFeaturedLocationClick = (location) => {
    setLocation({
      lat: location.lat,
      lng: location.lng,
      name: location.name
    });
  };

  const getDrivingConditionText = () => {
    if (!weatherData) return { text: 'Unknown', color: 'text-gray-400' };
    
    const weatherId = weatherData.weather[0].id;
    const windSpeed = weatherData.wind.speed;
    const temp = weatherData.main.temp;
    
    // Bad conditions
    if (
      (weatherId >= 200 && weatherId < 300) || // Thunderstorm
      (weatherId >= 500 && weatherId < 600 && weatherId !== 500) || // Heavy rain
      (weatherId >= 600 && weatherId < 700) || // Snow
      (weatherId >= 700 && weatherId < 800) || // Fog, mist
      windSpeed > 20
    ) {
      return { text: 'Poor - Extreme Caution', color: 'text-red-500' };
    }
    
    // Moderate conditions
    if (
      (weatherId === 500) || // Light rain
      (weatherId >= 300 && weatherId < 400) || // Drizzle
      (unit === 'imperial' && (temp < 40 || temp > 95)) ||
      (unit === 'metric' && (temp < 4 || temp > 35)) ||
      (windSpeed > 10)
    ) {
      return { text: 'Moderate - Use Caution', color: 'text-yellow-500' };
    }
    
    // Good conditions
    return { text: 'Excellent - Enjoy Your Drive', color: 'text-green-500' };
  };
  
  const drivingCondition = getDrivingConditionText();
  
  return (
    <div className="bg-black min-h-screen">
      {/* Hero header with dynamic time-of-day gradient */}
      <div className={`bg-gradient-to-b ${timeStyle.gradient} p-10 pb-20 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('/assets/carbon-fiber-pattern.png')] opacity-30 z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {timeStyle.icon}
              <span className="text-gray-300 ml-2 text-sm">{timeStyle.name}</span>
            </div>
            
            <div className="flex items-center bg-black/50 rounded-lg p-1">
              <button 
                onClick={() => setUnit('metric')} 
                className={`px-3 py-1 text-sm rounded ${unit === 'metric' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
              >
                °C
              </button>
              <button 
                onClick={() => setUnit('imperial')} 
                className={`px-3 py-1 text-sm rounded ${unit === 'imperial' ? 'bg-blue-500 text-white' : 'text-gray-300'}`}
              >
                °F
              </button>
            </div>
          </div>
          
          <h1 className="font-orbitron text-5xl text-white mb-2 tracking-tight">
            Paddock20™ <span className="text-blue-400">Weather</span>
          </h1>
          
          <p className="text-gray-300 max-w-xl">
            Premium weather intelligence and driving condition analytics for automotive enthusiasts.
          </p>
          
          {weatherData && (
            <div className="mt-8 bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 max-w-3xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h2 className="font-medium text-2xl text-white">
                    {weatherData.name}, {weatherData.sys.country}
                  </h2>
                  <div className="flex items-center mt-2">
                    <img 
                      src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                      alt={weatherData.weather[0].description}
                      className="w-16 h-16 -ml-4 -mt-2"
                    />
                    <div>
                      <p className="text-4xl font-light text-white">
                        {Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                      </p>
                      <p className="text-gray-300 capitalize">
                        {weatherData.weather[0].description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 bg-black/30 px-4 py-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Driving Conditions</p>
                  <p className={`text-lg font-medium ${drivingCondition.color}`}>
                    {drivingCondition.text}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-black/20 p-3 rounded-lg flex items-center">
                  <Thermometer className="text-blue-400 h-5 w-5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Feels Like</p>
                    <p className="text-white">{Math.round(weatherData.main.feels_like)}°{unit === 'metric' ? 'C' : 'F'}</p>
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg flex items-center">
                  <Droplets className="text-blue-400 h-5 w-5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Humidity</p>
                    <p className="text-white">{weatherData.main.humidity}%</p>
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg flex items-center">
                  <Wind className="text-blue-400 h-5 w-5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Wind</p>
                    <p className="text-white">{Math.round(weatherData.wind.speed)} {unit === 'metric' ? 'm/s' : 'mph'}</p>
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg flex items-center">
                  <BarChart2 className="text-blue-400 h-5 w-5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-400">Pressure</p>
                    <p className="text-white">{weatherData.main.pressure} hPa</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content - shifted up to overlap with hero */}
      <div className="relative -mt-10 px-6 pb-10">
        {/* Weather alerts */}
        {showAlert && oneCallData?.alerts && oneCallData.alerts.length > 0 && (
          <div className="bg-red-900/90 backdrop-blur-sm border border-red-700 rounded-lg p-4 mb-8 relative">
            <button 
              onClick={() => setShowAlert(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ×
            </button>
            <div className="flex items-start">
              <AlertCircle className="text-red-300 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-white">Weather Alert</h3>
                <p className="text-red-200 text-sm mt-1">{oneCallData.alerts[0].description}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Featured driving destinations */}
        <div className="mb-10">
          <h2 className="font-orbitron text-xl text-blue-500 mb-4">Featured Driving Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredLocations.map((location) => (
              <button
                key={location.name}
                onClick={() => handleFeaturedLocationClick(location)}
                className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-green-500 transition-all text-left"
              >
                <div className="flex items-center mb-2">
                  <Motion className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-xs text-gray-400">{location.type}</span>
                </div>
                <p className="text-white font-medium">{location.name}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Interactive widgets section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-xl">
            <h2 className="font-orbitron text-xl text-green-500 mb-4">Garage Weather Station</h2>
            <GarageWeatherStation />
          </div>
          
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-xl">
            <h2 className="font-orbitron text-xl text-green-500 mb-4">Weather Mood Generator</h2>
            <WeatherMoodGenerator />
          </div>
        </div>

        {/* Weather Graphs and Analytics */}
        <div className="mb-12">
          <WeatherGraphs />
        </div>

        {/* Detailed weather data */}
        <div>
          <h2 className="font-orbitron text-2xl text-green-500 mb-6">
            Comprehensive Weather Intelligence
          </h2>
          <WeatherStation />
        </div>
      </div>
    </div>
  );
}

export default Weather;

// Mock Moon component since we're using night theme
const Moon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

export default Weather;
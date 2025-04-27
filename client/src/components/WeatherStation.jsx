import React, { useState, useEffect } from "react";
import axios from "axios";

function WeatherStation() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("New York");
  const [location, setLocation] = useState({ lat: 40.7128, lon: -74.0060 }); // Default to NYC

  // First get the location coordinates from the city name
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (!city) return;
        
        setLoading(true);
        
        // Get the location coordinates
        const locationResponse = await axios.get(`/api/location?q=${encodeURIComponent(city)}`);
        setLocation({
          lat: locationResponse.data.lat,
          lon: locationResponse.data.lon
        });
      } catch (err) {
        console.error("Error fetching location data:", err);
        setError("Could not find this location. Please try another city.");
        setLoading(false);
      }
    };
    
    fetchLocation();
  }, [city]);

  // Then fetch weather data using the coordinates
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        if (!location) return;
        
        setLoading(true);
        setError(null);
        
        // Get current weather data
        const weatherResponse = await axios.get(
          `/api/weather?lat=${location.lat}&lon=${location.lon}&units=metric`
        );
        
        // Get 5-day forecast
        const forecastResponse = await axios.get(
          `/api/forecast?lat=${location.lat}&lon=${location.lon}&units=metric`
        );
        
        setWeatherData(weatherResponse.data);
        setForecast(forecastResponse.data);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("Failed to load weather data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  // Helper function to get weather icon URL
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Convert temperature from Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9/5) + 32;
  };

  // Format date to display day of week
  const formatDay = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Function to get simple weather advice based on conditions
  const getWeatherAdvice = (weather) => {
    const { main, description } = weather;
    const mainLower = main.toLowerCase();
    
    if (mainLower.includes('rain') || mainLower.includes('drizzle')) {
      return "Remember to bring an umbrella.";
    } else if (mainLower.includes('snow')) {
      return "Bundle up and take care on slippery roads.";
    } else if (mainLower.includes('thunderstorm')) {
      return "Stay indoors if possible during storms.";
    } else if (mainLower.includes('clear')) {
      return "Great day for outdoor activities!";
    } else if (mainLower.includes('cloud')) {
      return "Mild conditions, good for daily tasks.";
    } else {
      return "Check local advisories for more information.";
    }
  };

  // Function to get emoji based on weather
  const getWeatherEmoji = (main) => {
    const mainLower = main.toLowerCase();
    
    if (mainLower.includes('rain') || mainLower.includes('drizzle')) {
      return "🌧️";
    } else if (mainLower.includes('snow')) {
      return "❄️";
    } else if (mainLower.includes('thunderstorm')) {
      return "⛈️";
    } else if (mainLower.includes('clear')) {
      return "☀️";
    } else if (mainLower.includes('cloud')) {
      return "☁️";
    } else if (mainLower.includes('fog') || mainLower.includes('mist')) {
      return "🌫️";
    } else {
      return "🌤️";
    }
  };

  // Filter forecast data to get one entry per day
  const getDailyForecast = () => {
    if (!forecast || !forecast.list) return [];
    
    const dailyData = [];
    const dayMap = {};
    
    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString();
      
      // Only take the first entry for each day (will usually be midnight/early morning)
      if (!dayMap[day]) {
        dayMap[day] = true;
        dailyData.push(item);
      }
    });
    
    // Return only next 5 days
    return dailyData.slice(0, 5);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-400 font-bold text-3xl">Weather Station</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-black border border-gray-700 rounded px-3 py-1 mr-2 text-white"
            placeholder="Enter city name"
          />
          <button 
            onClick={() => setCity(city)}
            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-1 rounded"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-400 p-4 rounded-md">
          {error}
        </div>
      ) : weatherData ? (
        <div>
          {/* Current Weather */}
          <div className="bg-black bg-opacity-30 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="mr-4">
                  <img 
                    src={getWeatherIconUrl(weatherData.weather[0].icon)} 
                    alt={weatherData.weather[0].description}
                    className="w-20 h-20"
                  />
                </div>
                <div>
                  <h3 className="text-2xl text-white font-bold">{weatherData.name}, {weatherData.sys.country}</h3>
                  <p className="text-gray-300">{weatherData.weather[0].main} {getWeatherEmoji(weatherData.weather[0].main)}</p>
                  <p className="text-gray-400 text-sm">{weatherData.weather[0].description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-4xl text-white font-bold">{Math.round(weatherData.main.temp)}°C</div>
                <div className="text-gray-400">{Math.round(celsiusToFahrenheit(weatherData.main.temp))}°F</div>
                <div className="text-blue-300 mt-2 text-sm">
                  Feels like: {Math.round(weatherData.main.feels_like)}°C
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black bg-opacity-50 rounded p-3 text-center">
                <div className="text-gray-400 text-xs">Humidity</div>
                <div className="text-white text-lg">{weatherData.main.humidity}%</div>
              </div>
              <div className="bg-black bg-opacity-50 rounded p-3 text-center">
                <div className="text-gray-400 text-xs">Wind</div>
                <div className="text-white text-lg">{Math.round(weatherData.wind.speed * 3.6)} km/h</div>
              </div>
              <div className="bg-black bg-opacity-50 rounded p-3 text-center">
                <div className="text-gray-400 text-xs">Pressure</div>
                <div className="text-white text-lg">{weatherData.main.pressure} hPa</div>
              </div>
              <div className="bg-black bg-opacity-50 rounded p-3 text-center">
                <div className="text-gray-400 text-xs">Visibility</div>
                <div className="text-white text-lg">{(weatherData.visibility / 1000).toFixed(1)} km</div>
              </div>
            </div>
            
            <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-800 p-4 rounded">
              <p className="text-blue-300">{getWeatherAdvice(weatherData.weather[0])}</p>
            </div>
          </div>
          
          {/* 5-Day Forecast */}
          <div>
            <h3 className="text-blue-400 font-bold text-xl mb-4">5-Day Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {getDailyForecast().map((day, index) => (
                <div key={index} className="bg-black bg-opacity-30 rounded-lg p-4 text-center">
                  <div className="text-white font-bold">{formatDay(day.dt)}</div>
                  <img 
                    src={getWeatherIconUrl(day.weather[0].icon)} 
                    alt={day.weather[0].description}
                    className="w-12 h-12 mx-auto my-2"
                  />
                  <div className="text-lg text-white">{Math.round(day.main.temp)}°C</div>
                  <div className="text-sm text-gray-400">{day.weather[0].main}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">
          No weather data available. Please enter a valid city name.
        </div>
      )}
    </div>
  );
}

export default WeatherStation;
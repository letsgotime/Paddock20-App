import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const F1MotorsportWeatherStation = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [locationName, setLocationName] = useState("");
  const { toast } = useToast();

  // Get the user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Charlotte, NC if geolocation fails
          setLocation({ lat: 35.2271, lon: -80.8431 });
          toast({
            title: "Location not available",
            description: "Using default location (Charlotte, NC)",
            variant: "warning",
          });
        }
      );
    } else {
      // Default to Charlotte, NC if geolocation is not supported
      setLocation({ lat: 35.2271, lon: -80.8431 });
      toast({
        title: "Geolocation not supported",
        description: "Using default location (Charlotte, NC)",
        variant: "warning",
      });
    }
  }, []);

  // Fetch weather data when location is available
  useEffect(() => {
    if (location.lat && location.lon) {
      fetchWeatherData();
      fetchForecastData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      const data = await response.json();
      setWeather(data);
      setLocationName(data.name);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast({
        title: "Weather data error",
        description: "Failed to load current weather data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await fetch(`/api/onecall?lat=${location.lat}&lon=${location.lon}`);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      const data = await response.json();
      
      // Extract the next 24 hours of hourly forecast data
      const hourlyData = data.hourly.slice(0, 24);
      setForecast(hourlyData);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      toast({
        title: "Forecast data error",
        description: "Failed to load forecast data",
        variant: "destructive",
      });
    }
  };

  // Function to get weather icon
  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Function to convert timestamp to time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  // Function to get F1-style tire recommendation based on weather
  const getTireRecommendation = () => {
    if (!weather) return { tire: 'Unknown', color: '#777', icon: '?' };

    const temp = weather.main.temp;
    const conditions = weather.weather[0].main.toLowerCase();
    const rain = conditions.includes('rain') || conditions.includes('drizzle');
    const thunderstorm = conditions.includes('thunderstorm');
    const snow = conditions.includes('snow');
    const heavyRain = rain && weather.rain && weather.rain['1h'] > 7;

    if (snow) {
      return { tire: 'Wet (Snow)', color: '#3366cc', icon: '❄️' };
    } else if (thunderstorm || heavyRain) {
      return { tire: 'Extreme Wet', color: '#003366', icon: '🌧️' };
    } else if (rain) {
      return { tire: 'Intermediate', color: '#00FF00', icon: '💧' };
    } else if (temp < 59) {
      return { tire: 'Hard', color: '#FFFFFF', icon: '⚪' };
    } else if (temp < 77) {
      return { tire: 'Medium', color: '#FFCC00', icon: '🟡' };
    } else {
      return { tire: 'Soft', color: '#FF0000', icon: '🔴' };
    }
  };

  // Function to get track condition based on weather
  const getTrackCondition = () => {
    if (!weather) return { condition: 'Unknown', icon: '❓' };

    const conditions = weather.weather[0].main.toLowerCase();
    const rain = conditions.includes('rain') || conditions.includes('drizzle');
    const thunderstorm = conditions.includes('thunderstorm');
    const snow = conditions.includes('snow');
    const fog = conditions.includes('fog') || conditions.includes('mist');
    const clouds = conditions.includes('cloud');
    const clear = conditions.includes('clear');

    if (snow) {
      return { condition: 'Extremely Slippery', icon: '❄️' };
    } else if (thunderstorm) {
      return { condition: 'Dangerous', icon: '⚡' };
    } else if (rain) {
      return { condition: 'Wet', icon: '💧' };
    } else if (fog) {
      return { condition: 'Low Visibility', icon: '🌫️' };
    } else if (clouds) {
      return { condition: 'Good', icon: '☁️' };
    } else if (clear) {
      return { condition: 'Perfect', icon: '☀️' };
    } else {
      return { condition: 'Normal', icon: '✓' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-400"></div>
      </div>
    );
  }

  // If we have weather data, display it
  const tireRec = getTireRecommendation();
  const trackCond = getTrackCondition();

  return (
    <div className="weather-station">
      {/* Main weather display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Current conditions */}
        <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium text-blue-400">{locationName}</h3>
              <p className="text-2xl font-bold">{Math.round(weather.main.temp)}°F</p>
              <p className="text-gray-400">{weather.weather[0].description}</p>
              <div className="flex items-center mt-2">
                <span className="text-gray-400 mr-2">Feels like:</span>
                <span>{Math.round(weather.main.feels_like)}°F</span>
              </div>
            </div>
            <img 
              src={getWeatherIcon(weather.weather[0].icon)} 
              alt={weather.weather[0].description}
              className="w-20 h-20" 
            />
          </div>
        </div>

        {/* F1 Track Conditions */}
        <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-xl font-medium text-blue-400">Track Conditions</h3>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Condition:</span>
              <span className="font-bold flex items-center">
                {trackCond.icon} {trackCond.condition}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Humidity:</span>
              <span>{weather.main.humidity}%</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Visibility:</span>
              <span>{(weather.visibility / 1609).toFixed(1)} mi</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Wind:</span>
              <span>{Math.round(weather.wind.speed)} mph</span>
            </div>
          </div>
        </div>

        {/* Tire Recommendation */}
        <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-xl font-medium text-blue-400">Tire Strategy</h3>
          <div className="mt-2 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                 style={{ backgroundColor: tireRec.color, color: tireRec.color === '#FFFFFF' ? '#000' : '#FFF', border: "2px solid #333" }}>
              <span className="text-3xl">{tireRec.icon}</span>
            </div>
            <p className="text-xl font-bold text-center">{tireRec.tire}</p>
            <p className="text-sm text-gray-400 text-center mt-1">Recommended compound for current conditions</p>
          </div>
        </div>
      </div>

      {/* Hourly forecast */}
      <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
        <h3 className="text-xl font-medium text-blue-400 mb-4">Drive Planning (24h Forecast)</h3>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {forecast.map((hour, index) => (
              <div key={index} className="flex flex-col items-center min-w-[70px]">
                <p className="text-sm text-gray-400">{formatTime(hour.dt)}</p>
                <img 
                  src={getWeatherIcon(hour.weather[0].icon)} 
                  alt={hour.weather[0].description}
                  className="w-10 h-10 my-1" 
                />
                <p className="font-medium">{Math.round(hour.temp)}°F</p>
                <p className="text-xs text-gray-400">{hour.weather[0].main}</p>
                <div className="text-xs mt-1">{Math.round(hour.pop * 100)}% <span className="text-blue-400">☔</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data source attribution */}
      <div className="text-right mt-2">
        <p className="text-xs text-gray-500">Data: OpenWeather API</p>
      </div>
    </div>
  );
};

export default F1MotorsportWeatherStation;
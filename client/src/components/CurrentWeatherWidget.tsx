import React from 'react';
import { useWeather } from '../contexts/ConsolidatedWeatherContext';
import { Star } from 'lucide-react';

// Helper function to convert temperature to dew point
const calculateDewPoint = (tempF: number, humidity: number): number => {
  // Using the Magnus-Tetens approximation
  // First convert to celsius for the calculation
  const tempC = (tempF - 32) * 5/9;
  const a = 17.27;
  const b = 237.7;
  
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100.0);
  const dewPointC = (b * alpha) / (a - alpha);
  
  // Convert back to Fahrenheit
  return (dewPointC * 9/5) + 32;
};

// Render stars based on rating
const renderStars = (rating: number) => {
  const stars = [];
  const maxStars = 5;
  
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <span 
        key={i} 
        className={i <= rating ? "text-yellow-400" : "text-gray-600"}
      >
        ★
      </span>
    );
  }
  
  return <div className="inline-flex">{stars}</div>;
};

// Helper to calculate drive rating based on weather
const calculateDriveRating = (weather: any): number => {
  if (!weather) return 3;
  
  const temp = weather.main?.temp || 70;
  const humidity = weather.main?.humidity || 50;
  const windSpeed = weather.wind?.speed || 5;
  const conditions = (weather.weather?.[0]?.main || '').toLowerCase();
  
  // Start with a perfect score
  let rating = 5;
  
  // Weather conditions impact
  if (conditions.includes('rain') || conditions.includes('drizzle')) {
    rating -= 1;
  } else if (conditions.includes('snow')) {
    rating -= 2;
  } else if (conditions.includes('thunder')) {
    rating -= 3;
  } else if (conditions.includes('fog') || conditions.includes('mist')) {
    rating -= 1;
  }
  
  // Temperature impact (ideal around 65-75°F)
  if (temp < 45 || temp > 90) {
    rating -= 1;
  } else if (temp < 55 || temp > 85) {
    rating -= 0.5;
  }
  
  // Humidity impact
  if (humidity > 85) {
    rating -= 1;
  } else if (humidity > 70) {
    rating -= 0.5;
  }
  
  // Wind impact
  if (windSpeed > 20) {
    rating -= 1.5;
  } else if (windSpeed > 15) {
    rating -= 1;
  } else if (windSpeed > 10) {
    rating -= 0.5;
  }
  
  // Ensure rating is between 1-5
  return Math.max(1, Math.min(5, Math.round(rating)));
};

const calculateGripRating = (weather: any): {rating: number, description: string} => {
  if (!weather) return { rating: 3, description: 'Average grip conditions' };
  
  const humidity = weather.main?.humidity || 50;
  const conditions = (weather.weather?.[0]?.main || '').toLowerCase();
  
  let rating = 5;
  let description = "Excellent grip conditions";
  
  // Weather impact
  if (conditions.includes('rain') || conditions.includes('drizzle')) {
    rating -= 2;
    description = "Reduced grip due to wet conditions";
  } else if (conditions.includes('snow') || conditions.includes('ice')) {
    rating -= 4;
    description = "Very poor grip due to snow/ice";
  } else if (conditions.includes('fog') || conditions.includes('mist')) {
    rating -= 0.5;
    description = "Slightly reduced grip due to moisture";
  }
  
  // Humidity impact
  if (humidity > 85) {
    rating -= 1;
    description = "Poor due to high humidity";
  } else if (humidity > 70) {
    rating -= 0.5;
    description = "Slightly reduced due to humidity";
  }
  
  return { 
    rating: Math.max(1, Math.min(5, Math.round(rating))), 
    description 
  };
};

const calculateVisibilityRating = (weather: any): {rating: number, description: string} => {
  if (!weather) return { rating: 3, description: 'Average visibility' };
  
  const visibility = weather.visibility ? weather.visibility / 10000 : 1; // Normalize to 0-1
  const conditions = (weather.weather?.[0]?.main || '').toLowerCase();
  
  let rating = 5;
  let description = "Excellent visibility";
  
  // Weather impact
  if (conditions.includes('fog') || conditions.includes('mist')) {
    rating -= 3;
    description = "Poor visibility due to fog/mist";
  } else if (conditions.includes('rain') || conditions.includes('drizzle')) {
    rating -= 1;
    description = "Reduced visibility due to precipitation";
  } else if (conditions.includes('snow')) {
    rating -= 2;
    description = "Poor visibility due to snow";
  }
  
  // Measured visibility impact
  if (visibility < 0.5) {
    rating -= 3;
    description = "Very poor visibility conditions";
  } else if (visibility < 0.8) {
    rating -= 1;
    description = "Moderately reduced visibility";
  }
  
  return { 
    rating: Math.max(1, Math.min(5, Math.round(rating))), 
    description 
  };
};

const calculateComfortRating = (weather: any): {rating: number, description: string} => {
  if (!weather) return { rating: 3, description: 'Average comfort' };
  
  const temp = weather.main?.temp || 70;
  const humidity = weather.main?.humidity || 50;
  
  let rating = 5;
  let description = "Ideal temperature for driving comfort";
  
  // Temperature impact
  if (temp < 45) {
    rating -= 2;
    description = "Uncomfortably cold driving conditions";
  } else if (temp < 55) {
    rating -= 1;
    description = "Slightly cool for optimal comfort";
  } else if (temp > 90) {
    rating -= 2;
    description = "Uncomfortably hot driving conditions";
  } else if (temp > 80) {
    rating -= 1;
    description = "Slightly warm for optimal comfort";
  }
  
  // Humidity impact on comfort
  if (humidity > 85) {
    rating -= 1;
    description = "Humid conditions impact comfort";
  } else if (humidity < 30) {
    rating -= 0.5;
    description = "Dry air may impact comfort";
  }
  
  return { 
    rating: Math.max(1, Math.min(5, Math.round(rating))), 
    description 
  };
};

const CurrentWeatherWidget: React.FC = () => {
  const { weatherData: weather, forecastData: forecast, selectedLocation, unit } = useWeather();
  
  if (!weather || !weather.main) {
    return (
      <div className="bg-black/40 p-4 rounded-lg border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700/50 rounded w-1/3 mb-3"></div>
        <div className="h-10 bg-gray-700/50 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-20 bg-gray-700/50 rounded"></div>
          <div className="h-20 bg-gray-700/50 rounded"></div>
          <div className="h-20 bg-gray-700/50 rounded"></div>
          <div className="h-20 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Calculate dew point
  const dewPoint = calculateDewPoint(weather.main.temp, weather.main.humidity);
  
  // Get detailed surface temperature from automotive data or estimate it
  const { automotiveWeatherData } = useWeather();
  
  // Base surface temperature (asphalt) - either from API or estimate
  const baseTemp = automotiveWeatherData?.conditions?.temp || (weather.main.temp + 5);
  
  // Calculate surface temperatures based on actual data or estimation model
  const surfaceTemps = {
    asphalt: baseTemp,
    concrete: baseTemp - 2,
    metal: baseTemp - 1,
    glass: baseTemp + 3,
    interior: baseTemp + 8,
  };
  
  // Calculate drive quality rating
  const driveRating = calculateDriveRating(weather);
  
  // Calculate detailed ratings
  const gripRating = calculateGripRating(weather);
  const visibilityRating = calculateVisibilityRating(weather);
  const comfortRating = calculateComfortRating(weather);
  
  // Get daily high/low if forecast available
  let highTemp = weather.main.temp_max;
  let lowTemp = weather.main.temp_min;
  
  // If forecast is available, use that for more accurate high/low
  if (forecast && forecast.list && forecast.list.length > 0) {
    // Get forecasts for today
    const today = new Date().setHours(0, 0, 0, 0);
    const todayForecasts = forecast.list.filter((item: any) => {
      const forecastDate = new Date(item.dt * 1000).setHours(0, 0, 0, 0);
      return forecastDate === today;
    });
    
    if (todayForecasts.length > 0) {
      highTemp = Math.max(...todayForecasts.map((f: any) => f.main.temp));
      lowTemp = Math.min(...todayForecasts.map((f: any) => f.main.temp));
    }
  }
  
  return (
    <div className="bg-black/40 p-4 rounded-lg border border-gray-700">
      <div className="mb-4">
        <h2 className="text-blue-400 text-lg font-medium">Current Weather</h2>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white">{weather.name}</h3>
            <p className="text-gray-400 capitalize">{weather.weather[0].description}</p>
          </div>
          <img 
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            className="w-16 h-16 -mt-2"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-4xl font-bold text-white mb-1">{Math.round(weather.main.temp)}°F</div>
          <div className="text-gray-400">Feels like {Math.round(weather.main.feels_like)}°F</div>
        </div>
        <div>
          <div className="text-gray-300">High: {Math.round(highTemp)}°</div>
          <div className="text-gray-300">Low: {Math.round(lowTemp)}°</div>
        </div>
        <div>
          <div className="text-gray-300">Drive Rating:</div>
          <div className="text-lg">{renderStars(driveRating)}</div>
        </div>
      </div>
      
      {/* Basic weather metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 text-sm">Wind</div>
          <div className="text-xl font-medium">{Math.round(weather.wind.speed)} mph</div>
        </div>
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 text-sm">Humidity</div>
          <div className="text-xl font-medium">{weather.main.humidity}%</div>
        </div>
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 text-sm">Dew Point</div>
          <div className="text-xl font-medium">{Math.round(dewPoint)}°F</div>
        </div>
        <div className="bg-black/30 rounded p-3">
          <div className="text-gray-400 text-sm">UV Index</div>
          <div className="text-xl font-medium">{automotiveWeatherData?.conditions?.uvIndex || 'N/A'}</div>
        </div>
      </div>
      
      {/* Surface temperature readings */}
      <div className="mb-6">
        <h3 className="text-blue-400 text-md font-medium mb-2">Surface Temperature Telemetry</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gradient-to-b from-black/50 to-black/30 rounded p-3">
            <div className="text-gray-400 text-sm mb-1">Asphalt</div>
            <div className="text-xl font-medium text-amber-400">{Math.round(surfaceTemps.asphalt)}°F</div>
          </div>
          <div className="bg-gradient-to-b from-black/50 to-black/30 rounded p-3">
            <div className="text-gray-400 text-sm mb-1">Concrete</div>
            <div className="text-xl font-medium text-gray-300">{Math.round(surfaceTemps.concrete)}°F</div>
          </div>
          <div className="bg-gradient-to-b from-black/50 to-black/30 rounded p-3">
            <div className="text-gray-400 text-sm mb-1">Metal</div>
            <div className="text-xl font-medium text-blue-300">{Math.round(surfaceTemps.metal)}°F</div>
          </div>
          <div className="bg-gradient-to-b from-black/50 to-black/30 rounded p-3">
            <div className="text-gray-400 text-sm mb-1">Glass</div>
            <div className="text-xl font-medium text-blue-400">{Math.round(surfaceTemps.glass)}°F</div>
          </div>
          <div className="bg-gradient-to-b from-black/50 to-black/30 rounded p-3">
            <div className="text-gray-400 text-sm mb-1">Car Interior</div>
            <div className="text-xl font-medium text-red-400">{Math.round(surfaceTemps.interior)}°F</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mb-6">
        <div className="bg-black/30 rounded p-3 flex-1 mr-2">
          <div className="text-gray-400 text-sm mb-1">Sunrise</div>
          <div className="text-md font-medium flex items-center">
            <span className="text-amber-400 mr-2">☀️</span>
            {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
          </div>
        </div>
        <div className="bg-black/30 rounded p-3 flex-1 ml-2">
          <div className="text-gray-400 text-sm mb-1">Sunset</div>
          <div className="text-md font-medium flex items-center">
            <span className="text-orange-400 mr-2">🌇</span>
            {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/20 rounded p-3">
          <div className="text-gray-300 font-medium">Road Grip</div>
          <div className="text-lg mb-1">{renderStars(gripRating.rating)}</div>
          <div className="text-sm text-gray-400">{gripRating.description}</div>
        </div>
        <div className="bg-black/20 rounded p-3">
          <div className="text-gray-300 font-medium">Visibility Factor</div>
          <div className="text-lg mb-1">{renderStars(visibilityRating.rating)}</div>
          <div className="text-sm text-gray-400">{visibilityRating.description}</div>
        </div>
        <div className="bg-black/20 rounded p-3">
          <div className="text-gray-300 font-medium">Comfort Rating</div>
          <div className="text-lg mb-1">{renderStars(comfortRating.rating)}</div>
          <div className="text-sm text-gray-400">{comfortRating.description}</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500 border-t border-gray-800 pt-2">
        <p>Data: OpenWeather API · Paddock20 Drive Metrics</p>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default CurrentWeatherWidget;
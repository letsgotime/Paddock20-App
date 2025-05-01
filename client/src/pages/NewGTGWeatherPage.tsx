import React, { useState, useEffect } from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import { useWeather } from '../contexts/WeatherContext';
import WorldClockPanel from '../components/WorldClockPanel';
import F1TelemetryWeatherStation from '../components/F1TelemetryWeatherStation';
import ApiKeyModal from '../components/ApiKeyModal';
import { submitApiKey } from '../services/apiKeyManager';
import { 
  Cloud, Sun, Wind, CloudRain, Thermometer, 
  Droplets, AlertTriangle, Gauge, Calendar, Car, Key
} from 'lucide-react';

// Mock drive quality data - would be calculated from real weather in production
const getDriveQualityRating = (temp: number, humidity: number, windSpeed: number): number => {
  // Algorithm to rate driving conditions - simple version
  // Ideal temperature around 65-75F, low humidity, low wind
  const tempFactor = Math.max(0, 5 - Math.abs(temp - 70) / 10);
  const humidityFactor = Math.max(0, 5 - (humidity / 20));
  const windFactor = Math.max(0, 5 - (windSpeed / 5));
  
  // Average the factors with weights
  const rating = Math.round((tempFactor * 0.5) + (humidityFactor * 0.3) + (windFactor * 0.2));
  
  // Return a rating between 1-5
  return Math.max(1, Math.min(5, rating));
};

// Render stars based on rating
const renderStars = (rating: number) => {
  const stars = [];
  const maxStars = 5;
  
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <span 
        key={i} 
        className={i <= rating ? "text-blue-400" : "text-gray-600"}
      >
        ★
      </span>
    );
  }
  
  return <div className="inline-flex">{stars}</div>;
};

// Generate drive windows based on forecast data
const generateDriveWindows = (forecast: any, units: string) => {
  if (!forecast || !forecast.list || forecast.list.length === 0) {
    return [];
  }
  
  const windows = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  // Format dates for comparison
  const todayStr = today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  const tomorrowStr = tomorrow.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  const dayAfterStr = dayAfter.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  
  // Calculate best 3-hour slots in the next 48 hours
  for (let i = 0; i < Math.min(16, forecast.list.length); i++) {
    const slot = forecast.list[i];
    const slotDate = new Date(slot.dt * 1000);
    const dateStr = slotDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    let dayLabel = "Today";
    
    if (dateStr === tomorrowStr) {
      dayLabel = "Tomorrow";
    } else if (dateStr === dayAfterStr) {
      dayLabel = slotDate.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    const timeRange = `${slotDate.toLocaleTimeString('en-US', { hour: 'numeric' })} - ${
      new Date(slotDate.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric' })
    }`;
    
    const temp = slot.main.temp;
    const humidity = slot.main.humidity;
    const windSpeed = slot.wind.speed;
    const weatherDesc = slot.weather[0].description;
    
    // Calculate drive quality (1-5 stars)
    const rating = getDriveQualityRating(temp, humidity, windSpeed);
    
    // Define styling based on rating
    let colorClass = "from-red-900/20 to-red-950/20";
    let borderClass = "border-red-900/40";
    
    if (rating >= 4) {
      colorClass = "from-green-900/20 to-green-950/20";
      borderClass = "border-green-900/40";
    } else if (rating >= 3) {
      colorClass = "from-blue-900/20 to-blue-950/20";
      borderClass = "border-blue-900/40";
    } else if (rating >= 2) {
      colorClass = "from-yellow-900/20 to-yellow-950/20";
      borderClass = "border-yellow-900/40";
    }
    
    // Generate a description
    let description = '';
    if (rating >= 4) {
      description = "Excellent driving conditions. Perfect for spirited driving.";
    } else if (rating >= 3) {
      description = "Good conditions for a drive. Take normal precautions.";
    } else if (rating >= 2) {
      description = "Moderate conditions. Consider a relaxed drive.";
    } else {
      description = "Poor conditions. Consider postponing your drive.";
    }
    
    windows.push({
      day: dayLabel,
      timeRange,
      description,
      rating,
      colorClass,
      borderClass,
      raw: {
        temp,
        humidity,
        windSpeed,
        weatherDesc
      }
    });
  }
  
  // Sort by rating (highest first)
  return windows.sort((a, b) => b.rating - a.rating).slice(0, 3);
};

// Generate driving tips based on current weather
const generateDrivingTips = (weather: any, forecast: any, units: string) => {
  if (!weather || !forecast) {
    return [];
  }
  
  const tips = [];
  const isImperial = units === 'imperial';
  const tempUnit = isImperial ? 'F' : 'C';
  const speedUnit = isImperial ? 'mph' : 'km/h';
  
  const currentTemp = weather.main.temp;
  const humidity = weather.main.humidity;
  const windSpeed = weather.wind.speed;
  const weatherId = weather.weather[0].id;
  const weatherMain = weather.weather[0].main;
  
  // Temperature-based tips
  if (currentTemp < (isImperial ? 40 : 4)) {
    tips.push({
      tip: `Cold temperatures (${Math.round(currentTemp)}°${tempUnit}): Allow extra warm-up time for optimal engine performance and tire pressure.`
    });
  } else if (currentTemp > (isImperial ? 90 : 32)) {
    tips.push({
      tip: `Hot temperatures (${Math.round(currentTemp)}°${tempUnit}): Monitor engine temperature closely; consider shorter driving sessions.`
    });
  }
  
  // Humidity-based tips
  if (humidity > 80) {
    tips.push({
      tip: `High humidity (${humidity}%): Expect reduced visibility from window fogging; use defogging systems.`
    });
  }
  
  // Wind-based tips
  if (windSpeed > (isImperial ? 15 : 24)) {
    tips.push({
      tip: `Strong winds (${Math.round(windSpeed)} ${speedUnit}): Be prepared for crosswind effects, especially on open roads.`
    });
  }
  
  // Weather condition-based tips
  if (weatherId >= 200 && weatherId < 300) {
    tips.push({
      tip: "Thunderstorm conditions: Consider postponing drive; lightning and sudden downpours create hazardous conditions."
    });
  } else if (weatherId >= 300 && weatherId < 600) {
    tips.push({
      tip: "Precipitation detected: Reduce speed and increase following distance. Wet surfaces reduce grip by 30-40%."
    });
  } else if (weatherId >= 600 && weatherId < 700) {
    tips.push({
      tip: "Snow/ice conditions: Switch to winter tires if available. Gentle throttle and steering inputs recommended."
    });
  } else if (weatherId >= 700 && weatherId < 800) {
    tips.push({
      tip: "Limited visibility conditions: Use low-beam headlights and maintain extra distance from other vehicles."
    });
  } else if (weatherId === 800) {
    tips.push({
      tip: "Clear conditions: Perfect opportunity for enjoying your drive, but watch for sun glare during early morning/evening."
    });
  } else if (weatherId > 800) {
    tips.push({
      tip: "Partially cloudy: Good driving conditions; ideal light for photography if documenting your journey."
    });
  }
  
  // If no specific tips were generated, add a generic one
  if (tips.length === 0) {
    tips.push({
      tip: "Standard conditions: Maintain regular driving protocols for optimal performance and safety."
    });
  }
  
  // Add seasonal tip if needed
  const month = new Date().getMonth();
  if (month >= 3 && month <= 5) { // Spring
    tips.push({
      tip: "Spring driving: Watch for increased wildlife activity near roads, especially during dawn and dusk."
    });
  } else if (month >= 6 && month <= 8) { // Summer
    tips.push({
      tip: "Summer driving: Check tire pressure more frequently as heat can cause pressure to increase beyond optimal range."
    });
  } else if (month >= 9 && month <= 11) { // Fall
    tips.push({
      tip: "Fall driving: Be cautious of wet leaves on roads which can reduce traction similar to ice conditions."
    });
  } else { // Winter
    tips.push({
      tip: "Winter driving: Lower temperatures affect battery performance; ensure yours is in optimal condition."
    });
  }
  
  return tips;
};

// Generate performance adjustments based on weather conditions
const generatePerformanceAdjustments = (weather: any, forecast: any, units: string) => {
  if (!weather || !forecast) {
    return [];
  }
  
  const adjustments = [];
  const isImperial = units === 'imperial';
  
  const currentTemp = weather.main.temp;
  const humidity = weather.main.humidity;
  const pressure = weather.main.pressure;
  const weatherId = weather.weather[0].id;
  
  // Temperature-based adjustments
  if (currentTemp < (isImperial ? 32 : 0)) {
    adjustments.push({
      adjustment: "Cold temperature compensation: Consider slightly higher tire pressure (+2-3 psi) for better handling."
    });
  } else if (currentTemp > (isImperial ? 85 : 29)) {
    adjustments.push({
      adjustment: "High temperature adjustment: Slightly lower tire pressure (-1-2 psi) to avoid overinflation issues."
    });
  }
  
  // Air density/pressure adjustments
  if (pressure < 1000) {
    adjustments.push({
      adjustment: "Low barometric pressure: Engine may experience slight power reduction due to lower air density."
    });
  } else if (pressure > 1025) {
    adjustments.push({
      adjustment: "High barometric pressure: Potential for improved engine performance due to increased air density."
    });
  }
  
  // Humidity adjustments
  if (humidity > 85) {
    adjustments.push({
      adjustment: "High humidity adaptation: Expect 1-3% power reduction; intercooler efficiency decreased."
    });
  } else if (humidity < 30) {
    adjustments.push({
      adjustment: "Low humidity performance: Better air intake efficiency; monitor engine temperatures more closely."
    });
  }
  
  // Weather condition adjustments
  if (weatherId >= 200 && weatherId < 700) {
    adjustments.push({
      adjustment: "Wet/adverse conditions: Traction control recommended; throttle response reduction advised."
    });
  } else if (weatherId === 800 || weatherId > 800) {
    adjustments.push({
      adjustment: "Clear/cloudy conditions: Standard performance profiles recommended; optimal for performance driving."
    });
  }
  
  return adjustments;
};

const NewGTGWeatherPage: React.FC = () => {
  const { 
    weatherData: currentWeather, 
    forecastData: forecast, 
    selectedLocation: location, 
    isLoading: isWeatherContextLoading, 
    unit: units,
    error: weatherContextError,
    lastUpdated,
    failureCount,
    isUsingFallbackData
  } = useWeather();
  
  // Format the error message properly
  const weatherError = weatherContextError ? 
    (weatherContextError instanceof Error ? weatherContextError.message : String(weatherContextError)) 
    : null;
  
  // Format the last updated time
  const timeLastUpdated = lastUpdated;
  
  const [isPageReady, setIsPageReady] = useState(false);
  const [driveWindows, setDriveWindows] = useState<any[]>([]);
  const [drivingTips, setDrivingTips] = useState<any[]>([]);
  const [performanceAdjustments, setPerformanceAdjustments] = useState<any[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Add a controlled delay to ensure components load properly
  useEffect(() => {
    if (!isWeatherContextLoading) {
      const timer = setTimeout(() => {
        setIsPageReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isWeatherContextLoading]);
  
  // Force the component to render even if API encounters errors
  useEffect(() => {
    const forceRender = setTimeout(() => {
      if (!isPageReady) {
        console.log("Force rendering weather page after timeout");
        setIsPageReady(true);
      }
    }, 3000);
    
    return () => clearTimeout(forceRender);
  }, [isPageReady]);
  
  // Generate drive recommendations when weather data is available
  useEffect(() => {
    if (currentWeather && forecast) {
      try {
        // Generate drive windows, tips and adjustments
        const windows = generateDriveWindows(forecast, units);
        const tips = generateDrivingTips(currentWeather, forecast, units);
        const adjustments = generatePerformanceAdjustments(currentWeather, forecast, units);
        
        // Update state
        setDriveWindows(windows);
        setDrivingTips(tips);
        setPerformanceAdjustments(adjustments);
      } catch (error) {
        console.error("Error generating drive recommendations:", error);
      }
    }
  }, [currentWeather, forecast, units]);
  
  // Weather data is ready if we have current weather data or a forced render
  const isDataReady = isPageReady && (currentWeather || weatherError);
  
  // Last update time display
  const getLastUpdateText = () => {
    if (!timeLastUpdated) return "Data unavailable";
    
    try {
      const updateTime = new Date(timeLastUpdated);
      return `Last updated: ${updateTime.toLocaleTimeString()}`;
    } catch (e) {
      return "Last update time unknown";
    }
  };
  
  // Get approptiate icon based on weather condition
  const getWeatherIcon = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300) return <CloudRain className="h-6 w-6 text-blue-400" />; // Thunderstorm
    if (weatherId >= 300 && weatherId < 400) return <CloudRain className="h-6 w-6 text-blue-400" />; // Drizzle
    if (weatherId >= 500 && weatherId < 600) return <CloudRain className="h-6 w-6 text-blue-400" />; // Rain
    if (weatherId >= 600 && weatherId < 700) return <Cloud className="h-6 w-6 text-blue-400" />; // Snow
    if (weatherId >= 700 && weatherId < 800) return <Cloud className="h-6 w-6 text-blue-400" />; // Atmosphere
    if (weatherId === 800) return <Sun className="h-6 w-6 text-yellow-400" />; // Clear
    if (weatherId > 800) return <Cloud className="h-6 w-6 text-blue-400" />; // Clouds
    
    return <Cloud className="h-6 w-6 text-blue-400" />; // Default
  };
  
  return (
    <div className="py-6" id={MAIN_CONTENT_ID}>
      {/* Page header with proper heading hierarchy */}
      <header className="mb-8 text-center">
        <h1 className="apex-header text-3xl mb-2">Weather Command Center</h1>
        <p className="text-gray-400">
          Real-time automotive weather intelligence with F1-inspired telemetry
        </p>
        <div className="text-xs text-gray-500 mt-1">{getLastUpdateText()}</div>
      </header>
      
      {/* Global Time & Conditions - primary status panel */}
      <section className="mb-6" aria-labelledby="global-circuit-heading">
        <h2 id="global-circuit-heading" className="apex-header-green text-xl mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-green-500" />
          <span>Global Clocks & Conditions</span>
        </h2>
        <WorldClockPanel />
      </section>
      
      {isWeatherContextLoading && !isDataReady ? (
        <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
          <p className="text-blue-400 text-xl font-orbitron mb-4">Loading Automotive Weather Data...</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : weatherError ? (
        <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black border border-red-900/30">
          <p className="text-blue-400 text-xl font-orbitron mb-2">Weather Station Alert</p>
          {weatherError && (weatherError.includes('429') || weatherError.includes('rate limit') || weatherError.includes('blocked')) ? (
            <>
              <div className="text-red-400 mb-2 p-2 border border-red-900/30 bg-red-950/20 rounded-md">
                <p className="mb-2">OpenWeather API rate limit reached. The API quota has been temporarily exhausted.</p>
                <p className="mb-2 text-yellow-400">
                  <span className="inline-block p-1 bg-black/30 rounded mr-1">Using cached data where possible.</span> 
                  {isUsingFallbackData && "Displaying cached data from previous successful requests."}
                </p>
                <p className="text-sm text-gray-400">
                  API services will automatically resume when the rate limit period ends (typically within 24 hours).
                </p>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  ⟳ Refresh Now
                </button>
                <button 
                  onClick={() => setShowApiKeyModal(true)} 
                  className="px-4 py-2 bg-black border border-blue-700 text-blue-400 rounded-md hover:bg-blue-900/20 transition-colors flex items-center"
                >
                  <Key className="h-4 w-4 mr-2" /> Use My API Key
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-red-400 mb-4">
                {weatherError === '[object Object]' 
                  ? 'Error fetching weather data' 
                  : weatherError}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ⟳ Refresh Data
              </button>
            </>
          )}
        </div>
      ) : !currentWeather ? (
        <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
          <p className="text-blue-400 text-xl font-orbitron mb-2">Weather Station</p>
          <p className="text-gray-400">No weather data available. Please check your connection.</p>
        </div>
      ) : (
        <>
          {/* F1-style motorsport weather dashboard */}
          <section className="mb-10" aria-labelledby="paddock-weather-heading">
            <h2 id="paddock-weather-heading" className="apex-header-green text-xl mb-4 flex items-center">
              <Gauge className="h-5 w-5 mr-2 text-green-500" />
              <span>Motorsport Weather Telemetry</span>
            </h2>
            <div className="rounded-lg bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800 p-6">
              {isDataReady && <F1TelemetryWeatherStation />}
            </div>
          </section>
          
          {/* Current Weather Overview Card */}
          <section className="mb-10" aria-labelledby="current-weather-heading">
            <h2 id="current-weather-heading" className="apex-header-green text-xl mb-4 flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-green-500" />
              <span>Current Weather</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Main weather card */}
              <div className="lg:col-span-3 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl text-white flex items-center gap-2">
                        {location?.name || "Current Location"}
                        {currentWeather.weather && getWeatherIcon(currentWeather.weather[0].id)}
                      </h3>
                      <p className="text-gray-400 capitalize">{currentWeather.weather[0].description}</p>
                      <div className="mt-4 flex flex-wrap gap-6">
                        <div>
                          <p className="text-4xl font-orbitron text-blue-400">
                            {Math.round(currentWeather.main.temp)}°{units === 'imperial' ? 'F' : 'C'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Feels like {Math.round(currentWeather.main.feels_like)}°{units === 'imperial' ? 'F' : 'C'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-300">High: {Math.round(currentWeather.main.temp_max)}°</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-300">Low: {Math.round(currentWeather.main.temp_min)}°</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="inline-block rounded-full bg-green-900/30 border border-green-900/50 px-3 py-1">
                        <p className="text-sm text-green-400 flex items-center">
                          <Car className="h-3 w-3 mr-1" />
                          Drive Rating: {renderStars(getDriveQualityRating(
                            currentWeather.main.temp,
                            currentWeather.main.humidity,
                            currentWeather.wind.speed
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Weather metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-gray-800">
                  <div className="p-3 border-r border-gray-800">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-500" />
                      <p className="text-gray-400 text-sm">Wind</p>
                    </div>
                    <p className="text-white">{Math.round(currentWeather.wind.speed)} {units === 'imperial' ? 'mph' : 'km/h'}</p>
                  </div>
                  <div className="p-3 sm:border-r border-gray-800">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <p className="text-gray-400 text-sm">Humidity</p>
                    </div>
                    <p className="text-white">{currentWeather.main.humidity}%</p>
                  </div>
                  <div className="p-3 border-t sm:border-t-0 border-r border-gray-800">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-blue-500" />
                      <p className="text-gray-400 text-sm">Pressure</p>
                    </div>
                    <p className="text-white">{currentWeather.main.pressure} hPa</p>
                  </div>
                  <div className="p-3 border-t sm:border-t-0 border-gray-800">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <p className="text-gray-400 text-sm">Visibility</p>
                    </div>
                    <p className="text-white">{(currentWeather.visibility / 1000).toFixed(1)} km</p>
                  </div>
                </div>
              </div>
              
              {/* Drive quality metrics */}
              <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-5">
                <h3 className="text-green-500 text-lg font-orbitron mb-3">Drive Quality Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Road Grip</span>
                      <span className="text-blue-400">{renderStars(Math.min(5, Math.max(1, 5 - (currentWeather.main.humidity / 20))))}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, 100 - (currentWeather.main.humidity))}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentWeather.main.humidity > 80 ? 'Poor due to high humidity' : 
                       currentWeather.main.humidity > 60 ? 'Fair grip conditions' : 'Excellent grip'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Visibility Factor</span>
                      <span className="text-blue-400">{renderStars(
                        currentWeather.weather[0].id >= 700 && currentWeather.weather[0].id < 800 ? 2 :
                        currentWeather.weather[0].id >= 300 && currentWeather.weather[0].id < 700 ? 3 :
                        5
                      )}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${
                        currentWeather.weather[0].id >= 700 && currentWeather.weather[0].id < 800 ? 40 :
                        currentWeather.weather[0].id >= 300 && currentWeather.weather[0].id < 700 ? 60 :
                        100
                      }%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentWeather.weather[0].id >= 700 && currentWeather.weather[0].id < 800 ? 'Reduced visibility conditions' :
                       currentWeather.weather[0].id >= 300 && currentWeather.weather[0].id < 700 ? 'Moderate visibility' :
                       'Excellent visibility'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Comfort Rating</span>
                      <span className="text-blue-400">{renderStars(Math.min(5, Math.max(1, 5 - Math.abs(currentWeather.main.temp - 70) / 10)))}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, 100 - (Math.abs(currentWeather.main.temp - 70) * 3))}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.abs(currentWeather.main.temp - 70) > 20 ? 'Weather extremes affecting comfort' :
                       Math.abs(currentWeather.main.temp - 70) > 10 ? 'Moderate comfort level' :
                       'Ideal temperature for driving comfort'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Upcoming Drive Planner Section */}
          <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="drive-planner-heading">
            <h2 id="drive-planner-heading" className="apex-header text-xl mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Upcoming Drive Planner</span>
            </h2>
            <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-green-500 font-semibold">Optimal Drive Windows</h3>
                <span className="text-xs text-gray-400">Next 48 Hours</span>
              </div>
              
              {driveWindows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {driveWindows.map((window, index) => (
                    <div 
                      key={index} 
                      className={`bg-gradient-to-r ${window.colorClass} p-3 rounded-lg border ${window.borderClass}`}
                    >
                      <div className="flex justify-between">
                        <span className="text-white font-medium">{window.day}</span>
                        <span className="text-blue-400">{renderStars(window.rating)}</span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{window.timeRange}</p>
                      <p className="text-gray-400 text-xs mt-2">{window.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-gray-800/20 border border-gray-700 text-center">
                  <p className="text-gray-300">No optimal driving windows available for the next 48 hours.</p>
                  <p className="text-gray-400 text-sm mt-2">Check back later for updated recommendations</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Quick Tips Section */}
          <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="quick-tips-heading">
            <h2 id="quick-tips-heading" className="apex-header text-xl mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Driving Recommendations</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <h3 className="text-green-500 font-semibold mb-2 flex items-center">
                  <Thermometer className="w-4 h-4 mr-2" />
                  Today's Driving Tips
                </h3>
                {drivingTips.length > 0 ? (
                  <ul className="text-gray-300 text-sm space-y-2">
                    {drivingTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-400 mr-2">→</span>
                        <span>{tip.tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No driving tips available based on current conditions.</p>
                )}
              </div>
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <h3 className="text-green-500 font-semibold mb-2 flex items-center">
                  <Wind className="w-4 h-4 mr-2" />
                  Performance Adjustments
                </h3>
                {performanceAdjustments.length > 0 ? (
                  <ul className="text-gray-300 text-sm space-y-2">
                    {performanceAdjustments.map((adjustment, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-400 mr-2">→</span>
                        <span>{adjustment.adjustment}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No performance adjustments available based on current conditions.</p>
                )}
              </div>
            </div>
          </section>
          
          {/* Vehicle-Specific Recommendations */}
          <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="vehicle-recommendations-heading">
            <h2 id="vehicle-recommendations-heading" className="apex-header text-xl mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2" />
              <span>Vehicle-Specific Recommendations</span>
            </h2>
            <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <h3 className="text-green-500 font-semibold">Select Your Vehicle</h3>
                <div className="mt-2 sm:mt-0 flex items-center">
                  <select className="bg-black border border-gray-700 text-white rounded px-3 py-1 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">-- Select vehicle --</option>
                    <option value="911">Porsche 911 Carrera S</option>
                    <option value="m3">BMW M3 Competition</option>
                    <option value="gt">Ford Mustang GT</option>
                    <option value="miata">Mazda MX-5 Miata</option>
                  </select>
                  <button className="ml-2 px-3 py-1 bg-blue-900/50 text-blue-400 rounded text-sm hover:bg-blue-800/50">Load</button>
                </div>
              </div>
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">Select a vehicle to view tailored performance recommendations based on current weather conditions</p>
              </div>
            </div>
          </section>
          
          {/* Weather accessibility information */}
          <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="accessibility-heading">
            <h2 id="accessibility-heading" className="apex-header-green text-xl mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-green-500" />
              <span>Accessibility Features</span>
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Weather data is fully accessible to screen readers</li>
              <li>Use the "Listen to Weather Report" button to hear detailed weather information</li>
              <li>All weather conditions include text alternatives to emoji representations</li>
              <li>Weather alerts and driving recommendations are optimized for assistive technologies</li>
              <li>Keyboard navigation is fully supported throughout the weather interface</li>
            </ul>
          </section>
        </>
      )}
    </div>
    
    {/* API Key Modal */}
    <ApiKeyModal
      isOpen={showApiKeyModal}
      onClose={() => setShowApiKeyModal(false)}
      onSubmit={async (apiKey) => {
        try {
          await submitApiKey('openweather', apiKey);
          // Force reload to use the new API key
          window.location.reload();
          return true;
        } catch (error) {
          console.error("API key validation failed:", error);
          throw new Error("Invalid API key or validation failed");
        }
      }}
      serviceName="OpenWeather"
      serviceDescription="Provide your personal OpenWeather API key to bypass rate limits. You can get a free API key by signing up at openweathermap.org."
    />
  );
};

export default NewGTGWeatherPage;
import React, { useState, useEffect } from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import { useWeather } from '../contexts/FixedWeatherContext';
import WorldClockPanel from '../components/WorldClockPanel';
import CurrentWeatherWidget from '../components/CurrentWeatherWidget';
import F1TelemetryWeatherStation from '../components/F1TelemetryWeatherStation';
import PrecipitationWidget from '../components/PrecipitationWidget';
import NavigationLinkWidget from '../components/NavigationLinkWidget';
import ApiKeyModal from '../components/ApiKeyModal';
import { submitApiKey } from '../services/apiKeyManager';
import ContextualWeatherRoutePlanner from '../components/ContextualWeatherRoutePlanner';
import PersonalizedWeatherClothingRecommendations from '../components/PersonalizedWeatherClothingRecommendations';
import EcoDrivingPerformanceTracker from '../components/EcoDrivingPerformanceTracker';
import PredictiveRouteWeatherWarnings from '../components/PredictiveRouteWeatherWarnings';
import DetailedCommuteAnalytics from '../components/DetailedCommuteAnalytics';
import OneTapWeatherSnapshot from '../components/OneTapWeatherSnapshot';
import { 
  Cloud, Sun, Wind, CloudRain, Thermometer, 
  Droplets, AlertTriangle, Gauge, Calendar, Car, Key,
  Crosshair, Building, Clock, MapPin, Navigation, Home,
  CornerDownRight, Timer, Landmark, Flag, ArrowRight, Star,
  BarChart2, XCircle
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
      tip: "Partially cloudy: Good driving conditions; ideal light for photography if documenting your route."
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
  
  // Manifestation Station style UI state
  const [activeTab, setActiveTab] = useState<'telemetry' | 'driveWindows' | 'recommendations' | 'performance' | 'commute'>('commute');
  const [selectedDriveWindow, setSelectedDriveWindow] = useState<any>(null);
  const [selectedCommuteLocation, setSelectedCommuteLocation] = useState<string | null>(null);
  
  // Favorite locations for Commute Tracker
  const [favoriteLocations, setFavoriteLocations] = useState<{
    id: string;
    name: string;
    type: 'work' | 'school' | 'family' | 'track' | 'favorite' | 'custom';
    icon: React.ReactNode;
    distance: number; // Distance in miles
    travelTime: number; // Average travel time in minutes
    lat: number;
    lon: number;
    weatherImpact: number; // 0-10 scale of weather impact on commute
    tireRecommendation: string;
  }[]>([
    { 
      id: 'work1', 
      name: 'Work Office', 
      type: 'work', 
      icon: <Building size={18} />, 
      distance: 12.4, 
      travelTime: 24, 
      lat: 35.2271, 
      lon: -80.4431, 
      weatherImpact: 2,
      tireRecommendation: 'All-Season'
    },
    { 
      id: 'home1', 
      name: 'Parent\'s House', 
      type: 'family', 
      icon: <Home size={18} />, 
      distance: 34.7, 
      travelTime: 42, 
      lat: 35.4271, 
      lon: -80.6431, 
      weatherImpact: 3,
      tireRecommendation: 'Summer'
    },
    { 
      id: 'track1', 
      name: 'Charlotte Motor Speedway', 
      type: 'track', 
      icon: <Flag size={18} />, 
      distance: 22.1, 
      travelTime: 28, 
      lat: 35.3527, 
      lon: -80.6827, 
      weatherImpact: 1,
      tireRecommendation: 'Performance'
    },
    { 
      id: 'school1', 
      name: 'University Campus', 
      type: 'school', 
      icon: <Landmark size={18} />, 
      distance: 8.3, 
      travelTime: 17, 
      lat: 35.3071, 
      lon: -80.7331, 
      weatherImpact: 2,
      tireRecommendation: 'All-Season'
    },
    { 
      id: 'fav1', 
      name: 'Mountain Drive Route', 
      type: 'favorite', 
      icon: <Star size={18} />, 
      distance: 68.2, 
      travelTime: 105, 
      lat: 35.5671, 
      lon: -81.4831, 
      weatherImpact: 4,
      tireRecommendation: 'Performance'
    }
  ]);
  
  // Selected favorite location for detailed view
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
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
        <h1 className="apex-header text-3xl mb-2">Weather Paddock</h1>
        <p className="text-gray-400">
          Real-time automotive weather intelligence with F1-inspired telemetry
        </p>
        <div className="text-xs text-gray-500 mt-1">{getLastUpdateText()}</div>
      </header>
      
      {/* Global Time & Conditions - primary status panel */}
      <section className="mb-6" aria-labelledby="current-weather-heading">
        <h2 id="current-weather-heading" className="apex-header-green text-xl mb-4 flex items-center">
          <Cloud className="h-5 w-5 mr-2 text-green-500" />
          <span>Current Conditions & Telemetry</span>
        </h2>
        <CurrentWeatherWidget />
      </section>
      
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
        <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black border border-blue-900/30">
          <p className="text-blue-400 text-xl font-orbitron mb-2">Weather Station Status</p>
          {weatherError && (weatherError.includes('429') || weatherError.includes('rate limit') || weatherError.includes('blocked')) ? (
            <>
              <div className="mb-2 p-4 border border-blue-900/30 bg-blue-950/10 rounded-md">
                <p className="mb-2 text-blue-300">Weather data synchronization in progress. Telemetry stabilization active.</p>
                <p className="mb-2 text-gray-300">
                  <span className="inline-block p-1 bg-black/40 rounded mr-1">Using locally cached telemetry.</span> 
                  {isUsingFallbackData && "Weather patterns from previous sessions loaded."}
                </p>
                <p className="text-sm text-gray-400">
                  Real-time services will resume automatically during the next system refresh.
                </p>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md hover:from-blue-700 hover:to-blue-900 transition-all"
                >
                  ⟳ Synchronize Now
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-black border border-blue-700 text-blue-400 rounded-md hover:bg-blue-900/20 transition-colors flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Stop
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 p-4 border border-blue-900/30 bg-blue-950/10 rounded-md">
                <p className="text-gray-300 mb-4">
                  Temporary service interruption. Weather connectivity is being re-established.
                </p>
                <p className="text-xs text-gray-500">
                  Technical details: {weatherError === '[object Object]' ? 'Error fetching weather data' : weatherError}
                </p>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md hover:from-blue-700 hover:to-blue-900 transition-all"
                >
                  ⟳ Reconnect Services
                </button>
              </div>
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
          {/* Drive Command Center */}
          {/* Global Navigation and Precipitation Components */}
          <section className="mb-10" aria-labelledby="global-weather-nav-heading">
            <h2 id="global-weather-nav-heading" className="apex-header-green text-xl mb-4 flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-green-500" />
              <span>Weather-Informed Navigation Suite</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <NavigationLinkWidget 
                  currentLocation={currentWeather ? { 
                    name: currentWeather.name || "Current Location", 
                    lat: currentWeather.coord.lat, 
                    lon: currentWeather.coord.lon 
                  } : undefined}
                  favoriteLocations={favoriteLocations.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    latitude: loc.lat,
                    longitude: loc.lon,
                    type: loc.type,
                    icon: loc.icon
                  }))}
                />
              </div>
              
              <div className="lg:col-span-1">
                <PrecipitationWidget />
              </div>
            </div>
          </section>
          
          {/* Additional Weather Tools */}
          <section className="mb-10" aria-labelledby="weather-tools-heading">
            <h2 id="weather-tools-heading" className="apex-header-green text-xl mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-green-500" />
              <span>Route Planning & Performance Tools</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="lg:col-span-1">
                <ContextualWeatherRoutePlanner 
                  favoriteLocations={favoriteLocations.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    latitude: loc.lat,
                    longitude: loc.lon,
                    type: loc.type,
                    icon: loc.icon
                  }))}
                />
              </div>
              
              <div className="lg:col-span-1">
                <PersonalizedWeatherClothingRecommendations />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
              <div className="lg:col-span-1">
                <PredictiveRouteWeatherWarnings />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
              <div className="lg:col-span-1">
                <EcoDrivingPerformanceTracker />
              </div>
            </div>
          </section>

          {/* Drive Command Center */}
          <section className="mb-10" aria-labelledby="drive-command-center-heading">
            <h2 id="drive-command-center-heading" className="apex-header-green text-xl mb-4 flex items-center">
              <Gauge className="h-5 w-5 mr-2 text-green-500" />
              <span>Drive Command Center</span>
            </h2>
            <div className="rounded-lg bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800">
              {/* Interactive Navigation Tabs */}
              <div className="flex border-b border-blue-900/30 p-2 overflow-x-auto hide-scrollbar">
                <button
                  className={`px-4 py-2 mr-2 rounded-t-lg ${
                    activeTab === 'commute' 
                      ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/10'
                  } transition-all flex items-center`}
                  onClick={() => setActiveTab('commute')}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  <span>Commute Tracker</span>
                </button>
                <button
                  className={`px-4 py-2 mr-2 rounded-t-lg ${
                    activeTab === 'telemetry' 
                      ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/10'
                  } transition-all flex items-center`}
                  onClick={() => setActiveTab('telemetry')}
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  <span>F1 Telemetry</span>
                </button>
                <button
                  className={`px-4 py-2 mr-2 rounded-t-lg ${
                    activeTab === 'driveWindows' 
                      ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/10'
                  } transition-all flex items-center`}
                  onClick={() => setActiveTab('driveWindows')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Drive Windows</span>
                </button>
                <button
                  className={`px-4 py-2 mr-2 rounded-t-lg ${
                    activeTab === 'recommendations' 
                      ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/10'
                  } transition-all flex items-center`}
                  onClick={() => setActiveTab('recommendations')}
                >
                  <Car className="h-4 w-4 mr-2" />
                  <span>Driver Recommendations</span>
                </button>
                <button
                  className={`px-4 py-2 mr-2 rounded-t-lg ${
                    activeTab === 'performance' 
                      ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/10'
                  } transition-all flex items-center`}
                  onClick={() => setActiveTab('performance')}
                >
                  <Crosshair className="h-4 w-4 mr-2" />
                  <span>Performance Settings</span>
                </button>
              </div>
              
              {/* Tab content area */}
              <div className="p-6">
                {/* F1 Telemetry Tab */}
                {activeTab === 'telemetry' && (
                  <div className="animate-fadein">
                    {isDataReady && <F1TelemetryWeatherStation />}
                  </div>
                )}
                
                {/* Drive Windows Tab */}
                {activeTab === 'driveWindows' && (
                  <div className="animate-fadein">
                    {selectedDriveWindow ? (
                      <div className="bg-black/30 rounded-lg p-4 border border-blue-900/30 relative">
                        <button 
                          onClick={() => setSelectedDriveWindow(null)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          aria-label="Close drive window details"
                        >
                          ✕
                        </button>
                        
                        <div className="flex items-center mb-3">
                          <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                          <h4 className="text-blue-400 font-bold">Drive Window: {selectedDriveWindow.day}, {selectedDriveWindow.timeRange}</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-black/20 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Drive Quality</div>
                            <div className="text-white">{renderStars(selectedDriveWindow.rating)}</div>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Weather</div>
                            <div className="text-white capitalize">{selectedDriveWindow.raw.weatherDesc}</div>
                          </div>
                          <div className="bg-black/20 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Temperature</div>
                            <div className="text-white">{Math.round(selectedDriveWindow.raw.temp)}°{units === 'imperial' ? 'F' : 'C'}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-gray-300 mb-2 text-sm">Recommended Drive Type:</h4>
                            <div className="p-3 rounded-lg bg-blue-900/20 text-blue-300">
                              {selectedDriveWindow.rating >= 4 ? 'Performance Drive - Ideal conditions for spirited driving.' : 
                               selectedDriveWindow.rating >= 3 ? 'Leisure Drive - Good conditions for enjoying the scenery.' :
                               selectedDriveWindow.rating >= 2 ? 'Casual Drive - Take it easy and be more cautious.' :
                               'Essential Drive Only - Consider postponing unless necessary.'}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-gray-300 mb-2 text-sm">Weather Impact:</h4>
                            <div className="p-3 rounded-lg bg-blue-900/20 text-blue-300">
                              Temperature: {Math.round(selectedDriveWindow.raw.temp)}°{units === 'imperial' ? 'F' : 'C'}<br />
                              Humidity: {selectedDriveWindow.raw.humidity}%<br />
                              Wind: {Math.round(selectedDriveWindow.raw.windSpeed)}{units === 'imperial' ? 'mph' : 'km/h'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md hover:from-blue-700 hover:to-blue-900 transition-all">
                            Add to Driving Calendar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-400 mb-4">Select the optimal driving time based on weather conditions:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {driveWindows.length > 0 ? (
                            driveWindows.map((window, index) => (
                              <div 
                                key={index} 
                                className={`rounded-lg p-4 border bg-gradient-to-br ${window.colorClass} ${window.borderClass} hover:border-blue-500 transition-all cursor-pointer`}
                                onClick={() => setSelectedDriveWindow(window)}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-white font-semibold">{window.day}</span>
                                  <span className="text-gray-300 text-sm">{window.timeRange}</span>
                                </div>
                                <div className="mb-2">
                                  {renderStars(window.rating)}
                                </div>
                                <p className="text-gray-300 text-sm mb-3">{window.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                  <div>Temp: <span className="text-gray-300">{Math.round(window.raw.temp)}°{units === 'imperial' ? 'F' : 'C'}</span></div>
                                  <div>Humidity: <span className="text-gray-300">{window.raw.humidity}%</span></div>
                                  <div>Wind: <span className="text-gray-300">{Math.round(window.raw.windSpeed)}{units === 'imperial' ? 'mph' : 'km/h'}</span></div>
                                  <div>Conditions: <span className="text-gray-300">{window.raw.weatherDesc}</span></div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 text-center p-4 rounded-lg bg-gradient-to-br from-gray-900 to-black border border-gray-800">
                              <p className="text-gray-400">No forecast data available to generate drive windows.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Driver Recommendations Tab */}
                {activeTab === 'recommendations' && (
                  <div className="animate-fadein">
                    <div className="rounded-lg border border-green-900/30 overflow-hidden mb-6">
                      <div className="bg-green-900/20 px-4 py-2 flex justify-between items-center">
                        <h3 className="text-green-400 font-semibold">Current Driving Tips</h3>
                        <span className="text-xs text-gray-400">Based on current weather</span>
                      </div>
                      <div className="p-4 bg-black/20">
                        <ul className="space-y-3">
                          {drivingTips.length > 0 ? (
                            drivingTips.map((item, index) => (
                              <li key={index} className="flex items-start p-2 hover:bg-blue-900/10 rounded-md transition-colors group">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center text-xs text-green-400 mr-3 mt-0.5 group-hover:bg-green-800/50">
                                  {index + 1}
                                </span>
                                <div>
                                  <span className="text-gray-300 text-sm">{item.tip}</span>
                                  <div className="mt-1 text-xs text-gray-500 hidden group-hover:block transition-all">
                                    <button className="bg-green-900/20 text-green-400 px-2 py-1 rounded-l border border-green-900/30">Apply</button>
                                    <button className="bg-black/50 text-gray-400 px-2 py-1 rounded-r border border-gray-800">Ignore</button>
                                  </div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-400">No driving tips available with current data.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-blue-900/30 rounded-lg bg-blue-900/10">
                      <h3 className="text-blue-400 font-semibold mb-2">Add Custom Driving Goal</h3>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          placeholder="Enter your driving goal..." 
                          className="flex-1 bg-black/50 border border-blue-900/30 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                        />
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Commute Tracker Tab */}
                {activeTab === 'commute' && (
                  <div className="animate-fadein">
                    <div className="rounded-lg border border-blue-900/30 overflow-hidden mb-6">
                      <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
                        <h3 className="text-blue-400 font-semibold flex items-center">
                          <Navigation className="h-4 w-4 mr-2" />
                          <span>Favorite Destinations & Commute Analytics</span>
                        </h3>
                        <span className="text-xs text-gray-400">Real-time route conditions</span>
                      </div>
                      
                      <div className="p-4 bg-black/20">
                        {/* Destination cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          {favoriteLocations.map((location) => (
                            <div 
                              key={location.id}
                              onClick={() => {
                                // If this is the selected location, toggle between basic and detailed view
                                if (location.id === selectedLocation) {
                                  setSelectedCommuteLocation(location.id);
                                  setSelectedLocation(null);
                                } else {
                                  // Otherwise, just select this location for basic view
                                  setSelectedLocation(location.id);
                                  setSelectedCommuteLocation(null);
                                }
                              }}
                              className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                                location.id === selectedLocation 
                                  ? 'bg-blue-900/30 border-2 border-blue-500' 
                                  : 'bg-black/40 border border-gray-800 hover:border-blue-800'
                              }`}
                            >
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  location.weatherImpact <= 2 ? 'bg-green-900/40 text-green-400' :
                                  location.weatherImpact <= 5 ? 'bg-blue-900/40 text-blue-400' :
                                  location.weatherImpact <= 7 ? 'bg-yellow-900/40 text-yellow-400' :
                                  'bg-red-900/40 text-red-400'
                                }`}>
                                  Impact: {location.weatherImpact}/10
                                </span>
                              </div>
                              
                              <div className="flex items-center mb-2">
                                <span className="mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                                  {location.icon}
                                </span>
                                <div>
                                  <h4 className="text-white text-md font-semibold">{location.name}</h4>
                                  <p className="text-xs text-gray-400 capitalize">{location.type} destination</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1.5 text-gray-500" />
                                  <span className="text-gray-300">{location.travelTime} mins</span>
                                </div>
                                <div className="flex items-center">
                                  <ArrowRight className="h-3 w-3 mr-1.5 text-gray-500" />
                                  <span className="text-gray-300">{location.distance} miles</span>
                                </div>
                                <div className="flex items-center col-span-2">
                                  <Car className="h-3 w-3 mr-1.5 text-gray-500" />
                                  <span className="text-gray-300">{location.tireRecommendation} tires recommended</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Selected location details - basic overview */}
                        {selectedLocation && !selectedCommuteLocation && (
                          <div className="mt-4 p-4 rounded-lg bg-blue-900/10 border border-blue-900/40 animate-fadein">
                            {favoriteLocations.filter(loc => loc.id === selectedLocation).map((loc) => (
                              <div key={`detail-${loc.id}`}>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-xl text-blue-400 font-orbitron flex items-center">
                                    {loc.icon}
                                    <span className="ml-2">{loc.name}</span>
                                  </h4>
                                  <span className="text-xs px-3 py-1 rounded-full bg-blue-900/40 text-blue-300">
                                    {loc.type === 'track' ? 'Performance route' : 
                                     loc.type === 'work' ? 'Daily commute' : 
                                     loc.type === 'family' ? 'Regular visit' : 
                                     loc.type === 'school' ? 'Learning route' : 
                                     'Favorite drive'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="bg-black/50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1">Route Time</p>
                                    <p className="text-white font-bold text-lg">{loc.travelTime} mins</p>
                                    <div className="mt-1 text-xs text-gray-400">
                                      {loc.weatherImpact <= 2 ? 'No current delays' : 
                                       loc.weatherImpact <= 5 ? 'Minor delays possible' : 
                                       loc.weatherImpact <= 7 ? 'Moderate delays likely' : 
                                       'Significant delays expected'}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-black/50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1">Weather Impact</p>
                                    <div className="flex items-center">
                                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${
                                            loc.weatherImpact <= 2 ? 'bg-green-500' :
                                            loc.weatherImpact <= 5 ? 'bg-blue-500' :
                                            loc.weatherImpact <= 7 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                          }`} 
                                          style={{ width: `${loc.weatherImpact * 10}%` }}
                                        ></div>
                                      </div>
                                      <span className="ml-2 text-white font-bold">{loc.weatherImpact}/10</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                      {loc.weatherImpact <= 2 ? 'Optimal driving conditions' : 
                                       loc.weatherImpact <= 5 ? 'Good conditions with minor concerns' : 
                                       loc.weatherImpact <= 7 ? 'Challenging conditions - use caution' : 
                                       'Severe conditions - consider postponing'}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-black/50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs mb-1">Tire Recommendation</p>
                                    <p className="text-white font-bold">{loc.tireRecommendation}</p>
                                    <div className="mt-1 text-xs text-gray-400">
                                      {loc.tireRecommendation === 'Performance' ? 'Maximizes grip in current dry conditions' : 
                                       loc.tireRecommendation === 'All-Season' ? 'Balanced performance for varied conditions' : 
                                       loc.tireRecommendation === 'Summer' ? 'Optimized for warm, dry conditions' : 
                                       'Specialized for current weather patterns'}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="bg-black/50 p-3 rounded-lg border border-blue-900/30">
                                    <h5 className="text-blue-400 text-sm font-bold mb-2">Weather Telemetry for Route</h5>
                                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                                      <div className="flex items-center">
                                        <Thermometer className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Surface Temp:</span>
                                        <span className="ml-1 text-white">68°F</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Wind className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Crosswind:</span>
                                        <span className="ml-1 text-white">8 mph</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Droplets className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Precipitation:</span>
                                        <span className="ml-1 text-white">0%</span>
                                      </div>
                                      <div className="flex items-center">
                                        <CloudRain className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Road Condition:</span>
                                        <span className="ml-1 text-white">Dry</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-black/50 p-3 rounded-lg border border-blue-900/30">
                                    <h5 className="text-blue-400 text-sm font-bold mb-2">F1-Derived Telemetry Projection</h5>
                                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                                      <div className="flex items-center">
                                        <Gauge className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Optimal Torque:</span>
                                        <span className="ml-1 text-white">95%</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Gauge className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Tire Pressure:</span>
                                        <span className="ml-1 text-white">34.2 psi</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Gauge className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Grip Level:</span>
                                        <span className="ml-1 text-white">High</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Gauge className="h-3 w-3 mr-2 text-gray-500" />
                                        <span className="text-gray-400">Perfomance Index:</span>
                                        <span className="ml-1 text-white">8.5/10</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-6 px-2">
                                  <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded flex items-center">
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Start Navigation
                                  </button>
                                  <button className="px-3 py-1.5 text-sm bg-black border border-blue-900 text-blue-400 rounded flex items-center">
                                    <Timer className="h-4 w-4 mr-2" />
                                    Set Departure Alert
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Detailed Commute Analytics */}
                        {selectedCommuteLocation && (
                          <div className="mt-4 bg-blue-900/10 border border-blue-900/40 rounded-lg animate-fadein overflow-hidden">
                            <div className="bg-black/20 px-4 py-2 flex justify-between items-center">
                              <h3 className="text-blue-400 font-semibold flex items-center">
                                <BarChart2 className="h-4 w-4 mr-2" />
                                <span>Advanced Commute Analytics</span>
                              </h3>
                              <button 
                                onClick={() => setSelectedCommuteLocation(null)}
                                className="text-xs px-2 py-1 bg-black/50 text-blue-400 rounded hover:bg-blue-900/20 transition-colors"
                              >
                                ← Back to Overview
                              </button>
                            </div>
                            
                            <div className="p-4">
                              {favoriteLocations.filter(loc => loc.id === selectedCommuteLocation).map((loc) => (
                                <DetailedCommuteAnalytics key={`analytics-${loc.id}`} location={loc} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add new destination button */}
                        <div className="mt-4 flex justify-end">
                          <button className="flex items-center text-sm bg-blue-800/30 hover:bg-blue-800/50 text-blue-300 px-3 py-1.5 rounded transition">
                            <MapPin className="h-4 w-4 mr-2" />
                            Add New Destination
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Performance Settings Tab */}
                {activeTab === 'performance' && (
                  <div className="animate-fadein">
                    <div className="rounded-lg border border-blue-900/30 overflow-hidden">
                      <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
                        <h3 className="text-blue-400 font-semibold">Weather-Based Performance Settings</h3>
                        <span className="text-xs text-gray-400">Current conditions applied</span>
                      </div>
                      <div className="p-4 bg-black/20">
                        <ul className="space-y-3 mb-6">
                          {performanceAdjustments.length > 0 ? (
                            performanceAdjustments.map((item, index) => (
                              <li key={index} className="flex items-start p-3 bg-black/30 rounded-md border border-blue-900/20 hover:border-blue-700/40 transition-all cursor-pointer">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center text-xs text-blue-400 mr-3 mt-0.5">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <span className="text-gray-300 text-sm">{item.adjustment}</span>
                                  <div className="mt-2 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                      Apply to vehicle profile?
                                    </div>
                                    <div className="flex space-x-2">
                                      <button className="text-xs bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 px-2 py-1 rounded transition-colors">
                                        Yes
                                      </button>
                                      <button className="text-xs bg-gray-900/30 hover:bg-gray-800/50 text-gray-400 px-2 py-1 rounded transition-colors">
                                        No
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-400">No performance adjustments available.</li>
                          )}
                        </ul>
                        
                        {performanceAdjustments.length > 0 && (
                          <div className="mt-6 flex justify-center">
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all text-sm">
                              Apply All Recommended Settings
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
          
          {/* Vehicle Weather Impact Dashboard */}
          <section className="mb-10" aria-labelledby="vehicle-weather-dashboard-heading">
            <h2 id="vehicle-weather-dashboard-heading" className="apex-header-green text-xl mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-green-500" />
              <span>Vehicle Weather Impact Dashboard</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Systems Impact Card */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
                  <h3 className="text-blue-400 font-semibold">Vehicle Systems Impact</h3>
                  <span className="text-xs text-gray-400">Current conditions applied</span>
                </div>
                <div className="p-5">
                  <ul className="space-y-4">
                    <li className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-blue-900/20">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                          <Gauge className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="text-white text-md">Engine Performance</h4>
                          <p className="text-xs text-gray-400">
                            {currentWeather.main.temp < 32 ? 'Cold start may reduce efficiency' : 
                             currentWeather.main.temp > 95 ? 'Heat affecting air density' : 
                             'Optimal temperature range'}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {renderStars(
                          currentWeather.main.temp < 32 ? 3 : 
                          currentWeather.main.temp > 95 ? 4 : 
                          5
                        )}
                      </div>
                    </li>
                    
                    <li className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-blue-900/20">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                          <Droplets className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="text-white text-md">Fluid Systems</h4>
                          <p className="text-xs text-gray-400">
                            {currentWeather.main.temp < 32 ? 'Check antifreeze levels' : 
                             currentWeather.main.temp > 95 ? 'Monitor coolant and oil temp' : 
                             'Normal operating conditions'}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {renderStars(
                          currentWeather.main.temp < 32 ? 3 : 
                          currentWeather.main.temp > 95 ? 3 : 
                          5
                        )}
                      </div>
                    </li>
                    
                    <li className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-blue-900/20">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                          <AlertTriangle className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="text-white text-md">Battery Performance</h4>
                          <p className="text-xs text-gray-400">
                            {currentWeather.main.temp < 32 ? 'Cold reducing battery capacity' : 
                             currentWeather.main.temp > 95 ? 'Heat accelerating fluid evaporation' : 
                             'Optimal temperature range'}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {renderStars(
                          currentWeather.main.temp < 32 ? 2 : 
                          currentWeather.main.temp > 95 ? 3 : 
                          5
                        )}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Tire Performance Card */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
                  <h3 className="text-blue-400 font-semibold">Tire Performance Metrics</h3>
                  <span className="text-xs text-gray-400">F1-derived analysis</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 flex items-center">
                        <Thermometer className="h-4 w-4 mr-1 text-blue-500" />
                        Optimal Pressure Adjustment
                      </span>
                      <span className="text-white font-bold">
                        {currentWeather.main.temp < 50 ? '+2.0 psi' : 
                         currentWeather.main.temp > 85 ? '-1.5 psi' : 
                         'Standard'}
                      </span>
                    </div>
                    <div className="mt-2 bg-black/40 rounded-lg p-3 border border-blue-900/20">
                      <p className="text-xs text-gray-300">
                        {currentWeather.main.temp < 50 ? 'Cold temperature reduces tire pressure. Slight increase recommended for optimal contact patch.' : 
                         currentWeather.main.temp > 85 ? 'Heat increases tire pressure. Slight reduction needed to prevent overinflation.' : 
                         'Current conditions ideal for manufacturer-recommended pressure settings.'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 flex items-center">
                        <Gauge className="h-4 w-4 mr-1 text-blue-500" />
                        Grip Level
                      </span>
                      <span className="text-white font-bold">
                        {currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Reduced (Wet)' : 
                         currentWeather.main.humidity > 80 ? 'Moderate (Humid)' : 
                         'Optimal'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full ${
                          currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'bg-yellow-500' : 
                          currentWeather.main.humidity > 80 ? 'bg-blue-500' : 
                          'bg-green-500'
                        }`} 
                        style={{ 
                          width: `${
                            currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 40 : 
                            currentWeather.main.humidity > 80 ? 70 : 
                            95
                          }%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Precipitation significantly reducing traction' : 
                       currentWeather.main.humidity > 80 ? 'High humidity affecting road surface grip' : 
                       'Ideal conditions for maximum tire performance'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 flex items-center">
                        <Timer className="h-4 w-4 mr-1 text-blue-500" />
                        Tire Wear Factor
                      </span>
                      <span className="text-white font-bold">
                        {currentWeather.main.temp > 90 ? 'Accelerated' : 
                         currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Uneven' : 
                         'Normal'}
                      </span>
                    </div>
                    <div className="mt-2 bg-black/40 rounded-lg p-3 border border-blue-900/20">
                      <p className="text-xs text-gray-300">
                        {currentWeather.main.temp > 90 ? 'Hot surface temperatures accelerate rubber compound breakdown. Monitor tread more frequently.' : 
                         currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Wet conditions can cause hydroplaning and uneven wear patterns. Check alignment after driving in rain.' : 
                         'Current conditions allow for normal tire wear progression.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Driving Strategy Card */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
                  <h3 className="text-blue-400 font-semibold">Weather-Optimized Driving Strategy</h3>
                  <span className="text-xs text-gray-400">Current analysis</span>
                </div>
                <div className="p-5">
                  <div className="mb-4 text-center">
                    <div className="inline-block rounded-full bg-blue-900/30 px-5 py-2.5 border border-blue-900/50">
                      <h4 className="text-lg font-orbitron text-blue-400">
                        {currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Safety-Focused' : 
                         currentWeather.weather[0].id >= 200 && currentWeather.weather[0].id < 300 ? 'Weather Avoidance' : 
                         currentWeather.main.temp < 32 ? 'Cold Weather Protocol' :
                         currentWeather.main.temp > 90 ? 'Heat Management' :
                         'Performance Optimal'}
                      </h4>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-4">
                    <li className="flex items-start p-3 bg-black/30 rounded-lg border border-blue-900/20">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center text-xs text-green-400 mr-3 mt-0.5">
                        1
                      </span>
                      <span className="text-gray-300 text-sm">
                        {currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Increase following distance by 2-3x normal gap' : 
                         currentWeather.weather[0].id >= 200 && currentWeather.weather[0].id < 300 ? 'Seek covered parking; avoid metal objects during lightning' : 
                         currentWeather.main.temp < 32 ? 'Allow 5-7 minutes warm-up time before driving' :
                         currentWeather.main.temp > 90 ? 'Pre-cool cabin before entry; minimize AC load during acceleration' :
                         'Ideal conditions for spirited driving with normal safety margins'}
                      </span>
                    </li>
                    
                    <li className="flex items-start p-3 bg-black/30 rounded-lg border border-blue-900/20">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center text-xs text-green-400 mr-3 mt-0.5">
                        2
                      </span>
                      <span className="text-gray-300 text-sm">
                        {currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Utilize gentle throttle inputs; avoid sudden braking' : 
                         currentWeather.weather[0].id >= 200 && currentWeather.weather[0].id < 300 ? 'Be prepared for sudden visibility changes; use low beams' : 
                         currentWeather.main.temp < 32 ? 'Anticipate reduced battery capacity and longer stopping distances' :
                         currentWeather.main.temp > 90 ? 'Monitor coolant temperature during extended idle periods' :
                         'Vehicle systems operating at peak efficiency; enjoy responsive handling'}
                      </span>
                    </li>
                    
                    <li className="flex items-start p-3 bg-black/30 rounded-lg border border-blue-900/20">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center text-xs text-green-400 mr-3 mt-0.5">
                        3
                      </span>
                      <span className="text-gray-300 text-sm">
                        {currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id < 600 ? 'Stay in higher gear to reduce torque to wheels' : 
                         currentWeather.weather[0].id >= 200 && currentWeather.weather[0].id < 300 ? 'Plan for route changes and potential traffic delays' : 
                         currentWeather.main.temp < 32 ? 'Check tire pressure after temperature stabilization' :
                         currentWeather.main.temp > 90 ? 'Consider shorter driving sessions with cool-down periods' :
                         'Road surface conditions ideal for testing vehicle limits safely'}
                      </span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 flex justify-center">
                    <button className="px-4 py-2 bg-blue-800/50 hover:bg-blue-700/50 text-blue-400 rounded-md border border-blue-700/30 font-medium flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Apply to Active Drive
                    </button>
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
                      <p className="text-gray-300 text-sm">{window.timeRange}</p>
                      <p className="text-xs text-gray-400 mt-1">{window.description}</p>
                      <div className="mt-2 text-xs grid grid-cols-2 gap-1">
                        <span className="text-gray-400">🌡️ {Math.round(window.raw.temp)}°{units === 'imperial' ? 'F' : 'C'}</span>
                        <span className="text-gray-400">💧 {window.raw.humidity}%</span>
                        <span className="text-gray-400">💨 {Math.round(window.raw.windSpeed)} {units === 'imperial' ? 'mph' : 'km/h'}</span>
                        <span className="text-gray-400 capitalize">☁️ {window.raw.weatherDesc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Forecast data not available. Cannot generate drive windows.</p>
              )}
            </div>
            
            {/* Driver recommendations section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Driving Tips */}
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <h3 className="text-blue-400 font-orbitron mb-3 text-lg">Driving Tips</h3>
                <ul className="space-y-3">
                  {drivingTips.map((tip, index) => (
                    <li key={index} className="border-l-2 border-blue-600 pl-3 text-sm text-gray-300">
                      {tip.tip}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Performance Adjustments */}
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <h3 className="text-blue-400 font-orbitron mb-3 text-lg">Performance Adjustments</h3>
                <ul className="space-y-3">
                  {performanceAdjustments.map((item, index) => (
                    <li key={index} className="border-l-2 border-green-600 pl-3 text-sm text-gray-300">
                      {item.adjustment}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          
          {/* Accessibility Section */}
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
            throw new Error(error instanceof Error ? error.message : "Invalid API key validation failed");
          }
        }}
        serviceName="OpenWeather"
        serviceDescription="Provide your personal OpenWeather API key to bypass rate limits. You can get a free API key by signing up at openweathermap.org."
      />
    </div>
  );
};

export default NewGTGWeatherPage;
import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { getAutomotiveWeatherData, getForecastData, getOneCallData } from '@/services/openWeatherService';
import { 
  ThermometerSun, 
  Droplets, 
  Wind, 
  CloudRain, 
  Gauge, 
  Timer, 
  ArrowUp, 
  ArrowDown, 
  Sun, 
  CircleAlert,
  AlertTriangle,
  Share2,
  Compass,
  CloudFog
} from 'lucide-react';

/**
 * F1 Pit Wall style telemetry data component
 * Displays comprehensive automotive weather metrics inspired by F1 team data
 */
const F1TelemetryWeatherPanel = () => {
  const { weatherData, coordinates, isLoading } = useWeather();
  const [telemetryData, setTelemetryData] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);
  const [selectedTab, setSelectedTab] = useState('surface');
  const [forecastData, setForecastData] = useState(null);
  const [oneCallData, setOneCallData] = useState(null);

  useEffect(() => {
    async function fetchTelemetryData() {
      // Use default location (Charlotte) if no coordinates available
      const params = coordinates || { lat: 35.2271, lon: -80.8431 };
      
      try {
        setLoadingTelemetry(true);
        console.log('Fetching F1 telemetry data with params:', params);
        
        // Get comprehensive automotive weather data
        const [automotive, forecast, oneCall] = await Promise.all([
          getAutomotiveWeatherData(params),
          getForecastData(params),
          getOneCallData(params)
        ]);
        
        setTelemetryData(automotive);
        setForecastData(forecast);
        setOneCallData(oneCall);
        setLoadingTelemetry(false);
      } catch (err) {
        console.error('Error fetching telemetry data:', err);
        setLoadingTelemetry(false);
      }
    }
    
    fetchTelemetryData();
  }, [coordinates]);

  if (isLoading || loadingTelemetry) {
    return (
      <div className="bg-black/40 p-6 rounded-lg border border-gray-800 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-48 bg-gray-800 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg h-24 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!telemetryData || !weatherData) {
    return (
      <div className="bg-black/40 p-6 rounded-lg border border-gray-800 text-center">
        <p className="text-gray-400 mb-2">No telemetry data available</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-900/50 text-blue-400 hover:bg-blue-800/50 px-4 py-2 rounded text-sm"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  const { surfaces, performance, drivingConditions } = telemetryData;
  const { current } = weatherData;
  
  // Format temperature with units
  const formatTemp = (temp) => {
    return `${Math.round(temp)}°F`;
  };
  
  // Format percentage values
  const formatPercentage = (value) => {
    return `${Math.round(value * 100)}%`;
  };
  
  // Get color for risk levels and similar indicators
  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'moderate': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      case 'minimal': return 'text-blue-500';
      case 'poor': return 'text-red-500';
      case 'reduced': return 'text-yellow-500';
      case 'excellent': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };
  
  // Get grip level color
  const getGripColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'extremely low': return 'text-red-500';
      case 'low': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'reduced': return 'text-yellow-500';
      case 'slightly reduced': return 'text-blue-500';
      case 'optimal': return 'text-green-500';
      case 'high': return 'text-green-500';
      case 'degrading': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };
  
  // Calculate additional telemetry data
  const uvIndex = oneCallData?.current?.uvi || 0;
  const dewPoint = oneCallData?.current?.dew_point || (weatherData?.current?.main?.temp - ((100 - weatherData?.current?.main?.humidity) / 5));
  const sunriseTime = oneCallData?.current?.sunrise ? new Date(oneCallData.current.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
  const sunsetTime = oneCallData?.current?.sunset ? new Date(oneCallData.current.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
  const visibility = weatherData?.current?.visibility ? (weatherData.current.visibility / 1000).toFixed(1) : 10;
  const precipProbability = oneCallData?.hourly?.[0]?.pop || 0;
  const rainRate = weatherData?.current?.rain?.['1h'] || 0;
  const rainForecast = forecastData?.list?.filter(item => item.rain?.['3h'] > 0)?.slice(0, 3) || [];
  const windGust = oneCallData?.current?.wind_gust || (weatherData?.current?.wind?.speed * 1.3);
  
  // Calculate F1-specific track metrics
  const trackEvolution = calculateTrackEvolution();
  const trackGrip = calculateTrackGripIndex();
  const crossWindEffect = calculateCrossWindEffect();
  const tireDegradation = calculateTireDegradation();
  
  function calculateTrackEvolution() {
    // Track evolution is affected by temperature, recent precipitation, and time of day
    let evolution = 0;
    
    // Base on current temperature (higher = better evolution)
    if (current.temp >= 65 && current.temp <= 85) {
      evolution += 30;
    } else if (current.temp >= 45 && current.temp < 65) {
      evolution += 20;
    } else {
      evolution += 10;
    }
    
    // Recent rain reduces track evolution (more rubber washed away)
    if (rainRate > 0) {
      evolution = Math.max(0, evolution - 30);
    } else if (precipProbability > 0.7) {
      evolution = Math.max(0, evolution - 15);
    }
    
    // Time of day affects evolution (mid-day typically best)
    const hour = new Date().getHours();
    if (hour >= 10 && hour <= 16) {
      evolution += 20;
    } else if ((hour >= 7 && hour < 10) || (hour > 16 && hour <= 19)) {
      evolution += 10;
    }
    
    return Math.min(100, evolution);
  }
  
  function calculateTrackGripIndex() {
    // Grip index is based on surface temperature, condition, and calculated grip level
    let gripIndex = 0;
    
    // Base on surface temperature
    const surfaceTemp = surfaces.asphalt.temperature;
    if (surfaceTemp >= 80 && surfaceTemp <= 110) {
      gripIndex += 40; // Ideal temperature range
    } else if (surfaceTemp > 110) {
      gripIndex += 25; // Too hot
    } else if (surfaceTemp >= 60 && surfaceTemp < 80) {
      gripIndex += 30; // Slightly cool
    } else {
      gripIndex += 15; // Too cold
    }
    
    // Surface condition impact
    switch(surfaces.asphalt.condition) {
      case 'Dry':
        gripIndex += 40;
        break;
      case 'Hot':
        gripIndex += 35;
        break;
      case 'Cold':
        gripIndex += 25;
        break;
      case 'Moist':
        gripIndex += 20;
        break;
      case 'Damp':
        gripIndex += 15;
        break;
      case 'Wet':
        gripIndex += 10;
        break;
      case 'Snow-covered':
        gripIndex += 5;
        break;
      default:
        gripIndex += 30;
    }
    
    // Adjust based on track evolution
    gripIndex = Math.round((gripIndex * (0.7 + (trackEvolution / 333))));
    
    return Math.min(100, gripIndex);
  }
  
  function calculateCrossWindEffect() {
    // Cross wind effect is based on wind speed and direction relative to track
    // This is an estimation since we don't know actual track orientation
    const windSpeed = weatherData.current.wind.speed;
    
    if (windSpeed < 5) {
      return 'Minimal';
    } else if (windSpeed < 10) {
      return 'Light';
    } else if (windSpeed < 15) {
      return 'Moderate';
    } else if (windSpeed < 25) {
      return 'Significant';
    } else {
      return 'Severe';
    }
  }
  
  function calculateTireDegradation() {
    // Tire degradation is affected by surface temperature, grip, air temperature
    let degradation = 'Normal';
    
    const surfaceTemp = surfaces.asphalt.temperature;
    const airTemp = current.temp;
    
    if (surfaceTemp > 120) {
      degradation = 'High';
    } else if (surfaceTemp > 100) {
      degradation = 'Moderate';
    } else if (surfaceTemp < 60 && airTemp < 50) {
      degradation = 'Low';
    }
    
    // Adjust based on surface
    if (surfaces.asphalt.condition === 'Wet' || surfaces.asphalt.condition === 'Damp') {
      degradation = 'Variable';
    }
    
    return degradation;
  }
  
  // Calculate estimated optimal tire compound
  const getOptimalTireCompound = () => {
    const isWet = surfaces.asphalt.condition === 'Wet' || surfaces.asphalt.condition === 'Damp';
    const isCold = surfaces.asphalt.temperature < 60;
    const isHot = surfaces.asphalt.temperature > 110;
    
    if (isWet) {
      return surfaces.asphalt.condition === 'Wet' ? 'Wet' : 'Intermediate';
    } else if (isCold) {
      return 'Soft';
    } else if (isHot) {
      return 'Hard';
    } else {
      return 'Medium';
    }
  };
  
  // Get pit strategy recommendation
  const getPitStrategyRecommendation = () => {
    // Based on tire degradation, track evolution, and weather forecast
    const hasPrecipForecast = rainForecast.length > 0;
    
    if (hasPrecipForecast) {
      const timeToRain = Math.round((new Date(rainForecast[0].dt * 1000) - new Date()) / (1000 * 60));
      if (timeToRain <= 30) {
        return `Rain expected in ~${timeToRain} mins. Consider weather strategy.`;
      }
    }
    
    switch (tireDegradation) {
      case 'High':
        return 'Consider shorter stint lengths and tire management';
      case 'Moderate':
        return 'Standard stint lengths with focus on exit traction';
      case 'Low':
        return 'Extended stints possible, focus on tire temperature';
      case 'Variable':
        return 'Prepare for changing conditions, monitor wear patterns';
      default:
        return 'Standard strategy recommended';
    }
  };

  return (
    <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-6">
      <div className="mb-4">
        <h3 className="text-blue-400 font-orbitron text-lg mb-2 border-b border-blue-900 pb-2">F1 Pit Wall Telemetry</h3>
        
        {/* Tabs for different telemetry categories */}
        <div className="flex overflow-x-auto pb-2 mb-4 border-b border-gray-800">
          <button 
            className={`px-3 py-1 mr-2 rounded-t text-sm whitespace-nowrap ${selectedTab === 'surface' ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            onClick={() => setSelectedTab('surface')}
          >
            Track Metrics
          </button>
          <button 
            className={`px-3 py-1 mr-2 rounded-t text-sm whitespace-nowrap ${selectedTab === 'air' ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            onClick={() => setSelectedTab('air')}
          >
            Air Metrics
          </button>
          <button 
            className={`px-3 py-1 mr-2 rounded-t text-sm whitespace-nowrap ${selectedTab === 'rain' ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            onClick={() => setSelectedTab('rain')}
          >
            Rain & Storm
          </button>
          <button 
            className={`px-3 py-1 mr-2 rounded-t text-sm whitespace-nowrap ${selectedTab === 'visibility' ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            onClick={() => setSelectedTab('visibility')}
          >
            Visibility & Safety
          </button>
          <button 
            className={`px-3 py-1 mr-2 rounded-t text-sm whitespace-nowrap ${selectedTab === 'tire' ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            onClick={() => setSelectedTab('tire')}
          >
            Tire Telemetry
          </button>
          <button 
            className={`px-3 py-1 rounded-t text-sm whitespace-nowrap ${selectedTab === 'strategy' ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            onClick={() => setSelectedTab('strategy')}
          >
            Strategy Planning
          </button>
        </div>
      </div>
      
      {/* Track Surface Metrics */}
      {selectedTab === 'surface' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ThermometerSun className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Surface Temp</h4>
            </div>
            <p className="text-xl font-bold text-white">{formatTemp(surfaces.asphalt.temperature)}</p>
            <p className="text-xs text-gray-500 mt-1">Asphalt / Active Surface</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Gauge className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Grip Index</h4>
            </div>
            <p className="text-xl font-bold text-white">{trackGrip}%</p>
            <p className="text-xs text-gray-500 mt-1">Relative to dry optimal</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Evolution</h4>
            </div>
            <p className="text-xl font-bold text-white">{trackEvolution}%</p>
            <p className="text-xs text-gray-500 mt-1">Rubber accumulation rate</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Track Dampness</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {surfaces.asphalt.condition === 'Wet' ? '100%' : 
               surfaces.asphalt.condition === 'Damp' ? '60%' : 
               surfaces.asphalt.condition === 'Moist' ? '30%' : '0%'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Surface moisture level</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ThermometerSun className="h-4 w-4 text-orange-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Concrete Pad Temp</h4>
            </div>
            <p className="text-xl font-bold text-white">{formatTemp(surfaces.concrete.temperature)}</p>
            <p className="text-xs text-gray-500 mt-1">Pit lane / Runoff areas</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Gauge className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Grip Level</h4>
            </div>
            <p className={`text-xl font-bold ${getGripColor(surfaces.asphalt.gripLevel)}`}>{surfaces.asphalt.gripLevel}</p>
            <p className="text-xs text-gray-500 mt-1">Surface traction quality</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Sun className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Surface Radiance</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {surfaces.asphalt.temperature > 100 ? 'High' : 
               surfaces.asphalt.temperature > 80 ? 'Medium' : 'Low'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Infrared heat signature</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Surface Condition</h4>
            </div>
            <p className="text-xl font-bold text-white">{surfaces.asphalt.condition}</p>
            <p className="text-xs text-gray-500 mt-1">Current state assessment</p>
          </div>
        </div>
      )}
      
      {/* Air Metrics */}
      {selectedTab === 'air' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Ambient Temperature</h4>
            </div>
            <p className="text-xl font-bold text-white">{formatTemp(current.temp)}</p>
            <p className="text-xs text-gray-500 mt-1">Air temperature at 2m height</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Dew Point</h4>
            </div>
            <p className="text-xl font-bold text-white">{formatTemp(dewPoint)}</p>
            <p className="text-xs text-gray-500 mt-1">Condensation threshold</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Droplets className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Humidity</h4>
            </div>
            <p className="text-xl font-bold text-white">{current.humidity}%</p>
            <p className="text-xs text-gray-500 mt-1">Relative humidity</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Gauge className="h-4 w-4 text-purple-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Barometric Pressure</h4>
            </div>
            <p className="text-xl font-bold text-white">{current.pressure} hPa</p>
            <p className="text-xs text-gray-500 mt-1">Atmospheric pressure</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Wind className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Wind Speed</h4>
            </div>
            <p className="text-xl font-bold text-white">{Math.round(current.wind_speed)} mph</p>
            <p className="text-xs text-gray-500 mt-1">Current wind velocity</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Wind className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Wind Gusts</h4>
            </div>
            <p className="text-xl font-bold text-white">{Math.round(windGust)} mph</p>
            <p className="text-xs text-gray-500 mt-1">Peak wind velocity</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Compass className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Wind Direction</h4>
            </div>
            <p className="text-xl font-bold text-white">{current.wind_deg}°</p>
            <p className="text-xs text-gray-500 mt-1">
              {current.wind_deg >= 337.5 || current.wind_deg < 22.5 ? 'N' :
               current.wind_deg >= 22.5 && current.wind_deg < 67.5 ? 'NE' :
               current.wind_deg >= 67.5 && current.wind_deg < 112.5 ? 'E' :
               current.wind_deg >= 112.5 && current.wind_deg < 157.5 ? 'SE' :
               current.wind_deg >= 157.5 && current.wind_deg < 202.5 ? 'S' :
               current.wind_deg >= 202.5 && current.wind_deg < 247.5 ? 'SW' :
               current.wind_deg >= 247.5 && current.wind_deg < 292.5 ? 'W' : 'NW'}
            </p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Share2 className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Cross Wind Effect</h4>
            </div>
            <p className="text-xl font-bold text-white">{crossWindEffect}</p>
            <p className="text-xs text-gray-500 mt-1">Vehicle stability impact</p>
          </div>
        </div>
      )}
      
      {/* Rain & Storm */}
      {selectedTab === 'rain' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Rainfall Rate</h4>
            </div>
            <p className="text-xl font-bold text-white">{rainRate > 0 ? `${rainRate.toFixed(1)} mm/h` : 'None'}</p>
            <p className="text-xs text-gray-500 mt-1">Current precipitation</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Rain Probability</h4>
            </div>
            <p className="text-xl font-bold text-white">{Math.round(precipProbability * 100)}%</p>
            <p className="text-xs text-gray-500 mt-1">Next hour precipitation chance</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Rain Cell Distance</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {rainForecast.length > 0 
                ? `~${Math.round((new Date(rainForecast[0].dt * 1000) - new Date()) / (1000 * 60))} mins`
                : 'None detected'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Time to next precipitation</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Rain Type</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {rainRate > 2 ? 'Heavy Rain' : 
               rainRate > 0.5 ? 'Rain' : 
               rainRate > 0 ? 'Drizzle' : 
               precipProbability > 0.7 ? 'Imminent' : 'None'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Precipitation classification</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudFog className="h-4 w-4 text-gray-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Cloud Cover</h4>
            </div>
            <p className="text-xl font-bold text-white">{current.clouds}%</p>
            <p className="text-xs text-gray-500 mt-1">Sky obscuration</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Sun className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">UV Index</h4>
            </div>
            <p className="text-xl font-bold text-white">{Math.round(uvIndex)}</p>
            <p className="text-xs text-gray-500 mt-1">Solar radiation level</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ArrowUp className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Sunrise</h4>
            </div>
            <p className="text-xl font-bold text-white">{sunriseTime}</p>
            <p className="text-xs text-gray-500 mt-1">Morning light</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ArrowDown className="h-4 w-4 text-purple-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Sunset</h4>
            </div>
            <p className="text-xl font-bold text-white">{sunsetTime}</p>
            <p className="text-xs text-gray-500 mt-1">Evening light</p>
          </div>
        </div>
      )}
      
      {/* Visibility & Safety */}
      {selectedTab === 'visibility' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudFog className="h-4 w-4 text-gray-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Visibility</h4>
            </div>
            <p className="text-xl font-bold text-white">{visibility} km</p>
            <p className="text-xs text-gray-500 mt-1">Clear line of sight</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudFog className="h-4 w-4 text-gray-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Fog Density</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {visibility < 0.2 ? 'Dense' : 
               visibility < 1 ? 'Moderate' : 
               visibility < 2 && current.humidity > 90 ? 'Light' : 'None'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Atmospheric obscuration</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CircleAlert className="h-4 w-4 text-red-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Risk Level</h4>
            </div>
            <p className={`text-xl font-bold ${getRiskColor(drivingConditions.riskLevel)}`}>{drivingConditions.riskLevel}</p>
            <p className="text-xs text-gray-500 mt-1">Overall conditions assessment</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Sun className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Sun Angle</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {getTimeOfDay()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Glare/visibility impact</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800 md:col-span-2">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Warning Advisory</h4>
            </div>
            <p className="text-white">
              {drivingConditions.advisories && drivingConditions.advisories[0] 
                ? drivingConditions.advisories[0]
                : 'No current advisories'}
            </p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800 md:col-span-2">
            <div className="flex items-center mb-2">
              <CircleAlert className="h-4 w-4 text-orange-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Safety Protocol</h4>
            </div>
            <p className="text-white">
              {getSafetyProtocol()}
            </p>
          </div>
        </div>
      )}
      
      {/* Tire Telemetry */}
      {selectedTab === 'tire' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Timer className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Sport Tire Warmup</h4>
            </div>
            <p className="text-xl font-bold text-white">{performance.tireWarmupTime.sport} min</p>
            <p className="text-xs text-gray-500 mt-1">Optimal performance time</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Timer className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Summer Tire Warmup</h4>
            </div>
            <p className="text-xl font-bold text-white">{performance.tireWarmupTime.summer} min</p>
            <p className="text-xs text-gray-500 mt-1">Optimal performance time</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ThermometerSun className="h-4 w-4 text-orange-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Tire Core Temperature</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {surfaces.asphalt.condition === 'Wet' ? formatTemp(Math.max(surfaces.asphalt.temperature - 15, current.temp)) : 
               formatTemp(Math.max(surfaces.asphalt.temperature - 5, current.temp))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Estimated internal temp</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Tire Surface Temperature</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {formatTemp(Math.min(surfaces.asphalt.temperature + 10, surfaces.asphalt.temperature * 1.15))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Contact patch temperature</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <Gauge className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Pressure Projection</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {formatPercentage(1 + ((surfaces.asphalt.temperature - 70) / 100))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hot pressure increase</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CircleAlert className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Optimal Compound</h4>
            </div>
            <p className="text-xl font-bold text-white">{getOptimalTireCompound()}</p>
            <p className="text-xs text-gray-500 mt-1">Best tire for conditions</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Crossover Point</h4>
            </div>
            <p className="text-xl font-bold text-white">
              {surfaces.asphalt.condition === 'Wet' ? '5mm+' : 
               surfaces.asphalt.condition === 'Damp' ? '3-5mm' : 
               precipProbability > 0.7 ? 'Imminent' : 'Not applicable'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Wet/dry transition threshold</p>
          </div>
          
          <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
              <h4 className="text-gray-400 text-sm">Degradation Rate</h4>
            </div>
            <p className="text-xl font-bold text-white">{tireDegradation}</p>
            <p className="text-xs text-gray-500 mt-1">Wear factor assessment</p>
          </div>
        </div>
      )}
      
      {/* Strategy Planning */}
      {selectedTab === 'strategy' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center mb-2">
                <Gauge className="h-4 w-4 text-yellow-500 mr-2" />
                <h4 className="text-gray-400 text-sm">Performance Adjustment</h4>
              </div>
              <p className="text-xl font-bold text-white">
                {performance.powerAdjustment > 0 ? `+${performance.powerAdjustment.toFixed(1)}%` : `${performance.powerAdjustment.toFixed(1)}%`}
              </p>
              <p className="text-xs text-gray-500 mt-1">Power output modifier</p>
            </div>
            
            <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center mb-2">
                <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                <h4 className="text-gray-400 text-sm">Aero Efficiency</h4>
              </div>
              <p className="text-xl font-bold text-white">{formatPercentage(performance.aerodynamicPerformance.efficiency)}</p>
              <p className="text-xs text-gray-500 mt-1">Current downforce generation</p>
            </div>
            
            <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center mb-2">
                <Timer className="h-4 w-4 text-red-500 mr-2" />
                <h4 className="text-gray-400 text-sm">Braking Distance</h4>
              </div>
              <p className="text-xl font-bold text-white">
                {performance.brakingPerformance.distanceAdjustment > 0 
                  ? `+${performance.brakingPerformance.distanceAdjustment}%` 
                  : `${performance.brakingPerformance.distanceAdjustment}%`}
              </p>
              <p className="text-xs text-gray-500 mt-1">Stopping distance modifier</p>
            </div>
            
            <div className="bg-black/60 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center mb-2">
                <ThermometerSun className="h-4 w-4 text-blue-500 mr-2" />
                <h4 className="text-gray-400 text-sm">Cooling Efficiency</h4>
              </div>
              <p className="text-xl font-bold text-white">{formatPercentage(performance.coolingEfficiency)}</p>
              <p className="text-xs text-gray-500 mt-1">Thermal management factor</p>
            </div>
          </div>
          
          {/* Strategy recommendations */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-black/80 p-4 rounded-lg border border-blue-900">
              <div className="flex items-start mb-3">
                <CircleAlert className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 text-base font-semibold">Pit Strategy Recommendation</h4>
                  <p className="text-gray-300 mt-1">{getPitStrategyRecommendation()}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/50 p-3 rounded border border-gray-800">
                  <h5 className="text-green-500 text-sm font-medium mb-2">Driving Adjustments</h5>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      <span>
                        {surfaces.asphalt.gripLevel === 'Extremely Low' || surfaces.asphalt.gripLevel === 'Low'
                          ? "Smooth inputs required. Progressive throttle application on exits."
                          : surfaces.asphalt.gripLevel === 'Optimal' || surfaces.asphalt.gripLevel === 'High'
                          ? "Track conditions support aggressive turn-in and earlier throttle application."
                          : "Moderate approach recommended. Focus on clean exits."}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      <span>
                        {performance.brakingPerformance.effectiveCoefficient < 0.8
                          ? "Extended braking zones needed. Earlier brake application required."
                          : performance.brakingPerformance.effectiveCoefficient > 0.95
                          ? "Optimal braking conditions. Late braking points viable."
                          : "Standard braking reference points. Adjust based on feedback."}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-black/50 p-3 rounded border border-gray-800">
                  <h5 className="text-blue-500 text-sm font-medium mb-2">Setup Considerations</h5>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      <span>
                        {current.temp > 85
                          ? "Consider softer suspension settings to maintain grip in hot conditions."
                          : current.temp < 50
                          ? "Stiffer suspension settings may help generate tire temperature."
                          : "Balanced suspension settings optimal for current conditions."}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      <span>
                        {current.wind_speed > 15
                          ? "Additional wing angle may help counteract crosswind effects."
                          : surfaces.asphalt.gripLevel === 'Optimal' || surfaces.asphalt.gripLevel === 'High'
                          ? "Track grip supports reduced wing angle if straight-line speed is priority."
                          : "Standard aero configuration recommended."}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Helper function to determine time of day and sun position
  function getTimeOfDay() {
    const now = new Date();
    const hour = now.getHours();
    
    if (!oneCallData || !oneCallData.current) {
      // Fallback if we don't have sunrise/sunset data
      if (hour >= 5 && hour < 8) return 'Dawn';
      if (hour >= 8 && hour < 11) return 'Morning';
      if (hour >= 11 && hour < 13) return 'Midday';
      if (hour >= 13 && hour < 17) return 'Afternoon';
      if (hour >= 17 && hour < 20) return 'Evening';
      return 'Night';
    }
    
    const sunrise = oneCallData.current.sunrise * 1000;
    const sunset = oneCallData.current.sunset * 1000;
    const nowMs = now.getTime();
    
    // Calculate potential glare conditions
    if (nowMs > sunrise - 3600000 && nowMs < sunrise + 3600000) return 'Dawn (Low Glare)';
    if (nowMs > sunset - 3600000 && nowMs < sunset + 3600000) return 'Dusk (High Glare)';
    
    if (nowMs < sunrise || nowMs > sunset) return 'Night';
    
    // Determine position in daytime
    const dayLength = sunset - sunrise;
    const dayProgress = (nowMs - sunrise) / dayLength;
    
    if (dayProgress < 0.25) return 'Morning';
    if (dayProgress < 0.5) return 'Midday (High Sun)';
    if (dayProgress < 0.75) return 'Afternoon';
    return 'Evening';
  }
  
  // Determine safety protocol based on conditions
  function getSafetyProtocol() {
    if (visibility < 0.5) {
      return 'Low visibility protocol active. Reduced speed zones recommended.';
    }
    
    if (rainRate > 5) {
      return 'Heavy rain protocol. Standing water risk assessment required.';
    }
    
    if (rainRate > 0) {
      return 'Wet weather protocol. Aquaplaning risk monitoring active.';
    }
    
    if (current.wind_speed > 35) {
      return 'High wind protocol. Movable structure and debris risk assessment.';
    }
    
    if (drivingConditions.riskLevel === 'High') {
      return 'Enhanced risk monitoring protocol. Regular condition updates advised.';
    }
    
    return 'Standard safety protocol. Normal operations.';
  }
};

export default F1TelemetryWeatherPanel;
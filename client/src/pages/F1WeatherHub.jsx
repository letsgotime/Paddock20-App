import React, { useState, useEffect } from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
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
  Cloud,
  CloudFog,
  AlertTriangle,
  Info,
  Compass
} from 'lucide-react';

/**
 * F1-inspired comprehensive weather dashboard
 * Focused on providing critical weather data for driving enthusiasts
 */
const F1WeatherHub = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('surface');
  
  // Default location - Charlotte
  const defaultLocation = { lat: 35.2271, lon: -80.8431 };
  
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);
        
        // Fetch basic weather data - all in one request to minimize failures
        const response = await fetch(`/api/weather?lat=${defaultLocation.lat}&lon=${defaultLocation.lon}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchWeatherData();
  }, []);
  
  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[60vh]" id={MAIN_CONTENT_ID}>
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-blue-400 text-xl mt-4 font-orbitron">Loading F1 Weather Hub...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[60vh]" id={MAIN_CONTENT_ID}>
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Weather Data Unavailable</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!weatherData) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[60vh]" id={MAIN_CONTENT_ID}>
        <p className="text-gray-400">No weather data available</p>
      </div>
    );
  }
  
  // Extract relevant data from weather response
  const condition = weatherData.weather[0]?.main || 'Unknown';
  const description = weatherData.weather[0]?.description || 'No data';
  const temp = Math.round(weatherData.main?.temp || 0);
  const feelsLike = Math.round(weatherData.main?.feels_like || 0);
  const humidity = weatherData.main?.humidity || 0;
  const pressure = weatherData.main?.pressure || 0;
  const windSpeed = Math.round(weatherData.wind?.speed || 0);
  const windDegree = weatherData.wind?.deg || 0;
  const clouds = weatherData.clouds?.all || 0;
  const visibility = (weatherData.visibility || 0) / 1000; // km
  const rainVolume = weatherData.rain?.['1h'] || 0;
  const snowVolume = weatherData.snow?.['1h'] || 0;
  
  // Calculate derived F1-specific metrics
  
  // Calculate track surface temperature (typically hotter than air temp)
  const trackTemp = calculateTrackTemp(temp, clouds, condition);
  
  // Calculate grip level based on conditions
  const gripLevel = calculateGripLevel(condition, trackTemp, humidity);
  
  // Track evolution (rubbering in)
  const trackEvolution = calculateTrackEvolution(condition, clouds);
  
  // Calculate tire warm-up time
  const tireWarmupTime = calculateTireWarmup(temp, condition);
  
  // Calculate power adjustment based on air density
  const powerAdjustment = calculatePowerAdjustment(temp, pressure, humidity);
  
  // Braking efficiency 
  const brakingEfficiency = calculateBrakingEfficiency(condition, trackTemp);
  
  // Cross-wind effect
  const crossWindEffect = calculateCrossWindEffect(windSpeed);
  
  // Wind direction text
  const windDirectionText = getWindDirection(windDegree);
  
  // Get optimal tire compound for conditions
  const optimalTireCompound = getOptimalTireCompound(trackTemp, condition);
  
  // Visibility assessment
  const visibilityAssessment = assessVisibility(visibility, condition);
  
  // Pit strategy recommendation
  const pitStrategy = getPitStrategy(condition, trackTemp, trackEvolution);
  
  return (
    <div className="py-8" id={MAIN_CONTENT_ID}>
      {/* Page header */}
      <header className="mb-8 text-center">
        <h1 className="apex-header text-3xl mb-2">F1 Weather Telemetry Hub</h1>
        <p className="text-gray-400">
          Professional-grade weather analytics for driving enthusiasts
        </p>
      </header>
      
      {/* Current conditions overview */}
      <section className="mb-8 bg-black/30 rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{weatherData.name}</h2>
              <p className="text-gray-400 capitalize">{description}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="text-4xl font-bold text-white mr-4">{temp}°F</div>
              <div className="flex flex-col items-start">
                <div className="text-gray-300 text-sm">Feels like: {feelsLike}°F</div>
                <div className="text-gray-300 text-sm">Track: {trackTemp}°F</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick stats bar */}
        <div className="grid grid-cols-3 md:grid-cols-6 bg-black/50 text-center py-3 px-1">
          <div className="flex flex-col items-center">
            <Wind className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{windSpeed} mph</div>
            <div className="text-gray-400 text-xs">Wind</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Droplets className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{humidity}%</div>
            <div className="text-gray-400 text-xs">Humidity</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Gauge className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{pressure} hPa</div>
            <div className="text-gray-400 text-xs">Pressure</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Sun className="h-4 w-4 text-yellow-400 mb-1" />
            <div className="text-white font-medium">{100 - clouds}%</div>
            <div className="text-gray-400 text-xs">Sunshine</div>
          </div>
          
          <div className="flex flex-col items-center">
            <CloudRain className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{rainVolume} mm</div>
            <div className="text-gray-400 text-xs">Rain</div>
          </div>
          
          <div className="flex flex-col items-center">
            <CloudFog className="h-4 w-4 text-blue-400 mb-1" />
            <div className="text-white font-medium">{visibility.toFixed(1)} km</div>
            <div className="text-gray-400 text-xs">Visibility</div>
          </div>
        </div>
      </section>
      
      {/* F1 Pit Wall Telemetry Tabs */}
      <section className="mb-8 bg-black/30 border border-gray-800 rounded-lg overflow-hidden">
        <div className="border-b border-gray-800">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 text-sm whitespace-nowrap ${selectedTab === 'surface' ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
              onClick={() => setSelectedTab('surface')}
            >
              Track Surface
            </button>
            <button 
              className={`px-4 py-3 text-sm whitespace-nowrap ${selectedTab === 'air' ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
              onClick={() => setSelectedTab('air')}
            >
              Air Metrics
            </button>
            <button 
              className={`px-4 py-3 text-sm whitespace-nowrap ${selectedTab === 'tire' ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
              onClick={() => setSelectedTab('tire')}
            >
              Tire Telemetry
            </button>
            <button 
              className={`px-4 py-3 text-sm whitespace-nowrap ${selectedTab === 'performance' ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
              onClick={() => setSelectedTab('performance')}
            >
              Performance
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Track Surface Tab */}
          {selectedTab === 'surface' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ThermometerSun className="h-4 w-4 text-yellow-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Surface Temp</h4>
                </div>
                <p className="text-xl font-bold text-white">{trackTemp}°F</p>
                <p className="text-xs text-gray-500 mt-1">Asphalt / Active Surface</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Grip Index</h4>
                </div>
                <p className="text-xl font-bold text-white">{gripLevel.index}%</p>
                <p className="text-xs text-gray-500 mt-1">Relative to dry optimal</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Evolution</h4>
                </div>
                <p className="text-xl font-bold text-white">{trackEvolution}%</p>
                <p className="text-xs text-gray-500 mt-1">Rubber accumulation rate</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Track Condition</h4>
                </div>
                <p className="text-xl font-bold text-white">{gripLevel.condition}</p>
                <p className="text-xs text-gray-500 mt-1">Surface state assessment</p>
              </div>
            </div>
          )}
          
          {/* Air Metrics Tab */}
          {selectedTab === 'air' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Ambient Temperature</h4>
                </div>
                <p className="text-xl font-bold text-white">{temp}°F</p>
                <p className="text-xs text-gray-500 mt-1">Air temperature at 2m height</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Humidity</h4>
                </div>
                <p className="text-xl font-bold text-white">{humidity}%</p>
                <p className="text-xs text-gray-500 mt-1">Relative humidity</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Gauge className="h-4 w-4 text-purple-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Barometric Pressure</h4>
                </div>
                <p className="text-xl font-bold text-white">{pressure} hPa</p>
                <p className="text-xs text-gray-500 mt-1">Atmospheric pressure</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Wind className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Wind</h4>
                </div>
                <p className="text-xl font-bold text-white">{windSpeed} mph</p>
                <p className="text-xs text-gray-500 mt-1">{windDirectionText} ({windDegree}°)</p>
              </div>
            </div>
          )}
          
          {/* Tire Telemetry Tab */}
          {selectedTab === 'tire' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Timer className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Tire Warmup Time</h4>
                </div>
                <p className="text-xl font-bold text-white">{tireWarmupTime.sport} min</p>
                <p className="text-xs text-gray-500 mt-1">Sport compounds</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ThermometerSun className="h-4 w-4 text-red-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Tire Surface Temp</h4>
                </div>
                <p className="text-xl font-bold text-white">{Math.round(trackTemp * 1.05)}°F</p>
                <p className="text-xs text-gray-500 mt-1">Working surface temperature</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <ThermometerSun className="h-4 w-4 text-orange-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Tire Core Temp</h4>
                </div>
                <p className="text-xl font-bold text-white">{Math.round(trackTemp * 0.95)}°F</p>
                <p className="text-xs text-gray-500 mt-1">Internal temperature</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-green-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Optimal Compound</h4>
                </div>
                <p className="text-xl font-bold text-white">{optimalTireCompound}</p>
                <p className="text-xs text-gray-500 mt-1">Recommended tire type</p>
              </div>
            </div>
          )}
          
          {/* Performance Tab */}
          {selectedTab === 'performance' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Gauge className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Power Output</h4>
                </div>
                <p className="text-xl font-bold text-white">
                  {powerAdjustment > 0 ? '+' : ''}{powerAdjustment.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Air density effect</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Braking Efficiency</h4>
                </div>
                <p className="text-xl font-bold text-white">{(brakingEfficiency * 100).toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">Relative to optimal</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Wind className="h-4 w-4 text-yellow-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Crosswind Effect</h4>
                </div>
                <p className="text-xl font-bold text-white">{crossWindEffect}</p>
                <p className="text-xs text-gray-500 mt-1">Vehicle stability impact</p>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <CloudFog className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-gray-400 text-sm">Visibility</h4>
                </div>
                <p className="text-xl font-bold text-white">{visibilityAssessment}</p>
                <p className="text-xs text-gray-500 mt-1">{visibility.toFixed(1)} km range</p>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Strategy Recommendation */}
      <section className="mb-8 bg-black/30 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Pit Strategy Recommendation</h2>
        <p className="text-gray-300 mb-4">{pitStrategy}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-medium mb-2">Driving Adjustments</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  {gripLevel.condition === 'Wet' || gripLevel.condition === 'Damp'
                    ? "Smooth inputs required. Progressive throttle application on exits."
                    : gripLevel.condition === 'Optimal'
                    ? "Track conditions support aggressive turn-in and earlier throttle application."
                    : "Moderate approach recommended. Focus on clean exits."}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  {brakingEfficiency < 0.8
                    ? "Extended braking zones needed. Earlier brake application required."
                    : brakingEfficiency > 0.95
                    ? "Optimal braking conditions. Late braking points viable."
                    : "Standard braking reference points. Adjust based on feedback."}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-blue-500 font-medium mb-2">Setup Considerations</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  {temp > 85
                    ? "Consider softer suspension settings to maintain grip in hot conditions."
                    : temp < 50
                    ? "Stiffer suspension settings may help generate tire temperature."
                    : "Balanced suspension settings optimal for current conditions."}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>
                  {windSpeed > 15
                    ? "Additional wing angle may help counteract crosswind effects."
                    : gripLevel.condition === 'Optimal'
                    ? "Track grip supports reduced wing angle if straight-line speed is priority."
                    : "Standard aero configuration recommended."}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* F1 Telemetry Legend */}
      <section className="bg-black/30 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">F1 Telemetry Key</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-green-500 font-medium mb-2">Surface Metrics</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>Track Surface Temp: Estimated asphalt temperature</li>
              <li>Grip Level: Available traction relative to ideal conditions</li>
              <li>Track Evolution: Rubbering-in of the surface over time</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-blue-500 font-medium mb-2">Performance Impact</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>Power Output: Engine performance relative to standard conditions</li>
              <li>Braking Efficiency: Stopping performance based on surface</li>
              <li>Tire Warmup: Time to reach optimal operating temperature</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-amber-500 font-medium mb-2">Strategy Factors</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>Optimal Compound: Ideal tire type for current conditions</li>
              <li>Crosswind Effect: Impact on vehicle stability and aerodynamics</li>
              <li>Visibility: Safe operating distance for spirited driving</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Calculate estimated track temperature based on weather conditions
 */
function calculateTrackTemp(airTemp, cloudCover, condition) {
  // Base calculation: track temp is generally warmer than air temp
  let trackTemp = airTemp;
  
  // Sunlight warms the track (more with less cloud cover)
  const sunExposureFactor = (100 - cloudCover) / 100;
  
  if (condition === 'Clear') {
    // Clear sky - maximum heating
    trackTemp += 20 * sunExposureFactor;
  } else if (condition === 'Clouds' && cloudCover < 70) {
    // Partly cloudy still allows some heating
    trackTemp += 10 * sunExposureFactor;
  }
  
  // Rain and snow cool the surface
  if (condition === 'Rain' || condition === 'Drizzle') {
    trackTemp -= 5; // Rain cools the surface
  }
  
  if (condition === 'Snow') {
    trackTemp = Math.min(trackTemp, 32); // Snow keeps surface at or below freezing
  }
  
  return Math.round(trackTemp);
}

/**
 * Calculate grip level based on track conditions
 */
function calculateGripLevel(condition, trackTemp, humidity) {
  let gripIndex = 0;
  let gripCondition = 'Dry';
  
  // Conditions that affect grip
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    gripIndex = 40; // Wet conditions have poor grip
    gripCondition = 'Wet';
  } else if (condition === 'Snow') {
    gripIndex = 20; // Snow has very poor grip
    gripCondition = 'Snow-covered';
  } else if (condition === 'Mist' || condition === 'Fog' || humidity > 90) {
    gripIndex = 70; // Damp has reduced grip
    gripCondition = 'Damp';
  } else {
    // Dry conditions, but temperature affects grip
    if (trackTemp >= 70 && trackTemp <= 110) {
      gripIndex = 100; // Ideal temperature range
      gripCondition = 'Optimal';
    } else if (trackTemp > 110) {
      gripIndex = 85; // Too hot - rubber degrades
      gripCondition = 'Hot';
    } else if (trackTemp >= 50) {
      gripIndex = 90; // Slightly cool
      gripCondition = 'Good';
    } else {
      gripIndex = 80; // Too cold
      gripCondition = 'Cold';
    }
  }
  
  return { index: gripIndex, condition: gripCondition };
}

/**
 * Calculate track evolution (rubber buildup)
 */
function calculateTrackEvolution(condition, cloudCover) {
  // Base evolution
  let evolution = 70;
  
  // Rain washes away rubber
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm' || condition === 'Snow') {
    evolution = 30; // Rain washes away rubber
  }
  
  // Time of day would also affect this, but we don't have that data easily
  
  return evolution;
}

/**
 * Calculate tire warm-up times based on conditions
 */
function calculateTireWarmup(airTemp, condition) {
  // Base warmup times (minutes)
  const baseWarmup = {
    sport: 4,
    street: 7,
    allSeason: 10
  };
  
  // Temperature adjustment
  let tempFactor = 1.0;
  
  if (airTemp < 40) {
    tempFactor = 1.7; // Cold makes it much harder to warm tires
  } else if (airTemp < 60) {
    tempFactor = 1.3; // Cool makes it harder to warm tires
  } else if (airTemp > 85) {
    tempFactor = 0.8; // Hot makes it easier to warm tires
  }
  
  // Condition adjustment
  let conditionFactor = 1.0;
  
  if (condition === 'Rain' || condition === 'Drizzle') {
    conditionFactor = 1.5; // Wet makes it harder to warm tires
  } else if (condition === 'Snow') {
    conditionFactor = 2.0; // Snow makes it much harder to warm tires
  }
  
  // Calculate adjusted warmup times
  return {
    sport: Math.round(baseWarmup.sport * tempFactor * conditionFactor),
    street: Math.round(baseWarmup.street * tempFactor * conditionFactor),
    allSeason: Math.round(baseWarmup.allSeason * tempFactor * conditionFactor)
  };
}

/**
 * Calculate power adjustment based on air density
 */
function calculatePowerAdjustment(temp, pressure, humidity) {
  // Standard conditions
  const standardTemp = 59; // 15°C or 59°F
  const standardPressure = 1013.25; // hPa
  const standardHumidity = 0; // Dry air
  
  // Simple air density calculation (this is highly simplified)
  const tempFactor = (standardTemp + 460) / (temp + 460); // Convert to Rankine
  const pressureFactor = pressure / standardPressure;
  const humidityFactor = 1 - (humidity / 100) * 0.02; // Simplified - humidity reduces air density
  
  const airDensityRatio = (tempFactor * pressureFactor * humidityFactor);
  
  // Power is roughly proportional to air density
  const powerChange = (airDensityRatio - 1) * 100;
  
  return powerChange;
}

/**
 * Calculate braking efficiency based on conditions
 */
function calculateBrakingEfficiency(condition, trackTemp) {
  // Base efficiency
  let efficiency = 1.0;
  
  // Conditions that affect braking
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    efficiency = 0.7; // Wet conditions reduce braking significantly
  } else if (condition === 'Snow') {
    efficiency = 0.4; // Snow severely reduces braking
  } else if (condition === 'Mist' || condition === 'Fog') {
    efficiency = 0.9; // Slightly reduced in damp conditions
  } else {
    // Temperature also affects braking
    if (trackTemp < 60) {
      efficiency = 0.95; // Colder brakes are less efficient until they warm up
    } else if (trackTemp > 150) {
      efficiency = 0.9; // Very hot can lead to brake fade
    }
  }
  
  return efficiency;
}

/**
 * Calculate cross-wind effect based on wind speed
 */
function calculateCrossWindEffect(windSpeed) {
  if (windSpeed < 5) {
    return 'Negligible';
  } else if (windSpeed < 10) {
    return 'Minimal';
  } else if (windSpeed < 15) {
    return 'Moderate';
  } else if (windSpeed < 25) {
    return 'Significant';
  } else {
    return 'Severe';
  }
}

/**
 * Convert wind direction degrees to human-readable direction
 */
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Determine optimal tire compound based on conditions
 */
function getOptimalTireCompound(trackTemp, condition) {
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    return 'Wet';
  } else if (condition === 'Snow') {
    return 'Winter';
  }
  
  // Dry conditions - based on temperature
  if (trackTemp < 60) {
    return 'Soft';
  } else if (trackTemp > 100) {
    return 'Hard';
  } else {
    return 'Medium';
  }
}

/**
 * Assess visibility based on conditions
 */
function assessVisibility(visibilityKm, condition) {
  if (condition === 'Fog' || condition === 'Mist') {
    return 'Poor';
  }
  
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm' || condition === 'Snow') {
    return 'Reduced';
  }
  
  if (visibilityKm < 2) {
    return 'Poor';
  } else if (visibilityKm < 5) {
    return 'Moderate';
  } else {
    return 'Excellent';
  }
}

/**
 * Generate pit strategy recommendation
 */
function getPitStrategy(condition, trackTemp, trackEvolution) {
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    return "Wet weather protocol active. Consider starting on intermediates with constant monitoring for changing conditions. Reduced pace on out laps recommended to build tire temperature safely.";
  }
  
  if (condition === 'Snow') {
    return "Extreme conditions alert. Winter tires mandatory with significantly reduced speeds. Consider postponing performance driving activities.";
  }
  
  if (trackTemp < 60) {
    return "Cold surface conditions. Extended warm-up procedure required for both tires and brakes. Initial laps should focus on building temperature before pushing.";
  }
  
  if (trackTemp > 100) {
    return "Hot track conditions. Tire management critical with potential for overheating. Consider shorter stints and more conservative driving style in extended sessions.";
  }
  
  return "Optimal driving conditions. Standard stint lengths recommended with focus on consistent lap times. Progressive build-up to peak performance advised.";
}

export default F1WeatherHub;
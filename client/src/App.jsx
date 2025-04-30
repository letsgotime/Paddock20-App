import React, { useState, useEffect } from 'react';

// Helper function to get color based on value ranges
function getValueColor(value, type) {
  if (type === 'grip') {
    if (value >= 85) return 'text-green-500';
    if (value >= 70) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    if (value >= 30) return 'text-orange-400';
    return 'text-red-500';
  }
  
  if (type === 'braking') {
    if (value >= 90) return 'text-green-500';
    if (value >= 75) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 45) return 'text-orange-400';
    return 'text-red-500';
  }
  
  if (type === 'temperature') {
    // For Fahrenheit
    if (value > 100) return 'text-red-500';
    if (value > 90) return 'text-orange-400';
    if (value > 75) return 'text-green-500';
    if (value > 50) return 'text-green-400';
    if (value > 32) return 'text-blue-400';
    return 'text-blue-600';
  }
  
  return 'text-white';
}

// F1-style metric gauge component
function TelemetryGauge({ label, value, units, type, min = 0, max = 100 }) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const colorClass = getValueColor(value, type);
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${colorClass}`}>{value}{units}</div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 mt-1 overflow-hidden">
        <div 
          className={`h-full ${type === 'temperature' ? 'bg-gradient-to-r from-blue-500 via-green-500 to-red-500' : 'bg-blue-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default location (Charlotte)
  const DEFAULT_LOCATION = { lat: 35.2271, lon: -80.8431 };
  
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/automotive-weather?lat=${DEFAULT_LOCATION.lat}&lon=${DEFAULT_LOCATION.lon}&units=imperial`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchWeatherData();
    
    // Refresh every 15 minutes
    const intervalId = setInterval(fetchWeatherData, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Loading state
  if (loading && !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading telemetry data...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-amber-500 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Weather Telemetry Unavailable</h1>
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
  
  // If we have data, render it
  if (weatherData) {
    const { location, currentConditions, drivingConditions, performanceData } = weatherData;
    
    // Formatted time
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Weather icon class based on condition
    let weatherIconClass = "☀️"; // default sunny
    const weatherDesc = currentConditions.weather[0].description.toLowerCase();
    if (weatherDesc.includes('cloud')) weatherIconClass = "☁️";
    if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) weatherIconClass = "🌧️";
    if (weatherDesc.includes('snow')) weatherIconClass = "❄️";
    if (weatherDesc.includes('thunder')) weatherIconClass = "⚡";
    if (weatherDesc.includes('fog') || weatherDesc.includes('mist')) weatherIconClass = "🌫️";
    
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
        <div className="w-full max-w-5xl">
          {/* Header with F1-style telemetry feel */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-black/60 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400">PADDOCK20</div>
              <div className="ml-3 text-lg md:text-xl font-semibold">F1 Weather Telemetry</div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              <div className="text-sm mr-4">
                <div className="text-gray-400">{dateString}</div>
                <div className="text-right">{timeString}</div>
              </div>
              <div className="px-3 py-1 bg-blue-900/60 rounded text-xs uppercase tracking-wider">
                Live
              </div>
            </div>
          </div>
          
          {/* Main weather display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left column */}
            <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 p-5 md:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-2xl font-bold">{location.name}</h2>
                    <div className="ml-2 text-3xl">{weatherIconClass}</div>
                  </div>
                  <p className="text-gray-400 capitalize">{currentConditions.weather[0].description}</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold">{Math.round(currentConditions.temp)}°</div>
                  <div className="text-sm text-gray-400">Feels like {Math.round(currentConditions.feels_like)}°</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <TelemetryGauge 
                  label="Track Temp" 
                  value={Math.round(drivingConditions.track_temp)} 
                  units="°F" 
                  type="temperature"
                  min={32}
                  max={120}
                />
                <TelemetryGauge 
                  label="Grip Index" 
                  value={drivingConditions.grip_index} 
                  units="" 
                  type="grip"
                />
                <TelemetryGauge 
                  label="Braking" 
                  value={performanceData.braking_efficiency} 
                  units="%" 
                  type="braking"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-400">Humidity</div>
                  <div className="text-lg font-semibold">{currentConditions.humidity}%</div>
                </div>
                <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-400">Wind</div>
                  <div className="text-lg font-semibold">{Math.round(currentConditions.wind_speed)}<span className="text-sm">mph</span></div>
                </div>
                <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-400">Pressure</div>
                  <div className="text-lg font-semibold">{Math.round(currentConditions.pressure)}<span className="text-sm">hPa</span></div>
                </div>
                <div className="bg-gray-700/60 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-400">Dew Point</div>
                  <div className="text-lg font-semibold">{Math.round(currentConditions.dew_point)}°</div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <span className="h-2 w-2 bg-blue-400 rounded-full mr-2"></span>
                  Track Risk Assessment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between text-sm">
                    <span>Surface:</span>
                    <span className={getValueColor(drivingConditions.grip_index, 'grip')}>{drivingConditions.grip_assessment}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Precipitation:</span>
                    <span>{Math.round(drivingConditions.precipitation_probability)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Crosswind:</span>
                    <span>{performanceData.crosswind_effect}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Visibility:</span>
                    <span>{currentConditions.visibility > 5 ? 'Good' : currentConditions.visibility > 2 ? 'Moderate' : 'Poor'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 p-5">
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700">Performance Impact</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Grip Level</span>
                      <span className="text-sm font-medium">{drivingConditions.grip_index}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full" 
                        style={{ width: `${drivingConditions.grip_index}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Braking Efficiency</span>
                      <span className="text-sm font-medium">{performanceData.braking_efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${performanceData.braking_efficiency}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Cooling Performance</span>
                      <span className="text-sm font-medium">{
                        performanceData.cooling_efficiency === "Optimal" ? "100%" :
                        performanceData.cooling_efficiency === "Good" ? "85%" :
                        performanceData.cooling_efficiency === "Fair" ? "70%" :
                        performanceData.cooling_efficiency === "Poor" ? "50%" : "30%"
                      }</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" 
                        style={{ width: `${
                          performanceData.cooling_efficiency === "Optimal" ? "100%" :
                          performanceData.cooling_efficiency === "Good" ? "85%" :
                          performanceData.cooling_efficiency === "Fair" ? "70%" :
                          performanceData.cooling_efficiency === "Poor" ? "50%" : "30%"
                        }` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/80 rounded-lg shadow-lg border border-gray-700 p-5">
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  Driver Guidance
                </h3>
                <div className="text-sm">
                  <p className="mb-2">{weatherData.drivingRecommendation}</p>
                  <div className="mt-3 py-2 px-3 bg-blue-900/30 rounded-md border border-blue-700/20 text-blue-300">
                    <div className="font-medium">Track Condition: {drivingConditions.track_condition}</div>
                    <div className="mt-1 text-xs text-blue-200/80">{
                      drivingConditions.track_condition === "Dry" ? 
                        "Optimal grip levels. Suitable for high-performance driving." :
                      drivingConditions.track_condition === "Damp" ?
                        "Reduced grip in some areas. Exercise caution when accelerating." :
                      drivingConditions.track_condition === "Wet" ?
                        "Significantly reduced grip. Consider rain-optimized driving lines." :
                        "Extremely hazardous conditions. Defensive driving recommended."
                    }</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom status bar */}
          <div className="flex justify-between items-center text-xs text-gray-400 bg-black/40 rounded-lg p-2 border-t border-gray-800">
            <div>Telemetry data refreshes every 15 minutes</div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span>Connection: ACTIVE</span>
            </div>
            <div>Data source: OpenWeather API</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback (should never happen if all states are properly handled)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <p>Something went wrong. Please refresh the page.</p>
    </div>
  );
}

export default App;
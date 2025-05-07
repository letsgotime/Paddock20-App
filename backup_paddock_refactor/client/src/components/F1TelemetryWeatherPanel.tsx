import React, { useEffect, useState } from "react";

// Define the telemetry and weather data structure
type F1WeatherTelemetry = {
  // Basic weather data from API
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  description: string;
  icon: string;
  
  // Calculated F1-specific metrics
  trackSurfaceTemp: number;
  trackGripIndex: number;
  trackDampness: number;
  uvIndex: number;
  solarLoad: number;
  dewPoint: number;
  visibilityDistance: number;
  crossoverTime: number; // Time in minutes to switch tires
  tireWarmupTime: number; // Estimated time to optimal tire temp
  
  // Strategy data
  optimalWindow: {
    soft: [number, number]; // Temperature range in Celsius
    medium: [number, number];
    hard: [number, number];
    intermediate: [number, number];
    wet: [number, number];
  };
  
  // Rain forecast
  rainProbability: number;
  rainIntensity: number | null;
  stormDistance: number | null; // in kilometers
};

interface F1TelemetryWeatherPanelProps {
  lat: number;
  lon: number;
  circuitName: string;
}

const F1TelemetryWeatherPanel: React.FC<F1TelemetryWeatherPanelProps> = ({ 
  lat, 
  lon, 
  circuitName 
}) => {
  const [telemetryData, setTelemetryData] = useState<F1WeatherTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch weather data and calculate F1 telemetry metrics
  useEffect(() => {
    const fetchWeatherAndCalculateMetrics = async () => {
      try {
        setLoading(true);
        
        // Add timeout protection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Fetch basic weather data
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Weather API returned ${response.status}`);
        }
        
        const weatherData = await response.json();
        
        // Calculate F1-specific metrics based on weather data
        const trackSurfaceTemp = calculateTrackSurfaceTemp(
          weatherData.main.temp,
          weatherData.clouds?.all || 0,
          weatherData.wind.speed
        );
        
        const dewPoint = calculateDewPoint(
          weatherData.main.temp, 
          weatherData.main.humidity
        );
        
        const trackGripIndex = calculateTrackGrip(
          trackSurfaceTemp,
          weatherData.main.humidity,
          weatherData.weather[0].main === "Rain"
        );
        
        const trackDampness = weatherData.weather[0].main === "Rain" 
          ? Math.min(100, 30 + (weatherData.rain?.["1h"] || 0) * 50)
          : 0;
        
        const uvIndex = calculateUVIndex(
          weatherData.clouds?.all || 0,
          weatherData.weather[0].id
        );
        
        const solarLoad = calculateSolarLoad(
          uvIndex,
          weatherData.clouds?.all || 0,
          new Date().getHours()
        );
        
        const visibilityDistance = weatherData.visibility 
          ? weatherData.visibility / 1000 // Convert to km
          : 10; // Default 10km
        
        const crossoverTime = calculateCrossoverTime(
          trackDampness,
          weatherData.rain?.["1h"] || 0,
          weatherData.wind.speed
        );
        
        const tireWarmupTime = calculateTireWarmupTime(
          trackSurfaceTemp,
          weatherData.main.temp,
          weatherData.wind.speed
        );
        
        // Calculate rain metrics
        const rainProbability = calculateRainProbability(
          weatherData.clouds?.all || 0,
          weatherData.main.humidity,
          weatherData.weather[0].id
        );
        
        // Full F1 telemetry object with both API data and calculated metrics
        const f1Telemetry: F1WeatherTelemetry = {
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
          windDirection: weatherData.wind.deg,
          pressure: weatherData.main.pressure,
          description: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          
          trackSurfaceTemp,
          trackGripIndex,
          trackDampness,
          uvIndex,
          solarLoad,
          dewPoint,
          visibilityDistance,
          crossoverTime,
          tireWarmupTime,
          
          optimalWindow: {
            soft: [80, 110], // Optimal track temperature range in Celsius
            medium: [60, 120],
            hard: [40, 130],
            intermediate: [5, 40],
            wet: [0, 20]
          },
          
          rainProbability,
          rainIntensity: weatherData.rain?.["1h"] || null,
          stormDistance: weatherData.weather[0].id >= 200 && weatherData.weather[0].id < 300 
            ? Math.floor(Math.random() * 100) // Simulated storm distance
            : null
        };
        
        setTelemetryData(f1Telemetry);
      } catch (err) {
        console.error("Error fetching F1 telemetry data:", err);
        setError("Failed to fetch telemetry data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherAndCalculateMetrics();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchWeatherAndCalculateMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lat, lon]);
  
  // Helper calculation functions
  const calculateTrackSurfaceTemp = (airTemp: number, cloudCover: number, windSpeed: number): number => {
    // Track temp is typically 10-20°C higher than air temp in full sun
    // Cloud cover and wind reduces this differential
    const sunFactor = 1 - (cloudCover / 100) * 0.7;
    const windCooling = Math.min(5, windSpeed * 0.5);
    const surfaceTemp = airTemp + (20 * sunFactor) - windCooling;
    return Math.round(surfaceTemp);
  };
  
  const calculateDewPoint = (temp: number, humidity: number): number => {
    // Magnus approximation for dew point
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 10) / 10;
  };
  
  const calculateTrackGrip = (trackTemp: number, humidity: number, isRaining: boolean): number => {
    // Scale 0-100, 100 being maximum grip
    // Optimal grip is at moderate track temps and low-moderate humidity
    if (isRaining) {
      return Math.max(10, 40 - humidity * 0.3);
    }
    
    // Penalize very cold or very hot track temps
    let tempFactor = 0;
    if (trackTemp < 20) {
      tempFactor = trackTemp / 20 * 50; // Linear scaling up to 20°C
    } else if (trackTemp <= 50) {
      tempFactor = 50 + 50 * (1 - Math.abs(trackTemp - 35) / 15); // Peak at 35°C
    } else {
      tempFactor = Math.max(0, 100 - (trackTemp - 50) * 2);
    }
    
    // Humidity penalty (higher humidity = lower grip)
    const humidityFactor = 100 - humidity * 0.2;
    
    return Math.round(Math.min(100, 0.7 * tempFactor + 0.3 * humidityFactor));
  };
  
  const calculateUVIndex = (cloudCover: number, weatherId: number): number => {
    // Base UV on a 0-11 scale, influenced by cloud cover and precipitation
    const maxUVForTime = 9; // Mid-day would be max
    
    // Reduce for cloud cover
    let uvReduction = cloudCover / 100;
    
    // Further reduce for precipitation
    if (weatherId >= 200 && weatherId < 700) { // Thunderstorm, drizzle, rain, snow conditions
      uvReduction += 0.3;
    }
    
    return Math.max(0, Math.min(11, Math.round((1 - uvReduction) * maxUVForTime)));
  };
  
  const calculateSolarLoad = (uvIndex: number, cloudCover: number, hour: number): number => {
    // 0-100 scale representing solar radiation impact
    // Affected by time of day, UV, and cloud cover
    const dayFactor = Math.sin(Math.PI * (hour - 6) / 12); // Peak at noon
    const daytimeFactor = hour >= 6 && hour <= 18 ? Math.max(0, dayFactor) : 0;
    
    return Math.round(uvIndex / 11 * (100 - cloudCover * 0.7) * daytimeFactor);
  };
  
  const calculateCrossoverTime = (dampness: number, rainfall: number, windSpeed: number): number => {
    // Minutes until track dries enough to switch from wet/inter to slicks
    // Or time until full wet conditions require tire change
    if (dampness === 0 || rainfall === 0) return 0;
    
    // Drying time affected by wind, rainfall and current dampness
    const dryingFactor = 1 + (windSpeed / 10);
    
    if (rainfall > 0) {
      // Getting wetter - time until full wet needed
      return Math.round(Math.max(0, (100 - dampness) / (rainfall * 20)));
    } else {
      // Drying - time until slicks viable
      return Math.round(dampness / (dryingFactor * 5));
    }
  };
  
  const calculateTireWarmupTime = (trackTemp: number, airTemp: number, windSpeed: number): number => {
    // Time in laps (typically 1-3) to get tires into optimal temp window
    // Colder conditions and higher wind extend warmup time
    const baseWarmup = 1; // Minimum 1 lap
    
    // Calculate additional laps based on temperature and wind
    const tempFactor = Math.max(0, (30 - trackTemp) / 10); // More laps below 30°C
    const windFactor = windSpeed > 15 ? 0.5 : windSpeed / 30; // Wind cooling effect
    
    return Math.min(5, Math.max(1, Math.round((baseWarmup + tempFactor + windFactor) * 10) / 10));
  };
  
  const calculateRainProbability = (cloudCover: number, humidity: number, weatherId: number): number => {
    // Rain probability based on current conditions
    // Uses cloud cover, humidity and current weather ID pattern
    
    // Already raining
    if (weatherId >= 300 && weatherId < 600) return 100;
    
    // Thunderstorm conditions
    if (weatherId >= 200 && weatherId < 300) return 90;
    
    // Base probability on cloud cover and humidity
    let probability = (cloudCover * 0.5) + (humidity - 50) * 0.5;
    
    // Adjust based on current weather id patterns
    if (weatherId >= 700 && weatherId < 800) probability += 15; // Atmospheric conditions
    if (weatherId === 803 || weatherId === 804) probability += 20; // Broken/overcast clouds
    
    return Math.min(100, Math.max(0, Math.round(probability)));
  };
  
  // Function to determine tire compound recommendation
  const recommendTireCompound = (): string => {
    if (!telemetryData) return "Unknown";
    
    const { trackSurfaceTemp, trackDampness } = telemetryData;
    
    if (trackDampness > 70) return "Wet";
    if (trackDampness > 20) return "Intermediate";
    
    if (trackSurfaceTemp > 100) return "Hard";
    if (trackSurfaceTemp > 70) return "Medium";
    return "Soft";
  };
  
  // Function to render the grip status with appropriate color
  const renderGripStatus = (): { text: string; color: string } => {
    if (!telemetryData) return { text: "Unknown", color: "text-gray-400" };
    
    const { trackGripIndex } = telemetryData;
    
    if (trackGripIndex > 85) return { text: "Excellent", color: "text-green-500" };
    if (trackGripIndex > 70) return { text: "Good", color: "text-green-400" };
    if (trackGripIndex > 50) return { text: "Moderate", color: "text-yellow-400" };
    if (trackGripIndex > 30) return { text: "Poor", color: "text-orange-400" };
    return { text: "Critical", color: "text-red-500" };
  };
  
  // Get appropriate weather icon URL
  const getWeatherIcon = (iconCode: string): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };
  
  if (loading) {
    return (
      <div className="bg-black/50 p-6 rounded-lg border border-gray-800 animate-pulse">
        <h2 className="text-blue-400 font-orbitron text-xl mb-4">
          🏎️ F1 Telemetry Loading...
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800/40 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-black/50 p-6 rounded-lg border border-red-800">
        <h2 className="text-red-400 font-orbitron text-xl mb-2">
          ⚠️ Telemetry Error
        </h2>
        <p className="text-gray-300">{error}</p>
        <p className="text-gray-400 text-sm mt-2">
          Weather data unavailable. Check API status or connectivity.
        </p>
      </div>
    );
  }
  
  const gripStatus = renderGripStatus();
  const recommendedTire = recommendTireCompound();
  
  return (
    <div className="bg-black/50 p-6 rounded-lg border border-gray-800 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-400 font-orbitron text-xl">
          🏎️ F1 Telemetry - {circuitName}
        </h2>
        <div className="flex items-center">
          {telemetryData && (
            <img 
              src={getWeatherIcon(telemetryData.icon)} 
              alt={telemetryData.description} 
              className="w-12 h-12 mr-2"
            />
          )}
          <span className="text-white font-bold text-xl">
            {telemetryData?.temperature.toFixed(1)}°C
          </span>
        </div>
      </div>
      
      {telemetryData && (
        <>
          {/* Track Conditions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-black/70 rounded-lg p-4 border border-gray-700">
              <h3 className="text-blue-400 text-sm uppercase tracking-wider mb-3">Track Surface</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Surface Temp</span>
                  <span className="text-white font-bold">{telemetryData.trackSurfaceTemp}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Grip Level</span>
                  <span className={`font-bold ${gripStatus.color}`}>
                    {telemetryData.trackGripIndex}% - {gripStatus.text}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Track State</span>
                  <span className="text-white font-bold">
                    {telemetryData.trackDampness > 0 
                      ? `${telemetryData.trackDampness}% Wet` 
                      : "Dry"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/70 rounded-lg p-4 border border-gray-700">
              <h3 className="text-blue-400 text-sm uppercase tracking-wider mb-3">Atmospheric</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Humidity</span>
                  <span className="text-white font-bold">{telemetryData.humidity}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Wind</span>
                  <span className="text-white font-bold">
                    {telemetryData.windSpeed} m/s {getWindDirection(telemetryData.windDirection)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pressure</span>
                  <span className="text-white font-bold">{telemetryData.pressure} hPa</span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/70 rounded-lg p-4 border border-gray-700">
              <h3 className="text-blue-400 text-sm uppercase tracking-wider mb-3">Solar</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">UV Index</span>
                  <span className="text-white font-bold">{telemetryData.uvIndex}/11</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Solar Load</span>
                  <span className="text-white font-bold">{telemetryData.solarLoad}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Visibility</span>
                  <span className="text-white font-bold">{telemetryData.visibilityDistance} km</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Strategy Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-black/70 rounded-lg p-4 border border-gray-700">
              <h3 className="text-blue-400 text-sm uppercase tracking-wider mb-3">Tire Strategy</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Recommended</span>
                    <span className={`font-bold ${getTireColor(recommendedTire)}`}>
                      {recommendedTire}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Warm-up Time</span>
                    <span className="text-white font-bold">
                      {telemetryData.tireWarmupTime} laps
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Crossover Time</span>
                    <span className="text-white font-bold">
                      {telemetryData.crossoverTime > 0 
                        ? `${telemetryData.crossoverTime} min`
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="relative pt-1">
                    <div className="text-xs text-gray-400 mb-1">Compound Temp Windows</div>
                    <TireTemperatureBar 
                      current={telemetryData.trackSurfaceTemp} 
                      windows={telemetryData.optimalWindow}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/70 rounded-lg p-4 border border-gray-700">
              <h3 className="text-blue-400 text-sm uppercase tracking-wider mb-3">Precipitation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Rain Chance</span>
                    <span className={`font-bold ${getPrecipitationColor(telemetryData.rainProbability)}`}>
                      {telemetryData.rainProbability}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Intensity</span>
                    <span className="text-white font-bold">
                      {telemetryData.rainIntensity 
                        ? `${telemetryData.rainIntensity.toFixed(1)} mm/h`
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dew Point</span>
                    <span className="text-white font-bold">{telemetryData.dewPoint}°C</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  {telemetryData.rainProbability > 30 ? (
                    <div className="rounded-lg bg-blue-900/30 p-3 border border-blue-900">
                      <span className="text-sm text-blue-300 block mb-1">
                        <span className="font-bold">⚠️ Weather Alert</span>
                      </span>
                      <span className="text-xs text-blue-200 block">
                        {telemetryData.rainProbability > 70 
                          ? "Prepare for imminent precipitation"
                          : "Monitor conditions for potential rain"}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-green-900/20 p-3 border border-green-900">
                      <span className="text-sm text-green-300 block mb-1">
                        <span className="font-bold">✓ Clear Conditions</span>
                      </span>
                      <span className="text-xs text-green-200 block">
                        Stable weather expected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Race Engineer Note */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-900/50">
            <h3 className="text-blue-300 font-bold flex items-center">
              <span className="mr-2">🎧</span> Race Engineer Notes
            </h3>
            <p className="text-blue-100 mt-2">
              {generateEngineerNotes(telemetryData, recommendedTire)}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

// Helper Components
const TireTemperatureBar: React.FC<{
  current: number;
  windows: {
    soft: [number, number];
    medium: [number, number];
    hard: [number, number];
    intermediate: [number, number];
    wet: [number, number];
  };
}> = ({ current, windows }) => {
  // Temperature range for the visualization (0-140°C)
  const maxTemp = 140;
  
  // Calculate the percentage position for the current temperature marker
  const currentPosition = Math.min(100, (current / maxTemp) * 100);
  
  // Calculate the percentage positions for each compound's window
  const calculateRange = (range: [number, number]) => {
    return {
      start: Math.min(100, (range[0] / maxTemp) * 100),
      width: Math.min(100, ((range[1] - range[0]) / maxTemp) * 100),
    };
  };
  
  const softRange = calculateRange(windows.soft);
  const mediumRange = calculateRange(windows.medium);
  const hardRange = calculateRange(windows.hard);
  const interRange = calculateRange(windows.intermediate);
  const wetRange = calculateRange(windows.wet);
  
  return (
    <div className="relative h-20 bg-gray-900 rounded-md overflow-hidden">
      {/* Temperature scale markers */}
      <div className="absolute top-0 left-0 w-full h-full flex">
        {[0, 20, 40, 60, 80, 100, 120, 140].map((temp) => {
          const position = (temp / maxTemp) * 100;
          return (
            <div
              key={temp}
              className="absolute h-full w-px bg-gray-700"
              style={{ left: `${position}%` }}
            >
              <span className="absolute top-0 text-[8px] text-gray-500 transform -translate-x-1/2">
                {temp}°
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Compound temperature windows */}
      <div className="absolute top-2 h-3 left-0 w-full">
        <div
          className="absolute h-full bg-blue-600/50 rounded-sm"
          style={{ left: `${wetRange.start}%`, width: `${wetRange.width}%` }}
        />
      </div>
      <div className="absolute top-6 h-3 left-0 w-full">
        <div
          className="absolute h-full bg-green-600/50 rounded-sm"
          style={{ left: `${interRange.start}%`, width: `${interRange.width}%` }}
        />
      </div>
      <div className="absolute top-10 h-3 left-0 w-full">
        <div
          className="absolute h-full bg-white/50 rounded-sm"
          style={{ left: `${hardRange.start}%`, width: `${hardRange.width}%` }}
        />
      </div>
      <div className="absolute top-14 h-3 left-0 w-full">
        <div
          className="absolute h-full bg-yellow-600/50 rounded-sm"
          style={{ left: `${mediumRange.start}%`, width: `${mediumRange.width}%` }}
        />
      </div>
      <div className="absolute top-18 h-3 left-0 w-full"> 
        <div
          className="absolute h-full bg-red-600/50 rounded-sm"
          style={{ left: `${softRange.start}%`, width: `${softRange.width}%` }}
        />
      </div>
      
      {/* Current temperature marker */}
      <div
        className="absolute h-full w-1 bg-white z-10"
        style={{ left: `${currentPosition}%` }}
      >
        <div className="w-2 h-2 rounded-full bg-white absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] text-white font-bold bg-black/70 px-1 rounded">
            {current}°C
          </span>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute right-1 top-2 text-[8px] text-blue-300">Wet</div>
      <div className="absolute right-1 top-6 text-[8px] text-green-300">Inter</div>
      <div className="absolute right-1 top-10 text-[8px] text-gray-300">Hard</div>
      <div className="absolute right-1 top-14 text-[8px] text-yellow-300">Med</div>
      <div className="absolute right-1 top-18 text-[8px] text-red-300">Soft</div>
    </div>
  );
};

// Helper Functions
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
};

const getTireColor = (compound: string): string => {
  switch (compound.toLowerCase()) {
    case 'soft': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'hard': return 'text-white';
    case 'intermediate': return 'text-green-500';
    case 'wet': return 'text-blue-500';
    default: return 'text-gray-400';
  }
};

const getPrecipitationColor = (probability: number): string => {
  if (probability > 80) return 'text-blue-500';
  if (probability > 50) return 'text-blue-400';
  if (probability > 30) return 'text-yellow-400';
  return 'text-green-500';
};

const generateEngineerNotes = (data: F1WeatherTelemetry, recommendedTire: string): string => {
  const notes: string[] = [];
  
  // Track condition note
  if (data.trackDampness > 0) {
    notes.push(`Track is ${data.trackDampness}% wet. ${recommendedTire} tires recommended for current conditions.`);
  } else {
    notes.push(`Track completely dry. ${recommendedTire} compound optimal in these conditions.`);
  }
  
  // Grip note
  if (data.trackGripIndex < 50) {
    notes.push("Low grip conditions. Conservative braking into corners advised.");
  } else if (data.trackGripIndex > 80) {
    notes.push("Excellent grip, track well rubbered in. Push on out-laps.");
  }
  
  // Weather prediction note
  if (data.rainProbability > 70) {
    notes.push("High chance of precipitation. Prepare for changing conditions!");
  } else if (data.windSpeed > 20) {
    notes.push(`Strong winds (${data.windSpeed} m/s) affecting car stability in high-speed corners.`);
  }
  
  // Temperature note
  if (data.trackSurfaceTemp > 100) {
    notes.push("Very hot track surface. Monitor tire degradation closely.");
  } else if (data.trackSurfaceTemp < 40) {
    notes.push("Cold track temps. Expect extended tire warm-up phases.");
  }
  
  // Random selection and formatting
  const selectedNotes = notes.length > 2 
    ? [notes[0], notes[Math.floor(Math.random() * (notes.length - 1)) + 1]] 
    : notes;
    
  return selectedNotes.join(" ");
};

export default F1TelemetryWeatherPanel;
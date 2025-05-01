import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

const F1TelemetryWeatherStation: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number | null, lon: number | null }>({ lat: null, lon: null });
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [automotiveData, setAutomotiveData] = useState<any>(null);
  const [refreshTime, setRefreshTime] = useState<Date>(new Date());

  // Get the user's current location
  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to Charlotte, NC
          setLocation({ lat: 35.2271, lon: -80.8431 });
          toast({
            title: "Using default location",
            description: "Charlotte, NC - Enable location for your area",
            variant: "destructive",
          });
        }
      );
    } else {
      // Default to Charlotte, NC if geolocation is not supported
      setLocation({ lat: 35.2271, lon: -80.8431 });
    }
  }, []);

  // Fetch weather data when location is available
  useEffect(() => {
    if (location.lat && location.lon) {
      fetchAllWeatherData();
    }
  }, [location]);

  // Sets up auto-refresh of weather data every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (location.lat && location.lon) {
        fetchAllWeatherData();
        setRefreshTime(new Date());
      }
    }, 600000); // 10 minutes
    
    return () => clearInterval(interval);
  }, [location]);

  const fetchAllWeatherData = async () => {
    console.log('F1TelemetryWeatherStation: fetchAllWeatherData started');
    setLoading(true);
    
    // Set a timeout to ensure loading spinner doesn't run indefinitely
    const loadingTimeout = setTimeout(() => {
      console.log('F1TelemetryWeatherStation: Loading timeout triggered, forcing data display');
      setLoading(false);
      
      // If we don't have weather data yet, set default values
      if (!weather) {
        setWeather({
          name: "Charlotte",
          main: {
            temp: 72,
            feels_like: 75,
            humidity: 62,
            pressure: 1015
          },
          weather: [
            {
              main: "Clear",
              description: "clear sky",
              icon: "01d"
            }
          ],
          wind: {
            speed: 5.5
          },
          visibility: 10000,
          clouds: {
            all: 10
          }
        });
        setLocationName("Charlotte");
      }
      
      // If we don't have automotive data yet, provide default values
      if (!automotiveData) {
        setAutomotiveData({
          surfaces: {
            asphalt: { 
              temperature: 75,
              condition: "Dry",
              gripLevel: "Optimal"
            }
          },
          performance: {
            brakingPerformance: { 
              effectiveCoefficient: 0.9,
              heatDissipation: "Normal" 
            },
            aerodynamicPerformance: { 
              efficiency: 0.92 
            },
            coolingEfficiency: "Normal"
          },
          drivingConditions: {
            visibility: "Excellent",
            riskLevel: "Minimal",
            traction: "Optimal",
            advisories: ["Ideal driving conditions", "Perfect day for spirited driving"]
          }
        });
      }
    }, 5000); // 5 second timeout
    
    try {
      // Fetch each data type separately so one failure doesn't block the others
      try {
        console.log('F1TelemetryWeatherStation: Fetching weather data');
        await fetchWeatherData();
        console.log('F1TelemetryWeatherStation: Weather data fetched successfully');
      } catch (weatherErr) {
        console.error("Error fetching weather data:", weatherErr);
      }
      
      try {
        console.log('F1TelemetryWeatherStation: Fetching forecast data');
        await fetchForecastData();
        console.log('F1TelemetryWeatherStation: Forecast data fetched successfully');
      } catch (forecastErr) {
        console.error("Error fetching forecast data:", forecastErr);
      }
      
      try {
        console.log('F1TelemetryWeatherStation: Fetching automotive weather data');
        await fetchAutomotiveWeatherData();
        console.log('F1TelemetryWeatherStation: Automotive data fetched successfully');
      } catch (autoErr) {
        console.error("Error fetching automotive weather data:", autoErr);
        // Create default automotive data so the UI can render
        setAutomotiveData({
          surfaces: {
            asphalt: { gripLevel: 'Moderate' }
          },
          performance: {
            brakingPerformance: { effectiveCoefficient: 0.8 },
            aerodynamicPerformance: { efficiency: 0.85 },
            coolingEfficiency: 0.8
          },
          drivingConditions: {
            visibility: 'Good',
            riskLevel: 'Low'
          }
        });
      }
      
      setError(null);
    } catch (err) {
      console.error("Error in weather telemetry system:", err);
      setError("Failed to load weather data. Please try again later.");
    } finally {
      // Clear the timeout since we're done loading
      clearTimeout(loadingTimeout);
      // Always set loading to false, even if some API calls failed
      setLoading(false);
      console.log('F1TelemetryWeatherStation: fetchAllWeatherData completed, loading set to false');
    }
  };

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}&units=imperial`);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      const data = await response.json();
      setWeather(data);
      setLocationName(data.name);
      return data;
    } catch (error) {
      console.error("Error fetching standard weather:", error);
      toast({
        title: "Weather data error",
        description: "Failed to load current weather data",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await fetch(`/api/onecall?lat=${location.lat}&lon=${location.lon}&units=imperial`);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      const data = await response.json();
      
      // Extract the next 24 hours of hourly forecast data
      const hourlyData = data.hourly?.slice(0, 24) || [];
      setForecast(hourlyData);
      return data;
    } catch (error) {
      console.error("Error fetching forecast:", error);
      toast({
        title: "Forecast data error",
        description: "Failed to load forecast data",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchAutomotiveWeatherData = async () => {
    try {
      console.log(`F1TelemetryWeatherStation: Fetching automotive data for location ${location.lat},${location.lon}`);
      const response = await fetch(`/api/automotive-weather?lat=${location.lat}&lon=${location.lon}`);
      
      if (!response.ok) {
        console.error(`Automotive weather API error: ${response.status}`);
        throw new Error(`Automotive weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('F1TelemetryWeatherStation: Automotive data received successfully');
      
      if (!data) {
        console.error('F1TelemetryWeatherStation: No automotive data received');
        throw new Error('No automotive data received');
      }
      
      setAutomotiveData(data);
      return data;
    } catch (error) {
      console.error("Error fetching automotive data:", error);
      toast({
        title: "Weather Data Error",
        description: "Unable to fetch automotive telemetry data. Retrying...",
        variant: "destructive",
      });
      
      // Attempt to retry once after a short delay
      setTimeout(() => {
        console.log('F1TelemetryWeatherStation: Retrying automotive data fetch');
        fetch(`/api/automotive-weather?lat=${location.lat}&lon=${location.lon}`)
          .then(res => res.json())
          .then(data => {
            console.log('F1TelemetryWeatherStation: Retry successful, setting automotive data');
            setAutomotiveData(data);
          })
          .catch(err => {
            console.error('F1TelemetryWeatherStation: Retry failed', err);
            throw error; // Re-throw for the outer catch handler
          });
      }, 2000);
      
      toast({
        title: "Using default telemetry values",
        description: "We're using estimated values since live data couldn't be loaded",
        variant: "destructive",
      });
      
      return defaultData;
    }
  };

  // Function to get weather icon
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Function to convert timestamp to time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  // Function to format last updated time
  const formatRefreshTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Function to get F1-style tire recommendation based on weather
  const getTireRecommendation = () => {
    if (!weather) return { tire: 'Unknown', color: '#777', icon: '❓', details: 'Awaiting data...' };

    const temp = weather.main.temp;
    const conditions = weather.weather[0].main.toLowerCase();
    const rain = conditions.includes('rain') || conditions.includes('drizzle');
    const thunderstorm = conditions.includes('thunderstorm');
    const snow = conditions.includes('snow');
    const heavyRain = rain && weather.rain && weather.rain['1h'] > 7;

    if (snow) {
      return { 
        tire: 'Wet (Snow)', 
        color: '#3366cc', 
        icon: '❄️',
        details: 'Extreme caution required. Minimal traction. Consider winter tires.'
      };
    } else if (thunderstorm || heavyRain) {
      return { 
        tire: 'Extreme Wet', 
        color: '#003366', 
        icon: '🌧️',
        details: 'Very poor traction, hydroplaning risk high, reduce speed significantly.'
      };
    } else if (rain) {
      return { 
        tire: 'Intermediate', 
        color: '#00FF00', 
        icon: '💧',
        details: 'Moderate traction loss, adjust driving style for wet conditions.' 
      };
    } else if (temp < 59) {
      return { 
        tire: 'Hard', 
        color: '#FFFFFF', 
        icon: '⚪',
        details: 'Cold surface temperature. Tire warming required for optimal grip.' 
      };
    } else if (temp < 77) {
      return { 
        tire: 'Medium', 
        color: '#FFCC00', 
        icon: '🟡',
        details: 'Optimal surface temperature. Good balance of grip and durability.' 
      };
    } else {
      return { 
        tire: 'Soft', 
        color: '#FF0000', 
        icon: '🔴',
        details: 'High surface temperature. Maximum grip but monitor for degradation.' 
      };
    }
  };

  // Function to get performance metrics scale (0-100)
  const getPerformanceMetric = (value: number, min: number, max: number, invert: boolean = false) => {
    const normalizedValue = ((value - min) / (max - min)) * 100;
    const clampedValue = Math.min(100, Math.max(0, normalizedValue));
    return invert ? 100 - clampedValue : clampedValue;
  };

  // Generate performance metrics if data exists
  const getPerformanceData = () => {
    if (!automotiveData || !automotiveData.surfaces || !automotiveData.performance || !automotiveData.drivingConditions) {
      console.log('F1TelemetryWeatherStation: Missing automotive data structure, using default values');
      // Default performance data
      return {
        traction: 75,
        braking: 80,
        aerodynamics: 85,
        cooling: 80,
        visibility: 90,
        risk: 10
      };
    }
    
    try {
      return {
        traction: getPerformanceMetric(
          getTractionValue(automotiveData.surfaces.asphalt.gripLevel),
          0, 
          10,
          false
        ),
        braking: getPerformanceMetric(
          automotiveData.performance.brakingPerformance.effectiveCoefficient,
          0.7,
          1.0,
          false
        ),
        aerodynamics: getPerformanceMetric(
          automotiveData.performance.aerodynamicPerformance.efficiency,
          0.7,
          1.0,
          false
        ),
        cooling: typeof automotiveData.performance.coolingEfficiency === 'number' 
          ? getPerformanceMetric(automotiveData.performance.coolingEfficiency, 0.7, 1.0, false)
          : 80, // Default value for string-based cooling efficiency
        visibility: getPerformanceMetric(
          getVisibilityValue(automotiveData.drivingConditions.visibility),
          0,
          10,
          false
        ),
        risk: getPerformanceMetric(
          getRiskValue(automotiveData.drivingConditions.riskLevel),
          0,
          10,
          true
        )
      };
    } catch (error) {
      console.error('F1TelemetryWeatherStation: Error calculating performance data:', error);
      // Default performance data in case of error
      return {
        traction: 75,
        braking: 80,
        aerodynamics: 85,
        cooling: 80,
        visibility: 90,
        risk: 10
      };
    }
  };

  // Helper functions to convert string values to numbers
  const getTractionValue = (gripLevel: string): number => {
    const gripMap: {[key: string]: number} = {
      'Extremely Low': 1,
      'Low': 3, 
      'Reduced': 5,
      'Moderate': 6,
      'Slightly Reduced': 7,
      'Degrading': 8,
      'Optimal': 9.5
    };
    return gripMap[gripLevel] || 5;
  };

  const getVisibilityValue = (visibilityLevel: string): number => {
    const visibilityMap: {[key: string]: number} = {
      'Very Poor': 1,
      'Poor': 3,
      'Moderate': 5,
      'Good': 7.5,
      'Excellent': 9.5
    };
    return visibilityMap[visibilityLevel] || 5;
  };

  const getRiskValue = (riskLevel: string): number => {
    const riskMap: {[key: string]: number} = {
      'Extreme': 9.5,
      'High': 7.5,
      'Moderate': 5,
      'Low': 2.5,
      'Minimal': 1
    };
    return riskMap[riskLevel] || 5;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-black/20 rounded-lg border border-gray-800 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400 mb-4"></div>
        <p className="text-green-400 text-lg font-bold uppercase">Loading telemetry data</p>
        <p className="text-gray-500 text-sm">Please wait while we fetch real-time weather & drive conditions</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center bg-black/20 rounded-lg border border-gray-800 p-6">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-400 text-lg font-bold mb-2">Telemetry System Error</p>
        <p className="text-gray-400 text-center mb-4">{error}</p>
        <button 
          onClick={fetchAllWeatherData}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // If we have weather data, display it
  const tireRec = getTireRecommendation();
  const performanceData = getPerformanceData();

  return (
    <div className="weather-telemetry text-white">
      {/* Status bar with refresh time */}
      <div className="flex justify-between items-center mb-6 bg-black/40 py-1 px-3 rounded-sm border-b border-green-900 text-xs text-green-400 font-mono">
        <span>PADDOCK20 F1-INSPIRED WEATHER TELEMETRY</span>
        <span>LAST UPDATED: {formatRefreshTime(refreshTime)}</span>
      </div>

      {/* Main telemetry display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Current conditions */}
        <div className="flex flex-col space-y-6">
          {/* Current weather */}
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1 bg-blue-500"></div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-medium text-blue-400 mb-1">{locationName}</h3>
                <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°F</p>
                <p className="text-gray-400 capitalize">{weather.weather[0].description}</p>
              </div>
              <img 
                src={getWeatherIcon(weather.weather[0].icon)} 
                alt={weather.weather[0].description}
                className="w-20 h-20" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-black/30 p-2 rounded flex justify-between">
                <span className="text-gray-400">Feels like</span>
                <span className="font-mono">{Math.round(weather.main.feels_like)}°F</span>
              </div>
              <div className="bg-black/30 p-2 rounded flex justify-between">
                <span className="text-gray-400">Humidity</span>
                <span className="font-mono">{weather.main.humidity}%</span>
              </div>
              <div className="bg-black/30 p-2 rounded flex justify-between">
                <span className="text-gray-400">Wind</span>
                <span className="font-mono">{Math.round(weather.wind.speed)} mph</span>
              </div>
              <div className="bg-black/30 p-2 rounded flex justify-between">
                <span className="text-gray-400">Pressure</span>
                <span className="font-mono">{weather.main.pressure} hPa</span>
              </div>
            </div>
          </div>

          {/* Tire Strategy */}
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1 bg-green-500"></div>
            <h3 className="text-xl font-medium text-green-400 mb-4">Tire Strategy</h3>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
                   style={{ backgroundColor: tireRec.color, color: tireRec.color === '#FFFFFF' ? '#000' : '#FFF', border: "3px solid #333" }}>
                <span className="text-4xl">{tireRec.icon}</span>
              </div>
              <p className="text-xl font-bold text-center">{tireRec.tire}</p>
              <p className="text-sm text-gray-400 text-center mt-3">{tireRec.details}</p>
            </div>
          </div>
        </div>

        {/* Middle column: Performance metrics */}
        <div className="flex flex-col space-y-6">
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1 bg-amber-500"></div>
            <h3 className="text-xl font-medium text-amber-400 mb-4">Performance Telemetry</h3>
            
            {performanceData && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Traction</span>
                    <span className="text-sm font-mono">{Math.round(performanceData.traction)}%</span>
                  </div>
                  <Progress 
                    value={performanceData.traction} 
                    className={`h-2 bg-gray-800 ${performanceData.traction > 70 ? 'text-green-500' : performanceData.traction > 40 ? 'text-amber-500' : 'text-red-500'}`}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Braking Efficiency</span>
                    <span className="text-sm font-mono">{Math.round(performanceData.braking)}%</span>
                  </div>
                  <Progress 
                    value={performanceData.braking} 
                    className={`h-2 bg-gray-800 ${performanceData.braking > 70 ? 'text-green-500' : performanceData.braking > 40 ? 'text-amber-500' : 'text-red-500'}`}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Aerodynamic Performance</span>
                    <span className="text-sm font-mono">{Math.round(performanceData.aerodynamics)}%</span>
                  </div>
                  <Progress 
                    value={performanceData.aerodynamics} 
                    className={`h-2 bg-gray-800 ${performanceData.aerodynamics > 70 ? 'text-green-500' : performanceData.aerodynamics > 40 ? 'text-amber-500' : 'text-red-500'}`}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Cooling System</span>
                    <span className="text-sm font-mono">{Math.round(performanceData.cooling)}%</span>
                  </div>
                  <Progress 
                    value={performanceData.cooling} 
                    className={`h-2 bg-gray-800 ${performanceData.cooling > 70 ? 'text-green-500' : performanceData.cooling > 40 ? 'text-amber-500' : 'text-red-500'}`}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Visibility Factor</span>
                    <span className="text-sm font-mono">{Math.round(performanceData.visibility)}%</span>
                  </div>
                  <Progress 
                    value={performanceData.visibility} 
                    className={`h-2 bg-gray-800 ${performanceData.visibility > 70 ? 'text-green-500' : performanceData.visibility > 40 ? 'text-amber-500' : 'text-red-500'}`}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Risk Assessment</span>
                    <span className="text-sm font-mono">{Math.round(performanceData.risk)}%</span>
                  </div>
                  <Progress 
                    value={performanceData.risk} 
                    className={`h-2 bg-gray-800 ${performanceData.risk < 30 ? 'text-green-500' : performanceData.risk < 60 ? 'text-amber-500' : 'text-red-500'}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Surface data & advisories */}
        <div className="flex flex-col space-y-6">
          {/* Surface conditions */}
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1 bg-purple-500"></div>
            <h3 className="text-xl font-medium text-purple-400 mb-4">Surface Telemetry</h3>
            
            {automotiveData && (
              <div className="space-y-3">
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Asphalt Temp</span>
                    <span className="font-mono font-bold text-amber-400">{Math.round(automotiveData.surfaces.asphalt.temperature)}°F</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Grip Level</span>
                    <span className="font-mono text-sm">{automotiveData.surfaces.asphalt.gripLevel}</span>
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Condition</span>
                    <span className="font-mono">{automotiveData.surfaces.asphalt.condition}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="bg-black/20 p-2 rounded flex flex-col">
                      <span className="text-gray-500">Sport Tires</span>
                      <span className="text-blue-400 font-mono">{automotiveData.performance.tireWarmupTime.sport} min warmup</span>
                    </div>
                    <div className="bg-black/20 p-2 rounded flex flex-col">
                      <span className="text-gray-500">Summer Tires</span>
                      <span className="text-blue-400 font-mono">{automotiveData.performance.tireWarmupTime.summer} min warmup</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Engine Power</span>
                    <span className={`font-mono ${automotiveData.performance.enginePerformance.powerAdjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {automotiveData.performance.enginePerformance.powerAdjustment > 0 ? '+' : ''}{Math.round(automotiveData.performance.enginePerformance.powerAdjustment * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Driving Advisories */}
          <div className="bg-black/40 rounded-lg p-4 border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1 bg-red-500"></div>
            <h3 className="text-xl font-medium text-red-400 mb-4">Drive Advisories</h3>
            
            {automotiveData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-black/30 rounded-lg mb-2">
                  <span className="text-gray-200">Risk Level</span>
                  <span className={`font-medium ${automotiveData.drivingConditions.riskLevel === 'Low' || automotiveData.drivingConditions.riskLevel === 'Minimal' ? 'text-green-400' : automotiveData.drivingConditions.riskLevel === 'Moderate' ? 'text-amber-400' : 'text-red-400'}`}>
                    {automotiveData.drivingConditions.riskLevel}
                  </span>
                </div>
                
                <ul className="space-y-2">
                  {automotiveData.drivingConditions.advisories.map((advisory: string, index: number) => (
                    <li key={index} className="text-sm bg-black/20 px-3 py-2 rounded-lg flex items-start">
                      <span className="text-amber-400 mr-2">•</span>
                      <span className="text-gray-300">{advisory}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hourly forecast */}
      <div className="mt-6 bg-black/30 rounded-lg p-4 border border-gray-800">
        <h3 className="text-xl font-medium text-blue-400 mb-4">24-Hour Drive Planning Forecast</h3>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {forecast.map((hour: any, index: number) => (
              <div key={index} className="flex flex-col items-center min-w-[70px] bg-black/40 p-2 rounded-lg">
                <p className="text-sm text-gray-400">{formatTime(hour.dt)}</p>
                <img 
                  src={getWeatherIcon(hour.weather[0].icon)} 
                  alt={hour.weather[0].description}
                  className="w-10 h-10 my-1" 
                />
                <p className="font-medium">{Math.round(hour.temp)}°F</p>
                <div className="text-xs mt-1 flex items-center justify-center space-x-1">
                  <span>{Math.round(hour.pop * 100)}%</span>
                  <span className="text-blue-400">☔</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{Math.round(hour.wind_speed)} mph</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data source attribution */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500 border-t border-gray-800 pt-2">
        <p>Powered by Paddock20 F1-Inspired Telemetry System</p>
        <p>Data: OpenWeather API · GoTime Performance Metrics</p>
      </div>
    </div>
  );
};

export default F1TelemetryWeatherStation;
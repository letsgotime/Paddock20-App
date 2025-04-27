import React, { useEffect, useState } from "react";
import { getLocationKey, fetchCurrentConditions, fetchDailyForecast, fetchMinuteCast } from "@/services/accuWeatherService";
import { Loader2 } from "lucide-react";

const WeatherDashboard = () => {
  const [currentConditions, setCurrentConditions] = useState<any>(null);
  const [dailyForecast, setDailyForecast] = useState<any>(null);
  const [minuteCast, setMinuteCast] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Request user's current location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        console.log('Got user coordinates:', latitude, longitude);
        
        // Get AccuWeather location key using coordinates
        const locationKey = await getLocationKey(latitude, longitude);
        console.log('Got AccuWeather location key:', locationKey);
        
        // Fetch all required data in parallel
        const [current, daily, minute] = await Promise.all([
          fetchCurrentConditions(locationKey),
          fetchDailyForecast(locationKey),
          fetchMinuteCast(latitude, longitude)
        ]);
        
        setCurrentConditions(current);
        setDailyForecast(daily);
        setMinuteCast(minute);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Error loading weather data. Please make sure location services are enabled and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-gray-400 mt-4">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-700">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Weather Center</h2>
        <div className="text-red-400 p-4 rounded bg-black/30 border border-red-900/50">
          <p>{error}</p>
          <p className="mt-2 text-sm text-gray-400">
            Please make sure your AccuWeather API key is valid and your location services are enabled.
          </p>
        </div>
      </div>
    );
  }

  if (!currentConditions || !dailyForecast) {
    return (
      <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-700">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Weather Center</h2>
        <p className="text-white">No weather data available. Please try again later.</p>
      </div>
    );
  }

  // Calculate surface temperatures based on air temperature
  const airTemp = currentConditions.Temperature.Imperial.Value;
  const isDaytime = currentConditions.IsDayTime;
  const cloudCover = currentConditions.CloudCover || 50;
  
  // Factors affecting surface heating
  const cloudEffect = 1 - (cloudCover / 100);
  const timeEffect = isDaytime ? 1 : 0.2;
  
  // Base heating factors (°F above air temperature at peak sun)
  const asphaltFactor = 25; // Asphalt can be 20-30°F warmer than air
  const concreteFactor = 15; // Concrete about 10-20°F warmer
  
  const asphaltTemp = Math.round(airTemp + (asphaltFactor * cloudEffect * timeEffect));
  const concreteTemp = Math.round(airTemp + (concreteFactor * cloudEffect * timeEffect));

  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-700">
      <h2 className="text-blue-400 font-orbitron text-2xl mb-6">☁️ Drive Readiness</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-white text-3xl font-bold">
            {currentConditions.Temperature.Imperial.Value}°F
          </div>
          <div className="text-gray-300 flex items-center">
            <img 
              src={currentConditions.WeatherIcon ? 
                `https://developer.accuweather.com/sites/default/files/${currentConditions.WeatherIcon.toString().padStart(2, '0')}-s.png` : 
                ''
              } 
              alt={currentConditions.WeatherText}
              className="w-10 h-10 mr-2"
            />
            <span>{currentConditions.WeatherText}</span>
          </div>
          
          <div className="text-white space-y-3 font-light text-sm leading-relaxed mt-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400">Wind</p>
                <p>{currentConditions.Wind?.Speed?.Imperial?.Value || 0} mph</p>
              </div>
              <div>
                <p className="text-gray-400">Humidity</p>
                <p>{currentConditions.RelativeHumidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">Pressure</p>
                <p>{currentConditions.Pressure?.Imperial?.Value || 0} inHg</p>
              </div>
              <div>
                <p className="text-gray-400">UV Index</p>
                <p>{currentConditions.UVIndexText}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-green-500 font-orbitron text-lg">Surface Temperatures</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <p className="text-gray-400 text-sm">Asphalt</p>
              <p className="text-white text-xl">{asphaltTemp}°F</p>
            </div>
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <p className="text-gray-400 text-sm">Concrete</p>
              <p className="text-white text-xl">{concreteTemp}°F</p>
            </div>
          </div>
          
          <h3 className="text-green-500 font-orbitron text-lg mt-4">Track Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Sunrise</p>
              <p className="text-white">{new Date(dailyForecast.Sun.Rise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sunset</p>
              <p className="text-white">{new Date(dailyForecast.Sun.Set).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
          
          {minuteCast && minuteCast.Summary && (
            <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-900/50">
              <p className="text-blue-400 font-medium">Precipitation</p>
              <p className="text-white text-sm">{minuteCast.Summary.Phrase}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
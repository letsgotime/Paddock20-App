import React, { useState, useEffect } from 'react';
import { CarFront, Wind, Droplets, ThermometerSun, AlertTriangle, Sun, CloudRain } from 'lucide-react';

interface DrivingWeatherInsightsProps {
  latitude: number;
  longitude: number;
}

// A more direct and robust implementation using the backend API
export function DrivingWeatherInsights({ latitude, longitude }: DrivingWeatherInsightsProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [oneCallData, setOneCallData] = useState<any>(null);
  const [automotiveData, setAutomotiveData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!latitude || !longitude) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all needed data directly from our backend endpoints
        const [weatherResponse, oneCallResponse, automotiveResponse] = await Promise.all([
          fetch(`/api/weather?lat=${latitude}&lon=${longitude}&units=metric`),
          fetch(`/api/onecall?lat=${latitude}&lon=${longitude}&units=metric`),
          fetch(`/api/automotive-weather?lat=${latitude}&lon=${longitude}&units=metric`)
        ]);
        
        if (!weatherResponse.ok) throw new Error('Failed to fetch weather data');
        if (!oneCallResponse.ok) throw new Error('Failed to fetch one call data');
        if (!automotiveResponse.ok) throw new Error('Failed to fetch automotive data');
        
        const weather = await weatherResponse.json();
        const oneCall = await oneCallResponse.json();
        const automotive = await automotiveResponse.json();
        
        setWeatherData(weather);
        setOneCallData(oneCall);
        setAutomotiveData(automotive);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Unable to fetch driving weather data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [latitude, longitude]);

  if (loading) {
    return <div className="mt-4 p-4 rounded-lg bg-black/20 animate-pulse h-40"></div>;
  }

  if (error || !weatherData || !oneCallData) {
    return (
      <div className="mt-4 p-4 rounded-lg bg-black/20 border border-red-500/30">
        <div className="flex items-center text-red-400 mb-2">
          <AlertTriangle size={18} className="mr-2" />
          <span>Enhanced driving forecast unavailable</span>
        </div>
        <p className="text-sm text-gray-400">Try refreshing the page or check your connection.</p>
      </div>
    );
  }

  // Extract basic weather data
  const airTemp = weatherData.main.temp;
  const humidity = weatherData.main.humidity || '—';
  const visibility = (weatherData.visibility / 1000) || '—'; // Convert from meters to km
  const visibilityUnit = 'km';
  const windGust = weatherData.wind.gust || weatherData.wind.speed || '—';
  const windGustUnit = 'km/h';
  const uvIndex = oneCallData.current?.uvi || '—';
  
  // Extract precipitation data
  const precipitation1hr = oneCallData.current?.rain?.['1h'] || 0;
  const precipProbability = oneCallData.hourly && oneCallData.hourly.length > 0 
    ? Math.round(oneCallData.hourly[0].pop * 100) 
    : 0;
  
  // Calculate road surface temperature from automotive data or estimate it
  const roadTemp = automotiveData.surfaceConditions?.asphalt?.temperature || 
                  Math.round(airTemp * 1.2); // Simple estimate if no automotive data
  
  // Determine driving conditions
  const weatherCondition = weatherData.weather[0].main;
  const hasRain = weatherCondition === 'Rain' || weatherCondition === 'Drizzle' || weatherCondition === 'Thunderstorm';
  const hasSnow = weatherCondition === 'Snow';
  const hasFog = weatherCondition === 'Fog' || weatherCondition === 'Mist';
  
  // Compute driving condition rating
  let drivingCondition = 'Good';
  let drivingConditionClass = 'text-green-500';
  
  if (hasSnow || 
      (hasRain && precipitation1hr > 5) || 
      (typeof visibility === 'number' && visibility < 3)) {
    drivingCondition = 'Poor';
    drivingConditionClass = 'text-red-500';
  } else if (
    hasFog ||
    hasRain ||
    (typeof windGust === 'number' && windGust > 30) ||
    (oneCallData.alerts && oneCallData.alerts.length > 0) ||
    (typeof visibility === 'number' && visibility < 7)
  ) {
    drivingCondition = 'Fair';
    drivingConditionClass = 'text-yellow-500';
  }
  
  // Extract sport tire warmup time from automotive data
  const sportTireWarmup = automotiveData?.performance?.tireWarmupTime?.sport || 
                         (airTemp < 15 ? 5 : 3); // Simple estimate if missing
  
  // Check for weather alerts related to road conditions
  const roadAlert = oneCallData.alerts?.find((alert: any) => 
    alert.event.toLowerCase().includes('road') || 
    alert.event.toLowerCase().includes('traffic') ||
    alert.event.toLowerCase().includes('construction')
  );
  
  // Generate a description for the current conditions
  const drivingDescription = hasSnow 
    ? "Snow on road surfaces. Winter driving precautions required."
    : hasRain 
    ? "Precipitation detected. Use caution and reduce speed."
    : hasFog
    ? "Reduced visibility conditions. Use headlights and maintain safe distance."
    : typeof windGust === 'number' && windGust > 30 
    ? "High wind gusts may affect vehicle stability."
    : "Normal driving conditions, exercise standard precautions.";

  return (
    <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-gray-900 to-black border border-blue-500/20">
      <h2 className="text-blue-500 font-semibold text-lg mb-4 flex items-center">
        <CarFront size={18} className="mr-2" /> 
        Driving Conditions
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-black/30 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1 flex items-center">
            <ThermometerSun size={14} className="mr-1 text-orange-400" /> Road Temp
          </p>
          <p className="text-white font-mono">{roadTemp}°C</p>
        </div>
        
        <div className="bg-black/30 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1 flex items-center">
            <Droplets size={14} className="mr-1 text-blue-400" /> Humidity
          </p>
          <p className="text-white font-mono">{humidity}%</p>
        </div>
        
        <div className="bg-black/30 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1 flex items-center">
            <Sun size={14} className="mr-1 text-yellow-400" /> UV Index
          </p>
          <p className="text-white font-mono">{uvIndex}</p>
        </div>
        
        <div className="bg-black/30 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1 flex items-center">
            <Wind size={14} className="mr-1 text-blue-400" /> Wind Gust
          </p>
          <p className="text-white font-mono">{windGust} {windGustUnit}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black/30 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1 flex items-center">
            <CloudRain size={14} className="mr-1 text-blue-400" /> Precipitation Chance
          </p>
          <p className="text-white font-mono">{precipProbability}%</p>
          <div className="mt-2 text-xs text-gray-400">
            {precipitation1hr > 0 ? (
              <span>Active precipitation: {precipitation1hr} mm in last hour</span>
            ) : (
              <span>No active precipitation</span>
            )}
          </div>
        </div>
        
        <div className="bg-black/30 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Driving Conditions</p>
          <p className="text-white font-mono">
            <span className={drivingConditionClass}>
              {drivingCondition}
            </span>
          </p>
          <div className="mt-2 text-xs text-gray-400">
            Visibility: {visibility} {visibilityUnit}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {drivingDescription}
          </div>
        </div>
      </div>
      
      {oneCallData.hourly && oneCallData.hourly.length > 0 && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Next Hour Weather</p>
          <p className="text-white text-sm">
            {oneCallData.hourly[0].weather[0].description.charAt(0).toUpperCase() + 
             oneCallData.hourly[0].weather[0].description.slice(1)} with 
            {precipProbability > 0 ? ` ${precipProbability}% chance of precipitation` : ' no precipitation expected'}
          </p>
        </div>
      )}
      
      {roadAlert && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Road Alert</p>
          <p className="text-white text-sm">
            <span className="text-yellow-500">
              {roadAlert.event} - {roadAlert.description}
            </span>
          </p>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-black/30 rounded-lg">
        <p className="text-gray-400 text-xs mb-1">Tire Performance</p>
        <p className="text-white text-sm">
          Sport tires warm-up time: approximately {sportTireWarmup} minutes
        </p>
      </div>
    </div>
  );
}

export default DrivingWeatherInsights;
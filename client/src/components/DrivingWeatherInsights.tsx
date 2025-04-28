import React, { useState, useEffect } from 'react';
import { CarFront, Wind, Droplets, ThermometerSun, AlertTriangle, Sun, CloudRain } from 'lucide-react';
import { getAutomotiveWeatherData } from '@/services/openWeatherService';
import { WeatherData, OneCallData, getWeatherData, getOneCallData } from '@/lib/weather';

// Define the interface for automotive weather data specific to this component
interface AutomotiveWeatherData {
  surfaceConditions?: {
    asphalt?: {
      temperature?: number;
      condition?: string;
    }
  };
  drivingRisk?: {
    overall?: string;
    visibility?: string;
    traction?: string;
    score?: number;
    description?: string;
  };
  performance?: {
    tireWarmupTime?: {
      sport?: number;
      summer?: number;
    };
    roadSurfaceTemp?: number;
  };
}

interface DrivingWeatherInsightsProps {
  latitude: number;
  longitude: number;
}

export function DrivingWeatherInsights({ latitude, longitude }: DrivingWeatherInsightsProps) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [oneCallData, setOneCallData] = useState<OneCallData | null>(null);
  const [automotiveData, setAutomotiveData] = useState<AutomotiveWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpenWeatherData() {
      if (!latitude || !longitude) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all needed data in parallel
        const [weather, oneCall, automotive] = await Promise.all([
          getWeatherData({ lat: latitude, lon: longitude }, 'metric'),
          getOneCallData({ lat: latitude, lon: longitude }, 'metric'),
          getAutomotiveWeatherData(latitude, longitude)
        ]);
        
        setCurrentWeather(weather);
        setOneCallData(oneCall);
        setAutomotiveData(automotive);
      } catch (err) {
        console.error('Error fetching OpenWeather data:', err);
        setError('Unable to fetch enhanced driving weather data. Using standard forecast.');
      } finally {
        setLoading(false);
      }
    }

    fetchOpenWeatherData();
  }, [latitude, longitude]);

  if (loading) {
    return <div className="mt-4 p-4 rounded-lg bg-black/20 animate-pulse h-40"></div>;
  }

  if (error) {
    return (
      <div className="mt-4 p-4 rounded-lg bg-black/20 border border-red-500/30">
        <div className="flex items-center text-red-400 mb-2">
          <AlertTriangle size={18} className="mr-2" />
          <span>Enhanced driving forecast unavailable</span>
        </div>
        <p className="text-sm text-gray-400">Using standard weather forecast instead.</p>
      </div>
    );
  }

  // If no data is available yet, don't render
  if (!currentWeather || !oneCallData) {
    return null;
  }

  // Extract relevant driving data
  const roadTemp = automotiveData?.surfaceConditions?.asphalt?.temperature || 
                  currentWeather.main.temp || '—';
                  
  const humidity = currentWeather.main.humidity || '—';
  const uvIndex = oneCallData.current?.uvi || '—';
  const visibility = (currentWeather.visibility / 1000) || '—'; // Convert from meters to km
  const visibilityUnit = 'km';
  const windGust = currentWeather.wind.gust || currentWeather.wind.speed || '—';
  const windGustUnit = 'km/h';
  
  // Get precipitation data from OpenWeather
  const precipitation1hr = oneCallData.current?.rain?.['1h'] || 0;
  
  // Get precipitation probability from hourly forecast
  const precipProbability = oneCallData.hourly && oneCallData.hourly.length > 0 
    ? Math.round(oneCallData.hourly[0].pop * 100) 
    : '—';
    
  // Get driving risk information from automotive data if available
  const drivingRiskOverall = automotiveData?.drivingRisk?.overall;
  
  // Compute driving conditions based on various factors
  let drivingCondition = drivingRiskOverall || 'Good';
  let drivingConditionClass = 'text-green-500';
  
  if (drivingRiskOverall === 'Poor' || 
      precipitation1hr > 0 || 
      currentWeather.weather[0].main === 'Rain' || 
      currentWeather.weather[0].main === 'Snow' ||
      (typeof visibility === 'number' && visibility < 5)) {
    drivingCondition = 'Poor';
    drivingConditionClass = 'text-red-500';
  } else if (
    drivingRiskOverall === 'Fair' ||
    (typeof windGust === 'number' && windGust > 20) ||
    (oneCallData.alerts && oneCallData.alerts.length > 0) ||
    currentWeather.weather[0].main === 'Fog'
  ) {
    drivingCondition = 'Fair';
    drivingConditionClass = 'text-yellow-500';
  }
  
  // Get tire warmup times from automotive data if available
  const sportTireWarmup = automotiveData?.performance?.tireWarmupTime?.sport;
  
  // Check for active weather alerts that would affect road conditions
  const roadAlert = oneCallData.alerts?.find((alert: any) => 
    alert.event.toLowerCase().includes('road') || 
    alert.event.toLowerCase().includes('traffic') ||
    alert.event.toLowerCase().includes('construction')
  );

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
          {automotiveData?.drivingRisk?.description && (
            <div className="mt-1 text-xs text-gray-400">
              {automotiveData.drivingRisk.description}
            </div>
          )}
        </div>
      </div>
      
      {oneCallData.hourly && oneCallData.hourly.length > 0 && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Next Hour Weather</p>
          <p className="text-white text-sm">
            {oneCallData.hourly[0].weather[0].description} with 
            {typeof precipProbability === 'number' && precipProbability > 0 ? ` ${precipProbability}% chance of precipitation` : ' no precipitation expected'}
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
      
      {sportTireWarmup && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Tire Performance</p>
          <p className="text-white text-sm">
            Sport tires warm-up time: approximately {sportTireWarmup} minutes
          </p>
        </div>
      )}
    </div>
  );
}

export default DrivingWeatherInsights;
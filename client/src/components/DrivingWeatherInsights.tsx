import React, { useState, useEffect } from 'react';
import { CarFront, Wind, Droplets, ThermometerSun, AlertTriangle, Sun, CloudRain } from 'lucide-react';
import { getLocationKey, fetchCurrentConditions, fetchDailyForecast, fetchMinuteCast, fetchHourlyForecast, fetchDrivingIndices } from '../services/accuweatherService';

interface DrivingWeatherInsightsProps {
  latitude: number;
  longitude: number;
}

export function DrivingWeatherInsights({ latitude, longitude }: DrivingWeatherInsightsProps) {
  const [locationKey, setLocationKey] = useState<string | null>(null);
  const [currentConditions, setCurrentConditions] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [minutecast, setMinutecast] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [drivingIndices, setDrivingIndices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccuWeatherData() {
      if (!latitude || !longitude) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get AccuWeather location key first
        const key = await getLocationKey(latitude, longitude);
        setLocationKey(key);
        
        if (key) {
          // Fetch all needed data in parallel
          const [conditions, dailyForecast, minuteData, hourlyData, indices] = await Promise.all([
            fetchCurrentConditions(key),
            fetchDailyForecast(key),
            fetchMinuteCast(key).catch(() => ({ Summary: "Minute forecast not available for your location" })),
            fetchHourlyForecast(key).catch(() => []),
            fetchDrivingIndices(key).catch(() => [])
          ]);
          
          setCurrentConditions(conditions);
          setForecast(dailyForecast);
          setMinutecast(minuteData);
          setHourlyForecast(hourlyData);
          setDrivingIndices(indices);
        }
      } catch (err) {
        console.error('Error fetching AccuWeather data:', err);
        setError('Unable to fetch enhanced driving weather data. Using standard forecast.');
      } finally {
        setLoading(false);
      }
    }

    fetchAccuWeatherData();
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
  if (!currentConditions) {
    return null;
  }

  // Extract relevant driving data
  const roadTemp = currentConditions.RoadSurface?.Temperature?.Metric?.Value || 
                  currentConditions.Temperature?.Metric?.Value || '—';
                  
  const humidity = currentConditions.RelativeHumidity || '—';
  const uvIndex = currentConditions.UVIndex || '—';
  const visibility = currentConditions.Visibility?.Metric?.Value || '—';
  const visibilityUnit = currentConditions.Visibility?.Metric?.Unit || 'km';
  const windGust = currentConditions.WindGust?.Speed?.Metric?.Value || '—';
  const windGustUnit = currentConditions.WindGust?.Speed?.Metric?.Unit || 'km/h';
  const precipitation1hr = currentConditions.Precip1hr?.Metric?.Value || 0;
  
  // Get driving index and road construction index if available
  const drivingIndex = drivingIndices.find(idx => idx.ID === 1);
  const roadConstructionIndex = drivingIndices.find(idx => idx.ID === 10);

  // Get minute cast precipitation probability
  const precipProbability = minutecast?.PrecipitationProbability || '—';

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
            {drivingIndex ? (
              <span 
                className={
                  drivingIndex.Category === 'Good' ? 'text-green-500' : 
                  drivingIndex.Category === 'Fair' ? 'text-yellow-500' : 
                  'text-red-500'
                }
              >
                {drivingIndex.Category || 'Unknown'}
              </span>
            ) : (
              'No data available'
            )}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            Visibility: {visibility} {visibilityUnit}
          </div>
        </div>
      </div>
      
      {minutecast && minutecast.Summary && minutecast.Summary !== "Minute forecast not available for your location" && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Next Hour Precipitation</p>
          <p className="text-white text-sm">{minutecast.Summary}</p>
        </div>
      )}
      
      {roadConstructionIndex && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Road Construction</p>
          <p className="text-white text-sm">
            <span 
              className={
                roadConstructionIndex.Category === 'Low' ? 'text-green-500' : 
                roadConstructionIndex.Category === 'Medium' ? 'text-yellow-500' : 
                'text-red-500'
              }
            >
              {roadConstructionIndex.Category || 'Unknown'} - {roadConstructionIndex.Text}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default DrivingWeatherInsights;
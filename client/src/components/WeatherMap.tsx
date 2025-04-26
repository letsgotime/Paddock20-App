import React, { useEffect, useRef } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WeatherMap: React.FC = () => {
  const { selectedLocation } = useWeather();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  
  useEffect(() => {
    if (!selectedLocation) return;
    
    // If the map container exists, generate and insert the iframe
    if (mapContainerRef.current) {
      const { lat, lon } = selectedLocation;
      
      // Clear previous content
      mapContainerRef.current.innerHTML = '';
      
      // Create and insert the iframe
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '400';
      iframe.style.border = '0';
      iframe.style.borderRadius = '0.5rem';
      
      // Use OpenWeatherMap's weather map layer
      // For alternatives, see: https://openweathermap.org/api/weather-map-2
      iframe.src = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=temperature&lat=${lat}&lon=${lon}&zoom=10`;
      
      mapContainerRef.current.appendChild(iframe);
    }
  }, [selectedLocation, apiKey]);
  
  if (!selectedLocation) return null;

  return (
    <Card className="mt-8 bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">Weather Map for {selectedLocation.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainerRef} 
          className="w-full h-[400px] rounded-lg bg-gray-800 flex justify-center items-center"
        >
          <p className="text-gray-400">Loading weather map...</p>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>This weather map shows the current temperature patterns around {selectedLocation.name}.</p>
          <p className="mt-1">You can zoom in/out and pan the map to explore different areas.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherMap;
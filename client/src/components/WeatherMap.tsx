import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon, Layers, ZoomIn, ZoomOut } from 'lucide-react';

const WeatherMap: React.FC = () => {
  const { selectedLocation } = useWeather();
  
  if (!selectedLocation) return null;

  // Generate OpenWeatherMap URL for the iframe
  const generateMapUrl = (layer: string) => {
    return `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=${layer}&lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&zoom=10`;
  };

  return (
    <Card className="mt-8 bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapIcon className="text-blue-400 mr-2 h-5 w-5" />
            <CardTitle className="text-xl md:text-2xl">Weather Map</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Layers className="text-blue-400 h-5 w-5" />
          </div>
        </div>
        <CardDescription className="text-gray-400 mt-1">
          Interactive weather map for {selectedLocation.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div className="w-full h-96 bg-gray-800 flex items-center justify-center">
            <iframe 
              src={generateMapUrl('precipitation_new')}
              width="100%" 
              height="100%" 
              frameBorder="0"
              title="Weather Map"
              className="border-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherMap;
import React from 'react';
import { useOpenWeather } from '@/contexts/OpenWeatherContext';
import { Loader2, Thermometer, CloudRain, Wind, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const WeatherDashboard = () => {
  const { automotiveWeatherData, isLoading, error, unit } = useOpenWeather();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-gray-900 to-black border border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <p className="text-gray-400">Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !automotiveWeatherData) {
    return (
      <Card className="bg-gradient-to-r from-gray-900 to-black border border-gray-800">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-400 mb-2">Unable to load weather data</p>
            <p className="text-sm text-gray-400">Please check your connection and try again</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { surfaceConditions, drivingRisk, performance } = automotiveWeatherData;
  
  // Estimate air temperature (normally would come from API directly)
  const airTemp = Math.round(surfaceConditions.asphalt.temperature - 5);
  
  // Get color for risk level
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'extreme': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };
  
  // Get background for risk level
  const getRiskBg = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-500/20';
      case 'moderate': return 'bg-yellow-500/20';
      case 'high': return 'bg-orange-500/20';
      case 'extreme': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-gray-900 to-black border border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-500 flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          Automotive Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Temperature */}
          <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-lg border border-gray-800">
            <Thermometer className="h-6 w-6 text-blue-500 mb-1" />
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{airTemp}</span>
              <span className="text-gray-400 ml-1">°{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Air Temperature</p>
          </div>
          
          {/* Surface Temperature */}
          <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-lg border border-gray-800">
            <Badge className="mb-2 bg-gray-800">{surfaceConditions.asphalt.condition}</Badge>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{surfaceConditions.asphalt.temperature}</span>
              <span className="text-gray-400 ml-1">°{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Surface Temperature</p>
          </div>
          
          {/* Driving Risk */}
          <div className={`flex flex-col items-center justify-center p-4 rounded-lg border border-gray-800 ${getRiskBg(drivingRisk.overall)}`}>
            <p className="text-xs text-gray-300 uppercase">Driving Risk</p>
            <p className={`text-xl font-bold mt-1 ${getRiskColor(drivingRisk.overall)}`}>{drivingRisk.overall}</p>
            <p className="text-xs text-center text-gray-300 mt-1">{drivingRisk.description}</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <div className="bg-black/30 p-2 rounded-lg text-center">
            <p className="text-xs text-gray-400">Tire Warmup</p>
            <p className="text-lg font-mono">{performance.tireWarmupTime.sport} min</p>
          </div>
          <div className="bg-black/30 p-2 rounded-lg text-center">
            <p className="text-xs text-gray-400">Grip Level</p>
            <p className="text-lg font-mono">{surfaceConditions.asphalt.gripLevel || 'Good'}</p>
          </div>
          <div className="bg-black/30 p-2 rounded-lg text-center">
            <p className="text-xs text-gray-400">Power</p>
            <p className="text-lg font-mono">{performance.torqueEffect.percentageAdjustment}%</p>
          </div>
          <div className="bg-black/30 p-2 rounded-lg text-center">
            <p className="text-xs text-gray-400">TC Setting</p>
            <p className="text-lg font-mono">{performance.torqueEffect.tractionControlSuggestion}/5</p>
          </div>
        </div>
        
        {/* Link to full weather page */}
        <div className="mt-4 text-right">
          <Button variant="link" className="text-blue-400 p-0 h-auto" asChild>
            <a href="/weather">
              View detailed weather <ArrowRight className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherDashboard;
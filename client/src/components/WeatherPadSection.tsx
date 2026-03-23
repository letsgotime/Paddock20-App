import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Compass, 
  Clock,
  Sun,
  CloudRain,
  CloudSnow,
  Cloud,
  CloudFog,
  CloudLightning,
  AlertTriangle
} from 'lucide-react';
import { useLocationServices } from '@/contexts/LocationServicesContext';

interface WeatherPadSectionProps {
  compact?: boolean;
}

/**
 * WeatherPadSection component
 * 
 * Displays current weather conditions with driving recommendations
 * Uses real weather data from OpenWeather API via LocationServicesContext
 */
export default function WeatherPadSection({ compact = false }: WeatherPadSectionProps) {
  const locationServices = useLocationServices();
  
  // Map weather condition codes to appropriate icons
  const getWeatherIcon = (weatherCode: string) => {
    const code = weatherCode?.toLowerCase() || '';
    
    if (code.includes('clear') || code.includes('sunny')) return <Sun className="text-yellow-400" />;
    if (code.includes('rain') || code.includes('drizzle')) return <CloudRain className="text-blue-400" />;
    if (code.includes('snow')) return <CloudSnow className="text-blue-100" />;
    if (code.includes('cloud')) return <Cloud className="text-gray-400" />;
    if (code.includes('fog') || code.includes('mist') || code.includes('haze')) return <CloudFog className="text-gray-300" />;
    if (code.includes('thunder') || code.includes('lightning')) return <CloudLightning className="text-yellow-500" />;
    
    // Default
    return <CloudSun className="text-blue-400" />;
  };
  
  // Get driving recommendation based on weather conditions
  const getDrivingRecommendation = () => {
    const conditions = locationServices?.currentWeather?.conditions?.toLowerCase() || '';
    const temp = locationServices?.currentWeather?.temp || 70;
    const windSpeed = locationServices?.currentWeather?.windSpeed || 5;
    
    if (conditions.includes('snow') || conditions.includes('ice')) {
      return {
        text: "Winter driving conditions - reduce speed and increase following distance.",
        severity: "high",
        icon: <AlertTriangle className="text-yellow-500" />
      };
    }
    
    if (conditions.includes('rain') && windSpeed > 15) {
      return {
        text: "Heavy rain with wind - use caution on exposed routes.",
        severity: "medium",
        icon: <AlertTriangle className="text-yellow-500" />
      };
    }
    
    if (conditions.includes('fog')) {
      return {
        text: "Reduced visibility - use fog lights and reduce speed.",
        severity: "medium",
        icon: <AlertTriangle className="text-yellow-500" />
      };
    }
    
    if (temp > 85) {
      return {
        text: "High temperatures - check tire pressures and cooling system.",
        severity: "low",
        icon: <Thermometer className="text-orange-500" />
      };
    }
    
    if (temp < 32) {
      return {
        text: "Freezing temperatures - watch for black ice and allow extra time.",
        severity: "medium",
        icon: <Thermometer className="text-blue-400" />
      };
    }
    
    if (conditions.includes('clear') || conditions.includes('sun')) {
      return {
        text: "Excellent driving conditions. Enjoy your drive!",
        severity: "none",
        icon: <CloudSun className="text-green-500" />
      };
    }
    
    // Default recommendation
    return {
      text: "Standard driving conditions. Drive safely.",
      severity: "none",
      icon: <CloudSun className="text-green-500" />
    };
  };
  
  const recommendation = getDrivingRecommendation();
  
  // For very compact mode just show essential info
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              {getWeatherIcon(locationServices?.currentWeather?.conditions || 'clear')}
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-white text-xl font-mono">
                  {locationServices?.currentWeather?.temp ? Math.round(locationServices.currentWeather.temp) : '--'}°
                </span>
                <span className="text-gray-400 text-sm ml-1">
                  {locationServices?.preferences?.units === 'metric' ? 'C' : 'F'}
                </span>
              </div>
              <p className="text-gray-400 text-xs">
                {locationServices?.currentWeather?.conditions || 'Weather data unavailable'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-white text-sm font-medium">
              {locationServices?.currentLocation?.city || 'Your Location'}
            </p>
            <p className="text-gray-400 text-xs">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <Card className={`border-0 bg-gradient-to-r ${recommendation.severity === 'high' ? 'from-red-900/40 to-red-950/40 border-red-800/30' : recommendation.severity === 'medium' ? 'from-yellow-900/40 to-yellow-950/40 border-yellow-800/30' : 'from-green-900/40 to-green-950/40 border-green-800/30'}`}>
          <CardContent className="p-3 flex items-center space-x-2">
            {recommendation.icon}
            <p className="text-gray-200 text-xs">{recommendation.text}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Full weather display with detailed information
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
              {getWeatherIcon(locationServices?.currentWeather?.conditions || 'clear')}
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-white text-3xl font-mono">
                  {locationServices?.currentWeather?.temp ? Math.round(locationServices.currentWeather.temp) : '--'}°
                </span>
                <span className="text-gray-400 text-xl ml-1">
                  {locationServices?.preferences?.units === 'metric' ? 'C' : 'F'}
                </span>
              </div>
              <p className="text-gray-300">
                {locationServices?.currentWeather?.conditions || 'Weather data unavailable'}
              </p>
              <div className="flex items-center mt-1">
                <Thermometer size={14} className="text-gray-400 mr-1" />
                <span className="text-gray-400 text-xs">
                  Feels like: {locationServices?.currentWeather?.feelsLike ? Math.round(locationServices.currentWeather.feelsLike) : '--'}°
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex flex-col items-end">
            <Badge variant="outline" className="mb-1 bg-blue-500/10 text-blue-300 border-blue-500/30">
              {locationServices?.currentLocation?.city || 'Your Location'}
            </Badge>
            <div className="flex items-center text-gray-400 text-xs">
              <Clock size={12} className="mr-1" />
              <span>Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-black/30 border-gray-800">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Droplets size={18} className="text-blue-400 mb-1" />
            <p className="text-xs text-gray-400">HUMIDITY</p>
            <p className="text-white">
              {locationServices?.currentWeather?.humidity !== undefined ? 
                `${locationServices.currentWeather.humidity}%` : '--'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 border-gray-800">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Wind size={18} className="text-blue-400 mb-1" />
            <p className="text-xs text-gray-400">WIND</p>
            <p className="text-white">
              {locationServices?.currentWeather?.windSpeed !== undefined ? 
                `${locationServices.currentWeather.windSpeed} ${locationServices?.preferences?.units === 'metric' ? 'km/h' : 'mph'}` : '--'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 border-gray-800">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Compass size={18} className="text-blue-400 mb-1" />
            <p className="text-xs text-gray-400">DIRECTION</p>
            <p className="text-white">
              {locationServices?.currentWeather?.windDirection || '--'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="bg-gray-800" />
      
      <div>
        <h3 className="text-blue-400 font-orbitron text-sm mb-2">DRIVING RECOMMENDATION</h3>
        <Card className={`border-0 bg-gradient-to-r ${recommendation.severity === 'high' ? 'from-red-900/40 to-red-950/40 border-red-800/30' : recommendation.severity === 'medium' ? 'from-yellow-900/40 to-yellow-950/40 border-yellow-800/30' : 'from-green-900/40 to-green-950/40 border-green-800/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                {recommendation.icon}
              </div>
              <div>
                <p className="text-white font-medium">{recommendation.text}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Road conditions may change rapidly. Always drive according to conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
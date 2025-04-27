import React, { useEffect, useState } from "react";
import { getLocationKey, fetchCurrentConditions, fetchDailyForecast, fetchMinuteCast } from "@/services/accuweatherService";
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Droplets, Sun, Thermometer, Wind, CloudRain, Clock, Shield, CarFront } from "lucide-react";

// Specialized driving-focused weather component using AccuWeather
export function DrivingWeatherInsights() {
  const { selectedLocation } = useWeather();
  const [accuCurrentConditions, setAccuCurrentConditions] = useState<any>(null);
  const [accuDailyForecast, setAccuDailyForecast] = useState<any>(null);
  const [accuMinuteCast, setAccuMinuteCast] = useState<any>(null);
  const [locationKey, setLocationKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccuWeatherData() {
      if (!selectedLocation) return;
      
      try {
        setLoading(true);
        
        // Step 1: Get the AccuWeather location key for the selected location
        const key = await getLocationKey(selectedLocation.lat, selectedLocation.lon);
        setLocationKey(key);
        
        // Step 2: Get the current conditions, forecast, and minutecast
        const [current, forecast, minute] = await Promise.all([
          fetchCurrentConditions(key),
          fetchDailyForecast(key),
          fetchMinuteCast(key)
        ]);
        
        setAccuCurrentConditions(current);
        setAccuDailyForecast(forecast);
        setAccuMinuteCast(minute);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching AccuWeather data:", err);
        setError("Could not load enhanced driving data. Using standard weather information.");
        setLoading(false);
      }
    }
    
    fetchAccuWeatherData();
  }, [selectedLocation]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <CarFront className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-medium text-blue-400">Loading Driving Intelligence...</h2>
          </div>
          <div className="mt-4 h-32 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-blue-400/30 mb-3"></div>
              <div className="h-4 w-36 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-700/70 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <CarFront className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-medium text-blue-400">Driving Intelligence</h2>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <AlertCircle className="h-10 w-10 text-yellow-500 mb-3" />
            <p className="text-gray-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accuCurrentConditions) return null;

  // Calculate tire grip based on weather
  const calculateTireGrip = () => {
    const temp = accuCurrentConditions.Temperature.Imperial.Value;
    const hasRain = accuCurrentConditions.HasPrecipitation && 
                   accuCurrentConditions.PrecipitationType === "Rain";
    const hasSnow = accuCurrentConditions.HasPrecipitation && 
                   accuCurrentConditions.PrecipitationType === "Snow";
    
    if (hasSnow) return { level: "Extremely Low", color: "text-red-600" };
    if (hasRain) return { level: "Low", color: "text-red-500" };
    
    if (temp < 45) return { level: "Reduced", color: "text-yellow-500" };
    if (temp > 95) return { level: "Reduced", color: "text-yellow-500" };
    
    return { level: "Optimal", color: "text-green-500" };
  };

  // Calculate visibility conditions
  const calculateVisibility = () => {
    const visibility = accuCurrentConditions.Visibility.Imperial.Value;
    const weatherText = accuCurrentConditions.WeatherText.toLowerCase();
    
    if (weatherText.includes("fog") || weatherText.includes("mist") || visibility < 1) {
      return { level: "Poor", color: "text-red-500" };
    }
    
    if (weatherText.includes("haze") || visibility < 3) {
      return { level: "Moderate", color: "text-yellow-500" };
    }
    
    return { level: "Good", color: "text-green-500" };
  };

  // Calculate road conditions
  const calculateRoadConditions = () => {
    const weatherText = accuCurrentConditions.WeatherText.toLowerCase();
    const hasPrecipitation = accuCurrentConditions.HasPrecipitation;
    
    if (weatherText.includes("snow") || weatherText.includes("ice") || 
        (hasPrecipitation && accuCurrentConditions.PrecipitationType === "Snow")) {
      return { level: "Hazardous", color: "text-red-600", icon: <AlertCircle className="h-5 w-5" /> };
    }
    
    if (weatherText.includes("rain") || weatherText.includes("drizzle") || 
        (hasPrecipitation && accuCurrentConditions.PrecipitationType === "Rain")) {
      return { level: "Wet", color: "text-yellow-500", icon: <Droplets className="h-5 w-5" /> };
    }
    
    return { level: "Dry", color: "text-green-500", icon: <CarFront className="h-5 w-5" /> };
  };

  // Overall driving assessment
  const getDrivingAssessment = () => {
    const tireGrip = calculateTireGrip();
    const visibility = calculateVisibility();
    const roadConditions = calculateRoadConditions();
    
    // Poor conditions in any category means caution is needed
    if (tireGrip.level === "Extremely Low" || visibility.level === "Poor" || roadConditions.level === "Hazardous") {
      return { 
        level: "High Risk", 
        color: "text-red-500", 
        icon: <AlertCircle className="h-5 w-5" />,
        description: "Consider postponing non-essential drives. Extreme caution required."
      };
    }
    
    if (tireGrip.level === "Low" || tireGrip.level === "Reduced" || 
        visibility.level === "Moderate" || roadConditions.level === "Wet") {
      return { 
        level: "Exercise Caution", 
        color: "text-yellow-500", 
        icon: <Shield className="h-5 w-5" />,
        description: "Adjust driving style, increase following distances, and reduce speed."
      };
    }
    
    return { 
      level: "Favorable", 
      color: "text-green-500", 
      icon: <CarFront className="h-5 w-5" />,
      description: "Excellent conditions for driving. Enjoy your journey."
    };
  };

  const tireGrip = calculateTireGrip();
  const visibility = calculateVisibility();
  const roadConditions = calculateRoadConditions();
  const drivingAssessment = getDrivingAssessment();

  const formatSunTimes = () => {
    if (!accuDailyForecast || !accuDailyForecast.Sun) return { rise: "N/A", set: "N/A" };
    
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return {
      rise: formatTime(accuDailyForecast.Sun.Rise),
      set: formatTime(accuDailyForecast.Sun.Set)
    };
  };

  const sunTimes = formatSunTimes();

  return (
    <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CarFront className="h-6 w-6 text-blue-400" />
            <CardTitle className="text-blue-400">Paddock20™ Driving Intelligence</CardTitle>
          </div>
          <Badge variant="outline" className="ml-2 bg-blue-900/20 text-blue-300 border-blue-800">
            AccuWeather
          </Badge>
        </div>
        <CardDescription>
          Enhanced weather insights for driving enthusiasts
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-300 mb-2">Current Surface Conditions</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <Thermometer className="text-red-400 h-5 w-5 mr-2" />
                <div>
                  <p className="text-xs text-gray-400">Surface Temp</p>
                  <p className="text-white">{accuCurrentConditions.Temperature.Imperial.Value}°F</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wind className="text-blue-400 h-5 w-5 mr-2" />
                <div>
                  <p className="text-xs text-gray-400">Wind</p>
                  <p className="text-white">{accuCurrentConditions.Wind.Speed.Imperial.Value} mph</p>
                </div>
              </div>
              <div className="flex items-center">
                <Droplets className="text-blue-400 h-5 w-5 mr-2" />
                <div>
                  <p className="text-xs text-gray-400">Humidity</p>
                  <p className="text-white">{accuCurrentConditions.RelativeHumidity}%</p>
                </div>
              </div>
              <div className="flex items-center">
                <Sun className="text-yellow-400 h-5 w-5 mr-2" />
                <div>
                  <p className="text-xs text-gray-400">UV Index</p>
                  <p className="text-white">{accuCurrentConditions.UVIndex} - {accuCurrentConditions.UVIndexText}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-300 mb-2">Drive Risk Assessment</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tire Grip:</span>
                <span className={`font-medium ${tireGrip.color}`}>{tireGrip.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Visibility:</span>
                <span className={`font-medium ${visibility.color}`}>{visibility.level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Road Surface:</span>
                <span className={`font-medium ${roadConditions.color}`}>{roadConditions.level}</span>
              </div>
            </div>
          </div>
        </div>

        {accuMinuteCast && accuMinuteCast.Summary && (
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-blue-300 font-medium">Precipitation Forecast</h3>
            </div>
            <p className="text-gray-300 text-sm mt-1">{accuMinuteCast.Summary}</p>
          </div>
        )}

        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 mt-4">
          <div className="flex items-center space-x-2 mb-2">
            {drivingAssessment.icon}
            <h3 className={`text-lg font-medium ${drivingAssessment.color}`}>
              {drivingAssessment.level} Driving Conditions
            </h3>
          </div>
          <p className="text-gray-300">{drivingAssessment.description}</p>
          
          <Separator className="my-3 bg-gray-700" />
          
          <div className="flex flex-wrap justify-between text-sm mt-2">
            <div className="flex items-center space-x-1">
              <Sun className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-400">Sunrise: </span>
              <span className="text-white">{sunTimes.rise}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sun className="h-4 w-4 text-orange-400" />
              <span className="text-gray-400">Sunset: </span>
              <span className="text-white">{sunTimes.set}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CloudRain className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">Precipitation: </span>
              <span className="text-white">
                {accuCurrentConditions.HasPrecipitation 
                  ? `${accuCurrentConditions.PrecipitationType}${accuCurrentConditions.PrecipitationIntensity ? ` (${accuCurrentConditions.PrecipitationIntensity})` : ''}`
                  : "None"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DrivingWeatherInsights;
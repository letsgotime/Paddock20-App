import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Car,
  Sun,
  Wind,
  CloudRain,
  Umbrella,
  Route,
  AlertTriangle,
  Clock,
  ThermometerSun,
  Droplets,
  Shield,
  AlertCircle
} from 'lucide-react';

interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  clouds: number;
  uvi?: number;
  visibility: number;
  rain_1h?: number;
  snow_1h?: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  sunrise: number;
  sunset: number;
  dt: number;
  units: 'imperial' | 'metric';
  pop?: number; // Probability of precipitation (0-1)
}

interface DrivePlannerProps {
  currentWeather: WeatherData;
  forecastData?: any;
  hourly?: any[];
}

const DrivePlanner: React.FC<DrivePlannerProps> = ({ 
  currentWeather, 
  forecastData,
  hourly
}) => {
  // Get temperature unit symbol
  const tempUnit = currentWeather.units === 'imperial' ? '°F' : '°C';
  const speedUnit = currentWeather.units === 'imperial' ? 'mph' : 'm/s';
  
  // Extract current conditions
  const currentTemp = currentWeather.temp;
  const feelsLike = currentWeather.feels_like;
  const windSpeed = currentWeather.wind_speed;
  const windGust = currentWeather.wind_gust;
  const humidity = currentWeather.humidity;
  const visibility = currentWeather.visibility;
  const uvIndex = currentWeather.uvi || 0;
  const cloudCover = currentWeather.clouds;
  const weatherId = currentWeather.weather[0].id;
  const weatherMain = currentWeather.weather[0].main;
  const precipProb = currentWeather.pop || 0;
  const rain1h = currentWeather.rain_1h || 0;
  const snow1h = currentWeather.snow_1h || 0;
  
  // Calculate driving conditions safety score (0-100)
  const calculateDrivingScore = () => {
    // Each factor contributes a certain weight to the total score
    const tempFactor = Math.max(0, 100 - Math.abs(currentTemp - 70) * 1.5); // Ideal around 70°F
    const windFactor = Math.max(0, 100 - (windSpeed * 4)); // Lower wind is better
    const visibilityFactor = visibility >= 10000 ? 100 : Math.max(0, (visibility / 10000) * 100);
    const precipFactor = Math.max(0, 100 - (precipProb * 100) - (rain1h * 20) - (snow1h * 40));
    
    // Weight the factors
    const score = (
      tempFactor * 0.15 +
      windFactor * 0.15 +
      visibilityFactor * 0.4 +
      precipFactor * 0.3
    );
    
    return Math.min(100, Math.max(0, Math.round(score)));
  };
  
  // Get driving score
  const drivingScore = calculateDrivingScore();
  
  // Determine the best time to drive in the next 24 hours
  const determineBestDriveTime = () => {
    if (!hourly || hourly.length === 0) {
      return null;
    }
    
    // Score each hour (next 24 hours) for driving conditions
    const scoredHours = hourly.slice(0, 24).map((hour, index) => {
      // Calculate a score for this hour's conditions
      const temp = hour.temp;
      const pop = hour.pop || 0;
      const wind = hour.wind_speed;
      const clouds = hour.clouds;
      const vis = hour.visibility || 10000;
      const snowAmount = hour.snow?.['1h'] || 0;
      const rainAmount = hour.rain?.['1h'] || 0;
      
      // Each factor contributes to the score
      const tempFactor = Math.max(0, 100 - Math.abs(temp - 70) * 1.5);
      const windFactor = Math.max(0, 100 - (wind * 4));
      const visFactor = vis >= 10000 ? 100 : Math.max(0, (vis / 10000) * 100);
      const precipFactor = Math.max(0, 100 - (pop * 100) - (rainAmount * 20) - (snowAmount * 40));
      
      // Weight the factors
      const score = (
        tempFactor * 0.15 +
        windFactor * 0.15 +
        visFactor * 0.4 +
        precipFactor * 0.3
      );
      
      // Return the hour with its score
      return {
        index,
        time: new Date(hour.dt * 1000),
        score: Math.min(100, Math.max(0, Math.round(score))),
        conditions: hour.weather[0].main,
        temp,
        pop
      };
    });
    
    // Sort by score (highest first)
    scoredHours.sort((a, b) => b.score - a.score);
    
    // Return best 3 times
    return scoredHours.slice(0, 3);
  };
  
  const bestDriveTimes = hourly ? determineBestDriveTime() : null;
  
  // Determine safety alerts based on conditions
  const getSafetyAlerts = () => {
    const alerts = [];
    
    // Check for hazardous conditions
    if (windSpeed > 20) {
      alerts.push({
        type: 'warning',
        text: 'High winds may affect vehicle stability',
        icon: <Wind className="h-4 w-4" />
      });
    }
    
    if (windGust && windGust > windSpeed * 1.5) {
      alerts.push({
        type: 'warning',
        text: 'Wind gusts may cause sudden steering challenges',
        icon: <Wind className="h-4 w-4" />
      });
    }
    
    if (visibility < 5000) {
      alerts.push({
        type: 'danger',
        text: 'Reduced visibility conditions',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
    
    if (rain1h > 2.5 || snow1h > 1) {
      alerts.push({
        type: 'danger',
        text: `Heavy ${rain1h > 0 ? 'rain' : 'snow'} causing slippery roads`,
        icon: <CloudRain className="h-4 w-4" />
      });
    } else if (rain1h > 0 || snow1h > 0) {
      alerts.push({
        type: 'warning',
        text: `${rain1h > 0 ? 'Rain' : 'Snow'} may reduce traction`,
        icon: <Umbrella className="h-4 w-4" />
      });
    }
    
    if (weatherId >= 200 && weatherId < 300) {
      alerts.push({
        type: 'danger',
        text: 'Thunderstorm activity - consider delaying trip',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
    
    if (weatherId >= 600 && weatherId < 700) {
      alerts.push({
        type: 'warning',
        text: 'Snowy conditions - reduce speed',
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
    
    return alerts;
  };
  
  const safetyAlerts = getSafetyAlerts();
  
  return (
    <div className="space-y-4">
      {/* Drive Readiness Overview */}
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Car className="mr-2 h-5 w-5 text-[#1982FC]" /> 
              Drive Readiness
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`
                ${drivingScore > 85 ? 'bg-green-500/20 text-green-500 border-green-500/50' : 
                drivingScore > 60 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 
                'bg-red-500/20 text-red-500 border-red-500/50'}
              `}
            >
              {drivingScore > 85 ? 'Excellent' : drivingScore > 60 ? 'Fair' : 'Challenging'}
            </Badge>
          </div>
          <CardDescription>
            Current driving conditions assessment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Drive Conditions Score</span>
              <span className="font-medium">{drivingScore}/100</span>
            </div>
            <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  drivingScore > 85 ? 'bg-green-500' : 
                  drivingScore > 60 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`} 
                style={{ width: `${drivingScore}%` }}
              />
            </div>
          </div>
          
          {/* Key driving factors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <div className="flex items-center text-zinc-400 text-xs mb-1">
                <ThermometerSun className="h-3 w-3 mr-1 text-[#1982FC]" /> 
                Temperature
              </div>
              <div className="text-lg font-medium">
                {currentTemp.toFixed(1)}{tempUnit}
              </div>
              <div className="text-xs text-zinc-500">
                Feels like {feelsLike.toFixed(1)}{tempUnit}
              </div>
            </div>
            
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <div className="flex items-center text-zinc-400 text-xs mb-1">
                <Droplets className="h-3 w-3 mr-1 text-[#1982FC]" /> 
                Precipitation
              </div>
              <div className="text-lg font-medium">
                {(precipProb * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-zinc-500">
                {rain1h > 0 ? `${rain1h.toFixed(1)}mm rain` : 
                 snow1h > 0 ? `${snow1h.toFixed(1)}mm snow` : 
                 'None expected'}
              </div>
            </div>
            
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <div className="flex items-center text-zinc-400 text-xs mb-1">
                <Wind className="h-3 w-3 mr-1 text-[#1982FC]" /> 
                Wind
              </div>
              <div className="text-lg font-medium">
                {windSpeed.toFixed(1)} {speedUnit}
              </div>
              <div className="text-xs text-zinc-500">
                {windGust ? `Gusts: ${windGust.toFixed(1)} ${speedUnit}` : 'Steady wind'}
              </div>
            </div>
            
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <div className="flex items-center text-zinc-400 text-xs mb-1">
                <Sun className="h-3 w-3 mr-1 text-[#1982FC]" /> 
                Visibility
              </div>
              <div className="text-lg font-medium">
                {visibility < 10000 ? `${(visibility / 1000).toFixed(1)} km` : '10+ km'}
              </div>
              <div className="text-xs text-zinc-500">
                {visibility >= 10000 ? 'Excellent' : 
                 visibility >= 5000 ? 'Good' : 
                 visibility >= 2000 ? 'Moderate' : 'Poor'}
              </div>
            </div>
          </div>
          
          {/* Safety alerts */}
          {safetyAlerts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" /> 
                Road Safety Alerts
              </h4>
              <div className="space-y-2">
                {safetyAlerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded-md flex items-center text-sm ${
                      alert.type === 'danger' ? 'bg-red-900/40 text-red-300' : 
                      'bg-yellow-900/30 text-yellow-300'
                    }`}
                  >
                    {alert.icon}
                    <span className="ml-2">{alert.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Best times to drive */}
          {bestDriveTimes && bestDriveTimes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-[#08c519]" /> 
                Best Times to Drive (Next 24h)
              </h4>
              <div className="space-y-2">
                {bestDriveTimes.map((timeSlot, index) => (
                  <div key={index} className="flex items-center justify-between bg-zinc-900/60 p-2 rounded-md">
                    <div className="flex items-center">
                      <Badge 
                        variant="outline" 
                        className="bg-[#08c519]/10 text-[#08c519] border-[#08c519]/30 mr-2"
                      >
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium">
                          {timeSlot.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {timeSlot.conditions}, {timeSlot.temp.toFixed(0)}{tempUnit}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {timeSlot.score}/100
                      </div>
                      <div className="text-xs text-zinc-500">
                        {timeSlot.pop ? `${(timeSlot.pop * 100).toFixed(0)}% precip` : 'No precip'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Road Trip Recommendations */}
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl">
            <Route className="mr-2 h-5 w-5 text-[#1982FC]" /> 
            Drive Recommendations
          </CardTitle>
          <CardDescription>
            Expert advice for today's conditions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Travel recommendations */}
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Vehicle Preparation</h4>
              <ul className="space-y-2 text-sm">
                {currentTemp < 40 && (
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                    <span>Check tire pressure - cold temperatures can reduce PSI by 1-2 points</span>
                  </li>
                )}
                
                {(rain1h > 0 || snow1h > 0 || precipProb > 0.3) && (
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                    <span>Ensure wipers are in good condition and washer fluid is topped up</span>
                  </li>
                )}
                
                {windSpeed > 15 && (
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                    <span>Be cautious of crosswinds, especially on bridges and open roads</span>
                  </li>
                )}
                
                {visibility < 5000 && (
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                    <span>Use headlights even during daytime for better visibility to others</span>
                  </li>
                )}
                
                {currentTemp > 85 && (
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                    <span>Check coolant levels and A/C function before extended drives</span>
                  </li>
                )}
                
                {/* Default recommendations */}
                <li className="flex items-start">
                  <Shield className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                  <span>Allow extra travel time for {
                    drivingScore > 85 ? 'optimal' : 
                    drivingScore > 60 ? 'variable' : 
                    'challenging'
                  } driving conditions</span>
                </li>
              </ul>
            </div>
            
            {/* Driving tips based on current conditions */}
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Driving Technique</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start">
                  <Badge variant="outline" className="bg-[#08c519]/10 text-[#08c519] border-[#08c519]/30 mr-2">
                    Grip
                  </Badge>
                  <div className="text-sm">
                    {(rain1h > 0 || snow1h > 0) ? (
                      <span>Reduced grip conditions - gentle inputs on steering, throttle and brakes</span>
                    ) : (
                      <span>Normal grip expected - standard driving technique appropriate</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Badge variant="outline" className="bg-[#08c519]/10 text-[#08c519] border-[#08c519]/30 mr-2">
                    Speed
                  </Badge>
                  <div className="text-sm">
                    {visibility < 5000 || rainIntensity > 1 || snow1h > 0 ? (
                      <span>Reduce speed by {
                        visibility < 2000 || rain1h > 3 || snow1h > 1 ? '30-40%' : '15-25%'
                      } from posted limits</span>
                    ) : (
                      <span>Standard speed appropriate for conditions</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Badge variant="outline" className="bg-[#08c519]/10 text-[#08c519] border-[#08c519]/30 mr-2">
                    Distance
                  </Badge>
                  <div className="text-sm">
                    {rain1h > 0 || snow1h > 0 || visibility < 8000 ? (
                      <span>Increase following distance to {
                        rain1h > 2 || snow1h > 0.5 || visibility < 3000 ? '4-5' : '3-4'
                      } seconds</span>
                    ) : (
                      <span>Maintain standard 2-3 second following distance</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Badge variant="outline" className="bg-[#08c519]/10 text-[#08c519] border-[#08c519]/30 mr-2">
                    Vision
                  </Badge>
                  <div className="text-sm">
                    {uvIndex > 5 ? (
                      <span>High UV index - use sunglasses to reduce glare</span>
                    ) : (
                      <span>Scan road conditions frequently for changing surfaces</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* General advice */}
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <p className="text-sm text-zinc-300 italic">
                "{drivingScore > 85 ? 
                  'Overall excellent driving conditions today with optimal grip and visibility. Enjoy your drive!' : 
                  drivingScore > 60 ? 
                  'Fair conditions for driving with some minor adjustments needed. Stay alert and aware of changing conditions.' : 
                  'Challenging driving conditions today. Consider if your journey is essential or can be postponed for better weather.'}"
              </p>
              <div className="text-right text-xs text-zinc-500 mt-1">
                — PADDOCK20 Drive Intelligence System
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrivePlanner;
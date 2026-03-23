import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Timer,
  ThermometerSun,
  Route,
  Clock,
  Car,
  Gauge,
  Pin,
  Heart,
  Navigation,
  Map,
  Calendar,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  CloudSnow,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
  Star
} from 'lucide-react';

interface FavoriteLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance?: number; // in miles or km
  travelTime?: number; // in minutes
}

const PerformanceDriverPlanner: React.FC = () => {
  const { currentWeather, forecastData, oneCallData, selectedLocation, units } = useWeather();
  const [tireTemp, setTireTemp] = useState<number>(0);
  const [optimalTime, setOptimalTime] = useState<number>(0);
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocation[]>([
    { id: '1', name: 'Dragon's Tail', lat: 35.4706, lon: -83.9207, distance: 178, travelTime: 210 },
    { id: '2', name: 'Pacific Coast Hwy', lat: 36.3615, lon: -121.8563, distance: 2481, travelTime: 1800 },
    { id: '3', name: 'Blue Ridge Pkwy', lat: 37.9937, lon: -79.7651, distance: 492, travelTime: 540 },
    { id: '4', name: 'Going-to-the-Sun', lat: 48.6970, lon: -113.8178, distance: 2133, travelTime: 1440 },
    { id: '5', name: 'Local Track', lat: 36.0544, lon: -86.4072, distance: 22, travelTime: 30 },
  ]);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<number>(12); // hours
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Function to calculate tire temperature based on ambient conditions
  const calculateTireTemp = (ambientTemp: number, roadTemp: number, sunPosition: number, drivingMinutes: number) => {
    // Base tire temp starts at ambient
    let baseTemp = ambientTemp;
    
    // Road temperature influence (hotter road = hotter tires)
    const roadFactor = Math.max(0, (roadTemp - ambientTemp) * 0.3);
    
    // Driving heats tires (more time = higher temps, but with a cap)
    const drivingFactor = Math.min(30, drivingMinutes * 0.5);
    
    // Calculate final temp with all factors
    const finalTemp = baseTemp + roadFactor + drivingFactor;
    
    // Return the calculated temperature
    return finalTemp;
  };
  
  // Function to calculate surface temperature based on air temperature and conditions
  const calculateSurfaceTemp = (airTemp: number, cloudCover: number, sunPosition: number) => {
    // Surface temp is usually higher than air temp during daylight
    // and can be lower at night
    const isDaylight = sunPosition > 0;
    const cloudFactor = 1 - (cloudCover / 100); // Less clouds = more sun = higher temp
    
    if (isDaylight) {
      // During day, surface can be 10-30°F hotter than air depending on sun
      return airTemp + (20 * cloudFactor * sunPosition);
    } else {
      // At night, surface can be slightly cooler than air
      return airTemp - (2 * cloudFactor);
    }
  };
  
  // Function to determine if a time window is suitable for performance driving
  const analyzeDrivingWindow = (hourlyData: any[], timeWindowHours: number) => {
    if (!hourlyData || hourlyData.length === 0) {
      return { 
        optimalHours: 0, 
        timeWindows: [], 
        tireTempProfile: [] 
      };
    }
    
    // Create a score for each hour
    const hourScores = hourlyData.slice(0, Math.min(hourlyData.length, 48)).map((hour, index) => {
      // Extract relevant data
      const temp = hour.temp; 
      const precipProb = hour.pop || 0;
      const windSpeed = hour.wind_speed;
      const rain1h = hour.rain?.['1h'] || 0;
      const snow1h = hour.snow?.['1h'] || 0;
      const clouds = hour.clouds;
      const uvIndex = hour.uvi || 0;
      const dt = hour.dt;
      
      // Base score starts at 100
      let score = 100;
      
      // Deduct for precipitation (major factor for performance driving)
      score -= precipProb * 60; // 60% probability = -36 points
      score -= rain1h * 25; // 1mm rain = -25 points
      score -= snow1h * 50; // 1mm snow = -50 points
      
      // Deduct for winds (affects handling)
      score -= Math.max(0, (windSpeed - 10) * 3); // Each mph above 10 = -3 points
      
      // Temperature factors (performance tires work best between 60-100°F ambient)
      if (temp < 50) {
        score -= (50 - temp) * 2; // Each degree below 50°F = -2 points
      } else if (temp > 100) {
        score -= (temp - 100) * 1.5; // Each degree above 100°F = -1.5 points
      }
      
      // Calculate road temp
      const roadTemp = calculateSurfaceTemp(
        temp, 
        clouds, 
        uvIndex > 0 ? Math.min(1, uvIndex / 8) : 0
      );
      
      // Calculate tire temp (assuming 10 minutes of driving)
      const tireTemp = calculateTireTemp(temp, roadTemp, uvIndex > 0 ? Math.min(1, uvIndex / 8) : 0, 10);
      
      // Optimal tire temp range for performance (85-160°F)
      const tireTempOpt = tireTemp >= 85 && tireTemp <= 160;
      
      // Time of day
      const time = new Date(dt * 1000);
      const hour24 = time.getHours();
      
      // Slight preference for daylight hours (7am-7pm)
      if (hour24 < 7 || hour24 > 19) {
        score -= 5;
      }
      
      return {
        index,
        time,
        score: Math.max(0, Math.min(100, score)),
        temp,
        roadTemp,
        tireTemp,
        precipProb,
        rain1h,
        snow1h,
        tireTempOptimal: tireTempOpt,
        windSpeed
      };
    });
    
    // Find contiguous blocks of good driving time (score > 70)
    const timeWindows = [];
    let currentWindow = null;
    
    for (let i = 0; i < hourScores.length; i++) {
      const currentScore = hourScores[i];
      
      // Good driving conditions (score > 70 and no precipitation)
      const isGood = currentScore.score > 70 && currentScore.precipProb < 0.3;
      
      if (isGood) {
        if (!currentWindow) {
          // Start a new window
          currentWindow = {
            start: i,
            end: i,
            startTime: currentScore.time,
            scores: [currentScore],
            avgScore: currentScore.score
          };
        } else {
          // Extend current window
          currentWindow.end = i;
          currentWindow.scores.push(currentScore);
          currentWindow.avgScore = currentWindow.scores.reduce((sum, s) => sum + s.score, 0) / 
                                  currentWindow.scores.length;
        }
      } else if (currentWindow) {
        // End the current window if it's long enough
        if (currentWindow.end - currentWindow.start + 1 >= timeWindowHours) {
          const endTime = hourScores[currentWindow.end].time;
          timeWindows.push({
            ...currentWindow,
            endTime,
            duration: currentWindow.end - currentWindow.start + 1,
            avgScore: Math.round(currentWindow.avgScore)
          });
        }
        
        // Reset for next window
        currentWindow = null;
      }
    }
    
    // Don't forget the last window if it's still open
    if (currentWindow && currentWindow.end - currentWindow.start + 1 >= timeWindowHours) {
      const endTime = hourScores[currentWindow.end].time;
      timeWindows.push({
        ...currentWindow,
        endTime,
        duration: currentWindow.end - currentWindow.start + 1,
        avgScore: Math.round(currentWindow.avgScore)
      });
    }
    
    // Sort windows by score (best first)
    timeWindows.sort((a, b) => b.avgScore - a.avgScore);
    
    // Calculate total optimal hours
    const optimalHours = hourScores.filter(h => h.score > 70 && h.precipProb < 0.3).length;
    
    return {
      optimalHours,
      timeWindows: timeWindows.slice(0, 3), // Top 3 windows
      tireTempProfile: hourScores.map(h => ({ 
        time: h.time, 
        temp: h.temp, 
        tireTemp: h.tireTemp,
        roadTemp: h.roadTemp,
        isOptimal: h.tireTempOptimal 
      }))
    };
  };
  
  useEffect(() => {
    if (!currentWeather) return;
    
    // Update the current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Calculate current tire temp
    if (currentWeather) {
      const airTemp = currentWeather.main.temp;
      const clouds = currentWeather.clouds.all;
      const sunPosition = currentWeather.weather[0].icon.includes('d') ? 0.5 : 0; // Day/night estimation
      
      // Calculate surface temp
      const surfaceTemp = calculateSurfaceTemp(airTemp, clouds, sunPosition);
      
      // Calculate tire temp (assuming just starting a drive)
      const tireTempValue = calculateTireTemp(airTemp, surfaceTemp, sunPosition, 0);
      setTireTemp(tireTempValue);
    }
    
    // Analyze optimal driving window
    if (oneCallData && oneCallData.hourly) {
      const analysis = analyzeDrivingWindow(oneCallData.hourly, selectedTimeWindow);
      setOptimalTime(analysis.optimalHours);
    }
    
    return () => clearInterval(timer);
  }, [currentWeather, oneCallData, selectedTimeWindow]);
  
  if (!currentWeather || !oneCallData || !oneCallData.hourly) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <Car className="w-10 h-10 animate-pulse text-[#1982FC] mb-2" />
          <p className="text-zinc-500">Loading performance driving data...</p>
        </div>
      </div>
    );
  }
  
  // Extract data for analysis
  const airTemp = currentWeather.main.temp;
  const precipProb = oneCallData.hourly[0].pop || 0;
  const hourly = oneCallData.hourly;
  
  // Format temperature with units
  const formatTemp = (temp: number) => {
    return `${temp.toFixed(1)}°${units === 'imperial' ? 'F' : 'C'}`;
  };
  
  // Format wind speed with units
  const formatWindSpeed = (speed: number) => {
    return `${speed.toFixed(1)} ${units === 'imperial' ? 'mph' : 'm/s'}`;
  };
  
  // Format distance with units
  const formatDistance = (distance: number) => {
    return `${distance} ${units === 'imperial' ? 'mi' : 'km'}`;
  };
  
  // Analyze optimal driving window
  const drivingAnalysis = analyzeDrivingWindow(hourly, selectedTimeWindow);
  
  // Tire temperature evaluation
  const getTireTempStatus = (temp: number) => {
    if (temp < 60) return { status: 'Cold', color: 'text-blue-500' };
    if (temp < 85) return { status: 'Warming', color: 'text-yellow-500' };
    if (temp < 160) return { status: 'Optimal', color: 'text-green-500' };
    return { status: 'Overheated', color: 'text-red-500' };
  };
  
  const tireTempEval = getTireTempStatus(tireTemp);
  
  // Travel impact factors by favorite location
  const getWeatherImpact = (travelTime: number) => {
    const precipImpact = precipProb > 0.5 ? 1.4 : precipProb > 0.3 ? 1.2 : precipProb > 0.1 ? 1.1 : 1;
    const tempImpact = airTemp < 32 ? 1.3 : airTemp < 40 ? 1.15 : 1;
    
    // Combine factors for overall impact
    const totalImpact = Math.round((precipImpact * tempImpact * travelTime) - travelTime);
    const newTime = travelTime + totalImpact;
    
    return {
      baseTime: travelTime, // original time in minutes
      weatherImpact: totalImpact, // additional minutes due to weather
      totalTime: newTime, // new total
      impactPercentage: Math.round((totalImpact / travelTime) * 100) // percentage increase
    };
  };
  
  return (
    <div className="space-y-4">
      {/* Performance Tire Status */}
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Gauge className="mr-2 h-5 w-5 text-[#1982FC]" /> 
              Performance Tire Analysis
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`
                ${tireTempEval.color} border-${tireTempEval.color.replace('text-', '')}/30
              `}
            >
              {tireTempEval.status}
            </Badge>
          </div>
          <CardDescription>
            Real-time tire temperature analysis for optimal grip
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Current Tire Temperature</h3>
              <span className="text-lg font-bold">{formatTemp(tireTemp)}</span>
            </div>
            
            <div className="relative h-6 w-full bg-zinc-800 rounded-full overflow-hidden">
              {/* Temperature scale with color gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-500 to-red-500" />
              
              {/* Optimal range indicator */}
              <div className="absolute top-0 bottom-0 bg-white/20 border-l-2 border-r-2 border-white" 
                style={{ 
                  left: `${Math.max(0, Math.min(100, (85 / 200) * 100))}%`, 
                  right: `${Math.max(0, Math.min(100, 100 - ((160 / 200) * 100)))}%`
                }}
              />
              
              {/* Current temperature marker */}
              <div 
                className="absolute top-0 bottom-0 w-2 bg-white border-2 border-black"
                style={{ 
                  left: `${Math.max(0, Math.min(100, (tireTemp / 200) * 100))}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>Cold (40°)</span>
              <span>Optimal (85°-160°)</span>
              <span>Overheated (200°+)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <ThermometerSun className="h-4 w-4 mr-1 text-[#1982FC]" /> Warm-Up Analysis
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Current Status:</span>
                  <span className={tireTempEval.color}>{tireTempEval.status}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Warm-Up Estimate:</span>
                  <span>{tireTemp < 85 ? `${Math.ceil((85 - tireTemp) / 5)} minutes` : 'Already warm'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Optimal Window:</span>
                  <span>{tireTemp > 160 ? 'Cool down needed' : tireTemp >= 85 ? 'Currently optimal' : 'Warm-up needed'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Surface Temp:</span>
                  <span>{formatTemp(calculateSurfaceTemp(
                    airTemp, 
                    currentWeather.clouds.all, 
                    currentWeather.weather[0].icon.includes('d') ? 0.5 : 0
                  ))}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900/60 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Flame className="h-4 w-4 mr-1 text-[#1982FC]" /> Performance Impact
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-24 text-xs text-zinc-400">Grip Level:</div>
                  <div className="flex-1">
                    <Progress
                      value={tireTemp < 40 ? 20 : tireTemp < 85 ? 60 : tireTemp < 160 ? 95 : 70}
                      max={100}
                      className="h-2"
                    />
                  </div>
                  <div className="w-12 text-right text-xs ml-2">
                    {tireTemp < 40 ? 'Low' : tireTemp < 85 ? 'Medium' : tireTemp < 160 ? 'High' : 'Medium'}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-xs text-zinc-400">Response:</div>
                  <div className="flex-1">
                    <Progress
                      value={tireTemp < 40 ? 30 : tireTemp < 85 ? 70 : tireTemp < 160 ? 95 : 60}
                      max={100}
                      className="h-2"
                    />
                  </div>
                  <div className="w-12 text-right text-xs ml-2">
                    {tireTemp < 40 ? 'Slow' : tireTemp < 85 ? 'Good' : tireTemp < 160 ? 'Excellent' : 'Reduced'}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-xs text-zinc-400">Durability:</div>
                  <div className="flex-1">
                    <Progress
                      value={tireTemp < 85 ? 90 : tireTemp < 120 ? 75 : tireTemp < 160 ? 60 : 30}
                      max={100}
                      className="h-2"
                    />
                  </div>
                  <div className="w-12 text-right text-xs ml-2">
                    {tireTemp < 85 ? 'High' : tireTemp < 120 ? 'Normal' : tireTemp < 160 ? 'Lower' : 'Low'}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-zinc-400">Driving Style:</span>
                  <span>{
                    tireTemp < 60 ? 'Cautious, gentle inputs' :
                    tireTemp < 85 ? 'Progressive, building heat' :
                    tireTemp < 120 ? 'Optimal, full performance' :
                    tireTemp < 160 ? 'Aggressive, managing heat' :
                    'Moderate, avoid overheating'
                  }</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/60 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Navigation className="h-4 w-4 mr-1 text-[#1982FC]" /> Performance Tire Recommendations
            </h4>
            
            <ul className="space-y-2 text-sm">
              {tireTemp < 60 && (
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-[#08c519] mt-0.5" />
                  <span>Consider tire warmers or gentle warm-up laps before pushing hard</span>
                </li>
              )}
              
              {tireTemp < 85 && (
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-[#08c519] mt-0.5" />
                  <span>Progressively increase pace to build tire temperature gradually</span>
                </li>
              )}
              
              {tireTemp >= 85 && tireTemp <= 160 && (
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-[#08c519] mt-0.5" />
                  <span>Tires in optimal temperature range for maximum performance</span>
                </li>
              )}
              
              {tireTemp > 120 && tireTemp <= 160 && (
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-[#08c519] mt-0.5" />
                  <span>Monitor tire pressure as heat will increase PSI by 3-5 points</span>
                </li>
              )}
              
              {tireTemp > 160 && (
                <li className="flex items-start">
                  <X className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                  <span>Tires overheating - moderate inputs and allow cooling period</span>
                </li>
              )}
              
              {airTemp < 40 && (
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
                  <span>Cold ambient temperature will extend warm-up time significantly</span>
                </li>
              )}
              
              {precipProb > 0.3 && (
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 mt-0.5" />
                  <span>Precipitation risk - performance tires have limited wet weather capability</span>
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* Optimal Driving Window */}
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Timer className="mr-2 h-5 w-5 text-[#1982FC]" /> 
              Driving Window Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Time window:</span>
              <Badge variant="secondary">
                {selectedTimeWindow}h minimum
              </Badge>
            </div>
          </div>
          <CardDescription>
            Optimal performance driving periods in next 48 hours
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Optimal Driving Hours Available</h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-[#08c519]">{drivingAnalysis.optimalHours}</span>
                <span className="text-xs text-zinc-500 ml-1">/ 48h</span>
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-2">
              <Button 
                variant={selectedTimeWindow === 3 ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedTimeWindow(3)}
                className={selectedTimeWindow === 3 ? "bg-[#1982FC]" : ""}
              >
                3h
              </Button>
              <Button 
                variant={selectedTimeWindow === 6 ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedTimeWindow(6)}
                className={selectedTimeWindow === 6 ? "bg-[#1982FC]" : ""}
              >
                6h
              </Button>
              <Button 
                variant={selectedTimeWindow === 12 ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedTimeWindow(12)}
                className={selectedTimeWindow === 12 ? "bg-[#1982FC]" : ""}
              >
                12h
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {drivingAnalysis.timeWindows.length > 0 ? (
              drivingAnalysis.timeWindows.map((window, index) => (
                <div key={index} className="bg-zinc-900/60 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-[#1982FC]" /> 
                      Driving Window #{index + 1}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${window.avgScore > 85 ? 'bg-green-500/20 text-green-500 border-green-500/50' : 
                        window.avgScore > 70 ? 'bg-blue-500/20 text-blue-500 border-blue-500/50' : 
                        'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'}
                      `}
                    >
                      Score: {window.avgScore}/100
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-zinc-400">
                        <Clock className="h-3 w-3 mr-1" /> Start Time
                      </div>
                      <div className="text-sm font-medium">
                        {window.startTime.toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-zinc-400">
                        <Timer className="h-3 w-3 mr-1" /> Duration
                      </div>
                      <div className="text-sm font-medium">
                        {window.duration} hours
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <ThermometerSun className="h-4 w-4 mr-2 text-[#1982FC]" />
                      <span className="text-sm text-zinc-300">
                        Temperature range: {formatTemp(Math.min(...window.scores.map(s => s.temp)))} - {formatTemp(Math.max(...window.scores.map(s => s.temp)))}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-[#1982FC]" />
                      <span className="text-sm text-zinc-300">
                        Precipitation chance: {Math.round(Math.max(...window.scores.map(s => s.precipProb)) * 100)}% max
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 mr-2 text-[#1982FC]" />
                      <span className="text-sm text-zinc-300">
                        Wind: {formatWindSpeed(Math.max(...window.scores.map(s => s.windSpeed)))} max
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-[#1982FC]" />
                      <span className="text-sm text-zinc-300">
                        Tire temp (after 15min): {formatTemp(Math.min(...window.scores.map(s => s.tireTemp + 10)))} - {formatTemp(Math.max(...window.scores.map(s => s.tireTemp + 10)))}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-zinc-900/60 p-4 rounded-md text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-zinc-300">No suitable {selectedTimeWindow}h+ driving windows found in the forecast</p>
                <p className="text-xs text-zinc-500 mt-1">Try reducing the minimum window duration</p>
              </div>
            )}
          </div>
          
          {/* Tire Temp Profile Graph */}
          <div className="bg-zinc-900/60 p-3 rounded-md mt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Gauge className="h-4 w-4 mr-1 text-[#1982FC]" /> Tire Temperature Forecast
            </h4>
            
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="relative h-40 pb-5">
                  {/* Temperature range indicators */}
                  <div className="absolute left-0 right-0 bottom-5 h-0.5 bg-red-500" style={{ bottom: `${((160 / 200) * 100) - 5}%` }} />
                  <div className="absolute left-0 right-0 bottom-5 h-0.5 bg-green-500" style={{ bottom: `${((85 / 200) * 100) - 5}%` }} />
                  
                  <div className="absolute right-0 text-xs text-red-500" style={{ bottom: `${((160 / 200) * 100) - 5}%` }}>
                    Max Optimal (160°)
                  </div>
                  <div className="absolute right-0 text-xs text-green-500" style={{ bottom: `${((85 / 200) * 100) - 5}%` }}>
                    Min Optimal (85°)
                  </div>
                  
                  {/* Hour markers and temperature dots */}
                  <div className="flex h-full items-end">
                    {drivingAnalysis.tireTempProfile.slice(0, 24).map((hour, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                        {/* Temperature dot */}
                        <div 
                          className={`w-2 h-2 rounded-full mb-1 ${hour.isOptimal ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ marginBottom: `${(hour.tireTemp / 200) * 100}%` }}
                        />
                        
                        {/* Time label every 3 hours */}
                        {index % 3 === 0 && (
                          <div className="text-xs text-zinc-500 absolute -bottom-5 transform -translate-x-1/2" style={{ left: `${(index / 24) * 100}%` }}>
                            {hour.time.getHours()}:00
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-zinc-500 text-center mt-2">
              Next 24 Hours — Green dots indicate optimal tire temperature range
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Favorite Locations Weather Impact */}
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl">
            <Map className="mr-2 h-5 w-5 text-[#1982FC]" /> 
            Driving Destinations Weather Impact
          </CardTitle>
          <CardDescription>
            Weather-adjusted travel time to favorite driving roads
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {favoriteLocations.map((location) => {
              const impact = getWeatherImpact(location.travelTime);
              
              return (
                <div key={location.id} className="bg-zinc-900/60 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-start">
                      <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                        <Pin className="h-4 w-4 text-[#1982FC]" />
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center">
                          {location.name}
                          {location.name === 'Dragon's Tail' && (
                            <Star className="h-3 w-3 ml-1 text-yellow-500" />
                          )}
                        </h4>
                        <div className="text-xs text-zinc-500">
                          {formatDistance(location.distance)} away
                        </div>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={`
                        ${impact.impactPercentage < 10 ? 'bg-green-500/20 text-green-500 border-green-500/50' : 
                        impact.impactPercentage < 25 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 
                        'bg-red-500/20 text-red-500 border-red-500/50'}
                      `}
                    >
                      {impact.impactPercentage > 0 ? `+${impact.impactPercentage}%` : 'No impact'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#1982FC]"
                          style={{ width: `${(impact.baseTime / impact.totalTime) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      <span>
                        {Math.floor(impact.baseTime / 60)}h {impact.baseTime % 60}m
                      </span>
                      <span className="text-zinc-500">→</span>
                      <span className={impact.weatherImpact > 0 ? 'text-yellow-500' : ''}>
                        {Math.floor(impact.totalTime / 60)}h {impact.totalTime % 60}m
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {precipProb > 0.3 && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
                        <CloudRain className="h-3 w-3 mr-1" /> 
                        {Math.round(precipProb * 100)}% precip
                      </Badge>
                    )}
                    
                    {airTemp < 40 && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
                        <ThermometerSun className="h-3 w-3 mr-1" /> 
                        Low temp
                      </Badge>
                    )}
                    
                    {impact.weatherImpact === 0 && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> 
                        Ideal conditions
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-zinc-900/60 rounded-md">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Route className="h-4 w-4 mr-1 text-[#1982FC]" /> Route Recommendations
            </h4>
            
            <p className="text-sm text-zinc-300">
              {drivingAnalysis.optimalHours > 12 ? (
                "Multiple good driving windows are available in the next 48 hours. Current conditions are suitable for performance driving with proper tire warm-up."
              ) : drivingAnalysis.optimalHours > 6 ? (
                "Limited optimal driving windows available. Plan your drives carefully during the highlighted timeframes for best experience."
              ) : (
                "Very limited optimal driving conditions expected. Consider postponing performance driving or choose the closest destinations to minimize weather exposure."
              )}
            </p>
            
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <h5 className="text-sm font-medium mb-1">Best Choice Today:</h5>
              <div className="flex items-center">
                <Pin className="h-4 w-4 mr-2 text-[#08c519]" />
                <span className="text-sm">
                  {drivingAnalysis.optimalHours > 8 
                    ? (precipProb > 0.3 
                      ? favoriteLocations[4].name // Local in precipitation
                      : favoriteLocations[0].name) // Dragon's Tail in good weather
                    : favoriteLocations[4].name // Local in bad conditions
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDriverPlanner;
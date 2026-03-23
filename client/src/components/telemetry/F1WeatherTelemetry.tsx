import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Gauge, 
  Wind, 
  Thermometer, 
  Droplets, 
  Cloud, 
  Navigation, 
  Timer, 
  Flame, 
  BarChart3,
  SunMedium,
  MapPin,
  Umbrella,
  Clock,
  CloudRain,
  CloudSnow,
  Locate,
  PanelTop
} from 'lucide-react';
import { SurfaceConditionMeter } from '../weather/SurfaceConditionMeter';
import { AviationOverlay } from '../weather/AviationOverlay';
import { dataWarehouse } from '@/services/api/APIService';

interface TimeZoneLocation {
  id: string;
  name: string;
  timezone: string;
  offset: number;
}

export const F1WeatherTelemetry: React.FC = () => {
  const { currentWeather, forecastData, oneCallData, selectedLocation, units } = useWeather();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [timeZoneLocations, setTimeZoneLocations] = useState<TimeZoneLocation[]>([
    { id: '1', name: 'New York', timezone: 'America/New_York', offset: -4 },
    { id: '2', name: 'London', timezone: 'Europe/London', offset: 1 },
    { id: '3', name: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9 },
    { id: '4', name: 'Sydney', timezone: 'Australia/Sydney', offset: 10 },
    { id: '5', name: 'Dubai', timezone: 'Asia/Dubai', offset: 4 },
  ]);
  const [newLocation, setNewLocation] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  
  // Calculate UV index color
  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex < 3) return 'text-green-500';
    if (uvIndex < 6) return 'text-yellow-500';
    if (uvIndex < 8) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Calculate surface temperature based on air temperature and conditions
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
  
  // Calculate a grip factor based on various weather conditions
  const calculateGripFactor = (roadTemp: number, rainIntensity: number, humidity: number) => {
    // Ideal road temperature range for grip (approximately 80-110°F)
    const tempFactor = roadTemp < 80 
      ? Math.max(0, 0.7 + ((roadTemp - 60) / 100)) 
      : roadTemp > 110 
        ? Math.max(0, 1 - ((roadTemp - 110) / 100)) 
        : 1;
    
    // Rain drastically reduces grip
    const rainFactor = Math.max(0, 1 - (rainIntensity * 0.7));
    
    // High humidity can reduce grip slightly
    const humidityFactor = Math.max(0.8, 1 - ((humidity - 60) / 200));
    
    // Calculate overall grip factor (0-100 scale)
    return Math.min(100, Math.max(0, tempFactor * rainFactor * humidityFactor * 100));
  };
  
  // Estimate sun position factor (0-1) based on current time and sunrise/sunset
  const getSunPositionFactor = (current: number, sunrise: number, sunset: number) => {
    if (current < sunrise || current > sunset) return 0; // Night time
    
    const dayLength = sunset - sunrise;
    const timeFromSunrise = current - sunrise;
    const midday = sunrise + (dayLength / 2);
    
    // Factor peaks at midday (1.0) and is lower at sunrise/sunset
    if (current <= midday) {
      return timeFromSunrise / (dayLength / 2);
    } else {
      return 1 - ((current - midday) / (dayLength / 2));
    }
  };

  // Format temperature with units
  const formatTemp = (temp: number) => {
    return `${temp.toFixed(1)}°${units === 'imperial' ? 'F' : 'C'}`;
  };
  
  // Format wind speed with units
  const formatWindSpeed = (speed: number) => {
    return `${speed.toFixed(1)} ${units === 'imperial' ? 'mph' : 'm/s'}`;
  };
  
  useEffect(() => {
    // Update the current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (!currentWeather) {
      setLoading(true);
      return;
    }
    
    setLastUpdate(new Date());
    setLoading(false);
  }, [currentWeather]);
  
  if (loading || !currentWeather) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <Gauge className="w-10 h-10 animate-pulse text-[#1982FC] mb-2" />
          <p className="text-zinc-500">Loading telemetry data...</p>
        </div>
      </div>
    );
  }
  
  // Extract weather data
  const airTemp = currentWeather.main.temp;
  const humidity = currentWeather.main.humidity;
  const windSpeed = currentWeather.wind.speed;
  const windDirection = currentWeather.wind.deg;
  const windGust = currentWeather.wind?.gust;
  const clouds = currentWeather.clouds.all;
  const sunriseDt = currentWeather.sys.sunrise;
  const sunsetDt = currentWeather.sys.sunset;
  const currentDt = currentWeather.dt;
  const rainIntensity = currentWeather.rain?.['1h'] || 0;
  const snowIntensity = currentWeather.snow?.['1h'] || 0;
  const pressure = currentWeather.main.pressure;
  
  // Calculate derived metrics
  const sunPosition = getSunPositionFactor(currentDt, sunriseDt, sunsetDt);
  const surfaceTemp = calculateSurfaceTemp(airTemp, clouds, sunPosition);
  const gripFactor = calculateGripFactor(surfaceTemp, rainIntensity + (snowIntensity * 1.5), humidity);
  
  // Get UV index from oneCallData if available
  const uvIndex = oneCallData?.current?.uvi || 0;
  
  // Format degrees to cardinal direction
  const getCardinalDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };
  
  return (
    <div className="space-y-4">
      {/* Key Metrics Panel */}
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="p-4 md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1 flex items-center">
              <Thermometer className="w-3 h-3 mr-1" /> Air Temperature
            </div>
            <div className="text-4xl font-bold text-white">
              {formatTemp(airTemp)}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              Feels like {formatTemp(currentWeather.main.feels_like)}
            </div>
          </div>
          
          <div className="p-4 md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1 flex items-center">
              <Flame className="w-3 h-3 mr-1" /> Surface Temperature
            </div>
            <div className="text-4xl font-bold text-white">
              {formatTemp(surfaceTemp)}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              {surfaceTemp > airTemp + 10 ? 'Hot surface' : surfaceTemp < airTemp ? 'Cool surface' : 'Neutral'}
            </div>
          </div>
          
          <div className="p-4 md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="text-xs text-zinc-500 mb-1 flex items-center">
              <Navigation className="w-3 h-3 mr-1" /> Grip Level
            </div>
            <div className="text-4xl font-bold" style={{ color: gripFactor > 80 ? '#08c519' : gripFactor > 60 ? '#ffb020' : '#ff4444' }}>
              {Math.round(gripFactor)}%
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              {gripFactor > 80 ? 'Excellent' : gripFactor > 60 ? 'Good' : gripFactor > 40 ? 'Moderate' : 'Poor'}
            </div>
          </div>
          
          <div className="p-4 md:w-1/4 flex flex-col items-center justify-center">
            <div className="text-xs text-zinc-500 mb-1 flex items-center">
              <SunMedium className="w-3 h-3 mr-1" /> UV Index
            </div>
            <div className={`text-4xl font-bold ${getUVIndexColor(uvIndex)}`}>
              {Math.round(uvIndex)}
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              {uvIndex < 3 ? 'Low' : uvIndex < 6 ? 'Moderate' : uvIndex < 8 ? 'High' : uvIndex < 11 ? 'Very High' : 'Extreme'}
            </div>
          </div>
        </div>
        
        {/* Wind Data */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800 flex items-center justify-center">
                  <Wind className="w-6 h-6 text-[#1982FC]" />
                </div>
                <div 
                  className="absolute w-7 h-1 bg-[#1982FC] rounded transform origin-left"
                  style={{ 
                    transformBox: 'fill-box',
                    transform: `translateX(8px) rotate(${windDirection}deg)`,
                  }}
                />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold">
                  {formatWindSpeed(windSpeed)}
                </div>
                <div className="text-sm text-zinc-400">
                  {getCardinalDirection(windDirection)} ({windDirection}°)
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-zinc-500 mb-1">Humidity</div>
                <div className="text-xl font-bold">{humidity}%</div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-zinc-500 mb-1">Pressure</div>
                <div className="text-xl font-bold">{pressure}<span className="text-xs ml-1">hPa</span></div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-zinc-500 mb-1">Cloud Cover</div>
                <div className="text-xl font-bold">{clouds}%</div>
              </div>
              
              {windGust && (
                <div className="text-center">
                  <div className="text-xs text-zinc-500 mb-1">Wind Gusts</div>
                  <div className="text-xl font-bold">{formatWindSpeed(windGust)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabs Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Main content - 3/5 width on large screens */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <PanelTop className="mr-2 h-5 w-5 text-[#1982FC]" /> 
                  F1 Weather Paddock
                </CardTitle>
                <Badge variant="secondary" className="text-xs bg-[#08c519]/20 text-[#08c519]">
                  Live Telemetry
                </Badge>
              </div>
              <CardDescription>
                {selectedLocation?.name} - Last update: {lastUpdate.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="surface" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="surface">Surface Analysis</TabsTrigger>
                  <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
                  <TabsTrigger value="forecast">Forecast</TabsTrigger>
                  <TabsTrigger value="aviation">Aviation</TabsTrigger>
                </TabsList>
                
                {/* Surface Analysis Tab */}
                <TabsContent value="surface" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Surface Condition Meter */}
                    <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <Gauge className="mr-2 h-4 w-4 text-[#1982FC]" /> Surface Condition Meter
                      </h4>
                      
                      <div className="mt-2">
                        <SurfaceConditionMeter
                          temperature={surfaceTemp}
                          moisture={humidity}
                          airTemp={airTemp}
                          windSpeed={windSpeed}
                        />
                      </div>
                    </div>
                    
                    {/* Driving Recommendations */}
                    <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <Flame className="mr-2 h-4 w-4 text-[#1982FC]" /> Driving Conditions
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Track Grip</span>
                            <span>{Math.round(gripFactor)}%</span>
                          </div>
                          <Progress value={gripFactor} max={100} className="h-2" 
                            style={{backgroundColor: '#27272a'}}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Visibility</span>
                            <span>{100 - Math.min(clouds, 100)}%</span>
                          </div>
                          <Progress value={100 - Math.min(clouds, 100)} max={100} className="h-2" 
                            style={{backgroundColor: '#27272a'}}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Comfort</span>
                            <span>{Math.max(0, 100 - Math.abs(airTemp - 72) * 3)}%</span>
                          </div>
                          <Progress 
                            value={Math.max(0, 100 - Math.abs(airTemp - 72) * 3)} 
                            max={100} 
                            className="h-2"
                            style={{backgroundColor: '#27272a'}}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-zinc-800">
                        <h5 className="text-sm font-medium mb-2">F1 Racing Recommendation</h5>
                        <p className="text-sm text-zinc-400">
                          {gripFactor > 85 ? (
                            "Excellent grip conditions. Opt for soft compounds for maximum performance."
                          ) : gripFactor > 70 ? (
                            "Good grip with slight variations. Medium compounds recommended for consistency."
                          ) : gripFactor > 50 ? (
                            "Moderate grip with potential challenges. Consider harder compounds or intermediates."
                          ) : (
                            "Low grip conditions. Exercise extreme caution, wet or intermediate tires advised."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800">
                    <h4 className="text-sm font-medium mb-3">Surface Temperature Profile</h4>
                    
                    <div className="h-48 relative">
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded"></div>
                      <div className="absolute bottom-4 left-0 text-xs text-zinc-500">Cold ({formatTemp(airTemp - 15)})</div>
                      <div className="absolute bottom-4 right-0 text-xs text-zinc-500">Hot ({formatTemp(airTemp + 25)})</div>
                      
                      <div 
                        className="absolute w-4 h-4 bg-white border-2 border-[#1982FC] rounded-full transform -translate-x-1/2"
                        style={{ 
                          bottom: '0.5rem', 
                          left: `${Math.min(100, Math.max(0, ((surfaceTemp - (airTemp - 15)) / 40) * 100))}%`,
                        }}
                      ></div>
                      
                      <div className="absolute top-0 left-0 right-0 h-32 flex flex-col items-center justify-center text-center">
                        <h3 className="text-2xl font-bold">{formatTemp(surfaceTemp)}</h3>
                        <p className="text-sm text-zinc-400 mt-1">Current Surface Temperature</p>
                        <p className="text-xs text-zinc-500 mt-4">
                          {surfaceTemp > airTemp + 15 ? 
                            "Surface significantly hotter than air - high thermal degradation expected" :
                            surfaceTemp > airTemp + 5 ?
                            "Surface moderately warmer than air - standard thermal conditions" :
                            "Surface temperature close to air temperature - reduced thermal effect on tires"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Precipitation Tab */}
                <TabsContent value="precipitation" className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Precipitation */}
                    <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <Droplets className="mr-2 h-4 w-4 text-[#1982FC]" /> Current Conditions
                      </h4>
                      
                      <div className="flex items-center justify-center h-32">
                        {rainIntensity > 0 ? (
                          <div className="text-center">
                            <CloudRain className="h-12 w-12 mx-auto mb-2 text-[#1982FC]" />
                            <div className="text-xl font-bold">{rainIntensity.toFixed(1)} mm</div>
                            <div className="text-sm text-zinc-400">
                              {rainIntensity < 0.5 ? 'Light Rain' : rainIntensity < 4 ? 'Moderate Rain' : 'Heavy Rain'}
                            </div>
                          </div>
                        ) : snowIntensity > 0 ? (
                          <div className="text-center">
                            <CloudSnow className="h-12 w-12 mx-auto mb-2 text-[#1982FC]" />
                            <div className="text-xl font-bold">{snowIntensity.toFixed(1)} mm</div>
                            <div className="text-sm text-zinc-400">
                              {snowIntensity < 0.5 ? 'Light Snow' : snowIntensity < 4 ? 'Moderate Snow' : 'Heavy Snow'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Cloud className="h-12 w-12 mx-auto mb-2 text-zinc-500" />
                            <div className="text-xl font-bold">No Precipitation</div>
                            <div className="text-sm text-zinc-400">
                              {humidity > 80 ? 'High humidity' : 'Dry conditions'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Precipitation Probability */}
                    <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <Umbrella className="mr-2 h-4 w-4 text-[#1982FC]" /> Precipitation Probability
                      </h4>
                      
                      <div className="space-y-3">
                        {forecastData && forecastData.list && forecastData.list.slice(0, 5).map((period, index) => {
                          const time = new Date(period.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          const pop = period.pop * 100; // Probability of precipitation as percentage
                          
                          return (
                            <div key={index}>
                              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                <span>{time}</span>
                                <span>{Math.round(pop)}%</span>
                              </div>
                              <Progress value={pop} max={100} className="h-2" 
                                style={{
                                  backgroundColor: '#27272a',
                                  '--tw-progress-color': pop > 70 ? '#3b82f6' : pop > 30 ? '#60a5fa' : '#93c5fd' 
                                } as any}
                              />
                            </div>
                          );
                        })}
                        
                        {(!forecastData || !forecastData.list) && (
                          <div className="text-center py-4 text-zinc-500">
                            Forecast data unavailable
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 24-hour Precipitation Forecast */}
                  <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800">
                    <h4 className="text-sm font-medium mb-3">24-Hour Precipitation Forecast</h4>
                    
                    <div className="overflow-x-auto">
                      <div className="min-w-max">
                        <div className="flex">
                          {forecastData && forecastData.list && forecastData.list.slice(0, 8).map((period, index) => {
                            const time = new Date(period.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            const pop = period.pop * 100;
                            const hasRain = period.rain && period.rain['3h'] > 0;
                            const hasSnow = period.snow && period.snow['3h'] > 0;
                            const amount = hasRain ? period.rain['3h'] : hasSnow ? period.snow['3h'] : 0;
                            
                            return (
                              <div key={index} className="w-24 p-2 text-center">
                                <div className="text-xs text-zinc-500">{time}</div>
                                <div className="my-2">
                                  {hasRain ? (
                                    <CloudRain className="h-6 w-6 mx-auto text-[#1982FC]" />
                                  ) : hasSnow ? (
                                    <CloudSnow className="h-6 w-6 mx-auto text-[#1982FC]" />
                                  ) : (
                                    <Cloud className="h-6 w-6 mx-auto text-zinc-500" />
                                  )}
                                </div>
                                <div className="text-sm font-medium">
                                  {pop > 0 ? `${Math.round(pop)}%` : '-'}
                                </div>
                                <div className="text-xs text-zinc-400">
                                  {amount > 0 ? `${amount.toFixed(1)}mm` : '-'}
                                </div>
                              </div>
                            );
                          })}
                          
                          {(!forecastData || !forecastData.list) && (
                            <div className="w-full text-center py-4 text-zinc-500">
                              24-hour forecast data unavailable
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Forecast Tab */}
                <TabsContent value="forecast" className="pt-4">
                  <div className="bg-zinc-900/50 p-4 rounded-md border border-zinc-800">
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4 text-[#1982FC]" /> 5-Day Forecast
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <div className="min-w-max">
                        <div className="grid grid-cols-5 gap-2">
                          {forecastData && forecastData.list && 
                            [...Array(5)].map((_, dayIndex) => {
                              // Get 24h segments (8 x 3-hour periods) for each day
                              const startIdx = dayIndex * 8;
                              const dayData = forecastData.list.slice(startIdx, startIdx + 8);
                              
                              if (dayData.length === 0) return null;
                              
                              // Calculate day's min/max temps and average other values
                              const temps = dayData.map(d => d.main.temp);
                              const minTemp = Math.min(...temps);
                              const maxTemp = Math.max(...temps);
                              const avgHumidity = dayData.reduce((sum, d) => sum + d.main.humidity, 0) / dayData.length;
                              const avgWindSpeed = dayData.reduce((sum, d) => sum + d.wind.speed, 0) / dayData.length;
                              
                              // Get dominant weather condition
                              const weatherCounts = dayData.reduce((acc, d) => {
                                const type = d.weather[0].main;
                                acc[type] = (acc[type] || 0) + 1;
                                return acc;
                              }, {});
                              
                              const dominantWeather = Object.entries(weatherCounts)
                                .sort((a, b) => b[1] - a[1])[0][0];
                                
                              // Get highest precipitation probability
                              const maxPop = Math.max(...dayData.map(d => d.pop));
                              
                              // Format the date
                              const date = new Date(dayData[0].dt * 1000);
                              const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                              const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
                              
                              return (
                                <div key={dayIndex} className="p-3 bg-zinc-900/80 rounded-md">
                                  <div className="text-sm font-medium mb-2">{dayName}, {monthDay}</div>
                                  
                                  <div className="flex items-center mb-3">
                                    {dominantWeather === 'Rain' ? (
                                      <CloudRain className="h-8 w-8 mr-2 text-[#1982FC]" />
                                    ) : dominantWeather === 'Snow' ? (
                                      <CloudSnow className="h-8 w-8 mr-2 text-[#1982FC]" />
                                    ) : dominantWeather === 'Clear' ? (
                                      <SunMedium className="h-8 w-8 mr-2 text-yellow-500" />
                                    ) : (
                                      <Cloud className="h-8 w-8 mr-2 text-zinc-400" />
                                    )}
                                    <div>
                                      <div className="text-sm">{dominantWeather}</div>
                                      <div className="text-xs text-zinc-500">
                                        {maxPop > 0 ? `${Math.round(maxPop * 100)}% precip` : 'No precipitation'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between mb-2">
                                    <span className="text-zinc-500">High</span>
                                    <span className="font-medium">{formatTemp(maxTemp)}</span>
                                  </div>
                                  
                                  <div className="flex justify-between mb-2">
                                    <span className="text-zinc-500">Low</span>
                                    <span className="font-medium">{formatTemp(minTemp)}</span>
                                  </div>
                                  
                                  <div className="flex justify-between mb-2">
                                    <span className="text-zinc-500">Humidity</span>
                                    <span className="font-medium">{Math.round(avgHumidity)}%</span>
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Wind</span>
                                    <span className="font-medium">{formatWindSpeed(avgWindSpeed)}</span>
                                  </div>
                                </div>
                              );
                            })
                          }
                          
                          {(!forecastData || !forecastData.list) && (
                            <div className="col-span-5 text-center py-8 text-zinc-500">
                              5-day forecast data unavailable
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Aviation Tab */}
                <TabsContent value="aviation" className="pt-4">
                  <div className="h-[500px]">
                    <AviationOverlay />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full text-xs text-zinc-500 text-center">
                Powered by PADDOCK20 Weather Telemetry System
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* World Clock Panel - 2/5 width on large screens */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <Clock className="mr-2 h-5 w-5 text-[#1982FC]" /> 
                  World Clock
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Done' : 'Edit'}
                </Button>
              </div>
              <CardDescription>
                Track time across global racing locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeZoneLocations.map((location) => {
                // Calculate the time in this timezone
                const locationTime = new Date(currentTime);
                // Get UTC time and then add the timezone offset
                locationTime.setUTCHours(
                  currentTime.getUTCHours() + location.offset
                );
                
                return (
                  <div key={location.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-md">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-zinc-800 mr-3">
                        <MapPin className="h-5 w-5 text-[#1982FC]" />
                      </div>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-zinc-500">{location.timezone.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-xl font-medium">
                      {locationTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-2 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                        onClick={() => {
                          setTimeZoneLocations(timeZoneLocations.filter(l => l.id !== location.id));
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                );
              })}
              
              {editMode && (
                <div className="pt-2">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add location (e.g. Monaco, Silverstone)"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => {
                        if (newLocation.trim() && timeZoneLocations.length < 5) {
                          // In a real app, we would fetch the timezone from an API
                          // Simulating for demonstration purposes
                          setTimeZoneLocations([
                            ...timeZoneLocations,
                            {
                              id: Date.now().toString(),
                              name: newLocation,
                              timezone: 'Europe/Monaco', // Example timezone
                              offset: 2 // Example offset
                            }
                          ]);
                          setNewLocation('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Note: You can add up to 5 locations
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full text-xs text-zinc-500 text-center">
                Current local time: {currentTime.toLocaleTimeString()}
              </div>
            </CardFooter>
          </Card>
          
          {/* Location Details */}
          <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <Locate className="mr-2 h-5 w-5 text-[#1982FC]" /> 
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Location</span>
                  <span>{selectedLocation?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-500">Coordinates</span>
                  <span>
                    {selectedLocation?.lat.toFixed(4)}, {selectedLocation?.lon.toFixed(4)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-500">Local Time</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sunrise</span>
                  <span>{new Date(sunriseDt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sunset</span>
                  <span>{new Date(sunsetDt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-500">Weather</span>
                  <span>{currentWeather.weather[0].main} - {currentWeather.weather[0].description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
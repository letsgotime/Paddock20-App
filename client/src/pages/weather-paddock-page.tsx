import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Wind, Thermometer, Droplets, Navigation, BarChart, Clock, Calendar, Car, Route, Map, Star, 
  Sunset, CloudRain, Activity, ThermometerSun, Gauge, GaugeCircle, Flag, Timer, Flame, 
  Lightbulb, Zap, Cog, MapPin, Compass, Maximize2, Heart, Share2, TrendingUp, 
  X, ChevronDown, ChevronUp, CircleAlert, Settings2, Shield, Target, Cpu
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Import mock data and helper functions for now, these will connect to real APIs later
const mockWeatherData = {
  location: {
    name: "Atlanta",
    lat: 33.749,
    lon: -84.388
  },
  current: {
    timestamp: Date.now(),
    temp: 72,
    feels_like: 74,
    humidity: 65,
    pressure: 1012,
    weather_description: "Clear sky",
    weather_icon: "01d",
    cloud_cover: 5,
    wind_speed: 8,
    wind_direction: 260,
    visibility: 10,
    uv_index: 6,
    precipitation: 0,
    dew_point: 61
  },
  daily: [
    {
      dt: Date.now() + 86400000,
      temp: 75,
      temp_min: 68,
      temp_max: 82,
      pressure: 1010,
      humidity: 62,
      weather_description: "Partly cloudy",
      weather_icon: "02d",
      precipitation_chance: 0.1,
      wind_speed: 7
    },
    {
      dt: Date.now() + 86400000 * 2,
      temp: 77,
      temp_min: 70,
      temp_max: 84,
      pressure: 1011,
      humidity: 59,
      weather_description: "Mostly sunny",
      weather_icon: "01d",
      precipitation_chance: 0.05,
      wind_speed: 6
    },
    {
      dt: Date.now() + 86400000 * 3,
      temp: 81,
      temp_min: 72,
      temp_max: 88,
      pressure: 1009,
      humidity: 65,
      weather_description: "Clear sky",
      weather_icon: "01d",
      precipitation_chance: 0,
      wind_speed: 5
    }
  ]
};

const mockAutomotiveMetrics = {
  surfaces: {
    asphalt: {
      temperature: 82,
      condition: "Dry",
      grip_level: "Excellent"
    }
  },
  tire_performance: {
    warmup_times: {
      performance: 2,
      street: 3,
      all_season: 4
    },
    estimated_temps: {
      performance: 85,
      street: 80,
      all_season: 77
    },
    optimal_pressure_adjustment: 0.5
  },
  driving_conditions: {
    riskLevel: "Low",
    visibility: "Excellent",
    traction: "Excellent",
    recommendation: "Good conditions for performance driving. Follow standard procedures for tire and brake management."
  },
  performance: {
    brakingPerformance: {
      effectiveCoefficient: 0.95,
      stoppingDistanceAdjustment: 5
    },
    optimalDrivingWindow: "10:00 AM to 4:00 PM",
    surfaceEvolution: "Stable conditions expected"
  },
  telemetry: {
    idealLineTemp: 85,
    corneringG: {
      dry: 1.55,
      current: 1.47
    },
    lateralForce: 1.25,
    tyreDegradation: 1.8,
    drs: "Available"
  }
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Main Weather Paddock Component
const WeatherPaddockPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState(mockWeatherData);
  const [automotiveMetrics, setAutomotiveMetrics] = useState(mockAutomotiveMetrics);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [_, navigate] = useLocation();
  
  // Motorsport-inspired state variables
  const [selectedDrivingStyle, setSelectedDrivingStyle] = useState('balanced');
  const [selectedCarType, setSelectedCarType] = useState('sportscar');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [expandedTelemetry, setExpandedTelemetry] = useState(false);
  const [selectedForecastType, setSelectedForecastType] = useState('hourly');
  const [selectedForecastLocation, setSelectedForecastLocation] = useState('current');
  const [activeDrivingStrategy, setActiveDrivingStrategy] = useState('standard');
  const [telemetryExpanded, setTelemetryExpanded] = useState(false);
  const [activeTrackMap, setActiveTrackMap] = useState('overview');

  useEffect(() => {
    document.title = 'Weather Paddock | Paddock20';
    
    // Here we would typically fetch real data from our API endpoints
    // For now we're using mock data
    // TODO: Connect to real API endpoint
    
    setIsLoading(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // TODO: Implement real location search
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleMyLocation = () => {
    setIsLoading(true);
    // TODO: Implement geolocation
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Helper function for carbon background pattern
  const getCarbonBackground = (color: string = "#1982FC") => {
    return {
      backgroundImage: `
        linear-gradient(45deg, ${color}15 25%, transparent 25%),
        linear-gradient(-45deg, ${color}15 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${color}15 75%),
        linear-gradient(-45deg, transparent 75%, ${color}15 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
    };
  };
  
  return (
    <div 
      className="flex flex-col min-h-screen bg-[#0a1625] text-white"
      style={{
        background: 'linear-gradient(to bottom, #0a1625, #071220)',
        ...getCarbonBackground()
      }}
    >
      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header with controls - Orbitron styled */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>
              WEATHER PADDOCK: <span className="text-[#1982FC]">{weatherData.location.name.toUpperCase()}</span>
            </h1>
            
            <div className="flex space-x-2 w-full md:w-auto">
              <form onSubmit={handleSearch} className="flex-1 md:flex-initial">
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="City or coordinates"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white rounded-l-md"
                  />
                  <Button 
                    type="submit" 
                    className="rounded-l-none bg-[#1982FC] hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    Search
                  </Button>
                </div>
              </form>
              
              <Button 
                onClick={handleMyLocation} 
                variant="outline" 
                className="whitespace-nowrap border-gray-700 hover:bg-gray-700"
                disabled={isLoading}
              >
                <Map className="mr-2 h-4 w-4" />
                My Location
              </Button>
            </div>
          </div>
          
          {/* Main dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current weather summary */}
            <Card 
              className="border-[#1982FC]/30 text-white lg:col-span-2 overflow-hidden"
              style={{
                background: 'linear-gradient(to bottom, #0e1c2e, #071220)',
                ...getCarbonBackground()
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>
                    CURRENT CONDITIONS
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{formatDate(weatherData.current.timestamp)} • {formatTime(weatherData.current.timestamp)}</p>
                </div>
                <CardDescription className="text-gray-400">
                  Real-time weather data and performance driving metrics
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Temperature and conditions */}
                  <div className="flex items-center justify-between bg-gray-800/70 p-4 rounded-xl border border-[#1982FC]/30 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={getCarbonBackground("#1982FC")}></div>
                    <div className="flex flex-col z-10">
                      <span className="text-6xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>{weatherData.current.temp}°</span>
                      <div className="flex items-center mt-2">
                        <Badge className="bg-[#1982FC]/20 text-[#1982FC] border border-[#1982FC]/40 uppercase">
                          {weatherData.current.weather_description}
                        </Badge>
                      </div>
                      <span className="text-gray-400 text-sm mt-2">FEELS LIKE {weatherData.current.feels_like}°</span>
                    </div>
                    <div className="flex flex-col items-end z-10">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-[#1982FC]/10"></div>
                        <img 
                          src={`https://openweathermap.org/img/wn/${weatherData.current.weather_icon}@4x.png`} 
                          alt={weatherData.current.weather_description}
                          className="w-28 h-28 relative z-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Road Surface Status */}
                  <div className="bg-gray-800/70 p-4 rounded-xl border border-[#1982FC]/30 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={getCarbonBackground("#1982FC")}></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-6 h-6 bg-[#1982FC]/20 rounded-full flex items-center justify-center mr-2">
                          <Activity className="h-4 w-4 text-[#1982FC]" />
                        </div>
                        <h3 className="text-xl font-medium" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>SURFACE ANALYSIS</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/40 p-3 rounded-lg border border-[#1982FC]/20">
                          <p className="text-gray-400 text-xs uppercase">Asphalt Temp</p>
                          <p className="text-xl font-medium flex items-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                            <Thermometer className="mr-1 h-5 w-5 text-red-500" />
                            {automotiveMetrics.surfaces.asphalt.temperature}°F
                          </p>
                        </div>
                        <div className="bg-gray-900/40 p-3 rounded-lg border border-[#1982FC]/20">
                          <p className="text-gray-400 text-xs uppercase">Condition</p>
                          <p className="text-xl font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                            {automotiveMetrics.surfaces.asphalt.condition}
                          </p>
                        </div>
                        <div className="bg-gray-900/40 p-3 rounded-lg border border-[#1982FC]/20">
                          <p className="text-gray-400 text-xs uppercase">Grip Level</p>
                          <p className="text-xl font-medium flex items-center mt-1">
                            <Badge className={
                              automotiveMetrics.surfaces.asphalt.grip_level === "Excellent" ? "bg-[#08c519]" :
                              automotiveMetrics.surfaces.asphalt.grip_level === "Good" ? "bg-[#1982FC]" :
                              automotiveMetrics.surfaces.asphalt.grip_level === "Fair" ? "bg-yellow-600" :
                              "bg-red-600"
                            }>
                              {automotiveMetrics.surfaces.asphalt.grip_level}
                            </Badge>
                          </p>
                        </div>
                        <div className="bg-gray-900/40 p-3 rounded-lg border border-[#1982FC]/20">
                          <p className="text-gray-400 text-xs uppercase">Risk Level</p>
                          <p className="text-xl font-medium flex items-center mt-1">
                            <Badge className={
                              automotiveMetrics.driving_conditions.riskLevel === "Low" ? "bg-[#08c519]" :
                              automotiveMetrics.driving_conditions.riskLevel === "Moderate" ? "bg-yellow-600" :
                              "bg-red-600"
                            }>
                              {automotiveMetrics.driving_conditions.riskLevel}
                            </Badge>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Weather metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 bg-[#1982FC]/10 rounded-full flex items-center justify-center">
                        <Wind className="h-5 w-5 text-[#1982FC]" />
                      </div>
                    </div>
                    <p className="text-center font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>{weatherData.current.wind_speed} mph</p>
                    <p className="text-xs text-center text-gray-400">WIND {getWindDirection(weatherData.current.wind_direction)}</p>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 bg-[#1982FC]/10 rounded-full flex items-center justify-center">
                        <Droplets className="h-5 w-5 text-[#1982FC]" />
                      </div>
                    </div>
                    <p className="text-center font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>{weatherData.current.humidity}%</p>
                    <p className="text-xs text-center text-gray-400">HUMIDITY</p>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 bg-[#1982FC]/10 rounded-full flex items-center justify-center">
                        <CloudRain className="h-5 w-5 text-[#1982FC]" />
                      </div>
                    </div>
                    <p className="text-center font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>{weatherData.current.precipitation * 100}%</p>
                    <p className="text-xs text-center text-gray-400">PRECIPITATION</p>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 bg-[#1982FC]/10 rounded-full flex items-center justify-center">
                        <Navigation className="h-5 w-5 text-[#1982FC]" />
                      </div>
                    </div>
                    <p className="text-center font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>{weatherData.current.visibility} mi</p>
                    <p className="text-xs text-center text-gray-400">VISIBILITY</p>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 bg-[#08c519]/10 rounded-full flex items-center justify-center">
                        <Sunset className="h-5 w-5 text-[#08c519]" />
                      </div>
                    </div>
                    <p className="text-center font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>{weatherData.current.uv_index}</p>
                    <p className="text-xs text-center text-gray-400">UV INDEX</p>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-10 h-10 bg-[#1982FC]/10 rounded-full flex items-center justify-center">
                        <Thermometer className="h-5 w-5 text-[#1982FC]" />
                      </div>
                    </div>
                    <p className="text-center font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>{weatherData.current.dew_point}°</p>
                    <p className="text-xs text-center text-gray-400">DEW POINT</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* F1-style Telemetry */}
            <Card 
              className="border-[#1982FC]/30 text-white h-full overflow-hidden"
              style={{
                background: 'linear-gradient(to bottom, #0e1c2e, #071220)',
                ...getCarbonBackground("#1982FC")
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>
                  PERFORMANCE TELEMETRY
                </CardTitle>
                <CardDescription className="text-gray-400">
                  F1-inspired driving metrics
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Ferrari Team-inspired header section */}
                <div className="bg-gradient-to-r from-[#b80505] to-[#7c0303] p-3 -mx-6 -mt-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-yellow-400 mr-2" />
                      <span className="text-white font-bold uppercase tracking-wider">SF-25 Performance</span>
                    </div>
                    <Badge className="bg-black text-white uppercase text-xs">Scuderia</Badge>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-100">Inspired by elite motorsport engineering</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Cornering G-Force</p>
                    <p className="text-sm font-bold">{automotiveMetrics.telemetry.corneringG.current.toFixed(2)}G</p>
                  </div>
                  <Progress 
                    value={(automotiveMetrics.telemetry.corneringG.current / automotiveMetrics.telemetry.corneringG.dry) * 100} 
                    className="h-2 bg-gray-800"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0.0G</span>
                    <span>Max: {automotiveMetrics.telemetry.corneringG.dry.toFixed(2)}G</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Lateral Force</p>
                    <p className="text-sm font-bold">{automotiveMetrics.telemetry.lateralForce.toFixed(2)} kN</p>
                  </div>
                  <Progress 
                    value={(automotiveMetrics.telemetry.lateralForce / 2) * 100} 
                    className="h-2 bg-gray-800"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Tire Degradation</p>
                    <p className="text-sm font-bold">{automotiveMetrics.telemetry.tyreDegradation.toFixed(1)}%/lap</p>
                  </div>
                  <Progress 
                    value={(automotiveMetrics.telemetry.tyreDegradation / 5) * 100} 
                    className="h-2 bg-gray-800"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Ideal Line Temp</p>
                    <p className="text-sm font-bold">{automotiveMetrics.telemetry.idealLineTemp}°F</p>
                  </div>
                  <Progress 
                    value={(automotiveMetrics.telemetry.idealLineTemp / 120) * 100} 
                    className="h-2 bg-gray-800"
                  />
                </div>
                
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <h3 className="font-medium mb-2">DRS Status</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className={automotiveMetrics.telemetry.drs === "Available" ? "bg-green-600" : "bg-red-600"}>
                      {automotiveMetrics.telemetry.drs}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <h3 className="font-medium mb-2">Braking Performance</h3>
                  <div>
                    <p className="text-sm text-gray-400">Stopping Distance:</p>
                    <p className="text-md">+{automotiveMetrics.performance.brakingPerformance.stoppingDistanceAdjustment}% from normal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Mode switcher tabs */}
          <Tabs defaultValue="driving" className="w-full">
            <TabsList 
              className="grid grid-cols-3 bg-[#0e1c2e] text-white h-14 p-1"
              style={{
                border: '1px solid rgba(25, 130, 252, 0.3)',
                ...getCarbonBackground("#1982FC")
              }}
            >
              <TabsTrigger 
                value="driving" 
                className="data-[state=active]:bg-[#1982FC] data-[state=active]:text-white"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}
              >
                PERFORMANCE DRIVING
              </TabsTrigger>
              <TabsTrigger 
                value="forecast" 
                className="data-[state=active]:bg-[#1982FC] data-[state=active]:text-white"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}
              >
                EXPANDED FORECAST
              </TabsTrigger>
              <TabsTrigger 
                value="routes" 
                className="data-[state=active]:bg-[#1982FC] data-[state=active]:text-white"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}
              >
                RECOMMENDED ROUTES
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="driving" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                  className="border-[#1982FC]/30 text-white overflow-hidden"
                  style={{
                    background: 'linear-gradient(to bottom, #0e1c2e, #071220)',
                    ...getCarbonBackground("#1982FC")
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>
                      TIRE PERFORMANCE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Estimated Warmup Times</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-400">Performance</p>
                            <p className="text-lg font-medium">{automotiveMetrics.tire_performance.warmup_times.performance} min</p>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-400">Street</p>
                            <p className="text-lg font-medium">{automotiveMetrics.tire_performance.warmup_times.street} min</p>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-400">All-Season</p>
                            <p className="text-lg font-medium">{automotiveMetrics.tire_performance.warmup_times.all_season} min</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Estimated Operating Temperatures</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-400">Performance</p>
                            <p className="text-lg font-medium">{automotiveMetrics.tire_performance.estimated_temps.performance}°F</p>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-400">Street</p>
                            <p className="text-lg font-medium">{automotiveMetrics.tire_performance.estimated_temps.street}°F</p>
                          </div>
                          <div className="bg-gray-800/50 p-2 rounded-lg text-center">
                            <p className="text-xs text-gray-400">All-Season</p>
                            <p className="text-lg font-medium">{automotiveMetrics.tire_performance.estimated_temps.all_season}°F</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Pressure Adjustment</h4>
                        <div className="bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-center text-xl font-medium">{automotiveMetrics.tire_performance.optimal_pressure_adjustment > 0 ? '+' : ''}{automotiveMetrics.tire_performance.optimal_pressure_adjustment} PSI</p>
                          <p className="text-xs text-center text-gray-400">From baseline pressure</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border-[#1982FC]/30 text-white overflow-hidden"
                  style={{
                    background: 'linear-gradient(to bottom, #0e1c2e, #071220)',
                    ...getCarbonBackground("#1982FC")
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>
                      DRIVING WINDOW
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="h-10 w-10 text-[#1982FC]" />
                        </div>
                        <h3 className="text-center text-xl font-medium">Optimal Period</h3>
                        <p className="text-center text-gray-300 mt-1">{automotiveMetrics.performance.optimalDrivingWindow}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Surface Evolution</h4>
                        <p className="text-sm bg-gray-800/50 p-3 rounded-lg">
                          {automotiveMetrics.performance.surfaceEvolution}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <h4 className="text-sm text-gray-400 mb-1">Recommendation</h4>
                        <p className="text-sm">{automotiveMetrics.driving_conditions.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border-[#1982FC]/30 text-white overflow-hidden md:col-span-2"
                  style={{
                    background: 'linear-gradient(to bottom, #0e1c2e, #071220)',
                    ...getCarbonBackground("#1982FC") 
                  }}
                >
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <div>
                      <CardTitle className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>
                        3-DAY PERFORMANCE OUTLOOK
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Maximize your performance with expert strategy
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#00d2be] to-[#00d2be] text-black font-semibold">
                      DRIVER-INSPIRED
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {/* Lewis Hamilton-inspired driving insights section */}
                    <div className="bg-black border border-[#00d2be]/30 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[#00d2be] flex items-center justify-center mr-3">
                            <span className="text-black font-bold text-xl">44</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Elite Driver Strategy</h3>
                            <p className="text-sm text-gray-300">Champion-level insights for current conditions</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-[#00d2be] text-[#00d2be]">PREMIUM</Badge>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold">1</span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium text-[#00d2be]">Brake Balance:</span> With current temperature and humidity levels, set brake balance 1.5% forward for optimal turn-in response while maintaining stability.
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold">2</span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium text-[#00d2be]">Tire Management:</span> Current road temperature indicates optimal tire pressures at 2.5 PSI above baseline. Pay attention to right-side wear on longer runs.
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold">3</span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium text-[#00d2be]">Racing Line:</span> With today's {weatherData.current.weather_description.toLowerCase()} conditions, standard racing line is optimal with slightly later apexes than usual.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Button variant="outline" className="text-xs border-[#00d2be] text-[#00d2be] hover:bg-[#00d2be]/10 hover:text-[#00d2be]">
                          <Timer className="h-3 w-3 mr-1" />
                          Full Telemetry
                        </Button>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">Confidence Rating</span>
                          <div className="flex items-center">
                            <Progress value={92} className="h-1.5 w-16 bg-gray-700 mr-2" />
                            <span className="text-xs">92%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {weatherData.daily && weatherData.daily.map((day, index) => (
                        <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="font-medium text-center">{formatDate(day.dt)}</h3>
                          <div className="flex items-center justify-center my-2">
                            <img 
                              src={`https://openweathermap.org/img/wn/${day.weather_icon}@2x.png`} 
                              alt={day.weather_description}
                              className="w-16 h-16"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm">{day.weather_description}</p>
                            <p className="text-lg font-medium">{day.temp}°F</p>
                            <p className="text-xs text-gray-400">{day.temp_min}° / {day.temp_max}°</p>
                          </div>
                          <Separator className="my-2 bg-gray-700" />
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div>
                              <p className="text-xs text-gray-400">Wind</p>
                              <p className="text-sm">{day.wind_speed} mph</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Precip</p>
                              <p className="text-sm">{(day.precipitation_chance * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Badge 
                              className={
                                day.precipitation_chance < 0.2 && day.temp >= 65 && day.temp <= 85 ? "bg-green-600 w-full justify-center" :
                                day.precipitation_chance >= 0.2 && day.precipitation_chance < 0.5 ? "bg-yellow-600 w-full justify-center" :
                                "bg-red-600 w-full justify-center"
                              }
                            >
                              {
                                day.precipitation_chance < 0.2 && day.temp >= 65 && day.temp <= 85 ? "Excellent Driving" :
                                day.precipitation_chance >= 0.2 && day.precipitation_chance < 0.5 ? "Fair Conditions" :
                                "Poor Conditions"
                              }
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="forecast" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Card 
                  className="border-[#1982FC]/30 text-white overflow-hidden"
                  style={{
                    background: 'linear-gradient(to bottom, #0e1c2e, #071220)',
                    ...getCarbonBackground("#1982FC")
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>
                      DETAILED FORECAST
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Expanded weather data for planning upcoming drives
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Forecast Type</h3>
                        <Select
                          value={selectedForecastType || "hourly"}
                          onValueChange={(value) => setSelectedForecastType(value)}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select forecast type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="hourly">Hourly Forecast</SelectItem>
                            <SelectItem value="daily">Daily Forecast</SelectItem>
                            <SelectItem value="weekend">Weekend Weather</SelectItem>
                            <SelectItem value="extended">Extended 10-Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Location</h3>
                        <Select
                          value={selectedForecastLocation || "current"}
                          onValueChange={(value) => setSelectedForecastLocation(value)}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="current">Current Location</SelectItem>
                            {/* Favorite locations will be implemented with proper context later */}
                            <SelectItem value="fav-1">Atlanta</SelectItem>
                            <SelectItem value="fav-2">Nashville</SelectItem>
                            <SelectItem value="custom">Custom Location</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Hourly Forecast Section */}
                    {(selectedForecastType === "hourly" || !selectedForecastType) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>HOURLY FORECAST</h3>
                        <div className="overflow-x-auto pb-2">
                          <div className="flex space-x-4 min-w-max">
                            {/* Using mock data from daily forecast for display purposes, will integrate with real hourly API data */}
                            {Array.from({ length: 24 }).map((_, index) => {
                              // Create a time that's "index" hours from now
                              const timestamp = Date.now() + (index * 3600 * 1000);
                              const temp = Math.round(weatherData.current.temp - (index % 5 === 0 ? 5 : 0) + (index % 3 === 0 ? 3 : 0));
                              const icon = weatherData.current.weather_icon;
                              const description = weatherData.current.weather_description;
                              
                              return (
                                <div key={index} className="bg-gray-800/50 p-3 rounded-lg text-center min-w-[100px] border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                                  <p className="text-sm font-medium" style={{ fontFamily: "'Orbitron', sans-serif" }}>{formatTime(timestamp)}</p>
                                  <div className="flex justify-center my-2">
                                    <img 
                                      src={`https://openweathermap.org/img/wn/${icon}@2x.png`} 
                                      alt={description}
                                      className="w-12 h-12"
                                    />
                                  </div>
                                  <p className="text-lg font-medium">{temp}°F</p>
                                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-400 mt-2">
                                    <div>WIND</div>
                                    <div>{Math.round(weatherData.current.wind_speed - (index % 3))} mph</div>
                                    <div>PRECIP</div>
                                    <div>{Math.round(weatherData.current.precipitation * 100) + (index % 10)}%</div>
                                    <div>FEELS</div>
                                    <div>{temp - 2}°</div>
                                  </div>
                                  <div className="mt-2">
                                    <Badge 
                                      className={
                                        index % 5 === 0 ? "bg-yellow-600 w-full justify-center text-xs" :
                                        index % 7 === 0 ? "bg-red-600 w-full justify-center text-xs" :
                                        "bg-[#08c519] w-full justify-center text-xs"
                                      }
                                    >
                                      {index % 5 === 0 ? "FAIR" : index % 7 === 0 ? "POOR" : "EXCELLENT"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Daily Forecast Section */}
                    {selectedForecastType === "daily" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>7-DAY FORECAST</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {weatherData.daily && weatherData.daily.map((day, index) => (
                            <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-[#1982FC]/20 hover:border-[#1982FC]/40 transition-colors">
                              <h3 className="font-medium text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>{formatDate(day.dt)}</h3>
                              <div className="flex items-center justify-center my-2">
                                <img 
                                  src={`https://openweathermap.org/img/wn/${day.weather_icon}@2x.png`} 
                                  alt={day.weather_description}
                                  className="w-16 h-16"
                                />
                              </div>
                              <div className="text-center">
                                <p className="text-sm">{day.weather_description}</p>
                                <p className="text-lg font-medium">{day.temp}°F</p>
                                <p className="text-xs text-gray-400">{day.temp_min}° / {day.temp_max}°</p>
                              </div>
                              <Separator className="my-2 bg-gray-700" />
                              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                <div>
                                  <p className="text-xs text-gray-400">WIND</p>
                                  <p>{day.wind_speed} mph</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">PRECIP</p>
                                  <p>{(day.precipitation_chance * 100).toFixed(0)}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">HUMIDITY</p>
                                  <p>{day.humidity}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">UV INDEX</p>
                                  <p>{(day.humidity % 12) || 1}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <Badge 
                                  className={
                                    day.precipitation_chance < 0.2 && day.temp >= 65 && day.temp <= 85 ? "bg-[#08c519] w-full justify-center" :
                                    day.precipitation_chance >= 0.2 && day.precipitation_chance < 0.5 ? "bg-yellow-600 w-full justify-center" :
                                    "bg-red-600 w-full justify-center"
                                  }
                                >
                                  {
                                    day.precipitation_chance < 0.2 && day.temp >= 65 && day.temp <= 85 ? "EXCELLENT DRIVING" :
                                    day.precipitation_chance >= 0.2 && day.precipitation_chance < 0.5 ? "FAIR CONDITIONS" :
                                    "POOR CONDITIONS"
                                  }
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weekend Weather Section */}
                    {selectedForecastType === "weekend" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>WEEKEND WEATHER</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Helper function to determine weekend days */}
                          {(() => {
                            // Replaces getWeekendDays function
                            const days = [
                              { name: "SATURDAY", dayNum: 6 },
                              { name: "SUNDAY", dayNum: 0 }
                            ];
                            
                            return days.map((day, index) => {
                              // Find the daily forecast for this weekend day
                              const weekendDay = weatherData.daily?.find(d => {
                                const date = new Date(d.dt * 1000);
                                return date.getDay() === day.dayNum;
                              });
                              
                              // Helper function for driving recommendations
                              const getRecommendation = (day: any) => {
                                if (day.precipitation_chance < 0.2 && day.temp >= 65 && day.temp <= 85) {
                                  return "Perfect conditions for spirited driving. Roads should be dry with excellent visibility. Consider taking your favorite mountain or coastal route.";
                                } else if (day.precipitation_chance >= 0.2 && day.precipitation_chance < 0.5) {
                                  return "Fair conditions for driving. Be cautious of possible wet patches on roads and reduced visibility in some areas.";
                                } else {
                                  return "Challenging driving conditions expected. Consider postponing non-essential drives or take extra caution with reduced speeds.";
                                }
                              };
                              
                              return weekendDay ? (
                                <Card key={index} className="bg-gray-800/60 border-gray-700 hover:border-[#1982FC]/40 transition-colors">
                                  <CardHeader>
                                    <CardTitle className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif" }}>{day.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0">
                                        <img 
                                          src={`https://openweathermap.org/img/wn/${weekendDay.weather_icon}@2x.png`} 
                                          alt={weekendDay.weather_description}
                                          className="w-20 h-20"
                                        />
                                      </div>
                                      <div className="ml-4">
                                        <p className="text-lg font-medium">{weekendDay.temp}°F</p>
                                        <p className="text-sm">{weekendDay.weather_description}</p>
                                        <p className="text-xs text-gray-400">{weekendDay.temp_min}° / {weekendDay.temp_max}°</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                      <div className="bg-gray-800/80 p-3 rounded-lg text-center border border-gray-700">
                                        <p className="text-xs text-gray-400">PRECIPITATION</p>
                                        <p className="text-md">{(weekendDay.precipitation_chance * 100).toFixed(0)}%</p>
                                      </div>
                                      <div className="bg-gray-800/80 p-3 rounded-lg text-center border border-gray-700">
                                        <p className="text-xs text-gray-400">WIND SPEED</p>
                                        <p className="text-md">{weekendDay.wind_speed} mph</p>
                                      </div>
                                      <div className="bg-gray-800/80 p-3 rounded-lg text-center border border-gray-700">
                                        <p className="text-xs text-gray-400">HUMIDITY</p>
                                        <p className="text-md">{weekendDay.humidity}%</p>
                                      </div>
                                      <div className="bg-gray-800/80 p-3 rounded-lg text-center border border-gray-700">
                                        <p className="text-xs text-gray-400">UV INDEX</p>
                                        <p className="text-md">{weekendDay.humidity % 12}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                      <h4 className="text-sm font-medium mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>DRIVING RECOMMENDATION</h4>
                                      <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm">CONDITIONS:</span>
                                          <Badge 
                                            className={
                                              weekendDay.precipitation_chance < 0.2 && weekendDay.temp >= 65 && weekendDay.temp <= 85 ? "bg-[#08c519]" :
                                              weekendDay.precipitation_chance >= 0.2 && weekendDay.precipitation_chance < 0.5 ? "bg-yellow-600" :
                                              "bg-red-600"
                                            }
                                          >
                                            {
                                              weekendDay.precipitation_chance < 0.2 && weekendDay.temp >= 65 && weekendDay.temp <= 85 ? "EXCELLENT" :
                                              weekendDay.precipitation_chance >= 0.2 && weekendDay.precipitation_chance < 0.5 ? "FAIR" :
                                              "POOR"
                                            }
                                          </Badge>
                                        </div>
                                        <p className="text-sm mt-2">
                                          {getRecommendation(weekendDay)}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <Card key={index} className="bg-gray-800/60 border-gray-700">
                                  <CardHeader>
                                    <CardTitle className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif" }}>{day.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center justify-center h-40">
                                      <p className="text-gray-400">Forecast data not available</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Extended 10-Day Forecast */}
                    {selectedForecastType === "extended" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>EXTENDED 10-DAY FORECAST</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-800/80 border-b border-[#1982FC]/30">
                                <th className="py-2 px-4 text-left" style={{ fontFamily: "'Orbitron', sans-serif" }}>DATE</th>
                                <th className="py-2 px-4 text-left" style={{ fontFamily: "'Orbitron', sans-serif" }}>CONDITIONS</th>
                                <th className="py-2 px-4 text-left" style={{ fontFamily: "'Orbitron', sans-serif" }}>HIGH/LOW</th>
                                <th className="py-2 px-4 text-left" style={{ fontFamily: "'Orbitron', sans-serif" }}>PRECIP</th>
                                <th className="py-2 px-4 text-left" style={{ fontFamily: "'Orbitron', sans-serif" }}>WIND</th>
                                <th className="py-2 px-4 text-left" style={{ fontFamily: "'Orbitron', sans-serif" }}>DRIVING</th>
                              </tr>
                            </thead>
                            <tbody>
                              {weatherData.daily && weatherData.daily.map((day, index) => (
                                <tr key={index} className={index % 2 === 0 ? "bg-gray-800/30 hover:bg-gray-800/40" : "bg-gray-800/50 hover:bg-gray-800/60"}>
                                  <td className="py-3 px-4 border-b border-gray-800">{formatDate(day.dt)}</td>
                                  <td className="py-3 px-4 border-b border-gray-800">
                                    <div className="flex items-center">
                                      <img 
                                        src={`https://openweathermap.org/img/wn/${day.weather_icon}.png`} 
                                        alt={day.weather_description}
                                        className="w-10 h-10 mr-2"
                                      />
                                      <span>{day.weather_description}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 border-b border-gray-800">{day.temp_max}° / {day.temp_min}°</td>
                                  <td className="py-3 px-4 border-b border-gray-800">{(day.precipitation_chance * 100).toFixed(0)}%</td>
                                  <td className="py-3 px-4 border-b border-gray-800">{day.wind_speed} mph</td>
                                  <td className="py-3 px-4 border-b border-gray-800">
                                    <Badge 
                                      className={
                                        day.precipitation_chance < 0.2 && day.temp >= 65 && day.temp <= 85 ? "bg-[#08c519]" :
                                        day.precipitation_chance >= 0.2 && day.precipitation_chance < 0.5 ? "bg-yellow-600" :
                                        "bg-red-600"
                                      }
                                    >
                                      {
                                        day.precipitation_chance < 0.2 && day.temp >= 65 && day.temp <= 85 ? "EXCELLENT" :
                                        day.precipitation_chance >= 0.2 && day.precipitation_chance < 0.5 ? "FAIR" :
                                        "POOR"
                                      }
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="routes" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Card 
                  className="border-[#1982FC]/30 text-white overflow-hidden"
                  style={{
                    background: 'linear-gradient(to bottom, #0e1c2e, #071220)',
                    ...getCarbonBackground("#1982FC")
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg" style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.5px" }}>
                      WEATHER-OPTIMIZED ROUTES
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Suggested drives based on current and forecasted conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">This section will display routes that are optimized for current weather conditions</p>
                    <Button 
                      className="bg-[#1982FC] hover:bg-blue-700"
                      onClick={() => setActiveTab('driving')}
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WeatherPaddockPage;
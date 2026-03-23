import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Car,
  Route,
  Home,
  MapPin,
  Music,
  ChevronDown,
  ChevronRight,
  MapPinned,
  Clock,
  Calendar,
  PlusCircle,
  Search,
  CloudRain,
  CloudSnow,
  Briefcase,
  RefreshCw,
  Compass,
  AlertTriangle,
  Sparkles,
  Settings,
  Copy
} from 'lucide-react';
import { dataWarehouse } from '@/services/api/APIService';
import { SurfaceConditionMeter } from '../weather/SurfaceConditionMeter';
import { AviationOverlay } from '../weather/AviationOverlay';

interface VehicleData {
  id: number;
  userId: number;
  make: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  trim: string | null;
  tires: TireData[] | null;
}

interface TireData {
  id: number;
  vehicleId: number;
  type: string | null;
  brand: string | null;
  model: string | null;
  installedAt: Date | null;
}

interface DriveRoute {
  id: number;
  userId: number;
  name: string;
  type: 'commute' | 'fun' | 'other';
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  distance: number;
  estimatedDuration: number;
  favorite: boolean;
}

interface WeatherBasedPlaylist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  uri: string;
  weatherType: string;
  energyLevel: number;
  popularity: number;
}

const WeatherPaddockDashboard: React.FC = () => {
  // Get data from contexts
  const { 
    currentWeather, 
    forecastData, 
    oneCallData, 
    selectedLocation, 
    units, 
    locationHistory, 
    searchLocation,
    refreshWeather,
    getWeather 
  } = useWeather();
  
  const { userProfile, userVehicles, getUserVehicles, saveUserVehicle } = useUserProfile();
  
  // Component state
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [driveRoutes, setDriveRoutes] = useState<DriveRoute[]>([]);
  const [selectedCommuteRoute, setSelectedCommuteRoute] = useState<DriveRoute | null>(null);
  const [selectedFunRoute, setSelectedFunRoute] = useState<DriveRoute | null>(null);
  const [playlists, setPlaylists] = useState<WeatherBasedPlaylist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [weatherRefreshTimer, setWeatherRefreshTimer] = useState<number>(0);
  
  // Tabs state
  const [expandedForecast, setExpandedForecast] = useState<string | null>(null);
  const [expandedVehicleInfo, setExpandedVehicleInfo] = useState<boolean>(false);
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);
  
  // Load user vehicles and routes data
  useEffect(() => {
    const loadUserData = async () => {
      if (!userProfile) return;
      
      setLoading(true);
      
      try {
        // Load user vehicles with authentic VIN data
        const vehicles = await getUserVehicles(userProfile.id);
        if (vehicles && vehicles.length > 0) {
          setSelectedVehicle(vehicles[0]);
        }
        
        // Load user saved routes - API call to get actual route data
        const loadedRoutes = await fetchUserRoutes(userProfile.id);
        setDriveRoutes(loadedRoutes);
        
        // Set default routes if available
        const commuteRoute = loadedRoutes.find(r => r.type === 'commute');
        if (commuteRoute) setSelectedCommuteRoute(commuteRoute);
        
        const funRoute = loadedRoutes.find(r => r.type === 'fun' && r.favorite);
        if (funRoute) setSelectedFunRoute(funRoute);
        
        // Load weather-based playlists - from Spotify API via backend
        const weatherPlaylists = await fetchWeatherBasedPlaylists();
        setPlaylists(weatherPlaylists);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
      
      setLoading(false);
    };
    
    loadUserData();
    
    // Set up weather refresh timer (15 minutes)
    const timer = setInterval(() => {
      setWeatherRefreshTimer(prev => {
        if (prev >= 15*60) {
          refreshWeather();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [userProfile]);
  
  // Fetch real user routes from the API - no mock data
  const fetchUserRoutes = async (userId: number): Promise<DriveRoute[]> => {
    try {
      // Real API call to backend for user's routes
      const response = await fetch(`/api/user-routes/${userId}`);
      
      if (!response.ok) {
        console.error('Error fetching user routes:', response.statusText);
        return [];
      }
      
      const routes = await response.json();
      return routes;
    } catch (error) {
      console.error('Error fetching user routes:', error);
      return [];
    }
  };
  
  // Fetch weather-based playlists from Spotify API via our backend
  const fetchWeatherBasedPlaylists = async (): Promise<WeatherBasedPlaylist[]> => {
    try {
      if (!currentWeather) return [];
      
      // Call backend endpoint that communicates with Spotify API
      const weatherCondition = currentWeather.weather[0].main.toLowerCase();
      const temperature = currentWeather.main.temp;
      const isDay = currentWeather.weather[0].icon.includes('d');
      
      // Build query parameters from real weather data
      const params = new URLSearchParams({
        condition: weatherCondition,
        temperature: temperature.toString(),
        isDay: isDay.toString()
      });
      
      // Make the call to our backend endpoint which uses Spotify API
      const response = await fetch(`/api/spotify/weather-playlists?${params}`);
      
      if (!response.ok) {
        console.error('Error fetching weather playlists:', response.statusText);
        return [];
      }
      
      const playlists = await response.json();
      return playlists;
    } catch (error) {
      console.error('Error fetching weather playlists:', error);
      return [];
    }
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
  
  // Calculate tire temperature based on ambient and surface conditions
  const calculateTireTemp = (
    ambientTemp: number, 
    roadTemp: number, 
    sunPosition: number, 
    drivingMinutes: number,
    tireBrand: string | null,
    tireType: string | null
  ) => {
    // Base tire temp starts at ambient
    let baseTemp = ambientTemp;
    
    // Road temperature influence (hotter road = hotter tires)
    const roadFactor = Math.max(0, (roadTemp - ambientTemp) * 0.3);
    
    // Driving heats tires (more time = higher temps, but with a cap)
    const drivingFactor = Math.min(30, drivingMinutes * 0.5);
    
    // Tire type factors - performance tires heat faster than all-seasons
    let tireFactor = 1.0;
    
    if (tireType) {
      const tireTypeLower = tireType.toLowerCase();
      if (tireTypeLower.includes('performance') || tireTypeLower.includes('summer')) {
        tireFactor = 1.2; // Performance tires heat up faster
      } else if (tireTypeLower.includes('all season') || tireTypeLower.includes('touring')) {
        tireFactor = 1.0; // Standard heat rate
      } else if (tireTypeLower.includes('winter') || tireTypeLower.includes('snow')) {
        tireFactor = 0.8; // Winter tires heat up slower
      }
    }
    
    // Calculate final temp with all factors
    const finalTemp = baseTemp + (roadFactor + drivingFactor) * tireFactor;
    
    // Return the calculated temperature
    return finalTemp;
  };
  
  // Calculate a grip factor based on various weather conditions
  const calculateGripFactor = (
    roadTemp: number, 
    rainIntensity: number, 
    humidity: number,
    tireType: string | null
  ) => {
    // Base grip factor
    let baseFactor = 1.0;
    
    // Adjust for tire type if available
    if (tireType) {
      const tireTypeLower = tireType.toLowerCase();
      if (tireTypeLower.includes('performance') || tireTypeLower.includes('summer')) {
        // Performance tires: great in dry, poor in wet
        baseFactor = rainIntensity > 0 ? 0.7 : 1.2;
      } else if (tireTypeLower.includes('all season') || tireTypeLower.includes('touring')) {
        // All-seasons: decent in all conditions
        baseFactor = 1.0;
      } else if (tireTypeLower.includes('winter') || tireTypeLower.includes('snow')) {
        // Winter tires: better in cold, worse in heat
        baseFactor = roadTemp > 60 ? 0.8 : 1.1;
      }
    }
    
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
    return Math.min(100, Math.max(0, tempFactor * rainFactor * humidityFactor * baseFactor * 100));
  };
  
  // Format temperature with units
  const formatTemp = (temp: number) => {
    return `${temp.toFixed(1)}°${units === 'imperial' ? 'F' : 'C'}`;
  };
  
  // Format wind speed with units
  const formatWindSpeed = (speed: number) => {
    return `${speed.toFixed(1)} ${units === 'imperial' ? 'mph' : 'm/s'}`;
  };
  
  // Format travel time with impact
  const formatTravelTime = (
    baseMinutes: number, 
    weatherImpact: number = 0
  ) => {
    const totalMinutes = baseMinutes + weatherImpact;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Calculate the weather impact on travel time
  const calculateWeatherImpact = (
    baseMinutes: number,
    precipitation: number,
    visibility: number,
    windSpeed: number
  ) => {
    // Calculate individual factors
    const precipFactor = precipitation > 0.5 ? 0.25 : 
                        precipitation > 0.3 ? 0.15 : 
                        precipitation > 0.1 ? 0.05 : 0;
    
    const visFactor = visibility < 2000 ? 0.3 : 
                     visibility < 5000 ? 0.15 : 
                     visibility < 8000 ? 0.05 : 0;
    
    const windFactor = windSpeed > 25 ? 0.1 : 
                      windSpeed > 15 ? 0.05 : 0;
    
    // Calculate total impact percentage
    const totalImpact = precipFactor + visFactor + windFactor;
    
    // Calculate additional minutes
    return Math.round(baseMinutes * totalImpact);
  };
  
  // Get tire info display text based on vehicle data
  const getTireInfoText = () => {
    if (!selectedVehicle || !selectedVehicle.tires || selectedVehicle.tires.length === 0) {
      return "No tire data available";
    }
    
    const tire = selectedVehicle.tires[0]; // Get primary tire info
    
    if (!tire.brand || !tire.model || !tire.type) {
      return "Incomplete tire data";
    }
    
    return `${tire.brand} ${tire.model} (${tire.type})`;
  };
  
  // Get tire type based on vehicle data
  const getSelectedTireType = () => {
    if (!selectedVehicle || !selectedVehicle.tires || selectedVehicle.tires.length === 0) {
      return null;
    }
    
    return selectedVehicle.tires[0].type;
  };
  
  // Get tire brand based on vehicle data
  const getSelectedTireBrand = () => {
    if (!selectedVehicle || !selectedVehicle.tires || selectedVehicle.tires.length === 0) {
      return null;
    }
    
    return selectedVehicle.tires[0].brand;
  };
  
  if (!currentWeather || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-10 h-10 animate-spin text-[#1982FC] mb-2" />
          <p className="text-zinc-500">Loading weather and vehicle data...</p>
        </div>
      </div>
    );
  }
  
  // Extract current weather data
  const airTemp = currentWeather.main.temp;
  const humidity = currentWeather.main.humidity;
  const windSpeed = currentWeather.wind.speed;
  const windDirection = currentWeather.wind.deg;
  const windGust = currentWeather.wind?.gust;
  const clouds = currentWeather.clouds.all;
  const sunriseDt = currentWeather.sys.sunrise;
  const sunsetDt = currentWeather.sys.sunset;
  const currentDt = currentWeather.dt;
  const visibility = currentWeather.visibility;
  const rainIntensity = currentWeather.rain?.['1h'] || 0;
  const snowIntensity = currentWeather.snow?.['1h'] || 0;
  const pressure = currentWeather.main.pressure;
  const uvIndex = oneCallData?.current?.uvi || 0;
  const isDay = currentWeather.weather[0].icon.includes('d');
  const precipProb = oneCallData?.hourly?.[0]?.pop || 0;
  
  // Calculate derived values based on real data
  const sunPosition = isDay ? 0.5 : 0; // Simplified for this example
  const surfaceTemp = calculateSurfaceTemp(airTemp, clouds, sunPosition);
  
  // Get tire-specific data
  const tireType = getSelectedTireType();
  const tireBrand = getSelectedTireBrand();
  
  // Calculate tire temp assuming 0 minutes of driving (starting condition)
  const tireTemp = calculateTireTemp(
    airTemp, 
    surfaceTemp, 
    sunPosition, 
    0,
    tireBrand, 
    tireType
  );
  
  // Calculate grip factor
  const gripFactor = calculateGripFactor(
    surfaceTemp, 
    rainIntensity + (snowIntensity * 1.5), 
    humidity,
    tireType
  );
  
  // Format degrees to cardinal direction
  const getCardinalDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };
  
  // Weather impact for commute route
  const commuteWeatherImpact = selectedCommuteRoute 
    ? calculateWeatherImpact(
        selectedCommuteRoute.estimatedDuration, 
        precipProb, 
        visibility, 
        windSpeed
      )
    : 0;
  
  // Weather impact for fun drive route
  const funDriveWeatherImpact = selectedFunRoute 
    ? calculateWeatherImpact(
        selectedFunRoute.estimatedDuration, 
        precipProb, 
        visibility, 
        windSpeed
      )
    : 0;
  
  // Tire temperature evaluation
  const getTireTempStatus = (temp: number) => {
    if (temp < 60) return { status: 'Cold', color: 'text-blue-500' };
    if (temp < 85) return { status: 'Warming', color: 'text-yellow-500' };
    if (temp < 160) return { status: 'Optimal', color: 'text-green-500' };
    return { status: 'Overheated', color: 'text-red-500' };
  };
  
  const tireTempEval = getTireTempStatus(tireTemp);
  
  // Get a weather-appropriate playlist from real Spotify data
  const getWeatherPlaylist = () => {
    if (playlists.length === 0) return null;
    
    // Find the best matching playlist for the current weather
    const weatherType = currentWeather.weather[0].main.toLowerCase();
    const energyLevel = isDay ? 0.7 : 0.4; // Higher energy during day
    
    // Find matching playlists, prioritize weather match then energy level
    const matchingPlaylists = playlists.filter(p => 
      p.weatherType.toLowerCase().includes(weatherType)
    );
    
    if (matchingPlaylists.length > 0) {
      // Sort by closest energy match
      matchingPlaylists.sort((a, b) => 
        Math.abs(a.energyLevel - energyLevel) - Math.abs(b.energyLevel - energyLevel)
      );
      return matchingPlaylists[0];
    }
    
    // If no direct weather match, fallback to general mood based on conditions
    return playlists[0]; // First playlist (should be sorted by relevance from API)
  };
  
  const recommendedPlaylist = getWeatherPlaylist();
  
  return (
    <div className="space-y-4">
      {/* Primary Dashboard Header with User's Vehicle Info */}
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Gauge className="mr-2 h-5 w-5 text-[#1982FC]" /> 
              F1 Weather Paddock
            </CardTitle>
            <Badge 
              variant="outline" 
              className="bg-[#08c519]/20 text-[#08c519] border-[#08c519]/30"
            >
              Real-Time Telemetry
            </Badge>
          </div>
          <CardDescription className="flex justify-between items-center">
            <span>{selectedLocation?.name} — {new Date().toLocaleDateString()}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1"
              onClick={() => refreshWeather()}
            >
              <RefreshCw className="h-3 w-3" /> 
              {15 - Math.floor(weatherRefreshTimer / 60)}m
            </Button>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          {/* Vehicle Selector & Information */}
          <Collapsible 
            open={expandedVehicleInfo} 
            onOpenChange={setExpandedVehicleInfo}
            className="mb-4"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-zinc-800 mr-3">
                    <Car className="h-5 w-5 text-[#1982FC]" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'No Vehicle Selected'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {selectedVehicle ? getTireInfoText() : 'Add a vehicle to get tire-specific recommendations'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-zinc-500 transition-transform ${expandedVehicleInfo ? 'transform rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3 p-3 bg-zinc-900/40 rounded-md">
              {userVehicles.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Select Vehicle</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {userVehicles.map(vehicle => (
                        <div 
                          key={vehicle.id}
                          className={`p-2 rounded-md border flex items-center cursor-pointer ${
                            selectedVehicle?.id === vehicle.id ? 'border-[#1982FC] bg-[#1982FC]/10' : 'border-zinc-800 hover:border-zinc-700'
                          }`}
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <Car className="h-4 w-4 mr-2 text-zinc-400" />
                          <div className="flex-1">
                            <div className="text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                            {vehicle.vin && (
                              <div className="text-xs text-zinc-500 flex items-center">
                                VIN: {vehicle.vin.substring(vehicle.vin.length - 6)}
                                <Copy className="h-3 w-3 ml-1 text-zinc-600 cursor-pointer" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedVehicle && selectedVehicle.tires && selectedVehicle.tires.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Tire Information</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-xs text-zinc-400">Brand/Model:</div>
                        <div className="text-xs">{selectedVehicle.tires[0].brand} {selectedVehicle.tires[0].model}</div>
                        <div className="text-xs text-zinc-400">Type:</div>
                        <div className="text-xs">{selectedVehicle.tires[0].type}</div>
                        <div className="text-xs text-zinc-400">Installed:</div>
                        <div className="text-xs">
                          {selectedVehicle.tires[0].installedAt ? 
                            new Date(selectedVehicle.tires[0].installedAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-zinc-400">No vehicles found in your garage</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Current Conditions - F1 Telemetry Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-zinc-900/60 p-3 rounded-md flex flex-col items-center">
              <div className="text-xs text-zinc-500 mb-1 flex items-center">
                <Thermometer className="w-3 h-3 mr-1" /> Air Temp
              </div>
              <div className="text-2xl font-bold">{formatTemp(airTemp)}</div>
              <div className="text-xs text-zinc-400 mt-1">
                Feels like {formatTemp(currentWeather.main.feels_like)}
              </div>
            </div>
            
            <div className="bg-zinc-900/60 p-3 rounded-md flex flex-col items-center">
              <div className="text-xs text-zinc-500 mb-1 flex items-center">
                <Flame className="w-3 h-3 mr-1" /> Surface Temp
              </div>
              <div className="text-2xl font-bold">{formatTemp(surfaceTemp)}</div>
              <div className="text-xs text-zinc-400 mt-1">
                {tireBrand ? `${tireBrand} tires` : 'Road surface'}
              </div>
            </div>
            
            <div className="bg-zinc-900/60 p-3 rounded-md flex flex-col items-center">
              <div className="text-xs text-zinc-500 mb-1 flex items-center">
                <Navigation className="w-3 h-3 mr-1" /> Grip Level
              </div>
              <div className="text-2xl font-bold" style={{ color: gripFactor > 80 ? '#08c519' : gripFactor > 60 ? '#ffb020' : '#ff4444' }}>
                {Math.round(gripFactor)}%
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {tireType ? `${tireType} compound` : 'Standard estimate'}
              </div>
            </div>
            
            <div className="bg-zinc-900/60 p-3 rounded-md flex flex-col items-center">
              <div className="text-xs text-zinc-500 mb-1 flex items-center">
                <Wind className="w-3 h-3 mr-1" /> Wind
              </div>
              <div className="text-2xl font-bold">{formatWindSpeed(windSpeed)}</div>
              <div className="text-xs text-zinc-400 mt-1">
                {getCardinalDirection(windDirection)} ({windDirection}°)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid grid-cols-4 h-auto p-1">
          <TabsTrigger value="current" className="text-xs py-2">
            <MapPin className="h-3.5 w-3.5 mr-1" /> 
            Current
          </TabsTrigger>
          <TabsTrigger value="commute" className="text-xs py-2">
            <Briefcase className="h-3.5 w-3.5 mr-1" /> 
            Commute
          </TabsTrigger>
          <TabsTrigger value="funDrive" className="text-xs py-2">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> 
            Fun Drive
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-xs py-2">
            <Search className="h-3.5 w-3.5 mr-1" /> 
            Locations
          </TabsTrigger>
        </TabsList>
        
        {/* Current Location Tab */}
        <TabsContent value="current" className="space-y-4">
          <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <MapPinned className="mr-2 h-4 w-4 text-[#1982FC]" /> 
                  Current Location Forecast
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {selectedLocation?.name}
                </Badge>
              </div>
              <CardDescription>
                Detailed forecast for your current position
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Expandable Current Conditions */}
              <Collapsible 
                open={expandedForecast === 'current-conditions'} 
                onOpenChange={(open) => setExpandedForecast(open ? 'current-conditions' : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                        <Thermometer className="h-4 w-4 text-[#1982FC]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Current Conditions</h3>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 text-right">
                        <div className="text-sm font-medium">{formatTemp(airTemp)}</div>
                        <div className="text-xs text-zinc-500">Feels like {formatTemp(currentWeather.main.feels_like)}</div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${expandedForecast === 'current-conditions' ? 'transform rotate-90' : ''}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-4 p-3 bg-zinc-900/40 rounded-md">
                  {/* Telemetry Gauges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/70 p-3 rounded-md">
                      <h4 className="text-xs text-zinc-500 mb-2">Humidity</h4>
                      <div className="flex items-center justify-between">
                        <Droplets className="h-5 w-5 text-blue-400" />
                        <span className="text-xl font-medium">{humidity}%</span>
                      </div>
                      <Progress value={humidity} max={100} className="mt-2 h-1.5" />
                    </div>
                    
                    <div className="bg-zinc-900/70 p-3 rounded-md">
                      <h4 className="text-xs text-zinc-500 mb-2">Visibility</h4>
                      <div className="flex items-center justify-between">
                        <SunMedium className="h-5 w-5 text-yellow-400" />
                        <span className="text-xl font-medium">{(visibility / 1000).toFixed(1)} km</span>
                      </div>
                      <Progress value={Math.min(visibility / 10000 * 100, 100)} max={100} className="mt-2 h-1.5" />
                    </div>
                    
                    <div className="bg-zinc-900/70 p-3 rounded-md">
                      <h4 className="text-xs text-zinc-500 mb-2">UV Index</h4>
                      <div className="flex items-center justify-between">
                        <Sun className="h-5 w-5 text-orange-400" />
                        <span className="text-xl font-medium">{uvIndex.toFixed(1)}</span>
                      </div>
                      <Progress 
                        value={Math.min(uvIndex / 12 * 100, 100)} 
                        max={100} 
                        className={`mt-2 h-1.5 ${
                          uvIndex > 8 ? 'bg-red-900' : 
                          uvIndex > 5 ? 'bg-orange-900' : 
                          uvIndex > 2 ? 'bg-yellow-900' : 'bg-green-900'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {/* Weather Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Cloud Cover:</span>
                        <span>{clouds}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Pressure:</span>
                        <span>{pressure} hPa</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Sunrise:</span>
                        <span>{new Date(sunriseDt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Sunset:</span>
                        <span>{new Date(sunsetDt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Wind Gust:</span>
                        <span>{windGust ? formatWindSpeed(windGust) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Precipitation:</span>
                        <span>
                          {rainIntensity > 0 ? `${rainIntensity} mm rain` : 
                           snowIntensity > 0 ? `${snowIntensity} mm snow` : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Chance of Precip:</span>
                        <span>{Math.round(precipProb * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Surface Grip:</span>
                        <span className={gripFactor > 80 ? 'text-green-500' : gripFactor > 60 ? 'text-yellow-500' : 'text-red-500'}>
                          {gripFactor > 80 ? 'Excellent' : gripFactor > 60 ? 'Good' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Surface Condition Meter */}
                  <div className="bg-zinc-900/70 p-3 rounded-md">
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
                </CollapsibleContent>
              </Collapsible>
              
              {/* Expandable Hourly Forecast */}
              <Collapsible 
                open={expandedForecast === 'current-hourly'} 
                onOpenChange={(open) => setExpandedForecast(open ? 'current-hourly' : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                        <Clock className="h-4 w-4 text-[#1982FC]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Hourly Forecast</h3>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 text-right">
                        <div className="text-sm font-medium">Next 24h</div>
                        <div className="text-xs text-zinc-500">Hour-by-hour details</div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${expandedForecast === 'current-hourly' ? 'transform rotate-90' : ''}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-3 bg-zinc-900/40 rounded-md">
                  {oneCallData && oneCallData.hourly ? (
                    <div className="overflow-x-auto">
                      <div className="inline-flex min-w-max">
                        {oneCallData.hourly.slice(0, 24).map((hour, index) => {
                          const time = new Date(hour.dt * 1000);
                          const temp = hour.temp;
                          const weatherIcon = hour.weather[0].icon;
                          const weatherMain = hour.weather[0].main;
                          const pop = hour.pop || 0;
                          
                          return (
                            <div key={index} className="w-20 p-2 text-center">
                              <div className="text-xs text-zinc-500">
                                {index === 0 ? 'Now' : time.getHours() + ':00'}
                              </div>
                              <div className="my-2">
                                {(() => {
                                  if (weatherMain === 'Rain') {
                                    return <CloudRain className="h-6 w-6 mx-auto text-[#1982FC]" />;
                                  } else if (weatherMain === 'Snow') {
                                    return <CloudSnow className="h-6 w-6 mx-auto text-[#1982FC]" />;
                                  } else if (weatherMain === 'Clear') {
                                    return <SunMedium className="h-6 w-6 mx-auto text-yellow-500" />;
                                  } else {
                                    return <Cloud className="h-6 w-6 mx-auto text-zinc-400" />;
                                  }
                                })()}
                              </div>
                              <div className="text-sm font-medium">
                                {formatTemp(temp)}
                              </div>
                              {pop > 0 && (
                                <div className="text-xs text-blue-400">
                                  {Math.round(pop * 100)}%
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-zinc-500">
                      Hourly forecast data unavailable
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
              
              {/* Expandable 5-Day Forecast */}
              <Collapsible 
                open={expandedForecast === 'current-daily'} 
                onOpenChange={(open) => setExpandedForecast(open ? 'current-daily' : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                        <Calendar className="h-4 w-4 text-[#1982FC]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">5-Day Forecast</h3>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 text-right">
                        <div className="text-sm font-medium">Extended View</div>
                        <div className="text-xs text-zinc-500">Plan ahead with confidence</div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${expandedForecast === 'current-daily' ? 'transform rotate-90' : ''}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-3 bg-zinc-900/40 rounded-md">
                  {oneCallData && oneCallData.daily ? (
                    <div className="grid grid-cols-5 gap-2">
                      {oneCallData.daily.slice(0, 5).map((day, index) => {
                        const date = new Date(day.dt * 1000);
                        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                        const weatherMain = day.weather[0].main;
                        const maxTemp = day.temp.max;
                        const minTemp = day.temp.min;
                        const pop = day.pop || 0;
                        
                        return (
                          <div key={index} className="bg-zinc-900/70 p-2 rounded-md">
                            <div className="text-sm font-medium text-center mb-1">
                              {index === 0 ? 'Today' : dayName}
                            </div>
                            <div className="flex justify-center my-2">
                              {(() => {
                                if (weatherMain === 'Rain') {
                                  return <CloudRain className="h-6 w-6 text-[#1982FC]" />;
                                } else if (weatherMain === 'Snow') {
                                  return <CloudSnow className="h-6 w-6 text-[#1982FC]" />;
                                } else if (weatherMain === 'Clear') {
                                  return <SunMedium className="h-6 w-6 text-yellow-500" />;
                                } else {
                                  return <Cloud className="h-6 w-6 text-zinc-400" />;
                                }
                              })()}
                            </div>
                            <div className="text-center">
                              <div className="text-sm">{formatTemp(maxTemp)}</div>
                              <div className="text-xs text-zinc-500">{formatTemp(minTemp)}</div>
                            </div>
                            {pop > 0 && (
                              <div className="text-xs text-blue-400 text-center mt-1">
                                {Math.round(pop * 100)}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-zinc-500">
                      5-day forecast data unavailable
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
              
              {/* Expandable Aviation Weather */}
              <Collapsible 
                open={expandedForecast === 'current-aviation'} 
                onOpenChange={(open) => setExpandedForecast(open ? 'current-aviation' : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                        <Plane className="h-4 w-4 text-[#1982FC]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Aviation Weather</h3>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2 text-right">
                        <div className="text-sm font-medium">Nearby Flights</div>
                        <div className="text-xs text-zinc-500">Real-time aviation data</div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${expandedForecast === 'current-aviation' ? 'transform rotate-90' : ''}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-3 bg-zinc-900/40 rounded-md">
                  <div className="h-[400px]">
                    <AviationOverlay />
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Spotify Playlist Recommendations */}
              {recommendedPlaylist && (
                <Collapsible 
                  open={expandedPlaylist === 'current-music'} 
                  onOpenChange={(open) => setExpandedPlaylist(open ? 'current-music' : null)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                          <Music className="h-4 w-4 text-[#1982FC]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Weather-Based Music</h3>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 text-right">
                          <div className="text-sm font-medium">Spotify Playlist</div>
                          <div className="text-xs text-zinc-500">Perfect for current conditions</div>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${expandedPlaylist === 'current-music' ? 'transform rotate-90' : ''}`} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-3 p-3 bg-zinc-900/40 rounded-md">
                    <div className="flex gap-3">
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img 
                          src={recommendedPlaylist.imageUrl} 
                          alt={recommendedPlaylist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{recommendedPlaylist.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1">{recommendedPlaylist.description}</p>
                        <div className="flex items-center mt-2">
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                            {currentWeather.weather[0].main}
                          </Badge>
                          <span className="text-xs text-zinc-500 ml-2">Popularity: {recommendedPlaylist.popularity}/100</span>
                        </div>
                        <Button size="sm" className="mt-3 bg-[#1DB954] hover:bg-[#1DB954]/90">
                          <span className="mr-2">Open in Spotify</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-zinc-800">
                      <h4 className="text-xs font-medium mb-2">Why This Playlist?</h4>
                      <p className="text-xs text-zinc-400">
                        {currentWeather.weather[0].main === 'Rain' ? 
                          'The current rainfall creates a perfect atmosphere for this reflective, ambient playlist that matches the mood of wet weather.' : 
                         currentWeather.weather[0].main === 'Clear' && isDay ? 
                          'Clear, sunny conditions pair perfectly with this upbeat, energetic playlist to enhance your drive.' :
                         currentWeather.weather[0].main === 'Clear' && !isDay ? 
                          'Clear night skies call for this atmospheric, moody playlist that complements night driving.' :
                         currentWeather.weather[0].main === 'Clouds' ? 
                          'The current overcast conditions match well with this mid-tempo, atmospheric playlist.' :
                          'This playlist has been specifically selected to match the current weather conditions for an optimal driving experience.'}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Commute Tab */}
        <TabsContent value="commute" className="space-y-4">
          <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Briefcase className="mr-2 h-4 w-4 text-[#1982FC]" /> 
                  Commute Forecast
                </CardTitle>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Route className="h-3.5 w-3.5" /> Select Route
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Select Commute Route</SheetTitle>
                      <SheetDescription>
                        Choose one of your saved commute routes
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-3">
                      {driveRoutes.filter(r => r.type === 'commute').length > 0 ? (
                        driveRoutes.filter(r => r.type === 'commute').map(route => (
                          <div 
                            key={route.id}
                            className={`p-3 rounded-md border flex items-center cursor-pointer ${
                              selectedCommuteRoute?.id === route.id ? 'border-[#1982FC] bg-[#1982FC]/10' : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                            onClick={() => setSelectedCommuteRoute(route)}
                          >
                            <Briefcase className="h-4 w-4 mr-2 text-zinc-400" />
                            <div className="flex-1">
                              <div className="text-sm">{route.name}</div>
                              <div className="text-xs text-zinc-500 flex items-center gap-1">
                                <span>{(route.distance).toFixed(1)} mi</span>
                                <span>•</span>
                                <span>{formatTravelTime(route.estimatedDuration)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-zinc-500">
                          <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No commute routes found</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Route
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <CardDescription>
                {selectedCommuteRoute ? (
                  <span>Weather analysis for {selectedCommuteRoute.name}</span>
                ) : (
                  <span>Select a commute route to view detailed analysis</span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedCommuteRoute ? (
                <>
                  {/* Route and Weather Impact Summary */}
                  <div className="p-3 bg-zinc-900/60 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <Route className="h-4 w-4 mr-1 text-[#1982FC]" /> 
                        Route Impact Summary
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${commuteWeatherImpact < 5 ? 'bg-green-500/20 text-green-500 border-green-500/50' : 
                           commuteWeatherImpact < 15 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 
                           'bg-red-500/20 text-red-500 border-red-500/50'}
                        `}
                      >
                        {commuteWeatherImpact === 0 ? 'No Impact' : `+${commuteWeatherImpact}min`}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">Distance</div>
                        <div className="text-lg font-medium">{selectedCommuteRoute.distance.toFixed(1)}mi</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">Base Time</div>
                        <div className="text-lg font-medium">{formatTravelTime(selectedCommuteRoute.estimatedDuration)}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">Weather Adjusted</div>
                        <div className="text-lg font-medium">
                          {formatTravelTime(selectedCommuteRoute.estimatedDuration, commuteWeatherImpact)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Weather Impact Factors */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium mb-1">Impact Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {precipProb > 0.3 && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
                            <CloudRain className="h-3 w-3 mr-1" /> 
                            {Math.round(precipProb * 100)}% precipitation
                          </Badge>
                        )}
                        
                        {visibility < 8000 && (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30 text-xs">
                            <SunMedium className="h-3 w-3 mr-1" /> 
                            Reduced visibility
                          </Badge>
                        )}
                        
                        {windSpeed > 15 && (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30 text-xs">
                            <Wind className="h-3 w-3 mr-1" /> 
                            {formatWindSpeed(windSpeed)} winds
                          </Badge>
                        )}
                        
                        {airTemp < 32 && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
                            <Thermometer className="h-3 w-3 mr-1" /> 
                            Freezing conditions
                          </Badge>
                        )}
                        
                        {commuteWeatherImpact === 0 && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> 
                            Optimal conditions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable Hourly Forecast Along Commute */}
                  <Collapsible 
                    open={expandedForecast === 'commute-hourly'} 
                    onOpenChange={(open) => setExpandedForecast(open ? 'commute-hourly' : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                        <div className="flex items-center">
                          <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                            <Clock className="h-4 w-4 text-[#1982FC]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Hourly Commute Forecast</h3>
                          </div>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${expandedForecast === 'commute-hourly' ? 'transform rotate-90' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-3 bg-zinc-900/40 rounded-md">
                      {oneCallData && oneCallData.hourly ? (
                        <div className="overflow-x-auto">
                          <div className="inline-flex min-w-max">
                            {oneCallData.hourly.slice(0, 12).map((hour, index) => {
                              const time = new Date(hour.dt * 1000);
                              const temp = hour.temp;
                              const weatherIcon = hour.weather[0].icon;
                              const weatherMain = hour.weather[0].main;
                              const pop = hour.pop || 0;
                              
                              return (
                                <div key={index} className="w-20 p-2 text-center">
                                  <div className="text-xs text-zinc-500">
                                    {index === 0 ? 'Now' : time.getHours() + ':00'}
                                  </div>
                                  <div className="my-2">
                                    {(() => {
                                      if (weatherMain === 'Rain') {
                                        return <CloudRain className="h-6 w-6 mx-auto text-[#1982FC]" />;
                                      } else if (weatherMain === 'Snow') {
                                        return <CloudSnow className="h-6 w-6 mx-auto text-[#1982FC]" />;
                                      } else if (weatherMain === 'Clear') {
                                        return <SunMedium className="h-6 w-6 mx-auto text-yellow-500" />;
                                      } else {
                                        return <Cloud className="h-6 w-6 mx-auto text-zinc-400" />;
                                      }
                                    })()}
                                  </div>
                                  <div className="text-sm font-medium">
                                    {formatTemp(temp)}
                                  </div>
                                  {pop > 0 && (
                                    <div className="text-xs text-blue-400">
                                      {Math.round(pop * 100)}%
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-zinc-500">
                          Hourly forecast data unavailable
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Commute Recommendations */}
                  <div className="p-3 bg-zinc-900/60 rounded-md">
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Settings className="h-4 w-4 mr-1 text-[#1982FC]" /> 
                      Commute Recommendations
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Thermometer className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium">Climate Control</h4>
                          <p className="text-xs text-zinc-400">
                            {airTemp > 80 ? 
                              "Pre-cool your vehicle before departure. Set A/C to 72-74°F for optimal comfort." : 
                             airTemp < 40 ? 
                              "Pre-heat your vehicle 5-10 minutes before departure. Allow extra warm-up time in these cold conditions." : 
                              "Moderate temperatures today. Standard climate settings recommended for comfort."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium">Timing</h4>
                          <p className="text-xs text-zinc-400">
                            {commuteWeatherImpact > 15 ? 
                              `Allow an extra ${commuteWeatherImpact} minutes for your commute today due to weather conditions.` : 
                             commuteWeatherImpact > 5 ? 
                              `Expect minor delays (${commuteWeatherImpact} minutes) due to current weather conditions.` : 
                              "Weather conditions are favorable for a standard commute time today."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Navigation className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium">Driving Style</h4>
                          <p className="text-xs text-zinc-400">
                            {precipProb > 0.5 || visibility < 5000 ? 
                              "Reduce speed and increase following distance due to reduced visibility or wet conditions." : 
                             windSpeed > 20 ? 
                              "Be prepared for gusting winds on your route. Maintain a firm grip on the steering wheel." : 
                              "Standard driving protocols appropriate for today's conditions."}
                          </p>
                        </div>
                      </div>
                      
                      {selectedVehicle && (
                        <div className="flex items-start">
                          <Car className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium">Vehicle Specific</h4>
                            <p className="text-xs text-zinc-400">
                              {tireType && tireType.toLowerCase().includes('summer') && airTemp < 45 ? 
                                "Your summer performance tires may have reduced grip in these cold temperatures. Drive with extra caution." : 
                               tireType && tireType.toLowerCase().includes('winter') && airTemp > 60 ? 
                                "Your winter tires may experience accelerated wear in these warm temperatures." : 
                                `Your ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} is well-suited for today's commute conditions.`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                  <h3 className="text-lg font-medium mb-1">No Commute Route Selected</h3>
                  <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
                    Select one of your saved commute routes to view detailed weather impact analysis and recommendations.
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button>
                        <Route className="h-4 w-4 mr-2" /> Select Commute Route
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Select Commute Route</SheetTitle>
                        <SheetDescription>
                          Choose one of your saved commute routes
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-3">
                        {driveRoutes.filter(r => r.type === 'commute').length > 0 ? (
                          driveRoutes.filter(r => r.type === 'commute').map(route => (
                            <div 
                              key={route.id}
                              className="p-3 rounded-md border border-zinc-800 flex items-center cursor-pointer hover:border-zinc-700"
                              onClick={() => setSelectedCommuteRoute(route)}
                            >
                              <Briefcase className="h-4 w-4 mr-2 text-zinc-400" />
                              <div className="flex-1">
                                <div className="text-sm">{route.name}</div>
                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                  <span>{(route.distance).toFixed(1)} mi</span>
                                  <span>•</span>
                                  <span>{formatTravelTime(route.estimatedDuration)}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-zinc-500">
                            <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No commute routes found</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add Route
                            </Button>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Fun Drive Tab */}
        <TabsContent value="funDrive" className="space-y-4">
          <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="mr-2 h-4 w-4 text-[#1982FC]" /> 
                  Fun Drive Forecast
                </CardTitle>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Route className="h-3.5 w-3.5" /> Select Route
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Select Fun Drive Route</SheetTitle>
                      <SheetDescription>
                        Choose one of your saved scenic or performance routes
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-3">
                      {driveRoutes.filter(r => r.type === 'fun').length > 0 ? (
                        driveRoutes.filter(r => r.type === 'fun').map(route => (
                          <div 
                            key={route.id}
                            className={`p-3 rounded-md border flex items-center cursor-pointer ${
                              selectedFunRoute?.id === route.id ? 'border-[#1982FC] bg-[#1982FC]/10' : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                            onClick={() => setSelectedFunRoute(route)}
                          >
                            <Sparkles className="h-4 w-4 mr-2 text-zinc-400" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="text-sm">{route.name}</span>
                                {route.favorite && (
                                  <span className="ml-1 text-yellow-500">★</span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-500 flex items-center gap-1">
                                <span>{(route.distance).toFixed(1)} mi</span>
                                <span>•</span>
                                <span>{formatTravelTime(route.estimatedDuration)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-zinc-500">
                          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No fun drive routes found</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Fun Route
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <CardDescription>
                {selectedFunRoute ? (
                  <span>Performance driving forecast for {selectedFunRoute.name}</span>
                ) : (
                  <span>Select a fun drive route to view detailed performance analysis</span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedFunRoute ? (
                <>
                  {/* Performance Driving Conditions */}
                  <div className="p-3 bg-zinc-900/60 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <Gauge className="h-4 w-4 mr-1 text-[#1982FC]" /> 
                        Performance Driving Conditions
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${gripFactor > 85 ? 'bg-green-500/20 text-green-500 border-green-500/50' : 
                           gripFactor > 70 ? 'bg-blue-500/20 text-blue-500 border-blue-500/50' : 
                           gripFactor > 50 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 
                           'bg-red-500/20 text-red-500 border-red-500/50'}
                        `}
                      >
                        {gripFactor > 85 ? 'Excellent' : 
                         gripFactor > 70 ? 'Good' : 
                         gripFactor > 50 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">Grip Level</div>
                        <div className="text-lg font-medium">{Math.round(gripFactor)}%</div>
                        <Progress value={gripFactor} max={100} className="mt-1 h-1" />
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">Tire Temp</div>
                        <div className={`text-lg font-medium ${tireTempEval.color}`}>
                          {formatTemp(tireTemp)}
                        </div>
                        <div className="text-xs">{tireTempEval.status}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">Travel Time</div>
                        <div className="text-lg font-medium">
                          {formatTravelTime(selectedFunRoute.estimatedDuration, funDriveWeatherImpact)}
                        </div>
                        {funDriveWeatherImpact > 0 && (
                          <div className="text-xs text-yellow-500">+{funDriveWeatherImpact}m</div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">Precipitation</div>
                        <div className="text-lg font-medium">{Math.round(precipProb * 100)}%</div>
                        <Progress value={precipProb * 100} max={100} className="mt-1 h-1" />
                      </div>
                    </div>
                    
                    {/* Key insights */}
                    <div className="bg-zinc-900/80 p-2 rounded-md space-y-2">
                      <h4 className="text-xs font-medium">Key Performance Insights</h4>
                      <ul className="space-y-1 text-xs">
                        {tireTemp < 85 && (
                          <li className="flex items-start">
                            <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500 mt-0.5" />
                            <span>
                              Tires below optimal temperature. Allow {Math.ceil((85 - tireTemp) / 5)} minutes of warm-up driving.
                            </span>
                          </li>
                        )}
                        
                        {precipProb > 0.3 && (
                          <li className="flex items-start">
                            <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500 mt-0.5" />
                            <span>
                              {Math.round(precipProb * 100)}% precipitation risk reduces available grip and visibility.
                            </span>
                          </li>
                        )}
                        
                        {tireType && tireType.toLowerCase().includes('performance') && airTemp < 45 && (
                          <li className="flex items-start">
                            <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500 mt-0.5" />
                            <span>
                              Performance tires operating below ideal temperature range - reduced grip expected.
                            </span>
                          </li>
                        )}
                        
                        {gripFactor > 80 && precipProb < 0.2 && (
                          <li className="flex items-start">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500 mt-0.5" />
                            <span>
                              Excellent grip conditions for {selectedFunRoute.name} drive.
                            </span>
                          </li>
                        )}
                        
                        {visibility < 8000 && (
                          <li className="flex items-start">
                            <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500 mt-0.5" />
                            <span>
                              Reduced visibility ({(visibility / 1000).toFixed(1)}km) may impact driving enjoyment.
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Expandable Weather Trend for Drive Window */}
                  <Collapsible 
                    open={expandedForecast === 'fundrive-hourly'} 
                    onOpenChange={(open) => setExpandedForecast(open ? 'fundrive-hourly' : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80">
                        <div className="flex items-center">
                          <div className="p-1.5 rounded-full bg-zinc-800 mr-2">
                            <Clock className="h-4 w-4 text-[#1982FC]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Drive Window Forecast</h3>
                          </div>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${expandedForecast === 'fundrive-hourly' ? 'transform rotate-90' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-3 bg-zinc-900/40 rounded-md">
                      {oneCallData && oneCallData.hourly ? (
                        <div className="space-y-4">
                          {/* Hourly Forecast */}
                          <div className="overflow-x-auto">
                            <div className="inline-flex min-w-max">
                              {oneCallData.hourly.slice(0, 12).map((hour, index) => {
                                const time = new Date(hour.dt * 1000);
                                const temp = hour.temp;
                                const weatherMain = hour.weather[0].main;
                                const pop = hour.pop || 0;
                                
                                return (
                                  <div key={index} className="w-20 p-2 text-center">
                                    <div className="text-xs text-zinc-500">
                                      {index === 0 ? 'Now' : time.getHours() + ':00'}
                                    </div>
                                    <div className="my-2">
                                      {(() => {
                                        if (weatherMain === 'Rain') {
                                          return <CloudRain className="h-6 w-6 mx-auto text-[#1982FC]" />;
                                        } else if (weatherMain === 'Snow') {
                                          return <CloudSnow className="h-6 w-6 mx-auto text-[#1982FC]" />;
                                        } else if (weatherMain === 'Clear') {
                                          return <SunMedium className="h-6 w-6 mx-auto text-yellow-500" />;
                                        } else {
                                          return <Cloud className="h-6 w-6 mx-auto text-zinc-400" />;
                                        }
                                      })()}
                                    </div>
                                    <div className="text-sm font-medium">
                                      {formatTemp(temp)}
                                    </div>
                                    {pop > 0 && (
                                      <div className="text-xs text-blue-400">
                                        {Math.round(pop * 100)}%
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Best Drive Time Recommendation */}
                          <div className="bg-zinc-900/80 p-3 rounded-md">
                            <h4 className="text-sm font-medium mb-2">Best Time for Your Drive</h4>
                            <div className="flex items-center gap-2">
                              <div className="bg-[#08c519]/20 text-[#08c519] p-2 rounded-md flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>
                                  {precipProb < 0.3 && airTemp > 60 && airTemp < 90 ? 
                                   'Current conditions are ideal for your drive!' : 
                                   oneCallData.hourly.slice(0, 24).some(h => h.pop < 0.3 && h.temp > 60 && h.temp < 90) ? 
                                   `${new Date(oneCallData.hourly.find(h => h.pop < 0.3 && h.temp > 60 && h.temp < 90).dt * 1000).getHours()}:00 today` : 
                                   'Tomorrow may offer better conditions'}
                                </span>
                              </div>
                              <div className="text-xs text-zinc-400">
                                {precipProb < 0.3 && airTemp > 60 && airTemp < 90 ? 
                                 'Drive now for optimal enjoyment' : 
                                 'Forecasted window with best grip and visibility'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-zinc-500">
                          Hourly forecast data unavailable
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Performance Driving Recommendations */}
                  <div className="p-3 bg-zinc-900/60 rounded-md">
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Compass className="h-4 w-4 mr-1 text-[#1982FC]" /> 
                      Performance Driving Recommendations
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Car className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium">
                            {selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'Vehicle Setup'}
                          </h4>
                          <p className="text-xs text-zinc-400">
                            {tireType && tireType.toLowerCase().includes('performance') ? (
                              airTemp < 45 ? 
                                "Performance tires will have reduced grip in current cold conditions. Allow extended warm-up period and exercise caution." : 
                                "Your performance tires are well-suited for today's conditions. For best results, gradually build heat through progressive driving."
                            ) : (
                              airTemp < 45 ? 
                                "All-season/touring tires perform better in current cold conditions but have lower ultimate grip than performance compounds." : 
                                "Consider a higher PSI setting (+2-3) for improved response with your all-season/touring tires in these conditions."
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Gauge className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium">Driving Style</h4>
                          <p className="text-xs text-zinc-400">
                            {precipProb > 0.5 ? 
                              "Significant precipitation expected. Conservative driving recommended with smooth inputs and reduced speed." : 
                             precipProb > 0.3 ? 
                              "Moderate precipitation risk. Adjust braking points earlier and be progressive with throttle application." : 
                             gripFactor < 60 ? 
                              "Lower grip conditions today. Focus on smooth driving technique and avoid aggressive cornering." : 
                              "Excellent grip conditions available. Standard performance driving techniques applicable with proper tire warm-up."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Route className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium">Route Specific</h4>
                          <p className="text-xs text-zinc-400">
                            {selectedFunRoute.name} ({selectedFunRoute.distance.toFixed(1)} miles) has 
                            {funDriveWeatherImpact > 20 ? 
                              ` significantly compromised conditions with expected delays of ${funDriveWeatherImpact} minutes. Consider postponing or selecting a shorter route.` : 
                             funDriveWeatherImpact > 10 ? 
                              ` moderately compromised conditions with expected delays of ${funDriveWeatherImpact} minutes. Proceed with caution and allow extra time.` : 
                              ` favorable conditions today with minimal weather impact. Enjoy your drive!`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Music className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium">Complementary Music</h4>
                          <p className="text-xs text-zinc-400">
                            {recommendedPlaylist ? 
                              `"${recommendedPlaylist.name}" playlist recommended for today's ${currentWeather.weather[0].main.toLowerCase()} conditions.` : 
                              "Music recommendations unavailable. Connect Spotify for weather-matched playlists."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                  <h3 className="text-lg font-medium mb-1">No Fun Drive Route Selected</h3>
                  <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
                    Select one of your saved fun or performance drive routes to view detailed weather analysis and recommendations.
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button>
                        <Route className="h-4 w-4 mr-2" /> Select Fun Drive
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Select Fun Drive Route</SheetTitle>
                        <SheetDescription>
                          Choose one of your saved scenic or performance routes
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-3">
                        {driveRoutes.filter(r => r.type === 'fun').length > 0 ? (
                          driveRoutes.filter(r => r.type === 'fun').map(route => (
                            <div 
                              key={route.id}
                              className="p-3 rounded-md border border-zinc-800 flex items-center cursor-pointer hover:border-zinc-700"
                              onClick={() => setSelectedFunRoute(route)}
                            >
                              <Sparkles className="h-4 w-4 mr-2 text-zinc-400" />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="text-sm">{route.name}</span>
                                  {route.favorite && (
                                    <span className="ml-1 text-yellow-500">★</span>
                                  )}
                                </div>
                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                  <span>{(route.distance).toFixed(1)} mi</span>
                                  <span>•</span>
                                  <span>{formatTravelTime(route.estimatedDuration)}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-zinc-500">
                            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No fun drive routes found</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add Fun Route
                            </Button>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Search className="mr-2 h-4 w-4 text-[#1982FC]" /> 
                  Location Search
                </CardTitle>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">History</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Recent Locations</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {locationHistory && locationHistory.length > 0 ? (
                        locationHistory.map(loc => (
                          <DropdownMenuItem 
                            key={loc.id}
                            onClick={() => getWeather(loc.lat, loc.lon)}
                          >
                            <MapPin className="h-4 w-4 mr-2" /> {loc.name}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>No recent locations</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription>
                Check weather at specific locations
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search for a location..." 
                    className="w-full pl-8 pr-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1982FC] focus:border-[#1982FC]"
                  />
                </div>
                <Button className="bg-[#1982FC]">
                  Search
                </Button>
              </div>
              
              {/* Location History Grid */}
              <div>
                <h3 className="text-sm font-medium mb-3">Recent Locations</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {locationHistory && locationHistory.slice(0, 8).map(loc => (
                    <div 
                      key={loc.id}
                      className="p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80"
                      onClick={() => getWeather(loc.lat, loc.lon)}
                    >
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 text-[#1982FC] mt-0.5" />
                        <div>
                          <div className="text-sm font-medium truncate">{loc.name}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Favorite Locations */}
              <div>
                <h3 className="text-sm font-medium mb-3">Favorite Locations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {driveRoutes.filter(r => r.favorite).slice(0, 4).map(route => (
                    <div 
                      key={route.id}
                      className="p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80"
                      onClick={() => getWeather(route.endLat, route.endLon)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex">
                          <Route className="h-4 w-4 mr-1 text-[#1982FC] mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">{route.name}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              {route.distance.toFixed(1)} miles • {formatTravelTime(route.estimatedDuration)}
                            </div>
                          </div>
                        </div>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Popular Driving Roads */}
              <div>
                <h3 className="text-sm font-medium mb-3">Popular Driving Roads</h3>
                <div className="space-y-2">
                  <div 
                    className="p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80"
                    onClick={() => searchLocation("Tail of the Dragon, TN")}
                  >
                    <div className="flex justify-between">
                      <div className="flex">
                        <Route className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <div className="font-medium">Tail of the Dragon</div>
                          <div className="text-xs text-zinc-500">
                            318 curves in 11 miles • Tennessee/North Carolina
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Search className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    className="p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80"
                    onClick={() => searchLocation("Pacific Coast Highway, California")}
                  >
                    <div className="flex justify-between">
                      <div className="flex">
                        <Route className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <div className="font-medium">Pacific Coast Highway</div>
                          <div className="text-xs text-zinc-500">
                            655 miles • California
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Search className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    className="p-3 bg-zinc-900/60 rounded-md cursor-pointer hover:bg-zinc-900/80"
                    onClick={() => searchLocation("Blue Ridge Parkway, Virginia")}
                  >
                    <div className="flex justify-between">
                      <div className="flex">
                        <Route className="h-4 w-4 mr-2 text-[#1982FC] mt-0.5" />
                        <div>
                          <div className="font-medium">Blue Ridge Parkway</div>
                          <div className="text-xs text-zinc-500">
                            469 miles • Virginia/North Carolina
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Search className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Music Recommendations */}
      {recommendedPlaylist && (
        <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Music className="mr-2 h-4 w-4 text-[#1982FC]" /> 
              Weather-Based Music
            </CardTitle>
            <CardDescription>
              Spotify playlists perfectly matched to current conditions
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-4">
            <div className="flex gap-3 items-center">
              <div className="w-20 h-20 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
                <img 
                  src={recommendedPlaylist.imageUrl} 
                  alt={recommendedPlaylist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{recommendedPlaylist.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{recommendedPlaylist.description}</p>
                <div className="flex items-center mt-2 gap-2">
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                    {currentWeather.weather[0].main}
                  </Badge>
                  <Button size="sm" className="bg-[#1DB954] hover:bg-[#1DB954]/90">
                    <span className="text-xs">Play on Spotify</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherPaddockDashboard;
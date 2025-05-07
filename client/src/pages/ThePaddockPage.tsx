import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useLocation } from 'wouter';

// Hooks and Contexts
import { useWeather } from '@/contexts/FixedWeatherContext';
import { useVehicle } from '@/hooks/useVehicle';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Widgets
import F1TelemetryWidget from '@/components/dashboard/widgets/F1TelemetryWidget';

// Icons
import {
  Car, Calendar, Gauge, Users, LayoutDashboard, Heart, BarChart3, 
  Cloud, Droplets, Wind, Sun, CloudRain, CloudSnow, Thermometer,
  AlertTriangle, Wrench, CloudLightning, Clock, Map, FileText,
  Filter, Award, Music, PlaneLanding, CircleDollarSign, Star, Check,
  CalendarClock, BookOpen, Share2, Camera, MessageSquare, List
} from 'lucide-react';

// Utils and Services
import DataSourceConnector from '@/services/DataSourceConnector';

/**
 * The Paddock Page - Main hub for the application
 * A consolidated command center for all user and vehicle information
 * Combines functionality from Dashboard, Garage Vault, Profile, and other pages
 */
const ThePaddockPage = () => {
  // Get user data
  const { user } = useAuth();
  
  // Get navigation function from wouter
  const [, navigate] = useLocation();
  
  // Format date in F1-style
  const formattedDate = format(new Date(), 'MMMM d, yyyy');
  
  // Weather context
  const { currentWeather, forecastWeather, isLoading: weatherLoading } = useWeather();

  // Vehicle data
  const { vehicles, isLoading: vehicleLoading } = useVehicle();

  // Stats from data stores
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDrives: 0,
    maintenanceAlerts: 0,
    upcomingEvents: 0,
    drivingScore: 0,
    goalProgress: 0
  });

  // Mock data for drive quality rating based on weather
  const [driveQuality, setDriveQuality] = useState({
    rating: 0,
    description: "Calculating...",
    factors: []
  });

  // Load data from all contexts
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Initialize all data connections
        DataSourceConnector.initializeDataConnections();
        
        // Get user drive data (safely)
        let driveData = [];
        try {
          driveData = await DataSourceConnector.getUserDriveData() || [];
        } catch (e) {
          console.warn('Error loading drive data:', e);
        }
        
        // Get events data (safely)
        let events = [];
        try {
          events = await DataSourceConnector.getUserEventsData() || [];
        } catch (e) {
          console.warn('Error loading events data:', e);
        }
        
        // Get dream data (safely)
        let dreams = [];
        try {
          dreams = await DataSourceConnector.getUserDreamData() || [];
        } catch (e) {
          console.warn('Error loading dream data:', e);
        }
        
        // Calculate maintenance alerts based on a default value
        // Instead of directly calling DataSourceConnector.getMaintenanceAlerts()
        const maintenanceAlerts = Math.floor(Math.random() * 3); // 0-2 alerts as placeholder
        
        // Update stats safely
        setStats({
          totalVehicles: vehicles?.length || 0,
          totalDrives: driveData?.length || 0,
          maintenanceAlerts: maintenanceAlerts,
          upcomingEvents: events?.length || 0,
          drivingScore: Math.floor(Math.random() * 100), // This would come from actual data
          goalProgress: Math.floor(Math.random() * 100)  // This would come from actual data
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, [vehicles]);

  // Calculate drive quality based on weather data
  useEffect(() => {
    if (currentWeather) {
      let rating = 0;
      const factors = [];
      
      // Temperature factor (65-75°F / 18-24°C is ideal)
      const temp = currentWeather.main?.temp;
      if (temp > 18 && temp < 24) {
        rating += 30;
        factors.push("Perfect temperature");
      } else if (temp > 10 && temp < 30) {
        rating += 20;
        factors.push("Good temperature");
      } else {
        rating += 5;
        factors.push("Challenging temperature");
      }
      
      // Precipitation factor
      const rain = currentWeather.rain?.["1h"] || 0;
      const snow = currentWeather.snow?.["1h"] || 0;
      if (rain === 0 && snow === 0) {
        rating += 30;
        factors.push("Dry conditions");
      } else if (rain < 1 && snow === 0) {
        rating += 15;
        factors.push("Light rain");
      } else {
        rating += 5;
        factors.push("Wet conditions");
      }
      
      // Wind factor (less than 10mph/16kph is ideal)
      const wind = currentWeather.wind?.speed || 0;
      if (wind < 5) {
        rating += 20;
        factors.push("Calm winds");
      } else if (wind < 10) {
        rating += 15;
        factors.push("Light breeze");
      } else {
        rating += 5;
        factors.push("Windy conditions");
      }
      
      // Visibility factor
      const visibility = currentWeather.visibility || 0;
      if (visibility > 8000) {
        rating += 20;
        factors.push("Excellent visibility");
      } else if (visibility > 4000) {
        rating += 15;
        factors.push("Good visibility");
      } else {
        rating += 5;
        factors.push("Limited visibility");
      }
      
      // Set description based on rating
      let description = "Poor";
      if (rating >= 90) description = "Perfect";
      else if (rating >= 75) description = "Excellent";
      else if (rating >= 60) description = "Good";
      else if (rating >= 45) description = "Fair";
      
      setDriveQuality({
        rating,
        description,
        factors: factors.slice(0, 3) // Top 3 factors
      });
    }
  }, [currentWeather]);

  // Weather icon based on weather code
  const getWeatherIcon = (weatherData) => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) return <Cloud className="h-8 w-8 text-blue-400" />;
    
    const code = weatherData.weather[0].id;
    
    // Thunderstorm
    if (code >= 200 && code < 300) return <CloudLightning className="h-8 w-8 text-purple-400" />;
    // Drizzle or Rain
    if ((code >= 300 && code < 400) || (code >= 500 && code < 600)) return <CloudRain className="h-8 w-8 text-blue-400" />;
    // Snow
    if (code >= 600 && code < 700) return <CloudSnow className="h-8 w-8 text-slate-200" />;
    // Atmosphere (fog, mist, etc)
    if (code >= 700 && code < 800) return <Wind className="h-8 w-8 text-slate-400" />;
    // Clear
    if (code === 800) return <Sun className="h-8 w-8 text-yellow-400" />;
    // Clouds
    return <Cloud className="h-8 w-8 text-slate-400" />;
  };

  // Function to get maintenance status for vehicles
  const getMaintenanceStatus = (vehicle) => {
    // This would come from real vehicle data
    const statuses = ["Due Soon", "Up to Date", "Overdue", "Scheduled"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  // Get badge color for maintenance status
  const getStatusColor = (status) => {
    switch (status) {
      case "Due Soon": return "bg-yellow-600 hover:bg-yellow-700";
      case "Up to Date": return "bg-green-600 hover:bg-green-700";
      case "Overdue": return "bg-red-600 hover:bg-red-700";
      case "Scheduled": return "bg-blue-600 hover:bg-blue-700";
      default: return "bg-slate-600 hover:bg-slate-700";
    }
  };

  // Placeholder vehicle data
  const demoVehicles = [
    {
      id: 1,
      name: "Daily Driver",
      make: "BMW",
      model: "M3",
      year: 2023,
      image: null,
    },
    {
      id: 2,
      name: "Weekend Warrior",
      make: "Porsche",
      model: "911",
      year: 2022,
      image: null,
    }
  ];

  // Placeholder goals data
  const demoGoals = [
    { id: 1, title: "Upgrade suspension", progress: 75, category: "Modification" },
    { id: 2, title: "Track day at Laguna Seca", progress: 30, category: "Experience" },
    { id: 3, title: "Full exterior detail", progress: 100, category: "Maintenance" }
  ];

  // Placeholder events data
  const demoEvents = [
    { id: 1, title: "Formula 1: Miami Grand Prix", date: "2025-05-15", type: "Motorsport" },
    { id: 2, title: "Cars & Coffee", date: "2025-05-10", type: "Local", location: "Downtown" },
    { id: 3, title: "Scheduled Maintenance", date: "2025-05-20", type: "Personal", vehicle: "Daily Driver" }
  ];

  // Get actual vehicles or use demo data if none exist
  const displayVehicles = vehicles?.length > 0 ? vehicles : demoVehicles;
  
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header with title and user greeting */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="font-orbitron text-4xl mb-1 bg-gradient-to-br from-[#1982FC] to-[#08c519] bg-clip-text text-transparent">
                THE PADDOCK
              </h1>
              <p className="text-gray-400">
                {formattedDate} • Your personal motorsport command center
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              {user && (
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/assets/avatar.png" />
                    <AvatarFallback className="bg-blue-900 text-white">
                      {user.username?.substring(0, 2).toUpperCase() || 'P2'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username || 'Driver'}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-[#1982FC] text-white text-xs font-medium">
                        PADDOCK20 BETA
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Vehicles</p>
                <p className="text-2xl font-semibold">{stats.totalVehicles}</p>
              </div>
              <Car className="h-8 w-8 text-[#1982FC]" />
            </CardContent>
          </Card>
          
          <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Maintenance</p>
                <p className="text-2xl font-semibold">{stats.maintenanceAlerts}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${stats.maintenanceAlerts > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
            </CardContent>
          </Card>
          
          <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Drives</p>
                <p className="text-2xl font-semibold">{stats.totalDrives}</p>
              </div>
              <Map className="h-8 w-8 text-[#08c519]" />
            </CardContent>
          </Card>
          
          <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Events</p>
                <p className="text-2xl font-semibold">{stats.upcomingEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#1982FC]" />
            </CardContent>
          </Card>
        </div>
        
        {/* Main content in tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Tab list */}
          <TabsList className="grid grid-cols-2 sm:grid-cols-6 bg-gray-900 border border-gray-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#1982FC]/30">
              <LayoutDashboard size={16} className="mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-[#1982FC]/30">
              <Car size={16} className="mr-2" /> Vehicles
            </TabsTrigger>
            <TabsTrigger value="drives" className="data-[state=active]:bg-[#1982FC]/30">
              <Map size={16} className="mr-2" /> Drives
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-[#1982FC]/30">
              <Award size={16} className="mr-2" /> Goals
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#1982FC]/30">
              <Users size={16} className="mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-[#1982FC]/30">
              <BarChart3 size={16} className="mr-2" /> Stats
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Weather and Drive Conditions */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Current Conditions
                        <Badge variant="outline" className="ml-2 bg-[#1982FC]/20 text-[#1982FC] border-[#1982FC]/50">
                          LIVE
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Weather impact on driving experience
                      </CardDescription>
                    </div>
                    {getWeatherIcon(currentWeather)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {weatherLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1982FC]"></div>
                    </div>
                  ) : currentWeather ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xl font-bold">{Math.round(currentWeather.main?.temp)}°C</p>
                          <p className="text-gray-400 capitalize">{currentWeather.weather?.[0]?.description || 'Weather data unavailable'}</p>
                          <p className="text-gray-400 text-sm">
                            {currentWeather.name}, {currentWeather.sys?.country}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Wind size={16} className="text-gray-400" />
                            <span>{Math.round(currentWeather.wind?.speed || 0)} m/s</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Droplets size={16} className="text-gray-400" />
                            <span>{currentWeather.main?.humidity || 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">Drive Quality Rating</p>
                          <Badge className={`
                            ${driveQuality.rating >= 90 ? 'bg-green-600' : 
                              driveQuality.rating >= 75 ? 'bg-emerald-600' : 
                              driveQuality.rating >= 60 ? 'bg-blue-600' : 
                              driveQuality.rating >= 45 ? 'bg-yellow-600' : 'bg-red-600'}
                          `}>
                            {driveQuality.description}
                          </Badge>
                        </div>
                        
                        <Progress 
                          value={driveQuality.rating} 
                          className="h-2 bg-gray-800"
                          indicatorClassName={`
                            ${driveQuality.rating >= 90 ? 'bg-green-500' : 
                              driveQuality.rating >= 75 ? 'bg-emerald-500' : 
                              driveQuality.rating >= 60 ? 'bg-blue-500' : 
                              driveQuality.rating >= 45 ? 'bg-yellow-500' : 'bg-red-500'}
                          `}
                        />
                        
                        <div className="mt-2 text-sm space-y-1">
                          {driveQuality.factors.map((factor, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check size={14} className="text-[#08c519]" />
                              <span className="text-gray-300">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Cloud className="h-10 w-10 text-gray-500 mb-2" />
                      <p className="text-gray-400">Weather data unavailable</p>
                      <p className="text-gray-500 text-sm">Check your location settings</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                    onClick={() => navigate('/weather-paddock')}
                  >
                    <Cloud className="mr-2 h-4 w-4" /> Full Weather Report
                  </Button>
                </CardFooter>
              </Card>
              
              {/* F1 Telemetry Widget */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Live vehicle telemetry</CardDescription>
                </CardHeader>
                <CardContent>
                  <F1TelemetryWidget compact />
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
                    onClick={() => navigate('/telemetry')}
                  >
                    <Gauge className="mr-2 h-4 w-4" /> Full Telemetry
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Vehicle Summary */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Vehicle Summary</CardTitle>
                      <CardDescription>Your automotive collection</CardDescription>
                    </div>
                    <Badge>{displayVehicles.length} Vehicles</Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {vehicleLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1982FC]"></div>
                    </div>
                  ) : displayVehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Car className="h-10 w-10 text-gray-500 mb-2" />
                      <p className="text-gray-400">No vehicles added yet</p>
                      <p className="text-gray-500 text-sm">Add your first vehicle to get started</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-56 rounded-md">
                      <div className="space-y-4">
                        {displayVehicles.map((vehicle) => {
                          const status = getMaintenanceStatus(vehicle);
                          const statusColor = getStatusColor(status);
                          
                          return (
                            <div 
                              key={vehicle.id} 
                              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/30 transition-colors cursor-pointer"
                              onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center">
                                  <Car className="h-6 w-6 text-[#1982FC]" />
                                </div>
                                <div>
                                  <p className="font-medium">{vehicle.name || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</p>
                                  <p className="text-sm text-gray-400">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                                </div>
                              </div>
                              <Badge className={statusColor}>
                                {status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    className="bg-[#1982FC] hover:bg-[#1982FC]/90 w-full"
                    onClick={() => navigate('/add-vehicle')}
                  >
                    <Car className="mr-2 h-4 w-4" /> Add Vehicle
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Upcoming Events */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Motorsport and personal calendar</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ScrollArea className="h-56 rounded-md">
                    <div className="space-y-4">
                      {demoEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-800/30 transition-colors cursor-pointer"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center">
                            {event.type === "Motorsport" ? (
                              <Flag className="h-5 w-5 text-red-500" />
                            ) : event.type === "Local" ? (
                              <Users className="h-5 w-5 text-blue-500" />
                            ) : (
                              <CalendarClock className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{event.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                            {event.location && (
                              <p className="text-xs text-gray-500">{event.location}</p>
                            )}
                            {event.vehicle && (
                              <p className="text-xs text-gray-500">Vehicle: {event.vehicle}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
                    onClick={() => navigate('/events')}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> View All Events
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Manifestation Station Summary (Goals) */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle>Automotive Goals</CardTitle>
                  <CardDescription>Your journey tracker from Manifestation Station</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ScrollArea className="h-56 rounded-md">
                    <div className="space-y-5">
                      {demoGoals.map((goal) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{goal.title}</p>
                              <p className="text-xs text-gray-400">{goal.category}</p>
                            </div>
                            <Badge className={goal.progress === 100 ? 'bg-[#08c519]' : 'bg-[#1982FC]'}>
                              {goal.progress}%
                            </Badge>
                          </div>
                          <Progress value={goal.progress} className="h-1 bg-gray-800" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
                    onClick={() => navigate('/manifestation-station')}
                  >
                    <Star className="mr-2 h-4 w-4" /> Manifestation Station
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10" onClick={() => navigate('/fun-drive-planner')}>
                <Map className="mr-2 h-4 w-4" /> Plan a Drive
              </Button>
              <Button variant="outline" className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10" onClick={() => navigate('/drive-journal')}>
                <FileText className="mr-2 h-4 w-4" /> Drive Journal
              </Button>
              <Button variant="outline" className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10" onClick={() => navigate('/juice-box')}>
                <Filter className="mr-2 h-4 w-4" /> Juice Box
              </Button>
              <Button variant="outline" className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10" onClick={() => navigate('/podium-pursuit')}>
                <Award className="mr-2 h-4 w-4" /> Podium Pursuit
              </Button>
            </div>
          </TabsContent>
          
          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <div className="grid gap-6">
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Your Vehicles</CardTitle>
                      <CardDescription>Manage your automotive collection</CardDescription>
                    </div>
                    <Button 
                      className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                      onClick={() => navigate('/add-vehicle')}
                    >
                      <Car className="mr-2 h-4 w-4" /> Add Vehicle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {vehicleLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1982FC]"></div>
                    </div>
                  ) : displayVehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Car className="w-16 h-16 text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Vehicles Added Yet</h3>
                      <p className="text-gray-400 mb-4">Get started by adding your first vehicle</p>
                      <Button 
                        className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                        onClick={() => navigate('/add-vehicle')}
                      >
                        <Car className="mr-2 h-4 w-4" /> Add Vehicle
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {displayVehicles.map((vehicle) => {
                        const status = getMaintenanceStatus(vehicle);
                        const statusColor = getStatusColor(status);
                        
                        return (
                          <Card key={vehicle.id} className="bg-[#252525] border-gray-800 overflow-hidden">
                            <div className="h-40 bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] flex items-center justify-center">
                              <Car className="h-20 w-20 text-[#1982FC]" />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-lg">{vehicle.name || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
                                <Badge className={statusColor}>
                                  {status}
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-sm mb-4">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-500">Last Service</p>
                                  <p>2 months ago</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Mileage</p>
                                  <p>12,450 mi</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Fuel Level</p>
                                  <p>75%</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Health Score</p>
                                  <p>92/100</p>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                                >
                                  Details
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="flex-1 bg-[#1982FC] hover:bg-[#1982FC]/90"
                                  onClick={() => navigate(`/vehicle/${vehicle.id}/maintenance`)}
                                >
                                  Service Log
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Maintenance Overview */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <CardTitle>Maintenance Overview</CardTitle>
                  <CardDescription>Upcoming and recent service items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayVehicles.length === 0 ? (
                      <div className="text-center py-12">
                        <Wrench className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                        <h3 className="text-xl font-medium mb-2">No Maintenance Data</h3>
                        <p className="text-gray-400">Add a vehicle to track maintenance</p>
                      </div>
                    ) : displayVehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="bg-[#252525] border-gray-800">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base flex justify-between">
                            <span>{vehicle.name || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</span>
                            <Badge variant="outline" className="text-xs font-normal">
                              {getMaintenanceStatus(vehicle)}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                                <span>Oil Change</span>
                              </div>
                              <span className="text-gray-400">Due in 1,500 miles</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                <span>Brake Inspection</span>
                              </div>
                              <span className="text-gray-400">Overdue by 500 miles</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>Tire Rotation</span>
                              </div>
                              <span className="text-gray-400">Completed 2 weeks ago</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Drives Tab */}
          <TabsContent value="drives">
            <div className="grid gap-6">
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Drive Journal</CardTitle>
                      <CardDescription>Your automotive memories and experiences</CardDescription>
                    </div>
                    <Button 
                      className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                      onClick={() => navigate('/log-drive')}
                    >
                      <FileText className="mr-2 h-4 w-4" /> Log Drive
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <BookOpen className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium mb-2">Your Drive Journal Awaits</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">Record your memorable drives, track your improvement, and build a rich history of your automotive experiences</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                        onClick={() => navigate('/log-drive')}
                      >
                        <FileText className="mr-2 h-4 w-4" /> Log Your First Drive
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
                        onClick={() => navigate('/fun-drive-planner')}
                      >
                        <Map className="mr-2 h-4 w-4" /> Plan a Drive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Fun Drive Planner Preview */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <CardTitle>Fun Drive Planner</CardTitle>
                  <CardDescription>Discover your perfect driving routes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-md flex flex-col items-center justify-center text-center p-6">
                    <Map className="h-12 w-12 text-[#1982FC] mb-4" />
                    <h3 className="text-xl font-medium mb-2">Drive Route Recommendations</h3>
                    <p className="text-gray-400 mb-6">Get personalized routes based on weather, traffic, and your driving preferences</p>
                    <Button 
                      className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                      onClick={() => navigate('/fun-drive-planner')}
                    >
                      <Map className="mr-2 h-4 w-4" /> Open Fun Drive Planner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Goals Tab */}
          <TabsContent value="goals">
            <div className="grid gap-6">
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Manifestation Station</CardTitle>
                      <CardDescription>Track and visualize your automotive goals</CardDescription>
                    </div>
                    <Button 
                      className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                      onClick={() => navigate('/manifestation-station')}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Goal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {demoGoals.map((goal) => (
                      <Card key={goal.id} className="bg-[#252525] border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{goal.title}</h3>
                              <p className="text-gray-400 text-sm">{goal.category}</p>
                            </div>
                            <Badge className={goal.progress === 100 ? 'bg-[#08c519]' : 'bg-[#1982FC]'}>
                              {goal.progress}%
                            </Badge>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                          
                          <div className="mt-4 flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                            >
                              Update Progress
                            </Button>
                            {goal.progress === 100 && (
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-[#08c519] hover:bg-[#08c519]/90 text-xs"
                              >
                                <Check className="mr-1 h-3 w-3" /> Completed
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Podium Pursuit Preview */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <CardTitle>Podium Pursuit</CardTitle>
                  <CardDescription>Improve your driving skills with structured progression</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-md flex flex-col items-center justify-center text-center p-6">
                    <Award className="h-12 w-12 text-[#1982FC] mb-4" />
                    <h3 className="text-xl font-medium mb-2">Track Your Driver Development</h3>
                    <p className="text-gray-400 mb-6">Build skills, measure your progress, and earn achievements through structured driving challenges</p>
                    <Button 
                      className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                      onClick={() => navigate('/podium-pursuit')}
                    >
                      <Award className="mr-2 h-4 w-4" /> Open Podium Pursuit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Manage your PADDOCK20 identity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src="/assets/avatar.png" />
                      <AvatarFallback className="bg-blue-900 text-white text-2xl">
                        {user?.username?.substring(0, 2).toUpperCase() || 'P2'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-6 flex-1">
                      <div>
                        <h3 className="text-lg font-medium">{user?.username || 'Driver'}</h3>
                        <p className="text-gray-400">PADDOCK20 Member since {format(new Date(), 'MMMM yyyy')}</p>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-gray-400">Username</label>
                          <p>{user?.username || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Email</label>
                          <p>{user?.email || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Member Level</label>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#1982FC]">BETA Tester</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Drive Score</label>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#08c519]">87/100</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <Button 
                          variant="outline" 
                          className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
                          onClick={() => navigate('/settings')}
                        >
                          Edit Profile
                        </Button>
                        <Button 
                          className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                          onClick={() => navigate('/paddock-membership')}
                        >
                          Membership
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Social Sharing */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <CardTitle>Social Integration</CardTitle>
                  <CardDescription>Connect and share your automotive life</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-[#252525] border-gray-800">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-blue-900/30 p-3 rounded-full">
                          <Share2 className="h-6 w-6 text-[#1982FC]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Share Drive Experiences</h3>
                          <p className="text-sm text-gray-400">Export and share your drives on social media</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#252525] border-gray-800">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-900/30 p-3 rounded-full">
                          <Camera className="h-6 w-6 text-[#08c519]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Photo Gallery</h3>
                          <p className="text-sm text-gray-400">Manage your vehicle photo collection</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#252525] border-gray-800">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-yellow-900/30 p-3 rounded-full">
                          <MessageSquare className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Community Forum</h3>
                          <p className="text-sm text-gray-400">Connect with other automotive enthusiasts</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#252525] border-gray-800">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-purple-900/30 p-3 rounded-full">
                          <Music className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Spotify Integration</h3>
                          <p className="text-sm text-gray-400">Sync driving playlists for the perfect soundtrack</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid gap-6">
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <CardTitle>Driving Statistics</CardTitle>
                  <CardDescription>Your automotive metrics and analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.totalDrives === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                      <Gauge className="w-16 h-16 text-gray-500 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Stats Available</h3>
                      <p className="text-gray-400 mb-6">Add vehicles and record drives to start building your analytics</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          className="bg-[#1982FC] hover:bg-[#1982FC]/90"
                          onClick={() => navigate('/log-drive')}
                        >
                          <FileText className="mr-2 h-4 w-4" /> Log a Drive
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
                          onClick={() => navigate('/add-vehicle')}
                        >
                          <Car className="mr-2 h-4 w-4" /> Add Vehicle
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                        <Card className="bg-[#252525] border-gray-800">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-400 mb-1">Total Drives</p>
                            <p className="text-2xl font-semibold">{stats.totalDrives}</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-[#252525] border-gray-800">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-400 mb-1">Total Distance</p>
                            <p className="text-2xl font-semibold">1,245 mi</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-[#252525] border-gray-800">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-400 mb-1">Drive Score</p>
                            <div className="flex items-center">
                              <p className="text-2xl font-semibold">{stats.drivingScore}/100</p>
                              <Badge className="ml-2 bg-green-600">Advanced</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="h-64 bg-[#252525] border border-gray-800 rounded-md flex items-center justify-center">
                        <p className="text-gray-400">Detailed analytics charts will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Membership Stats */}
              <Card className="bg-[#1e1e1e] border-[#333] shadow-lg">
                <CardHeader>
                  <CardTitle>PADDOCK20 Membership</CardTitle>
                  <CardDescription>Your membership benefits and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-[#1e1e1e] to-[#252525] border border-gray-800 rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Current Tier</p>
                          <p className="text-xl font-semibold">BETA Tester</p>
                        </div>
                        <Badge className="bg-[#1982FC]">EARLY ACCESS</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Premium Features</span>
                            <span>7/10 Available</span>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Event Access</span>
                            <span>Full Access</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>
                      </div>
                      
                      <Button 
                        className="mt-4 bg-[#1982FC] hover:bg-[#1982FC]/90 w-full"
                        onClick={() => navigate('/paddock-membership')}
                      >
                        View Membership Details
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                      <Card className="bg-[#252525] border-gray-800">
                        <CardContent className="p-4 text-center">
                          <List className="h-8 w-8 mx-auto text-[#1982FC] mb-2" />
                          <h3 className="font-medium">Premium Access</h3>
                          <p className="text-sm text-gray-400">Full access to all modules</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#252525] border-gray-800">
                        <CardContent className="p-4 text-center">
                          <Calendar className="h-8 w-8 mx-auto text-[#1982FC] mb-2" />
                          <h3 className="font-medium">VIP Events</h3>
                          <p className="text-sm text-gray-400">Exclusive motoring events</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#252525] border-gray-800">
                        <CardContent className="p-4 text-center">
                          <CircleDollarSign className="h-8 w-8 mx-auto text-[#1982FC] mb-2" />
                          <h3 className="font-medium">Partner Discounts</h3>
                          <p className="text-sm text-gray-400">Special deals with partners</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Additional imported icons
import { Flag, Plus } from 'lucide-react';

export default ThePaddockPage;
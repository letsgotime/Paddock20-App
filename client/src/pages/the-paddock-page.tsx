import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, 
  ActivitySquare, 
  CalendarClock, 
  CarFront, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  CloudSun, 
  Cog, 
  Fuel, 
  Gauge, 
  History, 
  Map, 
  MapPin, 
  Music, 
  PanelTop, 
  RotateCw, 
  Settings2, 
  SprayCan, 
  SquareStack, 
  Thermometer, 
  Timer, 
  Tractor, 
  User, 
  Users, 
  Wine,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Wrench,
  Zap,
  Droplets,
  Archive,
  Car,
  Warehouse,
  Headphones,
  Award,
  Sliders,
  Plane,
  Briefcase,
  Tv,
  Globe,
  Heart,
  Sparkles,
  ArrowUpRight,
  Activity,
  Laptop,
  Film,
  Radio,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  MoveHorizontal,
  Search
} from 'lucide-react';

// Import existing components to integrate
import TireManagementDashboard from '@/components/TireManagementDashboard';
import OBDManager from '@/components/OBDManager';
import VehicleSummary from '@/components/VehicleSummary';
import WeatherPadSection from '@/components/WeatherPadSection';
import VehiclePerformanceMetrics from '@/components/VehiclePerformanceMetrics';
import MaintenanceSchedule from '@/components/MaintenanceSchedule';
import UpcomingEvents from '@/components/UpcomingEvents';
import F1MechanicConsole from '@/components/F1MechanicConsole';
import FunDrivePlanner from '@/components/FunDrivePlanner';
import UserProfileSection from '@/components/UserProfileSection';
import SupabaseVehicleCard from '@/components/SupabaseVehicleCard';
import Auth0UserBadge from '@/components/Auth0UserBadge';

// Import contexts to access data warehouses
import { useLocationServices } from '@/contexts/LocationServicesContext';
import { useVehicle } from '@/contexts/VehicleContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useGallery } from '@/contexts/GalleryContext';
import { useSpotify } from '@/contexts/SpotifyContext';
// Import the auth hook from context to maintain consistency with rest of app
import { useAuth } from '@/context/AuthContext';

export default function ThePaddockPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const locationServices = useLocationServices();
  const vehicle = useVehicle();
  const userProfile = useUserProfile();
  const gallery = useGallery();
  const spotify = useSpotify();

  const [activeView, setActiveView] = useState('dashboard');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<{[key: string]: boolean}>({});
  const [activeGarageTab, setActiveGarageTab] = useState('vehicles');
  const [dashboardLayout, setDashboardLayout] = useState('default');
  const [showDetailingPanel, setShowDetailingPanel] = useState(false);

  // Use a ref to ensure we only initialize once, ever, per mount
  const hasInitializedRef = useRef(false);
  
  // One-time initialization with 100% guaranteed no re-runs
  useEffect(() => {
    // Protect against multiple effect runs
    if (hasInitializedRef.current) {
      return;
    }
    
    // Set initialized flag immediately
    hasInitializedRef.current = true;
    console.log("Initializing Paddock page - one-time setup");
    
    // Set all health checks to operational directly
    setApiHealth({
      weather: true,
      vehicle: true,
      location: true,
      user: true,
      system: true
    });
    
    // Remove loading state immediately
    setIsLoading(false);
  }, []);
  
  // Show welcome toast exactly once when loaded - with demo mode fallback
  const toastShownRef = useRef(false);
  
  useEffect(() => {
    if (!isLoading && !toastShownRef.current) {
      toastShownRef.current = true;
      
      // Use user data if available, otherwise use demo mode
      const userName = user ? (user.firstName || user.username) : 'User';
      
      toast({
        title: `Welcome to Your Paddock, ${userName}`,
        description: "Your command center for all things automotive.",
      });
    }
  }, [isLoading, toast, user]);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="w-24 h-24 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-6"></div>
        <h3 className="text-blue-500 font-orbitron text-2xl mb-3">INITIALIZING PADDOCK</h3>
        <p className="text-gray-400 mb-2">Loading your automotive command center...</p>
        <div className="mt-4 flex flex-col items-center">
          <div className="w-64 h-2 bg-gray-800 rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 animate-pulse-slow rounded-full"></div>
          </div>
          <p className="text-gray-500 text-sm italic">
            Connecting to live automotive data sources...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-orbitron text-white tracking-wide">
            THE PADDOCK
            <span className="text-blue-500">.</span>
          </h1>
          <p className="text-gray-400 mt-1">Your personal automotive command center</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Badge variant="outline" className="bg-black/30 text-blue-400 border-blue-400/30 flex items-center gap-1">
            <Clock size={14} /> {new Date().toLocaleTimeString()}
          </Badge>
          <Badge variant="outline" className="bg-black/30 text-emerald-400 border-emerald-400/30 flex items-center gap-1">
            <CloudSun size={14} /> {locationServices?.currentWeather?.temp && `${Math.round(locationServices.currentWeather.temp)}°`}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveView}>
        <TabsList className="grid grid-cols-5 bg-black/50 mb-6">
          <TabsTrigger value="dashboard" className="font-orbitron">OVERVIEW</TabsTrigger>
          <TabsTrigger value="vehicle" className="font-orbitron">VEHICLE</TabsTrigger>
          <TabsTrigger value="profile" className="font-orbitron">DRIVER</TabsTrigger>
          <TabsTrigger value="planner" className="font-orbitron">DRIVES</TabsTrigger>
          <TabsTrigger value="telemetry" className="font-orbitron">TELEMETRY</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="dashboard" className="m-0">
          {/* PADDOCK INTRODUCTION - Definition, Purpose, and Usage Guide */}
          <div className="mb-8 bg-black/50 rounded-lg border border-blue-900/40 overflow-hidden">
            <div className="p-6 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500"></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <SquareStack className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-orbitron text-white tracking-wider mb-1">WELCOME TO THE PADDOCK</h2>
                  <p className="text-blue-400">Your complete automotive command center, inspired by F1 racing excellence</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-black/40 p-4 rounded-lg border border-blue-900/30">
                  <div className="flex items-center mb-2">
                    <Map className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-orbitron text-white text-lg">WHY YOU'RE HERE</h3>
                  </div>
                  <p className="text-gray-300 text-sm">The Paddock serves as your automotive lifestyle hub where all your vehicle data, driving experiences, and performance metrics converge. Just as F1 teams gather in the paddock to prepare for success, this is where you'll manage and monitor every aspect of your automotive journey.</p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-blue-900/30">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-orbitron text-white text-lg">WHAT YOU GET</h3>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                      <span>Live vehicle telemetry and performance metrics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                      <span>Comprehensive maintenance tracking and alerts</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                      <span>Driving analytics and route optimization</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                      <span>Premium lifestyle integrations for the complete enthusiast</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                      <span>Weather and track conditions for optimal driving</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-blue-900/30">
                  <div className="flex items-center mb-2">
                    <Sliders className="h-5 w-5 text-purple-500 mr-2" />
                    <h3 className="font-orbitron text-white text-lg">HOW TO USE IT</h3>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-1">1</div>
                      <span>Navigate between tabs to access different aspects of your automotive life</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-1">2</div>
                      <span>Monitor real-time vehicle data for performance optimization</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-1">3</div>
                      <span>Track maintenance schedules and receive timely alerts</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-1">4</div>
                      <span>Access lifestyle integrations through the quick-links in each section</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs mr-1">5</div>
                      <span>Customize your experience through the settings panel</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-4">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SupabaseVehicleCard />
                <Card className="bg-black/30 border-gray-800">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <CarFront className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-xs text-gray-400">VEHICLE</p>
                    <p className="text-xl font-mono text-white">{vehicle?.activeVehicle?.nickname || 'Your Car'}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/30 border-gray-800">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Gauge className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-xs text-gray-400">MILEAGE</p>
                    <p className="text-xl font-mono text-white">{vehicle?.activeVehicle?.mileage?.toLocaleString() || 'N/A'}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/30 border-gray-800">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Fuel className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-xs text-gray-400">FUEL</p>
                    <p className="text-xl font-mono text-white">{vehicle?.activeVehicle?.fuelLevel || 'N/A'}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/30 border-gray-800">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Timer className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-xs text-gray-400">NEXT DRIVE</p>
                    <p className="text-xl font-mono text-white">2h 10m</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Vehicle Preview Panel */}
              <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-400 font-orbitron text-lg">VEHICLE STATUS</CardTitle>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <RotateCw size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <VehicleSummary />
                </CardContent>
              </Card>
              
              {/* Weather & Location Panel */}
              <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-400 font-orbitron text-lg">WEATHER & LOCATION</CardTitle>
                    <Badge variant="outline" className="text-green-400 border-green-500/30">
                      {apiHealth?.weatherApi ? 'LIVE' : 'CACHED'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <WeatherPadSection compact={true} />
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                    onClick={() => navigate('/weather-paddock')}
                  >
                    Expand Weather Paddock
                  </Button>
                </CardFooter>
              </Card>
              
              {/* LIFESTYLE SECTION */}
              <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-400 font-orbitron text-lg">LIFESTYLE PADDOCK</CardTitle>
                    <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                      PREMIUM
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Aviation Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plane className="h-5 w-5 text-blue-400" />
                          <h3 className="font-semibold text-white">AVIATION STATUS</h3>
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                          {apiHealth?.aviationApi ? 'LIVE' : 'CACHED'}
                        </Badge>
                      </div>
                      
                      <div className="bg-black/20 rounded-md p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white">Nearby Airport</div>
                          </div>
                          <div className="text-sm text-gray-400">JFK</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white">Weather</div>
                          </div>
                          <div className="text-sm text-gray-400">Clear, 72°F</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white">Next Flight</div>
                          </div>
                          <div className="text-sm text-blue-400">BA1426 • 8:45PM</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Netflix Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tv className="h-5 w-5 text-red-500" />
                          <h3 className="font-semibold text-white">NETFLIX RACING CONTENT</h3>
                        </div>
                        <Badge variant="outline" className="text-red-400 border-red-500/30">
                          {apiHealth?.netflixApi ? 'UPDATED' : 'RECENT'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/20 rounded-md p-2 flex flex-col">
                          <div className="text-xs text-gray-400">NEW RELEASE</div>
                          <div className="text-sm font-medium text-white">Drive to Survive S5</div>
                          <div className="mt-auto text-xs text-red-400">98% Match</div>
                        </div>
                        <div className="bg-black/20 rounded-md p-2 flex flex-col">
                          <div className="text-xs text-gray-400">TRENDING</div>
                          <div className="text-sm font-medium text-white">Ferrari: Race to Immortality</div>
                          <div className="mt-auto text-xs text-red-400">94% Match</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Career Opportunities */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-green-400" />
                          <h3 className="font-semibold text-white">AUTOMOTIVE CAREERS</h3>
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                          {apiHealth?.jobsApi ? '3 NEW' : 'UPDATED'}
                        </Badge>
                      </div>
                      
                      <div className="bg-black/20 rounded-md p-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-white">Racing Engineer</div>
                          <div className="text-xs text-green-400">$120K-$170K</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-white">Performance Specialist</div>
                          <div className="text-xs text-green-400">$95K-$130K</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-white">Automotive Designer</div>
                          <div className="text-xs text-green-400">$85K-$120K</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full text-purple-500 border-purple-500/30 hover:bg-purple-500/10"
                  >
                    Explore Lifestyle Hub
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              {/* Driver Profile Summary */}
              <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-400 font-orbitron text-lg">DRIVER PROFILE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Auth0UserBadge />
                  </div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                      {userProfile?.avatar ? (
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={32} className="text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{userProfile?.fullName || user?.firstName || user?.username}</h3>
                      <p className="text-gray-400 text-sm">{userProfile?.drivingExperience || 'Enthusiast Driver'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Drives Logged:</span>
                      <span className="text-white">{userProfile?.drivesLogged || '0'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Favorite Roads:</span>
                      <span className="text-white">{userProfile?.favoriteRoads?.length || '0'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Driver Score:</span>
                      <span className="text-white font-mono">{userProfile?.driverScore || '---'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full text-blue-500 hover:bg-blue-500/10">
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Upcoming Events */}
              <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-400 font-orbitron text-lg">UPCOMING EVENTS</CardTitle>
                </CardHeader>
                <CardContent>
                  <UpcomingEvents compact={true} />
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-400 font-orbitron text-lg">QUICK ACTIONS</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="text-white border-gray-700 hover:bg-blue-500/10 hover:text-blue-400 justify-start">
                    <Map size={16} className="mr-2" /> Plan Drive
                  </Button>
                  <Button variant="outline" className="text-white border-gray-700 hover:bg-blue-500/10 hover:text-blue-400 justify-start">
                    <SprayCan size={16} className="mr-2" /> Juice Box
                  </Button>
                  <Button variant="outline" className="text-white border-gray-700 hover:bg-blue-500/10 hover:text-blue-400 justify-start">
                    <Music size={16} className="mr-2" /> Playlists
                  </Button>
                  <Button variant="outline" className="text-white border-gray-700 hover:bg-blue-500/10 hover:text-blue-400 justify-start">
                    <History size={16} className="mr-2" /> Journal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* VEHICLE TAB */}
        <TabsContent value="vehicle" className="m-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Information */}
            <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-400 font-orbitron text-lg">VEHICLE INFORMATION</CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                    <Cog size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">MAKE & MODEL</p>
                      <p className="text-white">{vehicle?.activeVehicle?.make} {vehicle?.activeVehicle?.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">YEAR</p>
                      <p className="text-white">{vehicle?.activeVehicle?.year}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">LICENSE</p>
                      <p className="text-white">{vehicle?.activeVehicle?.licensePlate || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">ENGINE</p>
                      <p className="text-white">{vehicle?.activeVehicle?.engineType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">TRANSMISSION</p>
                      <p className="text-white">{vehicle?.activeVehicle?.transmissionType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">COLOR</p>
                      <p className="text-white">{vehicle?.activeVehicle?.color}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">VIN</p>
                      <p className="text-white font-mono">{vehicle?.activeVehicle?.vin || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">PURCHASE DATE</p>
                      <p className="text-white">{vehicle?.activeVehicle?.purchaseDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Vehicle Data Entry Methods */}
            <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-400 font-orbitron text-lg">VEHICLE DATA ENTRY</CardTitle>
                  <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                    4 METHODS
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Manual Entry */}
                    <div className="bg-black/30 border border-gray-800 rounded-md p-4 hover:border-blue-500/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                          <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="font-medium text-white mb-1">MANUAL ENTRY</h3>
                        <p className="text-xs text-gray-400">Complete control over vehicle data input</p>
                      </div>
                    </div>
                    
                    {/* VIN Decode */}
                    <div className="bg-black/30 border border-gray-800 rounded-md p-4 hover:border-blue-500/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                          <Search className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="font-medium text-white mb-1">VIN DECODE</h3>
                        <p className="text-xs text-gray-400">Automatically populate from VIN number</p>
                      </div>
                    </div>
                    
                    {/* OBD Python */}
                    <div className="bg-black/30 border border-gray-800 rounded-md p-4 hover:border-blue-500/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                          <Gauge className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="font-medium text-white mb-1">OBD PYTHON</h3>
                        <p className="text-xs text-gray-400">Direct connection to vehicle OBD port</p>
                      </div>
                    </div>
                    
                    {/* Smartcar API */}
                    <div className="bg-black/30 border border-gray-800 rounded-md p-4 hover:border-blue-500/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                          <Activity className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="font-medium text-white mb-1">SMARTCAR API</h3>
                        <p className="text-xs text-gray-400">Connect to supported vehicle services</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <Globe className="h-4 w-4 text-blue-400 mr-2" />
                      <h3 className="text-sm font-medium text-white">GEOCODING INTEGRATION</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Enable location tracking and mapping for your vehicles</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                        Connect Location
                      </Button>
                      <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                        View on Map
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Performance Metrics */}
            <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-400 font-orbitron text-lg">PERFORMANCE METRICS</CardTitle>
                  <Badge variant="outline" className="text-green-400 border-green-500/30">
                    {apiHealth?.obdApi ? 'LIVE' : 'CACHED'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <VehiclePerformanceMetrics compact={true} />
              </CardContent>
            </Card>
          </div>
          
          {/* F1 Mechanic Console - Advanced Maintenance */}
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-400 font-orbitron text-lg">F1 MECHANIC CONSOLE</CardTitle>
                <Badge variant="outline" className="text-green-400 border-green-500/30">
                  PREMIUM
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <F1MechanicConsole vehicle={vehicle} />
            </CardContent>
          </Card>
          
          {/* Tire Management */}
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-400 font-orbitron text-lg">TIRE MANAGEMENT</CardTitle>
                <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                  {apiHealth?.tireApi ? 'CONNECTED' : 'MANUAL'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TireManagementDashboard compact={true} />
            </CardContent>
          </Card>
          
          {/* Maintenance Schedule */}
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-400 font-orbitron text-lg">MAINTENANCE SCHEDULE</CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                  <CalendarClock size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <MaintenanceSchedule compact={true} />
            </CardContent>
          </Card>
          
          {/* Vehicle Gallery */}
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-400 font-orbitron text-lg">GALLERY</CardTitle>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                  <SquareStack size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {gallery?.vehicleImages?.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.caption || 'Vehicle image'} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
                {(!gallery?.vehicleImages || gallery.vehicleImages.length === 0) && (
                  <div className="col-span-4 flex items-center justify-center h-32 bg-black/20 rounded-md">
                    <p className="text-gray-500">No images yet</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
              >
                View All Images
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* DRIVER TAB */}
        <TabsContent value="profile" className="m-0 space-y-4">
          <UserProfileSection />
        </TabsContent>

        {/* DRIVES TAB */}
        <TabsContent value="planner" className="m-0 space-y-4">
          <FunDrivePlanner />
        </TabsContent>

        {/* TELEMETRY TAB */}
        <TabsContent value="telemetry" className="m-0 space-y-4">
          <OBDManager />
        </TabsContent>
      </Tabs>
      
      {/* Footer */}
      <div className="mt-8 border-t border-gray-800 pt-4 flex justify-between items-center text-xs text-gray-500">
        <div className="flex space-x-4">
          <span>PADDOCK20</span>
          <span>F1-INSPIRED AUTOMOTIVE OS</span>
        </div>
        <div className="flex space-x-2">
          {Object.entries(apiHealth).map(([key, status]) => (
            <Badge 
              key={key} 
              variant="outline" 
              className={`${status ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'}`}
            >
              {key.replace('Api', '').toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import supabase from "../services/supabaseClient";
import { Link } from "wouter";
import { 
  Car, 
  Wrench, 
  FileText, 
  History, 
  Calendar, 
  BarChart3, 
  PlusCircle, 
  Camera, 
  Sparkles, 
  Gauge, 
  Droplets, 
  Clock,
  Check,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Wrench as Tool,
  Image as ImageIcon,
  ScrollText,
  Repeat,
  LineChart,
  Crown,
  Fuel,
  BarChart,
  Thermometer,
  Wind,
  Sun,
  CloudRain,
  Zap,
  ChevronDown,
  Bookmark,
  GalleryVertical,
  Pencil,
  Settings,
  ClipboardList,
  CircleDashed,
  BatteryCharging,
  PlusSquare,
  Activity,
  Filter,
  Search
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ProjectLauncher from "../components/ProjectLauncher";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  license_plate: string;
  color: string;
  image_url: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  status: string;
  drivetrain: string;
  engine_type: string;
  transmission: string;
  fuel_type: string;
  mileage: number;
  notes: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  maintenance_count?: number;
  modifications_count?: number;
  documents_count?: number;
  last_service_date?: string;
  next_service_date?: string;
  next_service_miles?: number;
  insurance_renewal_date?: string;
  inspection_due_date?: string;
  last_detailed_date?: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  membership_tier: string;
  points: number;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  vehicle_id: string;
  title: string;
  document_type: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp: number;
    humidity: number;
    wind: number;
    uv: number;
    condition: string;
  };
  forecast: {
    date: string;
    condition: string;
    high: number;
    low: number;
    sunrise: string;
    sunset: string;
  }[];
}

interface OBDData {
  rpm: number;
  engineTemp: number;
  batteryVoltage: string;
  coolantTemp?: number;
  intakeTemp?: number;
  airflowRate?: number;
  speed?: number;
  throttlePosition?: number;
  fuelLevel?: number;
  engineRuntime?: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  deadline: string;
  vehicle_id: string;
  project_type: 'maintenance' | 'modification' | 'detailing' | 'purchase';
  budget: number;
  spent: number;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
}

interface MaintenanceItem {
  id: string;
  vehicle_id: string;
  service_type: string;
  service_date: string;
  mileage: number;
  performed_by: string;
  cost: number;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  parts_used?: string[];
  images?: string[];
  documents?: string[];
}

interface Modification {
  id: string;
  vehicle_id: string;
  name: string;
  category: string;
  installation_date: string;
  installer: string;
  cost: number;
  description: string;
  brand: string;
  part_number: string;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  images?: string[];
  before_images?: string[];
  after_images?: string[];
  documents?: string[];
}

interface DetailingSession {
  id: string;
  vehicle_id: string;
  date: string;
  type: 'wash' | 'detail' | 'ceramic' | 'ppf' | 'wax' | 'polish';
  location: string;
  performed_by: string;
  cost: number;
  products_used: string[];
  notes: string;
  created_at: string;
  updated_at: string;
  weather_conditions?: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
  before_images?: string[];
  after_images?: string[];
}

const EnhancedGarageVault: React.FC = () => {
  // Core data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [detailingSessions, setDetailingSessions] = useState<DetailingSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // UI state
  const [showProjectLauncher, setShowProjectLauncher] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);
  const [isAddingMaintenanceItem, setIsAddingMaintenanceItem] = useState<boolean>(false);
  const [isAddingModification, setIsAddingModification] = useState<boolean>(false);
  const [isAddingDetailingSession, setIsAddingDetailingSession] = useState<boolean>(false);
  const [isConnectedToOBD, setIsConnectedToOBD] = useState<boolean>(false);
  const [isScanningForOBD, setIsScanningForOBD] = useState<boolean>(false);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddingVehicle, setIsAddingVehicle] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState({
    status: "all",
    sortBy: "recent",
    showArchived: false
  });
  
  // Mock data for interactive elements
  const [obdData, setObdData] = useState<OBDData>({
    rpm: 0,
    engineTemp: 0,
    batteryVoltage: "12.0",
    coolantTemp: 0,
    intakeTemp: 0,
    airflowRate: 0,
    speed: 0,
    throttlePosition: 0,
    fuelLevel: 0,
    engineRuntime: 0
  });
  
  const [weatherData, setWeatherData] = useState<WeatherData>({
    location: {
      name: "Unknown",
      region: "",
      country: ""
    },
    current: {
      temp: 72,
      humidity: 50,
      wind: 5,
      uv: 4,
      condition: "Sunny"
    },
    forecast: []
  });
  
  // Dashboard configuration
  const [dashboardToggles, setDashboardToggles] = useState({
    showMaintenanceAlerts: true,
    showValuationTrends: true,
    showWeatherAdvisories: true,
    showDetailingSchedule: true,
    showMoodTracker: true,
    showNextEvents: true,
    showActiveProjects: true,
    showDocumentExpiration: true
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!supabase) return;
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        return;
      }
      
      if (sessionData?.session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          setUserProfile(data);
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!supabase) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching vehicles:', error);
          return;
        }
        
        setVehicles(data || []);
      } catch (error) {
        console.error('Error in fetchVehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Fetch recent documents
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('Error fetching documents:', error);
          return;
        }
        
        setRecentDocuments(data || []);
      } catch (error) {
        console.error('Error in fetchRecentDocuments:', error);
      }
    };
    
    fetchRecentDocuments();
  }, []);

  // Calculate days until next service for a vehicle
  const getDaysUntilNextService = (nextServiceDate: string | undefined): number => {
    if (!nextServiceDate) return 0;
    
    const today = new Date();
    const serviceDate = new Date(nextServiceDate);
    const timeDiff = serviceDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  };

  // Get formatted date display
  const getFormattedDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "N/A";
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  // Handle toggle changes
  const handleToggleChange = (key: keyof typeof dashboardToggles) => {
    setDashboardToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setActiveSection("vehicle-details");
  };

  // Function to display a status badge
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      "Active": { color: "bg-green-500", icon: <Check className="h-3 w-3" /> },
      "Stored": { color: "bg-blue-500", icon: <Clock className="h-3 w-3" /> },
      "Maintenance": { color: "bg-yellow-500", icon: <Wrench className="h-3 w-3" /> },
      "Selling": { color: "bg-purple-500", icon: <Sparkles className="h-3 w-3" /> },
      "Inactive": { color: "bg-gray-500", icon: <AlertTriangle className="h-3 w-3" /> }
    };

    const { color, icon } = statusMap[status] || { color: "bg-gray-500", icon: <Clock className="h-3 w-3" /> };

    return (
      <Badge className={`${color} text-white text-xs flex items-center gap-1 px-2 py-0.5`}>
        {icon}
        {status}
      </Badge>
    );
  };

  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower) ||
      vehicle.vin.toLowerCase().includes(searchLower) ||
      vehicle.license_plate.toLowerCase().includes(searchLower);
    
    // Status filter
    const matchesStatus = filterOptions.status === "all" || 
      vehicle.status.toLowerCase() === filterOptions.status.toLowerCase();
    
    // Archived filter
    const matchesArchived = filterOptions.showArchived || vehicle.status !== "Inactive";
    
    return matchesSearch && matchesStatus && matchesArchived;
  });

  // Sort vehicles based on sort option
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (filterOptions.sortBy) {
      case "recent":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case "oldest":
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      case "value-high":
        return b.current_value - a.current_value;
      case "value-low":
        return a.current_value - b.current_value;
      case "name-az":
        return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`);
      case "name-za":
        return `${b.make} ${b.model}`.localeCompare(`${a.make} ${a.model}`);
      default:
        return 0;
    }
  });

  // Simulate OBD connection
  const handleOBDConnect = () => {
    setIsConnectedToOBD(true);
    toast({
      title: "OBD Connected",
      description: "Successfully connected to vehicle's OBD-II system.",
    });
    
    // Simulate data updating
    const interval = setInterval(() => {
      setObdData(prev => ({
        ...prev,
        rpm: Math.floor(Math.random() * 300) + 1200,
        engineTemp: Math.floor(Math.random() * 10) + 190,
        batteryVoltage: (Math.random() * 0.3 + 12.5).toFixed(1)
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  };

  // Format values for display
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Weather recommendation for detailing
  const getWeatherRecommendation = () => {
    const { temp, humidity, wind, uv, condition } = weatherData.current;
    
    if (temp < 50 || temp > 90) {
      return {
        isGood: false,
        message: `Temperature (${temp}°F) is outside the ideal range for detailing.`
      };
    }
    
    if (humidity > 80) {
      return {
        isGood: false,
        message: `High humidity (${humidity}%) may cause issues with product drying.`
      };
    }
    
    if (wind > 15) {
      return {
        isGood: false,
        message: `Wind speed (${wind} mph) may cause contaminants to settle on surfaces.`
      };
    }
    
    if (condition === "Rain" || condition === "Snow") {
      return {
        isGood: false,
        message: `Current ${condition} conditions are not suitable for detailing.`
      };
    }
    
    if (uv > 8) {
      return {
        isGood: true,
        message: `Good conditions, but high UV index (${uv}). Work in shade if possible.`
      };
    }
    
    return {
      isGood: true,
      message: "Ideal conditions for detailing. All parameters are within optimal ranges."
    };
  };

  // Get weather recommendation
  const weatherRecommendation = getWeatherRecommendation();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header with Title and Profile Status */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Garage Vault
              {userProfile?.membership_tier === "paddock20" && (
                <Badge className="bg-[#7FC844] text-black ml-2 flex items-center">
                  <Crown className="h-3 w-3 mr-1" /> PADDOCK20
                </Badge>
              )}
            </h1>
            <p className="text-gray-400 mt-1">
              {userProfile && `Welcome back, ${userProfile.first_name}. You have ${userProfile.points} GoTime points.`}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowProjectLauncher(true)}
              className="bg-[#334155] text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-[#475569] transition border border-[#475569]"
            >
              <Wrench className="h-4 w-4" />
              New Project
            </button>
            <button
              onClick={() => setIsAddingVehicle(true)}
              className="bg-[#7FC844] text-black font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-[#6cb33a] transition"
            >
              <PlusCircle className="h-4 w-4" />
              Add Vehicle
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        {activeSection === "overview" ? (
          <>
            {/* Fleet Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Fleet Stats */}
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Car className="h-5 w-5 text-[#7FC844] mr-2" />
                  Your Fleet
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Vehicles</div>
                    <div className="text-2xl font-bold">{vehicles.length}</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Fleet Value</div>
                    <div className="text-2xl font-bold">${formatNumber(vehicles.reduce((sum, v) => sum + v.current_value, 0))}</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Due for Service</div>
                    <div className="text-2xl font-bold">
                      {vehicles.filter(v => v.next_service_date && getDaysUntilNextService(v.next_service_date) < 30).length}
                    </div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Garage Status</div>
                    <div className="text-xl font-bold flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Optimal
                    </div>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <History className="h-4 w-4 text-[#7FC844] mr-2" />
                  Recent Activity
                </h3>
                <div className="bg-zinc-800 rounded-lg divide-y divide-zinc-700 border border-zinc-700 mb-4">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc, index) => (
                      <div key={doc.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-[#7FC844] mr-2" />
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(doc.created_at).toLocaleDateString()} • {doc.document_type}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">No recent activity</div>
                  )}
                </div>
              </div>
              
              {/* Weather & Environment */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <CloudRain className="h-5 w-5 text-[#7FC844] mr-2" />
                  Weather & Environment
                </h2>
                <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-gray-400 text-sm">{weatherData.location.name}</div>
                      <div className="text-2xl font-bold">{weatherData.current.temp}°F</div>
                    </div>
                    <div className="text-5xl text-[#7FC844]">
                      {weatherData.current.condition === "Sunny" && <Sun />}
                      {weatherData.current.condition === "Rainy" && <CloudRain />}
                      {weatherData.current.condition === "Cloudy" && <CloudRain />}
                      {!["Sunny", "Rainy", "Cloudy"].includes(weatherData.current.condition) && <Sun />}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-zinc-700 rounded p-2 text-center">
                      <div className="text-xs text-gray-300 mb-1">Humidity</div>
                      <div className="font-bold flex items-center justify-center">
                        <Droplets className="h-3 w-3 mr-1 text-blue-400" />
                        {weatherData.current.humidity}%
                      </div>
                    </div>
                    <div className="bg-zinc-700 rounded p-2 text-center">
                      <div className="text-xs text-gray-300 mb-1">Wind</div>
                      <div className="font-bold flex items-center justify-center">
                        <Wind className="h-3 w-3 mr-1 text-blue-400" />
                        {weatherData.current.wind} mph
                      </div>
                    </div>
                    <div className="bg-zinc-700 rounded p-2 text-center">
                      <div className="text-xs text-gray-300 mb-1">UV Index</div>
                      <div className="font-bold flex items-center justify-center">
                        <Sun className="h-3 w-3 mr-1 text-yellow-400" />
                        {weatherData.current.uv}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailing Recommendation */}
                  <div className={`rounded-lg p-3 text-sm ${weatherRecommendation.isGood ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                    <div className="font-medium mb-1">
                      {weatherRecommendation.isGood ? 'Good for Detailing' : 'Not Ideal for Detailing'}
                    </div>
                    <div className="text-xs">
                      {weatherRecommendation.message}
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Maintenance */}
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Wrench className="h-4 w-4 text-[#7FC844] mr-2" />
                  Upcoming Maintenance
                </h3>
                <div className="bg-zinc-800 rounded-lg divide-y divide-zinc-700 border border-zinc-700">
                  {vehicles
                    .filter(v => v.next_service_date)
                    .sort((a, b) => getDaysUntilNextService(a.next_service_date) - getDaysUntilNextService(b.next_service_date))
                    .slice(0, 3)
                    .map(vehicle => (
                      <div key={vehicle.id} className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <Badge className={getDaysUntilNextService(vehicle.next_service_date) < 7 ? 'bg-red-600' : 'bg-yellow-600'}>
                            {getDaysUntilNextService(vehicle.next_service_date)} days
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{vehicle.next_service_date && getFormattedDate(vehicle.next_service_date)}</div>
                      </div>
                    ))}
                  {vehicles.filter(v => v.next_service_date).length === 0 && (
                    <div className="p-4 text-center text-gray-400">No upcoming service</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Vehicle Grid/List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <Car className="h-5 w-5 text-[#7FC844] mr-2" />
                  Your Vehicles
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#7FC844] text-black' : 'bg-zinc-800 text-gray-300'}`}
                  >
                    <GalleryVertical className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#7FC844] text-black' : 'bg-zinc-800 text-gray-300'}`}
                  >
                    <ClipboardList className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7FC844]"></div>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicles.map(vehicle => (
                        <div 
                          key={vehicle.id} 
                          className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:border-[#7FC844] transition cursor-pointer"
                          onClick={() => handleVehicleSelect(vehicle)}
                        >
                          <div className="h-40 relative overflow-hidden">
                            <img 
                              src={vehicle.image_url} 
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              {renderStatusBadge(vehicle.status)}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                            <p className="text-gray-400 text-sm">{vehicle.trim}</p>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm text-gray-300">{formatNumber(vehicle.mileage)} miles</span>
                              <span className="text-sm font-medium">${formatNumber(vehicle.current_value)}</span>
                            </div>
                            <div className="mt-3 flex items-center text-sm">
                              <div className="flex items-center text-gray-400 mr-4">
                                <Wrench className="h-3 w-3 mr-1" />
                                <span>{vehicle.maintenance_count || 0}</span>
                              </div>
                              <div className="flex items-center text-gray-400 mr-4">
                                <Tool className="h-3 w-3 mr-1" />
                                <span>{vehicle.modifications_count || 0}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <FileText className="h-3 w-3 mr-1" />
                                <span>{vehicle.documents_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-800 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-zinc-700 text-left">
                            <th className="p-3">Vehicle</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Mileage</th>
                            <th className="p-3">Value</th>
                            <th className="p-3">Next Service</th>
                            <th className="p-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-700">
                          {vehicles.map(vehicle => (
                            <tr 
                              key={vehicle.id} 
                              className="hover:bg-zinc-700 cursor-pointer"
                              onClick={() => handleVehicleSelect(vehicle)}
                            >
                              <td className="p-3">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded overflow-hidden mr-3">
                                    <img 
                                      src={vehicle.image_url} 
                                      alt={`${vehicle.make} ${vehicle.model}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                                    <div className="text-xs text-gray-400">{vehicle.trim}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                {renderStatusBadge(vehicle.status)}
                              </td>
                              <td className="p-3">{formatNumber(vehicle.mileage)}</td>
                              <td className="p-3">${formatNumber(vehicle.current_value)}</td>
                              <td className="p-3">
                                {vehicle.next_service_date ? (
                                  <span className={getDaysUntilNextService(vehicle.next_service_date) < 7 ? 'text-red-400' : ''}>
                                    {getFormattedDate(vehicle.next_service_date)}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Not scheduled</span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <ChevronRight className="h-5 w-5 text-gray-400 inline-block" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {vehicles.length === 0 && (
                    <div className="bg-zinc-800 rounded-lg p-6 text-center">
                      <Car className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                      <h3 className="text-lg font-medium mb-2">No vehicles yet</h3>
                      <p className="text-gray-400 mb-4">Add your first vehicle to get started with Garage Vault.</p>
                      <button
                        onClick={() => setIsAddingVehicle(true)}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-[#7FC844] text-black"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Vehicle
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : activeSection === "vehicle-details" && selectedVehicle ? (
          <>
            {/* Back button */}
            <button 
              onClick={() => setActiveSection("overview")}
              className="flex items-center text-gray-400 hover:text-white mb-4"
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Back to Overview
            </button>
            
            {/* Vehicle Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="flex w-full bg-zinc-900">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex-1 bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-[#7FC844]"
                  >
                    <Gauge className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="maintenance" 
                    className="flex-1 bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-[#7FC844]"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintenance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="modifications" 
                    className="flex-1 bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-[#7FC844]"
                  >
                    <Tool className="h-4 w-4 mr-2" />
                    Modifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="detailing" 
                    className="flex-1 bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-[#7FC844]"
                  >
                    <Droplets className="h-4 w-4 mr-2" />
                    Detailing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents" 
                    className="flex-1 bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-[#7FC844]"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mood" 
                    className="flex-1 bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-[#7FC844]"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Mood & Energy
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Vehicle Info Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-5">
                  <div className="w-40 h-28 rounded-lg overflow-hidden">
                    <img 
                      src={selectedVehicle.image_url} 
                      alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">
                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      </h2>
                      {renderStatusBadge(selectedVehicle.status)}
                    </div>
                    <p className="text-gray-400">{selectedVehicle.trim} • {selectedVehicle.license_plate}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-[#7FC844]" />
                        <span>{formatNumber(selectedVehicle.mileage)} miles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#7FC844]" />
                        <span>Purchased {getFormattedDate(selectedVehicle.purchase_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-[#7FC844]" />
                        <span>{selectedVehicle.fuel_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-[#7FC844]" />
                        <span>{selectedVehicle.engine_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      toast({
                        title: "OBD Connection",
                        description: "Connecting to vehicle OBD-II port...",
                      });
                      handleOBDConnect();
                    }} 
                    className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${
                      isConnectedToOBD ? 'bg-green-600 text-white' : 'bg-zinc-800 text-gray-300'
                    }`}
                  >
                    <Gauge className="h-3 w-3" />
                    {isConnectedToOBD ? 'Connected' : 'Connect OBD'}
                  </button>
                  <button 
                    onClick={() => setShowProjectLauncher(true)}
                    className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1 bg-[#7FC844] text-black"
                  >
                    <PlusSquare className="h-3 w-3" />
                    New Project
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tab Content */}
            <TabsContent value="dashboard" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Vehicle Vitals */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <Gauge className="h-4 w-4 text-[#7FC844] mr-2" />
                      Vehicle Vitals
                    </h3>
                    
                    {isConnectedToOBD ? (
                      <>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-zinc-800 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-400 mb-1">Engine RPM</div>
                            <div className="text-xl font-bold">{obdData.rpm}</div>
                            <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2">
                              <div 
                                className="bg-[#7FC844] h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, (obdData.rpm / 7000) * 100)}%` }} 
                              />
                            </div>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-400 mb-1">Engine Temp</div>
                            <div className="text-xl font-bold">{obdData.engineTemp}°F</div>
                            <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  obdData.engineTemp > 230 ? 'bg-red-500' : 
                                  obdData.engineTemp > 210 ? 'bg-yellow-500' : 'bg-[#7FC844]'
                                }`}
                                style={{ width: `${Math.min(100, (obdData.engineTemp / 300) * 100)}%` }} 
                              />
                            </div>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-400 mb-1">Battery</div>
                            <div className="text-xl font-bold">{obdData.batteryVoltage}V</div>
                            <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  parseFloat(obdData.batteryVoltage) < 11.8 ? 'bg-red-500' : 
                                  parseFloat(obdData.batteryVoltage) < 12.3 ? 'bg-yellow-500' : 'bg-[#7FC844]'
                                }`}
                                style={{ width: `${Math.min(100, ((parseFloat(obdData.batteryVoltage) - 10) / 4) * 100)}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-zinc-800 rounded-lg px-3 py-2">
                            <div className="text-xs text-gray-400">Coolant Temp</div>
                            <div className="font-medium">{obdData.coolantTemp || "--"}°F</div>
                          </div>
                          <div className="bg-zinc-800 rounded-lg px-3 py-2">
                            <div className="text-xs text-gray-400">Intake Temp</div>
                            <div className="font-medium">{obdData.intakeTemp || "--"}°F</div>
                          </div>
                          <div className="bg-zinc-800 rounded-lg px-3 py-2">
                            <div className="text-xs text-gray-400">Speed</div>
                            <div className="font-medium">{obdData.speed || "--"} mph</div>
                          </div>
                          <div className="bg-zinc-800 rounded-lg px-3 py-2">
                            <div className="text-xs text-gray-400">Throttle</div>
                            <div className="font-medium">{obdData.throttlePosition || "--"}%</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-zinc-800 rounded-lg p-5 text-center">
                        <BatteryCharging className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                        <h4 className="font-medium mb-1">OBD Data Not Available</h4>
                        <p className="text-sm text-gray-400 mb-3">Connect to your vehicle's OBD-II port to view live data</p>
                        <button 
                          onClick={() => {
                            setIsScanningForOBD(true);
                            setTimeout(() => {
                              setIsScanningForOBD(false);
                              handleOBDConnect();
                            }, 2000);
                          }}
                          className="px-4 py-2 bg-[#7FC844] text-black rounded-md text-sm flex items-center gap-2 mx-auto"
                          disabled={isScanningForOBD}
                        >
                          {isScanningForOBD ? (
                            <>
                              <CircleDashed className="h-4 w-4 animate-spin" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <Gauge className="h-4 w-4" />
                              Connect OBD
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Projects */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center">
                        <Tool className="h-4 w-4 text-[#7FC844] mr-2" />
                        Active Projects
                      </h3>
                      <button 
                        onClick={() => setShowProjectLauncher(true)}
                        className="text-sm text-[#7FC844] flex items-center"
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        New Project
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {goals.filter(goal => goal.vehicle_id === selectedVehicle.id && goal.status !== 'completed').length > 0 ? (
                        goals
                          .filter(goal => goal.vehicle_id === selectedVehicle.id && goal.status !== 'completed')
                          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                          .map(goal => (
                            <div key={goal.id} className="bg-zinc-800 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{goal.title}</div>
                                <Badge className={
                                  goal.status === 'in_progress' ? 'bg-blue-600' :
                                  goal.status === 'planning' ? 'bg-yellow-600' :
                                  goal.status === 'paused' ? 'bg-gray-600' : 'bg-green-600'
                                }>
                                  {goal.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-400 mt-1">{goal.description}</div>
                              <div className="mt-2 flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-gray-400">Deadline:</span> {getFormattedDate(goal.deadline)}
                                </div>
                                <div>
                                  <span className="text-gray-400">Budget:</span> ${goal.budget} (${goal.spent} spent)
                                </div>
                              </div>
                              <div className="mt-1.5 w-full bg-zinc-700 h-1.5 rounded-full">
                                <div 
                                  className="bg-[#7FC844] h-1.5 rounded-full" 
                                  style={{ width: `${goal.progress}%` }} 
                                />
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-4 text-center">
                          <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                          <p className="text-gray-400">No active projects. Start a new project to track your goals.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <BarChart className="h-4 w-4 text-[#7FC844] mr-2" />
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Current Value</span>
                        <span className="font-medium">${formatNumber(selectedVehicle.current_value)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Purchase Price</span>
                        <span className="font-medium">${formatNumber(selectedVehicle.purchase_price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Value Change</span>
                        <span className={`font-medium ${selectedVehicle.current_value >= selectedVehicle.purchase_price ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedVehicle.current_value >= selectedVehicle.purchase_price ? '+' : ''}
                          ${formatNumber(selectedVehicle.current_value - selectedVehicle.purchase_price)}
                        </span>
                      </div>
                      <Separator className="bg-zinc-700" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Next Service</span>
                        <span className="font-medium">
                          {selectedVehicle.next_service_date ? getFormattedDate(selectedVehicle.next_service_date) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Insurance Renewal</span>
                        <span className="font-medium">
                          {selectedVehicle.insurance_renewal_date ? getFormattedDate(selectedVehicle.insurance_renewal_date) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Inspection Due</span>
                        <span className="font-medium">
                          {selectedVehicle.inspection_due_date ? getFormattedDate(selectedVehicle.inspection_due_date) : 'N/A'}
                        </span>
                      </div>
                      <Separator className="bg-zinc-700" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Last Detailed</span>
                        <span className="font-medium">
                          {selectedVehicle.last_detailed_date ? getFormattedDate(selectedVehicle.last_detailed_date) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Documents */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-bold flex items-center">
                        <FileText className="h-4 w-4 text-[#7FC844] mr-2" />
                        Documents
                      </h3>
                      <button className="text-sm text-[#7FC844] flex items-center">
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentDocuments.filter(doc => doc.vehicle_id === selectedVehicle.id).length > 0 ? (
                        recentDocuments
                          .filter(doc => doc.vehicle_id === selectedVehicle.id)
                          .slice(0, 3)
                          .map(doc => (
                            <div key={doc.id} className="flex items-center bg-zinc-800 rounded-lg p-2">
                              <div className={`
                                h-8 w-8 flex items-center justify-center rounded 
                                ${doc.document_type === 'maintenance' ? 'bg-blue-600/20 text-blue-400' : 
                                  doc.document_type === 'insurance' ? 'bg-green-600/20 text-green-400' : 
                                  doc.document_type === 'registration' ? 'bg-purple-600/20 text-purple-400' : 
                                  'bg-gray-600/20 text-gray-400'}
                              `}>
                                {doc.document_type === 'maintenance' ? <Wrench className="h-4 w-4" /> :
                                 doc.document_type === 'insurance' ? <FileText className="h-4 w-4" /> :
                                 doc.document_type === 'registration' ? <Bookmark className="h-4 w-4" /> :
                                 <FileText className="h-4 w-4" />}
                              </div>
                              <div className="ml-2 flex-grow">
                                <div className="text-sm font-medium">{doc.title}</div>
                                <div className="text-xs text-gray-400">{getFormattedDate(doc.created_at)}</div>
                              </div>
                              <div className="text-gray-400">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center text-gray-400 py-3">
                          No documents available
                        </div>
                      )}
                      
                      {recentDocuments.filter(doc => doc.vehicle_id === selectedVehicle.id).length > 3 && (
                        <button className="w-full text-center text-sm text-[#7FC844] py-1">
                          View all documents
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance" className="mt-0">
              {/* Maintenance Tab Content */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Maintenance History</h3>
                  <button 
                    onClick={() => setIsAddingMaintenanceItem(true)}
                    className="bg-[#7FC844] text-black text-sm px-3 py-1.5 rounded flex items-center"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add Service
                  </button>
                </div>
                
                {maintenanceItems.filter(item => item.vehicle_id === selectedVehicle.id).length > 0 ? (
                  <div className="space-y-4">
                    {maintenanceItems
                      .filter(item => item.vehicle_id === selectedVehicle.id)
                      .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())
                      .map(item => (
                        <div key={item.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold">{item.service_type}</h4>
                              <div className="text-gray-400 text-sm">{getFormattedDate(item.service_date)} • {formatNumber(item.mileage)} miles</div>
                            </div>
                            <Badge className={
                              item.status === 'completed' ? 'bg-green-600' :
                              item.status === 'scheduled' ? 'bg-blue-600' : 'bg-gray-600'
                            }>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{item.notes}</p>
                          <div className="flex justify-between items-center text-sm">
                            <div className="text-gray-400">Performed by: <span className="text-gray-200">{item.performed_by}</span></div>
                            <div className="font-medium">${item.cost.toFixed(2)}</div>
                          </div>
                          {item.parts_used && item.parts_used.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium mb-1">Parts Used:</div>
                              <div className="flex flex-wrap gap-1">
                                {item.parts_used.map((part, i) => (
                                  <Badge key={i} variant="outline" className="bg-zinc-700">{part}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.images && item.images.length > 0 && (
                            <div className="mt-3 flex items-center gap-1">
                              <Camera className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-400">{item.images.length} images</span>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-lg p-6 text-center">
                    <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                    <h4 className="text-lg font-medium mb-2">No maintenance records</h4>
                    <p className="text-gray-400 mb-4">Keep track of all service work performed on your vehicle</p>
                    <button 
                      onClick={() => setIsAddingMaintenanceItem(true)}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-[#7FC844] text-black"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Service Record
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Placeholder for other tabs */}
            <TabsContent value="modifications" className="mt-0">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-lg font-bold mb-4">Modifications</h3>
                <div className="bg-zinc-800 rounded-lg p-6 text-center">
                  <Tool className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <h4 className="text-lg font-medium mb-2">No modifications yet</h4>
                  <p className="text-gray-400 mb-4">Track all modifications made to your vehicle</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="detailing" className="mt-0">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-lg font-bold mb-4">Detailing History</h3>
                <div className="bg-zinc-800 rounded-lg p-6 text-center">
                  <Droplets className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <h4 className="text-lg font-medium mb-2">No detailing records yet</h4>
                  <p className="text-gray-400 mb-4">Keep track of all your detailing sessions</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-0">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-lg font-bold mb-4">Documents</h3>
                <div className="bg-zinc-800 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <h4 className="text-lg font-medium mb-2">No documents yet</h4>
                  <p className="text-gray-400 mb-4">Store all important documents for your vehicle</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mood" className="mt-0">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-lg font-bold mb-4">Mood & Energy Log</h3>
                <div className="bg-zinc-800 rounded-lg p-6 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                  <h4 className="text-lg font-medium mb-2">No mood entries yet</h4>
                  <p className="text-gray-400 mb-4">Track how you feel during each drive</p>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </div>
      
      {/* Project Launcher Modal */}
      {showProjectLauncher && (
        <ProjectLauncher
          vehicles={vehicles}
          selectedVehicleId={selectedVehicle?.id}
          onClose={() => setShowProjectLauncher(false)}
          onProjectCreated={(project: any) => {
            setShowProjectLauncher(false);
            toast({
              title: "Project Created",
              description: `Your project "${project.title}" has been created successfully.`,
            });
          }}
        />
      )}
    </div>
  );
};

export default EnhancedGarageVault;
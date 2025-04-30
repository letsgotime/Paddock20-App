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
  Search,
  Paintbrush
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
import VehicleCustomizationPreviewer from "../components/VehicleCustomizationPreviewer";

// Vehicle interface for data structure
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

// EnhancedGarageVaultV2 component
const EnhancedGarageVaultV2: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showProjectLauncher, setShowProjectLauncher] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Dashboard toggles for UI elements
  const [dashboardToggles, setDashboardToggles] = useState({
    showVehicleTelemetry: true,
    showMaintenanceAlerts: true,
    showWeatherData: true,
    showMoodEnergy: true,
    showValuationData: true,
    showDocumentExpiration: true,
    showDetailingSchedule: true,
    showProjectStatus: true,
  });

  // Mock weather data
  const weatherData = {
    temp: 72,
    condition: "Sunny",
    humidity: 45,
    wind: 8,
    location: "Los Angeles, CA"
  };

  // Fetch vehicles from supabase
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

  // Handle dashboard toggle changes
  const handleToggleChange = (key: keyof typeof dashboardToggles) => {
    setDashboardToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower) ||
      vehicle.trim.toLowerCase().includes(searchLower)
    );
  });

  // Format numbers for display
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Get formatted date display
  const getFormattedDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "N/A";
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  // Calculate days until next service
  const getDaysUntilNextService = (nextServiceDate: string | undefined): number => {
    if (!nextServiceDate) return 0;
    
    const today = new Date();
    const serviceDate = new Date(nextServiceDate);
    const timeDiff = serviceDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
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

  // Weather recommendation for detailing
  const getWeatherRecommendation = () => {
    if (weatherData.temp < 50 || weatherData.temp > 90) {
      return {
        isGood: false,
        message: `Temperature (${weatherData.temp}°F) is outside ideal range for detailing.`
      };
    }
    
    if (weatherData.humidity > 80) {
      return {
        isGood: false,
        message: `High humidity (${weatherData.humidity}%) may affect product drying.`
      };
    }
    
    if (weatherData.wind > 15) {
      return {
        isGood: false,
        message: `Wind speed (${weatherData.wind} mph) may cause contaminants to settle.`
      };
    }
    
    if (weatherData.condition === "Rain" || weatherData.condition === "Snow") {
      return {
        isGood: false,
        message: `Current ${weatherData.condition} conditions are not suitable for detailing.`
      };
    }
    
    return {
      isGood: true,
      message: "Ideal conditions for detailing. All parameters within optimal ranges."
    };
  };

  // Get weather recommendation
  const weatherRecommendation = getWeatherRecommendation();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-white bg-gradient-to-r from-[#7FC844] to-blue-500 bg-clip-text text-transparent">
                The Garage Vault
              </span>
              <Badge className="ml-2 bg-[#7FC844] text-black">
                <Crown className="h-3 w-3 mr-1" /> PADDOCK20
              </Badge>
            </h1>
            <p className="text-gray-400 mt-1">
              Central command for your fleet management & vehicle customization
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search vehicles..."
                className="pl-9 bg-zinc-900 border-zinc-800 w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              className="border-zinc-700"
              onClick={() => setShowProjectLauncher(true)}
            >
              <Wrench className="mr-2 h-4 w-4" />
              New Project
            </Button>
            
            <Button 
              onClick={() => toast({ 
                title: "Coming Soon", 
                description: "Vehicle addition feature is in development" 
              })}
              className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        </div>
        
        {/* Dashboard Controls */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#7FC844]" />
              Dashboard Controls
            </h2>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border-zinc-700 ${viewMode === 'grid' ? 'bg-zinc-800' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <GalleryVertical className="h-4 w-4 mr-2" />
                Grid View
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className={`border-zinc-700 ${viewMode === 'list' ? 'bg-zinc-800' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showVehicleTelemetry}
                onCheckedChange={() => handleToggleChange('showVehicleTelemetry')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Vehicle Telemetry</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showMaintenanceAlerts}
                onCheckedChange={() => handleToggleChange('showMaintenanceAlerts')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Maintenance Alerts</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showWeatherData}
                onCheckedChange={() => handleToggleChange('showWeatherData')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Weather Data</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showMoodEnergy}
                onCheckedChange={() => handleToggleChange('showMoodEnergy')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Mood & Energy</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showValuationData}
                onCheckedChange={() => handleToggleChange('showValuationData')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Valuation Data</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showDocumentExpiration}
                onCheckedChange={() => handleToggleChange('showDocumentExpiration')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Document Expiration</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showDetailingSchedule}
                onCheckedChange={() => handleToggleChange('showDetailingSchedule')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Detailing Schedule</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={dashboardToggles.showProjectStatus}
                onCheckedChange={() => handleToggleChange('showProjectStatus')}
                className="data-[state=checked]:bg-[#7FC844]"
              />
              <span className="text-sm">Project Status</span>
            </div>
          </div>
        </div>
        
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Fleet Stats */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Car className="h-5 w-5 text-[#7FC844] mr-2" />
              Fleet Overview
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
            
            <div className="bg-zinc-800 rounded-lg">
              <div className="p-3 flex items-center justify-between border-b border-zinc-700">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                    <Wrench className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">Oil Change Completed</div>
                    <div className="text-xs text-gray-400">
                      Today • Ferrari 458 Italia
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 flex items-center justify-between border-b border-zinc-700">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <Droplets className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium">Detailing Session</div>
                    <div className="text-xs text-gray-400">
                      Yesterday • Porsche 911 GT3
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-900/30 rounded-full flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-medium">Insurance Renewed</div>
                    <div className="text-xs text-gray-400">
                      3 days ago • Aston Martin DB11
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weather & Environment */}
          {dashboardToggles.showWeatherData && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CloudRain className="h-5 w-5 text-[#7FC844] mr-2" />
                Weather & Environment
              </h2>
              
              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-gray-400 text-sm">{weatherData.location}</div>
                    <div className="text-2xl font-bold">{weatherData.temp}°F</div>
                  </div>
                  
                  <div className="text-5xl text-[#7FC844]">
                    {weatherData.condition === "Sunny" && <Sun />}
                    {weatherData.condition === "Rainy" && <CloudRain />}
                    {weatherData.condition === "Cloudy" && <CloudRain />}
                    {!["Sunny", "Rainy", "Cloudy"].includes(weatherData.condition) && <Sun />}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-zinc-700 rounded p-2 text-center">
                    <div className="text-xs text-gray-300 mb-1">Humidity</div>
                    <div className="font-bold flex items-center justify-center">
                      <Droplets className="h-3 w-3 mr-1 text-blue-400" />
                      {weatherData.humidity}%
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700 rounded p-2 text-center">
                    <div className="text-xs text-gray-300 mb-1">Wind</div>
                    <div className="font-bold flex items-center justify-center">
                      <Wind className="h-3 w-3 mr-1 text-blue-400" />
                      {weatherData.wind} mph
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700 rounded p-2 text-center">
                    <div className="text-xs text-gray-300 mb-1">UV Index</div>
                    <div className="font-bold flex items-center justify-center">
                      <Sun className="h-3 w-3 mr-1 text-yellow-400" />
                      4
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
              {dashboardToggles.showMaintenanceAlerts && (
                <>
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Wrench className="h-4 w-4 text-[#7FC844] mr-2" />
                    Upcoming Maintenance
                  </h3>
                  
                  <div className="bg-zinc-800 rounded-lg">
                    <div className="p-3 border-b border-zinc-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-red-900/30 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium">Ferrari 458 Italia</div>
                            <div className="text-xs text-gray-400">
                              Oil change due in 5 days
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-red-600">Urgent</Badge>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-yellow-400" />
                          </div>
                          <div>
                            <div className="font-medium">Porsche 911 GT3</div>
                            <div className="text-xs text-gray-400">
                              Tire rotation due in 2 weeks
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-yellow-600">Soon</Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Vehicle Grid */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Car className="h-5 w-5 text-[#7FC844] mr-2" />
              Your Vehicles
            </h2>
            
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'} found
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7FC844]"></div>
            </div>
          ) : (
            <>
              {filteredVehicles.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredVehicles.map(vehicle => (
                    <div 
                      key={vehicle.id}
                      className={`bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#7FC844] hover:shadow-lg ${
                        viewMode === 'grid' ? '' : 'flex'
                      }`}
                    >
                      <div className={`${viewMode === 'grid' ? 'h-48' : 'h-40 w-64 flex-shrink-0'} relative overflow-hidden`}>
                        <img 
                          src={vehicle.image_url} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {renderStatusBadge(vehicle.status)}
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <h3 className="text-xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                          <p className="text-gray-400 text-sm">{vehicle.trim}</p>
                          
                          <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4">
                            <div className="flex items-center text-sm">
                              <Gauge className="h-4 w-4 text-[#7FC844] mr-2" />
                              {formatNumber(vehicle.mileage)} miles
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Fuel className="h-4 w-4 text-[#7FC844] mr-2" />
                              {vehicle.fuel_type}
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-[#7FC844] mr-2" />
                              Purchased {getFormattedDate(vehicle.purchase_date)}
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <BarChart3 className="h-4 w-4 text-[#7FC844] mr-2" />
                              ${formatNumber(vehicle.current_value)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-zinc-700 flex-1"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowCustomizer(true);
                            }}
                          >
                            <Paintbrush className="h-4 w-4 mr-2" />
                            Customize
                          </Button>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 flex-1"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowProjectLauncher(true);
                            }}
                          >
                            <Wrench className="h-4 w-4 mr-2" />
                            New Project
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-800 rounded-lg p-8 text-center">
                  <Car className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-xl font-bold mb-2">No vehicles found</h3>
                  <p className="text-zinc-400 mb-6">Try adjusting your search criteria</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Project Launcher Dialog */}
      {showProjectLauncher && selectedVehicle && (
        <Dialog open={showProjectLauncher} onOpenChange={setShowProjectLauncher}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl">
            <ProjectLauncher 
              vehicles={vehicles}
              selectedVehicleId={selectedVehicle.id}
              onClose={() => setShowProjectLauncher(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Vehicle Customization Dialog */}
      {showCustomizer && selectedVehicle && (
        <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-6xl">
            <VehicleCustomizationPreviewer 
              vehicle={selectedVehicle}
              onClose={() => setShowCustomizer(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedGarageVaultV2;
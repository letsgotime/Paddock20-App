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
  PlusSquare
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

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

// Mock OBD data
const mockOBDData = {
  rpm: 1250,
  speed: 0,
  engineTemp: 195,
  fuelLevel: 87,
  oilPressure: 42,
  batteryVoltage: 12.7,
  outsideTemp: 75,
  tirePresFront: 35,
  tiresPresRear: 36,
  throttlePosition: 0,
  oilTemp: 175,
  coolantTemp: 192,
  airIntakeTemp: 68,
  timingAdvance: 12.5,
  diagnosticCodes: []
};

// Mock mood/energy tracking data
const mockMoodData = {
  lastDrive: {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    duration: 88, // minutes
    distance: 42, // miles
    roads: ["Mountain", "Highway", "City"],
    weather: "Sunny",
    mood: 9.2,
    energy: 8.7,
    notes: "Fantastic drive along the coast. The car performed beautifully around the tight mountain curves."
  },
  history: [
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), mood: 9.2, energy: 8.7 },
    { date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), mood: 7.5, energy: 8.0 },
    { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), mood: 6.8, energy: 7.3 },
    { date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), mood: 8.9, energy: 9.1 },
    { date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), mood: 7.2, energy: 6.6 },
  ]
};

// Weather mock data
const mockWeatherData = {
  current: {
    temp: 75,
    condition: "Clear",
    humidity: 45,
    wind: 5,
    uv: 6,
    visibility: 10,
    cloudCover: 5,
    pressure: 1015,
    isDetailingFriendly: true,
    icon: <Sun className="h-8 w-8 text-yellow-400" />,
    recommendation: "Excellent conditions for detailing. Apply UV protectant due to high UV index."
  },
  forecast: [
    { day: "Today", temp: 75, condition: "Clear", icon: <Sun className="h-5 w-5 text-yellow-400" />, detailing: "Excellent" },
    { day: "Tomorrow", temp: 72, condition: "Partly Cloudy", icon: <Sun className="h-5 w-5 text-yellow-400" />, detailing: "Good" },
    { day: "Wed", temp: 68, condition: "Cloudy", icon: <CloudRain className="h-5 w-5 text-gray-400" />, detailing: "Fair" },
    { day: "Thu", temp: 70, condition: "Rain", icon: <CloudRain className="h-5 w-5 text-blue-400" />, detailing: "Poor" },
    { day: "Fri", temp: 75, condition: "Clear", icon: <Sun className="h-5 w-5 text-yellow-400" />, detailing: "Excellent" },
  ]
};

const ManifestationStation: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [obdData, setObdData] = useState(mockOBDData);
  const [moodData, setMoodData] = useState(mockMoodData);
  const [weatherData, setWeatherData] = useState(mockWeatherData);
  const [isConnectedToOBD, setIsConnectedToOBD] = useState(false);
  
  // Dashboard display toggles
  const [dashboardToggles, setDashboardToggles] = useState({
    showTelemetry: true,
    showMaintenanceAlerts: true,
    showWeatherData: true,
    showMoodEnergy: true,
    showValuationData: true,
    showDocumentExpiration: true,
    showDetailingSchedule: true,
    showProjectStatus: true
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
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
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
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
        
        const vehiclesData = data || [];
        setVehicles(vehiclesData);
        
        // Set the first vehicle as selected if none is selected
        if (vehiclesData.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(vehiclesData[0].id);
        }
      } catch (error) {
        console.error('Error in fetchVehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Get selected vehicle
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  // Function to get formatted date
  const getFormattedDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Function to get days until date
  const getDaysUntil = (dateString?: string): number => {
    if (!dateString) return 999;
    const today = new Date();
    const futureDate = new Date(dateString);
    const diffTime = futureDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Generate urgency class based on days
  const getUrgencyClass = (days: number): string => {
    if (days <= 7) return "text-red-500";
    if (days <= 30) return "text-orange-500";
    if (days <= 60) return "text-yellow-500";
    return "text-green-500";
  };

  // Function to format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle toggle changes
  const handleToggleChange = (toggleName: string) => {
    setDashboardToggles(prev => ({
      ...prev,
      [toggleName]: !prev[toggleName]
    }));
  };

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

  // Render vehicle status badge
  const renderStatusBadge = (status: string) => {
    const badges: Record<string, { color: string, icon: React.ReactNode }> = {
      "Active": { color: "bg-green-500", icon: <Check className="h-3 w-3" /> },
      "Stored": { color: "bg-blue-500", icon: <Clock className="h-3 w-3" /> },
      "Maintenance": { color: "bg-yellow-500", icon: <Wrench className="h-3 w-3" /> },
      "Selling": { color: "bg-purple-500", icon: <Sparkles className="h-3 w-3" /> },
      "Inactive": { color: "bg-gray-500", icon: <AlertTriangle className="h-3 w-3" /> }
    };
    
    const { color, icon } = badges[status] || badges["Inactive"];
    
    return (
      <Badge className={`${color} text-white text-xs flex items-center gap-1 px-2 py-0.5`}>
        {icon}
        {status}
      </Badge>
    );
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
              Manifestation Station
              {userProfile?.membership_tier === "paddock20" && (
                <Badge className="ml-2 bg-[#7FC844] text-black flex items-center">
                  <Crown className="h-3 w-3 mr-1" /> PADDOCK20
                </Badge>
              )}
            </h1>
            <p className="text-gray-400 mt-1">
              {userProfile ? 
                `Welcome back, ${userProfile.first_name}. You have ${formatNumber(userProfile.points)} GoTime points.` : 
                "Loading profile information..."}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                toast({
                  title: "Goal Setting",
                  description: "Opening goal tracking interface...",
                });
              }}
              className="bg-zinc-800 text-white hover:bg-zinc-700 py-2 px-4 rounded-lg transition flex items-center gap-2"
            >
              <BarChart className="h-4 w-4 text-[#7FC844]" />
              <span>Goal Tracker</span>
            </button>
            <Link href="/add-vehicle">
              <button className="bg-[#7FC844] text-black py-2 px-4 rounded-lg transition hover:bg-[#6cb33a] flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Add Vehicle</span>
              </button>
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7FC844]"></div>
          </div>
        ) : (
          <>
            {/* Vehicle Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
              {vehicles.map(vehicle => (
                <div 
                  key={vehicle.id}
                  className={`bg-zinc-900 border rounded-xl overflow-hidden cursor-pointer transition-all ${
                    vehicle.id === selectedVehicleId 
                      ? 'border-[#7FC844] shadow-[0_0_10px_rgba(127,200,68,0.3)]' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  <div className="relative h-32">
                    <img 
                      src={vehicle.image_url} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                      <div className="flex justify-between items-end">
                        <h3 className="text-white font-semibold text-lg drop-shadow-md">
                          {vehicle.year} {vehicle.make}
                        </h3>
                        {renderStatusBadge(vehicle.status)}
                      </div>
                      <p className="text-white/90 text-sm drop-shadow-md">{vehicle.model} {vehicle.trim}</p>
                    </div>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-[#7FC844]" />
                      {formatNumber(vehicle.mileage)} mi
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <Badge className="bg-zinc-800 text-gray-300 hover:bg-zinc-700">{vehicle.maintenance_count || 0}</Badge>
                      <Badge className="bg-zinc-800 text-gray-300 hover:bg-zinc-700">{vehicle.modifications_count || 0}</Badge>
                      <Badge className="bg-zinc-800 text-gray-300 hover:bg-zinc-700">{vehicle.documents_count || 0}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Vehicle Card */}
              <Link href="/add-vehicle">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col items-center justify-center py-8 cursor-pointer hover:border-[#7FC844] transition-all">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                    <PlusSquare className="h-8 w-8 text-[#7FC844]" />
                  </div>
                  <p className="text-gray-400 font-medium">Add New Vehicle</p>
                </div>
              </Link>
            </div>
            
            {selectedVehicle && (
              <>
                {/* Main Navigation */}
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
                          isConnectedToOBD 
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-zinc-800 text-white hover:bg-zinc-700"
                        } transition`}
                      >
                        <Zap className="h-4 w-4" />
                        {isConnectedToOBD ? "Connected" : "Connect OBD"}
                      </button>
                      <button 
                        onClick={() => {
                          toast({
                            title: "Editing Vehicle",
                            description: "Opening vehicle edit form...",
                          });
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Tab Content */}
                <TabsContent value="dashboard" className="p-0 m-0">
                  {/* Why You're Here / What You Get / How to Use It Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Why You're Here */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <span className="text-[#7FC844]">🧭</span> Why You're Here
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        Manifestation Station™ isn't about "wishing."
                        It's about working.
                        Every goal you log here — every car, watch, home, or milestone — comes with a plan built the way real winners build:
                        Daily movement. Daily mindset. Daily gratitude.
                        Because real manifestation isn't magic—it's momentum.
                      </p>
                    </div>
                    
                    {/* What You Get */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <span className="text-[#7FC844]">✅</span> What You Get
                      </h3>
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>Dream Vault: Log your cars, watches, experiences, investments.</li>
                        <li>Goal Telemetry: Set your target, your funding path, and your timeline.</li>
                        <li>Milestone Tracking: Break down the dream into checkable steps.</li>
                        <li>Daily Discipline Tracker: Mind, Body, Spirit</li>
                        <li>Proof of Progress System: See your real manifestation rate, not just your wish rate.</li>
                      </ul>
                    </div>
                    
                    {/* How to Use It */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <span className="text-[#7FC844]">🚀</span> How to Use It
                      </h3>
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>Set Goals: Add dream assets or experiences.</li>
                        <li>Link Daily Disciplines: Choose your mind, body, spirit focuses.</li>
                        <li>Track Progress: Update every week or day as you advance.</li>
                        <li>Celebrate Completions: Archive manifested goals with photos, memories, and timestamps.</li>
                        <li>Level Up: After each goal, raise your standards and manifest smarter.</li>
                      </ul>
                    </div>
                  </div>
                
                  {/* Dashboard Settings */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
                    <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-5 w-5 text-[#7FC844]" />
                        Dashboard Controls
                      </h3>
                      <button 
                        onClick={() => {
                          Object.keys(dashboardToggles).forEach(key => {
                            setDashboardToggles(prev => ({
                              ...prev,
                              [key]: true
                            }));
                          });
                          toast({
                            title: "Dashboard Reset",
                            description: "All dashboard components are now visible.",
                          });
                        }}
                        className="text-sm text-[#7FC844] hover:text-[#6cb33a] transition"
                      >
                        Show All
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(dashboardToggles).map(([key, value]) => (
                        <div 
                          key={key}
                          className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg"
                        >
                          <span className="text-sm">{key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Switch 
                            checked={value} 
                            onCheckedChange={() => handleToggleChange(key)} 
                            className="data-[state=checked]:bg-[#7FC844]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Main Dashboard Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Stats and Alerts */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Telemetry Dashboard */}
                      {dashboardToggles.showTelemetry && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Gauge className="h-5 w-5 text-[#7FC844]" />
                              Live Telemetry
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isConnectedToOBD ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="text-xs text-gray-400">{isConnectedToOBD ? 'Connected' : 'Disconnected'}</span>
                            </div>
                          </div>
                          
                          <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Main Gauges */}
                              <div className="flex justify-around">
                                {/* RPM Gauge */}
                                <div className="flex flex-col items-center">
                                  <div className="w-32 h-32 rounded-full border-8 border-zinc-800 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full overflow-hidden">
                                      <div 
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#7FC844] to-yellow-500 transition-all duration-300"
                                        style={{ height: `${(obdData.rpm / 7000) * 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center">
                                      <span className="text-2xl font-bold">{obdData.rpm}</span>
                                      <span className="text-xs text-gray-400">RPM</span>
                                    </div>
                                  </div>
                                  <span className="mt-2 text-sm">Tachometer</span>
                                </div>
                                
                                {/* Speed Gauge */}
                                <div className="flex flex-col items-center">
                                  <div className="w-32 h-32 rounded-full border-8 border-zinc-800 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full overflow-hidden">
                                      <div 
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-[#7FC844] transition-all duration-300"
                                        style={{ height: `${(obdData.speed / 160) * 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center">
                                      <span className="text-2xl font-bold">{obdData.speed}</span>
                                      <span className="text-xs text-gray-400">MPH</span>
                                    </div>
                                  </div>
                                  <span className="mt-2 text-sm">Speedometer</span>
                                </div>
                              </div>
                              
                              {/* Secondary Gauges */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-800 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-400">Fuel Level</span>
                                    <span className="text-sm font-medium">{obdData.fuelLevel}%</span>
                                  </div>
                                  <Progress value={obdData.fuelLevel} className="h-2 bg-zinc-700" indicatorClassName="bg-blue-500" />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>E</span>
                                    <span>F</span>
                                  </div>
                                </div>
                                
                                <div className="bg-zinc-800 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-400">Engine Temp</span>
                                    <span className="text-sm font-medium">{obdData.engineTemp}°F</span>
                                  </div>
                                  <Progress 
                                    value={(obdData.engineTemp - 100) / 180 * 100} 
                                    className="h-2 bg-zinc-700" 
                                    indicatorClassName={obdData.engineTemp > 230 ? "bg-red-500" : "bg-[#7FC844]"}
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Cold</span>
                                    <span>Hot</span>
                                  </div>
                                </div>
                                
                                <div className="bg-zinc-800 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-400">Oil Pressure</span>
                                    <span className="text-sm font-medium">{obdData.oilPressure} PSI</span>
                                  </div>
                                  <Progress 
                                    value={(obdData.oilPressure / 80) * 100} 
                                    className="h-2 bg-zinc-700" 
                                    indicatorClassName={obdData.oilPressure < 20 ? "bg-red-500" : "bg-[#7FC844]"}
                                  />
                                </div>
                                
                                <div className="bg-zinc-800 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-400">Battery</span>
                                    <span className="text-sm font-medium">{obdData.batteryVoltage}v</span>
                                  </div>
                                  <Progress 
                                    value={((obdData.batteryVoltage - 11) / 3) * 100} 
                                    className="h-2 bg-zinc-700" 
                                    indicatorClassName={obdData.batteryVoltage < 12 ? "bg-red-500" : "bg-[#7FC844]"}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional Data Row */}
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
                              <div className="bg-zinc-800 rounded-lg p-3 flex flex-col items-center">
                                <span className="text-xs text-gray-400">Coolant</span>
                                <span className="text-lg font-medium">{obdData.coolantTemp}°F</span>
                              </div>
                              
                              <div className="bg-zinc-800 rounded-lg p-3 flex flex-col items-center">
                                <span className="text-xs text-gray-400">Oil Temp</span>
                                <span className="text-lg font-medium">{obdData.oilTemp}°F</span>
                              </div>
                              
                              <div className="bg-zinc-800 rounded-lg p-3 flex flex-col items-center">
                                <span className="text-xs text-gray-400">Intake</span>
                                <span className="text-lg font-medium">{obdData.airIntakeTemp}°F</span>
                              </div>
                              
                              <div className="bg-zinc-800 rounded-lg p-3 flex flex-col items-center">
                                <span className="text-xs text-gray-400">Throttle</span>
                                <span className="text-lg font-medium">{obdData.throttlePosition}%</span>
                              </div>
                              
                              <div className="bg-zinc-800 rounded-lg p-3 flex flex-col items-center">
                                <span className="text-xs text-gray-400">Front PSI</span>
                                <span className="text-lg font-medium">{obdData.tirePresFront}</span>
                              </div>
                              
                              <div className="bg-zinc-800 rounded-lg p-3 flex flex-col items-center">
                                <span className="text-xs text-gray-400">Rear PSI</span>
                                <span className="text-lg font-medium">{obdData.tiresPresRear}</span>
                              </div>
                            </div>
                            
                            {!isConnectedToOBD && (
                              <div className="mt-6 flex justify-center">
                                <button 
                                  onClick={handleOBDConnect}
                                  className="bg-[#7FC844] hover:bg-[#6cb33a] text-black py-2 px-6 rounded-lg transition flex items-center gap-2"
                                >
                                  <Zap className="h-4 w-4" />
                                  Connect to Vehicle OBD
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Maintenance Alerts */}
                      {dashboardToggles.showMaintenanceAlerts && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-[#7FC844]" />
                              Maintenance Alerts
                            </h3>
                            <button 
                              onClick={() => {
                                toast({
                                  title: "Maintenance Schedule",
                                  description: "Opening full maintenance schedule...",
                                });
                                setCurrentTab("maintenance");
                              }}
                              className="text-sm text-[#7FC844] hover:text-[#6cb33a] transition flex items-center gap-1"
                            >
                              View All
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="p-5">
                            <div className="space-y-4">
                              {/* Next Service */}
                              <div className="bg-zinc-800 rounded-lg p-4">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="text-lg font-medium">Next Service</h4>
                                    <p className="text-gray-400 flex items-center gap-1.5">
                                      <Calendar className="h-4 w-4 text-[#7FC844]" />
                                      {selectedVehicle.next_service_date ? getFormattedDate(selectedVehicle.next_service_date) : "Not scheduled"}
                                      {selectedVehicle.next_service_date && (
                                        <span className={getUrgencyClass(getDaysUntil(selectedVehicle.next_service_date))}>
                                          ({getDaysUntil(selectedVehicle.next_service_date)} days)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <button 
                                    className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition text-sm"
                                    onClick={() => {
                                      toast({
                                        title: "Service Scheduled",
                                        description: "Your service appointment has been scheduled.",
                                      });
                                    }}
                                  >
                                    Schedule
                                  </button>
                                </div>
                                
                                <div className="mt-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Miles until service:</span>
                                    <span>{formatNumber(selectedVehicle.next_service_miles ? selectedVehicle.next_service_miles - selectedVehicle.mileage : 0)} miles</span>
                                  </div>
                                  <Progress 
                                    value={selectedVehicle.next_service_miles ? 
                                      Math.min(100, 100 - ((selectedVehicle.next_service_miles - selectedVehicle.mileage) / 5000 * 100)) : 
                                      0
                                    } 
                                    className="h-2 bg-zinc-700" 
                                    indicatorClassName={
                                      selectedVehicle.next_service_miles && 
                                      (selectedVehicle.next_service_miles - selectedVehicle.mileage) < 500 ? 
                                        "bg-red-500" : "bg-[#7FC844]"
                                    }
                                  />
                                </div>
                              </div>
                              
                              {/* Document Expirations */}
                              {dashboardToggles.showDocumentExpiration && (
                                <>
                                  {/* Insurance Renewal */}
                                  {selectedVehicle.insurance_renewal_date && (
                                    <div className="bg-zinc-800 rounded-lg p-4">
                                      <div className="flex justify-between">
                                        <div>
                                          <h4 className="text-lg font-medium">Insurance Renewal</h4>
                                          <p className="text-gray-400 flex items-center gap-1.5">
                                            <FileText className="h-4 w-4 text-[#7FC844]" />
                                            {getFormattedDate(selectedVehicle.insurance_renewal_date)}
                                            <span className={getUrgencyClass(getDaysUntil(selectedVehicle.insurance_renewal_date))}>
                                              ({getDaysUntil(selectedVehicle.insurance_renewal_date)} days)
                                            </span>
                                          </p>
                                        </div>
                                        <button 
                                          className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition text-sm"
                                          onClick={() => {
                                            toast({
                                              title: "Insurance Reminder",
                                              description: "You'll be reminded before your insurance expires.",
                                            });
                                          }}
                                        >
                                          Set Reminder
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Inspection Due */}
                                  {selectedVehicle.inspection_due_date && (
                                    <div className="bg-zinc-800 rounded-lg p-4">
                                      <div className="flex justify-between">
                                        <div>
                                          <h4 className="text-lg font-medium">Safety Inspection</h4>
                                          <p className="text-gray-400 flex items-center gap-1.5">
                                            <ClipboardList className="h-4 w-4 text-[#7FC844]" />
                                            {getFormattedDate(selectedVehicle.inspection_due_date)}
                                            <span className={getUrgencyClass(getDaysUntil(selectedVehicle.inspection_due_date))}>
                                              ({getDaysUntil(selectedVehicle.inspection_due_date)} days)
                                            </span>
                                          </p>
                                        </div>
                                        <button 
                                          className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition text-sm"
                                          onClick={() => {
                                            toast({
                                              title: "Inspection Scheduled",
                                              description: "Your inspection appointment has been scheduled.",
                                            });
                                          }}
                                        >
                                          Schedule
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              
                              {/* Diagnostic Status */}
                              {isConnectedToOBD && obdData.diagnosticCodes.length === 0 && (
                                <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4 flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-green-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">No Diagnostic Codes</h4>
                                    <p className="text-sm text-gray-400">Your vehicle's onboard computer reports no issues</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Mood and Energy */}
                      {dashboardToggles.showMoodEnergy && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-[#7FC844]" />
                              Mood & Energy Tracking
                            </h3>
                            <button 
                              onClick={() => {
                                toast({
                                  title: "Mood Tracking",
                                  description: "Opening full mood and energy tracking history...",
                                });
                                setCurrentTab("mood");
                              }}
                              className="text-sm text-[#7FC844] hover:text-[#6cb33a] transition flex items-center gap-1"
                            >
                              View Full History
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Last Drive Summary */}
                              <div className="bg-zinc-800 rounded-lg p-4">
                                <h4 className="text-lg font-medium mb-2">Last Drive Experience</h4>
                                <div className="mb-4">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Date:</span>
                                    <span>{moodData.lastDrive.date.toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Duration:</span>
                                    <span>{moodData.lastDrive.duration} minutes</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Distance:</span>
                                    <span>{moodData.lastDrive.distance} miles</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Weather:</span>
                                    <span>{moodData.lastDrive.weather}</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Road Types:</span>
                                    <span>{moodData.lastDrive.roads.join(", ")}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm text-gray-400">Mood Score</span>
                                      <span className="text-sm font-medium">{moodData.lastDrive.mood}/10</span>
                                    </div>
                                    <Progress 
                                      value={moodData.lastDrive.mood * 10} 
                                      className="h-2 bg-zinc-700" 
                                      indicatorClassName="bg-purple-500" 
                                    />
                                  </div>
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm text-gray-400">Energy Level</span>
                                      <span className="text-sm font-medium">{moodData.lastDrive.energy}/10</span>
                                    </div>
                                    <Progress 
                                      value={moodData.lastDrive.energy * 10} 
                                      className="h-2 bg-zinc-700" 
                                      indicatorClassName="bg-blue-500" 
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Stats and New Entry */}
                              <div className="space-y-4">
                                <div className="bg-zinc-800 rounded-lg p-4">
                                  <h4 className="font-medium mb-2">Drive Statistics</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-900 rounded-lg p-3 text-center">
                                      <span className="text-xs text-gray-400">Avg. Mood</span>
                                      <p className="text-xl font-bold text-purple-400">8.2</p>
                                    </div>
                                    <div className="bg-zinc-900 rounded-lg p-3 text-center">
                                      <span className="text-xs text-gray-400">Avg. Energy</span>
                                      <p className="text-xl font-bold text-blue-400">7.9</p>
                                    </div>
                                    <div className="bg-zinc-900 rounded-lg p-3 text-center">
                                      <span className="text-xs text-gray-400">Total Drives</span>
                                      <p className="text-xl font-bold text-[#7FC844]">23</p>
                                    </div>
                                    <div className="bg-zinc-900 rounded-lg p-3 text-center">
                                      <span className="text-xs text-gray-400">Favorite Road</span>
                                      <p className="text-md font-medium text-[#7FC844]">Mountain</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={() => {
                                    toast({
                                      title: "New Drive Entry",
                                      description: "Opening form to record a new drive experience...",
                                    });
                                  }}
                                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                  <Sparkles className="h-4 w-4" />
                                  Record New Drive Experience
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Detailing Schedule */}
                      {dashboardToggles.showDetailingSchedule && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Droplets className="h-5 w-5 text-[#7FC844]" />
                              Detailing Station
                            </h3>
                            <button 
                              onClick={() => {
                                toast({
                                  title: "Detailing Center",
                                  description: "Opening detailing management center...",
                                });
                                setCurrentTab("detailing");
                              }}
                              className="text-sm text-[#7FC844] hover:text-[#6cb33a] transition flex items-center gap-1"
                            >
                              Open Detailing Center
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Weather Advisory */}
                              {dashboardToggles.showWeatherData && (
                                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-4">
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Thermometer className="h-4 w-4 text-[#7FC844]" />
                                    Current Weather
                                  </h4>
                                  
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      {weatherData.current.icon}
                                      <div>
                                        <p className="text-xl font-bold">{weatherData.current.temp}°F</p>
                                        <p className="text-sm text-gray-400">{weatherData.current.condition}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm">Humidity: {weatherData.current.humidity}%</p>
                                      <p className="text-sm">Wind: {weatherData.current.wind} mph</p>
                                    </div>
                                  </div>
                                  
                                  <div className={`rounded-lg p-3 mb-3 ${
                                    weatherRecommendation.isGood 
                                      ? "bg-green-500/10 border border-green-500/20" 
                                      : "bg-orange-500/10 border border-orange-500/20"
                                  }`}>
                                    <p className="text-sm">
                                      <span className="font-medium">
                                        {weatherRecommendation.isGood ? "Favorable for Detailing: " : "Caution for Detailing: "}
                                      </span>
                                      {weatherRecommendation.message}
                                    </p>
                                  </div>
                                  
                                  <div className="flex justify-between space-x-1">
                                    {weatherData.forecast.map((day, i) => (
                                      <div key={i} className="flex-1 text-center bg-zinc-800 rounded-lg p-2">
                                        <p className="text-xs mb-1">{day.day}</p>
                                        {day.icon}
                                        <p className="text-sm font-medium mt-1">{day.temp}°</p>
                                        <Badge className={
                                          day.detailing === "Excellent" ? "bg-green-500/20 text-green-400" :
                                          day.detailing === "Good" ? "bg-blue-500/20 text-blue-400" :
                                          day.detailing === "Fair" ? "bg-yellow-500/20 text-yellow-400" :
                                          "bg-red-500/20 text-red-400"
                                        }>
                                          {day.detailing}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Last Detail and Schedule */}
                              <div className="space-y-4">
                                <div className="bg-zinc-800 rounded-lg p-4">
                                  <h4 className="font-medium mb-2">Last Detail Session</h4>
                                  
                                  {selectedVehicle.last_detailed_date ? (
                                    <>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Date:</span>
                                        <span>{getFormattedDate(selectedVehicle.last_detailed_date)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Type:</span>
                                        <span>Full Exterior & Interior Detail</span>
                                      </div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Protection:</span>
                                        <span>Ceramic Coating (2-year)</span>
                                      </div>
                                      
                                      <div className="mt-3 pt-3 border-t border-zinc-700">
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-400">Days since last detail:</span>
                                          <span>{-getDaysUntil(selectedVehicle.last_detailed_date)} days</span>
                                        </div>
                                        <Progress 
                                          value={Math.min(100, (-getDaysUntil(selectedVehicle.last_detailed_date) / 90) * 100)} 
                                          className="h-2 bg-zinc-700" 
                                          indicatorClassName={
                                            -getDaysUntil(selectedVehicle.last_detailed_date) > 60 
                                              ? "bg-orange-500" 
                                              : "bg-[#7FC844]"
                                          }
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center py-3 text-gray-400">
                                      <p>No detailing records found</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      toast({
                                        title: "Detail Scheduled",
                                        description: "Your detailing session has been scheduled.",
                                      });
                                    }}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition text-sm"
                                  >
                                    Schedule Detail
                                  </button>
                                  <button 
                                    onClick={() => {
                                      toast({
                                        title: "New Detailing Session",
                                        description: "Starting new detailing session...",
                                      });
                                      setCurrentTab("detailing");
                                    }}
                                    className="flex-1 bg-[#7FC844] hover:bg-[#6cb33a] text-black py-2 rounded-lg transition text-sm"
                                  >
                                    Start Session
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Column - Secondary Stats */}
                    <div className="space-y-6">
                      {/* Vehicle Stats Summary */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-[#7FC844]" />
                            Vehicle Stats
                          </h3>
                        </div>
                        
                        <div className="p-5">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-zinc-800 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Purchase Price</p>
                              <p className="text-xl font-bold">${formatNumber(selectedVehicle.purchase_price)}</p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Current Value</p>
                              <p className="text-xl font-bold">${formatNumber(selectedVehicle.current_value)}</p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Maintenance Records</p>
                              <p className="text-xl font-bold">{selectedVehicle.maintenance_count || 0}</p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Modifications</p>
                              <p className="text-xl font-bold">{selectedVehicle.modifications_count || 0}</p>
                            </div>
                          </div>
                          
                          {dashboardToggles.showValuationData && (
                            <div className="bg-zinc-800 rounded-lg p-4">
                              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                                <LineChart className="h-4 w-4 text-[#7FC844]" />
                                Value Trend
                              </h4>
                              <div className="bg-zinc-900 rounded-lg p-3 h-32 flex items-center justify-center text-xs text-gray-500 mb-3">
                                Value trend chart visualization would appear here
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Change since purchase:</span>
                                <Badge className={
                                  selectedVehicle.current_value > selectedVehicle.purchase_price 
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }>
                                  {selectedVehicle.current_value > selectedVehicle.purchase_price ? "+" : ""}
                                  {(((selectedVehicle.current_value - selectedVehicle.purchase_price) / selectedVehicle.purchase_price) * 100).toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Project Status */}
                      {dashboardToggles.showProjectStatus && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Tool className="h-5 w-5 text-[#7FC844]" />
                              Active Projects
                            </h3>
                            <button 
                              onClick={() => {
                                toast({
                                  title: "New Project",
                                  description: "Creating new vehicle project...",
                                });
                              }}
                              className="text-sm text-[#7FC844] hover:text-[#6cb33a] transition flex items-center gap-1"
                            >
                              <PlusCircle className="h-4 w-4" />
                              New Project
                            </button>
                          </div>
                          
                          <div className="p-3">
                            <div className="space-y-2">
                              <div className="bg-zinc-800 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">Exhaust Upgrade</h4>
                                    <p className="text-xs text-gray-400">Started 2 weeks ago</p>
                                  </div>
                                  <Badge className="bg-yellow-500/20 text-yellow-400">In Progress</Badge>
                                </div>
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Progress:</span>
                                    <span>65%</span>
                                  </div>
                                  <Progress value={65} className="h-1.5 bg-zinc-700" indicatorClassName="bg-[#7FC844]" />
                                </div>
                              </div>
                              
                              <div className="bg-zinc-800 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">Winter Wheel Setup</h4>
                                    <p className="text-xs text-gray-400">Started 3 days ago</p>
                                  </div>
                                  <Badge className="bg-blue-500/20 text-blue-400">Planning</Badge>
                                </div>
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Progress:</span>
                                    <span>15%</span>
                                  </div>
                                  <Progress value={15} className="h-1.5 bg-zinc-700" indicatorClassName="bg-[#7FC844]" />
                                </div>
                              </div>
                              
                              <div className="bg-zinc-800 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">Interior Carbon Trim</h4>
                                    <p className="text-xs text-gray-400">Completed last month</p>
                                  </div>
                                  <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
                                </div>
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Progress:</span>
                                    <span>100%</span>
                                  </div>
                                  <Progress value={100} className="h-1.5 bg-zinc-700" indicatorClassName="bg-[#7FC844]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-[#7FC844]" />
                            Quick Actions
                          </h3>
                        </div>
                        
                        <div className="p-5">
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => {
                                toast({
                                  title: "Service Log",
                                  description: "Adding new service record...",
                                });
                                setCurrentTab("maintenance");
                              }}
                              className="bg-zinc-800 hover:bg-zinc-700 transition rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                            >
                              <Wrench className="h-6 w-6 text-[#7FC844]" />
                              <span className="text-sm">Log Service</span>
                            </button>
                            
                            <button 
                              onClick={() => {
                                toast({
                                  title: "Modification",
                                  description: "Adding new modification record...",
                                });
                                setCurrentTab("modifications");
                              }}
                              className="bg-zinc-800 hover:bg-zinc-700 transition rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                            >
                              <Tool className="h-6 w-6 text-[#7FC844]" />
                              <span className="text-sm">Add Modification</span>
                            </button>
                            
                            <button 
                              onClick={() => {
                                toast({
                                  title: "Photo Upload",
                                  description: "Opening photo upload interface...",
                                });
                              }}
                              className="bg-zinc-800 hover:bg-zinc-700 transition rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                            >
                              <Camera className="h-6 w-6 text-[#7FC844]" />
                              <span className="text-sm">Upload Photos</span>
                            </button>
                            
                            <button 
                              onClick={() => {
                                toast({
                                  title: "Document",
                                  description: "Opening document upload interface...",
                                });
                                setCurrentTab("documents");
                              }}
                              className="bg-zinc-800 hover:bg-zinc-700 transition rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                            >
                              <FileText className="h-6 w-6 text-[#7FC844]" />
                              <span className="text-sm">Add Document</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="maintenance" className="p-0 m-0">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-[#7FC844]" />
                      Maintenance Center
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Track and manage all maintenance activities for your {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}.
                    </p>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Maintenance content will be displayed here
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="modifications" className="p-0 m-0">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Tool className="h-5 w-5 text-[#7FC844]" />
                      Modifications Center
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Document all modifications and upgrades for your {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}.
                    </p>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Modifications content will be displayed here
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="detailing" className="p-0 m-0">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-[#7FC844]" />
                      Detailing Center
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Manage detailing sessions and track product usage for your {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}.
                    </p>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Detailing content will be displayed here
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="p-0 m-0">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#7FC844]" />
                      Document Center
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Organize and access all documents related to your {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}.
                    </p>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Document content will be displayed here
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="mood" className="p-0 m-0">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#7FC844]" />
                      Mood & Energy Tracking
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Track your driving experiences and emotional connection with your {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}.
                    </p>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Mood & Energy tracking content will be displayed here
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManifestationStation;
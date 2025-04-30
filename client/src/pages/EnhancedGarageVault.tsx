import { useEffect, useState } from "react";
import supabase from "../services/supabaseClient";
import { Link } from "wouter";
import { useVehicleContext } from "../context/VehicleContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  Wrench, 
  FileText, 
  History, 
  Calendar, 
  BarChart3, 
  PlusCircle, 
  Grid, 
  List, 
  Camera, 
  Sparkles, 
  Gauge, 
  Droplets, 
  Clock,
  Check,
  AlertTriangle,
  Timer,
  ChevronRight,
  Wrench as Tool,
  Image as ImageIcon,
  ScrollText,
  Repeat,
  LineChart,
  Crown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

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

const EnhancedGarageVault: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showProjectLauncher, setShowProjectLauncher] = useState<boolean>(false);
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1800px] mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* Header Section with user welcome and Paddock20 badge if applicable */}
          <div className="flex justify-between items-center">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#7FC844] text-black' : 'bg-zinc-800 text-gray-300'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#7FC844] text-black' : 'bg-zinc-800 text-gray-300'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Link href="/add-vehicle">
                <button className="bg-[#7FC844] text-black font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-[#6cb33a] transition">
                  <PlusCircle className="h-4 w-4" />
                  Add Vehicle
                </button>
              </Link>
            </div>
          </div>

          {/* Dashboard Settings Area */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#7FC844]" />
                Dashboard Settings
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(dashboardToggles).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    {key === 'showMaintenanceAlerts' && <Wrench className="h-4 w-4 text-[#7FC844]" />}
                    {key === 'showValuationTrends' && <LineChart className="h-4 w-4 text-[#7FC844]" />}
                    {key === 'showWeatherAdvisories' && <Droplets className="h-4 w-4 text-[#7FC844]" />}
                    {key === 'showDetailingSchedule' && <Camera className="h-4 w-4 text-[#7FC844]" />}
                    {key === 'showMoodTracker' && <Sparkles className="h-4 w-4 text-[#7FC844]" />}
                    {key === 'showNextEvents' && <Calendar className="h-4 w-4 text-[#7FC844]" />}
                    {key === 'showActiveProjects' && <Tool className="h-4 w-4 text-[#7FC844]" />}
                    {key === 'showDocumentExpiration' && <FileText className="h-4 w-4 text-[#7FC844]" />}
                    <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('show ', '')}</span>
                  </div>
                  <Switch 
                    checked={value} 
                    onCheckedChange={() => handleToggleChange(key as keyof typeof dashboardToggles)} 
                    className="data-[state=checked]:bg-[#7FC844]"
                  />
                </div>
              ))}
            </div>
          </div>

          {activeSection === "overview" && (
            <>
              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Vehicles Section */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Car className="h-5 w-5 text-[#7FC844]" />
                        Your Vehicles
                      </h2>
                      <span className="text-sm text-gray-400">{vehicles.length} total</span>
                    </div>

                    {isLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7FC844]"></div>
                      </div>
                    ) : (
                      viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {vehicles.map((vehicle) => (
                            <div 
                              key={vehicle.id} 
                              className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-lg transition-all hover:border-[#7FC844] cursor-pointer"
                              onClick={() => handleVehicleSelect(vehicle)}
                            >
                              <div className="relative h-40">
                                <img 
                                  src={vehicle.image_url} 
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                  {renderStatusBadge(vehicle.status)}
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="text-lg font-bold text-white">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">{vehicle.trim}</p>
                                
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
                                  <div className="flex items-center gap-1">
                                    <Gauge className="h-3 w-3 text-[#7FC844]" />
                                    <span>{vehicle.mileage.toLocaleString()} mi</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Wrench className="h-3 w-3 text-[#7FC844]" />
                                    <span>{vehicle.maintenance_count || 0} records</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-[#7FC844]" />
                                    <span>{vehicle.modifications_count || 0} mods</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-[#7FC844]" />
                                    <span>{vehicle.documents_count || 0} docs</span>
                                  </div>
                                </div>
                                
                                {vehicle.next_service_date && (
                                  <div className="mt-3">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs">Next Service</span>
                                      <span className="text-xs">{getFormattedDate(vehicle.next_service_date)}</span>
                                    </div>
                                    <Progress 
                                      value={100 - (getDaysUntilNextService(vehicle.next_service_date) / 365 * 100)} 
                                      className="h-1.5 bg-gray-700" 
                                      indicatorClassName={getDaysUntilNextService(vehicle.next_service_date) < 30 ? "bg-red-500" : "bg-[#7FC844]"}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {vehicles.map((vehicle) => (
                            <div 
                              key={vehicle.id} 
                              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex items-center space-x-4 shadow-sm transition-all hover:border-[#7FC844] cursor-pointer"
                              onClick={() => handleVehicleSelect(vehicle)}
                            >
                              <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden">
                                <img 
                                  src={vehicle.image_url} 
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between">
                                  <h3 className="text-lg font-semibold text-white">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                  </h3>
                                  {renderStatusBadge(vehicle.status)}
                                </div>
                                <p className="text-gray-400 text-sm">{vehicle.trim} • {vehicle.license_plate}</p>
                                
                                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Gauge className="h-3 w-3 text-[#7FC844]" />
                                    <span>{vehicle.mileage.toLocaleString()} mi</span>
                                  </div>
                                  {vehicle.next_service_date && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-[#7FC844]" />
                                      <span>Service: {getFormattedDate(vehicle.next_service_date)}</span>
                                    </div>
                                  )}
                                  {vehicle.last_detailed_date && (
                                    <div className="flex items-center gap-1">
                                      <Droplets className="h-3 w-3 text-[#7FC844]" />
                                      <span>Detailed: {getFormattedDate(vehicle.last_detailed_date)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                  
                  {/* Service Timeline and Alerts */}
                  {dashboardToggles.showMaintenanceAlerts && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-[#7FC844]" />
                          Maintenance Alerts
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {vehicles.map(vehicle => {
                          // Only show vehicles with upcoming maintenance
                          if (!vehicle.next_service_date) return null;
                          const daysUntil = getDaysUntilNextService(vehicle.next_service_date);
                          if (daysUntil > 60) return null;
                          
                          return (
                            <div key={`maint-${vehicle.id}`} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${daysUntil < 30 ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                  <Wrench className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                  <p className="text-sm text-gray-400">
                                    {daysUntil <= 0 
                                      ? 'Service overdue!' 
                                      : `Service due in ${daysUntil} days`
                                    }
                                  </p>
                                </div>
                              </div>
                              <div>
                                <button 
                                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition"
                                  onClick={() => {
                                    toast({
                                      title: "Service Scheduled",
                                      description: `Maintenance for your ${vehicle.year} ${vehicle.make} ${vehicle.model} has been scheduled.`,
                                    });
                                  }}
                                >
                                  Schedule
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Document expirations */}
                        {dashboardToggles.showDocumentExpiration && vehicles.some(v => v.insurance_renewal_date || v.inspection_due_date) && (
                          <>
                            <Separator className="my-4 bg-zinc-700" />
                            
                            {vehicles.map(vehicle => {
                              if (!vehicle.insurance_renewal_date && !vehicle.inspection_due_date) return null;
                              
                              return (
                                <div key={`docs-${vehicle.id}`}>
                                  {vehicle.insurance_renewal_date && getDaysUntilNextService(vehicle.insurance_renewal_date) < 45 && (
                                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex justify-between items-center mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                                          <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                          <p className="text-sm text-gray-400">
                                            Insurance renewal: {getFormattedDate(vehicle.insurance_renewal_date)}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <button 
                                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition"
                                          onClick={() => {
                                            toast({
                                              title: "Reminder Set",
                                              description: `You'll be reminded about insurance renewal for your ${vehicle.make} ${vehicle.model}.`,
                                            });
                                          }}
                                        >
                                          Remind Me
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {vehicle.inspection_due_date && getDaysUntilNextService(vehicle.inspection_due_date) < 45 && (
                                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex justify-between items-center">
                                      <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-400">
                                          <ScrollText className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                          <p className="text-sm text-gray-400">
                                            Inspection due: {getFormattedDate(vehicle.inspection_due_date)}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <button 
                                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition"
                                          onClick={() => {
                                            toast({
                                              title: "Inspection Scheduled",
                                              description: `Inspection for your ${vehicle.make} ${vehicle.model} has been scheduled.`,
                                            });
                                          }}
                                        >
                                          Schedule
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}

                        {!vehicles.some(v => 
                          (v.next_service_date && getDaysUntilNextService(v.next_service_date) <= 60) || 
                          (v.insurance_renewal_date && getDaysUntilNextService(v.insurance_renewal_date) < 45) ||
                          (v.inspection_due_date && getDaysUntilNextService(v.inspection_due_date) < 45)
                        ) && (
                          <div className="text-center py-8 text-gray-500">
                            <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                              <Check className="h-8 w-8 text-[#7FC844]" />
                            </div>
                            <p className="text-lg font-medium mb-1">All Clear!</p>
                            <p className="text-sm">No upcoming maintenance or document renewals needed.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detailing Schedule */}
                  {dashboardToggles.showDetailingSchedule && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Droplets className="h-5 w-5 text-[#7FC844]" />
                          Detailing Schedule
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vehicles.map(vehicle => (
                          <div 
                            key={`detail-${vehicle.id}`}
                            className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden"
                          >
                            <div className="flex items-center p-4">
                              <div className="h-12 w-12 rounded-md overflow-hidden mr-3">
                                <img 
                                  src={vehicle.image_url} 
                                  alt={vehicle.make}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                                <div className="flex items-center text-sm text-gray-400">
                                  <Camera className="h-3 w-3 mr-1" />
                                  {vehicle.last_detailed_date 
                                    ? `Last detail: ${getFormattedDate(vehicle.last_detailed_date)}` 
                                    : 'No detailing records'
                                  }
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-zinc-900 p-3 border-t border-zinc-700 flex justify-between">
                              <button 
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded transition"
                                onClick={() => {
                                  toast({
                                    title: "Detailing Started",
                                    description: `New detailing session created for your ${vehicle.make} ${vehicle.model}.`,
                                  });
                                }}
                              >
                                Start Session
                              </button>
                              <button 
                                className="px-3 py-1.5 bg-[#7FC844] hover:bg-[#6cb33a] text-black text-sm rounded transition"
                                onClick={() => {
                                  toast({
                                    title: "Schedule Updated",
                                    description: `Detailing has been scheduled for your ${vehicle.make} ${vehicle.model}.`,
                                  });
                                }}
                              >
                                Schedule
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Stats Summary */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-[#7FC844]" />
                      Garage Summary
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <p className="text-gray-400 text-sm">Total Vehicles</p>
                        <p className="text-2xl font-bold mt-1">{vehicles.length}</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <p className="text-gray-400 text-sm">Active Projects</p>
                        <p className="text-2xl font-bold mt-1">3</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <p className="text-gray-400 text-sm">Collection Value</p>
                        <p className="text-2xl font-bold mt-1">
                          ${vehicles.reduce((sum, v) => sum + (v.current_value || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <p className="text-gray-400 text-sm">GoTime Points</p>
                        <p className="text-2xl font-bold mt-1">{userProfile?.points.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Documents */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-[#7FC844]" />
                      Recent Documents
                    </h2>
                    <div className="space-y-3">
                      {recentDocuments.map(doc => {
                        const vehicle = vehicles.find(v => v.id === doc.vehicle_id);
                        return (
                          <div key={doc.id} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 flex items-center">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-400 mr-3">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium text-sm">{doc.title}</p>
                              <p className="text-xs text-gray-400">
                                {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                                {' • '}
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button 
                              className="ml-2 p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 transition"
                              onClick={() => {
                                toast({
                                  title: "Document Opened",
                                  description: `Opening ${doc.title}...`,
                                });
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                      
                      {recentDocuments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No documents found</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Weather Advisory */}
                  {dashboardToggles.showWeatherAdvisories && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <Droplets className="h-5 w-5 text-[#7FC844]" />
                        Weather Advisory
                      </h2>
                      <div className="p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-900/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold">Sunny, 75°F</p>
                            <p className="text-gray-400 text-sm">Perfect detailing conditions</p>
                          </div>
                          <div className="h-12 w-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <Droplets className="h-6 w-6 text-yellow-500" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm">Humidity: <span className="text-white">45%</span></p>
                          <p className="text-sm">UV Index: <span className="text-white">6 (High)</span></p>
                          <p className="text-sm">Wind: <span className="text-white">5 mph</span></p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-800/50">
                          <p className="text-xs text-blue-300">
                            <span className="font-semibold">Advisory:</span> Excellent conditions for a wash and wax, but apply UV protectant due to high UV index.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Upcoming Events */}
                  {dashboardToggles.showNextEvents && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-[#7FC844]" />
                        Upcoming Events
                      </h2>
                      <div className="space-y-3">
                        <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                          <div className="flex">
                            <div className="h-12 w-12 rounded-lg bg-[#7FC844]/10 text-[#7FC844] flex flex-col items-center justify-center mr-4">
                              <span className="text-xs font-bold">MAY</span>
                              <span className="text-lg font-bold">12</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">Local Cars & Coffee</h3>
                              <p className="text-sm text-gray-400">8:00 AM - 11:00 AM</p>
                              <div className="mt-2">
                                <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">Car Show</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                          <div className="flex">
                            <div className="h-12 w-12 rounded-lg bg-[#7FC844]/10 text-[#7FC844] flex flex-col items-center justify-center mr-4">
                              <span className="text-xs font-bold">MAY</span>
                              <span className="text-lg font-bold">20</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">Track Day - Sonoma Raceway</h3>
                              <p className="text-sm text-gray-400">9:00 AM - 4:00 PM</p>
                              <div className="mt-2">
                                <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Track</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Valuation Trends */}
                  {dashboardToggles.showValuationTrends && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <LineChart className="h-5 w-5 text-[#7FC844]" />
                        Valuation Trends
                      </h2>
                      <div className="h-48 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center text-gray-400">
                        Valuation chart visualization would appear here
                      </div>
                      <div className="mt-3 space-y-2">
                        {vehicles.map(vehicle => (
                          <div key={`val-${vehicle.id}`} className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                                <img 
                                  src={vehicle.image_url} 
                                  alt={vehicle.make} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="text-white font-medium">${vehicle.current_value.toLocaleString()}</span>
                              <Badge className="ml-2 bg-green-500/20 text-green-300 hover:bg-green-500/30">
                                +3.2%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeSection === "vehicle-details" && selectedVehicle && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setActiveSection("overview")}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-1 px-3 rounded-md text-sm flex items-center gap-1 transition"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back to Garage
                </button>
                <div className="flex gap-2">
                  <button 
                    className="bg-zinc-800 hover:bg-zinc-700 text-white py-1 px-3 rounded-md text-sm transition"
                    onClick={() => {
                      toast({
                        title: "Vehicle Edit Mode",
                        description: "Editing mode for vehicle details activated.",
                      });
                    }}
                  >
                    Edit Vehicle
                  </button>
                  <button 
                    className="bg-[#7FC844] hover:bg-[#6cb33a] text-black py-1 px-3 rounded-md text-sm transition"
                    onClick={() => {
                      toast({
                        title: "Service Record Added",
                        description: `New service record added for ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}.`,
                      });
                    }}
                  >
                    Add Service
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Vehicle image and basic info */}
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden border border-zinc-700 mb-4">
                    <img 
                      src={selectedVehicle.image_url} 
                      alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </h2>
                    <p className="text-gray-400">{selectedVehicle.trim}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span>{renderStatusBadge(selectedVehicle.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">VIN</span>
                        <span className="text-right">{selectedVehicle.vin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">License Plate</span>
                        <span>{selectedVehicle.license_plate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Color</span>
                        <span>{selectedVehicle.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Purchase Date</span>
                        <span>{getFormattedDate(selectedVehicle.purchase_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Value</span>
                        <span>${selectedVehicle.current_value.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                      <h3 className="font-semibold mb-2">Technical Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mileage</span>
                          <span>{selectedVehicle.mileage.toLocaleString()} mi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Drivetrain</span>
                          <span>{selectedVehicle.drivetrain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Engine</span>
                          <span>{selectedVehicle.engine_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transmission</span>
                          <span>{selectedVehicle.transmission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fuel Type</span>
                          <span>{selectedVehicle.fuel_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Vehicle data tabs */}
                <div className="md:w-2/3">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full bg-zinc-800 border border-zinc-700 rounded-lg mb-4 p-1">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="maintenance" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                        Maintenance
                      </TabsTrigger>
                      <TabsTrigger value="modifications" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                        Modifications
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                        Documents
                      </TabsTrigger>
                      <TabsTrigger value="detailing" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                        Detailing
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <Wrench className="h-5 w-5 text-[#7FC844] mr-2" />
                            <h3 className="font-semibold">Maintenance Status</h3>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Next Service:</span>
                              <span className="font-medium">{getFormattedDate(selectedVehicle.next_service_date || '')}</span>
                            </div>
                            <Progress 
                              value={selectedVehicle.next_service_date ? 100 - (getDaysUntilNextService(selectedVehicle.next_service_date) / 180 * 100) : 0} 
                              className="h-2 bg-gray-700" 
                              indicatorClassName={selectedVehicle.next_service_date && getDaysUntilNextService(selectedVehicle.next_service_date) < 30 ? "bg-red-500" : "bg-[#7FC844]"}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Oil Change:</span>
                              <span className="font-medium">500 miles remaining</span>
                            </div>
                            <Progress 
                              value={75} 
                              className="h-2 bg-gray-700" 
                              indicatorClassName="bg-orange-500"
                            />
                          </div>
                        </div>
                        
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <FileText className="h-5 w-5 text-[#7FC844] mr-2" />
                            <h3 className="font-semibold">Documents</h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Insurance Renewal:</span>
                              <span className="font-medium">{getFormattedDate(selectedVehicle.insurance_renewal_date || '')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Inspection Due:</span>
                              <span className="font-medium">{getFormattedDate(selectedVehicle.inspection_due_date || '')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Documents:</span>
                              <span className="font-medium">{selectedVehicle.documents_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-3">
                          <ImageIcon className="h-5 w-5 text-[#7FC844] mr-2" />
                          <h3 className="font-semibold">Photo Gallery</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="aspect-square bg-zinc-700 rounded-md overflow-hidden">
                            <img 
                              src={selectedVehicle.image_url} 
                              alt="Vehicle" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="aspect-square bg-zinc-700 rounded-md flex items-center justify-center">
                            <Camera className="h-8 w-8 text-zinc-500" />
                          </div>
                          <div className="aspect-square bg-zinc-700 rounded-md flex items-center justify-center">
                            <PlusCircle className="h-8 w-8 text-zinc-500" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Repeat className="h-5 w-5 text-[#7FC844] mr-2" />
                          <h3 className="font-semibold">Recent Activities</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                              <Droplets className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Detailing Session Completed</p>
                              <p className="text-xs text-gray-400">{getFormattedDate(selectedVehicle.last_detailed_date || '')}</p>
                              <p className="text-xs text-gray-500 mt-1">Full detail with ceramic coating and interior deep clean</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                              <Wrench className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Oil Change Completed</p>
                              <p className="text-xs text-gray-400">{getFormattedDate(selectedVehicle.last_service_date || '')}</p>
                              <p className="text-xs text-gray-500 mt-1">Synthetic 5W-40 oil and filter replaced</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                              <Sparkles className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Wheel Modification</p>
                              <p className="text-xs text-gray-400">March 12, 2024</p>
                              <p className="text-xs text-gray-500 mt-1">New HRE P101 wheels installed</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="maintenance" className="mt-0">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">Maintenance Records</h3>
                          <button 
                            className="bg-[#7FC844] hover:bg-[#6cb33a] text-black py-1 px-3 rounded-md text-sm transition flex items-center gap-1"
                            onClick={() => {
                              toast({
                                title: "Record Added",
                                description: "New maintenance record form opened.",
                              });
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add Record
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {Array.from({ length: selectedVehicle.maintenance_count || 0 }).map((_, index) => (
                            <div key={index} className="border border-zinc-700 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">
                                    {index === 0 ? 'Oil Change & Filter' : 
                                     index === 1 ? 'Brake Pad Replacement' : 
                                     index === 2 ? 'Tire Rotation' : 
                                     'Routine Maintenance'}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {new Date(new Date().setDate(new Date().getDate() - (index * 30 + 15))).toLocaleDateString()}
                                    {' • '}
                                    {selectedVehicle.mileage - (index * 1000)} miles
                                  </p>
                                </div>
                                <Badge className="bg-green-500/20 text-green-300">Completed</Badge>
                              </div>
                              <p className="text-sm text-gray-400 mt-2">
                                {index === 0 ? 'Replaced oil with synthetic 5W-40 and installed new OEM filter.' : 
                                 index === 1 ? 'Replaced front brake pads with high-performance ceramic compound.' : 
                                 index === 2 ? 'Rotated and balanced all four tires, adjusted pressure to spec.' : 
                                 'Regular service including fluids check and multi-point inspection.'}
                              </p>
                              <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center gap-2">
                                <span className="text-xs text-gray-500">Cost: ${(index === 0 ? 120 : index === 1 ? 450 : index === 2 ? 80 : 250).toLocaleString()}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">Location: {index === 0 ? 'Main Street Service' : index === 1 ? 'Performance Auto' : index === 2 ? 'Tire Center' : 'Dealer Service'}</span>
                              </div>
                            </div>
                          ))}
                          
                          {(!selectedVehicle.maintenance_count || selectedVehicle.maintenance_count === 0) && (
                            <div className="text-center py-8 text-gray-500">
                              <p>No maintenance records found</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Maintenance Schedule</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 border border-zinc-700 rounded-lg">
                            <div>
                              <p className="font-medium">Next Oil Change</p>
                              <p className="text-sm text-gray-400">Due at {selectedVehicle.mileage + 500} miles</p>
                            </div>
                            <button 
                              className="bg-zinc-700 hover:bg-zinc-600 text-white py-1 px-3 rounded-md text-sm transition"
                              onClick={() => {
                                toast({
                                  title: "Reminder Set",
                                  description: "You'll be reminded when it's time for your next oil change.",
                                });
                              }}
                            >
                              Remind Me
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 border border-zinc-700 rounded-lg">
                            <div>
                              <p className="font-medium">Brake Fluid Flush</p>
                              <p className="text-sm text-gray-400">Due in 3 months</p>
                            </div>
                            <button 
                              className="bg-zinc-700 hover:bg-zinc-600 text-white py-1 px-3 rounded-md text-sm transition"
                              onClick={() => {
                                toast({
                                  title: "Service Scheduled",
                                  description: "Brake fluid flush has been scheduled.",
                                });
                              }}
                            >
                              Schedule
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 border border-zinc-700 rounded-lg">
                            <div>
                              <p className="font-medium">Major Service</p>
                              <p className="text-sm text-gray-400">Due at {selectedVehicle.mileage + 5000} miles</p>
                            </div>
                            <button 
                              className="bg-zinc-700 hover:bg-zinc-600 text-white py-1 px-3 rounded-md text-sm transition"
                              onClick={() => {
                                toast({
                                  title: "Reminder Set",
                                  description: "You'll be notified when your major service is due.",
                                });
                              }}
                            >
                              Remind Me
                            </button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="modifications" className="mt-0">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">Vehicle Modifications</h3>
                          <button 
                            className="bg-[#7FC844] hover:bg-[#6cb33a] text-black py-1 px-3 rounded-md text-sm transition flex items-center gap-1"
                            onClick={() => {
                              toast({
                                title: "Modification Form",
                                description: "New modification entry form opened.",
                              });
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add Modification
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {Array.from({ length: selectedVehicle.modifications_count || 0 }).map((_, index) => {
                            const modTypes = [
                              { name: "HRE P101 Wheels", category: "Wheels", cost: 6000 },
                              { name: "KW Variant 3 Coilovers", category: "Suspension", cost: 2500 },
                              { name: "Akrapovic Exhaust System", category: "Exhaust", cost: 4500 },
                              { name: "Carbon Fiber Spoiler", category: "Exterior", cost: 1800 },
                              { name: "Custom ECU Tune", category: "Performance", cost: 1200 },
                              { name: "LED Headlight Upgrade", category: "Lighting", cost: 800 },
                              { name: "Carbon Fiber Interior Trim", category: "Interior", cost: 1500 }
                            ];
                            
                            const mod = modTypes[index % modTypes.length];
                            
                            return (
                              <div key={index} className="border border-zinc-700 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-4 h-32">
                                  <div className="col-span-1 bg-zinc-700 flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-zinc-500" />
                                  </div>
                                  <div className="col-span-3 p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium">{mod.name}</h4>
                                        <p className="text-sm text-gray-400">
                                          {new Date(new Date().setDate(new Date().getDate() - (index * 45 + 15))).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Badge className="bg-purple-500/20 text-purple-300">{mod.category}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">
                                      Upgraded to enhance vehicle {mod.category.toLowerCase() === 'performance' ? 'performance' : mod.category.toLowerCase() === 'interior' ? 'aesthetics' : 'appearance and functionality'}.
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center gap-2">
                                      <span className="text-xs text-gray-500">Cost: ${mod.cost.toLocaleString()}</span>
                                      <span className="text-xs text-gray-500">•</span>
                                      <span className="text-xs text-gray-500">Installed by: {index % 2 === 0 ? 'Performance Shop' : 'Custom Garage'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {(!selectedVehicle.modifications_count || selectedVehicle.modifications_count === 0) && (
                            <div className="text-center py-8 text-gray-500">
                              <p>No modifications found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="documents" className="mt-0">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">Document Library</h3>
                          <button 
                            className="bg-[#7FC844] hover:bg-[#6cb33a] text-black py-1 px-3 rounded-md text-sm transition flex items-center gap-1"
                            onClick={() => {
                              toast({
                                title: "Upload Document",
                                description: "Document upload form opened.",
                              });
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                            Upload Document
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {recentDocuments.filter(doc => doc.vehicle_id === selectedVehicle.id).map(doc => (
                            <div key={doc.id} className="flex items-center p-3 border border-zinc-700 rounded-lg">
                              <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="flex-grow">
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-xs text-gray-400">
                                  {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)}
                                  {' • '}
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button 
                                className="p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 transition"
                                onClick={() => {
                                  toast({
                                    title: "Document Opened",
                                    description: `Opening ${doc.title}...`,
                                  });
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          
                          {/* Add some additional document examples */}
                          <div className="flex items-center p-3 border border-zinc-700 rounded-lg">
                            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">Insurance Policy</p>
                              <p className="text-xs text-gray-400">
                                Insurance
                                {' • '}
                                {new Date(selectedVehicle.insurance_renewal_date || '').toLocaleDateString()}
                              </p>
                            </div>
                            <button 
                              className="p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 transition"
                              onClick={() => {
                                toast({
                                  title: "Document Opened",
                                  description: "Opening Insurance Policy...",
                                });
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center p-3 border border-zinc-700 rounded-lg">
                            <div className="h-10 w-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">Vehicle Registration</p>
                              <p className="text-xs text-gray-400">
                                Legal
                                {' • '}
                                Expires {new Date(selectedVehicle.inspection_due_date || '').toLocaleDateString()}
                              </p>
                            </div>
                            <button 
                              className="p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 transition"
                              onClick={() => {
                                toast({
                                  title: "Document Opened",
                                  description: "Opening Vehicle Registration...",
                                });
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center p-3 border border-zinc-700 rounded-lg">
                            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">Warranty Information</p>
                              <p className="text-xs text-gray-400">
                                Warranty
                                {' • '}
                                Valid until {new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toLocaleDateString()}
                              </p>
                            </div>
                            <button 
                              className="p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 transition"
                              onClick={() => {
                                toast({
                                  title: "Document Opened",
                                  description: "Opening Warranty Information...",
                                });
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="detailing" className="mt-0">
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">Detailing History</h3>
                          <button 
                            className="bg-[#7FC844] hover:bg-[#6cb33a] text-black py-1 px-3 rounded-md text-sm transition flex items-center gap-1"
                            onClick={() => {
                              toast({
                                title: "New Detailing Session",
                                description: "Starting new detailing session...",
                              });
                            }}
                          >
                            <PlusCircle className="h-4 w-4" />
                            New Session
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {selectedVehicle.last_detailed_date ? (
                            <div className="border border-zinc-700 rounded-lg overflow-hidden">
                              <div className="grid grid-cols-3 h-40">
                                <div className="col-span-1 relative">
                                  <img 
                                    src={selectedVehicle.image_url} 
                                    alt="Vehicle" 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50 flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-white/70" />
                                  </div>
                                </div>
                                <div className="col-span-2 p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">Full Detail + Ceramic Coating</h4>
                                      <p className="text-sm text-gray-400">
                                        {new Date(selectedVehicle.last_detailed_date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge className="bg-blue-500/20 text-blue-300">Complete</Badge>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-2">
                                    Comprehensive detailing including clay bar treatment, machine polish, and ceramic coating application.
                                  </p>
                                  <div className="mt-3 pt-3 border-t border-zinc-700 grid grid-cols-3 gap-2 text-xs text-gray-500">
                                    <div>
                                      <p className="font-medium text-gray-400">Products Used</p>
                                      <p>Gtechniq Crystal Serum Ultra</p>
                                      <p>AMMO NYC Foam</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-400">Temperature</p>
                                      <p>Outdoor: 72°F</p>
                                      <p>Surface: 68°F</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-400">Duration</p>
                                      <p>8 hours</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>No detailing history found</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Maintenance Schedule</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 border border-zinc-700 rounded-lg">
                            <div>
                              <p className="font-medium">Scheduled Wash</p>
                              <p className="text-sm text-gray-400">Every 2 weeks</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 border border-zinc-700 rounded-lg">
                            <div>
                              <p className="font-medium">Wax Application</p>
                              <p className="text-sm text-gray-400">Every 3 months</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 border border-zinc-700 rounded-lg">
                            <div>
                              <p className="font-medium">Ceramic Coating</p>
                              <p className="text-sm text-gray-400">Annual maintenance</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedGarageVault;
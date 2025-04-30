import React, { useState, useEffect } from "react";
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
  CheckCircle,
  X,
  Circle,
  Building2,
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
  Paintbrush,
  Share2,
  Download,
  Heart,
  Star,
  Trash,
  Edit,
  Copy,
  Users, User, LogOut,
  Target,
  Trophy,
  Milestone,
  Gift,
  DollarSign,
  Layers,
  CommandIcon,
  Brain,
  Lightbulb,
  Rocket,
  Hammer,
  Compass
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import supabase from "../services/supabaseClient";

// Component interfaces
interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  category: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "deferred";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  tags: string[];
  user_id: string;
  image_url?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  steps?: Step[];
  related_vehicles?: string[];
}

interface Step {
  id: string;
  title: string;
  completed: boolean;
  goal_id: string;
  due_date?: string;
}

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

interface Project {
  id: string;
  title: string;
  description: string;
  vehicle_id: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  start_date: string;
  end_date?: string;
  budget: number;
  spent: number;
  image_url?: string;
  created_at: string;
  user_id: string;
}

// Mood/energy tracking
interface MoodEntry {
  id: string;
  date: string;
  mood_score: number;
  energy_level: number;
  notes: string;
  created_at: string;
  user_id: string;
  associated_activities: string[];
}

// Dashboard toggles and widget settings
interface DashboardSettings {
  showGoals: boolean;
  showProjects: boolean;
  showVehicles: boolean;
  showMoodTracker: boolean;
  showWeather: boolean;
  showActivity: boolean;
  showCalendar: boolean;
  visualStyle: "minimal" | "detailed" | "graphical";
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
}

// Main component
const ManifestationStation: React.FC = () => {
  // ======== STATE MANAGEMENT ========
  const [goals, setGoals] = useState<Goal[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // UI state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    showGoals: true,
    showProjects: true,
    showVehicles: true,
    showMoodTracker: true,
    showWeather: true,
    showActivity: true,
    showCalendar: true,
    visualStyle: "detailed",
    primaryColor: "#7FC844", // Carolina blue (Paddock20 signature color)
    accentColor: "#3B82F6", // Blue accent
    darkMode: true,
  });

  // Dialog states
  const [showGoalDetails, setShowGoalDetails] = useState<boolean>(false);
  const [showMoodTracker, setShowMoodTracker] = useState<boolean>(false);
  const [showProjectDetails, setShowProjectDetails] = useState<boolean>(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState<boolean>(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
  const [showCreateGoalDialog, setShowCreateGoalDialog] = useState<boolean>(false);
  const [showDetailedWeather, setShowDetailedWeather] = useState<boolean>(false);
  
  // Selected items
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form states
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    category: "vehicle",
    priority: "medium",
    status: "not_started",
    progress: 0,
    target_date: new Date().toISOString().split('T')[0],
    tags: [],
  });

  const [newMoodEntry, setNewMoodEntry] = useState<Partial<MoodEntry>>({
    mood_score: 3,
    energy_level: 3,
    notes: "",
    date: new Date().toISOString().split('T')[0],
    associated_activities: [],
  });

  // Current date/time state for the dashboard
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentTimeString, setCurrentTimeString] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Mock weather data - would be replaced with actual API data
  const weatherData = {
    temp: 72,
    condition: "Sunny",
    humidity: 45,
    wind: 8,
    location: "Los Angeles, CA",
    forecast: [
      { day: "Today", high: 74, low: 65, condition: "Sunny" },
      { day: "Tomorrow", high: 76, low: 66, condition: "Partly Cloudy" },
      { day: "Wednesday", high: 78, low: 67, condition: "Sunny" },
      { day: "Thursday", high: 75, low: 64, condition: "Cloudy" },
      { day: "Friday", high: 72, low: 62, condition: "Rain" },
    ],
  };

  // ======== EFFECTS ========
  // Load goals from Supabase
  useEffect(() => {
    const fetchGoals = async () => {
      if (!supabase) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching goals:', error);
          return;
        }
        
        setGoals(data || []);
      } catch (error) {
        console.error('Error in fetchGoals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoals();
  }, []);

  // Load vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!supabase) return;
      try {
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
      }
    };
    
    fetchVehicles();
  }, []);

  // Load projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }
        
        setProjects(data || []);
      } catch (error) {
        console.error('Error in fetchProjects:', error);
      }
    };
    
    fetchProjects();
  }, []);

  // Load mood entries from Supabase
  useEffect(() => {
    const fetchMoodEntries = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .order('date', { ascending: false })
          .limit(30);
        
        if (error) {
          console.error('Error fetching mood entries:', error);
          return;
        }
        
        setMoodEntries(data || []);
      } catch (error) {
        console.error('Error in fetchMoodEntries:', error);
      }
    };
    
    fetchMoodEntries();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      setCurrentTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // ======== HELPER FUNCTIONS ========
  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Calculate days until a date
  const getDaysUntil = (dateString: string): number => {
    if (!dateString) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    
    const timeDiff = targetDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get goal status color
  const getGoalStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'not_started':
        return 'bg-gray-500';
      case 'deferred':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
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

  // Get mood emoji based on score
  const getMoodEmoji = (score: number): string => {
    switch (score) {
      case 1: return "😞";
      case 2: return "😔";
      case 3: return "😐";
      case 4: return "🙂";
      case 5: return "😄";
      default: return "😐";
    }
  };

  // Get energy icon based on level
  const getEnergyIcon = (level: number) => {
    switch (level) {
      case 1: return <BatteryCharging className="h-4 w-4 text-red-500" />;
      case 2: return <BatteryCharging className="h-4 w-4 text-orange-500" />;
      case 3: return <BatteryCharging className="h-4 w-4 text-yellow-500" />;
      case 4: return <BatteryCharging className="h-4 w-4 text-green-500" />;
      case 5: return <BatteryCharging className="h-4 w-4 text-blue-500" />;
      default: return <BatteryCharging className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Handler for goal creation
  const handleCreateGoal = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          { 
            ...newGoal,
            user_id: "current-user-id", // Replace with actual user ID from auth
            created_at: new Date().toISOString(),
          }
        ])
        .select();
      
      if (error) {
        console.error('Error creating goal:', error);
        toast({
          title: "Error",
          description: "Failed to create goal. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setGoals(prev => [data[0], ...prev]);
      setShowCreateGoalDialog(false);
      setNewGoal({
        title: "",
        description: "",
        category: "vehicle",
        priority: "medium",
        status: "not_started",
        progress: 0,
        target_date: new Date().toISOString().split('T')[0],
        tags: [],
      });
      
      toast({
        title: "Success",
        description: "Goal created successfully!",
      });
    } catch (error) {
      console.error('Error in handleCreateGoal:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handler for mood entry
  const handleMoodEntry = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([
          { 
            ...newMoodEntry,
            user_id: "current-user-id", // Replace with actual user ID from auth
            created_at: new Date().toISOString(),
          }
        ])
        .select();
      
      if (error) {
        console.error('Error creating mood entry:', error);
        toast({
          title: "Error",
          description: "Failed to save mood entry. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setMoodEntries(prev => [data[0], ...prev]);
      setShowMoodTracker(false);
      setNewMoodEntry({
        mood_score: 3,
        energy_level: 3,
        notes: "",
        date: new Date().toISOString().split('T')[0],
        associated_activities: [],
      });
      
      toast({
        title: "Success",
        description: "Mood entry saved successfully!",
      });
    } catch (error) {
      console.error('Error in handleMoodEntry:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle dashboard toggle changes
  const handleSettingChange = (key: keyof DashboardSettings, value: any) => {
    setDashboardSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // ======== RENDER FUNCTIONS ========
  // Render goal status badge
  const renderGoalStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      "completed": { color: "bg-green-500", icon: <Check className="h-3 w-3" />, label: "Completed" },
      "in_progress": { color: "bg-blue-500", icon: <Activity className="h-3 w-3" />, label: "In Progress" },
      "not_started": { color: "bg-gray-500", icon: <Clock className="h-3 w-3" />, label: "Not Started" },
      "deferred": { color: "bg-yellow-500", icon: <AlertTriangle className="h-3 w-3" />, label: "Deferred" }
    };

    const { color, icon, label } = statusMap[status] || { color: "bg-gray-500", icon: <Clock className="h-3 w-3" />, label: status };

    return (
      <Badge className={`${color} text-white text-xs flex items-center gap-1 px-2 py-0.5`}>
        {icon}
        {label}
      </Badge>
    );
  };

  // Render priority badge
  const renderPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      "critical": { color: "bg-red-500", icon: <AlertTriangle className="h-3 w-3" />, label: "Critical" },
      "high": { color: "bg-orange-500", icon: <ArrowRight className="h-3 w-3" />, label: "High" },
      "medium": { color: "bg-yellow-500", icon: <Minus className="h-3 w-3" />, label: "Medium" },
      "low": { color: "bg-green-500", icon: <ArrowDown className="h-3 w-3" />, label: "Low" }
    };

    const { color, icon, label } = priorityMap[priority] || { color: "bg-gray-500", icon: <Minus className="h-3 w-3" />, label: priority };

    return (
      <Badge className={`${color} text-white text-xs flex items-center gap-1 px-2 py-0.5`}>
        {icon}
        {label}
      </Badge>
    );
  };

  // Render vehicle status badge
  const renderVehicleStatusBadge = (status: string) => {
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

  // ======== MAIN RENDER ========
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-white bg-gradient-to-r from-[#7FC844] to-blue-500 bg-clip-text text-transparent">
                Manifestation Station
              </span>
              <Badge className="ml-2 bg-[#7FC844] text-black">
                <Crown className="h-3 w-3 mr-1" /> PADDOCK20
              </Badge>
            </h1>
            <p className="text-gray-400 mt-1">
              Your central command for goal attainment & vehicle manifestation
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xl font-bold">{currentTimeString}</div>
              <div className="text-sm text-gray-400">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 border-zinc-700"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0">
                  <Avatar>
                    <AvatarImage src="/avatar.png" alt="Profile" />
                    <AvatarFallback className="bg-zinc-800">P20</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-zinc-800">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-800">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-zinc-800">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6">
          <Tabs 
            defaultValue="dashboard" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full bg-zinc-800/30">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                <Gauge className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                <Target className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                <Car className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Vehicles</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                <Hammer className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                <LineChart className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                <ScrollText className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Journal</span>
              </TabsTrigger>
              <TabsTrigger value="track" className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black">
                <Activity className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Track</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Dashboard View */}
            <TabsContent value="dashboard" className="mt-6 space-y-6">
              {/* Dashboard Header with Quick Actions */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Command Center</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowCreateGoalDialog(true)}
                    className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    New Goal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowMoodTracker(true)}
                    className="border-zinc-700"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Track Mood
                  </Button>
                </div>
              </div>
              
              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Goals Progress Column */}
                <div className={dashboardSettings.showGoals ? "" : "hidden"}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center">
                        <Target className="h-5 w-5 text-[#7FC844] mr-2" />
                        Goal Manifestion
                      </h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7FC844]"></div>
                      </div>
                    ) : goals.length > 0 ? (
                      <div className="space-y-4">
                        {goals.slice(0, 3).map(goal => (
                          <div 
                            key={goal.id}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer transition-all hover:border-[#7FC844]"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setShowGoalDetails(true);
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{goal.title}</h4>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{goal.description}</p>
                              </div>
                              {renderPriorityBadge(goal.priority)}
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2 bg-zinc-700">
                                <div 
                                  className="h-full bg-[#7FC844] rounded-full transition-all"
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </Progress>
                            </div>
                            
                            <div className="flex justify-between items-center mt-3 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-gray-400">{formatDate(goal.target_date)}</span>
                              </div>
                              {renderGoalStatusBadge(goal.status)}
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full border border-dashed border-zinc-700 hover:border-[#7FC844] hover:bg-zinc-800/50"
                          onClick={() => setActiveTab("goals")}
                        >
                          <ChevronRight className="h-4 w-4 mr-1" />
                          View All Goals
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-zinc-800 rounded-lg p-6 text-center">
                        <Target className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                        <h3 className="text-lg font-medium mb-2">No goals yet</h3>
                        <p className="text-zinc-400 mb-4">Start by creating your first manifestation goal</p>
                        <Button 
                          onClick={() => setShowCreateGoalDialog(true)}
                          className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Goal
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Middle Column: Mood & Weather */}
                <div className="space-y-6">
                  {/* Mood Tracker */}
                  {dashboardSettings.showMoodTracker && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center">
                          <Brain className="h-5 w-5 text-[#7FC844] mr-2" />
                          Mood & Energy
                        </h3>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 border-zinc-700"
                          onClick={() => setShowMoodTracker(true)}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Track
                        </Button>
                      </div>
                      
                      {moodEntries.length > 0 ? (
                        <div
                          className="bg-zinc-800 rounded-lg p-4 cursor-pointer transition-all hover:border hover:border-[#7FC844]"
                          onClick={() => setShowMoodTracker(true)}
                        >
                          <div className="flex justify-between mb-3">
                            <div>
                              <div className="text-sm text-gray-400">Today's Mood</div>
                              <div className="text-2xl mt-1">{getMoodEmoji(moodEntries[0].mood_score)}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-400">Energy Level</div>
                              <div className="text-2xl mt-1 flex items-center">
                                {getEnergyIcon(moodEntries[0].energy_level)}
                                <span className="ml-1">{moodEntries[0].energy_level}/5</span>
                              </div>
                            </div>
                          </div>
                          
                          {moodEntries[0].notes && (
                            <div className="bg-zinc-700/30 rounded p-2 text-sm mt-2">
                              <p className="text-gray-300 line-clamp-2">{moodEntries[0].notes}</p>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-zinc-700">
                            <div className="text-sm text-gray-400">7-Day Trend</div>
                            <div className="flex justify-between items-end h-10 mt-2">
                              {moodEntries.slice(0, 7).map((entry, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  <div 
                                    className={`w-2 rounded-t ${
                                      entry.mood_score === 1 ? 'bg-red-500' :
                                      entry.mood_score === 2 ? 'bg-orange-500' :
                                      entry.mood_score === 3 ? 'bg-yellow-500' :
                                      entry.mood_score === 4 ? 'bg-green-500' :
                                      'bg-blue-500'
                                    }`}
                                    style={{ height: `${entry.mood_score * 20}%` }}
                                  ></div>
                                  <span className="text-[10px] mt-1">
                                    {new Date(entry.date).getDate()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-4 text-center">
                          <Activity className="h-10 w-10 mx-auto mb-2 text-zinc-600" />
                          <h4 className="font-medium mb-1">No mood data yet</h4>
                          <p className="text-sm text-gray-400 mb-3">Start tracking your mood and energy levels</p>
                          <Button 
                            size="sm"
                            onClick={() => setShowMoodTracker(true)} 
                            className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
                          >
                            Track Now
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Weather Widget */}
                  {dashboardSettings.showWeather && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <h3 className="text-lg font-bold mb-3 flex items-center">
                        <CloudRain className="h-5 w-5 text-[#7FC844] mr-2" />
                        Weather & Environment
                      </h3>
                      
                      <div 
                        className="bg-zinc-800 rounded-lg p-4 mb-4 cursor-pointer transition-all hover:border hover:border-[#7FC844]"
                        onClick={() => setShowDetailedWeather(true)}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <div className="text-gray-400 text-sm">{weatherData.location}</div>
                            <div className="text-2xl font-bold">{weatherData.temp}°F</div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="text-5xl text-[#7FC844] mr-2">
                              {weatherData.condition === "Sunny" && <Sun />}
                              {weatherData.condition === "Rainy" && <CloudRain />}
                              {weatherData.condition === "Cloudy" && <CloudRain />}
                              {!["Sunny", "Rainy", "Cloudy"].includes(weatherData.condition) && <Sun />}
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500" />
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
                            <div className="text-xs text-gray-300 mb-1">Surface Temp</div>
                            <div className="font-bold flex items-center justify-center">
                              <Thermometer className="h-3 w-3 mr-1 text-red-400" />
                              78°F
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
                    </div>
                  )}
                </div>
                
                {/* Project Status Column */}
                <div className={dashboardSettings.showProjects ? "" : "hidden"}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center">
                        <Hammer className="h-5 w-5 text-[#7FC844] mr-2" />
                        Project Status
                      </h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7FC844]"></div>
                      </div>
                    ) : projects.length > 0 ? (
                      <div className="space-y-4">
                        {projects.slice(0, 3).map(project => (
                          <div 
                            key={project.id}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer transition-all hover:border-[#7FC844]"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowProjectDetails(true);
                            }}
                          >
                            <div className="flex justify-between mb-2">
                              <h4 className="font-medium">{project.title}</h4>
                              <Badge className={`
                                ${project.status === 'completed' ? 'bg-green-500' : 
                                  project.status === 'in_progress' ? 'bg-blue-500' :
                                  project.status === 'on_hold' ? 'bg-yellow-500' : 'bg-gray-500'} 
                                text-white text-xs
                              `}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-400 mb-3 line-clamp-1">{project.description}</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="text-sm">
                                <span className="text-gray-400">Budget: </span>
                                <span className="font-medium">{formatCurrency(project.budget)}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-400">Spent: </span>
                                <span className="font-medium">{formatCurrency(project.spent)}</span>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Budget Used</span>
                                <span>{Math.round((project.spent / project.budget) * 100)}%</span>
                              </div>
                              <Progress value={(project.spent / project.budget) * 100} className="h-1.5 bg-zinc-700">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    (project.spent / project.budget) > 0.9 ? 'bg-red-500' :
                                    (project.spent / project.budget) > 0.7 ? 'bg-yellow-500' : 'bg-[#7FC844]'
                                  }`}
                                  style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                                ></div>
                              </Progress>
                            </div>
                            
                            {vehicles.length > 0 && (
                              <div className="flex items-center mt-3 pt-3 border-t border-zinc-700">
                                <Car className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-400">
                                  {vehicles.find(v => v.id === project.vehicle_id)?.make} {vehicles.find(v => v.id === project.vehicle_id)?.model}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full border border-dashed border-zinc-700 hover:border-[#7FC844] hover:bg-zinc-800/50"
                          onClick={() => setActiveTab("projects")}
                        >
                          <ChevronRight className="h-4 w-4 mr-1" />
                          View All Projects
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-zinc-800 rounded-lg p-6 text-center">
                        <Hammer className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                        <p className="text-zinc-400 mb-4">Create projects to track your vehicle modifications</p>
                        <Button className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Project
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicles Row */}
                {dashboardSettings.showVehicles && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center">
                        <Car className="h-5 w-5 text-[#7FC844] mr-2" />
                        Your Vehicles
                      </h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7FC844]"></div>
                      </div>
                    ) : vehicles.length > 0 ? (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {vehicles.slice(0, 4).map(vehicle => (
                          <div 
                            key={vehicle.id}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden cursor-pointer transition-all hover:border-[#7FC844] flex flex-col"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowVehicleDetails(true);
                            }}
                          >
                            <div className="h-32 relative">
                              <img 
                                src={vehicle.image_url} 
                                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                {renderVehicleStatusBadge(vehicle.status)}
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <h4 className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</h4>
                              <p className="text-xs text-gray-400">{vehicle.trim}</p>
                              
                              <div className="flex justify-between mt-2 text-xs">
                                <div className="flex items-center">
                                  <Gauge className="h-3 w-3 text-[#7FC844] mr-1" />
                                  {formatNumber(vehicle.mileage)} mi
                                </div>
                                
                                <div className="flex items-center">
                                  <DollarSign className="h-3 w-3 text-[#7FC844] mr-1" />
                                  {formatCurrency(vehicle.current_value)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-800 rounded-lg p-6 text-center">
                        <Car className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                        <h3 className="text-lg font-medium mb-2">No vehicles yet</h3>
                        <p className="text-zinc-400 mb-4">Add your dream vehicles here</p>
                        <Button className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Vehicle
                        </Button>
                      </div>
                    )}
                    
                    {vehicles.length > 4 && (
                      <Button 
                        variant="ghost" 
                        className="w-full mt-4 border border-dashed border-zinc-700 hover:border-[#7FC844] hover:bg-zinc-800/50"
                        onClick={() => setActiveTab("vehicles")}
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        View All Vehicles
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Activity Feed */}
                {dashboardSettings.showActivity && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <History className="h-5 w-5 text-[#7FC844] mr-2" />
                      Recent Activity
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-zinc-700">
                        <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-[#7FC844] z-10 -translate-x-1.5"></div>
                        <div className="bg-zinc-800 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Goal progress updated</p>
                              <p className="text-sm text-gray-400">Engine swap for Ferrari 458</p>
                            </div>
                            <span className="text-xs text-gray-400">2h ago</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-zinc-700">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>75%</span>
                            </div>
                            <Progress value={75} className="h-1.5 bg-zinc-700">
                              <div 
                                className="h-full bg-[#7FC844] rounded-full"
                                style={{ width: '75%' }}
                              ></div>
                            </Progress>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-zinc-700">
                        <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-blue-500 z-10 -translate-x-1.5"></div>
                        <div className="bg-zinc-800 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">New project created</p>
                              <p className="text-sm text-gray-400">Carbon Fiber Hood Installation</p>
                            </div>
                            <span className="text-xs text-gray-400">Yesterday</span>
                          </div>
                          <div className="flex items-center mt-2 pt-2 border-t border-zinc-700">
                            <Car className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">Porsche 911 GT3</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-zinc-700">
                        <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-green-500 z-10 -translate-x-1.5"></div>
                        <div className="bg-zinc-800 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Goal completed</p>
                              <p className="text-sm text-gray-400">Restore classic Mustang</p>
                            </div>
                            <span className="text-xs text-gray-400">3 days ago</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full border border-dashed border-zinc-700 hover:border-[#7FC844] hover:bg-zinc-800/50"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        View All Activity
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Goals Tab */}
            <TabsContent value="goals" className="mt-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Target className="h-6 w-6 text-[#7FC844] mr-2" />
                    Goal Manifestation System
                  </h2>
                  
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search goals..."
                        className="pl-9 bg-zinc-900 border-zinc-800 w-[200px]"
                      />
                    </div>
                    
                    <Button
                      onClick={() => setShowCreateGoalDialog(true)}
                      className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      New Goal
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="all">
                  <TabsList className="bg-zinc-800/30 mb-4">
                    <TabsTrigger value="all">All Goals</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7FC844]"></div>
                      </div>
                    ) : goals.length > 0 ? (
                      <div className="space-y-4">
                        {goals.map(goal => (
                          <div 
                            key={goal.id}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-[#7FC844] transition-all cursor-pointer"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setShowGoalDetails(true);
                            }}
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-medium text-lg">{goal.title}</h3>
                                  <div className="flex gap-2">
                                    {renderPriorityBadge(goal.priority)}
                                    {renderGoalStatusBadge(goal.status)}
                                  </div>
                                </div>
                                
                                <p className="text-gray-400 text-sm mt-1 mb-3 line-clamp-2">{goal.description}</p>
                                
                                <div className="mt-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{goal.progress}%</span>
                                  </div>
                                  <Progress value={goal.progress} className="h-2 bg-zinc-700">
                                    <div 
                                      className="h-full bg-[#7FC844] rounded-full transition-all"
                                      style={{ width: `${goal.progress}%` }}
                                    ></div>
                                  </Progress>
                                </div>
                              </div>
                              
                              <div className="sm:w-64 flex sm:flex-col justify-between gap-3">
                                <div>
                                  <div className="text-sm text-gray-400">Target Date</div>
                                  <div className="font-medium flex items-center">
                                    <Calendar className="h-4 w-4 text-[#7FC844] mr-1" />
                                    {formatDate(goal.target_date)}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-sm text-gray-400">Category</div>
                                  <div className="font-medium flex items-center">
                                    <Tag className="h-4 w-4 text-[#7FC844] mr-1" />
                                    {goal.category}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-800 rounded-lg p-8 text-center">
                        <Target className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                        <h3 className="text-xl font-bold mb-2">No goals found</h3>
                        <p className="text-zinc-400 mb-6">Start by creating your first goal</p>
                        <Button 
                          onClick={() => setShowCreateGoalDialog(true)}
                          className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Goal
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Similar structures for other tabs */}
                </Tabs>
              </div>
            </TabsContent>
            
            {/* Other tab contents would follow a similar pattern */}
          </Tabs>
        </div>
      </div>
      
      {/* ======== MODALS & DIALOGS ======== */}
      {/* Goal Details Dialog */}
      <Dialog open={showGoalDetails} onOpenChange={setShowGoalDetails}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl">
          {selectedGoal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center">
                  <Target className="h-6 w-6 text-[#7FC844] mr-2" />
                  {selectedGoal.title}
                </DialogTitle>
                <div className="flex gap-2 mt-2">
                  {renderPriorityBadge(selectedGoal.priority)}
                  {renderGoalStatusBadge(selectedGoal.status)}
                </div>
                <DialogDescription className="text-gray-400 mt-2">
                  {selectedGoal.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Progress Tracking</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Progress</span>
                      <span>{selectedGoal.progress}%</span>
                    </div>
                    <Progress value={selectedGoal.progress} className="h-2.5 bg-zinc-700">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7FC844] to-blue-500 rounded-full"
                        style={{ width: `${selectedGoal.progress}%` }}
                      ></div>
                    </Progress>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-400">Current Value</div>
                        <div className="text-lg font-bold">
                          {selectedGoal.current_value || 0}
                          {selectedGoal.unit && <span className="text-sm ml-1">{selectedGoal.unit}</span>}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400">Target Value</div>
                        <div className="text-lg font-bold">
                          {selectedGoal.target_value || 100}
                          {selectedGoal.unit && <span className="text-sm ml-1">{selectedGoal.unit}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Action Steps</h3>
                    {selectedGoal.steps && selectedGoal.steps.length > 0 ? (
                      <div className="space-y-2">
                        {selectedGoal.steps.map((step, index) => (
                          <div key={step.id} className="flex items-start gap-3 p-2 rounded hover:bg-zinc-700/30">
                            <div>
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                                step.completed ? 'bg-green-500/20 text-green-500' : 'bg-zinc-700 text-zinc-400'
                              }`}>
                                {step.completed ? <Check className="h-3 w-3" /> : <span className="text-xs">{index + 1}</span>}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className={step.completed ? 'line-through text-gray-400' : ''}>{step.title}</p>
                              {step.due_date && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Due: {formatDate(step.due_date)}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-400">
                        <ClipboardList className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                        <p>No steps defined yet</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Step
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Goal Details</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-400">Category</div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-[#7FC844] mr-1" />
                          {selectedGoal.category}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400">Target Date</div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-[#7FC844] mr-1" />
                          {formatDate(selectedGoal.target_date)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400">Created</div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-[#7FC844] mr-1" />
                          {formatDate(selectedGoal.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedGoal.tags && selectedGoal.tags.length > 0 && (
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <h3 className="font-medium mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedGoal.tags.map((tag, index) => (
                          <Badge key={index} className="bg-zinc-700 hover:bg-zinc-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedGoal.related_vehicles && selectedGoal.related_vehicles.length > 0 && (
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <h3 className="font-medium mb-3">Related Vehicles</h3>
                      <div className="space-y-2">
                        {selectedGoal.related_vehicles.map(vehicleId => {
                          const vehicle = vehicles.find(v => v.id === vehicleId);
                          return vehicle ? (
                            <div key={vehicleId} className="flex items-center gap-2 p-2 rounded hover:bg-zinc-700/30">
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <img 
                                  src={vehicle.image_url} 
                                  alt={vehicle.make}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                <p className="text-xs text-gray-400">{vehicle.trim}</p>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline">
                  Edit
                </Button>
                <Button variant="outline" className="text-yellow-500 border-yellow-500/50 hover:bg-yellow-950/20">
                  Convert to Project
                </Button>
                <Button className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90">
                  Update Progress
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Goal Dialog */}
      <Dialog open={showCreateGoalDialog} onOpenChange={setShowCreateGoalDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Target className="h-6 w-6 text-[#7FC844] mr-2" />
              Create New Goal
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Set clear, measurable goals to manifest your automotive dreams
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input 
                  id="title" 
                  placeholder="E.g., Engine Swap for Ferrari 458"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your goal in detail..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 h-[115px] mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newGoal.category}
                  onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input 
                    id="target_date" 
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newGoal.priority}
                    onValueChange={(value: any) => setNewGoal({ ...newGoal, priority: value })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newGoal.status}
                  onValueChange={(value: any) => setNewGoal({ ...newGoal, status: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="deferred">Deferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="progress">Initial Progress ({newGoal.progress}%)</Label>
                <Slider 
                  id="progress"
                  min={0}
                  max={100}
                  step={5}
                  value={[newGoal.progress as number]}
                  onValueChange={(values) => setNewGoal({ ...newGoal, progress: values[0] })}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="related_vehicle">Related Vehicle (Optional)</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateGoalDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
              onClick={handleCreateGoal}
              disabled={!newGoal.title.trim()}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mood Tracker Dialog */}
      <Dialog open={showMoodTracker} onOpenChange={setShowMoodTracker}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Brain className="h-6 w-6 text-[#7FC844] mr-2" />
              Mood & Energy Tracker
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Track how you feel about your progress and energy levels
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-lg">How are you feeling today?</Label>
              <div className="flex justify-between items-center mt-3 text-4xl">
                <button 
                  className={`p-2 rounded-full ${newMoodEntry.mood_score === 1 ? 'bg-zinc-700 ring-2 ring-[#7FC844]' : 'hover:bg-zinc-800'}`}
                  onClick={() => setNewMoodEntry({ ...newMoodEntry, mood_score: 1 })}
                >
                  😞
                </button>
                <button 
                  className={`p-2 rounded-full ${newMoodEntry.mood_score === 2 ? 'bg-zinc-700 ring-2 ring-[#7FC844]' : 'hover:bg-zinc-800'}`}
                  onClick={() => setNewMoodEntry({ ...newMoodEntry, mood_score: 2 })}
                >
                  😔
                </button>
                <button 
                  className={`p-2 rounded-full ${newMoodEntry.mood_score === 3 ? 'bg-zinc-700 ring-2 ring-[#7FC844]' : 'hover:bg-zinc-800'}`}
                  onClick={() => setNewMoodEntry({ ...newMoodEntry, mood_score: 3 })}
                >
                  😐
                </button>
                <button 
                  className={`p-2 rounded-full ${newMoodEntry.mood_score === 4 ? 'bg-zinc-700 ring-2 ring-[#7FC844]' : 'hover:bg-zinc-800'}`}
                  onClick={() => setNewMoodEntry({ ...newMoodEntry, mood_score: 4 })}
                >
                  🙂
                </button>
                <button 
                  className={`p-2 rounded-full ${newMoodEntry.mood_score === 5 ? 'bg-zinc-700 ring-2 ring-[#7FC844]' : 'hover:bg-zinc-800'}`}
                  onClick={() => setNewMoodEntry({ ...newMoodEntry, mood_score: 5 })}
                >
                  😄
                </button>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            
            <div>
              <Label className="text-lg">Energy Level</Label>
              <div className="bg-zinc-800 rounded-lg p-4 mt-2">
                <Slider 
                  min={1}
                  max={5}
                  step={1}
                  value={[newMoodEntry.energy_level as number]}
                  onValueChange={(values) => setNewMoodEntry({ ...newMoodEntry, energy_level: values[0] })}
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <div className="flex items-center">
                    <BatteryCharging className="h-4 w-4 text-red-500 mr-1" />
                    Low Energy
                  </div>
                  <div className="flex items-center">
                    <BatteryCharging className="h-4 w-4 text-green-500 mr-1" />
                    High Energy
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="mood_notes">Notes (Optional)</Label>
              <Textarea 
                id="mood_notes" 
                placeholder="What's contributing to how you feel today?"
                value={newMoodEntry.notes}
                onChange={(e) => setNewMoodEntry({ ...newMoodEntry, notes: e.target.value })}
                className="bg-zinc-800 border-zinc-700 h-24 mt-1"
              />
            </div>
            
            <div>
              <Label>Associated Activities</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Working on vehicle', 'Setting goals', 'Making progress', 'Facing challenges'].map(activity => (
                  <div key={activity} className="flex items-center space-x-2">
                    <Checkbox id={activity.replace(/\s+/g, '_')} />
                    <Label 
                      htmlFor={activity.replace(/\s+/g, '_')}
                      className="text-sm cursor-pointer"
                    >
                      {activity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowMoodTracker(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
              onClick={handleMoodEntry}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Settings className="h-6 w-6 text-[#7FC844] mr-2" />
              Dashboard Settings
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Customize your Manifestation Station experience
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="widgets">
            <TabsList className="bg-zinc-800/30 mb-4">
              <TabsTrigger value="widgets">Widgets</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="widgets" className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">Widget Visibility</h3>
                <div className="space-y-3">
                  {Object.entries(dashboardSettings)
                    .filter(([key]) => key.startsWith('show'))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="cursor-pointer">
                          {key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Switch 
                          id={key}
                          checked={value as boolean}
                          onCheckedChange={(checked) => handleSettingChange(key as keyof DashboardSettings, checked)}
                          className="data-[state=checked]:bg-[#7FC844]"
                        />
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">Widget Order</h3>
                <div className="text-sm text-gray-400">
                  Drag and drop to reorder widgets (coming soon)
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">Visual Style</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['minimal', 'detailed', 'graphical'].map(style => (
                    <div 
                      key={style}
                      className={`border rounded-lg p-3 cursor-pointer ${
                        dashboardSettings.visualStyle === style 
                          ? 'border-[#7FC844] bg-zinc-700/30' 
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                      onClick={() => handleSettingChange('visualStyle', style as any)}
                    >
                      <div className="text-center">
                        {style === 'minimal' && <Minimize className="h-8 w-8 mx-auto mb-2 text-zinc-400" />}
                        {style === 'detailed' && <LayoutGrid className="h-8 w-8 mx-auto mb-2 text-zinc-400" />}
                        {style === 'graphical' && <BarChart className="h-8 w-8 mx-auto mb-2 text-zinc-400" />}
                        <div className="capitalize">{style}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">Color Theme</h3>
                <Label>Primary Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#7FC844', '#3B82F6', '#EC4899', '#F59E0B', '#10B981'].map(color => (
                    <div 
                      key={color}
                      className={`h-8 w-8 rounded-full cursor-pointer ${
                        dashboardSettings.primaryColor === color 
                          ? 'ring-2 ring-white' 
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleSettingChange('primaryColor', color)}
                    ></div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <Switch 
                    id="darkMode"
                    checked={dashboardSettings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                    className="data-[state=checked]:bg-[#7FC844]"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">Notification Preferences</h3>
                <div className="space-y-3">
                  {['Goal Reminders', 'Achievement Celebrations', 'Maintenance Alerts', 'Progress Updates'].map(pref => (
                    <div key={pref} className="flex items-center justify-between">
                      <Label htmlFor={pref.replace(/\s+/g, '')}>{pref}</Label>
                      <Switch 
                        id={pref.replace(/\s+/g, '')}
                        defaultChecked={true}
                        className="data-[state=checked]:bg-[#7FC844]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              className="bg-[#7FC844] text-black hover:bg-[#7FC844]/90"
              onClick={() => setShowSettingsDialog(false)}
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Weather Details Dialog */}
      <Dialog open={showDetailedWeather} onOpenChange={setShowDetailedWeather}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <CloudRain className="h-6 w-6 text-[#7FC844] mr-2" />
              Weather & Environment Telemetry
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed weather data and detailing recommendations
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="h-14 w-14 bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                    <CloudRain className="h-7 w-7 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{weatherData.temp}°F</div>
                    <div className="text-gray-400">
                      {weatherData.condition} in {weatherData.location}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-zinc-700 rounded p-3">
                    <div className="text-xs text-gray-300 mb-1">Humidity</div>
                    <div className="text-xl font-bold">{weatherData.humidity}%</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {weatherData.humidity > 70 ? 'High' : weatherData.humidity < 30 ? 'Low' : 'Optimal'}
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700 rounded p-3">
                    <div className="text-xs text-gray-300 mb-1">Wind Speed</div>
                    <div className="text-xl font-bold">{weatherData.wind} mph</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {weatherData.wind > 15 ? 'Strong' : weatherData.wind < 5 ? 'Calm' : 'Moderate'}
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700 rounded p-3">
                    <div className="text-xs text-gray-300 mb-1">Surface Temp</div>
                    <div className="text-xl font-bold">78°F</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Optimal for detailing
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700 rounded p-3">
                    <div className="text-xs text-gray-300 mb-1">Dew Point</div>
                    <div className="text-xl font-bold">58°F</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Low humidity risk
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-lg p-4 text-white ${weatherRecommendation.isGood ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  {weatherRecommendation.isGood ? 
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" /> : 
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  }
                  Detailing Recommendation
                </h3>
                <p className="mb-3">{weatherRecommendation.message}</p>
                <div className="text-sm">
                  {weatherRecommendation.isGood ? (
                    <ul className="space-y-1">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-400 mr-2" />
                        Temperature within optimal range (60-85°F)
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-400 mr-2" />
                        Humidity levels conducive to proper drying
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-400 mr-2" />
                        Low wind reduces risk of contaminants
                      </li>
                    </ul>
                  ) : (
                    <ul className="space-y-1">
                      <li className="flex items-center">
                        <X className="h-4 w-4 text-red-400 mr-2" />
                        Temperature outside optimal range
                      </li>
                      <li className="flex items-center">
                        <X className="h-4 w-4 text-red-400 mr-2" />
                        High humidity may affect product performance
                      </li>
                      <li className="flex items-center">
                        <X className="h-4 w-4 text-red-400 mr-2" />
                        Consider rescheduling for better conditions
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-3">5-Day Forecast</h3>
                <div className="space-y-3">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-zinc-700 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-20 text-gray-400">{day.day}</div>
                        <div className="w-8 text-[#7FC844]">
                          {day.condition === "Sunny" && <Sun className="h-5 w-5" />}
                          {day.condition === "Partly Cloudy" && <CloudSun className="h-5 w-5" />}
                          {day.condition === "Cloudy" && <Cloud className="h-5 w-5" />}
                          {day.condition === "Rain" && <CloudRain className="h-5 w-5" />}
                        </div>
                        <div>{day.condition}</div>
                      </div>
                      <div className="text-sm">
                        <span className="text-red-400">{day.high}°</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-blue-400">{day.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-3">Temperature Analysis</h3>
                <div className="h-48 flex items-end">
                  {Array.from({ length: 24 }, (_, i) => {
                    const height = 30 + Math.random() * 70;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-red-500 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs mt-1">{i}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">24 Hour Temperature Trend (°F)</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowDetailedWeather(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManifestationStation;
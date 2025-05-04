import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import WeatherStation from '../components/WeatherStation';
import WorldClockPanel from '../components/WorldClockPanel';
import APIDebugger from '../components/APIDebugger';
import supabase from '../services/supabaseClient';
import { 
  Calendar, BarChart3, Car, Map, Settings, Bell, Shield, ChevronRight, 
  MessageSquare, HeartHandshake, Star, EyeOff, Gauge, ClipboardCheck, 
  Wrench, Award, Trophy, FileText, Activity, Clock, User, 
  Cloud, Brain, BookMarked, SprayCan
} from 'lucide-react';

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: 'drive' | 'maintenance' | 'event' | 'track';
  description?: string;
}

interface RecentDrive {
  id: number;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  vehicle?: string;
}

interface MaintenanceAlert {
  id: number;
  vehicle: string;
  serviceDue: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  mileage?: number;
}

interface UserPreference {
  key: string;
  value: any;
}

function DashboardPage() {
  const [userName, setUserName] = useState<string>('gavingotime');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('2020 BMW 330i xDrive');
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentDrives, setRecentDrives] = useState<RecentDrive[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<string[]>([
    'weather', 'world_clock', 'vehicles', 'drives', 'events', 'maintenance', 'uniform'
  ]);
  
  // Add uniform section data
  const [uniformData, setUniformData] = useState({
    helmetSize: 'Medium (58-59cm)',
    gloveSize: 'Large',
    shoeSize: '10.5 US'
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [driveStats, setDriveStats] = useState({
    totalDrives: 12,
    totalDistance: 986,
    averageSpeed: 62,
    favoriteRoute: 'Mountain Curves'
  });
  const [achievementPoints, setAchievementPoints] = useState<number>(785);
  const [notifications, setNotifications] = useState<number>(3);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(true);
  
  // User vehicles
  const userVehicles = [
    { id: 1, name: '2020 BMW 330i xDrive', year: 2020, image: '/assets/bmw-330i.jpg', lastDriven: '1 day ago' },
    { id: 2, name: 'BMW M5 Competition', year: 2023, image: '/assets/bmw-m5.jpg', lastDriven: '2 weeks ago' },
    { id: 3, name: 'Mercedes AMG GT', year: 2022, image: '/assets/amg-gt.jpg', lastDriven: '1 month ago' }
  ];

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      setUpcomingEvents([
        { id: 1, title: 'Mountain Drive', date: '2025-04-30T09:00:00', type: 'drive', description: 'Scenic route through Blue Ridge Mountains' },
        { id: 2, title: 'Track Day at Atlanta Motor Speedway', date: '2025-05-12T10:00:00', type: 'track', description: 'Private event with 10 laps' },
        { id: 3, title: 'Oil Change', date: '2025-05-05T14:00:00', type: 'maintenance', description: 'Audi RS6 Avant' }
      ]);
      
      setRecentDrives([
        { id: 1, date: '2025-04-26', startLocation: 'Roswell, GA', endLocation: 'Asheville, NC', distance: 124.5, duration: 120, vehicle: 'Audi RS6 Avant' },
        { id: 2, date: '2025-04-20', startLocation: 'Roswell, GA', endLocation: 'Savannah, GA', distance: 209.3, duration: 180, vehicle: 'BMW M5 Competition' },
        { id: 3, date: '2025-04-15', startLocation: 'Roswell, GA', endLocation: 'Atlanta, GA', distance: 30.2, duration: 45, vehicle: 'Mercedes AMG GT' }
      ]);
      
      setMaintenanceAlerts([
        { id: 1, vehicle: 'Audi RS6 Avant', serviceDue: 'Oil Change', dueDate: '2025-05-05', priority: 'medium', mileage: 3500 },
        { id: 2, vehicle: 'BMW M5 Competition', serviceDue: 'Brake Fluid Flush', dueDate: '2025-05-10', priority: 'high', mileage: 5000 },
        { id: 3, vehicle: 'Mercedes AMG GT', serviceDue: 'Annual Service', dueDate: '2025-06-15', priority: 'low', mileage: 12000 }
      ]);
    }, 500);
    
    // Get user preferences from localStorage or default values
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      setDashboardLayout(JSON.parse(savedLayout));
    }
  }, []);
  
  const saveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
    setIsEditMode(false);
  };
  
  const movePanel = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === dashboardLayout.length - 1)) {
      return;
    }
    
    const newLayout = [...dashboardLayout];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newLayout[index], newLayout[newIndex]] = [newLayout[newIndex], newLayout[index]];
    setDashboardLayout(newLayout);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderDashboardPanel = (panelType: string) => {
    switch(panelType) {
      case 'weather':
        return (
          <div className="block mb-6">
            <WeatherStation />
          </div>
        );
        
      case 'world_clock':
        return (
          <div className="block mb-6">
            <WorldClockPanel />
          </div>
        );
        
      case 'vehicles':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">My Vehicles</h2>
              <Link to="/garage-vault" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userVehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-blue-500 transition-all group">
                  <div className="h-32 bg-gray-800 rounded-md mb-3 overflow-hidden">
                    {/* Placeholder for vehicle image */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <Car size={48} className="text-gray-700" />
                    </div>
                  </div>
                  <h3 className="text-blue-400 font-bold">{vehicle.name}</h3>
                  <p className="text-gray-400 text-sm">{vehicle.year}</p>
                  <p className="text-xs text-gray-500 mt-2">Last driven: {vehicle.lastDriven}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'drives':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Recent Drives</h2>
              <Link to="/drive-journal" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View Journal <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-blue-900/30 p-2 mr-3">
                    <Activity size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Drives</p>
                    <p className="text-xl text-white font-bold">{driveStats.totalDrives}</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-green-900/30 p-2 mr-3">
                    <Map size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Miles</p>
                    <p className="text-xl text-white font-bold">{driveStats.totalDistance}</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-orange-900/30 p-2 mr-3">
                    <Gauge size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Avg. Speed</p>
                    <p className="text-xl text-white font-bold">{driveStats.averageSpeed} mph</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-purple-900/30 p-2 mr-3">
                    <Trophy size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Favorite Route</p>
                    <p className="text-md text-white font-bold">{driveStats.favoriteRoute}</p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-800">
                {recentDrives.map(drive => (
                  <div key={drive.id} className="py-3 hover:bg-gray-900/50 px-3 rounded-lg transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{drive.startLocation} to {drive.endLocation}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Calendar size={12} className="mr-1" />
                          <span className="mr-3">{new Date(drive.date).toLocaleDateString()}</span>
                          <Car size={12} className="mr-1" />
                          <span>{drive.vehicle}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-bold">{drive.distance.toFixed(1)} mi</span>
                        <p className="text-xs text-gray-400">{Math.floor(drive.duration / 60)}h {drive.duration % 60}m</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Link to="/route-planner" className="apex-button bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2">
                <Map size={16} />
                <span>Plan New Drive</span>
              </Link>
            </div>
          </div>
        );
        
      case 'events':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Upcoming Events</h2>
              <Link to="/events-page" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View Calendar <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-800">
              {upcomingEvents.map(event => (
                <div key={event.id} className="py-3 px-2 hover:bg-gray-900/50 rounded-lg transition-colors flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 
                    ${event.type === 'drive' ? 'bg-green-900/30' : 
                      event.type === 'maintenance' ? 'bg-orange-900/30' : 
                      event.type === 'track' ? 'bg-red-900/30' : 'bg-blue-900/30'}`}>
                    {event.type === 'drive' && <Map size={18} className="text-green-400" />}
                    {event.type === 'maintenance' && <Wrench size={18} className="text-orange-400" />}
                    {event.type === 'track' && <Activity size={18} className="text-red-400" />}
                    {event.type === 'event' && <Calendar size={18} className="text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{event.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">{new Date(event.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</p>
                      {event.description && (
                        <p className="text-xs text-gray-500">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-center">
              <Link to="/add-event" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>Add Event</span>
              </Link>
            </div>
          </div>
        );
        
      case 'maintenance':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Maintenance Alerts</h2>
              <Link to="/maintenance-hub" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-800">
              {maintenanceAlerts.map(alert => (
                <div key={alert.id} className="py-3 hover:bg-gray-900/50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className={`w-2 h-full min-h-[40px] rounded-full mr-3
                      ${alert.priority === 'high' ? 'bg-red-500' : 
                        alert.priority === 'medium' ? 'bg-yellow-500' : 
                        'bg-green-500'}`}>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-white font-medium">{alert.serviceDue}</p>
                        <p className="text-xs text-gray-400">Due: {new Date(alert.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-400">{alert.vehicle}</p>
                        {alert.mileage && (
                          <p className="text-xs text-gray-500">{alert.mileage.toLocaleString()} miles</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {maintenanceAlerts.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-gray-500">No maintenance alerts</p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prevState => !prevState);
  }, []);
  
  const toggleWelcomeMessage = useCallback(() => {
    setShowWelcomeMessage(prevState => !prevState);
  }, []);
  
  const handleVehicleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicle(e.target.value);
  }, []);

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      {/* F1-inspired carbon fiber background with telemetry grid */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] bg-fixed bg-[size:20px_20px]"></div>
      </div>
      
      {/* Main Dashboard Container */}
      <div className="relative z-10">
        {/* Top Command Bar - Fixed Position */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-black/95 via-gray-900/90 to-black/95 border-b border-blue-500/30 backdrop-blur-md">
          <div className="mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Left: Logo & Branding */}
              <div className="flex items-center">
                <div className="relative mr-3 flex items-center">
                  <img 
                    src="/assets/GTM Logo - Green-White.png" 
                    alt="GoTime Motorsports" 
                    className="h-12 w-auto drop-shadow-[0_0_8px_rgba(8,197,25,0.6)]"
                  />
                  <div className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative h-2 w-2 rounded-full bg-green-500"></span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <h1 className="text-blue-400 font-orbitron text-2xl uppercase font-bold tracking-widest border-b border-blue-500/30 pb-0.5">PADDOCK20</h1>
                    <div className="ml-2 px-1.5 py-0.5 bg-green-500/20 border border-green-500 rounded text-[10px] text-green-400 font-mono tracking-tight">
                      VER 2027.4
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-400 font-medium">gavingotime</span>
                      <span className="mx-1.5 text-gray-600">|</span>
                      <span className="uppercase font-mono tracking-tight">{new Date().toLocaleTimeString('en-US', {hour12: false})}</span>
                      <span className="mx-1.5 text-gray-600">|</span>
                      <span className="text-blue-400">ELITE DRIVER</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right: Controls */}
              <div className="flex items-center gap-3">
                {/* Vehicle Selector */}
                <div className="bg-black/60 border border-gray-800 rounded-lg px-3 py-1.5 hidden md:flex items-center">
                  <Car size={14} className="text-blue-400 mr-2" />
                  <select 
                    value={selectedVehicle}
                    onChange={handleVehicleChange}
                    className="bg-transparent border-none text-white text-sm focus:ring-0 focus:outline-none pr-8 py-0"
                  >
                    <option value="Audi RS6 Avant">Audi RS6 Avant</option>
                    <option value="BMW M5 Competition">BMW M5 Competition</option>
                    <option value="Mercedes AMG GT">Mercedes AMG GT</option>
                  </select>
                </div>
                
                {/* Notifications */}
                <div className="relative group">
                  <button className="relative bg-black/60 border border-gray-800 hover:border-blue-500 p-2 rounded-lg transition-all">
                    <Bell size={18} className="text-blue-400" />
                    {notifications > 0 && (
                      <div className="absolute -top-1 -right-1 flex">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 items-center justify-center text-[8px] text-white font-bold">{notifications}</span>
                        </span>
                      </div>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  <div className="absolute top-full right-0 mt-1 w-80 bg-black/90 border border-blue-500/30 rounded-lg p-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-blue-400 font-orbitron text-xs uppercase">System Notifications</h3>
                      <span className="text-xs text-gray-500">Today</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-900/50 rounded border-l-2 border-red-500 hover:bg-gray-900/80 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <Wrench size={14} className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-white font-medium">Maintenance Alert</p>
                              <p className="text-xs text-gray-400">Audi RS6 Avant: Oil Change Due</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500">2h ago</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-900/50 rounded border-l-2 border-yellow-500 hover:bg-gray-900/80 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <Cloud size={14} className="text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-white font-medium">Weather Warning</p>
                              <p className="text-xs text-gray-400">Rain expected on planned route</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500">5h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Edit Mode Toggle */}
                <button 
                  onClick={toggleEditMode} 
                  className={`bg-black/60 border ${isEditMode ? 'border-green-500' : 'border-gray-800 hover:border-blue-500'} p-2 rounded-lg transition-all group`}
                  title={isEditMode ? "Save Layout" : "Edit Dashboard"}
                >
                  <Settings size={18} className={`${isEditMode ? 'text-green-400' : 'text-blue-400'} group-hover:rotate-90 transition-transform duration-300`} />
                </button>
                
                {/* Command Center Menu */}
                <div className="relative group z-50">
                  <button className="bg-black/60 border border-gray-800 hover:border-blue-500 p-2 rounded-lg transition-all">
                    <ChevronRight size={18} className="text-blue-400" />
                  </button>
                  
                  {/* Command Center Dropdown */}
                  <div className="absolute top-full right-0 mt-1 w-72 bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-800">
                      <h3 className="text-blue-400 font-orbitron text-xs uppercase mb-1 flex items-center">
                        <Shield className="h-3 w-3 mr-1.5" /> Command Center
                      </h3>
                      <p className="text-[11px] text-gray-400">Access your complete Paddock20 ecosystem</p>
                    </div>
                    
                    <div className="grid grid-cols-2 p-2 gap-1.5">
                      <Link to="/garage-vault" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Car size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Garage Vault</p>
                          <p className="text-[10px] text-gray-500">3 Vehicles</p>
                        </div>
                      </Link>
                      <Link to="/maintenance-hub" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Wrench size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Maintenance</p>
                          <p className="text-[10px] text-gray-500">2 Alerts</p>
                        </div>
                      </Link>
                      <Link to="/" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <SprayCan size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Juice Box</p>
                          <p className="text-[10px] text-gray-500">Detailing</p>
                        </div>
                      </Link>
                      <Link to="/" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Brain size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Manifest</p>
                          <p className="text-[10px] text-gray-500">Build Assistant</p>
                        </div>
                      </Link>
                      <Link to="/drive-journal" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-yellow-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Clock size={14} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Drive Journal</p>
                          <p className="text-[10px] text-gray-500">{driveStats.totalDrives} Drives</p>
                        </div>
                      </Link>
                      <Link to="/playlists" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-yellow-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <MessageSquare size={14} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Playlists</p>
                          <p className="text-[10px] text-gray-500">Media</p>
                        </div>
                      </Link>
                      <Link to="/podium-pursuit" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-purple-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Trophy size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Podium Pursuit</p>
                          <p className="text-[10px] text-gray-500">{achievementPoints} Points</p>
                        </div>
                      </Link>
                      <Link to="/gallery" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-purple-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <BookMarked size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Media Gallery</p>
                          <p className="text-[10px] text-gray-500">Photos & Docs</p>
                        </div>
                      </Link>
                    </div>
                    
                    {/* Account Management */}
                    <div className="border-t border-gray-800 p-2">
                      <div className="p-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mr-2">
                            <User size={14} className="text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-400">Account Settings</p>
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* F1 Telemetry HUD - Top Stats Bar */}
          <div className="bg-black/80 border border-blue-500/20 rounded-lg backdrop-blur-sm p-4 mb-6 relative overflow-hidden">
            {/* F1-style scanline animation */}
            <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-blue-500/30"></div>
              <div className="absolute left-0 top-0 bottom-0 w-px bg-blue-500/30"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-500/30"></div>
              <div className="absolute right-0 top-0 bottom-0 w-px bg-blue-500/30"></div>
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 via-transparent to-transparent opacity-30"></div>
            </div>
            
            {/* Telemetry Active Status */}
            {showWelcomeMessage ? (
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-1 bg-blue-500 rounded-full mr-4 animate-pulse"></div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-blue-400 font-orbitron text-lg uppercase tracking-wider">TELEMETRY ACTIVE</h2>
                      <button 
                        onClick={() => setShowWelcomeMessage(false)} 
                        className="ml-3 text-gray-400 hover:text-white"
                        title="Minimize Telemetry"
                      >
                        <EyeOff size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 max-w-2xl">
                      Full system integration active. Driver data synchronized across all Paddock20 modules. Activate individual command modules below or use quick access commands.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-500 uppercase">SESSION</div>
                    <div className="font-orbitron text-green-400 text-lg">ACTIVE</div>
                  </div>
                  
                  <Link to="/route-planner" className="bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center">
                    <Map size={16} className="mr-2" />
                    Start New Drive
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-10 w-1 bg-blue-500 rounded-full mr-4"></div>
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-md uppercase tracking-wider flex items-center">
                      <Trophy size={16} className="mr-2 text-yellow-400" />
                      Driver Performance Dashboard
                    </h2>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowWelcomeMessage(true)}
                    className="bg-blue-900/30 border border-blue-500/40 hover:bg-blue-900/50 text-blue-400 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center"
                  >
                    <Gauge size={14} className="mr-1.5" />
                    Show Telemetry
                  </button>
                  
                  <Link to="/route-planner" className="bg-green-900/30 border border-green-500/40 hover:bg-green-900/50 text-green-400 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center">
                    <Map size={14} className="mr-1.5" />
                    Plan Drive
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Dashboard Layout Edit Mode */}
          {isEditMode && (
            <div className="mb-6 bg-black/60 p-4 rounded-lg border border-blue-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-blue-400 font-orbitron text-sm uppercase">Command Center Layout</h2>
                <div>
                  <button 
                    onClick={saveLayout} 
                    className="bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg mr-2 text-xs"
                  >
                    Save Layout
                  </button>
                  <button 
                    onClick={() => setIsEditMode(false)} 
                    className="bg-gray-900/80 border border-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {dashboardLayout.map((panel, index) => (
                  <div key={index} className="flex items-center bg-black/70 p-3 rounded-lg border border-gray-800">
                    <div className="mr-3 text-gray-500 font-mono text-xs">
                      {index + 1}.
                    </div>
                    <div className="flex-1 capitalize text-white">
                      {panel.replace('_', ' ')} Module
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => movePanel(index, 'up')} 
                        disabled={index === 0}
                        className={`p-1 rounded-full ${index === 0 ? 'text-gray-700' : 'text-blue-400 hover:bg-blue-900/20'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => movePanel(index, 'down')} 
                        disabled={index === dashboardLayout.length - 1}
                        className={`p-1 rounded-full ${index === dashboardLayout.length - 1 ? 'text-gray-700' : 'text-blue-400 hover:bg-blue-900/20'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Render dashboard panels according to user's layout preference */}
          {dashboardLayout.map((panel, index) => (
            <div key={index} className="mb-6">
              {renderDashboardPanel(panel)}
            </div>
          ))}
          
          {/* Quick Action Grid */}
          <div className="mt-8 mb-10">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-green-500 mr-3"></div>
              <h2 className="text-green-400 font-orbitron text-lg uppercase tracking-wider">Quick Navigation</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link to="/route-planner" className="bg-black/60 border border-blue-500/20 hover:border-blue-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Map size={24} className="text-blue-400" />
                </div>
                <p className="text-sm text-white font-medium">Route Planner</p>
                <p className="text-xs text-gray-500">Plan your next drive</p>
              </Link>
              
              <Link to="/drive-journal" className="bg-black/60 border border-green-500/20 hover:border-green-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileText size={24} className="text-green-400" />
                </div>
                <p className="text-sm text-white font-medium">Drive Journal</p>
                <p className="text-xs text-gray-500">Log your experiences</p>
              </Link>
              
              <Link to="/garage-vault" className="bg-black/60 border border-purple-500/20 hover:border-purple-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Car size={24} className="text-purple-400" />
                </div>
                <p className="text-sm text-white font-medium">Garage Vault</p>
                <p className="text-xs text-gray-500">Manage your vehicles</p>
              </Link>
              
              <Link to="/weather-paddock" className="bg-black/60 border border-cyan-500/20 hover:border-cyan-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Cloud size={24} className="text-cyan-400" />
                </div>
                <p className="text-sm text-white font-medium">Weather</p>
                <p className="text-xs text-gray-500">Check conditions</p>
              </Link>
              
              <Link to="/juice-box" className="bg-black/60 border border-amber-500/20 hover:border-amber-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <SprayCan size={24} className="text-amber-400" />
                </div>
                <p className="text-sm text-white font-medium">Juice Box™</p>
                <p className="text-xs text-gray-500">Detailing expertise</p>
              </Link>
              
              <Link to="/manifest-station" className="bg-black/60 border border-rose-500/20 hover:border-rose-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Brain size={24} className="text-rose-400" />
                </div>
                <p className="text-sm text-white font-medium">Manifest</p>
                <p className="text-xs text-gray-500">Build assistant</p>
              </Link>
            </div>
          </div>
          
          {/* API Debugger Component - Developer Tool (hidden in production) */}
          <div className="mt-12 mb-6">
            <APIDebugger />
          </div>
          
          {/* Footer */}
          <div className="mt-16 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
            <p>Paddock20 Portal © {new Date().getFullYear()} GoTime Motorsports</p>
            <p className="mt-1">Designed for true automotive enthusiasts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
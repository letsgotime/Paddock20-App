import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeatherStation from '../components/WeatherStation';
import WorldClock from '../components/WorldClock';
import APIDebugger from '../components/APIDebugger';
import supabase from '../services/supabaseClient';
import { Calendar, BarChart3, Car, Map, Settings, Bell, Shield, ChevronRight, 
         MessageSquare, HeartHandshake, Star, EyeOff, Gauge, ClipboardCheck, 
         Wrench, Award, Trophy, FileText, Activity, Clock } from 'lucide-react';

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
  const [userName, setUserName] = useState<string>('Car Enthusiast');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('Ferrari F8 Tributo');
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentDrives, setRecentDrives] = useState<RecentDrive[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<string[]>(['weather', 'world_clock', 'vehicles', 'drives', 'events', 'maintenance']);
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
  
  // Mock user vehicles
  const userVehicles = [
    { id: 1, name: 'Ferrari F8 Tributo', year: 2023, image: '/assets/ferrari-f8.jpg', lastDriven: '2 days ago' },
    { id: 2, name: 'Porsche 911 GT3', year: 2022, image: '/assets/porsche-gt3.jpg', lastDriven: '1 week ago' },
    { id: 3, name: 'Lamborghini Huracán', year: 2021, image: '/assets/lambo-huracan.jpg', lastDriven: '3 weeks ago' }
  ];

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      setUpcomingEvents([
        { id: 1, title: 'Mountain Drive', date: '2025-04-30T09:00:00', type: 'drive', description: 'Scenic route through Blue Ridge Mountains' },
        { id: 2, title: 'Track Day at Charlotte Motor Speedway', date: '2025-05-12T10:00:00', type: 'track', description: 'Private event with 10 laps' },
        { id: 3, title: 'Oil Change', date: '2025-05-05T14:00:00', type: 'maintenance', description: 'Ferrari F8 Tributo' }
      ]);
      
      setRecentDrives([
        { id: 1, date: '2025-04-26', startLocation: 'Charlotte, NC', endLocation: 'Asheville, NC', distance: 124.5, duration: 120, vehicle: 'Ferrari F8 Tributo' },
        { id: 2, date: '2025-04-20', startLocation: 'Charlotte, NC', endLocation: 'Charleston, SC', distance: 209.3, duration: 180, vehicle: 'Porsche 911 GT3' },
        { id: 3, date: '2025-04-15', startLocation: 'Charlotte, NC', endLocation: 'Raleigh, NC', distance: 130.2, duration: 110, vehicle: 'Ferrari F8 Tributo' }
      ]);
      
      setMaintenanceAlerts([
        { id: 1, vehicle: 'Ferrari F8 Tributo', serviceDue: 'Oil Change', dueDate: '2025-05-05', priority: 'medium', mileage: 3500 },
        { id: 2, vehicle: 'Porsche 911 GT3', serviceDue: 'Brake Fluid Flush', dueDate: '2025-05-10', priority: 'high', mileage: 5000 },
        { id: 3, vehicle: 'Lamborghini Huracán', serviceDue: 'Annual Service', dueDate: '2025-06-15', priority: 'low', mileage: 12000 }
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
            <WorldClock />
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
                    {event.type === 'drive' && <Map size={20} className="text-green-400" />}
                    {event.type === 'maintenance' && <Wrench size={20} className="text-orange-400" />}
                    {event.type === 'track' && <Gauge size={20} className="text-red-400" />}
                    {event.type === 'event' && <Calendar size={20} className="text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{event.title}</h3>
                    <p className="text-xs text-gray-400">{event.description}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-blue-400">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'maintenance':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Maintenance Alerts</h2>
              <Link to="/garage-vault" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View Service History <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {maintenanceAlerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 bg-gray-900 flex justify-between items-center
                  ${alert.priority === 'high' ? 'border-red-500' : 
                    alert.priority === 'medium' ? 'border-yellow-500' : 
                    'border-green-500'}`}
                >
                  <div>
                    <h3 className="text-white font-semibold">{alert.serviceDue}</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Car size={12} className="mr-1" />
                      <span className="mr-2">{alert.vehicle}</span>
                      <Calendar size={12} className="mr-1" />
                      <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold rounded-full px-2 py-1
                      ${alert.priority === 'high' ? 'bg-red-900/30 text-red-400' : 
                        alert.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 
                        'bg-green-900/30 text-green-400'}`}
                    >
                      {alert.priority === 'high' ? 'High Priority' : 
                        alert.priority === 'medium' ? 'Medium Priority' : 
                        'Low Priority'}
                    </span>
                    {alert.mileage && (
                      <p className="text-xs text-gray-400 mt-1">Mileage: {alert.mileage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'achievements':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Driver Achievements</h2>
              <div className="bg-gray-900 px-3 py-1 rounded-full text-sm">
                <span className="text-yellow-400 font-bold">{achievementPoints}</span>
                <span className="text-gray-400 ml-1">points</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Trophy size={24} className="text-white" />
                </div>
                <p className="text-white font-bold">Track Master</p>
                <p className="text-xs text-gray-400">5 track days completed</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Map size={24} className="text-white" />
                </div>
                <p className="text-white font-bold">Road Warrior</p>
                <p className="text-xs text-gray-400">1,000+ miles driven</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Wrench size={24} className="text-white" />
                </div>
                <p className="text-white font-bold">Mechanic</p>
                <p className="text-xs text-gray-400">10 maintenance tasks</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                  <Award size={24} className="text-white" />
                </div>
                <p className="text-white font-bold">Curve Master</p>
                <p className="text-xs text-gray-400">Mountain route expert</p>
              </div>
            </div>
            
            <div className="text-center mt-3">
              <Link to="#" className="text-blue-400 hover:text-blue-300 text-sm">
                View all achievements →
              </Link>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-10 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Logo and Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-4 mb-6 md:mb-0">
            <img 
              src="/assets/GTM Logo - Green-White.png" 
              alt="GoTime Motorsports" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-blue-400 font-orbitron text-3xl uppercase">Paddock20 Dashboard</h1>
              <p className="text-gray-400">Welcome back, <span className="text-white">{userName}</span></p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative bg-gray-900 hover:bg-gray-800 p-2 rounded-full transition-colors">
              <Bell size={20} className="text-gray-400" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setIsEditMode(!isEditMode)} 
              className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-blue-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-gray-400'}`}
            >
              <Settings size={20} />
            </button>
            
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Welcome Banner - Can be dismissed */}
        {showWelcomeMessage && (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/30 rounded-xl p-6 mb-8 relative">
            <button 
              onClick={() => setShowWelcomeMessage(false)} 
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <EyeOff size={18} />
            </button>
            
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-4 md:mb-0 md:mr-6">
                <h2 className="text-xl font-orbitron text-blue-400 mb-2">Welcome to Your Personalized Dashboard</h2>
                <p className="text-gray-300">
                  Track your vehicles, manage upcoming drives, get maintenance alerts, and more.
                  Customize this dashboard to show exactly what you want to see.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link to="/garage-vault" className="apex-button bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                    <Car size={16} />
                    <span>Explore Garage</span>
                  </Link>
                  <Link to="/route-planner" className="apex-button bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2">
                    <Map size={16} />
                    <span>Plan a Drive</span>
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-900/30 to-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-lg text-white">
                  <Shield className="text-green-400" />
                  <span>Driver Status: <span className="text-green-400 font-bold">Active</span></span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{driveStats.totalDrives}</div>
                    <div className="text-xs text-gray-400">Total Drives</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{driveStats.totalDistance}</div>
                    <div className="text-xs text-gray-400">Miles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dashboard Layout Edit Mode */}
        {isEditMode && (
          <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-blue-900/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-blue-400 font-orbitron">Customize Dashboard Layout</h2>
              <div>
                <button 
                  onClick={saveLayout} 
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Save Layout
                </button>
                <button 
                  onClick={() => setIsEditMode(false)} 
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {dashboardLayout.map((panel, index) => (
                <div key={index} className="flex items-center bg-black/50 p-3 rounded-lg">
                  <div className="mr-3 text-gray-500">
                    {index + 1}.
                  </div>
                  <div className="flex-1 capitalize text-white">
                    {panel} Panel
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
          <div key={index}>
            {renderDashboardPanel(panel)}
          </div>
        ))}
        
        {/* Quick Action Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
          <Link to="/route-planner" className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 p-4 rounded-lg text-center hover:from-blue-800/40 hover:to-blue-800/10 transition-all group">
            <Map size={24} className="mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white">Route Planner</span>
          </Link>
          <Link to="/drive-journal" className="bg-gradient-to-br from-green-900/40 to-green-900/10 p-4 rounded-lg text-center hover:from-green-800/40 hover:to-green-800/10 transition-all group">
            <FileText size={24} className="mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white">Drive Journal</span>
          </Link>
          <Link to="/garage-vault" className="bg-gradient-to-br from-purple-900/40 to-purple-900/10 p-4 rounded-lg text-center hover:from-purple-800/40 hover:to-purple-800/10 transition-all group">
            <Car size={24} className="mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white">Garage Vault</span>
          </Link>
          <Link to="/weather" className="bg-gradient-to-br from-cyan-900/40 to-cyan-900/10 p-4 rounded-lg text-center hover:from-cyan-800/40 hover:to-cyan-800/10 transition-all group">
            <Activity size={24} className="mx-auto mb-2 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white">Weather</span>
          </Link>
          <Link to="/broker-portal" className="bg-gradient-to-br from-amber-900/40 to-amber-900/10 p-4 rounded-lg text-center hover:from-amber-800/40 hover:to-amber-800/10 transition-all group">
            <HeartHandshake size={24} className="mx-auto mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white">Broker Portal</span>
          </Link>
          <Link to="/juicebox" className="bg-gradient-to-br from-rose-900/40 to-rose-900/10 p-4 rounded-lg text-center hover:from-rose-800/40 hover:to-rose-800/10 transition-all group">
            <Star size={24} className="mx-auto mb-2 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-white">Juice Box™</span>
          </Link>
        </div>
        
        {/* API Debugger Component - Developer Tool */}
        <div className="mt-8 mb-6">
          <APIDebugger />
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Paddock20 Portal © {new Date().getFullYear()} GoTime Motorsports</p>
          <p className="mt-1">Designed for true automotive enthusiasts</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
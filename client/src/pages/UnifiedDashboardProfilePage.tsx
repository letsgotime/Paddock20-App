import React, { useState, useEffect } from "react";
import { 
  User, 
  Car, 
  Calendar, 
  MapPin, 
  Settings, 
  Star, 
  Award,
  Clock,
  BarChart3,
  Camera,
  Flag,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  Edit,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  Menu,
  GaugeCircle,
  PanelTop,
  Home,
  Route,
  Calendar as CalendarIcon,
  Gauge,
  Timer,
  AlertCircle,
  Heart,
  Activity,
  FlameKindling,
  GanttChartSquare,
  BarChart,
  GitBranch
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useNavigate } from "react-router-dom";
import { useUserProfileStore } from "../services/userProfileService";
import { useVehicle } from "../contexts/VehicleContext";
import { useWeather } from "../contexts/ConsolidatedWeatherContext";
import VehicleSelector from "../components/VehicleSelector";
import { playMotorsportSound } from "../services/soundService";

const UnifiedDashboardProfilePage = () => {
  const { profile } = useUserProfileStore();
  const { vehicles, activeVehicle, setActiveVehicle } = useVehicle();
  const { weatherData, location } = useWeather();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    weather: true,
    vehicleDetails: true,
    stats: true
  });
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Helper for temperature display with color coding
  const renderTemperature = (temp: number) => {
    let color = 'text-blue-400'; // Default color

    if (temp >= 90) color = 'text-red-500';
    else if (temp >= 80) color = 'text-orange-400';
    else if (temp >= 70) color = 'text-yellow-300';
    else if (temp <= 32) color = 'text-blue-600';
    else if (temp <= 50) color = 'text-blue-400';

    return <span className={color}>{Math.round(temp)}°F</span>;
  };

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
    
    playMotorsportSound('toggle_switch');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#080808] to-[#121214] border-b border-blue-900/30 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-blue-400">PADDOCK20</h1>
              <span className="text-xs px-1.5 py-0.5 bg-[#08c519] text-black rounded font-bold">BETA</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-400 hover:text-white flex items-center">
                <Home className="h-5 w-5 mr-1" />
                <span className="text-sm hidden sm:inline">Home</span>
              </Link>
              <Link to="/settings" className="text-gray-400 hover:text-white">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <div className="pt-16 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Section - Left Column on large screens, top on mobile */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#111115] rounded-xl overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold flex items-center text-blue-400">
                <User className="h-4 w-4 mr-2" />
                Driver Profile
              </h2>
              <button 
                onClick={() => toggleSection('profile')} 
                className="text-gray-400 hover:text-white p-1"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.profile ? 'rotate-0' : '-rotate-90'
                  }`} 
                />
              </button>
            </div>
            
            {expandedSections.profile && (
              <>
                <div className="bg-gradient-to-r from-blue-900/30 to-black h-36 relative">
                  <div className="absolute -bottom-16 left-8 h-32 w-32 rounded-full bg-gray-800 border-4 border-[#0a0a0a] overflow-hidden">
                    {profile?.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt={profile?.displayName || "User"} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-900">
                        <User className="h-14 w-14 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="pt-16 pb-5 px-8">
                  <h2 className="text-2xl font-bold">{profile?.displayName || ""}</h2>
                  <p className="text-gray-400 flex items-center mt-1">
                    <MapPin className="h-4 w-4 inline mr-1.5" />
                    {profile?.location || ""}
                  </p>
                  <p className="text-gray-400 flex items-center mt-1">
                    <Calendar className="h-4 w-4 inline mr-1.5" />
                    Member since {profile?.memberSince ? formatDate(profile.memberSince) : ""}
                  </p>
                  
                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                      <Car className="h-4 w-4 text-blue-400 mr-1.5" />
                      <span className="text-sm">{vehicles.length || 0} Vehicles</span>
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                      <Clock className="h-4 w-4 text-blue-400 mr-1.5" />
                      <span className="text-sm">{profile?.statistics?.totalDrives || 0} Drives</span>
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                      <BarChart3 className="h-4 w-4 text-blue-400 mr-1.5" />
                      <span className="text-sm">{profile?.statistics?.totalMiles?.toLocaleString() || 0} Miles</span>
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                      <Award className="h-4 w-4 text-blue-400 mr-1.5" />
                      <span className="text-sm">{profile?.statistics?.achievements || 0} Achievements</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Statistics Card */}
          <div className="bg-[#111115] rounded-xl overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold flex items-center text-blue-400">
                <BarChart3 className="h-4 w-4 mr-2" />
                Driver Statistics
              </h2>
              <button 
                onClick={() => toggleSection('stats')} 
                className="text-gray-400 hover:text-white p-1"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.stats ? 'rotate-0' : '-rotate-90'
                  }`} 
                />
              </button>
            </div>
            
            {expandedSections.stats && (
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Drives</span>
                    <span>{profile?.statistics?.totalDrives || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Miles</span>
                    <span>{profile?.statistics?.totalMiles?.toLocaleString() || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. Drive Time</span>
                    <span>{profile?.statistics?.avgDriveTime || 0} min</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goals Completed</span>
                    <span>{profile?.statistics?.goalsCompleted || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Events Attended</span>
                    <span>{profile?.statistics?.eventsAttended || 0}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3 text-blue-300">Recent Achievements</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-yellow-500/20 rounded-full p-1.5 mr-3 mt-0.5">
                        <Award className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Mountain Master</p>
                        <p className="text-xs text-gray-400">Completed 5 drives in mountainous terrain</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-500/20 rounded-full p-1.5 mr-3 mt-0.5">
                        <Star className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Daily Driver</p>
                        <p className="text-xs text-gray-400">Logged in for 7 consecutive days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Dashboard Section - Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Vehicle Selector Section */}
          <div className="bg-[#111115] rounded-xl overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold flex items-center text-blue-400">
                <Car className="h-4 w-4 mr-2" />
                My Vehicles
              </h2>
              <div className="flex items-center space-x-2">
                <Link 
                  to="/add-vehicle" 
                  className="text-[#08c519] hover:text-green-400 p-1 flex items-center text-xs"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> 
                  <span className="hidden sm:inline">Add Vehicle</span>
                </Link>
                <button 
                  onClick={() => toggleSection('vehicleDetails')} 
                  className="text-gray-400 hover:text-white p-1"
                >
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.vehicleDetails ? 'rotate-0' : '-rotate-90'
                    }`} 
                  />
                </button>
              </div>
            </div>
            
            {expandedSections.vehicleDetails && (
              <div className="p-4">
                <VehicleSelector />
                
                {activeVehicle && (
                  <div className="mt-4 bg-black/30 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center mb-3">
                      <div className="h-16 w-16 bg-gray-800 rounded-md flex items-center justify-center mr-4 overflow-hidden">
                        {activeVehicle.vehicle_image ? (
                          <img 
                            src={activeVehicle.vehicle_image} 
                            alt={activeVehicle.make + ' ' + activeVehicle.model} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Car className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-lg">{activeVehicle.nickname || `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}</h3>
                        {activeVehicle.nickname && (
                          <p className="text-sm text-gray-400">{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30">
                        <p className="text-xs text-gray-400 mb-1">Current Mileage</p>
                        <p className="font-medium">{activeVehicle.mileage.toLocaleString()} miles</p>
                      </div>
                      
                      <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30">
                        <p className="text-xs text-gray-400 mb-1">Last Service</p>
                        <p className="font-medium">{activeVehicle.last_service || "N/A"}</p>
                      </div>
                      
                      <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30">
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <p className="font-medium">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Ready
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <Link 
                        to={`/vehicle/${activeVehicle.id}`} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      <Link 
                        to="/drive-journal/new" 
                        className="flex-1 bg-[#08c519] hover:bg-green-600 text-black text-center py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Log Drive
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Weather Card */}
          <div className="bg-[#111115] rounded-xl overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold flex items-center text-blue-400">
                <Cloud className="h-4 w-4 mr-2" />
                Current Weather
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-xs">{location?.name || "Current Location"}</span>
                <button 
                  onClick={() => toggleSection('weather')} 
                  className="text-gray-400 hover:text-white p-1"
                >
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.weather ? 'rotate-0' : '-rotate-90'
                    }`} 
                  />
                </button>
              </div>
            </div>
            
            {expandedSections.weather && weatherData && weatherData.weatherData && (
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {weatherData.weatherData.weather && weatherData.weatherData.weather[0] && weatherData.weatherData.weather[0].icon && (
                      <img 
                        src={`https://openweathermap.org/img/wn/${weatherData.weatherData.weather[0].icon}@2x.png`} 
                        alt={weatherData.weatherData.weather[0].description}
                        className="w-20 h-20 mr-2"
                      />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">{weatherData.weatherData.main ? renderTemperature(weatherData.weatherData.main.temp) : "N/A"}</h3>
                      <p className="text-gray-400 capitalize">{weatherData.weatherData.weather && weatherData.weatherData.weather[0] ? weatherData.weatherData.weather[0].description : "Weather data unavailable"}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-gray-400">Feels like: {weatherData.weatherData.main ? renderTemperature(weatherData.weatherData.main.feels_like) : "N/A"}</p>
                    <p className="text-gray-400">High: {weatherData.weatherData.main ? renderTemperature(weatherData.weatherData.main.temp_max) : "N/A"} • Low: {weatherData.weatherData.main ? renderTemperature(weatherData.weatherData.main.temp_min) : "N/A"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30 flex items-center">
                    <Wind className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">Wind</p>
                      <p className="font-medium">{weatherData.weatherData.wind ? Math.round(weatherData.weatherData.wind.speed) : "N/A"} mph</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30 flex items-center">
                    <Droplets className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">Humidity</p>
                      <p className="font-medium">{weatherData.weatherData.main ? weatherData.weatherData.main.humidity : "N/A"}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30 flex items-center">
                    <GaugeCircle className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">Pressure</p>
                      <p className="font-medium">{weatherData.weatherData.main ? weatherData.weatherData.main.pressure : "N/A"} hPa</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30 flex items-center">
                    <Sun className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">UV Index</p>
                      <p className="font-medium">{weatherData.automotiveWeatherData?.uvIndex || "N/A"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Automotive Impact Section */}
                {weatherData.automotiveWeatherData && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2 text-blue-300 border-b border-blue-900/30 pb-2">Automotive Impact</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-900/10 p-3 rounded-md border border-blue-900/20">
                        <h4 className="font-medium text-sm mb-1">Driving Conditions</h4>
                        <p className="text-xs text-gray-400">{weatherData.automotiveWeatherData.drivingConditionsAdvice || "Good driving conditions."}</p>
                      </div>
                      
                      <div className="bg-blue-900/10 p-3 rounded-md border border-blue-900/20">
                        <h4 className="font-medium text-sm mb-1">Vehicle Care</h4>
                        <p className="text-xs text-gray-400">{weatherData.automotiveWeatherData.vehicleCareAdvice || "No special care needed today."}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Weather Forecast Teaser */}
                <div className="mt-4">
                  <Link 
                    to="/weather-paddock" 
                    className="w-full bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded py-2 flex items-center justify-center text-sm text-blue-400 transition-colors"
                  >
                    View Detailed Forecast
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Recent Activity/Quick Links */}
          <div className="bg-[#111115] rounded-xl overflow-hidden border border-gray-800">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold text-blue-400">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
              <Link to="/drive-journal/new" className="bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded-lg p-4 text-center transition-colors group">
                <div className="w-10 h-10 mx-auto bg-blue-900/40 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-800/60 transition-colors">
                  <PanelTop className="h-5 w-5 text-blue-300" />
                </div>
                <span className="text-sm font-medium">Log Drive</span>
              </Link>
              
              <Link to="/weather-paddock" className="bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded-lg p-4 text-center transition-colors group">
                <div className="w-10 h-10 mx-auto bg-blue-900/40 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-800/60 transition-colors">
                  <Cloud className="h-5 w-5 text-blue-300" />
                </div>
                <span className="text-sm font-medium">Weather Report</span>
              </Link>
              
              <Link to="/route-planner" className="bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded-lg p-4 text-center transition-colors group">
                <div className="w-10 h-10 mx-auto bg-blue-900/40 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-800/60 transition-colors">
                  <MapPin className="h-5 w-5 text-blue-300" />
                </div>
                <span className="text-sm font-medium">Plan Route</span>
              </Link>
              
              <Link to="/garage-vault" className="bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded-lg p-4 text-center transition-colors group">
                <div className="w-10 h-10 mx-auto bg-blue-900/40 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-800/60 transition-colors">
                  <Car className="h-5 w-5 text-blue-300" />
                </div>
                <span className="text-sm font-medium">Garage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-black to-[#121212] border-t border-[#08c519]/30 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              <span className="text-[#08c519] font-medium mr-1">GOTIME</span>
              <span>MOTORSPORTS</span>
            </div>
            <div className="text-xs text-gray-400">
              © 2025 • Powered by Paddock20
            </div>
            {/* F1 Pro-Level Telemetry Dashboard - Lewis Hamilton Grade */}
            <div className="bg-[#0d0d0f] rounded-xl overflow-hidden border border-gray-800 mt-6">
              <div className="flex justify-between items-center px-4 py-3 border-b border-blue-900/50 bg-gradient-to-r from-black to-blue-950/30">
                <h2 className="font-semibold flex items-center text-blue-400">
                  <GaugeCircle className="h-4 w-4 mr-2" />
                  F1 Pro Telemetry Hub
                </h2>
                <div className="flex items-center">
                  <span className="text-[#08c519] text-xs font-bold tracking-wider mr-2">LIVE</span>
                  <div className="w-2 h-2 rounded-full bg-[#08c519] animate-pulse"></div>
                </div>
              </div>
              
              {/* F1-Style Telemetry Panels - Using OpenWeather API Data */}
              {weatherData && weatherData.weatherData && weatherData.weatherData.main && (
                <div className="p-3 bg-[#080808] bg-opacity-80 border-b border-blue-900/20">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-black/50 p-2 rounded border border-blue-900/40">
                      <div className="text-gray-500 mb-1">AMBIENT TEMP</div>
                      <div className="text-blue-400 font-bold">{Math.round(weatherData.weatherData.main.temp)}°F</div>
                    </div>
                    <div className="bg-black/50 p-2 rounded border border-blue-900/40">
                      <div className="text-gray-500 mb-1">WIND SPEED</div>
                      <div className="text-blue-400 font-bold">{weatherData.weatherData.wind ? Math.round(weatherData.weatherData.wind.speed) : "N/A"} MPH</div>
                    </div>
                    <div className="bg-black/50 p-2 rounded border border-blue-900/40">
                      <div className="text-gray-500 mb-1">HUMIDITY</div>
                      <div className="text-yellow-300 font-bold">{weatherData.weatherData.main.humidity}%</div>
                    </div>
                    <div className="bg-black/50 p-2 rounded border border-blue-900/40">
                      <div className="text-gray-500 mb-1">PRESSURE</div>
                      <div className="text-blue-400 font-bold">{weatherData.weatherData.main.pressure} hPa</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* World-Class Driver Hub Navigation - Integrating All App Features */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
                <h2 className="font-semibold flex items-center text-blue-400">
                  <GanttChartSquare className="h-4 w-4 mr-2" />
                  Paddock20 Command Center
                </h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Core Features Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-blue-300 mb-2">Drive Experience</h3>
                    
                    <Link
                      to="/weather-paddock"
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <Cloud className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Weather Paddock</h4>
                        <p className="text-xs text-gray-400">F1-style weather telemetry data</p>
                      </div>
                    </Link>
                    
                    <Link
                      to="/route-planner" 
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <Route className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Route Planner</h4>
                        <p className="text-xs text-gray-400">Plan optimal fun driving routes</p>
                      </div>
                    </Link>
                    
                    <Link
                      to="/drive-journal" 
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <CalendarIcon className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Drive Journal</h4>
                        <p className="text-xs text-gray-400">Track and log all your drives</p>
                      </div>
                    </Link>
                    
                    <Link
                      to="/gotime-garage" 
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <Car className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">GoTime Garage</h4>
                        <p className="text-xs text-gray-400">Your vehicle collection vault</p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Premium Features Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-blue-300 mb-2">Enthusiast Features</h3>
                    
                    <Link
                      to="/juicebox" 
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <Droplets className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">JuiceBox</h4>
                        <p className="text-xs text-gray-400">Detailing products and techniques</p>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 bg-[#08c519] text-black rounded font-bold">BETA</span>
                    </Link>
                    
                    <Link
                      to="/manifestation-station" 
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <GitBranch className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Manifestation Station</h4>
                        <p className="text-xs text-gray-400">Set and track your vision</p>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 bg-[#08c519] text-black rounded font-bold">BETA</span>
                    </Link>
                    
                    <Link
                      to="/motorsports-gallery" 
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <Camera className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Motorsports Gallery</h4>
                        <p className="text-xs text-gray-400">Your automotive media collection</p>
                      </div>
                    </Link>
                    
                    <Link
                      to="/membership" 
                      className="flex items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-md mr-3">
                        <Award className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">Paddock20 Membership</h4>
                        <p className="text-xs text-gray-400">Exclusive benefits and status</p>
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* F1 Pro Performance Metrics - Lewis Hamilton Grade Data */}
                <div className="mt-6 bg-black/30 rounded-lg border border-blue-900/30 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-blue-300">Performance Telemetry</h3>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-2">Data Driven</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#08c519] animate-pulse"></div>
                    </div>
                  </div>
                  
                  {activeVehicle ? (
                    <div className="space-y-3">
                      {/* Vehicle Performance Metrics - Only using real vehicle data */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {activeVehicle.top_speed && (
                          <div className="bg-black/50 p-2 rounded border border-blue-900/30">
                            <div className="text-gray-500 mb-1">TOP SPEED</div>
                            <div className="text-blue-400 font-mono font-medium">{activeVehicle.top_speed} <span className="text-[0.65rem] opacity-70">MPH</span></div>
                          </div>
                        )}
                        
                        {activeVehicle.acceleration && (
                          <div className="bg-black/50 p-2 rounded border border-blue-900/30">
                            <div className="text-gray-500 mb-1">0-60 TIME</div>
                            <div className="text-blue-400 font-mono font-medium">{activeVehicle.acceleration} <span className="text-[0.65rem] opacity-70">SEC</span></div>
                          </div>
                        )}
                        
                        {activeVehicle.horsepower && (
                          <div className="bg-black/50 p-2 rounded border border-blue-900/30">
                            <div className="text-gray-500 mb-1">HORSEPOWER</div>
                            <div className="text-blue-400 font-mono font-medium">{activeVehicle.horsepower} <span className="text-[0.65rem] opacity-70">HP</span></div>
                          </div>
                        )}
                        
                        {activeVehicle.torque && (
                          <div className="bg-black/50 p-2 rounded border border-blue-900/30">
                            <div className="text-gray-500 mb-1">TORQUE</div>
                            <div className="text-blue-400 font-mono font-medium">{activeVehicle.torque} <span className="text-[0.65rem] opacity-70">LB-FT</span></div>
                          </div>
                        )}
                        
                        {activeVehicle.mileage && (
                          <div className="bg-black/50 p-2 rounded border border-blue-900/30">
                            <div className="text-gray-500 mb-1">MILEAGE</div>
                            <div className="text-blue-400 font-mono font-medium">{activeVehicle.mileage.toLocaleString()} <span className="text-[0.65rem] opacity-70">MI</span></div>
                          </div>
                        )}
                        
                        {activeVehicle.fuel_type && (
                          <div className="bg-black/50 p-2 rounded border border-blue-900/30">
                            <div className="text-gray-500 mb-1">FUEL</div>
                            <div className="text-blue-400 font-mono font-medium">{activeVehicle.fuel_type}</div>
                          </div>
                        )}
                        
                        {activeVehicle.last_service && (
                          <div className="bg-black/50 p-2 rounded border border-blue-900/30">
                            <div className="text-gray-500 mb-1">LAST SERVICE</div>
                            <div className="text-blue-400 font-mono font-medium">{activeVehicle.last_service}</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Data-driven metrics section - only displays when maintenance data exists */}
                      {activeVehicle.maintenance_status && (
                        <div className="bg-black/40 p-3 rounded-lg border border-blue-900/40 mt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-medium text-blue-300">Vehicle Systems Status</h4>
                          </div>
                          
                          <div className="space-y-2">
                            {activeVehicle.maintenance_status.engine && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Engine Health</span>
                                  <span className={`${parseInt(activeVehicle.maintenance_status.engine) > 90 ? 'text-[#08c519]' : 'text-yellow-400'}`}>
                                    {activeVehicle.maintenance_status.engine}%
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-[#08c519] rounded-full" 
                                    style={{ width: `${activeVehicle.maintenance_status.engine}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {activeVehicle.maintenance_status.tires && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Tire Wear</span>
                                  <span className={`${parseInt(activeVehicle.maintenance_status.tires) > 80 ? 'text-[#08c519]' : 'text-yellow-400'}`}>
                                    {activeVehicle.maintenance_status.tires}%
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-yellow-400 rounded-full" 
                                    style={{ width: `${activeVehicle.maintenance_status.tires}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {activeVehicle.maintenance_status.brakes && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Brake Performance</span>
                                  <span className={`${parseInt(activeVehicle.maintenance_status.brakes) > 90 ? 'text-blue-400' : 'text-yellow-400'}`}>
                                    {activeVehicle.maintenance_status.brakes}%
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" 
                                    style={{ width: `${activeVehicle.maintenance_status.brakes}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {activeVehicle.maintenance_status.fluids && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400">Fluid Levels</span>
                                  <span className={`${parseInt(activeVehicle.maintenance_status.fluids) > 90 ? 'text-blue-400' : 'text-yellow-400'}`}>
                                    {activeVehicle.maintenance_status.fluids}%
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" 
                                    style={{ width: `${activeVehicle.maintenance_status.fluids}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Data Collection Prompt - Only show if vehicle doesn't have complete data */}
                      {(!activeVehicle.maintenance_status || !activeVehicle.horsepower) && (
                        <div className="p-3 rounded-lg border border-blue-900/30 bg-blue-950/20 mt-4">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-blue-300">Complete Vehicle Data</h4>
                              <p className="text-xs text-gray-400 mt-1">
                                Add more technical specifications to your vehicle profile to enable enhanced F1-style telemetry visualizations.
                              </p>
                              <Link 
                                to={`/vehicle/${activeVehicle.id}/edit`} 
                                className="inline-flex items-center text-xs text-[#08c519] hover:text-green-400 mt-2"
                                onClick={() => playMotorsportSound('menu_select')}
                              >
                                <PlusCircle className="h-3.5 w-3.5 mr-1" /> 
                                Add Vehicle Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-blue-900/30 bg-blue-950/20">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-300">Vehicle Data Required</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Please select or add a vehicle to view performance telemetry data.
                          </p>
                          <Link 
                            to="/add-vehicle" 
                            className="inline-flex items-center text-xs text-[#08c519] hover:text-green-400 mt-2"
                            onClick={() => playMotorsportSound('menu_select')}
                          >
                            <PlusCircle className="h-3.5 w-3.5 mr-1" /> 
                            Add Vehicle
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              
              {/* Driver Telemetry Quick Access */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-blue-300 mb-3">Driver Toolbox</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link 
                      to="/seasonal-checklist"
                      className="flex flex-col items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-full mb-2">
                        <Flag className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-xs text-center">Seasonal Checklist</span>
                    </Link>
                    
                    <Link 
                      to="/mood-energy-tracker"
                      className="flex flex-col items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-full mb-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-xs text-center">Mood Tracker</span>
                    </Link>
                    
                    <Link 
                      to="/gloss-reset"
                      className="flex flex-col items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-full mb-2">
                        <Gauge className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-xs text-center">Gloss Reset</span>
                    </Link>
                    
                    <Link 
                      to="/sound-library"
                      className="flex flex-col items-center p-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg border border-blue-900/40 transition-colors"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      <div className="h-8 w-8 flex items-center justify-center bg-blue-800/30 rounded-full mb-2">
                        <FlameKindling className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-xs text-center">Sound Library</span>
                    </Link>
                  </div>
                </div>
                
                {/* Events and Community */}
                <div className="mt-6 bg-gradient-to-r from-blue-900/20 to-transparent p-4 rounded-lg border border-blue-900/40">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-blue-300">Upcoming Events</h3>
                    <Link 
                      to="/events-page" 
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => playMotorsportSound('menu_select')}
                    >
                      View All
                    </Link>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-black/40 rounded">
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-blue-900/40 rounded mr-3">
                        <Timer className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium">Atlanta Cars & Coffee</h4>
                        <p className="text-xs text-gray-500">May 10, 2025 • Perimeter Mall</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-2 bg-black/40 rounded">
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-blue-900/40 rounded mr-3">
                        <Timer className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium">Road Atlanta Track Day</h4>
                        <p className="text-xs text-gray-500">May 25, 2025 • Braselton, GA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboardProfilePage;
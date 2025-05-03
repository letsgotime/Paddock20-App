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
import { Link, useNavigate } from "react-router-dom";
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
                  <h2 className="text-2xl font-bold">{profile?.displayName || "Gavin Brooks"}</h2>
                  <p className="text-gray-400 flex items-center mt-1">
                    <MapPin className="h-4 w-4 inline mr-1.5" />
                    {profile?.location || "Atlanta, GA"}
                  </p>
                  <p className="text-gray-400 flex items-center mt-1">
                    <Calendar className="h-4 w-4 inline mr-1.5" />
                    Member since {formatDate(profile?.memberSince || "2023-01-01")}
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
                <span className="text-gray-400 text-xs">{locationName || "Current Location"}</span>
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
            
            {expandedSections.weather && weatherData && (
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {weatherData.weatherData.weather[0].icon && (
                      <img 
                        src={`https://openweathermap.org/img/wn/${weatherData.weatherData.weather[0].icon}@2x.png`} 
                        alt={weatherData.weatherData.weather[0].description}
                        className="w-20 h-20 mr-2"
                      />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">{renderTemperature(weatherData.weatherData.main.temp)}</h3>
                      <p className="text-gray-400 capitalize">{weatherData.weatherData.weather[0].description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-gray-400">Feels like: {renderTemperature(weatherData.weatherData.main.feels_like)}</p>
                    <p className="text-gray-400">High: {renderTemperature(weatherData.weatherData.main.temp_max)} • Low: {renderTemperature(weatherData.weatherData.main.temp_min)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30 flex items-center">
                    <Wind className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">Wind</p>
                      <p className="font-medium">{Math.round(weatherData.weatherData.wind.speed)} mph</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30 flex items-center">
                    <Droplets className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">Humidity</p>
                      <p className="font-medium">{weatherData.weatherData.main.humidity}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 p-3 rounded-md border border-blue-900/30 flex items-center">
                    <GaugeCircle className="h-5 w-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">Pressure</p>
                      <p className="font-medium">{weatherData.weatherData.main.pressure} hPa</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboardProfilePage;
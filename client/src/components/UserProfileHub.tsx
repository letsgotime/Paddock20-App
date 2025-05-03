import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, UserPlus, Activity, Calendar, Clock, Gauge, Thermometer, 
  Settings, Shield, Map, Car, BarChart3, Award, ChevronDown, ChevronUp,
  Bell, Volume2, Sun, Moon, Eye, EyeOff, Zap, CloudRain, Wrench, RefreshCw,
  ArrowRight, ExternalLink, CheckCircle, AlertTriangle, Info, Layers, 
  FileText, Sliders, Heart, GitBranch, Wind, Droplets, AlertCircle
} from 'lucide-react';

// Import context hooks
import { AuthContext } from '../context/AuthContext';
import { useVehicle } from '../contexts/VehicleContext';
import { useWeather } from '../contexts/FixedWeatherContext';

// Import data aggregation service
import { 
  UserProfileData, 
  aggregateUserProfileData,
  updateUserPreferences 
} from '../services/userProfileService';

interface UserProfileHubProps {
  isExpanded?: boolean;
  onExpandToggle?: () => void;
  className?: string;
}

const UserProfileHub: React.FC<UserProfileHubProps> = ({ 
  isExpanded = true, 
  onExpandToggle,
  className = ''
}) => {
  // Access contexts
  const authContext = useContext(AuthContext);
  const { vehicles, activeVehicle, loading: vehicleLoading } = useVehicle();
  const { 
    weatherData, 
    automotiveWeatherData, 
    lastUpdated,
    isUsingFallbackData
  } = useWeather();

  // Define state for profile data
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('identity');
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    units: localStorage.getItem('paddock20_units') || 'imperial',
    theme: localStorage.getItem('paddock20_theme') || 'dark',
    notificationsEnabled: localStorage.getItem('paddock20_notifications') === 'true',
    soundEnabled: localStorage.getItem('paddock20_sound') === 'true',
  });

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Compile data from all sources
  useEffect(() => {
    if (vehicleLoading) return;

    // Aggregate data from all contexts
    const aggregatedData = aggregateUserProfileData(
      authContext?.user || null,
      activeVehicle,
      vehicles,
      automotiveWeatherData,
      lastUpdated ? new Date(lastUpdated) : null
    );
    
    setProfileData(aggregatedData);
    setLoading(false);
  }, [
    authContext?.user, 
    activeVehicle, 
    vehicles, 
    automotiveWeatherData, 
    lastUpdated, 
    vehicleLoading
  ]);

  // Handle preference changes
  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: value };
      
      // Update local storage
      updateUserPreferences({
        units: newPrefs.units as 'imperial' | 'metric',
        theme: newPrefs.theme as 'dark' | 'light' | 'auto',
        notificationsEnabled: newPrefs.notificationsEnabled,
        soundEnabled: newPrefs.soundEnabled
      });
      
      return newPrefs;
    });
  };

  // Format date in a readable way
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get severity color class
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-400';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'drive': return <Map className="h-4 w-4 text-green-400" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-blue-400" />;
      case 'weather': return <CloudRain className="h-4 w-4 text-blue-300" />;
      case 'modification': return <Sliders className="h-4 w-4 text-purple-400" />;
      case 'login': return <User className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  // If loading, show a loading state
  if (loading || !profileData) {
    return (
      <div className={`${className} bg-gradient-to-r from-gray-900 to-black border border-blue-900/30 rounded-xl p-4 flex flex-col justify-center items-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B9CD3]"></div>
        <p className="text-gray-400 mt-2">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className={`${className} apex-vault-module relative bg-gradient-to-r from-gray-900 to-black border border-blue-900/30 rounded-xl overflow-hidden user-profile-hub`}>
      {/* Carbon fiber pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('/assets/images/carbon-fiber-pattern.png')] bg-repeat pointer-events-none"></div>
      
      {/* Top header with expand/collapse control */}
      <div className="relative z-10 border-b border-blue-900/30 bg-black/70 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <h2 className="text-lg font-orbitron text-[#4B9CD3] uppercase tracking-wider">
            ApexVault <span className="text-sm bg-[#08c519]/20 text-[#08c519] px-1 py-0.5 rounded-sm ml-2">BETA</span>
          </h2>
        </div>
        
        {onExpandToggle && (
          <button 
            onClick={onExpandToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="relative z-10 p-4">
          {/* User Profile Section */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className="relative mr-4">
                {profileData.userInfo.profileImage ? (
                  <img 
                    src={profileData.userInfo.profileImage} 
                    alt={profileData.userInfo.fullName || profileData.userInfo.username} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center border-2 border-blue-500">
                    <span className="text-2xl font-bold text-white">
                      {profileData.userInfo.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-black"></div>
              </div>
              
              <div>
                <h3 className="text-white text-xl font-bold">
                  {profileData.userInfo.fullName || profileData.userInfo.username}
                </h3>
                <p className="text-[#4B9CD3] text-sm">
                  {profileData.userInfo.role === 'premium' ? 'Premium Member' : 'Member'}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Member since {new Date(profileData.userInfo.memberSince).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Collapsible Content Sections */}
          <div className="space-y-4">
            {/* Identity Section */}
            <div className="border border-blue-900/20 rounded-lg overflow-hidden">
              <button 
                className={`w-full p-3 text-left flex justify-between items-center ${expandedSection === 'identity' ? 'bg-blue-900/20' : 'bg-black/40'}`}
                onClick={() => toggleSection('identity')}
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 text-[#4B9CD3] mr-2" />
                  <span className="text-white font-medium">Driver Identity</span>
                </div>
                {expandedSection === 'identity' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'identity' && (
                <div className="p-3 bg-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Username</span>
                        <span className="text-white text-sm font-medium">{profileData.userInfo.username}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Email</span>
                        <span className="text-white text-sm font-medium">{profileData.userInfo.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Member Status</span>
                        <span className="text-sm font-medium">
                          {profileData.userInfo.role === 'premium' ? (
                            <span className="text-amber-400">Premium</span>
                          ) : (
                            <span className="text-green-400">Active</span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Account Level</span>
                        <span className="text-white text-sm font-medium">{profileData.achievements.level}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Experience Points</span>
                        <span className="text-white text-sm font-medium">{profileData.achievements.points}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Last Login</span>
                        <span className="text-white text-sm font-medium">{new Date(profileData.userInfo.lastLogin).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar to next level */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress to Level {profileData.achievements.level + 1}</span>
                      <span className="text-blue-400">{profileData.achievements.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400" 
                        style={{ width: `${profileData.achievements.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Profile badges */}
                  <div className="mt-4">
                    <div className="text-gray-400 text-sm mb-2">Badges & Achievements</div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.achievements.badges.map((badge, index) => (
                        <div key={index} className="bg-blue-900/20 text-blue-300 text-xs py-1 px-2 rounded-full border border-blue-900/30 flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Link 
                      to="/settings/profile" 
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                    >
                      <span>Edit Profile</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Vehicle Section */}
            <div className="border border-blue-900/20 rounded-lg overflow-hidden">
              <button 
                className={`w-full p-3 text-left flex justify-between items-center ${expandedSection === 'vehicle' ? 'bg-blue-900/20' : 'bg-black/40'}`}
                onClick={() => toggleSection('vehicle')}
              >
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-[#4B9CD3] mr-2" />
                  <span className="text-white font-medium">Vehicle Status</span>
                </div>
                {expandedSection === 'vehicle' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'vehicle' && (
                <div className="p-3 bg-black/20">
                  {profileData.vehicleData.activeVehicle ? (
                    <>
                      <div className="flex items-center mb-3">
                        {profileData.vehicleData.activeVehicle.vehicle_image ? (
                          <img 
                            src={profileData.vehicleData.activeVehicle.vehicle_image}
                            alt={profileData.vehicleData.activeVehicle.car_name}
                            className="w-20 h-14 object-cover rounded mr-3 border border-gray-800"
                          />
                        ) : (
                          <div className="w-20 h-14 bg-gray-900 rounded flex items-center justify-center mr-3 border border-gray-800">
                            <Car className="h-8 w-8 text-gray-700" />
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-white font-medium">
                            {profileData.vehicleData.activeVehicle.car_name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {profileData.vehicleData.activeVehicle.year} {profileData.vehicleData.activeVehicle.make} {profileData.vehicleData.activeVehicle.model}
                          </p>
                        </div>
                      </div>
                      
                      {/* Vehicle metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Mileage */}
                        <div className="bg-gray-900/50 rounded p-2">
                          <div className="text-xs text-gray-400 mb-1">Mileage</div>
                          <div className="text-white font-medium flex items-center">
                            <Gauge className="h-4 w-4 text-blue-400 mr-1" />
                            {profileData.vehicleData.activeVehicle.mileage.toLocaleString()} mi
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="bg-gray-900/50 rounded p-2">
                          <div className="text-xs text-gray-400 mb-1">Status</div>
                          <div className="text-white font-medium flex items-center">
                            {profileData.vehicleData.activeVehicle.status === 'Ready' ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                                Ready
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-yellow-400 mr-1" />
                                {profileData.vehicleData.activeVehicle.status}
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Last Service */}
                        <div className="bg-gray-900/50 rounded p-2">
                          <div className="text-xs text-gray-400 mb-1">Last Service</div>
                          <div className="text-white font-medium flex items-center">
                            <Calendar className="h-4 w-4 text-blue-400 mr-1" />
                            {profileData.vehicleData.activeVehicle.last_service ? 
                              new Date(profileData.vehicleData.activeVehicle.last_service).toLocaleDateString() : 
                              'Not recorded'}
                          </div>
                        </div>
                        
                        {/* Engine Type */}
                        <div className="bg-gray-900/50 rounded p-2">
                          <div className="text-xs text-gray-400 mb-1">Engine</div>
                          <div className="text-white font-medium flex items-center">
                            <Zap className="h-4 w-4 text-blue-400 mr-1" />
                            {profileData.vehicleData.activeVehicle.engine_type || 'Standard'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Vehicle alerts */}
                      {profileData.vehicleData.vehicleHealth.alerts.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-300 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                            Vehicle Alerts
                          </div>
                          <div className="space-y-2">
                            {profileData.vehicleData.vehicleHealth.alerts.map((alert, idx) => (
                              <div key={idx} className="bg-gray-900/30 rounded-sm p-2 border-l-2 border-yellow-500">
                                <div className={`text-sm ${getSeverityColor(alert.severity)}`}>
                                  {alert.message}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Link 
                          to="/garage-vault" 
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                        >
                          <span>Garage Vault</span>
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                        <Link 
                          to="/gotime-garage" 
                          className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center"
                        >
                          <span>GoTime Garage</span>
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Car className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 mb-2">No vehicle information available</p>
                      <Link 
                        to="/garage-vault" 
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                      >
                        <span>Add Vehicle</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Weather & Driving Section */}
            <div className="border border-blue-900/20 rounded-lg overflow-hidden">
              <button 
                className={`w-full p-3 text-left flex justify-between items-center ${expandedSection === 'weather' ? 'bg-blue-900/20' : 'bg-black/40'}`}
                onClick={() => toggleSection('weather')}
              >
                <div className="flex items-center">
                  <CloudRain className="h-5 w-5 text-[#4B9CD3] mr-2" />
                  <span className="text-white font-medium">Weather & Driving</span>
                </div>
                {expandedSection === 'weather' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'weather' && (
                <div className="p-3 bg-black/20">
                  {profileData.weatherData.currentConditions ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="text-lg font-medium text-white">Current Conditions</div>
                          {isUsingFallbackData ? (
                            <span className="ml-2 text-xs bg-yellow-900/30 text-yellow-400 py-0.5 px-1.5 rounded">CACHED</span>
                          ) : (
                            <span className="ml-2 text-xs bg-green-900/30 text-green-400 py-0.5 px-1.5 rounded">LIVE</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {lastUpdated ? `Updated: ${new Date(lastUpdated).toLocaleTimeString()}` : ''}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Temperature & Feels Like */}
                        <div className="bg-gray-900/40 rounded p-2">
                          <div className="flex justify-between">
                            <div>
                              <div className="text-xs text-gray-400">Temperature</div>
                              <div className="flex items-center">
                                <Thermometer className="h-4 w-4 text-red-400 mr-1" />
                                <span className="text-white font-medium">
                                  {Math.round(profileData.weatherData.currentConditions.conditions.air_temperature)}°
                                  {preferences.units === 'imperial' ? 'F' : 'C'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400">Feels Like</div>
                              <div className="text-white font-medium">
                                {Math.round(profileData.weatherData.currentConditions.conditions.feels_like)}°
                                {preferences.units === 'imperial' ? 'F' : 'C'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Humidity & Conditions */}
                        <div className="bg-gray-900/40 rounded p-2">
                          <div className="flex justify-between">
                            <div>
                              <div className="text-xs text-gray-400">Humidity</div>
                              <div className="flex items-center">
                                <Droplets className="h-4 w-4 text-blue-400 mr-1" />
                                <span className="text-white font-medium">
                                  {profileData.weatherData.currentConditions.conditions.humidity}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400">Conditions</div>
                              <div className="text-white font-medium capitalize">
                                {profileData.weatherData.currentConditions.conditions.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Driving Conditions */}
                      <div className="mt-4 mb-2">
                        <div className="text-sm text-gray-300 mb-2">Driving Conditions</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-900/30 p-2 rounded-sm">
                            <div className="text-xs text-gray-400 mb-1">Road</div>
                            <div className="text-white text-sm">
                              {profileData.weatherData.currentConditions.driving_conditions.road_condition}
                            </div>
                          </div>
                          
                          <div className="bg-gray-900/30 p-2 rounded-sm">
                            <div className="text-xs text-gray-400 mb-1">Visibility</div>
                            <div className="text-white text-sm">
                              {profileData.weatherData.currentConditions.driving_conditions.visibility}
                            </div>
                          </div>
                          
                          <div className="bg-gray-900/30 p-2 rounded-sm">
                            <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                            <div className="text-white text-sm capitalize">
                              {profileData.weatherData.currentConditions.driving_conditions.risk_level}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 mb-4">
                      <CloudRain className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No weather data available</p>
                    </div>
                  )}
                  
                  {/* Recent Driving Stats */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-300 mb-2 flex items-center">
                      <Activity className="h-4 w-4 text-blue-400 mr-1" />
                      Driving Statistics
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900/30 p-2 rounded-sm">
                        <div className="text-xs text-gray-400 mb-1">Total Mileage</div>
                        <div className="text-white text-sm font-medium">
                          {profileData.drivingData.totalMiles.toLocaleString()} mi
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/30 p-2 rounded-sm">
                        <div className="text-xs text-gray-400 mb-1">Year To Date</div>
                        <div className="text-white text-sm font-medium">
                          {profileData.drivingData.yearToDateMiles.toLocaleString()} mi
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/30 p-2 rounded-sm col-span-2">
                        <div className="text-xs text-gray-400 mb-1">Last Drive</div>
                        <div className="text-white text-sm font-medium flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                          {profileData.drivingData.lastDrive ? 
                            new Date(profileData.drivingData.lastDrive.date).toLocaleDateString() :
                            'No recent drives'}
                          
                          {profileData.drivingData.lastDrive && (
                            <span className="ml-2 text-gray-400">
                              ({profileData.drivingData.lastDrive.distanceMiles} mi, 
                              {profileData.drivingData.lastDrive.durationMinutes} min)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Link 
                      to="/weather-paddock" 
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                    >
                      <span>Weather Paddock</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                    <Link 
                      to="/drive-journal" 
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                    >
                      <span>Drive Journal</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Activity & Timeline Section */}
            <div className="border border-blue-900/20 rounded-lg overflow-hidden">
              <button 
                className={`w-full p-3 text-left flex justify-between items-center ${expandedSection === 'activity' ? 'bg-blue-900/20' : 'bg-black/40'}`}
                onClick={() => toggleSection('activity')}
              >
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-[#4B9CD3] mr-2" />
                  <span className="text-white font-medium">Recent Activity</span>
                </div>
                {expandedSection === 'activity' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'activity' && (
                <div className="p-3 bg-black/20">
                  <div className="timeline relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-0 before:w-px before:bg-blue-900/30">
                    {profileData.activityTimeline.map((activity, idx) => (
                      <div key={idx} className="relative mb-3 pl-4 ml-1 last:mb-0">
                        <div className="absolute left-[-13px] top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                        <div className="flex items-start">
                          <div className="text-xs text-gray-400">
                            {formatDate(activity.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center mt-0.5">
                          {getActivityIcon(activity.type)}
                          <span className="text-sm text-white ml-1">{activity.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <Link 
                      to="/activity" 
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                    >
                      <span>View Full Activity History</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Preferences Section */}
            <div className="border border-blue-900/20 rounded-lg overflow-hidden">
              <button 
                className={`w-full p-3 text-left flex justify-between items-center ${expandedSection === 'preferences' ? 'bg-blue-900/20' : 'bg-black/40'}`}
                onClick={() => toggleSection('preferences')}
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-[#4B9CD3] mr-2" />
                  <span className="text-white font-medium">Preferences</span>
                </div>
                {expandedSection === 'preferences' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSection === 'preferences' && (
                <div className="p-3 bg-black/20">
                  <div className="space-y-4">
                    {/* Units Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Gauge className="h-5 w-5 text-blue-400 mr-2" />
                        <span className="text-white">Units</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`px-2 py-1 text-xs rounded ${preferences.units === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                          onClick={() => handlePreferenceChange('units', 'imperial')}
                        >
                          Imperial
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${preferences.units === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                          onClick={() => handlePreferenceChange('units', 'metric')}
                        >
                          Metric
                        </button>
                      </div>
                    </div>
                    
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {preferences.theme === 'dark' ? (
                            <Moon className="h-5 w-5 text-blue-400 mr-2" />
                          ) : (
                            <Sun className="h-5 w-5 text-blue-400 mr-2" />
                          )}
                          <span className="text-white">Theme</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`px-2 py-1 text-xs rounded ${preferences.theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                          onClick={() => handlePreferenceChange('theme', 'dark')}
                        >
                          <Moon className="h-3 w-3" />
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${preferences.theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                          onClick={() => handlePreferenceChange('theme', 'light')}
                        >
                          <Sun className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-blue-400 mr-2" />
                        <span className="text-white">Notifications</span>
                      </div>
                      <div>
                        <button 
                          className={`w-12 h-6 rounded-full relative focus:outline-none ${preferences.notificationsEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                          onClick={() => handlePreferenceChange('notificationsEnabled', !preferences.notificationsEnabled)}
                        >
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ${preferences.notificationsEnabled ? 'transform translate-x-6' : ''}`}></div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Volume2 className="h-5 w-5 text-blue-400 mr-2" />
                        <span className="text-white">Sound</span>
                      </div>
                      <div>
                        <button 
                          className={`w-12 h-6 rounded-full relative focus:outline-none ${preferences.soundEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                          onClick={() => handlePreferenceChange('soundEnabled', !preferences.soundEnabled)}
                        >
                          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ${preferences.soundEnabled ? 'transform translate-x-6' : ''}`}></div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Privacy Settings */}
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-blue-400 mr-2" />
                        <span className="text-white">Privacy Settings</span>
                      </div>
                      <div className="ml-7 pt-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Share Location</span>
                          <button 
                            className={`flex items-center text-xs rounded-full px-2 py-0.5 ${profileData.preferences.privacySettings.shareLocation ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                          >
                            {profileData.preferences.privacySettings.shareLocation ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Enabled
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Disabled
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Share Driving Data</span>
                          <button 
                            className={`flex items-center text-xs rounded-full px-2 py-0.5 ${profileData.preferences.privacySettings.shareDrivingData ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                          >
                            {profileData.preferences.privacySettings.shareDrivingData ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Enabled
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Disabled
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Link 
                      to="/settings" 
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                    >
                      <span>Advanced Settings</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Custom Footer with Data Summary */}
          <div className="mt-6 pt-4 border-t border-blue-900/20">
            <div className="flex flex-wrap gap-3 items-center justify-center">
              <div className="flex items-center text-xs text-gray-400">
                <Car className="h-3 w-3 mr-1" />
                {profileData.vehicleData.totalVehicles} Vehicles
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Map className="h-3 w-3 mr-1" />
                {profileData.drivingData.totalMiles.toLocaleString()} Total Miles
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Award className="h-3 w-3 mr-1" />
                Level {profileData.achievements.level}
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <CloudRain className="h-3 w-3 mr-1" />
                {profileData.weatherData.currentConditions ? 
                  `${Math.round(profileData.weatherData.currentConditions.conditions.air_temperature)}°` : 
                  'Weather N/A'}
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              Paddock20 User Profile Hub &copy; {new Date().getFullYear()} GoTime Motorsports
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileHub;
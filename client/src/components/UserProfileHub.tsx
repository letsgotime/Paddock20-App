import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Shield, Award, Car, Calendar, Droplets, Map, Camera, Sliders, 
  ChevronDown, ChevronUp, ChevronRight, ExternalLink, Clock, Gauge, Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useUserProfileStore } from '../services/userProfileService';
import { useVehicle } from '../contexts/VehicleContext';
import ProfileDataCollector from '../services/ProfileDataCollector';
import DataSourceConnector from '../services/DataSourceConnector';

const UserProfileHub: React.FC = () => {
  // Get profile data from the store
  const { profile, loadDemoProfile, resetProfile } = useUserProfileStore();
  const { activeVehicle } = useVehicle();
  
  // UI state for expandable sections
  const [activeSection, setActiveSection] = useState<string | null>('summary');
  const [showMembershipInfo, setShowMembershipInfo] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Logic to handle profile initialization or reset
  useEffect(() => {
    // If we don't have a profile yet, load the base profile
    if (!profile && !initialLoadComplete) {
      console.log("No profile found, checking for user data");
      
      // Get user data from authentication if available
      try {
        // Check localStorage for onboarding data
        const onboardingData = localStorage.getItem('userOnboardingData');
        if (onboardingData) {
          console.log("Found user onboarding data, using that instead of demo profile");
          const userData = JSON.parse(onboardingData);
          
          // Update the profile with user's real information
          // Use userData directly for user-specific fields
          const realUserProfile = {
            // Start with basic required structure
            id: '1', 
            username: userData.username || 'driver',
            displayName: userData.displayName || userData.username || 'Driver',
            memberSince: new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString(),
            
            // Preserve user-specific data from onboarding
            bio: userData.bio || 'Passionate driver with a love for cars and the open road.',
            location: userData.location || 'Atlanta, GA',
            membershipLevel: userData.membershipLevel || 'free',
            avatar: userData.avatar || '/assets/images/default-avatar.png',
            
            // Initialize empty collections that will be populated later
            vehicles: [], 
            statistics: {
              totalDrives: 0,
              totalMiles: 0,
              avgDriveTime: 0,
              favoriteRoads: [],
              achievements: 0,
              goalsCompleted: 0,
              eventsAttended: 0
            },
            drives: [],
            goals: [],
            events: [],
            gallery: [],
            
            // Use user preferences if available or set defaults
            preferences: userData.preferences || {
              theme: 'dark',
              notifications: true,
              timeFormat: '24h',
              dateFormat: 'mdy',
              soundEnabled: true
            },
            
            // Use weather preferences if available or set defaults
            weatherPreferences: userData.weatherPreferences || {
              defaultLocation: {
                lat: 33.7490,
                lon: -84.3880,
                name: 'Atlanta, GA'
              },
              units: 'imperial',
              savedLocations: []
            }
          };
          
          // Reset and then set the profile to use the real user data
          resetProfile();
          useUserProfileStore.getState().setProfile(realUserProfile);
        } else {
          console.log("No user onboarding data found, loading demo profile as fallback");
          loadDemoProfile(); // Load base profile structure as fallback
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        loadDemoProfile(); // Fallback to demo profile on error
      }
      
      setInitialLoadComplete(true);
    }
    
    // Log page view via console
    console.log('User visited: UserProfileHub');
  }, [profile, loadDemoProfile, resetProfile, initialLoadComplete]);
  
  // Sync active vehicle with profile when it changes
  useEffect(() => {
    if (activeVehicle && profile) {
      console.log("Syncing active vehicle with profile:", activeVehicle.make, activeVehicle.model);
      ProfileDataCollector.syncVehicleFromContext(activeVehicle);
    }
  }, [activeVehicle, profile]);
  
  // Toggle section visibility
  const toggleSection = (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };
  
  if (!profile) {
    return (
      <div className="bg-black border border-blue-900/30 rounded-xl overflow-hidden shadow-lg p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-blue-900/30 h-20 w-20 mb-4"></div>
          <div className="h-4 bg-blue-900/30 rounded-sm w-48 mb-3"></div>
          <div className="h-3 bg-blue-900/20 rounded-sm w-32 mb-6"></div>
          <div className="space-y-3 w-full max-w-md">
            <div className="h-4 bg-blue-900/20 rounded-sm w-full"></div>
            <div className="h-4 bg-blue-900/20 rounded-sm w-full"></div>
            <div className="h-4 bg-blue-900/20 rounded-sm w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Calculate days since member joined
  const calculateDaysSinceMember = () => {
    const memberSinceDate = new Date(profile.memberSince);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - memberSinceDate.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24));
  };
  
  return (
    <div className="bg-black border border-blue-900/30 rounded-xl overflow-hidden shadow-lg relative">
      {/* Carbon fiber pattern overlay for F1 style */}
      <div className="absolute inset-0 opacity-5 bg-[url('/assets/images/carbon-fiber-pattern.png')] bg-repeat pointer-events-none"></div>
      
      {/* Header Bar with F1 Telemetry Design */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-blue-900/40 p-3 flex justify-between items-center relative z-10">
        <div className="flex items-center">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse mr-2"></div>
          <h3 className="text-[#4B9CD3] font-orbitron text-lg tracking-wide flex items-center">
            <User className="h-4 w-4 mr-2" />
            DRIVER PROFILE
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              // Reset the profile then reload with current vehicle data
              resetProfile();
              setTimeout(() => {
                loadDemoProfile();
                if (activeVehicle) {
                  ProfileDataCollector.syncVehicleFromContext(activeVehicle);
                }
              }, 100);
              
              toast({
                title: "Profile Reset",
                description: "Your profile has been reset with current vehicle data",
                variant: "default"
              });
            }}
            className="bg-green-700 hover:bg-green-600 px-2 py-0.5 rounded-sm text-xs border border-green-600 text-white flex items-center mr-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Data
          </button>
          
          <span className="text-xs text-gray-400 font-mono uppercase">APEX VAULT</span>
          {profile.membershipLevel !== 'free' && (
            <div className="relative">
              <button 
                onClick={() => setShowMembershipInfo(!showMembershipInfo)}
                className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 px-2 py-0.5 rounded-sm text-xs border border-blue-700/30 text-blue-300 flex items-center"
              >
                <Shield className="h-3 w-3 mr-1" />
                {profile.membershipLevel.toUpperCase()}
                {showMembershipInfo ? 
                  <ChevronUp className="h-3 w-3 ml-1" /> : 
                  <ChevronDown className="h-3 w-3 ml-1" />
                }
              </button>
              
              {showMembershipInfo && (
                <div className="absolute right-0 mt-1 bg-black border border-blue-900/40 rounded-md shadow-lg z-50 w-64 p-3">
                  <div className="text-blue-400 text-xs font-semibold mb-1">
                    {profile.membershipLevel.toUpperCase()} MEMBERSHIP
                  </div>
                  <div className="text-white text-xs mb-2">
                    Advanced telemetry, priority track access, and exclusive events.
                  </div>
                  <div className="bg-blue-900/20 p-2 rounded-sm">
                    <div className="text-gray-300 text-xs flex justify-between mb-1">
                      <span>Member since:</span>
                      <span className="text-blue-300">{formatDate(profile.memberSince)}</span>
                    </div>
                    <div className="text-gray-300 text-xs flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main profile content */}
      <div className="p-4 bg-gradient-to-b from-black to-gray-900/90 relative z-10">
        {/* Profile header with avatar, name and basic info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          {/* Profile avatar */}
          <div className="relative">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <img 
                src={profile.avatar || '/assets/images/default-avatar.png'} 
                alt={profile.displayName || profile.username} 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-900/80 rounded-full h-7 w-7 flex items-center justify-center border border-blue-600">
              <Camera className="h-3.5 w-3.5 text-blue-200" />
            </div>
          </div>
          
          {/* User details */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-white text-2xl font-bold mb-1">
              {profile.displayName || profile.username}
            </h1>
            <div className="text-blue-400 text-sm mb-2 flex items-center justify-center sm:justify-start">
              <User className="h-3.5 w-3.5 mr-1" />
              @{profile.username}
            </div>
            
            {profile.bio && (
              <p className="text-gray-300 text-sm mb-3 max-w-lg">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
              {profile.location && (
                <div className="bg-blue-900/20 px-2 py-1 rounded-sm text-blue-300 flex items-center border border-blue-900/30">
                  <Map className="h-3 w-3 mr-1" />
                  {profile.location}
                </div>
              )}
              
              <div className="bg-blue-900/20 px-2 py-1 rounded-sm text-blue-300 flex items-center border border-blue-900/30">
                <Calendar className="h-3 w-3 mr-1" />
                Member for {calculateDaysSinceMember()} days
              </div>
              
              <div className="bg-blue-900/20 px-2 py-1 rounded-sm text-blue-300 flex items-center border border-blue-900/30">
                <Car className="h-3 w-3 mr-1" />
                {profile.vehicles.length} {profile.vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
              </div>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="hidden md:flex flex-col gap-2">
            <div className="bg-blue-900/20 p-2 rounded-md border border-blue-900/30 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-800/30 flex items-center justify-center border border-blue-700/30">
                <Map className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-gray-400 text-xs">Total Drives</div>
                <div className="text-white text-xl font-mono font-bold">{profile.statistics.totalDrives}</div>
              </div>
            </div>
            
            <div className="bg-blue-900/20 p-2 rounded-md border border-blue-900/30 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-800/30 flex items-center justify-center border border-blue-700/30">
                <Award className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-gray-400 text-xs">Achievements</div>
                <div className="text-white text-xl font-mono font-bold">{profile.statistics.achievements}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Driver Telemetry Dashboard */}
        <div className="mb-6">
          <div 
            className="mb-2 border border-blue-900/30 bg-blue-900/10 rounded-md p-3 cursor-pointer hover:bg-blue-900/20 transition-colors"
            onClick={() => toggleSection('summary')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Gauge className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-blue-300 font-medium">Driver Telemetry</h3>
              </div>
              <div className="h-6 w-6 rounded flex items-center justify-center bg-black/40 border border-blue-900/30">
                {activeSection === 'summary' ? 
                  <ChevronUp className="h-4 w-4 text-blue-400" /> : 
                  <ChevronDown className="h-4 w-4 text-blue-400" />
                }
              </div>
            </div>
          </div>
          
          {activeSection === 'summary' && (
            <div className="bg-black/30 border border-blue-900/20 rounded-md p-4 space-y-4">
              {/* F1-style telemetry stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Total Miles</div>
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics.totalMiles.toLocaleString()}</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (profile.statistics.totalMiles/10000)*100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Avg Drive Time</div>
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics.avgDriveTime} min</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (profile.statistics.avgDriveTime/120)*100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Goals Completed</div>
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics.goalsCompleted}</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (profile.statistics.goalsCompleted/10)*100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Events Attended</div>
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics.eventsAttended}</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (profile.statistics.eventsAttended/10)*100)}%` }}></div>
                  </div>
                </div>
              </div>
              
              {/* Last activity timeline */}
              <div className="border-t border-blue-900/20 pt-4">
                <h4 className="text-sm text-blue-400 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Recent Activity
                </h4>
                
                <div className="space-y-2">
                  {/* Last activities would come from a real data source - using sample for now */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-900/40">
                      <Map className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm">Completed a drive on Blue Ridge Parkway</div>
                      <div className="text-gray-400 text-xs">Yesterday at 4:23 PM • 127 miles</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0 border border-green-900/40">
                      <Award className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm">Completed goal: Install upgraded suspension package</div>
                      <div className="text-gray-400 text-xs">3 days ago • Vehicle modification</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-900/40">
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm">Registered for Cars & Coffee event</div>
                      <div className="text-gray-400 text-xs">1 week ago • Atlanta Motorsports Park</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Vehicles Section */}
        <div className="mb-6">
          <div 
            className="mb-2 border border-blue-900/30 bg-blue-900/10 rounded-md p-3 cursor-pointer hover:bg-blue-900/20 transition-colors"
            onClick={() => toggleSection('vehicles')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Car className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-blue-300 font-medium">Your Vehicles</h3>
              </div>
              <div className="h-6 w-6 rounded flex items-center justify-center bg-black/40 border border-blue-900/30">
                {activeSection === 'vehicles' ? 
                  <ChevronUp className="h-4 w-4 text-blue-400" /> : 
                  <ChevronDown className="h-4 w-4 text-blue-400" />
                }
              </div>
            </div>
          </div>
          
          {activeSection === 'vehicles' && (
            <div className="space-y-4">
              {profile.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-black/30 border border-blue-900/20 rounded-md overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Vehicle image */}
                    <div className="sm:w-1/3 h-48 sm:h-auto relative">
                      <img 
                        src={vehicle.image || '/assets/images/default-car.png'} 
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-white font-medium">{vehicle.nickname}</div>
                        <div className="text-gray-300 text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                      </div>
                    </div>
                    
                    {/* Vehicle details */}
                    <div className="p-4 sm:w-2/3">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Color</div>
                          <div className="text-white">{vehicle.color || 'Not specified'}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-xs mb-1">VIN</div>
                          <div className="text-white">{vehicle.vin || 'Not specified'}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Modifications</div>
                          <div className="text-white">{vehicle.mods?.length || 0} installed</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Maintenance Records</div>
                          <div className="text-white">{vehicle.maintenanceRecords?.length || 0} records</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link to={`/vehicle/${vehicle.id}`} className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-md text-sm border border-blue-900/50 hover:bg-blue-900/50 transition-colors flex items-center">
                          <Sliders className="h-4 w-4 mr-1.5" />
                          Manage Vehicle
                        </Link>
                        
                        <Link to="/add-vehicle" className="bg-green-900/30 text-green-300 px-3 py-1.5 rounded-md text-sm border border-green-900/50 hover:bg-green-900/50 transition-colors flex items-center">
                          <Zap className="h-4 w-4 mr-1.5" />
                          Garage
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {profile.vehicles.length === 0 && (
                <div className="bg-black/30 border border-blue-900/20 rounded-md p-6 text-center">
                  <Car className="h-12 w-12 text-blue-900/60 mx-auto mb-3" />
                  <h4 className="text-white text-lg mb-2">No vehicles added yet</h4>
                  <p className="text-gray-400 text-sm mb-4">Add your first vehicle to unlock personalized insights and track maintenance.</p>
                  <Link to="/add-vehicle" className="bg-blue-900/40 hover:bg-blue-900/60 transition-colors text-blue-300 px-4 py-2 rounded-md text-sm inline-flex items-center border border-blue-900/50">
                    <Car className="h-4 w-4 mr-1.5" />
                    Add Vehicle
                  </Link>
                </div>
              )}
              
              {profile.vehicles.length > 0 && (
                <div className="text-center">
                  <Link to="/add-vehicle" className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-md text-sm inline-flex items-center border border-blue-900/50 hover:bg-blue-900/50 transition-colors">
                    <Car className="h-4 w-4 mr-1.5" />
                    Add Another Vehicle
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Drive History Section */}
        <div className="mb-6">
          <div 
            className="mb-2 border border-blue-900/30 bg-blue-900/10 rounded-md p-3 cursor-pointer hover:bg-blue-900/20 transition-colors"
            onClick={() => toggleSection('drives')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Map className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-blue-300 font-medium">Drive History</h3>
              </div>
              <div className="h-6 w-6 rounded flex items-center justify-center bg-black/40 border border-blue-900/30">
                {activeSection === 'drives' ? 
                  <ChevronUp className="h-4 w-4 text-blue-400" /> : 
                  <ChevronDown className="h-4 w-4 text-blue-400" />
                }
              </div>
            </div>
          </div>
          
          {activeSection === 'drives' && (
            <div className="space-y-4">
              <div className="bg-black/30 border border-blue-900/20 rounded-md p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-blue-900/30">
                        <th className="text-left text-blue-400 text-xs uppercase tracking-wider pb-3">Date</th>
                        <th className="text-left text-blue-400 text-xs uppercase tracking-wider pb-3">Route</th>
                        <th className="text-left text-blue-400 text-xs uppercase tracking-wider pb-3">Distance</th>
                        <th className="text-left text-blue-400 text-xs uppercase tracking-wider pb-3">Duration</th>
                        <th className="text-left text-blue-400 text-xs uppercase tracking-wider pb-3">Weather</th>
                        <th className="text-left text-blue-400 text-xs uppercase tracking-wider pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/20">
                      {profile.drives.map((drive) => (
                        <tr key={drive.id} className="hover:bg-blue-900/10 transition-colors">
                          <td className="py-3 text-white">{formatDate(drive.date)}</td>
                          <td className="py-3 text-white">{drive.route || 'Not specified'}</td>
                          <td className="py-3 text-white">{drive.distance ? `${drive.distance} miles` : '-'}</td>
                          <td className="py-3 text-white">{drive.duration ? `${drive.duration} mins` : '-'}</td>
                          <td className="py-3 text-white">
                            <div className="flex items-center">
                              {drive.weather === 'Sunny' && <Droplets className="h-4 w-4 text-blue-400 mr-1" />}
                              {drive.weather || '-'}
                            </div>
                          </td>
                          <td className="py-3 flex space-x-2">
                            <Link to={`/drive/${drive.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {profile.drives.length === 0 && (
                  <div className="text-center py-12">
                    <Map className="h-12 w-12 text-blue-900/60 mx-auto mb-3" />
                    <h4 className="text-white text-lg mb-2">No drives recorded yet</h4>
                    <p className="text-gray-400 text-sm mb-4">Record your drives to track your progress and build your driver profile.</p>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <Link to="/drive-logger" className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-md text-sm inline-flex items-center border border-blue-900/50 hover:bg-blue-900/50 transition-colors">
                  <Map className="h-4 w-4 mr-1.5" />
                  Log New Drive
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Goals Section */}
        <div className="mb-6">
          <div 
            className="mb-2 border border-blue-900/30 bg-blue-900/10 rounded-md p-3 cursor-pointer hover:bg-blue-900/20 transition-colors"
            onClick={() => toggleSection('goals')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Award className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-blue-300 font-medium">Your Goals</h3>
              </div>
              <div className="h-6 w-6 rounded flex items-center justify-center bg-black/40 border border-blue-900/30">
                {activeSection === 'goals' ? 
                  <ChevronUp className="h-4 w-4 text-blue-400" /> : 
                  <ChevronDown className="h-4 w-4 text-blue-400" />
                }
              </div>
            </div>
          </div>
          
          {activeSection === 'goals' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.goals.map((goal) => {
                  // Determine status color
                  let statusColor = 'bg-blue-500';
                  let statusTextColor = 'text-blue-400';
                  let statusBg = 'bg-blue-900/20';
                  let statusBorder = 'border-blue-900/30';
                  
                  if (goal.status === 'completed') {
                    statusColor = 'bg-green-500';
                    statusTextColor = 'text-green-400';
                    statusBg = 'bg-green-900/20';
                    statusBorder = 'border-green-900/30';
                  } else if (goal.status === 'failed') {
                    statusColor = 'bg-red-500';
                    statusTextColor = 'text-red-400';
                    statusBg = 'bg-red-900/20';
                    statusBorder = 'border-red-900/30';
                  }
                  
                  // Determine type icon
                  let TypeIcon = Award;
                  if (goal.type === 'vehicle') {
                    TypeIcon = Car;
                  }
                  
                  return (
                    <div 
                      key={goal.id} 
                      className={`border ${statusBorder} ${statusBg} rounded-md p-4 relative overflow-hidden`}
                    >
                      {/* Status indicator line */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${statusColor}`}></div>
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full ${statusBg} border ${statusBorder} flex items-center justify-center mr-3`}>
                            <TypeIcon className={`h-4 w-4 ${statusTextColor}`} />
                          </div>
                          <div className="text-xs uppercase tracking-wider text-gray-400">{goal.type}</div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-sm text-xs uppercase ${statusTextColor} border ${statusBorder} ${statusBg}`}>
                          {goal.status}
                        </div>
                      </div>
                      
                      <p className="text-white mb-3">{goal.description}</p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <div>Created: {formatDate(goal.createdAt)}</div>
                        <div>Target: {formatDate(goal.targetDate)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {profile.goals.length === 0 && (
                <div className="bg-black/30 border border-blue-900/20 rounded-md p-6 text-center">
                  <Award className="h-12 w-12 text-blue-900/60 mx-auto mb-3" />
                  <h4 className="text-white text-lg mb-2">No goals set yet</h4>
                  <p className="text-gray-400 text-sm mb-4">Set goals to track your progress and achieve your automotive dreams.</p>
                </div>
              )}
              
              <div className="text-center">
                <Link to="/goals" className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-md text-sm inline-flex items-center border border-blue-900/50 hover:bg-blue-900/50 transition-colors">
                  <Award className="h-4 w-4 mr-1.5" />
                  Set New Goal
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Gallery Section */}
        <div className="mb-6">
          <div 
            className="mb-2 border border-blue-900/30 bg-blue-900/10 rounded-md p-3 cursor-pointer hover:bg-blue-900/20 transition-colors"
            onClick={() => toggleSection('gallery')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Camera className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-blue-300 font-medium">Gallery</h3>
              </div>
              <div className="h-6 w-6 rounded flex items-center justify-center bg-black/40 border border-blue-900/30">
                {activeSection === 'gallery' ? 
                  <ChevronUp className="h-4 w-4 text-blue-400" /> : 
                  <ChevronDown className="h-4 w-4 text-blue-400" />
                }
              </div>
            </div>
          </div>
          
          {activeSection === 'gallery' && (
            <div className="space-y-4">
              {profile.gallery.length > 0 ? (
                <div className="bg-black/30 border border-blue-900/20 rounded-md p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {profile.gallery.map((image) => (
                      <div key={image.id} className="group relative h-40 rounded-md overflow-hidden border border-blue-900/30">
                        <img 
                          src={image.url} 
                          alt={image.caption || 'Gallery image'} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <div className="text-white text-sm">{image.caption}</div>
                          <div className="text-gray-300 text-xs">{formatDate(image.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-black/30 border border-blue-900/20 rounded-md p-6 text-center">
                  <Camera className="h-12 w-12 text-blue-900/60 mx-auto mb-3" />
                  <h4 className="text-white text-lg mb-2">No images in your gallery</h4>
                  <p className="text-gray-400 text-sm mb-4">Add photos of your vehicles, drives, and automotive experiences.</p>
                </div>
              )}
              
              <div className="text-center">
                <Link to="/gallery" className="bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-md text-sm inline-flex items-center border border-blue-900/50 hover:bg-blue-900/50 transition-colors">
                  <Camera className="h-4 w-4 mr-1.5" />
                  View Full Gallery
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* F1-style technical footer */}
      <div className="bg-black/70 border-t border-blue-900/20 px-4 py-2 flex justify-between items-center relative z-10">
        <div className="flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
          <span className="text-xs text-blue-400/70 font-mono">DRIVER ID: {profile.id.toUpperCase()}</span>
        </div>
        <div className="text-xs text-gray-500">
          Last active: {new Date(profile.lastActive).toLocaleTimeString()}
        </div>
      </div>
      
      {/* Technical accent lines for F1 styling */}
      <div className="absolute -bottom-2 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      <div className="absolute -bottom-4 left-24 right-24 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </div>
  );
};

export default UserProfileHub;
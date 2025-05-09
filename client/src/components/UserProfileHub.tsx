import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  User, Shield, Award, Car, Calendar, Droplets, Map, Camera, Sliders, 
  ChevronDown, ChevronUp, ChevronRight, Clock, Gauge, Zap,
  RefreshCw, Activity, Trophy, BarChart2
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useUserProfileStore } from '../services/userProfileService';
import { useAuth } from '../hooks/useAuth';
import { useVehicle } from '../hooks/useVehicle';
import ProfileDataCollector from '../services/ProfileDataCollector';
import DataSourceConnector from '../services/DataSourceConnector';
import { getUserDisplayName } from '../utils/DataIntegrityVerifier';

/**
 * F1-Style Driver Profile
 * 
 * This component displays the user's profile information in an F1 telemetry-style dashboard.
 * All data comes from authorized sources:
 * - Auth context for user identity
 * - Vehicle context for garage data
 * - Profile store for statistics and activity
 * - DataSourceConnector for integrated data from all services
 */
const UserProfileHub: React.FC = () => {
  // Get authenticated user data
  const { user } = useAuth();
  
  // Get profile data from the store
  const { profile, updateProfile, resetProfile } = useUserProfileStore();
  
  // Get vehicle data from context
  const { activeVehicle, vehicles } = useVehicle();
  
  // UI state for expandable sections and loading
  const [activeSection, setActiveSection] = useState<string | null>('summary');
  const [showMembershipInfo, setShowMembershipInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load and synchronize profile data from all sources
  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoading(true);
      console.log("Initializing driver profile with authenticated data");
      
      try {
        // Get data from all sources via the connector
        const onboardingData = await DataSourceConnector.getUserOnboardingData();
        const vehicleData = await DataSourceConnector.getVehicleData();
        const galleryData = await DataSourceConnector.getGalleryData();
        const juiceBoxData = await DataSourceConnector.getJuiceBoxData();
        
        // Build comprehensive profile from all connected data sources
        const freshProfile = {
          // User identity - from Auth context with generic fallbacks, not hardcoded user data
          id: user?.id?.toString() || 'guest',
          username: user?.username || getUserDisplayName() || 'driver',
          displayName: user?.fullName || getUserDisplayName() || 'Guest Driver',
          memberSince: onboardingData?.memberSince || new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString(),
          
          // User metadata - with dynamic fallbacks, not specific user details
          bio: onboardingData?.bio || '',
          location: onboardingData?.location || '',
          membershipLevel: (onboardingData?.membershipLevel as 'free' | 'premium' | 'elite') || 'free',
          avatar: onboardingData?.avatar || '/assets/images/default-avatar.png',
          
          // Vehicle collection - from Garage Vault context
          vehicles: vehicleData?.vehicles || vehicles || [],
          
          // User statistics - aggregate from activity data
          statistics: {
            totalDrives: onboardingData?.statistics?.totalDrives || 0,
            totalMiles: onboardingData?.statistics?.totalMiles || 0,
            avgDriveTime: onboardingData?.statistics?.avgDriveTime || 0,
            favoriteRoads: onboardingData?.statistics?.favoriteRoads || [],
            achievements: onboardingData?.statistics?.achievements || 0,
            goalsCompleted: onboardingData?.statistics?.goalsCompleted || 0,
            eventsAttended: onboardingData?.statistics?.eventsAttended || 0
          },
          
          // Collections from other data sources
          drives: onboardingData?.drives || [],
          goals: onboardingData?.goals || [],
          events: onboardingData?.events || [],
          gallery: galleryData || onboardingData?.gallery || [],
          
          // User preferences with fallbacks
          preferences: onboardingData?.preferences || {
            theme: 'dark',
            notifications: true,
            timeFormat: '24h',
            dateFormat: 'mdy',
            soundEnabled: true
          },
          
          // Weather preferences with fallbacks
          weatherPreferences: onboardingData?.weatherPreferences || {
            defaultLocation: {
              lat: 33.7490,
              lon: -84.3880,
              name: 'Atlanta, GA'
            },
            units: 'imperial',
            savedLocations: []
          }
        };
        
        // Update profile with fresh aggregated data
        updateProfile(freshProfile);
        
        // Log successful initialization
        console.log('Driver profile initialized from authenticated sources');
      } catch (error) {
        console.error("Error loading user profile from data sources:", error);
        
        // If error, create a minimal profile with authenticated data only
        const fallbackProfile = {
          id: user?.id?.toString() || '',
          username: user?.username || getUserDisplayName() || '',
          displayName: user?.fullName || getUserDisplayName() || '',
          memberSince: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString(),
          bio: '',
          location: '',
          membershipLevel: 'free' as const,
          avatar: '/assets/images/default-avatar.png',
          vehicles: vehicles || [],
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
          preferences: {
            theme: 'dark',
            notifications: true,
            timeFormat: '24h',
            dateFormat: 'mdy',
            soundEnabled: true
          },
          weatherPreferences: {
            defaultLocation: {
              lat: 33.7490,
              lon: -84.3880,
              name: 'United States'
            },
            units: 'imperial',
            savedLocations: []
          }
        };
        
        // Update with fallback profile
        updateProfile(fallbackProfile);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initialize profile
    initializeProfile();
    
    // Log page view
    ProfileDataCollector.logPageView('UserProfileHub');
  }, [user, updateProfile, vehicles]);
  
  // Sync active vehicle with profile when it changes
  useEffect(() => {
    if (activeVehicle && profile) {
      console.log("Syncing vehicle with profile:", activeVehicle.make, activeVehicle.model);
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
  
  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };
  
  // Calculate days since member joined
  const calculateDaysSinceMember = () => {
    try {
      const memberSinceDate = new Date(profile?.memberSince || new Date());
      const currentDate = new Date();
      const differenceInTime = currentDate.getTime() - memberSinceDate.getTime();
      return Math.floor(differenceInTime / (1000 * 3600 * 24));
    } catch (error) {
      console.error("Error calculating days:", error);
      return 0;
    }
  };
  
  // Refresh profile data from all sources
  const handleRefreshProfile = async () => {
    setIsLoading(true);
    
    try {
      // Reset the profile
      resetProfile();
      
      // Wait a moment for state to clear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get fresh data from all sources
      const onboardingData = await DataSourceConnector.getUserOnboardingData();
      const vehicleData = await DataSourceConnector.getVehicleData();
      
      // Create a fresh profile with updated data
      const freshProfile = {
        // User identity - from Auth context with fallbacks
        id: user?.id?.toString() || '',
        username: user?.username || getUserDisplayName() || '',
        displayName: user?.fullName || getUserDisplayName() || '',
        memberSince: onboardingData?.memberSince || new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString(),
        
        // User metadata with fallbacks
        bio: onboardingData?.bio || '',
        location: onboardingData?.location || '',
        membershipLevel: (onboardingData?.membershipLevel as 'free' | 'premium' | 'elite') || 'free' as const,
        avatar: onboardingData?.avatar || '/assets/images/default-avatar.png',
        
        // Collections from vehicle context
        vehicles: vehicleData?.vehicles || vehicles || [],
        
        // User statistics with fallbacks
        statistics: onboardingData?.statistics || {
          totalDrives: 0,
          totalMiles: 0,
          avgDriveTime: 0,
          favoriteRoads: [],
          achievements: 0,
          goalsCompleted: 0,
          eventsAttended: 0
        },
        
        // Activity collections
        drives: onboardingData?.drives || [],
        goals: onboardingData?.goals || [],
        events: onboardingData?.events || [],
        gallery: onboardingData?.gallery || [],
        
        // Preferences with fallbacks
        preferences: onboardingData?.preferences || {
          theme: 'dark',
          notifications: true,
          timeFormat: '24h',
          dateFormat: 'mdy',
          soundEnabled: true
        },
        
        // Weather preferences with fallbacks
        weatherPreferences: onboardingData?.weatherPreferences || {
          defaultLocation: {
            lat: 33.7490,
            lon: -84.3880,
            name: ''
          },
          units: 'imperial',
          savedLocations: []
        }
      };
      
      // Update with fresh data
      updateProfile(freshProfile);
      
      // If active vehicle exists, sync it
      if (activeVehicle) {
        ProfileDataCollector.syncVehicleFromContext(activeVehicle);
      }
      
      // Show success message
      toast({
        title: "Profile Refreshed",
        description: "Your profile has been updated with latest data",
        variant: "default"
      });
    } catch (error) {
      console.error("Error refreshing profile:", error);
      
      toast({
        title: "Refresh Failed",
        description: "Could not refresh profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state UI
  if (isLoading || !profile) {
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
            onClick={handleRefreshProfile}
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
                alt={`${profile.displayName || profile.username} profile photo`}
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
              {profile.displayName || profile.username || 'Driver'}
            </h1>
            <div className="text-blue-400 text-sm mb-2 flex items-center justify-center sm:justify-start">
              <User className="h-3.5 w-3.5 mr-1" />
              @{profile.username || 'driver'}
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
                {profile.vehicles?.length || 0} {profile.vehicles?.length === 1 ? 'Vehicle' : 'Vehicles'}
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
                <div className="text-white text-xl font-mono font-bold">{profile.statistics?.totalDrives || 0}</div>
              </div>
            </div>
            
            <div className="bg-blue-900/20 p-2 rounded-md border border-blue-900/30 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-800/30 flex items-center justify-center border border-blue-700/30">
                <Award className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-gray-400 text-xs">Achievements</div>
                <div className="text-white text-xl font-mono font-bold">{profile.statistics?.achievements || 0}</div>
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
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics?.totalMiles?.toLocaleString() || 0}</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, ((profile.statistics?.totalMiles || 0)/10000)*100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Avg Drive Time</div>
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics?.avgDriveTime || 0} min</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, ((profile.statistics?.avgDriveTime || 0)/120)*100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Goals Completed</div>
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics?.goalsCompleted || 0}</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${Math.min(100, ((profile.statistics?.goalsCompleted || 0)/20)*100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Events Attended</div>
                  <div className="text-white text-xl font-mono font-semibold">{profile.statistics?.eventsAttended || 0}</div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, ((profile.statistics?.eventsAttended || 0)/10)*100)}%` }}></div>
                  </div>
                </div>
              </div>
              
              {/* Favorite roads */}
              <div className="mt-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Favorite Roads</div>
                {profile.statistics?.favoriteRoads?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {profile.statistics.favoriteRoads.map((road, index) => (
                      <div key={index} className="bg-black/50 border border-blue-900/30 px-3 py-2 rounded-sm text-sm text-blue-300 flex items-center">
                        <Map className="h-3.5 w-3.5 text-blue-400 mr-2" />
                        <span>{road}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm italic">
                    No favorite roads recorded yet. Start exploring!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Vehicle Gallery Section */}
        <div className="mb-6">
          <div 
            className="mb-2 border border-blue-900/30 bg-blue-900/10 rounded-md p-3 cursor-pointer hover:bg-blue-900/20 transition-colors"
            onClick={() => toggleSection('vehicles')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Car className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-blue-300 font-medium">Vehicle Collection</h3>
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
            <div className="bg-black/30 border border-blue-900/20 rounded-md p-4">
              {profile.vehicles?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.vehicles.map((vehicle) => (
                    <div 
                      key={vehicle.id} 
                      className="relative overflow-hidden rounded-md border border-gray-800 bg-black/50 group"
                    >
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={vehicle.image || '/assets/images/default-car.jpg'} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-80"></div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-blue-300 font-semibold">{vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</div>
                        <div className="text-gray-400 text-sm">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</div>
                        
                        <Link 
                          to={`/garage/${vehicle.id}`}
                          className="mt-2 flex items-center text-xs text-green-500 hover:text-green-400"
                        >
                          View Details <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  <Link
                    to="/garage/add-vehicle"
                    className="flex flex-col items-center justify-center h-40 rounded-md border border-gray-800 border-dashed bg-black/20 p-4 hover:bg-black/30 transition-colors"
                  >
                    <Car className="h-8 w-8 text-blue-800 mb-2" />
                    <span className="text-blue-400 text-sm font-medium">Add Vehicle</span>
                    <span className="text-gray-500 text-xs mt-1">Track another vehicle in your collection</span>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="h-10 w-10 text-blue-900/50 mx-auto mb-3" />
                  <p className="text-gray-400 mb-3">You haven't added any vehicles yet.</p>
                  <Link 
                    to="/garage/add-vehicle"
                    className="inline-block bg-blue-900/30 hover:bg-blue-900/40 text-blue-300 px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Add Your First Vehicle
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Recent Drives Section */}
        <div className="mb-6">
          <div 
            className="mb-2 border border-blue-900/30 bg-blue-900/10 rounded-md p-3 cursor-pointer hover:bg-blue-900/20 transition-colors"
            onClick={() => toggleSection('drives')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Map className="h-4 w-4 text-blue-400 mr-2" />
                <h3 className="text-blue-300 font-medium">Recent Drives</h3>
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
            <div className="bg-black/30 border border-blue-900/20 rounded-md p-4">
              {profile.drives?.length > 0 ? (
                <div className="space-y-3">
                  {profile.drives.slice(0, 3).map((drive) => (
                    <div 
                      key={drive.id} 
                      className="flex border border-gray-800 rounded-md overflow-hidden bg-black/50"
                    >
                      <div className="w-24 h-20 bg-blue-900/20 flex items-center justify-center">
                        <Map className="h-8 w-8 text-blue-800/70" />
                      </div>
                      <div className="p-3 flex-1">
                        <div className="flex justify-between">
                          <div className="text-blue-300 font-medium text-sm">{drive.route}</div>
                          <div className="text-gray-500 text-xs">{drive.date}</div>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="text-gray-400 text-xs flex items-center">
                            <Map className="h-3 w-3 mr-1" />
                            {drive.distance} miles
                          </div>
                          <div className="text-gray-400 text-xs flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {drive.duration ? `${Math.floor(drive.duration / 60)}h ${drive.duration % 60}m` : 'N/A'}
                          </div>
                          <div className="text-gray-400 text-xs flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            {drive.avgSpeed} mph avg
                          </div>
                        </div>
                        {drive.notes && <div className="text-gray-500 text-xs mt-1">{drive.notes}</div>}
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center mt-3">
                    <Link 
                      to="/drive-journal"
                      className="inline-block text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View All Drives
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Map className="h-10 w-10 text-blue-900/50 mx-auto mb-3" />
                  <p className="text-gray-400 mb-3">You haven't logged any drives yet.</p>
                  <Link 
                    to="/drive-journal/new"
                    className="inline-block bg-blue-900/30 hover:bg-blue-900/40 text-blue-300 px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Log Your First Drive
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Management Links */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-8">
          <Link 
            to="/edit-profile"
            className="bg-blue-900/20 hover:bg-blue-900/30 text-blue-300 px-4 py-2 rounded-md text-sm transition-colors flex items-center"
          >
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
          
          <Link 
            to="/drive-journal"
            className="bg-green-900/20 hover:bg-green-900/30 text-green-300 px-4 py-2 rounded-md text-sm transition-colors flex items-center"
          >
            <Activity className="h-4 w-4 mr-2" />
            Drive Journal
          </Link>
          
          <Link 
            to="/garage"
            className="bg-purple-900/20 hover:bg-purple-900/30 text-purple-300 px-4 py-2 rounded-md text-sm transition-colors flex items-center"
          >
            <Car className="h-4 w-4 mr-2" />
            Garage Vault
          </Link>
          
          <Link 
            to="/gallery"
            className="bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 px-4 py-2 rounded-md text-sm transition-colors flex items-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            My Gallery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHub;
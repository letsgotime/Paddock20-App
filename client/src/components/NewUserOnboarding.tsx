import React, { useState, useEffect } from "react";
import { 
  User, 
  Car, 
  Check, 
  ChevronRight, 
  ChevronsRight,
  CalendarDays,
  MapPin,
  Camera,
  Settings,
  Gauge
} from "lucide-react";
import { useUserProfileStore } from "../services/userProfileService";
import { useVehicle } from "../contexts/VehicleContext";
import { Link, useNavigate } from "react-router-dom";
import ProfileDataCollector from "../services/ProfileDataCollector";

type OnboardingStep = 
  | 'welcome' 
  | 'profile' 
  | 'vehicle' 
  | 'preferences' 
  | 'complete';

interface ProfileFormData {
  displayName: string;
  location: string;
  bio: string;
  profileImage: string | null;
}

interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  nickname: string;
  color: string;
  mileage: number;
  vehicle_image: string | null;
}

interface PreferencesFormData {
  theme: 'dark' | 'light';
  units: 'imperial' | 'metric';
  notifications: boolean;
  privacyLevel: 'public' | 'private' | 'friends';
}

const NewUserOnboarding: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [progress, setProgress] = useState(0);
  const { setProfile, profile } = useUserProfileStore();
  const { addVehicle } = useVehicle();
  
  // Form states
  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: "Gavin Brooks",
    location: "Atlanta, GA",
    bio: "",
    profileImage: null
  });
  
  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    nickname: "",
    color: "#000000",
    mileage: 0,
    vehicle_image: null
  });
  
  const [preferencesData, setPreferencesData] = useState<PreferencesFormData>({
    theme: 'dark',
    units: 'imperial',
    notifications: true,
    privacyLevel: 'private'
  });

  // Update progress based on current step
  useEffect(() => {
    switch(currentStep) {
      case 'welcome':
        setProgress(0);
        break;
      case 'profile':
        setProgress(25);
        break;
      case 'vehicle':
        setProgress(50);
        break;
      case 'preferences':
        setProgress(75);
        break;
      case 'complete':
        setProgress(100);
        break;
    }
  }, [currentStep]);

  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('vehicle');
  };

  // Handle vehicle form submission
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('preferences');
  };

  // Handle preferences form submission
  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('complete');
  };

  // Complete onboarding and create profile data
  const handleCompleteOnboarding = () => {
    // Create the user profile
    const newProfile = {
      id: '1',
      displayName: profileData.displayName,
      username: profileData.displayName.replace(' ', '').toLowerCase(),
      location: profileData.location,
      bio: profileData.bio,
      profileImage: profileData.profileImage,
      memberSince: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
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
      preferences: {
        theme: preferencesData.theme,
        notifications: preferencesData.notifications,
        timeFormat: '24h',
        dateFormat: 'mdy',
        soundEnabled: true,
        privacyLevel: preferencesData.privacyLevel
      },
      weatherPreferences: {
        defaultLocation: {
          lat: 33.7490,
          lon: -84.3880,
          name: profileData.location || 'Atlanta, GA'
        },
        units: preferencesData.units,
        savedLocations: []
      },
      onboardingComplete: true
    };
    
    // Save profile to store
    setProfile(newProfile);
    
    // Add vehicle
    if (vehicleData.make && vehicleData.model) {
      const newVehicle = {
        id: `vehicle-${Date.now()}`,
        car_id: `GTM-${Math.floor(1000 + Math.random() * 9000)}`,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        nickname: vehicleData.nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
        car_name: vehicleData.nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
        vehicle_image: vehicleData.vehicle_image,
        mileage: vehicleData.mileage,
        status: "Ready",
        last_service: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        engine_type: "Gasoline",
        transmission: "Automatic",
        color: vehicleData.color.replace('#', ''),
        purchase_date: new Date().toISOString().split('T')[0],
        vehicle_type: "Car"
      };
      
      addVehicle(newVehicle);
      
      // Sync with profile data collector
      ProfileDataCollector.syncVehicleFromContext(newVehicle);
    }
    
    // Save onboarding data to local storage for persistence
    localStorage.setItem('userOnboardingData', JSON.stringify({
      ...newProfile,
      onboardingCompleteDate: new Date().toISOString()
    }));
    
    // Mark onboarding as complete
    onComplete();
    
    // Navigate to the new dashboard
    navigate('/new-dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-800 w-full">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-400 mb-2">Welcome to PADDOCK20</h1>
                <p className="text-gray-400">
                  Let's set up your driver profile to get the most out of your experience.
                </p>
              </div>
              
              <div className="bg-[#111115] rounded-xl p-6 border border-gray-800 space-y-6">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 rounded-full p-3 mr-4">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Create your profile</h3>
                    <p className="text-sm text-gray-400">Personalize your experience</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-500/20 rounded-full p-3 mr-4">
                    <Car className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Add your vehicle</h3>
                    <p className="text-sm text-gray-400">Track your rides and maintenance</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-500/20 rounded-full p-3 mr-4">
                    <Settings className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Set your preferences</h3>
                    <p className="text-sm text-gray-400">Customize your experience</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setCurrentStep('profile')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    This will only take a minute. You can update these details anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Step */}
        {currentStep === 'profile' && (
          <div className="max-w-2xl mx-auto w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="bg-[#111115] rounded-xl p-6 border border-gray-800">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="h-28 w-28 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      {profileData.profileImage ? (
                        <img 
                          src={profileData.profileImage} 
                          alt="Profile preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-600" />
                      )}
                    </div>
                    <button 
                      type="button"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Upload Photo
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                        placeholder="City, State"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Bio (Optional)
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Tell us about yourself and your automotive interests"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep('welcome')}
                  className="px-5 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                >
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Vehicle Step */}
        {currentStep === 'vehicle' && (
          <div className="max-w-2xl mx-auto w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Add Your Vehicle</h2>
            
            <form onSubmit={handleVehicleSubmit} className="space-y-6">
              <div className="bg-[#111115] rounded-xl p-6 border border-gray-800">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="h-32 w-32 rounded-md bg-gray-800 flex items-center justify-center overflow-hidden">
                      {vehicleData.vehicle_image ? (
                        <img 
                          src={vehicleData.vehicle_image} 
                          alt="Vehicle preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Car className="h-14 w-14 text-gray-600" />
                      )}
                    </div>
                    <button 
                      type="button"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Upload Photo
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Make
                        </label>
                        <input
                          type="text"
                          value={vehicleData.make}
                          onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                          className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. BMW"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Model
                        </label>
                        <input
                          type="text"
                          value={vehicleData.model}
                          onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                          className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. M3"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          value={vehicleData.year}
                          onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                          className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Nickname (Optional)
                        </label>
                        <input
                          type="text"
                          value={vehicleData.nickname}
                          onChange={(e) => setVehicleData({...vehicleData, nickname: e.target.value})}
                          className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. The Beast"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={vehicleData.color}
                            onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                            className="w-10 h-10 rounded border border-gray-700 bg-transparent"
                          />
                          <input
                            type="text"
                            value={vehicleData.color}
                            onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                            className="flex-1 py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Current Mileage
                        </label>
                        <input
                          type="number"
                          value={vehicleData.mileage}
                          onChange={(e) => setVehicleData({...vehicleData, mileage: parseInt(e.target.value) || 0})}
                          className="w-full py-2 px-3 bg-black border border-gray-700 rounded-md text-white focus:border-blue-500 focus:outline-none"
                          min="0"
                          step="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-800 pt-6">
                  <div className="flex items-center mb-4">
                    <Check className="text-[#08c519] h-5 w-5 mr-2" />
                    <p className="text-gray-300 text-sm">
                      Your vehicle data will be used to provide maintenance reminders and driving insights.
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <Check className="text-[#08c519] h-5 w-5 mr-2" />
                    <p className="text-gray-300 text-sm">
                      You can add more vehicles or edit vehicle details later.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep('profile')}
                  className="px-5 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                >
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Preferences Step */}
        {currentStep === 'preferences' && (
          <div className="max-w-2xl mx-auto w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Set Your Preferences</h2>
            
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div className="bg-[#111115] rounded-xl p-6 border border-gray-800">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Appearance</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${
                          preferencesData.theme === 'dark' 
                            ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                            : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-600'
                        }`}
                        onClick={() => setPreferencesData({...preferencesData, theme: 'dark'})}
                      >
                        <div className="bg-gray-900 rounded p-3 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                          <div className="bg-gray-800 w-10 h-10 rounded"></div>
                        </div>
                        <p className="font-medium">Dark Mode</p>
                      </div>
                      
                      <div 
                        className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${
                          preferencesData.theme === 'light' 
                            ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                            : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-600'
                        }`}
                        onClick={() => setPreferencesData({...preferencesData, theme: 'light'})}
                      >
                        <div className="bg-gray-100 rounded p-3 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                          <div className="bg-white w-10 h-10 rounded"></div>
                        </div>
                        <p className="font-medium">Light Mode</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-5">
                    <h3 className="text-lg font-medium mb-4">Units</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${
                          preferencesData.units === 'imperial' 
                            ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                            : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-600'
                        }`}
                        onClick={() => setPreferencesData({...preferencesData, units: 'imperial'})}
                      >
                        <div className="rounded p-3 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                          <Gauge className="h-10 w-10" />
                        </div>
                        <p className="font-medium">Imperial (mi, °F)</p>
                      </div>
                      
                      <div 
                        className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${
                          preferencesData.units === 'metric' 
                            ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                            : 'border-gray-700 bg-black/30 text-gray-300 hover:border-gray-600'
                        }`}
                        onClick={() => setPreferencesData({...preferencesData, units: 'metric'})}
                      >
                        <div className="rounded p-3 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
                          <Gauge className="h-10 w-10" />
                        </div>
                        <p className="font-medium">Metric (km, °C)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-5">
                    <h3 className="text-lg font-medium mb-4">Notifications</h3>
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700">
                      <div>
                        <p className="font-medium">Enable Notifications</p>
                        <p className="text-sm text-gray-400">Receive alerts for maintenance, events, and more</p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={preferencesData.notifications}
                          onChange={() => setPreferencesData({
                            ...preferencesData, 
                            notifications: !preferencesData.notifications
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-5">
                    <h3 className="text-lg font-medium mb-4">Privacy</h3>
                    <div className="space-y-3">
                      <div 
                        className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                          preferencesData.privacyLevel === 'public' 
                            ? 'bg-blue-900/20 border-blue-500/50' 
                            : 'border-gray-700 bg-black/30 hover:border-gray-600'
                        }`}
                        onClick={() => setPreferencesData({...preferencesData, privacyLevel: 'public'})}
                      >
                        <div>
                          <p className="font-medium">Public Profile</p>
                          <p className="text-sm text-gray-400">Anyone can see your profile and vehicles</p>
                        </div>
                        
                        {preferencesData.privacyLevel === 'public' && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      
                      <div 
                        className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                          preferencesData.privacyLevel === 'friends' 
                            ? 'bg-blue-900/20 border-blue-500/50' 
                            : 'border-gray-700 bg-black/30 hover:border-gray-600'
                        }`}
                        onClick={() => setPreferencesData({...preferencesData, privacyLevel: 'friends'})}
                      >
                        <div>
                          <p className="font-medium">Friends Only</p>
                          <p className="text-sm text-gray-400">Only connected friends can see your profile</p>
                        </div>
                        
                        {preferencesData.privacyLevel === 'friends' && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      
                      <div 
                        className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                          preferencesData.privacyLevel === 'private' 
                            ? 'bg-blue-900/20 border-blue-500/50' 
                            : 'border-gray-700 bg-black/30 hover:border-gray-600'
                        }`}
                        onClick={() => setPreferencesData({...preferencesData, privacyLevel: 'private'})}
                      >
                        <div>
                          <p className="font-medium">Private Profile</p>
                          <p className="text-sm text-gray-400">Only you can see your profile information</p>
                        </div>
                        
                        {preferencesData.privacyLevel === 'private' && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep('vehicle')}
                  className="px-5 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                >
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Complete Step */}
        {currentStep === 'complete' && (
          <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8">
              <div className="mb-8">
                <div className="mx-auto h-20 w-20 bg-[#08c519]/20 rounded-full flex items-center justify-center mb-6">
                  <Check className="h-12 w-12 text-[#08c519]" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-3">Profile Ready!</h1>
                <p className="text-gray-400">
                  Your profile and vehicle have been set up successfully. You're all set to explore PADDOCK20!
                </p>
              </div>
              
              <div className="bg-[#111115] rounded-xl p-6 border border-gray-800 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    {profileData.profileImage ? (
                      <img 
                        src={profileData.profileImage} 
                        alt={profileData.displayName} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="text-left">
                    <p className="font-medium">{profileData.displayName}</p>
                    <p className="text-sm text-gray-400">{profileData.location}</p>
                  </div>
                </div>
                
                {vehicleData.make && vehicleData.model && (
                  <div className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg">
                    <div className="h-10 w-10 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                      {vehicleData.vehicle_image ? (
                        <img 
                          src={vehicleData.vehicle_image} 
                          alt={`${vehicleData.make} ${vehicleData.model}`} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Car className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="text-left">
                      <p className="font-medium">
                        {vehicleData.nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}
                      </p>
                      <p className="text-sm text-gray-400">{vehicleData.mileage.toLocaleString()} miles</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <button 
                    onClick={handleCompleteOnboarding}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center"
                  >
                    Get Started
                    <ChevronsRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Your information is securely stored and can be updated at any time from your profile settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewUserOnboarding;
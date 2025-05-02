import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, X, ChevronRight, AlertTriangle, Shield, Car, Trophy, Clock, 
  User, Settings, Map, Calendar, Gauge, Heart, ThumbsUp, 
  Activity, Zap, Wrench, Smartphone, Palette, UserPlus, Mail, Key,
  CircleDashed, Upload, Camera, FileText, PaintBucket, Cloud, PlusCircle
} from 'lucide-react';

interface UserOnboardingProps {
  onComplete: () => void;
}

// Carolina blue color code for consistent branding
const CAROLINA_BLUE = '#1982FC';
const GOTIME_GREEN = '#08c519';

// User profile type definition
interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profileImage: string;
  drivingExperience: string;
  interests: string[];
  bio: string;
}

// Vehicle profile type definition
interface VehicleProfile {
  make: string;
  model: string;
  year: string;
  engineType: string;
  transmissionType: string;
  nickname: string;
  color: string;
  vehicleImage: string;
  mileage: string;
  purchaseDate: string;
}

// Dashboard preferences type definition
interface DashboardPreferences {
  theme: 'dark' | 'darker';
  showWeather: boolean;
  showEvents: boolean;
  showMaintenance: boolean;
  showJuiceBox: boolean;
  showGarageVault: boolean;
  showManifestationStation: boolean;
  primaryFocus: string;
  notificationSettings: boolean;
  tempDisplay: 'standard' | 'detailed' | 'compact';
}

// Location settings type definition
interface LocationSettings {
  primaryLocation: string;
  units: 'imperial' | 'metric';
  autoRefresh: boolean;
}

// Route type definition
interface RouteInfo {
  name: string;
  points: string;
}

// Available interests for user selection
const availableInterests = [
  'Track Driving', 'Auto Detailing', 'Car Shows', 'Motorsport', 'Modifications',
  'Classic Cars', 'Supercars', 'Off-roading', 'Restoration', 'Performance Tuning',
  'Automotive Photography', 'Rally Racing', 'F1', 'NASCAR', 'Drift Racing'
];

// Available car manufacturers
const carManufacturers = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
  'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat',
  'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep',
  'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati',
  'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Porsche',
  'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

// Available engine types
const engineTypes = [
  'Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Hydrogen Fuel Cell'
];

// Available transmission types
const transmissionTypes = [
  'Automatic', 'Manual', 'Dual-Clutch', 'CVT', 'Semi-Automatic'
];

// Module focus options
const moduleOptions = [
  'Weather Paddock', 'JuiceBox', 'Garage Vault', 'Manifestation Station',
  'Drive Journal', 'Motorsports', 'Telemetry'
];

/**
 * UserOnboarding Component
 * 
 * Complete onboarding flow including legal terms, user profile creation, vehicle setup,
 * and dashboard preferences.
 * 
 * Uses brand-consistent styling with Orbitron for headings and Open Sans for body text.
 * Color scheme follows the dark carbon-fiber theme with Carolina blue accents.
 */
const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  // Track the current step in the onboarding process
  const [step, setStep] = useState(1);
  
  // For agreement step
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    betaAgreement: false
  });
  
  // For user profile step
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
    drivingExperience: 'intermediate',
    interests: [],
    bio: ''
  });
  
  // For vehicle profile step
  const [vehicleProfile, setVehicleProfile] = useState<VehicleProfile>({
    make: '',
    model: '',
    year: '',
    engineType: '',
    transmissionType: '',
    nickname: '',
    color: '#000000',
    vehicleImage: '',
    mileage: '',
    purchaseDate: ''
  });
  
  // For dashboard preferences step
  const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPreferences>({
    theme: 'dark',
    showWeather: true,
    showEvents: true,
    showMaintenance: true,
    showJuiceBox: true,
    showGarageVault: true,
    showManifestationStation: true,
    primaryFocus: moduleOptions[0],
    notificationSettings: true,
    tempDisplay: 'standard'
  });
  
  // For location settings
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    primaryLocation: 'Charlotte, NC',
    units: 'imperial',
    autoRefresh: true
  });
  
  // For routes/favorite drives
  const [routes, setRoutes] = useState<RouteInfo[]>([
    { name: 'Daily Commute', points: 'Home to Office' }
  ]);
  
  // Error/validation state
  const [error, setError] = useState<string | null>(null);
  
  // Animation state
  const [animateIn, setAnimateIn] = useState(true);
  
  // Step visibility state (for transitioning between steps)
  const [visibleStep, setVisibleStep] = useState(1);
  
  // Track if the user has uploaded a profile picture
  const [hasUploadedProfilePic, setHasUploadedProfilePic] = useState(false);
  
  // Track if the user has uploaded a vehicle image
  const [hasUploadedVehicleImage, setHasUploadedVehicleImage] = useState(false);
  
  // Check if legal agreements are complete
  const allAgreed = Object.values(agreements).every(value => value === true);
  
  // Check if user profile is complete enough to proceed
  const isUserProfileComplete = () => {
    return userProfile.fullName.trim() !== '' && 
           userProfile.username.trim() !== '' && 
           userProfile.email.trim() !== '' &&
           userProfile.password.trim() !== '' &&
           userProfile.confirmPassword.trim() !== '' &&
           userProfile.password === userProfile.confirmPassword;
    // Removed the interests requirement since it's optional
  };
  
  // Check if vehicle profile is complete enough to proceed
  const isVehicleProfileComplete = () => {
    return vehicleProfile.make.trim() !== '' && 
           vehicleProfile.model.trim() !== '' && 
           vehicleProfile.year.trim() !== '';
  };
  
  // Handle checkbox changes for legal agreements
  const handleAgreementChange = (agreement: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [agreement]: !prev[agreement]
    }));
    setError(null);
  };
  
  // Handle interest selection
  const toggleInterest = (interest: string) => {
    setUserProfile(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      
      return { ...prev, interests };
    });
  };
  
  // Handle user profile input changes
  const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
    setError(null);
  };
  
  // Handle vehicle profile input changes
  const handleVehicleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleProfile(prev => ({ ...prev, [name]: value }));
    setError(null);
  };
  
  // Handle dashboard preferences changes
  const handleDashboardPrefChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setDashboardPrefs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle location settings changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setLocationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle location checkbox changes specifically
  const handleLocationCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setLocationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Simulate geolocation detection
  const handleDetectLocation = () => {
    // In a real app, this would use the browser's geolocation API
    setLocationSettings(prev => ({
      ...prev,
      primaryLocation: 'Charlotte, NC'
    }));
  };
  
  // Handle route changes
  const handleRouteChange = (index: number, field: string, value: string) => {
    setRoutes(prevRoutes => {
      const updatedRoutes = [...prevRoutes];
      updatedRoutes[index] = {
        ...updatedRoutes[index],
        [field]: value
      };
      return updatedRoutes;
    });
  };
  
  // Remove a route
  const removeRoute = (index: number) => {
    setRoutes(prevRoutes => prevRoutes.filter((_, i) => i !== index));
  };
  
  // Add a new route
  const addNewRoute = () => {
    setRoutes(prevRoutes => [...prevRoutes, { name: '', points: '' }]);
  };
  
  // Handle dashboard theme change
  const handleDashboardThemeChange = (theme: 'dark' | 'darker') => {
    setDashboardPrefs(prev => ({
      ...prev,
      theme
    }));
  };
  
  // Simulated file upload for profile picture
  const handleProfileImageUpload = () => {
    // In a real app, this would handle actual file upload
    // For demo, immediately set profile image
    const demoProfileImage = '/favicon.png'; // Use GoTime logo as placeholder
    setHasUploadedProfilePic(true);
    setUserProfile(prev => ({
      ...prev,
      profileImage: demoProfileImage
    }));
    // Clear any errors that might prevent progression
    setError(null);
  };
  
  // Simulated file upload for vehicle image
  const handleVehicleImageUpload = () => {
    // In a real app, this would handle actual file upload
    const demoVehicleImage = '/favicon.png'; // Use GoTime logo as placeholder
    setHasUploadedVehicleImage(true);
    setVehicleProfile(prev => ({
      ...prev,
      vehicleImage: demoVehicleImage
    }));
    // Clear any errors that might prevent progression
    setError(null);
  };

  // Handle smooth transitions between steps
  const handleStepTransition = (direction: 'next' | 'prev') => {
    // Validate current step before proceeding
    if (direction === 'next') {
      // Legal agreements validation
      if (step === 3 && !allAgreed) {
        setError('You must accept all agreements to continue');
        return;
      }
      
      // User profile validation
      if (step === 4) {
        if (!isUserProfileComplete()) {
          setError('Please complete all required fields in your profile');
          return;
        }
        
        if (userProfile.password !== userProfile.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
      }
      
      // Vehicle profile validation
      if (step === 5 && !isVehicleProfileComplete()) {
        setError('Please complete the required vehicle information (make, model, year)');
        return;
      }
      
      // Final step - complete onboarding
      if (step === 6) {
        completeOnboarding();
        return;
      }
    }
    
    // Animate out
    setAnimateIn(false);
    
    // Short delay for animation
    setTimeout(() => {
      if (direction === 'next') {
        setStep(prev => prev + 1);
      } else {
        setStep(prev => Math.max(1, prev - 1));
      }
      
      setError(null);
      setAnimateIn(true);
      setVisibleStep(direction === 'next' ? step + 1 : Math.max(1, step - 1));
    }, 200);
  };
  
  // Final function to save all data and complete onboarding
  const completeOnboarding = () => {
    // In a real app, this would save the data to a database
    // For now, we'll save to localStorage for demo purposes
    
    // Save legal agreements
    localStorage.setItem('userAgreements', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0' // increment this when terms change
    }));
    
    // Save user profile
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Save vehicle profile
    localStorage.setItem('vehicleProfile', JSON.stringify(vehicleProfile));
    
    // Save dashboard preferences
    localStorage.setItem('dashboardPreferences', JSON.stringify(dashboardPrefs));
    
    // Complete onboarding
    onComplete();
  };

  // Simplified step navigation functions
  const nextStep = () => handleStepTransition('next');
  const prevStep = () => handleStepTransition('prev');

  return (
    <div className="fixed inset-0 bg-[url('/assets/Stock Photos/F1/carbon-fiber-texture-dark.png')] bg-opacity-95 bg-blend-overlay bg-black z-50 flex items-center justify-center p-4">
      <div 
        className={`relative bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
        style={{
          boxShadow: `0 0 40px rgba(25, 130, 252, 0.2), 
                      0 0 20px rgba(25, 130, 252, 0.1)`
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1982FC] to-[#08c519]"></div>
        <div className="absolute top-1 right-0 w-4 h-20 bg-gradient-to-b from-[#08c519] opacity-40"></div>
        <div className="absolute bottom-20 left-0 w-4 h-20 bg-gradient-to-t from-[#1982FC] opacity-40"></div>
        
        {/* Header */}
        <div className="border-b border-gray-800 p-6 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {step === 1 && (
              <span style={{ color: CAROLINA_BLUE }}>
                WELCOME TO PADDOCK20 <span style={{ color: GOTIME_GREEN }}>BETA</span>
              </span>
            )}
            {step === 2 && (
              <span style={{ color: CAROLINA_BLUE }}>
                ABOUT PADDOCK20 <span style={{ color: GOTIME_GREEN }}>BETA</span>
              </span>
            )}
            {step === 3 && <span style={{ color: CAROLINA_BLUE }}>LEGAL AGREEMENTS REQUIRED</span>}
            {step === 4 && <span style={{ color: CAROLINA_BLUE }}>YOUR PADDOCK20 PROFILE</span>}
            {step === 5 && <span style={{ color: CAROLINA_BLUE }}>YOUR VEHICLE DETAILS</span>}
            {step === 6 && <span style={{ color: CAROLINA_BLUE }}>CUSTOMIZE YOUR DASHBOARD</span>}
          </h2>
          <div className="flex items-center bg-gray-800/70 px-3 py-1 rounded-full">
            <div className="text-sm text-gray-400 tracking-wide font-medium">
              <span className="text-[#1982FC]">{step}</span> / 6
            </div>
          </div>
        </div>
        
        {/* Step content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center p-4 bg-[#1982FC]/10 rounded-lg border border-[#1982FC]/30">
                <div className="mr-4 bg-[#1982FC]/20 rounded-full p-2">
                  <AlertTriangle style={{ color: CAROLINA_BLUE }} size={24} />
                </div>
                <p className="text-gray-200">
                  Paddock20 is currently in <span style={{ color: GOTIME_GREEN }} className="font-bold">Beta</span>. 
                  You've been granted early access to explore and test the application.
                </p>
              </div>
              
              <div className="relative">
                <h3 className="text-xl font-bold font-orbitron text-white relative z-10 inline-block">
                  What to expect<span style={{ color: CAROLINA_BLUE }}>:</span>
                </h3>
                <div className="absolute bottom-0 left-0 h-1 w-20 bg-gradient-to-r from-[#1982FC] to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="bg-gray-900/40 p-4 rounded-lg border-l-2" style={{ borderColor: GOTIME_GREEN }}>
                  <div className="flex">
                    <Check style={{ color: GOTIME_GREEN }} className="mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-white">Premium Features</h4>
                      <p className="text-gray-300 text-sm mt-1">Cutting-edge automotive enthusiast tools and insights</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/40 p-4 rounded-lg border-l-2" style={{ borderColor: GOTIME_GREEN }}>
                  <div className="flex">
                    <Check style={{ color: GOTIME_GREEN }} className="mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-white">Exclusive Community</h4>
                      <p className="text-gray-300 text-sm mt-1">Connect with like-minded automotive enthusiasts</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/40 p-4 rounded-lg border-l-2 border-red-500">
                  <div className="flex">
                    <X className="text-red-500 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-white">Feature Evolution</h4>
                      <p className="text-gray-300 text-sm mt-1">Some features may be incomplete or change over time</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/40 p-4 rounded-lg border-l-2 border-red-500">
                  <div className="flex">
                    <X className="text-red-500 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-white">Beta Status</h4>
                      <p className="text-gray-300 text-sm mt-1">You may encounter occasional bugs or technical issues</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <img 
                  src="/favicon.png" 
                  alt="GoTime Motorsports Logo" 
                  className="h-12 mb-4 mx-auto opacity-90" 
                />
                <p className="text-gray-300">
                  By proceeding, you're joining an exclusive group of automotive enthusiasts shaping the future of Paddock20. 
                  <span className="block mt-1 font-medium" style={{ color: CAROLINA_BLUE }}>
                    Your feedback will be invaluable in creating the ultimate automotive enthusiast platform.
                  </span>
                </p>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-orbitron" style={{ color: CAROLINA_BLUE }}>
                  THE PADDOCK20 EXPERIENCE
                </h3>
                
                <p className="text-xl text-white mt-2 font-orbitron tracking-wide">
                  Built for Drivers. Engineered for Dreamers. Designed for Legacy.
                </p>
                
                <div className="w-40 h-1 mx-auto mt-4 bg-gradient-to-r from-transparent via-[#1982FC] to-transparent"></div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                Paddock20 is an advanced mobility insights platform that transforms automotive telemetry, 
                detailing management, and personal development into a comprehensive digital experience 
                for automotive enthusiasts and detailing enthusiasts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 hover:border-[#1982FC] transition-colors group">
                  <div className="flex items-start">
                    <div className="bg-[#1982FC]/20 p-2 rounded-lg mr-4">
                      <Clock style={{ color: CAROLINA_BLUE }} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold font-orbitron mb-2 group-hover:text-[#1982FC] transition-colors">
                        Weather Paddock
                      </h4>
                      <p className="text-sm text-gray-300">
                        Essential daily tools for driver enthusiasts: automotive-optimized weather, 
                        world clocks, and F1-inspired telemetry.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 hover:border-[#1982FC] transition-colors group">
                  <div className="flex items-start">
                    <div className="bg-[#1982FC]/20 p-2 rounded-lg mr-4">
                      <Car style={{ color: CAROLINA_BLUE }} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold font-orbitron mb-2 group-hover:text-[#1982FC] transition-colors">
                        JuiceBox
                      </h4>
                      <p className="text-sm text-gray-300">
                        The most intuitive detailing page in the industry with comprehensive tracking 
                        for car detailing, product usage, and maintenance protocols.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 hover:border-[#1982FC] transition-colors group">
                  <div className="flex items-start">
                    <div className="bg-[#1982FC]/20 p-2 rounded-lg mr-4">
                      <Trophy style={{ color: CAROLINA_BLUE }} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold font-orbitron mb-2 group-hover:text-[#1982FC] transition-colors">
                        Manifestation Station
                      </h4>
                      <p className="text-sm text-gray-300">
                        Set, track, and accomplish your automotive goals through our structured 
                        goal-setting framework designed for enthusiasts.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 hover:border-[#1982FC] transition-colors group">
                  <div className="flex items-start">
                    <div className="bg-[#1982FC]/20 p-2 rounded-lg mr-4">
                      <Shield style={{ color: CAROLINA_BLUE }} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold font-orbitron mb-2 group-hover:text-[#1982FC] transition-colors">
                        Garage Vault
                      </h4>
                      <p className="text-sm text-gray-300">
                        Comprehensive vehicle management system with integrated maintenance tracking, 
                        modification planning, and documentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-[#1982FC]/10 p-4 rounded-lg mb-6">
                <Shield className="text-[#1982FC] mr-4" size={24} />
                <p className="text-gray-200">
                  Before proceeding, you must review and agree to the following legal documents.
                  These agreements protect both you and Paddock20 throughout your beta experience.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className={`flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 ${
                  agreements.termsOfService 
                    ? 'bg-[#1982FC]/20 border border-[#1982FC]/40' 
                    : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/80'
                }`}>
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      id="terms-agreement" 
                      className="h-5 w-5 rounded border-gray-500 text-[#1982FC] focus:ring-[#1982FC] focus:ring-offset-gray-900"
                      checked={agreements.termsOfService}
                      onChange={() => handleAgreementChange('termsOfService')}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="terms-agreement" className="font-medium text-white cursor-pointer">
                      I have read and agree to the <Link to="/terms-of-service" target="_blank" className="text-[#1982FC] hover:underline">Terms of Service</Link>
                    </label>
                    <p className="text-sm text-gray-300 mt-2">
                      The Terms of Service outline your rights and obligations when using Paddock20, including acceptable use policies, intellectual property rights, and liability limitations.
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 ${
                  agreements.privacyPolicy 
                    ? 'bg-[#1982FC]/20 border border-[#1982FC]/40' 
                    : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/80'
                }`}>
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      id="privacy-agreement" 
                      className="h-5 w-5 rounded border-gray-500 text-[#1982FC] focus:ring-[#1982FC] focus:ring-offset-gray-900"
                      checked={agreements.privacyPolicy}
                      onChange={() => handleAgreementChange('privacyPolicy')}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="privacy-agreement" className="font-medium text-white cursor-pointer">
                      I have read and agree to the <Link to="/privacy-policy" target="_blank" className="text-[#1982FC] hover:underline">Privacy Policy</Link>
                    </label>
                    <p className="text-sm text-gray-300 mt-2">
                      Our Privacy Policy explains how we collect, use, store, and protect your personal information, including your rights regarding your data and our data retention practices.
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 ${
                  agreements.betaAgreement 
                    ? 'bg-[#1982FC]/20 border border-[#1982FC]/40' 
                    : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/80'
                }`}>
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      id="beta-agreement" 
                      className="h-5 w-5 rounded border-gray-500 text-[#1982FC] focus:ring-[#1982FC] focus:ring-offset-gray-900"
                      checked={agreements.betaAgreement}
                      onChange={() => handleAgreementChange('betaAgreement')}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="beta-agreement" className="font-medium text-white cursor-pointer">
                      I have read and agree to the <Link to="/beta-agreement" target="_blank" className="text-[#1982FC] hover:underline">Beta Agreement</Link>
                    </label>
                    <p className="text-sm text-gray-300 mt-2">
                      The Beta Agreement covers special considerations for beta testers, including feature limitations, feedback expectations, reporting bugs, and confidentiality requirements.
                    </p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center">
                  <X className="text-red-400 mr-2 flex-shrink-0" size={18} />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-400 italic border-t border-gray-800 pt-6">
                <p>By checking all boxes and continuing, you acknowledge that you have read,
                understood, and agreed to all the terms and conditions outlined in these documents.</p>
              </div>
            </div>
          )}
          
          {/* User Profile Form */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-[#1982FC]/10 p-4 rounded-lg mb-6">
                <User className="text-[#1982FC] mr-4" size={24} />
                <p className="text-gray-200">
                  Create your Paddock20 driver profile. This information helps personalize your experience
                  and connect you with like-minded automotive enthusiasts.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Image Upload */}
                <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border border-gray-700 rounded-lg bg-gray-800/30">
                  <div 
                    className="w-32 h-32 mb-4 rounded-full bg-gray-700 flex items-center justify-center border-2 border-[#1982FC]/50 overflow-hidden"
                  >
                    {hasUploadedProfilePic ? (
                      <img 
                        src={userProfile.profileImage || '/assets/Stock Photos/user-avatar-placeholder.png'} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={56} className="text-gray-400" />
                    )}
                  </div>
                  
                  <button 
                    onClick={handleProfileImageUpload}
                    className="px-4 py-2 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                  >
                    <Camera size={16} />
                    Upload Profile Picture
                  </button>
                  
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Recommended: Square image, minimum 500x500 pixels
                  </p>
                </div>
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={userProfile.fullName}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={userProfile.username}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Choose a username"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={userProfile.email}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="your-email@example.com"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Account Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Account Security
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={userProfile.password}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Choose a secure password"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={userProfile.confirmPassword}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Re-enter your password"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="drivingExperience" className="block text-sm font-medium text-gray-300 mb-1">
                        Driving Experience
                      </label>
                      <select
                        id="drivingExperience"
                        name="drivingExperience"
                        value={userProfile.drivingExperience}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Automotive Interests */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Automotive Interests <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Select at least one interest to help us personalize your experience.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableInterests.map(interest => (
                      <div 
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`
                          px-4 py-3 rounded-lg cursor-pointer flex items-center transition-colors
                          ${userProfile.interests.includes(interest)
                            ? 'bg-[#1982FC]/20 border border-[#1982FC]/50'
                            : 'bg-gray-800/60 border border-gray-700 hover:bg-gray-800'
                          }
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded flex-shrink-0 mr-3 flex items-center justify-center
                          ${userProfile.interests.includes(interest)
                            ? 'bg-[#1982FC] text-white'
                            : 'bg-gray-700'
                          }
                        `}>
                          {userProfile.interests.includes(interest) && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm">{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bio */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Bio
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Tell the community a bit about yourself (optional).
                  </p>
                  
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={userProfile.bio}
                    onChange={handleUserProfileChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                    placeholder="Share your automotive passion, experience, or goals..."
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center">
                  <X className="text-red-400 mr-2 flex-shrink-0" size={18} />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Vehicle Details Form */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-[#1982FC]/10 p-4 rounded-lg mb-6">
                <Car className="text-[#1982FC] mr-4" size={24} />
                <p className="text-gray-200">
                  Add your first vehicle to your Garage Vault. This will be your primary vehicle
                  in Paddock20, but you can add more vehicles later.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Image Upload */}
                <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border border-gray-700 rounded-lg bg-gray-800/30">
                  <div 
                    className="w-64 h-40 mb-4 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-[#1982FC]/50 overflow-hidden"
                    style={{ 
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: hasUploadedVehicleImage ? `url(${vehicleProfile.vehicleImage || '/assets/Stock Photos/vehicle-placeholder.png'})` : 'none'
                    }}
                  >
                    {!hasUploadedVehicleImage && (
                      <Car size={64} className="text-gray-400" />
                    )}
                  </div>
                  
                  <button 
                    onClick={handleVehicleImageUpload}
                    className="px-4 py-2 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                  >
                    <Camera size={16} />
                    Upload Vehicle Photo
                  </button>
                  
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Show off your pride and joy! Best angle, good lighting.
                  </p>
                </div>
                
                {/* Basic Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Vehicle Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="make" className="block text-sm font-medium text-gray-300 mb-1">
                        Make <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="make"
                        name="make"
                        required
                        value={vehicleProfile.make}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                      >
                        <option value="">Select Manufacturer</option>
                        {carManufacturers.map(manufacturer => (
                          <option key={manufacturer} value={manufacturer}>
                            {manufacturer}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="model"
                        name="model"
                        type="text"
                        required
                        value={vehicleProfile.model}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="e.g. 911, M3, GT-R"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="year"
                        name="year"
                        type="text"
                        required
                        value={vehicleProfile.year}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="e.g. 2023"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">
                        Nickname
                      </label>
                      <input
                        id="nickname"
                        name="nickname"
                        type="text"
                        value={vehicleProfile.nickname}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Your car's nickname (optional)"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Additional Vehicle Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Technical Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="engineType" className="block text-sm font-medium text-gray-300 mb-1">
                        Engine Type
                      </label>
                      <select
                        id="engineType"
                        name="engineType"
                        value={vehicleProfile.engineType}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                      >
                        <option value="">Select Engine Type</option>
                        {engineTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="transmissionType" className="block text-sm font-medium text-gray-300 mb-1">
                        Transmission
                      </label>
                      <select
                        id="transmissionType"
                        name="transmissionType"
                        value={vehicleProfile.transmissionType}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                      >
                        <option value="">Select Transmission</option>
                        {transmissionTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="mileage" className="block text-sm font-medium text-gray-300 mb-1">
                        Current Mileage
                      </label>
                      <input
                        id="mileage"
                        name="mileage"
                        type="text"
                        value={vehicleProfile.mileage}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Current odometer reading"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">
                        Exterior Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="color"
                          name="color"
                          type="color"
                          value={vehicleProfile.color}
                          onChange={handleVehicleProfileChange}
                          className="h-8 w-8 rounded-full overflow-hidden border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={vehicleProfile.color}
                          onChange={handleVehicleProfileChange}
                          name="color"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                          placeholder="e.g. Frozen Blue Metallic"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Purchase Info */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Purchase Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-300 mb-1">
                        Purchase Date
                      </label>
                      <input
                        id="purchaseDate"
                        name="purchaseDate"
                        type="date"
                        value={vehicleProfile.purchaseDate}
                        onChange={handleVehicleProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-2">
                    This information helps with maintenance scheduling and building your vehicle's history.
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center">
                  <X className="text-red-400 mr-2 flex-shrink-0" size={18} />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Dashboard Customization with Location Settings */}
          {step === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-[#1982FC]/10 p-4 rounded-lg mb-6">
                <Settings className="text-[#1982FC] mr-4" size={24} />
                <p className="text-gray-200">
                  Customize your Paddock20 dashboard experience and set up your default preferences
                  for weather and routes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weather Location Settings */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Weather Location Settings
                  </h3>
                  
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">
                          Primary Location
                        </label>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            name="primaryLocation"
                            value={locationSettings.primaryLocation}
                            onChange={handleLocationChange}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                            placeholder="City, State or ZIP Code"
                          />
                          <button 
                            onClick={handleDetectLocation}
                            className="flex-shrink-0 p-2 bg-[#1982FC]/20 hover:bg-[#1982FC]/30 rounded-md text-[#1982FC] transition-colors"
                            title="Use current location"
                          >
                            <Map size={18} />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-400">
                          This will be your default location for weather forecasts and driving conditions.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">
                          Units Preference
                        </label>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="units-imperial"
                              name="units"
                              value="imperial"
                              checked={locationSettings.units === 'imperial'}
                              onChange={handleLocationChange}
                              className="h-4 w-4 text-[#1982FC] focus:ring-[#1982FC] focus:ring-offset-gray-900"
                            />
                            <label htmlFor="units-imperial" className="text-sm text-gray-300">
                              Imperial (°F, mph)
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="units-metric"
                              name="units"
                              value="metric"
                              checked={locationSettings.units === 'metric'}
                              onChange={handleLocationChange}
                              className="h-4 w-4 text-[#1982FC] focus:ring-[#1982FC] focus:ring-offset-gray-900"
                            />
                            <label htmlFor="units-metric" className="text-sm text-gray-300">
                              Metric (°C, km/h)
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="checkbox"
                            id="autoRefresh"
                            name="autoRefresh"
                            checked={locationSettings.autoRefresh}
                            onChange={handleLocationCheckboxChange}
                            className="h-4 w-4 rounded text-[#1982FC] focus:ring-[#1982FC] focus:ring-offset-gray-900"
                          />
                          <label htmlFor="autoRefresh" className="text-sm text-gray-300">
                            Auto-refresh weather data when opening the app
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Favorite Routes & Commutes */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Favorite Routes & Commutes
                  </h3>
                  
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="space-y-4">
                      {routes.map((route, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 pb-3 border-b border-gray-700">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Route Name
                            </label>
                            <input
                              type="text"
                              value={route.name}
                              onChange={(e) => handleRouteChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                              placeholder="e.g. Mountain Drive, Commute to Work"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Start & End Points
                            </label>
                            <input
                              type="text"
                              value={route.points}
                              onChange={(e) => handleRouteChange(index, 'points', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                              placeholder="e.g. Home to Mountain Pass"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <button
                              onClick={() => removeRoute(index)}
                              className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 rounded-md text-red-400 transition-colors flex items-center"
                            >
                              <X size={16} className="mr-1" />
                              <span className="text-sm">Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={addNewRoute}
                        className="px-4 py-2 bg-[#1982FC]/20 hover:bg-[#1982FC]/30 rounded-md text-[#1982FC] transition-colors flex items-center"
                      >
                        <PlusCircle size={16} className="mr-2" />
                        <span>Add Another Route</span>
                      </button>
                      
                      <p className="text-sm text-gray-400 mt-2">
                        Add your favorite routes for quick access to weather conditions and navigation.
                        You can add more or edit these later.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Theme & Display Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Theme & Display
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Dashboard Theme
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className={`cursor-pointer rounded-lg p-3 border ${
                            dashboardPrefs.theme === 'dark'
                              ? 'border-[#1982FC] bg-[#1982FC]/10'
                              : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                          }`}
                          onClick={() => handleDashboardThemeChange('dark')}
                        >
                          <div className="h-16 rounded bg-gray-800 border border-gray-700 mb-2 flex items-center justify-center">
                            <span className="text-xs text-gray-400">Dark Carbon</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Dark</span>
                            {dashboardPrefs.theme === 'dark' && (
                              <Check size={16} className="text-[#1982FC]" />
                            )}
                          </div>
                        </div>
                        
                        <div 
                          className={`cursor-pointer rounded-lg p-3 border ${
                            dashboardPrefs.theme === 'darker'
                              ? 'border-[#1982FC] bg-[#1982FC]/10'
                              : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                          }`}
                          onClick={() => handleDashboardThemeChange('darker')}
                        >
                          <div className="h-16 rounded bg-black border border-gray-800 mb-2 flex items-center justify-center">
                            <span className="text-xs text-gray-500">Deep Black</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Darker</span>
                            {dashboardPrefs.theme === 'darker' && (
                              <Check size={16} className="text-[#1982FC]" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Temperature Display
                      </label>
                      <select
                        name="tempDisplay"
                        value={dashboardPrefs.tempDisplay}
                        onChange={handleDashboardPrefChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                      >
                        <option value="standard">Standard (Just Numbers)</option>
                        <option value="detailed">Detailed (With Description)</option>
                        <option value="compact">Compact (Minimal)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Module Visibility */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Dashboard Modules
                  </h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">
                      Select which modules to display on your dashboard:
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/70">
                        <div className="flex items-center">
                          <div className="bg-[#1982FC]/20 p-1 rounded mr-2">
                            <Cloud size={16} className="text-[#1982FC]" />
                          </div>
                          <label htmlFor="showWeather" className="text-sm text-gray-300 cursor-pointer">
                            Weather Paddock
                          </label>
                        </div>
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            id="showWeather"
                            name="showWeather"
                            checked={dashboardPrefs.showWeather}
                            onChange={handleDashboardPrefChange}
                            className="sr-only"
                          />
                          <div 
                            className={`w-10 h-5 rounded-full transition-colors ${
                              dashboardPrefs.showWeather ? 'bg-[#1982FC]' : 'bg-gray-600'
                            }`}
                          ></div>
                          <div 
                            className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                              dashboardPrefs.showWeather ? 'transform translate-x-5' : ''
                            }`}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/70">
                        <div className="flex items-center">
                          <div className="bg-[#1982FC]/20 p-1 rounded mr-2">
                            <Calendar size={16} className="text-[#1982FC]" />
                          </div>
                          <label htmlFor="showEvents" className="text-sm text-gray-300 cursor-pointer">
                            Events
                          </label>
                        </div>
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            id="showEvents"
                            name="showEvents"
                            checked={dashboardPrefs.showEvents}
                            onChange={handleDashboardPrefChange}
                            className="sr-only"
                          />
                          <div 
                            className={`w-10 h-5 rounded-full transition-colors ${
                              dashboardPrefs.showEvents ? 'bg-[#1982FC]' : 'bg-gray-600'
                            }`}
                          ></div>
                          <div 
                            className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                              dashboardPrefs.showEvents ? 'transform translate-x-5' : ''
                            }`}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/70">
                        <div className="flex items-center">
                          <div className="bg-[#1982FC]/20 p-1 rounded mr-2">
                            <Wrench size={16} className="text-[#1982FC]" />
                          </div>
                          <label htmlFor="showMaintenance" className="text-sm text-gray-300 cursor-pointer">
                            Maintenance Alerts
                          </label>
                        </div>
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            id="showMaintenance"
                            name="showMaintenance"
                            checked={dashboardPrefs.showMaintenance}
                            onChange={handleDashboardPrefChange}
                            className="sr-only"
                          />
                          <div 
                            className={`w-10 h-5 rounded-full transition-colors ${
                              dashboardPrefs.showMaintenance ? 'bg-[#1982FC]' : 'bg-gray-600'
                            }`}
                          ></div>
                          <div 
                            className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                              dashboardPrefs.showMaintenance ? 'transform translate-x-5' : ''
                            }`}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/70">
                        <div className="flex items-center">
                          <div className="bg-[#1982FC]/20 p-1 rounded mr-2">
                            <PaintBucket size={16} className="text-[#1982FC]" />
                          </div>
                          <label htmlFor="showJuiceBox" className="text-sm text-gray-300 cursor-pointer">
                            JuiceBox
                          </label>
                        </div>
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            id="showJuiceBox"
                            name="showJuiceBox"
                            checked={dashboardPrefs.showJuiceBox}
                            onChange={handleDashboardPrefChange}
                            className="sr-only"
                          />
                          <div 
                            className={`w-10 h-5 rounded-full transition-colors ${
                              dashboardPrefs.showJuiceBox ? 'bg-[#1982FC]' : 'bg-gray-600'
                            }`}
                          ></div>
                          <div 
                            className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                              dashboardPrefs.showJuiceBox ? 'transform translate-x-5' : ''
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center">
                  <X className="text-red-400 mr-2 flex-shrink-0" size={18} />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer with navigation buttons */}
        <div className="border-t border-gray-800 p-6 flex justify-between bg-gray-900/50">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <div></div> // Empty div to maintain layout
          )}
          
          <button 
            onClick={nextStep}
            disabled={step === 3 && !allAgreed}
            className={`px-7 py-2.5 rounded-full flex items-center font-medium ${
              step === 3 && !allAgreed 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#1982FC] to-[#7FC844] text-white hover:opacity-90 transition-opacity'
            }`}
            style={{
              boxShadow: step === 3 && !allAgreed ? 'none' : '0 0 15px rgba(25, 130, 252, 0.3)'
            }}
          >
            {step === 3 ? 'Accept & Continue' : 'Continue'} 
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
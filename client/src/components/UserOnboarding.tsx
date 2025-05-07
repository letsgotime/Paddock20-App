/**
 * ⚠️ BETA FILE PROTECTION ⚠️
 * 
 * WARNING: This file is part of the Beta Program core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the beta enrollment process.
 * 
 * Last verified: May 07, 2025
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Check, X, ChevronRight, AlertTriangle, Shield, Car, Trophy, Clock, 
  User, Settings, Map, Calendar, Gauge, Heart, ThumbsUp, 
  Activity, Zap, Wrench, Smartphone, Palette, UserPlus, Mail, Key,
  CircleDashed, Upload, Camera, FileText, PaintBucket, Cloud, PlusCircle,
  Trash2, Info
} from 'lucide-react';
import { handleDeclineTerms } from '../utils/accountUtils';
// Auth is passed as props instead of using the hook directly
// import { useAuth } from '@/hooks/useAuth';

interface UserOnboardingProps {
  onComplete: () => void;
  user: any; // Accept user directly from parent
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
  'Weather & Drive', 'Detailing & Maintenance', 'Automotive Community', 'Vehicle Performance'
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
const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, user }) => {
  // Use user prop directly instead of auth hook
  
  // Current step state (1-5)
  const [step, setStep] = useState(1);
  const [visibleStep, setVisibleStep] = useState(1);
  const [animateIn, setAnimateIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if profile and vehicle images have been uploaded
  const [hasUploadedProfilePic, setHasUploadedProfilePic] = useState(false);
  const [hasUploadedVehicleImage, setHasUploadedVehicleImage] = useState(false);
  
  // Beta role selection
  const [betaRole, setBetaRole] = useState<'user' | 'tester'>('user');
  
  // Legal agreement tracking
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    betaAgreement: false
  });
  
  // Track state for declining agreements and handling account deletion
  const [isDeclining, setIsDeclining] = useState(false);
  
  // User profile form state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
    drivingExperience: 'Intermediate',
    interests: [],
    bio: ''
  });
  
  // Vehicle profile form state
  const [vehicleProfile, setVehicleProfile] = useState<VehicleProfile>({
    make: '',
    model: '',
    year: '',
    engineType: 'Gasoline',
    transmissionType: 'Automatic',
    nickname: '',
    color: '',
    vehicleImage: '',
    mileage: '',
    purchaseDate: ''
  });
  
  // Dashboard preferences state
  const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPreferences>({
    theme: 'dark',
    showWeather: true,
    showEvents: true,
    showMaintenance: true,
    showJuiceBox: true,
    showGarageVault: true,
    showManifestationStation: true,
    primaryFocus: 'Weather & Drive',
    notificationSettings: true,
    tempDisplay: 'detailed'
  });
  
  // Location and route settings
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    primaryLocation: '',
    units: 'imperial',
    autoRefresh: true
  });
  
  // Saved routes/commutes
  const [routes, setRoutes] = useState<RouteInfo[]>([
    { name: '', points: '' }
  ]);
  
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

  // Handle declining terms and deleting account
  const handleDeclineAndDelete = async () => {
    setIsDeclining(true);
    setError(null);
    
    try {
      // Call the account deletion utility function
      await handleDeclineTerms('declined_terms_during_onboarding');
      
      // The utility function handles redirect, but we'll add a fallback
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    } catch (error) {
      console.error('Error deleting account after declining terms:', error);
      setError('Failed to process your request. Please try again.');
      setIsDeclining(false);
    }
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
      
      // Skip step 4 (profile creation) and go directly to step 6 (dashboard customization)
      if (step === 3 && allAgreed) {
        // Pre-populate minimal profile data to satisfy validation
        setUserProfile(prev => ({
          ...prev,
          fullName: prev.fullName || user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User',
          username: prev.username || user?.username || 'user',
          email: prev.email || user?.email || 'user@example.com',
          password: 'password123',  // These will never be used as Supabase handles auth
          confirmPassword: 'password123',
        }));
        
        // Set default vehicle info to satisfy validation
        setVehicleProfile(prev => ({
          ...prev,
          make: 'Default',
          model: 'Default',
          year: new Date().getFullYear().toString(),
        }));
        
        // Animate out
        setAnimateIn(false);
        
        // Short delay for animation then jump to step 5 (beta role selection)
        setTimeout(() => {
          setStep(5);
          setVisibleStep(5);
          setAnimateIn(true);
        }, 300);
        return;
      }
      
      // User profile validation
      if (step === 4) {
        if (!isUserProfileComplete()) {
          setError('Please complete all required fields before continuing');
          return;
        }
        
        if (userProfile.password !== userProfile.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
      }
      
      // Vehicle profile validation
      if (step === 5) {
        // No validation needed here, beta role selection is always valid
      }
      
      // Animate out
      setAnimateIn(false);
      
      // Short delay for animation
      setTimeout(() => {
        if (step < 5) {
          setStep(step + 1);
          setVisibleStep(step + 1);
        } else {
          // Process final submission
          handleFinalSubmit();
        }
        setAnimateIn(true);
      }, 300);
    } else {
      // Previous step (no validation needed)
      // Animate out
      setAnimateIn(false);
      
      // Short delay for animation
      setTimeout(() => {
        if (step > 1) {
          setStep(step - 1);
          setVisibleStep(step - 1);
        }
        setAnimateIn(true);
      }, 300);
    }
  };
  
  // Final submission handler
  const handleFinalSubmit = async () => {
    setError(null);
    
    try {
      // In a real app, this would submit all collected data
      console.log('Submitting user profile:', userProfile);
      console.log('Submitting vehicle profile:', vehicleProfile);
      console.log('Submitting beta role:', betaRole);
      
      // Simulate successful completion with a delay
      setTimeout(() => {
        // Call the onComplete callback
        onComplete();
      }, 800);
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
      setError('Failed to complete the setup. Please try again.');
    }
  };
  
  // Immediate submission without steps
  const handleSkipToComplete = async () => {
    setError(null);
    
    try {
      // Pre-populate minimal data to satisfy any validation
      setUserProfile(prev => ({
        ...prev,
        fullName: prev.fullName || user?.username || 'User',
        username: prev.username || user?.username || 'user',
        email: prev.email || user?.email || 'user@example.com',
        password: 'password123',  // These will never be used as Supabase handles auth
        confirmPassword: 'password123',
      }));
      
      // Set default vehicle info
      setVehicleProfile(prev => ({
        ...prev,
        make: 'Default',
        model: 'Default',
        year: new Date().getFullYear().toString(),
      }));
      
      // Simulate successful completion with a delay
      setTimeout(() => {
        // Call the onComplete callback
        onComplete();
      }, 800);
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      setError('Failed to complete the setup. Please try again.');
    }
  };
  
  // Get the step title based on the current step
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'WELCOME TO PADDOCK20';
      case 2:
        return 'GETTING STARTED';
      case 3:
        return 'LEGAL AGREEMENTS';
      case 4:
        return 'YOUR PROFILE';
      case 5:
        return 'CHOOSE YOUR BETA ROLE';
      default:
        return 'WELCOME TO PADDOCK20';
    }
  };
  
  // Render the component
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative">
        {/* Overlaid carbon fiber texture on all backgrounds */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ 
            backgroundImage: 'url("/assets/carbon-fiber-pattern.png")', 
            backgroundRepeat: 'repeat',
            backgroundSize: '200px'
          }}
        />
        
        {/* F1-inspired racing stripe elements */}
        <div className="absolute top-0 left-0 w-4 h-full bg-[#1982FC]" />
        <div className="absolute top-0 left-4 w-1 h-full bg-[#08c519]" />
        <div className="absolute top-0 right-0 w-1 h-full bg-[#08c519]" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1982FC]" />
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
          <Shield className="w-full h-full text-[#1982FC]" />
        </div>
        
        {/* Header */}
        <div className="bg-gray-900 px-8 pt-6 pb-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Car className="text-[#1982FC] h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold font-orbitron tracking-wider">
                <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span>
              </h1>
              <p className="text-gray-400 text-sm">
                The Ultimate Automotive Lifestyle Platform
              </p>
            </div>
          </div>
          
          <div className="text-gray-400 flex items-center">
            <CircleDashed className="animate-spin-slow mr-2 opacity-50" size={16} />
            <span className="text-xs uppercase font-semibold tracking-wider">
              Beta Access
            </span>
          </div>
        </div>
        
        {/* Step content */}
        <div className="p-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-white font-orbitron tracking-wide mb-4 md:mb-0">
              {getStepTitle()}
            </h2>
          </div>
          
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className={`space-y-6 ${animateIn ? 'animate-fadeIn' : 'animate-fadeOut'}`}>
              <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
                <div className="md:w-1/2 space-y-6">
                  <div className="bg-[#1982FC]/10 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-3 font-orbitron tracking-wide">
                      JOIN THE GRID
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Experience our bespoke, F1-inspired automotive app <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span>. 
                      Thoughtfully curated by each user for a personalized motorsport lifestyle experience.
                    </p>
                    <div className="flex items-center space-x-2 text-[#1982FC]">
                      <Trophy size={20} />
                      <span className="text-sm font-semibold">You are in the first wave of beta testers</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-[#1982FC]">
                      What to expect during setup:
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex items-center justify-center w-5 h-5 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Quick Legal Overview</h5>
                          <p className="text-gray-400 text-sm">Standard beta testing terms to protect your privacy</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex items-center justify-center w-5 h-5 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Personalized Profile Setup</h5>
                          <p className="text-gray-400 text-sm">Tell us about your automotive interests</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex items-center justify-center w-5 h-5 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Beta Role Selection</h5>
                          <p className="text-gray-400 text-sm">Choose how you'd like to participate in the beta program</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2 space-y-6">
                  <div 
                    className="h-48 rounded-lg overflow-hidden relative bg-cover bg-center"
                    style={{ backgroundImage: 'url("/assets/Stock Photos/dashboard-hero.jpg")' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-white font-bold text-lg">Revolutionary Design</h3>
                      <p className="text-gray-200 text-sm">
                        Inspired by F1 telemetry and supercar aesthetics
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center mb-2">
                        <PaintBucket className="text-[#1982FC] mr-2" size={18} />
                        <h5 className="text-white font-medium">Detailing Insights</h5>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Track your vehicle's appearance with JuiceBox, our advanced detailing module
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center mb-2">
                        <Cloud className="text-[#1982FC] mr-2" size={18} />
                        <h5 className="text-white font-medium">Weather Integration</h5>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Get precise automotive weather data for better driving decisions
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 md:col-span-2">
                      <div className="flex items-center mb-2">
                        <Zap className="text-[#08c519] mr-2" size={18} />
                        <h5 className="text-white font-medium">Premium Beta Access</h5>
                      </div>
                      <p className="text-gray-400 text-sm">
                        As a selected beta tester, you'll get first access to new features and premium modules as they're developed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Introduction */}
          {step === 2 && (
            <div className={`space-y-6 ${animateIn ? 'animate-fadeIn' : 'animate-fadeOut'}`}>
              <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
                <div className="md:w-1/2 space-y-6">
                  <div className="bg-[#1982FC]/10 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Shield className="text-[#1982FC] mr-3" size={24} />
                      <h3 className="text-xl font-bold text-white font-orbitron tracking-wide">
                        BETA PROGRAM DETAILS
                      </h3>
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> is a bespoke, F1-inspired automotive platform 
                      featuring personalized tools to elevate your motorsport lifestyle.
                    </p>
                    
                    <p className="text-gray-300 mb-4">
                      As a beta participant, you'll help shape the future of the platform through your 
                      feedback and usage patterns.
                    </p>
                    
                    <div className="flex items-center space-x-2 text-[#08c519]">
                      <Clock size={20} />
                      <span className="text-sm font-semibold">Expected Beta duration: TBD</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-[#1982FC]">
                      What you'll get access to:
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex items-center justify-center w-5 h-5 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Weather Paddock</h5>
                          <p className="text-gray-400 text-sm">Advanced weather intelligence for car care and driving</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex items-center justify-center w-5 h-5 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Garage Vault</h5>
                          <p className="text-gray-400 text-sm">Comprehensive vehicle management and history tracking</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex items-center justify-center w-5 h-5 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">JuiceBox</h5>
                          <p className="text-gray-400 text-sm">Revolutionary detailing and appearance management</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex items-center justify-center w-5 h-5 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Manifestation Station</h5>
                          <p className="text-gray-400 text-sm">Goal setting and progress tracking for your automotive dreams</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2 space-y-6">
                  <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-semibold text-[#1982FC] mb-4">
                      Beta Participant Options
                    </h4>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      You may apply to become a Beta Tester at any time, but we have limited space in the program available.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="mt-1 mr-4 flex items-center justify-center w-8 h-8 bg-gray-700 text-[#1982FC] rounded-full flex-shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <h5 className="text-white font-medium mb-1">Basic Beta User</h5>
                          <p className="text-gray-400 text-sm mb-2">
                            Experience the platform with minimal commitment. Perfect for casual users.
                          </p>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li className="flex items-center">
                              <Check size={14} className="text-[#08c519] mr-2 flex-shrink-0" />
                              <span>Early access to all features</span>
                            </li>
                            <li className="flex items-center">
                              <Check size={14} className="text-[#08c519] mr-2 flex-shrink-0" />
                              <span>Occasional feedback requests</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-4 flex items-center justify-center w-8 h-8 bg-[#1982FC]/20 text-[#1982FC] rounded-full flex-shrink-0">
                          <Trophy size={18} />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h5 className="text-white font-medium">Active Beta Tester</h5>
                            <span className="ml-2 px-2 py-0.5 bg-[#1982FC]/20 text-[#1982FC] text-xs rounded-full">Recommended</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            Help shape the platform's future through active participation and feedback.
                          </p>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li className="flex items-center">
                              <Check size={14} className="text-[#08c519] mr-2 flex-shrink-0" />
                              <span>Everything in Basic Beta User</span>
                            </li>
                            <li className="flex items-center">
                              <Check size={14} className="text-[#08c519] mr-2 flex-shrink-0" />
                              <span>Prioritized feature requests</span>
                            </li>
                            <li className="flex items-center">
                              <Check size={14} className="text-[#08c519] mr-2 flex-shrink-0" />
                              <span>Direct access to developers</span>
                            </li>
                            <li className="flex items-center">
                              <Check size={14} className="text-[#08c519] mr-2 flex-shrink-0" />
                              <span>Early access to premium features</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/80 p-5 rounded-lg border border-gray-700">
                    <div className="flex items-start">
                      <AlertTriangle className="text-[#1982FC] mr-3 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <h5 className="text-white font-medium mb-1">Important Notice</h5>
                        <p className="text-gray-400 text-sm">
                          As a beta tester, you understand the platform is still under development.
                          Some features may change or be unavailable during certain periods.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Legal agreements */}
          {step === 3 && (
            <div className={`space-y-6 ${animateIn ? 'animate-fadeIn' : 'animate-fadeOut'}`}>
              <div className="bg-[#1982FC]/10 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <Shield className="text-[#1982FC] mr-4" size={24} />
                  <p className="text-gray-200">
                    Please review and accept the following agreements to proceed with the beta program.
                    These agreements protect both your rights and the platform's intellectual property.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Terms of Service Agreement */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                      <h3 className="text-white font-medium flex items-center">
                        <FileText className="text-[#1982FC] mr-2" size={18} />
                        Terms of Service
                      </h3>
                      <div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="termsOfService"
                            checked={agreements.termsOfService}
                            onChange={() => handleAgreementChange('termsOfService')}
                            className="h-4 w-4 text-[#1982FC] focus:ring-[#1982FC] rounded"
                          />
                          <label htmlFor="termsOfService" className="ml-2 text-sm text-gray-300">
                            I Accept
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-900 h-60 overflow-y-auto text-sm">
                      <div className="prose prose-sm prose-invert">
                        <h4><span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> Beta Terms of Service</h4>
                        <p>Last Updated: May 5, 2025</p>
                        
                        <p>
                          Welcome to the <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> Beta Program. By participating in our beta testing, 
                          you agree to these Terms of Service ("Terms").
                        </p>
                        
                        <h5>1. Beta Access</h5>
                        <p>
                          <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> provides access to its beta platform for testing purposes only. 
                          We make no guarantees regarding availability, performance, or feature completion.
                          Features may change, be removed, or be unavailable during the beta period.
                        </p>
                        
                        <h5>2. User Accounts</h5>
                        <p>
                          You are responsible for maintaining the confidentiality of your account 
                          information and for all activities that occur under your account. You must 
                          provide accurate information when creating your account.
                        </p>
                        
                        <h5>3. Feedback</h5>
                        <p>
                          By providing feedback, suggestions, or ideas about <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span>, you grant us a 
                          non-exclusive, worldwide, royalty-free license to use and incorporate your 
                          feedback into our services without any obligation to compensate you.
                        </p>
                        
                        <h5>4. Data Usage</h5>
                        <p>
                          We collect usage data to improve the platform. This includes feature usage, 
                          performance metrics, and crash reports. See our Privacy Policy for details.
                        </p>
                        
                        <h5>5. Acceptable Use</h5>
                        <p>
                          You agree not to:
                        </p>
                        <ul>
                          <li>Use the service for any illegal purpose</li>
                          <li>Attempt to gain unauthorized access to any part of the service</li>
                          <li>Interfere with or disrupt the service</li>
                          <li>Share your beta access with unauthorized users</li>
                        </ul>
                        
                        <h5>6. Termination</h5>
                        <p>
                          We reserve the right to terminate or suspend your access to the beta at any 
                          time, with or without cause, and without prior notice.
                        </p>
                        
                        <h5>7. Disclaimer of Warranties</h5>
                        <p>
                          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY 
                          KIND. WE EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR 
                          STATUTORY.
                        </p>
                        
                        <h5>8. Limitation of Liability</h5>
                        <p>
                          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> BE LIABLE 
                          FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES.
                        </p>
                      </div>
                    </div>
                  </div>
                
                  {/* Privacy Policy Agreement */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                      <h3 className="text-white font-medium flex items-center">
                        <Shield className="text-[#1982FC] mr-2" size={18} />
                        Privacy Policy
                      </h3>
                      <div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="privacyPolicy"
                            checked={agreements.privacyPolicy}
                            onChange={() => handleAgreementChange('privacyPolicy')}
                            className="h-4 w-4 text-[#1982FC] focus:ring-[#1982FC] rounded"
                          />
                          <label htmlFor="privacyPolicy" className="ml-2 text-sm text-gray-300">
                            I Accept
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-900 h-60 overflow-y-auto text-sm">
                      <div className="prose prose-sm prose-invert">
                        <h4><span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> Privacy Policy</h4>
                        <p>Last Updated: May 5, 2025</p>
                        
                        <p>
                          This Privacy Policy explains how <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> ("we", "our", or "us") collects, 
                          uses, and shares your information when you participate in our beta program.
                        </p>
                        
                        <h5>1. Information We Collect</h5>
                        <p>
                          <strong>Account Information:</strong> When you register, we collect your name, 
                          email address, and login credentials.
                        </p>
                        <p>
                          <strong>Profile Information:</strong> Information you provide in your profile, 
                          including your automotive interests, vehicles, and preferences.
                        </p>
                        <p>
                          <strong>Vehicle Information:</strong> Details about your vehicles, including 
                          make, model, year, and maintenance history.
                        </p>
                        <p>
                          <strong>Usage Data:</strong> Information about how you use our service, including 
                          features accessed, actions taken, and time spent.
                        </p>
                        <p>
                          <strong>Device Information:</strong> Data about your device, IP address, 
                          browser type, and operating system.
                        </p>
                        <p>
                          <strong>Location Information:</strong> With your consent, we collect your 
                          location to provide weather and route-specific features.
                        </p>
                        
                        <h5>2. How We Use Your Information</h5>
                        <p>
                          We use the information we collect to:
                        </p>
                        <ul>
                          <li>Provide, maintain, and improve the PADDOCK20 platform</li>
                          <li>Process and complete transactions</li>
                          <li>Monitor and analyze trends, usage, and activities</li>
                          <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
                          <li>Communicate with you about the beta program, updates, and feedback requests</li>
                        </ul>
                        
                        <h5>3. Sharing Your Information</h5>
                        <p>
                          We do not sell your personal information. We may share your information:
                        </p>
                        <ul>
                          <li>With service providers who perform services on our behalf</li>
                          <li>If required by law or to protect rights and safety</li>
                          <li>In connection with a business transaction such as a merger or acquisition</li>
                          <li>With your consent</li>
                        </ul>
                        
                        <h5>4. Data Security</h5>
                        <p>
                          We implement reasonable security measures to protect your information. 
                          However, no method of transmission or storage is 100% secure.
                        </p>
                        
                        <h5>5. Data Retention</h5>
                        <p>
                          We retain your information for as long as necessary to provide the beta 
                          service and fulfill the purposes outlined in this Privacy Policy.
                        </p>
                        
                        <h5>6. Your Rights</h5>
                        <p>
                          Depending on your location, you may have rights regarding your personal 
                          information, including the right to access, correct, delete, or export your data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Beta Agreement */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                      <h3 className="text-white font-medium flex items-center">
                        <Key className="text-[#1982FC] mr-2" size={18} />
                        Beta Testing Agreement
                      </h3>
                      <div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="betaAgreement"
                            checked={agreements.betaAgreement}
                            onChange={() => handleAgreementChange('betaAgreement')}
                            className="h-4 w-4 text-[#1982FC] focus:ring-[#1982FC] rounded"
                          />
                          <label htmlFor="betaAgreement" className="ml-2 text-sm text-gray-300">
                            I Accept
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-900 h-60 overflow-y-auto text-sm">
                      <div className="prose prose-sm prose-invert">
                        <h4><span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> Beta Testing Agreement</h4>
                        <p>Last Updated: May 5, 2025</p>
                        
                        <p>
                          This Beta Testing Agreement ("Agreement") governs your participation in the 
                          <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span> beta testing program.
                        </p>
                        
                        <h5>1. Beta Period</h5>
                        <p>
                          The beta testing period is expected to last approximately 3 months but may 
                          be extended or shortened at our discretion. You will be notified when the 
                          beta period ends.
                        </p>
                        
                        <h5>2. Confidentiality</h5>
                        <p>
                          As a beta tester, you may have access to confidential information, including 
                          unreleased features, designs, and plans. You agree to:
                        </p>
                        <ul>
                          <li>Keep all confidential information strictly confidential</li>
                          <li>Not share screenshots, videos, or details about the beta without permission</li>
                          <li>Not use confidential information for any purpose other than testing</li>
                        </ul>
                        
                        <h5>3. Feedback</h5>
                        <p>
                          Your feedback is valuable to us. By participating in the beta, you agree to:
                        </p>
                        <ul>
                          <li>Provide honest and constructive feedback about your experience</li>
                          <li>Report any bugs, errors, or issues you encounter</li>
                          <li>Respond to surveys or questionnaires about your testing experience</li>
                          <li>Participate in feedback sessions if requested</li>
                        </ul>
                        
                        <h5>4. Beta Tester Roles</h5>
                        <p>
                          Basic Beta Users: Will have access to all features and may provide feedback at their discretion.
                        </p>
                        <p>
                          Active Beta Testers: Will have additional responsibilities including regular feedback 
                          submission and participation in testing sessions.
                        </p>
                        
                        <h5>5. Data Collection</h5>
                        <p>
                          During the beta, we will collect additional data about your usage of the platform, 
                          including:
                        </p>
                        <ul>
                          <li>Feature usage statistics</li>
                          <li>Performance metrics</li>
                          <li>Error logs and crash reports</li>
                          <li>User journey analytics</li>
                        </ul>
                        <p>
                          This data helps us improve the platform and identify issues.
                        </p>
                        
                        <h5>6. No Compensation</h5>
                        <p>
                          Participation in the beta program is voluntary and without compensation. 
                          The benefits you receive are early access to the platform and the opportunity 
                          to help shape its development.
                        </p>
                        
                        <h5>7. Termination</h5>
                        <p>
                          We may terminate your participation in the beta program at any time if you 
                          violate this Agreement, the Terms of Service, or for any other reason at our 
                          discretion.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-800/80 p-5 rounded-lg border border-gray-700">
                      <div className="flex items-center mb-3">
                        <Shield className="text-[#1982FC] mr-3" size={20} />
                        <h4 className="text-white font-medium">Data Security Commitment</h4>
                      </div>
                      <p className="text-gray-400 text-sm">
                        We take your privacy and data security seriously. Your personal information, 
                        vehicle details, and usage data are protected using industry-standard security 
                        measures, including encryption and secure access controls.
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/80 p-5 rounded-lg border border-gray-700">
                      <div className="flex items-start">
                        <Mail className="text-[#1982FC] mr-3 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <h4 className="text-white font-medium mb-1">Contact Information</h4>
                          <p className="text-gray-400 text-sm">
                            If you have any questions about these agreements or the beta program, 
                            please contact us at <span className="text-[#1982FC]">beta@gotimemotorsports.com</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center mt-4">
                  <X className="text-red-400 mr-2 flex-shrink-0" size={18} />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
              
              {/* Decline option */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsDeclining(true)}
                  className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                  disabled={isDeclining}
                >
                  {isDeclining ? (
                    <span className="flex items-center">
                      <CircleDashed className="animate-spin mr-2" size={14} />
                      Processing...
                    </span>
                  ) : (
                    "I do not accept these terms"
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: User Profile Setup */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-[#1982FC]/10 p-4 rounded-lg mb-6">
                <User className="text-[#1982FC] mr-4" size={24} />
                <p className="text-gray-200">
                  Tell us about yourself and your automotive interests. This helps us personalize your 
                  PADDOCK20 experience.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center justify-center p-6 border border-gray-700 rounded-lg bg-gray-800/30">
                  <div 
                    className="w-32 h-32 mb-4 rounded-full bg-gray-700 flex items-center justify-center border-2 border-[#1982FC]/50 overflow-hidden"
                  >
                    {hasUploadedProfilePic ? (
                      <img 
                        src={userProfile.profileImage || '/assets/Stock Photos/default-avatar.png'} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={60} className="text-gray-500" />
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleProfileImageUpload}
                    className="px-4 py-2 bg-[#1982FC]/20 hover:bg-[#1982FC]/30 rounded-md text-[#1982FC] transition-colors flex items-center"
                  >
                    <Upload size={18} className="mr-2" />
                    <span>{hasUploadedProfilePic ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                </div>
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={userProfile.fullName}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Enter your full name"
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
                        value={userProfile.username}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Choose a username"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={userProfile.email}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Account Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Account Security
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={userProfile.password}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Create a password"
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
                        value={userProfile.confirmPassword}
                        onChange={handleUserProfileChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-2">
                    <div className="flex items-center text-gray-400 text-xs">
                      <Shield size={14} className="mr-2 text-[#1982FC]" />
                      <span>Your data is protected with industry-standard encryption</span>
                    </div>
                  </div>
                </div>
                
                {/* Automotive Interests */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#1982FC] mb-2 font-orbitron">
                    Automotive Interests
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select your interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableInterests.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            userProfile.interests.includes(interest)
                              ? 'bg-[#1982FC] text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
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
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                      Bio (Optional)
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={userProfile.bio}
                      onChange={handleUserProfileChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-[#1982FC] focus:border-[#1982FC]"
                      placeholder="Tell us about yourself and your automotive passion..."
                    />
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
          
          {/* Beta Role Selection */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-[#1982FC]/10 p-4 rounded-lg mb-6">
                <User className="text-[#1982FC] mr-4" size={24} />
                <p className="text-gray-200">
                  Choose your level of participation in the Paddock20 beta program. Your role will determine how you
                  can contribute to shaping the platform.
                </p>
              </div>
              
              <div className="flex flex-col space-y-8">
                <div className="text-center mb-2">
                  <h3 className="text-xl font-bold text-white tracking-wide mb-4">
                    Select Your Beta Participation Level
                  </h3>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Choose how you'd like to contribute to the Paddock20 beta program. You can change this selection later.
                  </p>
                </div>
                
                {/* Beta Role Cards */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Beta User Card */}
                  <div 
                    className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer 
                      ${betaRole === 'user' 
                        ? 'border-[#1982FC] bg-[#1982FC]/10' 
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'}
                    `}
                    onClick={() => setBetaRole('user')}
                  >
                    <div className="absolute top-4 right-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center 
                        ${betaRole === 'user' ? 'bg-[#1982FC]' : 'bg-gray-700'}
                      `}>
                        {betaRole === 'user' && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-4 p-3 rounded-full bg-[#1982FC]/20">
                        <User size={24} className="text-[#1982FC]" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-white mb-2">
                          Beta User
                        </h4>
                        
                        <p className="text-gray-300 mb-4">
                          Experience Paddock20 early and provide occasional feedback on your experience. 
                          Perfect for enthusiasts who want to try the platform with minimal commitment.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Early access to all features</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Occasional feedback requests</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Basic bug reporting</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">No additional commitments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Beta Tester Card */}
                  <div 
                    className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer 
                      ${betaRole === 'tester' 
                        ? 'border-[#1982FC] bg-[#1982FC]/10' 
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'}
                    `}
                    onClick={() => setBetaRole('tester')}
                  >
                    <div className="absolute top-4 right-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center 
                        ${betaRole === 'tester' ? 'bg-[#1982FC]' : 'bg-gray-700'}
                      `}>
                        {betaRole === 'tester' && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-4 p-3 rounded-full bg-[#1982FC]/20">
                        <Trophy size={24} className="text-[#1982FC]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-xl font-semibold text-white">
                            Beta Tester
                          </h4>
                          <span className="ml-2 px-2 py-0.5 text-xs bg-[#1982FC]/20 text-[#1982FC] rounded-full">
                            Recommended
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mb-4">
                          Actively contribute to shaping Paddock20's future by participating in focused testing 
                          sessions, providing detailed feedback, and getting direct access to the development team.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">All Beta User benefits</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Priority feature access</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Exclusive testing sessions</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Direct developer communication</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Beta Tester recognition</span>
                          </div>
                          
                          <div className="flex items-start">
                            <Check size={16} className="mt-1 mr-2 text-[#08c519]" />
                            <span className="text-gray-300 text-sm">Early access to premium features</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-2">
                  <div className="flex justify-center">
                    <div className="flex items-center bg-gray-800/50 py-2 px-3 rounded-lg">
                      <Info size={16} className="text-[#1982FC] mr-2" />
                      <span className="text-gray-300 text-sm">
                        Beta Tester spots are limited and require active participation. Inactive testers may be moved to Beta User status.
                      </span>
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
              type="button"
              onClick={() => handleStepTransition('prev')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors flex items-center"
            >
              <ChevronRight className="rotate-180 mr-2" size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div></div> // Empty div to maintain flex spacing
          )}
          
          <div className="flex items-center space-x-4">
            {/* "Skip to Completion" button removed as requested */}
            
            <button
              type="button"
              onClick={() => handleStepTransition('next')}
              className={`px-6 py-2 ${
                step === 5
                  ? 'bg-[#08c519] hover:bg-[#08c519]/90'
                  : 'bg-[#1982FC] hover:bg-[#1982FC]/90'
              } rounded-md text-white transition-colors flex items-center`}
            >
              <span>{step === 5 ? 'Complete Setup' : 'Continue'}</span>
              <ChevronRight className={step === 5 ? 'hidden' : 'ml-2'} size={16} />
              {step === 5 && <Check className="ml-2" size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
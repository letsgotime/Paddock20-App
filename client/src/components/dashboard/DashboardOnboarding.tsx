import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Car, User, Camera, ChevronLeft, ChevronRight, 
  Upload, Check, AlertCircle, ArrowRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { decodeVIN, validateVIN } from '@/services/vinDecoderService';

interface OnboardingUserProfile {
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string;
  bio: string;
  prefersDarkMode: boolean;
  allowNotifications: boolean;
}

interface OnboardingVehicleProfile {
  make: string;
  model: string;
  year: string;
  trim: string;
  color: string;
  nickname: string;
  vin: string;
  licensePlate: string;
  purchaseDate: string;
  useVIN: boolean;
  profileImage: string;
}

interface TireManagementProfile {
  currentTires: {
    brand: string;
    model: string;
    type: string;
    size: string;
    purchaseDate: string;
    treadDepth: string;
    pressureFront: string;
    pressureRear: string;
    notes: string;
  };
  preferredBrands: string[];
}

interface DreamGarageProfile {
  dreamCars: Array<{
    make: string;
    model: string;
    year: string;
    notes: string;
  }>;
}

interface LockerRoomProfile {
  size: string; // Small, Medium, Large
  storageNeeds: string[];
  tools: string[];
  detailingSupplies: string[];
}

interface SpotifyProfile {
  connected: boolean;
  favoritePlaylist: string;
  drivingPlaylist: string;
  detailingPlaylist: string;
}

enum Step {
  Welcome = 0,
  UserProfile = 1,
  VehicleBasics = 2,
  VehicleDetails = 3,
  TireManagement = 4,
  DreamGarage = 5,
  LockerRoom = 6,
  SpotifyIntegration = 7,
  PreferenceSettings = 8,
  Complete = 9,
}

const DashboardOnboarding: React.FC<{
  onComplete: () => void;
  onSkip: () => void;
}> = ({ onComplete, onSkip }) => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  
  // State management
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingVIN, setIsProcessingVIN] = useState(false);
  const [profileUploadProgress, setProfileUploadProgress] = useState(0);
  const [vehicleUploadProgress, setVehicleUploadProgress] = useState(0);
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  
  // Form data
  const [userProfile, setUserProfile] = useState<OnboardingUserProfile>({
    firstName: user?.given_name || '',
    lastName: user?.family_name || '',
    username: user?.nickname || '',
    profileImage: user?.picture || '',
    bio: '',
    prefersDarkMode: true,
    allowNotifications: true,
  });
  
  const [vehicleProfile, setVehicleProfile] = useState<OnboardingVehicleProfile>({
    make: '',
    model: '',
    year: '',
    trim: '',
    color: '',
    nickname: '',
    vin: '',
    licensePlate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    useVIN: false,
    profileImage: '',
  });
  
  // Additional profiles for the new features
  const [tireProfile, setTireProfile] = useState<TireManagementProfile>({
    currentTires: {
      brand: '',
      model: '',
      type: '',
      size: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      treadDepth: '',
      pressureFront: '',
      pressureRear: '',
      notes: '',
    },
    preferredBrands: []
  });
  
  const [dreamGarageProfile, setDreamGarageProfile] = useState<DreamGarageProfile>({
    dreamCars: [{ make: '', model: '', year: '', notes: '' }]
  });
  
  const [lockerRoomProfile, setLockerRoomProfile] = useState<LockerRoomProfile>({
    size: 'Medium',
    storageNeeds: [],
    tools: [],
    detailingSupplies: []
  });
  
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile>({
    connected: false,
    favoritePlaylist: '',
    drivingPlaylist: '',
    detailingPlaylist: ''
  });
  
  // Handle input changes for user profile
  const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle input changes for vehicle profile
  const handleVehicleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVehicleProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle toggle for using VIN
  const handleToggleUseVIN = () => {
    setVehicleProfile(prev => ({
      ...prev,
      useVIN: !prev.useVIN
    }));
  };
  
  // Handle tire profile changes
  const handleTireProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('currentTires.')) {
      const tireProp = name.split('.')[1];
      setTireProfile(prev => ({
        ...prev,
        currentTires: {
          ...prev.currentTires,
          [tireProp]: value
        }
      }));
    } else {
      setTireProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle preferred tire brands
  const handleAddPreferredBrand = (brand: string) => {
    if (brand.trim() === '') return;
    setTireProfile(prev => ({
      ...prev,
      preferredBrands: [...prev.preferredBrands, brand.trim()]
    }));
  };
  
  const handleRemovePreferredBrand = (index: number) => {
    setTireProfile(prev => ({
      ...prev,
      preferredBrands: prev.preferredBrands.filter((_, i) => i !== index)
    }));
  };
  
  // Handle tire profile changes
  const handleTireProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('currentTires.')) {
      const tireProp = name.split('.')[1];
      setTireProfile(prev => ({
        ...prev,
        currentTires: {
          ...prev.currentTires,
          [tireProp]: value
        }
      }));
    } else {
      setTireProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle dream garage changes
  const handleDreamCarChange = (index: number, field: string, value: string) => {
    setDreamGarageProfile(prev => {
      const updatedCars = [...prev.dreamCars];
      updatedCars[index] = {
        ...updatedCars[index],
        [field]: value
      };
      return {
        ...prev,
        dreamCars: updatedCars
      };
    });
  };
  
  const handleAddDreamCar = () => {
    setDreamGarageProfile(prev => ({
      ...prev,
      dreamCars: [...prev.dreamCars, { make: '', model: '', year: '', notes: '' }]
    }));
  };
  
  const handleRemoveDreamCar = (index: number) => {
    if (dreamGarageProfile.dreamCars.length <= 1) return;
    setDreamGarageProfile(prev => ({
      ...prev,
      dreamCars: prev.dreamCars.filter((_, i) => i !== index)
    }));
  };
  
  // Handle locker room changes
  const handleLockerRoomSizeChange = (size: string) => {
    setLockerRoomProfile(prev => ({
      ...prev,
      size
    }));
  };
  
  const handleAddStorageItem = (category: 'storageNeeds' | 'tools' | 'detailingSupplies', item: string) => {
    if (item.trim() === '') return;
    setLockerRoomProfile(prev => ({
      ...prev,
      [category]: [...prev[category], item.trim()]
    }));
  };
  
  const handleRemoveStorageItem = (category: 'storageNeeds' | 'tools' | 'detailingSupplies', index: number) => {
    setLockerRoomProfile(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };
  
  // Handle Spotify profile changes
  const handleSpotifyProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSpotifyProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleConnectSpotify = async () => {
    setIsConnectingSpotify(true);
    
    // Simulate connecting to Spotify API
    toast({
      title: 'Spotify Connection',
      description: 'This would connect to the Spotify API in the production version.',
      variant: 'default',
    });
    
    // Simulate successful connection after 2 seconds
    setTimeout(() => {
      setSpotifyProfile(prev => ({
        ...prev,
        connected: true
      }));
      setIsConnectingSpotify(false);
      
      toast({
        title: 'Spotify Connected',
        description: 'Successfully connected to Spotify (simulation)',
        variant: 'default',
      });
    }, 2000);
  };
  
  // Handle VIN lookup
  const handleVINLookup = async () => {
    if (!vehicleProfile.vin || vehicleProfile.vin.length !== 17) {
      toast({
        title: 'Invalid VIN',
        description: 'Please enter a valid 17-character VIN',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateVIN(vehicleProfile.vin)) {
      toast({
        title: 'Invalid VIN Format',
        description: 'The VIN format appears to be incorrect',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessingVIN(true);
    
    try {
      const decodedInfo = await decodeVIN(vehicleProfile.vin);
      
      if (decodedInfo) {
        setVehicleProfile(prev => ({
          ...prev,
          make: decodedInfo.make || prev.make,
          model: decodedInfo.model || prev.model,
          year: decodedInfo.year?.toString() || prev.year,
          trim: decodedInfo.trim || prev.trim,
        }));
        
        toast({
          title: 'VIN Decoded Successfully',
          description: `Found: ${decodedInfo.year} ${decodedInfo.make} ${decodedInfo.model}`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'VIN Lookup Failed',
          description: 'Could not decode this VIN. Please enter vehicle details manually.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('VIN lookup error:', error);
      toast({
        title: 'VIN Lookup Error',
        description: 'An error occurred while looking up the VIN',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingVIN(false);
    }
  };
  
  // Handle profile image upload
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Mock progress for better UX
    const interval = setInterval(() => {
      setProfileUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 50);
    
    // Simulate upload completion after 1.5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setProfileUploadProgress(100);
      
      // Create a blob URL for the image
      const imageUrl = URL.createObjectURL(file);
      setUserProfile(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
      
      // Reset progress after showing 100% briefly
      setTimeout(() => setProfileUploadProgress(0), 500);
    }, 1500);
  };
  
  // Handle vehicle image upload
  const handleVehicleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Mock progress for better UX
    const interval = setInterval(() => {
      setVehicleUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 50);
    
    // Simulate upload completion after 1.5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setVehicleUploadProgress(100);
      
      // Create a blob URL for the image
      const imageUrl = URL.createObjectURL(file);
      setVehicleProfile(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
      
      // Reset progress after showing 100% briefly
      setTimeout(() => setVehicleUploadProgress(0), 500);
    }, 1500);
  };
  
  // Save all data to server and localStorage
  const handleSaveAllData = async () => {
    setIsSubmitting(true);
    
    try {
      const token = await getAccessTokenSilently();
      
      // Save user profile
      const userResponse = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          username: userProfile.username,
          profileImage: userProfile.profileImage,
          bio: userProfile.bio,
        }),
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to save user profile');
      }
      
      // Save preferences
      const prefsResponse = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prefersDarkMode: userProfile.prefersDarkMode,
          allowNotifications: userProfile.allowNotifications,
          // Add Spotify preferences
          spotifyConnected: spotifyProfile.connected,
          spotifyFavoritePlaylist: spotifyProfile.favoritePlaylist,
          spotifyDrivingPlaylist: spotifyProfile.drivingPlaylist,
          spotifyDetailingPlaylist: spotifyProfile.detailingPlaylist,
        }),
      });
      
      if (!prefsResponse.ok) {
        throw new Error('Failed to save preferences');
      }
      
      // Save vehicle data
      const vehicleResponse = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          make: vehicleProfile.make,
          model: vehicleProfile.model,
          year: parseInt(vehicleProfile.year, 10),
          trim: vehicleProfile.trim,
          color: vehicleProfile.color,
          nickname: vehicleProfile.nickname,
          vin: vehicleProfile.vin,
          license_plate: vehicleProfile.licensePlate,
          purchase_date: vehicleProfile.purchaseDate,
          image_url: vehicleProfile.profileImage,
        }),
      });
      
      if (!vehicleResponse.ok) {
        throw new Error('Failed to save vehicle data');
      }
      
      const vehicleData = await vehicleResponse.json();
      
      // Save tire data for the vehicle
      try {
        const tireResponse = await fetch('/api/tires', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            vehicleId: vehicleData.id,
            brand: tireProfile.currentTires.brand,
            model: tireProfile.currentTires.model,
            type: tireProfile.currentTires.type,
            size: tireProfile.currentTires.size,
            date_installed: tireProfile.currentTires.purchaseDate,
            tread_depth: parseFloat(tireProfile.currentTires.treadDepth) || null,
            pressure_front: parseFloat(tireProfile.currentTires.pressureFront) || null,
            pressure_rear: parseFloat(tireProfile.currentTires.pressureRear) || null,
            notes: tireProfile.currentTires.notes,
            preferred_brands: tireProfile.preferredBrands,
          }),
        });
        
        if (!tireResponse.ok) {
          console.warn('Failed to save tire data, but continuing');
        }
      } catch (err) {
        console.warn('Error saving tire data:', err);
        // Continue even if this fails
      }
      
      // Save dream garage data
      try {
        const dreamGarageResponse = await fetch('/api/dream-garage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user?.sub,
            dreamCars: dreamGarageProfile.dreamCars.map(car => ({
              make: car.make,
              model: car.model,
              year: car.year ? parseInt(car.year, 10) : null,
              notes: car.notes,
            }))
          }),
        });
        
        if (!dreamGarageResponse.ok) {
          console.warn('Failed to save dream garage data, but continuing');
        }
      } catch (err) {
        console.warn('Error saving dream garage data:', err);
        // Continue even if this fails
      }
      
      // Save locker room data
      try {
        const lockerRoomResponse = await fetch('/api/locker-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user?.sub,
            size: lockerRoomProfile.size,
            storageNeeds: lockerRoomProfile.storageNeeds,
            tools: lockerRoomProfile.tools,
            detailingSupplies: lockerRoomProfile.detailingSupplies,
          }),
        });
        
        if (!lockerRoomResponse.ok) {
          console.warn('Failed to save locker room data, but continuing');
        }
      } catch (err) {
        console.warn('Error saving locker room data:', err);
        // Continue even if this fails
      }
      
      // Save successful
      toast({
        title: 'Setup Complete',
        description: 'Your profile and vehicle have been saved successfully!',
        variant: 'default',
      });
      
      // Save to localStorage as backup
      localStorage.setItem('userPreferences', JSON.stringify({
        prefersDarkMode: userProfile.prefersDarkMode,
        allowNotifications: userProfile.allowNotifications,
        spotifyConnected: spotifyProfile.connected,
      }));
      
      localStorage.setItem('currentVehicle', JSON.stringify({
        id: vehicleData.id,
        make: vehicleProfile.make,
        model: vehicleProfile.model,
        year: vehicleProfile.year,
        nickname: vehicleProfile.nickname,
      }));
      
      // Save additional data to localStorage as backup
      localStorage.setItem('tirePreferences', JSON.stringify({
        preferredBrands: tireProfile.preferredBrands,
      }));
      
      localStorage.setItem('spotifyPreferences', JSON.stringify({
        connected: spotifyProfile.connected,
        favoritePlaylist: spotifyProfile.favoritePlaylist,
        drivingPlaylist: spotifyProfile.drivingPlaylist,
      }));
      
      // Mark onboarding as complete
      const userId = user?.sub?.split('|')[1] || '0';
      localStorage.setItem(`paddock20_onboarding_complete_${userId}`, 'true');
      
      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: 'Save Error',
        description: error instanceof Error ? error.message : 'Failed to save your information',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigate to next step
  const handleNext = () => {
    setCurrentStep(prev => {
      const nextStep = prev + 1;
      return nextStep <= Step.Complete ? nextStep : prev;
    });
    window.scrollTo(0, 0);
  };
  
  // Navigate to previous step
  const handlePrevious = () => {
    setCurrentStep(prev => {
      const prevStep = prev - 1;
      return prevStep >= Step.Welcome ? prevStep : prev;
    });
    window.scrollTo(0, 0);
  };
  
  // Render welcome page
  const renderWelcomePage = () => (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold text-[#1982FC]">Welcome to Paddock<span className="text-[#08c519]">20</span></h2>
      <p className="text-lg text-gray-300">Let's set up your profile and add your first vehicle to get started.</p>
      
      <div className="flex justify-center mt-8">
        <img src="/assets/dashboard-preview.png" alt="Dashboard Preview" className="rounded-lg shadow-lg max-w-full max-h-[300px]" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <Button 
          variant="outline" 
          onClick={onSkip}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Skip for Now
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render user profile form
  const renderUserProfileForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Your Driver Profile</h2>
      <p className="text-gray-300 mb-6">Tell us about yourself to personalize your Paddock20 experience.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#1982FC]">
            {userProfile.profileImage ? (
              <img 
                src={userProfile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="w-full max-w-xs">
            <Label htmlFor="profileImage">Profile Photo</Label>
            <div className="mt-1 relative">
              <Input
                id="profileImage"
                type="file"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById('profileImage')?.click()}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              
              {profileUploadProgress > 0 && (
                <div className="mt-2">
                  <Progress value={profileUploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={userProfile.firstName}
            onChange={handleUserProfileChange}
            placeholder="Your first name"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={userProfile.lastName}
            onChange={handleUserProfileChange}
            placeholder="Your last name"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Label htmlFor="username">Username (displayed to others)</Label>
          <Input
            id="username"
            name="username"
            value={userProfile.username}
            onChange={handleUserProfileChange}
            placeholder="Your preferred username"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Label htmlFor="bio">Bio (optional)</Label>
          <Textarea
            id="bio"
            name="bio"
            value={userProfile.bio}
            onChange={handleUserProfileChange}
            placeholder="Tell us about yourself and your automotive interests"
            className="bg-gray-800 border-gray-700 text-white h-24"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render vehicle basics form with VIN toggle
  const renderVehicleBasicsForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Vehicle Information</h2>
      <p className="text-gray-300 mb-6">Let's add your first vehicle to your Garage Vault.</p>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 p-2 bg-[#1982FC]/20 rounded-full">
              <Car className="h-5 w-5 text-[#1982FC]" />
            </div>
            <div>
              <h3 className="font-medium text-white">Use VIN for Auto-Fill</h3>
              <p className="text-sm text-gray-400">Save time by letting us look up your vehicle details</p>
            </div>
          </div>
          <Switch
            checked={vehicleProfile.useVIN}
            onCheckedChange={handleToggleUseVIN}
          />
        </div>
        
        {vehicleProfile.useVIN && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
            <div className="flex mt-1 gap-2">
              <Input
                id="vin"
                name="vin"
                value={vehicleProfile.vin}
                onChange={handleVehicleProfileChange}
                placeholder="Enter 17-character VIN"
                className="bg-gray-800 border-gray-700 text-white flex-grow"
                maxLength={17}
              />
              <Button
                type="button"
                onClick={handleVINLookup}
                disabled={isProcessingVIN || !vehicleProfile.vin || vehicleProfile.vin.length !== 17}
                className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white whitespace-nowrap"
              >
                {isProcessingVIN ? (
                  <>
                    <ChevronRight className="mr-2 h-4 w-4 animate-spin" />
                    Looking Up...
                  </>
                ) : (
                  'Decode VIN'
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Found on your vehicle registration, insurance card, or driver's door jamb
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="make">
            Make {!vehicleProfile.useVIN && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="make"
            name="make"
            value={vehicleProfile.make}
            onChange={handleVehicleProfileChange}
            placeholder="e.g. Toyota, Ford, BMW"
            className="bg-gray-800 border-gray-700 text-white"
            readOnly={vehicleProfile.useVIN && !!vehicleProfile.make}
          />
        </div>
        
        <div>
          <Label htmlFor="model">
            Model {!vehicleProfile.useVIN && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="model"
            name="model"
            value={vehicleProfile.model}
            onChange={handleVehicleProfileChange}
            placeholder="e.g. Camry, Mustang, X5"
            className="bg-gray-800 border-gray-700 text-white"
            readOnly={vehicleProfile.useVIN && !!vehicleProfile.model}
          />
        </div>
        
        <div>
          <Label htmlFor="year">
            Year {!vehicleProfile.useVIN && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="year"
            name="year"
            value={vehicleProfile.year}
            onChange={handleVehicleProfileChange}
            placeholder="e.g. 2022"
            className="bg-gray-800 border-gray-700 text-white"
            readOnly={vehicleProfile.useVIN && !!vehicleProfile.year}
          />
        </div>
        
        <div>
          <Label htmlFor="trim">Trim (optional)</Label>
          <Input
            id="trim"
            name="trim"
            value={vehicleProfile.trim}
            onChange={handleVehicleProfileChange}
            placeholder="e.g. Sport, Limited, M"
            className="bg-gray-800 border-gray-700 text-white"
            readOnly={vehicleProfile.useVIN && !!vehicleProfile.trim}
          />
        </div>
        
        <div>
          <Label htmlFor="nickname">Vehicle Nickname (optional)</Label>
          <Input
            id="nickname"
            name="nickname"
            value={vehicleProfile.nickname}
            onChange={handleVehicleProfileChange}
            placeholder="Give your vehicle a name"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="color">Color (optional)</Label>
          <Input
            id="color"
            name="color"
            value={vehicleProfile.color}
            onChange={handleVehicleProfileChange}
            placeholder="e.g. Red, Silver, Black"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
          disabled={!vehicleProfile.make || !vehicleProfile.model || !vehicleProfile.year}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render vehicle details form
  const renderVehicleDetailsForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Vehicle Details</h2>
      <p className="text-gray-300 mb-6">Add more details about your {vehicleProfile.year} {vehicleProfile.make} {vehicleProfile.model}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-4">
          <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-[#1982FC]">
            {vehicleProfile.profileImage ? (
              <img 
                src={vehicleProfile.profileImage} 
                alt="Vehicle" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Car className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="w-full max-w-xs">
            <Label htmlFor="vehicleImage">Vehicle Photo</Label>
            <div className="mt-1 relative">
              <Input
                id="vehicleImage"
                type="file"
                onChange={handleVehicleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => document.getElementById('vehicleImage')?.click()}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
              
              {vehicleUploadProgress > 0 && (
                <div className="mt-2">
                  <Progress value={vehicleUploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="licensePlate">License Plate (optional)</Label>
          <Input
            id="licensePlate"
            name="licensePlate"
            value={vehicleProfile.licensePlate}
            onChange={handleVehicleProfileChange}
            placeholder="License plate number"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="purchaseDate">Purchase Date (optional)</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            value={vehicleProfile.purchaseDate}
            onChange={handleVehicleProfileChange}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render preferences form
  // Render tire management form
  const renderTireManagementForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Tire Management</h2>
      <p className="text-gray-300 mb-6">Keep track of your tires and optimize performance for every drive.</p>
      
      <Card className="bg-gray-900 border-gray-700 p-5">
        <h3 className="text-xl font-semibold text-white mb-4">Current Tires</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="tires-brand">Brand</Label>
            <Input
              id="tires-brand"
              name="currentTires.brand"
              value={tireProfile.currentTires.brand}
              onChange={handleTireProfileChange}
              placeholder="e.g., Michelin, Bridgestone"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="tires-model">Model</Label>
            <Input
              id="tires-model"
              name="currentTires.model"
              value={tireProfile.currentTires.model}
              onChange={handleTireProfileChange}
              placeholder="e.g., Pilot Sport 4S, Potenza"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="tires-type">Type</Label>
            <select
              id="tires-type"
              name="currentTires.type"
              value={tireProfile.currentTires.type}
              onChange={handleTireProfileChange}
              className="w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
            >
              <option value="">Select type</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="All-Season">All-Season</option>
              <option value="Track">Track</option>
              <option value="All-Terrain">All-Terrain</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="tires-size">Size</Label>
            <Input
              id="tires-size"
              name="currentTires.size"
              value={tireProfile.currentTires.size}
              onChange={handleTireProfileChange}
              placeholder="e.g., 245/40R18"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="tires-purchase-date">Date Installed</Label>
            <Input
              id="tires-purchase-date"
              name="currentTires.purchaseDate"
              type="date"
              value={tireProfile.currentTires.purchaseDate}
              onChange={handleTireProfileChange}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="tires-tread-depth">Tread Depth (mm)</Label>
            <Input
              id="tires-tread-depth"
              name="currentTires.treadDepth"
              value={tireProfile.currentTires.treadDepth}
              onChange={handleTireProfileChange}
              placeholder="e.g., 7.5"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="tires-pressure-front">Front Pressure (PSI)</Label>
            <Input
              id="tires-pressure-front"
              name="currentTires.pressureFront"
              value={tireProfile.currentTires.pressureFront}
              onChange={handleTireProfileChange}
              placeholder="e.g., 32"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="tires-pressure-rear">Rear Pressure (PSI)</Label>
            <Input
              id="tires-pressure-rear"
              name="currentTires.pressureRear"
              value={tireProfile.currentTires.pressureRear}
              onChange={handleTireProfileChange}
              placeholder="e.g., 30"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="tires-notes">Notes</Label>
            <Textarea
              id="tires-notes"
              name="currentTires.notes"
              value={tireProfile.currentTires.notes}
              onChange={handleTireProfileChange}
              placeholder="Any additional notes about your tires"
              className="bg-gray-800 border-gray-700 text-white h-24"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-medium text-white mb-3">Tire Brand Recommendations</h4>
          <p className="text-gray-400 text-sm mb-3">For future reference, select trusted tire brands for your vehicle.</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tireProfile.preferredBrands.map((brand, index) => (
              <div 
                key={index} 
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center"
              >
                {brand}
                <button 
                  type="button" 
                  onClick={() => handleRemovePreferredBrand(index)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              id="new-brand"
              placeholder="Add a preferred brand"
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPreferredBrand((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                const input = document.getElementById('new-brand') as HTMLInputElement;
                handleAddPreferredBrand(input.value);
                input.value = '';
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Add
            </Button>
          </div>
          
          <div className="mt-4 text-gray-400 text-sm">
            <p>Popular brands: <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddPreferredBrand('Michelin')}>Michelin</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddPreferredBrand('Bridgestone')}>Bridgestone</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddPreferredBrand('Pirelli')}>Pirelli</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddPreferredBrand('Continental')}>Continental</button></p>
          </div>
        </div>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render dream garage form
  const renderDreamGarageForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Dream Garage</h2>
      <p className="text-gray-300 mb-6">Build your dream collection of vehicles you aspire to own.</p>
      
      <Card className="bg-gray-900 border-gray-700 p-5">
        <h3 className="text-xl font-semibold text-white mb-4">Your Dream Cars</h3>
        <p className="text-gray-400 text-sm mb-5">Add vehicles to your wish list and track their availability and market trends.</p>
        
        {dreamGarageProfile.dreamCars.map((car, index) => (
          <div key={index} className="mb-8 border-b border-gray-800 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">Dream Car #{index + 1}</h4>
              {dreamGarageProfile.dreamCars.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDreamCar(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  Remove
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`dream-make-${index}`}>Make</Label>
                <Input
                  id={`dream-make-${index}`}
                  value={car.make}
                  onChange={(e) => handleDreamCarChange(index, 'make', e.target.value)}
                  placeholder="e.g., Porsche, Ferrari"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor={`dream-model-${index}`}>Model</Label>
                <Input
                  id={`dream-model-${index}`}
                  value={car.model}
                  onChange={(e) => handleDreamCarChange(index, 'model', e.target.value)}
                  placeholder="e.g., 911 GT3, F8 Tributo"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor={`dream-year-${index}`}>Year</Label>
                <Input
                  id={`dream-year-${index}`}
                  value={car.year}
                  onChange={(e) => handleDreamCarChange(index, 'year', e.target.value)}
                  placeholder="e.g., 2023"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="md:col-span-3">
                <Label htmlFor={`dream-notes-${index}`}>Notes</Label>
                <Textarea
                  id={`dream-notes-${index}`}
                  value={car.notes}
                  onChange={(e) => handleDreamCarChange(index, 'notes', e.target.value)}
                  placeholder="Why you want this car, preferred spec, target budget..."
                  className="bg-gray-800 border-gray-700 text-white h-20"
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          onClick={handleAddDreamCar}
          variant="outline"
          className="w-full mt-2 border-gray-700 text-[#1982FC] hover:bg-gray-800"
        >
          + Add Another Dream Car
        </Button>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render locker room form
  const renderLockerRoomForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Locker Room</h2>
      <p className="text-gray-300 mb-6">Organize your automotive maintenance and detailing supplies.</p>
      
      <Card className="bg-gray-900 border-gray-700 p-5">
        <h3 className="text-xl font-semibold text-white mb-4">Storage Configuration</h3>
        
        <div className="mb-6">
          <Label className="text-white mb-2 block">Storage Size</Label>
          <div className="flex flex-wrap gap-3">
            {['Small', 'Medium', 'Large'].map((size) => (
              <Button
                key={size}
                type="button"
                variant={lockerRoomProfile.size === size ? "default" : "outline"}
                className={lockerRoomProfile.size === size 
                  ? "bg-[#1982FC] hover:bg-[#1982FC]/80" 
                  : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"}
                onClick={() => handleLockerRoomSizeChange(size)}
              >
                {size}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Select the size that best represents your available storage space for automotive supplies.
          </p>
        </div>
        
        <div className="mb-6">
          <Label className="text-white mb-3 block">Storage Needs</Label>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {lockerRoomProfile.storageNeeds.map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center"
              >
                {item}
                <button 
                  type="button" 
                  onClick={() => handleRemoveStorageItem('storageNeeds', index)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              id="new-storage-need"
              placeholder="Add storage need"
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddStorageItem('storageNeeds', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                const input = document.getElementById('new-storage-need') as HTMLInputElement;
                handleAddStorageItem('storageNeeds', input.value);
                input.value = '';
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Add
            </Button>
          </div>
          
          <div className="mt-2 text-gray-400 text-sm">
            <p>Common needs: <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('storageNeeds', 'Shelving')}>Shelving</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('storageNeeds', 'Cabinets')}>Cabinets</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('storageNeeds', 'Drawers')}>Drawers</button></p>
          </div>
        </div>
        
        <div className="mb-6">
          <Label className="text-white mb-3 block">Tools Inventory</Label>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {lockerRoomProfile.tools.map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center"
              >
                {item}
                <button 
                  type="button" 
                  onClick={() => handleRemoveStorageItem('tools', index)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              id="new-tool"
              placeholder="Add tool"
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddStorageItem('tools', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                const input = document.getElementById('new-tool') as HTMLInputElement;
                handleAddStorageItem('tools', input.value);
                input.value = '';
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Add
            </Button>
          </div>
          
          <div className="mt-2 text-gray-400 text-sm">
            <p>Common tools: <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('tools', 'Socket Set')}>Socket Set</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('tools', 'Jack')}>Jack</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('tools', 'Torque Wrench')}>Torque Wrench</button></p>
          </div>
        </div>
        
        <div>
          <Label className="text-white mb-3 block">Detailing Supplies</Label>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {lockerRoomProfile.detailingSupplies.map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center"
              >
                {item}
                <button 
                  type="button" 
                  onClick={() => handleRemoveStorageItem('detailingSupplies', index)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              id="new-detail-supply"
              placeholder="Add detailing supply"
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddStorageItem('detailingSupplies', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                const input = document.getElementById('new-detail-supply') as HTMLInputElement;
                handleAddStorageItem('detailingSupplies', input.value);
                input.value = '';
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Add
            </Button>
          </div>
          
          <div className="mt-2 text-gray-400 text-sm">
            <p>Common supplies: <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('detailingSupplies', 'Wax')}>Wax</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('detailingSupplies', 'Microfiber Towels')}>Microfiber Towels</button>, <button type="button" className="text-[#1982FC] hover:underline" onClick={() => handleAddStorageItem('detailingSupplies', 'Polisher')}>Polisher</button></p>
          </div>
        </div>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render Spotify integration form
  const renderSpotifyIntegrationForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Spotify Integration</h2>
      <p className="text-gray-300 mb-6">Connect your Spotify account to enhance your automotive experience with personalized music.</p>
      
      <Card className="bg-gray-900 border-gray-700 p-5">
        <div className="text-center mb-8">
          {!spotifyProfile.connected ? (
            <>
              <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.841-.12-.961-.54-.122-.421.119-.842.54-.962 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your Spotify Account</h3>
              <p className="text-gray-400 mb-6">Link your Spotify account to create custom playlists for driving and detailing.</p>
              
              <Button
                type="button"
                onClick={handleConnectSpotify}
                disabled={isConnectingSpotify}
                className="bg-[#1DB954] hover:bg-[#1DB954]/80 text-white font-bold py-3 px-8 rounded-full"
              >
                {isConnectingSpotify ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect with Spotify"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Spotify Connected!</h3>
              <p className="text-gray-400 mb-6">Your account has been successfully linked to Paddock20.</p>
            </>
          )}
        </div>
        
        {spotifyProfile.connected && (
          <div className="space-y-6 mt-6">
            <div>
              <Label htmlFor="favorite-playlist">Favorite Playlist URL</Label>
              <Input
                id="favorite-playlist"
                name="favoritePlaylist"
                value={spotifyProfile.favoritePlaylist}
                onChange={handleSpotifyProfileChange}
                placeholder="Paste your favorite playlist URL"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">This will be your default playlist in the app.</p>
            </div>
            
            <div>
              <Label htmlFor="driving-playlist">Driving Playlist URL</Label>
              <Input
                id="driving-playlist"
                name="drivingPlaylist"
                value={spotifyProfile.drivingPlaylist}
                onChange={handleSpotifyProfileChange}
                placeholder="Paste a playlist for driving"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">This will automatically play when you start a drive session.</p>
            </div>
            
            <div>
              <Label htmlFor="detailing-playlist">Detailing Playlist URL</Label>
              <Input
                id="detailing-playlist"
                name="detailingPlaylist"
                value={spotifyProfile.detailingPlaylist}
                onChange={handleSpotifyProfileChange}
                placeholder="Paste a playlist for detailing sessions"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">This will be suggested during detailing sessions.</p>
            </div>
          </div>
        )}
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderPreferencesForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1982FC] mb-4">Preferences</h2>
      <p className="text-gray-300 mb-6">Set up your preferences for a better experience.</p>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="darkMode">Dark Mode</Label>
            <p className="text-sm text-gray-400">Use dark theme by default</p>
          </div>
          <Switch
            id="darkMode"
            checked={userProfile.prefersDarkMode}
            onCheckedChange={(checked) => 
              setUserProfile(prev => ({ ...prev, prefersDarkMode: checked }))
            }
          />
        </div>
        
        <Separator className="my-4 bg-gray-700" />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Notifications</Label>
            <p className="text-sm text-gray-400">Receive maintenance reminders and alerts</p>
          </div>
          <Switch
            id="notifications"
            checked={userProfile.allowNotifications}
            onCheckedChange={(checked) => 
              setUserProfile(prev => ({ ...prev, allowNotifications: checked }))
            }
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  // Render completion page
  const renderCompletionPage = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-[#08c519]/20 p-6">
          <Check className="h-16 w-16 text-[#08c519]" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-white">You're All Set!</h2>
      <p className="text-lg text-gray-300">Your profile and {vehicleProfile.make} {vehicleProfile.model} are ready for the Paddock20 experience.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#1982FC] mb-3">Driver Profile</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                {userProfile.profileImage ? (
                  <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 m-3 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                <p className="text-gray-400 text-sm">@{userProfile.username}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#1982FC] mb-3">Vehicle</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
                {vehicleProfile.profileImage ? (
                  <img src={vehicleProfile.profileImage} alt="Vehicle" className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-6 h-6 m-3 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {vehicleProfile.year} {vehicleProfile.make} {vehicleProfile.model}
                </p>
                {vehicleProfile.nickname && (
                  <p className="text-gray-400 text-sm">"{vehicleProfile.nickname}"</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={handleSaveAllData}
          disabled={isSubmitting}
          className="bg-[#08c519] hover:bg-[#08c519]/80 text-white font-bold text-lg px-8 py-6 h-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Start Using Paddock20
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
  
  // Render appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case Step.Welcome:
        return renderWelcomePage();
      case Step.UserProfile:
        return renderUserProfileForm();
      case Step.VehicleBasics:
        return renderVehicleBasicsForm();
      case Step.VehicleDetails:
        return renderVehicleDetailsForm();
      case Step.TireManagement:
        return renderTireManagementForm();
      case Step.DreamGarage:
        return renderDreamGarageForm();
      case Step.LockerRoom:
        return renderLockerRoomForm();
      case Step.SpotifyIntegration:
        return renderSpotifyIntegrationForm();
      case Step.PreferenceSettings:
        return renderPreferencesForm();
      case Step.Complete:
        return renderCompletionPage();
      default:
        return renderWelcomePage();
    }
  };
  
  // Render progress indicator
  const renderProgressIndicator = () => {
    if (currentStep === Step.Welcome || currentStep === Step.Complete) {
      return null;
    }
    
    const totalSteps = Step.Complete - 1;
    const currentPosition = currentStep >= Step.Complete ? totalSteps : currentStep;
    const progressPercentage = (currentPosition / totalSteps) * 100;
    
    return (
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Profile</span>
          <span>Vehicle</span>
          <span>Details</span>
          <span>Tires</span>
          <span>Dream Garage</span>
          <span>Locker Room</span>
          <span>Spotify</span>
          <span>Preferences</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1982FC] transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {renderProgressIndicator()}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default DashboardOnboarding;
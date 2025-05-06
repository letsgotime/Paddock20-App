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

enum Step {
  Welcome = 0,
  UserProfile = 1,
  VehicleBasics = 2,
  VehicleDetails = 3,
  PreferenceSettings = 4,
  Complete = 5,
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
      }));
      
      localStorage.setItem('currentVehicle', JSON.stringify({
        id: vehicleData.id,
        make: vehicleProfile.make,
        model: vehicleProfile.model,
        year: vehicleProfile.year,
        nickname: vehicleProfile.nickname,
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
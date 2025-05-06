import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useVehicle } from '../../contexts/VehicleContext';
// Import types needed for typescript type checking
import type { UserProfileType } from '../../types/userTypes';
import type { VehicleType } from '../../types/vehicleTypes';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const auth = useAuth();
  const { userProfile, updateProfile } = useUserProfile();
  const { addVehicle } = useVehicle();
  
  // Current step tracking
  const [currentTab, setCurrentTab] = useState('personal');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // User profile form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('beginner');
  const [interests, setInterests] = useState<string[]>([]);
  const [dreamCar, setDreamCar] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  // Vehicle form state
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleNickname, setVehicleNickname] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');
  const [vehicleVin, setVehicleVin] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [engineType, setEngineType] = useState('');
  const [transmissionType, setTransmissionType] = useState('');
  const [vehicleMods, setVehicleMods] = useState('');
  const [tireDetails, setTireDetails] = useState('');
  
  // Preferences form state
  const [location, setLocation] = useState('');
  const [units, setUnits] = useState('imperial');
  const [theme, setTheme] = useState('dark');
  
  // Initialize form with existing data if available
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      
      // Set other fields if they exist in the user profile
      if (userProfile.preferences) {
        setExperience(userProfile.preferences.experience || 'beginner');
        setInterests(userProfile.preferences.interests || []);
        setDreamCar(userProfile.preferences.dreamCar || '');
        setTheme(userProfile.preferences.theme || 'dark');
        setUnits(userProfile.preferences.units || 'imperial');
      }
      
      setProfileImage(userProfile.profileImageUrl || '');
    }
  }, [userProfile]);
  
  // Check if username is already taken
  const checkUsername = async (username: string) => {
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      
      // If username is taken and it's not by the current user
      if (data.taken && (!userProfile || data.userId !== userProfile.id)) {
        setUsernameError('This username is already taken');
        return false;
      } else {
        setUsernameError('');
        return true;
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('');
      return true; // Assume it's okay if check fails
    }
  };
  
  // Handle interest selection toggle
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };
  
  // Handle form submission for user profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    const usernameValid = await checkUsername(username);
    if (!usernameValid) return;
    
    // Update user profile
    if (updateProfile) {
      // Ensure we pass a properly typed object to the updateProfile function
      const updatedProfile = {
        ...userProfile, // Maintain existing profile data
        username,
        displayName,
        bio,
        preferences: {
          ...userProfile?.preferences,
          experience,
          interests,
          dreamCar,
          theme,
          units
        },
        profileImageUrl: profileImage
      };
      updateProfile(updatedProfile);
    }
    
    // Move to next tab
    setCurrentTab('vehicle');
  };
  
  // Handle form submission for vehicle
  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add vehicle
    if (addVehicle && auth.user?.id) {
      // Create a vehicle data object that conforms to the Vehicle type
      // Note: id, createdAt and updatedAt will be added by the backend
      const vehicleData = {
        make: vehicleMake,
        model: vehicleModel,
        year: parseInt(vehicleYear),
        color: vehicleColor,
        nickname: vehicleNickname,
        mileage: vehicleMileage ? parseInt(vehicleMileage) : undefined,
        vin: vehicleVin,
        type: vehicleType, // map vehicleType to type property
        engine_type: engineType, // map to snake_case as needed
        transmission_type: transmissionType, // map to snake_case as needed
        modifications: vehicleMods,
        tire_details: tireDetails, // map to snake_case as needed
        user_id: auth.user.id // map userId to user_id
      };
      
      // Pass the data to addVehicle which will handle the type conversion
      await addVehicle(vehicleData as any);
    }
    
    // Move to preferences tab
    setCurrentTab('preferences');
  };
  
  // Handle form submission for preferences
  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update user preferences
    if (updateProfile) {
      updateProfile({
        ...userProfile,
        preferences: {
          ...userProfile?.preferences,
          location,
          units,
          theme
        }
      });
    }
    
    // Mark as submitted
    setFormSubmitted(true);
    
    // Complete onboarding after a delay to show success message
    setTimeout(() => {
      onComplete();
    }, 2000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg max-w-3xl w-full p-6 relative mx-auto my-8 animate-fadeIn">
        {/* Close button */}
        {!formSubmitted && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white" 
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-orbitron text-blue-400 mb-1">Complete Your Profile</h2>
          <p className="text-gray-300">Tell us about yourself and your ride to personalize your Paddock20 experience.</p>
        </div>
        
        {formSubmitted ? (
          // Success message
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gotime-green/20 mb-4">
              <CheckCircle2 className="h-8 w-8 text-gotime-green" />
            </div>
            <h3 className="text-xl font-orbitron text-gotime-green mb-2">You're All Set!</h3>
            <p className="text-gray-300 mb-6">Your profile has been successfully created and you're ready to explore Paddock20.</p>
          </div>
        ) : (
          // Tabs for the multi-step form
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            {/* Personal Info Tab */}
            <TabsContent value="personal">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Choose a unique username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={usernameError ? "border-red-500" : ""}
                  />
                  {usernameError && (
                    <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    placeholder="Your name as shown to others" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself and your automotive interests" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Driving Experience</Label>
                  <RadioGroup value={experience} onValueChange={setExperience} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner">Beginner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate">Intermediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced">Advanced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Interests (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Car Shows', 'Track Days', 'Off-Roading', 'Detailing', 'Modifications', 'Racing', 'Restoration', 'Road Trips'].map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={interest.replace(/\s+/g, '-').toLowerCase()}
                          checked={interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          className="rounded text-carolina-blue focus:ring-carolina-blue"
                        />
                        <Label htmlFor={interest.replace(/\s+/g, '-').toLowerCase()}>{interest}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dreamCar">Dream Car</Label>
                  <Input 
                    id="dreamCar" 
                    placeholder="What's your dream car?" 
                    value={dreamCar}
                    onChange={(e) => setDreamCar(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image URL</Label>
                  <Input 
                    id="profileImage" 
                    placeholder="https://example.com/your-image.jpg" 
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Continue to Vehicle Info
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            {/* Vehicle Tab */}
            <TabsContent value="vehicle">
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Make</Label>
                    <Input 
                      id="vehicleMake" 
                      placeholder="e.g. Toyota" 
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Model</Label>
                    <Input 
                      id="vehicleModel" 
                      placeholder="e.g. Supra" 
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Year</Label>
                    <Input 
                      id="vehicleYear" 
                      placeholder="e.g. 2023" 
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value.replace(/\D/g, ''))}
                      type="number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor">Color</Label>
                    <Input 
                      id="vehicleColor" 
                      placeholder="e.g. Phantom Black" 
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleNickname">Nickname</Label>
                    <Input 
                      id="vehicleNickname" 
                      placeholder="e.g. The Beast" 
                      value={vehicleNickname}
                      onChange={(e) => setVehicleNickname(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMileage">Mileage</Label>
                    <Input 
                      id="vehicleMileage" 
                      placeholder="e.g. 15000" 
                      value={vehicleMileage}
                      onChange={(e) => setVehicleMileage(e.target.value.replace(/\D/g, ''))}
                      type="number"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleVin">VIN (Vehicle Identification Number)</Label>
                  <Input 
                    id="vehicleVin" 
                    placeholder="e.g. 1HGBH41JXMN109186" 
                    value={vehicleVin}
                    onChange={(e) => setVehicleVin(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engineType">Engine Type</Label>
                    <Input 
                      id="engineType" 
                      placeholder="e.g. V6 Turbo" 
                      value={engineType}
                      onChange={(e) => setEngineType(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transmissionType">Transmission</Label>
                    <Select value={transmissionType} onValueChange={setTransmissionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="dct">Dual-Clutch (DCT)</SelectItem>
                        <SelectItem value="cvt">CVT</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleMods">Modifications</Label>
                  <Textarea 
                    id="vehicleMods" 
                    placeholder="List any modifications you've made to your vehicle" 
                    value={vehicleMods}
                    onChange={(e) => setVehicleMods(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tireDetails">Tire Details</Label>
                  <Textarea 
                    id="tireDetails" 
                    placeholder="Current tire brand, size, and type" 
                    value={tireDetails}
                    onChange={(e) => setTireDetails(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Continue to Preferences
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <form onSubmit={handlePreferencesSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. Nashville, TN" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="units">Measurement Units</Label>
                  <Select value={units} onValueChange={setUnits}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imperial">Imperial (mph, °F)</SelectItem>
                      <SelectItem value="metric">Metric (km/h, °C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme Preference</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark (Default)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="system">Match System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Alert className="bg-blue-900/20 border-blue-900/30 mt-6">
                  <AlertDescription>
                    You can always update these preferences and add more vehicles later in your profile settings.
                  </AlertDescription>
                </Alert>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Complete Setup
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
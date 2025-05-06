import React, { useState } from 'react';
import { 
  X, Car, User, Check, Camera, UploadCloud, Sliders, MapPin, 
  Shirt, ShoppingBag, Ruler, BookOpen, Trophy, Search, Key
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useVehicle } from '../../contexts/VehicleContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// Constants for dropdowns and selections
const carManufacturers = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
  'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat',
  'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep',
  'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati',
  'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Porsche',
  'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

const engineTypes = [
  'Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Hydrogen Fuel Cell'
];

const transmissionTypes = [
  'Automatic', 'Manual', 'Dual-Clutch', 'CVT', 'Semi-Automatic'
];

const availableInterests = [
  'Track Driving', 'Auto Detailing', 'Car Shows', 'Motorsport', 'Modifications',
  'Classic Cars', 'Supercars', 'Off-roading', 'Restoration', 'Performance Tuning',
  'Automotive Photography', 'Rally Racing', 'F1', 'NASCAR', 'Drift Racing'
];

const helmetSizes = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL'
];

const gloveSizes = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL'
];

const shoeSizes = [
  '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'
];

const tireBrands = [
  'Michelin', 'Bridgestone', 'Continental', 'Pirelli', 'Goodyear', 'Yokohama',
  'Hankook', 'Toyo', 'Nitto', 'Falken', 'BFGoodrich', 'Dunlop', 'Firestone'
];

// Defining step interfaces for strong typing
interface UserProfileStep {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  drivingExperience: string;
  interests: string[];
  dreamGarage: string;
  helmetSize: string;
  gloveSize: string;
  shoeSize: string;
  profileImage: string | null;
  usernameChecked: boolean;
  usernameAvailable: boolean;
}

interface VehicleStep {
  useVinDecoder: boolean;
  vin: string;
  make: string;
  model: string;
  year: string;
  color: string;
  nickname: string;
  engineType: string;
  transmissionType: string;
  mileage: string;
  currentMods: string;
  tireModel: string;
  tireSize: string;
  tireDate: string;
  tireMileage: string;
  vehicleImage: string | null;
}

interface PreferencesStep {
  primaryLocation: string;
  units: 'imperial' | 'metric';
  theme: 'dark' | 'darker';
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const auth = useAuth();
  const { updateUserProfile } = useUserProfile();
  const { addVehicle } = useVehicle();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('fade-in');
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Initialize with data from Auth0 if available
  const [userProfileData, setUserProfileData] = useState<UserProfileStep>({
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    displayName: auth.user?.username || '',
    bio: '',
    drivingExperience: 'Intermediate',
    interests: [],
    dreamGarage: '',
    helmetSize: 'M',
    gloveSize: 'M',
    shoeSize: '10',
    profileImage: null,
    usernameChecked: false,
    usernameAvailable: true
  });

  const [vehicleData, setVehicleData] = useState<VehicleStep>({
    useVinDecoder: false,
    vin: '',
    make: '',
    model: '',
    year: '',
    color: '',
    nickname: '',
    engineType: 'Gasoline',
    transmissionType: 'Automatic',
    mileage: '',
    currentMods: '',
    tireModel: '',
    tireSize: '',
    tireDate: '',
    tireMileage: '',
    vehicleImage: null
  });

  const [preferencesData, setPreferencesData] = useState<PreferencesStep>({
    primaryLocation: '',
    units: 'imperial',
    theme: 'dark',
  });

  // Validation functions
  const isUserProfileComplete = () => {
    return userProfileData.firstName.trim() !== '' && 
           userProfileData.lastName.trim() !== '' && 
           userProfileData.displayName.trim() !== '' &&
           userProfileData.usernameAvailable;
  };

  const isVehicleProfileComplete = () => {
    if (vehicleData.useVinDecoder) {
      return vehicleData.vin.trim() !== '';
    }
    return vehicleData.make.trim() !== '' && 
           vehicleData.model.trim() !== '' && 
           vehicleData.year.trim() !== '';
  };

  // Update handlers
  const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'displayName') {
      setUserProfileData(prev => ({ 
        ...prev, 
        [name]: value,
        usernameChecked: false,
        usernameAvailable: true
      }));
    } else {
      setUserProfileData(prev => ({ ...prev, [name]: value }));
    }
    
    setError(null);
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferencesData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const toggleInterest = (interest: string) => {
    setUserProfileData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      
      return { ...prev, interests };
    });
  };

  // Toggle VIN decoder usage
  const toggleVinDecoder = (useVin: boolean) => {
    setVehicleData(prev => ({
      ...prev,
      useVinDecoder: useVin
    }));
  };

  // Check username availability
  const checkUsernameAvailability = async () => {
    if (!userProfileData.displayName.trim()) {
      setError('Please enter a display name before checking availability');
      return;
    }

    setCheckingUsername(true);
    
    try {
      // This would be an actual API call to check username availability
      // For demo purposes, we're simulating a check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate username check (in a real app, this would be an API call)
      const isAvailable = userProfileData.displayName !== 'admin' && 
                          userProfileData.displayName !== 'user' &&
                          userProfileData.displayName.length >= 3;
      
      setUserProfileData(prev => ({
        ...prev,
        usernameChecked: true,
        usernameAvailable: isAvailable
      }));
      
      if (!isAvailable) {
        setError(`Username "${userProfileData.displayName}" is already taken. Please choose another.`);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setError('Unable to check username availability. Please try again.');
    } finally {
      setCheckingUsername(false);
    }
  };

  // Decode VIN
  const decodeVin = async () => {
    if (!vehicleData.vin || vehicleData.vin.length !== 17) {
      setError('Please enter a valid 17-character VIN');
      return;
    }

    try {
      // This would be an actual API call to decode the VIN
      // For demo purposes, we're simulating a successful decode
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate VIN decode (in a real app, this would be an API call)
      setVehicleData(prev => ({
        ...prev,
        make: 'Ford',
        model: 'Mustang GT',
        year: '2023',
        engineType: 'Gasoline',
        transmissionType: 'Manual'
      }));
      
    } catch (error) {
      console.error('Error decoding VIN:', error);
      setError('Unable to decode VIN. Please try manual entry.');
    }
  };

  // Animation and step transition
  const changeStep = (direction: 'next' | 'back') => {
    // Validate current step
    if (direction === 'next') {
      if (currentStep === 1 && !isUserProfileComplete()) {
        if (!userProfileData.usernameAvailable) {
          setError('Please choose a different username');
        } else {
          setError('Please complete your user profile with first name, last name, and display name');
        }
        return;
      }
      
      if (currentStep === 2 && !isVehicleProfileComplete()) {
        if (vehicleData.useVinDecoder) {
          setError('Please enter a valid VIN');
        } else {
          setError('Please complete the required vehicle information (make, model, year)');
        }
        return;
      }

      if (currentStep === 3) {
        // Final step - save everything and complete
        handleComplete();
        return;
      }
    }

    // Animate transition
    setAnimationClass('fade-out');
    setTimeout(() => {
      setCurrentStep(prev => direction === 'next' ? prev + 1 : prev - 1);
      setAnimationClass('fade-in');
      setError(null);
    }, 200);
  };

  // Simulated file upload handlers
  const handleProfileImageUpload = () => {
    // In a real app, this would handle actual file upload
    setUserProfileData(prev => ({
      ...prev,
      profileImage: '/assets/profile-placeholder.jpg'
    }));
  };

  const handleVehicleImageUpload = () => {
    // In a real app, this would handle actual file upload
    setVehicleData(prev => ({
      ...prev,
      vehicleImage: '/assets/vehicle-placeholder.jpg'
    }));
  };

  // Handle geolocation
  const handleDetectLocation = () => {
    // In a real app, would use browser geolocation
    setPreferencesData(prev => ({
      ...prev,
      primaryLocation: 'Charlotte, NC'
    }));
  };

  // Save all data and complete onboarding
  const handleComplete = async () => {
    if (!auth.user?.id) {
      setError('Authentication error. Please try again later.');
      return;
    }

    try {
      // Save user profile to source of truth
      await updateUserProfile({
        id: auth.user.id,
        firstName: userProfileData.firstName,
        lastName: userProfileData.lastName,
        displayName: userProfileData.displayName,
        bio: userProfileData.bio,
        drivingExperience: userProfileData.drivingExperience,
        interests: userProfileData.interests,
        dreamGarage: userProfileData.dreamGarage,
        lockerRoom: {
          helmetSize: userProfileData.helmetSize,
          gloveSize: userProfileData.gloveSize,
          shoeSize: userProfileData.shoeSize
        },
        profileImage: userProfileData.profileImage || '',
        settings: {
          theme: preferencesData.theme,
          units: preferencesData.units,
          primaryLocation: preferencesData.primaryLocation,
        }
      });

      // Save vehicle to source of truth
      await addVehicle({
        userId: auth.user.id,
        vin: vehicleData.useVinDecoder ? vehicleData.vin : '',
        make: vehicleData.make,
        model: vehicleData.model,
        year: parseInt(vehicleData.year) || new Date().getFullYear(),
        color: vehicleData.color,
        nickname: vehicleData.nickname,
        engineType: vehicleData.engineType,
        transmissionType: vehicleData.transmissionType,
        mileage: parseInt(vehicleData.mileage) || 0,
        mods: vehicleData.currentMods,
        tires: {
          model: vehicleData.tireModel,
          size: vehicleData.tireSize,
          datePurchased: vehicleData.tireDate,
          mileageInstalled: parseInt(vehicleData.tireMileage) || 0
        },
        image: vehicleData.vehicleImage || '',
      });

      // Mark onboarding complete in localStorage
      const onboardingKey = `paddock20_onboarding_complete_${auth.user.id}`;
      localStorage.setItem(onboardingKey, 'true');

      // Call the onComplete callback
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setError('Failed to save your information. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg max-w-3xl w-full p-6 relative mx-auto my-8 ${animationClass}`}>
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron text-blue-400 mb-1">Complete Your Paddock20 Profile</h2>
          <p className="text-gray-300">Set up your profile to get the most out of your Paddock20 experience.</p>
          
          {/* Progress indicator */}
          <div className="flex mt-4 space-x-2">
            {[1, 2, 3].map(step => (
              <div 
                key={step} 
                className={`h-1 rounded-full flex-1 ${currentStep >= step ? 'bg-blue-500' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200">
            {error}
          </div>
        )}
        
        {/* Step content - with scrollable container */}
        <div className={`space-y-4 ${animationClass} max-h-[60vh] overflow-y-auto pr-2`}>
          {/* Step 1: User Profile */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <User className="text-blue-400 mr-2 h-5 w-5" />
                <h3 className="text-lg font-medium text-blue-300">Your Driver Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={userProfileData.firstName}
                    onChange={handleUserProfileChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={userProfileData.lastName}
                    onChange={handleUserProfileChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Username/Display Name</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="displayName"
                    value={userProfileData.displayName}
                    onChange={handleUserProfileChange}
                    className={`flex-1 bg-gray-800/50 border ${
                      userProfileData.usernameChecked
                        ? userProfileData.usernameAvailable
                          ? 'border-green-700'
                          : 'border-red-700'
                        : 'border-gray-700'
                    } rounded-md p-2 text-white`}
                  />
                  <button
                    type="button"
                    onClick={checkUsernameAvailability}
                    disabled={checkingUsername}
                    className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center whitespace-nowrap"
                  >
                    {checkingUsername ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>
                <p className="text-xs mt-1 flex items-center">
                  {userProfileData.usernameChecked && (
                    userProfileData.usernameAvailable 
                      ? <span className="text-green-400 flex items-center"><Check className="h-3 w-3 mr-1" /> Username available</span>
                      : <span className="text-red-400 flex items-center"><X className="h-3 w-3 mr-1" /> Username unavailable</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">This is how you'll appear to other users</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={userProfileData.bio}
                  onChange={handleUserProfileChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white h-20"
                  placeholder="Tell us about yourself and your automotive interests..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Driving Experience</label>
                <select
                  name="drivingExperience"
                  value={userProfileData.drivingExperience}
                  onChange={handleUserProfileChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dream Garage</label>
                <textarea
                  name="dreamGarage"
                  value={userProfileData.dreamGarage}
                  onChange={handleUserProfileChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white h-20"
                  placeholder="List your dream cars..."
                />
              </div>
              
              <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shirt className="text-blue-400 mr-2 h-5 w-5" />
                  <h4 className="text-md font-medium text-blue-300">Locker Room Sizes</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Helmet Size</label>
                    <select
                      name="helmetSize"
                      value={userProfileData.helmetSize}
                      onChange={handleUserProfileChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    >
                      {helmetSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Glove Size</label>
                    <select
                      name="gloveSize"
                      value={userProfileData.gloveSize}
                      onChange={handleUserProfileChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    >
                      {gloveSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Shoe Size</label>
                    <select
                      name="shoeSize"
                      value={userProfileData.shoeSize}
                      onChange={handleUserProfileChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    >
                      {shoeSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                        userProfileData.interests.includes(interest)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
                <button
                  type="button"
                  onClick={handleProfileImageUpload}
                  className="flex items-center bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {userProfileData.profileImage ? 'Change Profile Image' : 'Upload Profile Image'}
                </button>
                {userProfileData.profileImage && (
                  <p className="text-xs text-green-400 mt-1">Profile image uploaded</p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Vehicle Profile */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <Car className="text-blue-400 mr-2 h-5 w-5" />
                <h3 className="text-lg font-medium text-blue-300">Your Vehicle</h3>
              </div>
              
              {/* VIN Decoder Choice */}
              <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 mb-4">
                <h4 className="text-md font-medium text-blue-300 mb-2">Vehicle Information</h4>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => toggleVinDecoder(true)}
                    className={`flex-1 py-2 px-3 rounded-md text-center ${
                      vehicleData.useVinDecoder
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Use VIN Decoder
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVinDecoder(false)}
                    className={`flex-1 py-2 px-3 rounded-md text-center ${
                      !vehicleData.useVinDecoder
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Enter Manually
                  </button>
                </div>
              </div>
              
              {/* VIN Decoder Input */}
              {vehicleData.useVinDecoder ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Identification Number (VIN)</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="vin"
                        value={vehicleData.vin}
                        onChange={handleVehicleChange}
                        className="flex-1 bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                        placeholder="Enter 17-character VIN"
                        maxLength={17}
                      />
                      <button
                        type="button"
                        onClick={decodeVin}
                        className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center"
                      >
                        <Search className="mr-1 h-4 w-4" />
                        Decode
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Found on your vehicle registration or driver's side door jamb</p>
                  </div>
                  
                  {/* Display decoded info if available */}
                  {vehicleData.make && (
                    <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4">
                      <h4 className="text-md font-medium text-green-400 mb-2">Decoded Vehicle Information</h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <dt className="text-sm text-gray-400">Make:</dt>
                        <dd className="text-sm text-white">{vehicleData.make}</dd>
                        
                        <dt className="text-sm text-gray-400">Model:</dt>
                        <dd className="text-sm text-white">{vehicleData.model}</dd>
                        
                        <dt className="text-sm text-gray-400">Year:</dt>
                        <dd className="text-sm text-white">{vehicleData.year}</dd>
                        
                        <dt className="text-sm text-gray-400">Engine:</dt>
                        <dd className="text-sm text-white">{vehicleData.engineType}</dd>
                        
                        <dt className="text-sm text-gray-400">Transmission:</dt>
                        <dd className="text-sm text-white">{vehicleData.transmissionType}</dd>
                      </dl>
                    </div>
                  )}
                </div>
              ) : (
                // Manual Vehicle Entry
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Make</label>
                    <select
                      name="make"
                      value={vehicleData.make}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    >
                      <option value="">Select Make</option>
                      {carManufacturers.map(make => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                    <input
                      type="text"
                      name="model"
                      value={vehicleData.model}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                      placeholder="e.g., Mustang GT"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                    <input
                      type="text"
                      name="year"
                      value={vehicleData.year}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                      placeholder="e.g., 2023"
                    />
                  </div>
                </div>
              )}
              
              {/* Additional Vehicle Details (common to both VIN and manual) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={vehicleData.color}
                    onChange={handleVehicleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="e.g., Velocity Blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nickname</label>
                  <input
                    type="text"
                    name="nickname"
                    value={vehicleData.nickname}
                    onChange={handleVehicleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="e.g., Blue Thunder"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mileage</label>
                  <input
                    type="text"
                    name="mileage"
                    value={vehicleData.mileage}
                    onChange={handleVehicleChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="e.g., 15000"
                  />
                </div>
              </div>
              
              {!vehicleData.useVinDecoder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Engine Type</label>
                    <select
                      name="engineType"
                      value={vehicleData.engineType}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    >
                      {engineTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Transmission</label>
                    <select
                      name="transmissionType"
                      value={vehicleData.transmissionType}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    >
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Modifications</label>
                <textarea
                  name="currentMods"
                  value={vehicleData.currentMods}
                  onChange={(e) => setVehicleData(prev => ({ ...prev, currentMods: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white h-16"
                  placeholder="List any modifications to your vehicle..."
                />
              </div>
              
              {/* Tire Information */}
              <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                <div className="flex items-center mb-2 justify-between">
                  <h4 className="text-md font-medium text-blue-300">Tire Information</h4>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300">
                    Find by web lookup
                  </a>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Brand/Model</label>
                    <input
                      type="text"
                      name="tireModel"
                      value={vehicleData.tireModel}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                      placeholder="e.g., Michelin Pilot Sport 4S"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Size</label>
                    <input
                      type="text"
                      name="tireSize"
                      value={vehicleData.tireSize}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                      placeholder="e.g., 245/40R18"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date Purchased</label>
                    <input
                      type="date"
                      name="tireDate"
                      value={vehicleData.tireDate}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mileage at Installation</label>
                    <input
                      type="text"
                      name="tireMileage"
                      value={vehicleData.tireMileage}
                      onChange={handleVehicleChange}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                      placeholder="e.g., 15000"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Image</label>
                <button
                  type="button"
                  onClick={handleVehicleImageUpload}
                  className="flex items-center bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {vehicleData.vehicleImage ? 'Change Vehicle Image' : 'Upload Vehicle Image'}
                </button>
                {vehicleData.vehicleImage && (
                  <p className="text-xs text-green-400 mt-1">Vehicle image uploaded</p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <Sliders className="text-blue-400 mr-2 h-5 w-5" />
                <h3 className="text-lg font-medium text-blue-300">Your Preferences</h3>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 mb-4">
                <p className="text-gray-300">
                  Set your preferences to customize your Paddock20 experience. You can always change these later.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-blue-400" />
                    Primary Location
                  </div>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="primaryLocation"
                    value={preferencesData.primaryLocation}
                    onChange={handlePreferencesChange}
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="e.g., Charlotte, NC"
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Detect
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Units</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="units"
                      value="imperial"
                      checked={preferencesData.units === 'imperial'}
                      onChange={handlePreferencesChange}
                      className="form-radio h-4 w-4 text-blue-600 bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Imperial (mph, °F)</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="units"
                      value="metric"
                      checked={preferencesData.units === 'metric'}
                      onChange={handlePreferencesChange}
                      className="form-radio h-4 w-4 text-blue-600 bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Metric (km/h, °C)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPreferencesData(prev => ({ ...prev, theme: 'dark' }))}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border relative ${
                      preferencesData.theme === 'dark'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-full h-12 rounded bg-gray-800 mb-2 border border-gray-700"></div>
                    <span className="text-sm text-gray-300">Dark (Default)</span>
                    {preferencesData.theme === 'dark' && (
                      <Check className="h-4 w-4 text-blue-400 absolute top-2 right-2" />
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPreferencesData(prev => ({ ...prev, theme: 'darker' }))}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border relative ${
                      preferencesData.theme === 'darker'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-full h-12 rounded bg-black mb-2 border border-gray-900"></div>
                    <span className="text-sm text-gray-300">Darker</span>
                    {preferencesData.theme === 'darker' && (
                      <Check className="h-4 w-4 text-blue-400 absolute top-2 right-2" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 mt-8 border-t border-gray-800">
          <button
            type="button"
            onClick={() => currentStep > 1 ? changeStep('back') : onClose()}
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
          >
            {currentStep > 1 ? 'Back' : 'Cancel'}
          </button>
          
          <button
            type="button"
            onClick={() => changeStep('next')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            {currentStep === 3 ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
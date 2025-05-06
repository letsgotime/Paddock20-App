import React, { useState } from 'react';
import { X, Car, User, Check, Camera, UploadCloud, Sliders, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../context/UserProfileContext';
import { useVehicle } from '../../context/VehicleContext';

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

// Defining step interfaces for strong typing
interface UserProfileStep {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  drivingExperience: string;
  interests: string[];
  profileImage: string | null;
}

interface VehicleStep {
  make: string;
  model: string;
  year: string;
  color: string;
  nickname: string;
  engineType: string;
  transmissionType: string;
  mileage: string;
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

  // Initialize with data from Auth0 if available
  const [userProfileData, setUserProfileData] = useState<UserProfileStep>({
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    displayName: auth.user?.username || '',
    bio: '',
    drivingExperience: 'Intermediate',
    interests: [],
    profileImage: null,
  });

  const [vehicleData, setVehicleData] = useState<VehicleStep>({
    make: '',
    model: '',
    year: '',
    color: '',
    nickname: '',
    engineType: 'Gasoline',
    transmissionType: 'Automatic',
    mileage: '',
    vehicleImage: null,
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
           userProfileData.displayName.trim() !== '';
  };

  const isVehicleProfileComplete = () => {
    return vehicleData.make.trim() !== '' && 
           vehicleData.model.trim() !== '' && 
           vehicleData.year.trim() !== '';
  };

  // Update handlers
  const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfileData(prev => ({ ...prev, [name]: value }));
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

  // Animation and step transition
  const changeStep = (direction: 'next' | 'back') => {
    // Validate current step
    if (direction === 'next') {
      if (currentStep === 1 && !isUserProfileComplete()) {
        setError('Please complete your user profile with first name, last name, and display name');
        return;
      }
      
      if (currentStep === 2 && !isVehicleProfileComplete()) {
        setError('Please complete the required vehicle information (make, model, year)');
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
        make: vehicleData.make,
        model: vehicleData.model,
        year: parseInt(vehicleData.year) || new Date().getFullYear(),
        color: vehicleData.color,
        nickname: vehicleData.nickname,
        engineType: vehicleData.engineType,
        transmissionType: vehicleData.transmissionType,
        mileage: parseInt(vehicleData.mileage) || 0,
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
      <div className={`bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg max-w-2xl w-full md:w-3/4 lg:w-2/3 p-6 relative mx-auto my-8 ${animationClass}`}>
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
        
        {/* Step content */}
        <div className={`space-y-4 ${animationClass}`}>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={userProfileData.displayName}
                  onChange={handleUserProfileChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-white"
                />
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
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
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
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
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
    </div>
  );
};

export default OnboardingModal;
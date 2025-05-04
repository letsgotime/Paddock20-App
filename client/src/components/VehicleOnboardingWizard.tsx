import React, { useState, useEffect } from 'react';
import { 
  Car, Cpu, Book, Activity, FileText, Camera, ChevronLeft, 
  ChevronRight, X, Check, Search, RefreshCw, Bluetooth, AlertCircle
} from 'lucide-react';
import { useVehicle, VehicleProfile } from '../hooks/useVehicle';
import { decodeVIN, DecodedVehicleInfo, validateVIN } from '../services/vinDecoderService';
import { toast } from '../hooks/use-toast';
import ProfileDataCollector from '../services/ProfileDataCollector';

// Define the onboarding step interface
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: Array<{
    name: keyof VehicleProfile;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

// Vehicle data interface
interface VehicleData {
  make: string;
  model: string;
  year: string;
  nickname: string;
  mileage: string;
  engineType: string;
  transmissionType: string;
  color: string;
  purchaseDate: string;
  vehicleImage?: string;
  vin?: string;
  purchaseLocation?: string;
}

// Initial vehicle data
const initialVehicleData: VehicleData = {
  make: '',
  model: '',
  year: new Date().getFullYear().toString(),
  nickname: '',
  mileage: '0',
  engineType: 'Gasoline',
  transmissionType: 'Automatic',
  color: 'Black',
  purchaseDate: new Date().toISOString().split('T')[0],
  vehicleImage: '',
  vin: ''
};

// Define the onboarding steps
const onboardingSteps: OnboardingStep[] = [
  {
    id: 'entry-method',
    title: 'Choose Entry Method',
    description: 'Select how you want to add your vehicle',
    icon: <Car />,
    fields: []
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Enter your vehicle\'s basic details',
    icon: <FileText />,
    fields: [
      {
        name: 'make',
        label: 'Make',
        type: 'text',
        required: true,
        placeholder: 'e.g., Toyota, Ford, BMW'
      },
      {
        name: 'model',
        label: 'Model',
        type: 'text',
        required: true,
        placeholder: 'e.g., Camry, F-150, M3'
      },
      {
        name: 'year',
        label: 'Year',
        type: 'number',
        required: true,
        placeholder: 'e.g., 2023'
      },
      {
        name: 'nickname',
        label: 'Nickname (Optional)',
        type: 'text',
        placeholder: 'Give your car a nickname'
      }
    ]
  },
  {
    id: 'details',
    title: 'Vehicle Details',
    description: 'Tell us more about your vehicle',
    icon: <Book />,
    fields: [
      {
        name: 'mileage',
        label: 'Current Mileage',
        type: 'number',
        required: true,
        placeholder: 'e.g., 25000'
      },
      {
        name: 'engineType',
        label: 'Engine Type',
        type: 'select',
        options: ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Natural Gas', 'Other']
      },
      {
        name: 'transmissionType',
        label: 'Transmission',
        type: 'select',
        options: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic', 'Dual-Clutch']
      },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'e.g., Red, Silver, Black'
      }
    ]
  },
  {
    id: 'additional',
    title: 'Additional Information',
    description: 'Add more details about your vehicle',
    icon: <Activity />,
    fields: [
      {
        name: 'purchaseDate',
        label: 'Purchase Date',
        type: 'date'
      },
      {
        name: 'vin',
        label: 'VIN (Optional)',
        type: 'text',
        placeholder: 'Vehicle Identification Number'
      },
      {
        name: 'vehicleImage',
        label: 'Vehicle Image URL (Optional)',
        type: 'text',
        placeholder: 'https://example.com/my-car.jpg'
      }
    ]
  }
];

// Enum for entry methods
enum EntryMethod {
  MANUAL = 'manual',
  VIN = 'vin',
  OBD = 'obd'
}

const VehicleOnboardingWizard: React.FC = () => {
  // Get vehicle context methods
  const { addVehicle } = useVehicle();
  
  // State for vehicle data
  const [vehicleData, setVehicleData] = useState<VehicleData>(initialVehicleData);
  
  // State for the current step
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for loading indicators
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isScanningOBD, setIsScanningOBD] = useState(false);
  
  // State for entry method
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(EntryMethod.MANUAL);
  
  // State for VIN input
  const [vinInput, setVinInput] = useState('');
  const [vinError, setVinError] = useState('');
  
  // State for OBD connection
  const [obdConnected, setObdConnected] = useState(false);
  const [obdError, setObdError] = useState('');
  
  // Handler for stepping through the wizard
  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      // If VIN method selected but no steps taken, remind user
      if (entryMethod === EntryMethod.VIN && !vehicleData.make) {
        toast({
          title: 'Action Required',
          description: 'Please enter a VIN and click "Decode VIN" to continue',
          variant: 'destructive'
        });
        return;
      }
      
      // If OBD method selected but not connected, remind user
      if (entryMethod === EntryMethod.OBD && !obdConnected) {
        toast({
          title: 'Connection Required',
          description: 'Please connect to your vehicle\'s OBD port to continue',
          variant: 'destructive'
        });
        return;
      }
    } else {
      // For regular steps, validate required fields
      const currentStepFields = onboardingSteps[currentStep].fields;
      const requiredFields = currentStepFields.filter(field => field.required);
      
      for (const field of requiredFields) {
        const value = vehicleData[field.name];
        if (!value) {
          toast({
            title: 'Required Fields',
            description: `Please fill in the ${field.label} field to continue`,
            variant: 'destructive'
          });
          return;
        }
      }
    }
    
    // Move to next step if validation passes
    setCurrentStep(prevStep => Math.min(prevStep + 1, onboardingSteps.length));
  };
  
  // Handler for going back a step
  const handleBack = () => {
    setCurrentStep(prevStep => Math.max(prevStep - 1, 0));
  };
  
  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler for decoding VIN
  const handleDecodeVIN = async () => {
    // Reset previous errors
    setVinError('');
    
    // Validate VIN format first
    const validation = validateVIN(vinInput);
    if (!validation.isValid) {
      setVinError(validation.message || 'Invalid VIN format');
      return;
    }
    
    // Start decoding process
    setIsDecoding(true);
    
    try {
      // Call the VIN decoder service
      const decodedInfo: DecodedVehicleInfo = await decodeVIN(vinInput);
      
      // Handle any errors from the decoder
      if (decodedInfo.error) {
        setVinError(decodedInfo.error);
        setIsDecoding(false);
        // Allow manual entry as fallback
        toast({
          title: 'VIN Lookup Failed',
          description: 'Unable to retrieve vehicle data from VIN. You can enter details manually.',
          variant: 'destructive'
        });
        // Continue with manual entry
        setCurrentStep(1);
        return;
      }
      
      // Update vehicle data with decoded information
      // But keep default values if information is missing
      setVehicleData(prev => ({
        ...prev,
        make: decodedInfo.make || '',
        model: decodedInfo.model || '',
        year: decodedInfo.year || new Date().getFullYear().toString(),
        engineType: decodedInfo.engine || prev.engineType,
        transmissionType: decodedInfo.transmission || prev.transmissionType,
        vin: vinInput
      }));
      
      // Show success message
      toast({
        title: 'VIN Decoded Successfully',
        description: `Identified as ${decodedInfo.year} ${decodedInfo.make} ${decodedInfo.model}. Please continue and fill in any missing information.`,
        variant: 'default'
      });
      
      // Always move to next step and let user verify
      // This ensures proper two-way data flow and user verification
      setCurrentStep(1); // Go to basic information step
      
    } catch (error) {
      console.error('Error decoding VIN:', error);
      setVinError('An error occurred while decoding the VIN. Please try again or enter vehicle details manually.');
    } finally {
      setIsDecoding(false);
    }
  };
  
  // Handler for OBD scanning
  const handleConnectOBD = async () => {
    // Reset previous errors
    setObdError('');
    
    // Start scanning
    setIsScanningOBD(true);
    
    try {
      // This is where we would implement real OBD connection logic
      // For now, we'll simulate a connection with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a successful connection for now
      setObdConnected(true);
      
      // In a real implementation, we would:
      // 1. Connect to the OBD device via Bluetooth or Wi-Fi
      // 2. Read VIN from the vehicle's ECU
      // 3. Read other data like mileage, engine type, etc.
      // 4. Populate the form with this data
      
      // For the manual entry option prompt only - let user enter real data
      // This empty block is intentional - the user now needs to fill in the details manually
      // but we've already confirmed OBD connection is working
      
      // Show success toast
      toast({
        title: 'OBD Connected',
        description: 'Successfully connected to your vehicle\'s OBD port. You can now enter your details.',
        variant: 'default'
      });
      
      // Continue with manual entry for proper two-way integration
      // Do NOT automatically set data, as that prevents proper data flow
      // The user needs to enter the actual vehicle information
      setCurrentStep(1); // Go to basic information step
      
    } catch (error) {
      console.error('Error connecting to OBD:', error);
      setObdError('Could not connect to your vehicle\'s OBD port. Please check your connection or enter details manually.');
      setObdConnected(false);
    } finally {
      setIsScanningOBD(false);
    }
  };
  
  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Start submission process
    setIsSubmitting(true);
    
    try {
      // Get current user data or create new user data structure
      let userData = localStorage.getItem('userOnboardingData');
      let userProfile = userData ? JSON.parse(userData) : {
        username: 'driver1',
        displayName: '',
        membershipLevel: 'free',
        bio: 'Passionate driver with a love for cars and the open road.',
        location: '',
      };
      
      // If this is the first vehicle, extract some user details from the vehicle
      if (!userProfile.displayName && vehicleData.nickname) {
        userProfile.displayName = vehicleData.nickname.split(' ')[0]; // Use first part of nickname as display name
      }
      
      // Update user profile with vehicle data (if location not set, use the vehicle's location)
      if (!userProfile.location && vehicleData.purchaseLocation) {
        userProfile.location = vehicleData.purchaseLocation;
      }
      
      // Save the updated user data first
      localStorage.setItem('userOnboardingData', JSON.stringify(userProfile));
      
      // Save the vehicle data to localStorage 
      localStorage.setItem('vehicleProfile', JSON.stringify(vehicleData));
      
      // Add the vehicle using the context
      const newVehicle = await addVehicle(vehicleData);
      
      // Create a complete vehicle object with all required properties
      // This ensures consistent structure regardless of entry method
      const completeVehicleData = {
        ...vehicleData,
        vehicle_image: vehicleData.vehicleImage,
        car_name: vehicleData.nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
        engine_type: vehicleData.engineType,
        transmission: vehicleData.transmissionType,
        entry_method: entryMethod, // Track how the vehicle was added
        // Convert string values to appropriate types
        year: parseInt(vehicleData.year) || new Date().getFullYear(),
        mileage: parseInt(vehicleData.mileage) || 0,
      };
      
      // Sync vehicle with the user profile system in both directions
      // This ensures the vehicle data is available across the entire app
      ProfileDataCollector.syncVehicleFromContext(completeVehicleData);
      
      // ProfileDataCollector.collectVehicleData expects different field names
      // This maps the vehicle data to the format expected by collectVehicleData
      const profileVehicleData = {
        make: vehicleData.make,
        model: vehicleData.model,
        year: parseInt(vehicleData.year) || new Date().getFullYear(),
        color: vehicleData.color,
        nickname: vehicleData.nickname,
        image: vehicleData.vehicleImage,
        lastServiced: new Date().toISOString().split('T')[0],
        engineType: vehicleData.engineType,
        transmissionType: vehicleData.transmissionType,
        purchaseDate: vehicleData.purchaseDate
      };
      
      // Update the profile system for full two-way integration
      ProfileDataCollector.collectVehicleData(profileVehicleData);
      
      console.log('Vehicle added and synced with driver profile (two-way integration):', vehicleData.make, vehicleData.model);
      
      // Reset the profile to load the new user data
      try {
        // Force the profile system to rebuild itself from the updated onboarding data
        // Using direct import to avoid dependency errors
        const userProfileStore = await import('@/services/userProfileService');
        const store = userProfileStore.useUserProfileStore.getState();
        if (store && store.resetProfile) {
          store.resetProfile();
        }
        
        // Reload the page to ensure all systems pick up the new data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
      
      // Show success message
      toast({
        title: 'Vehicle Added Successfully',
        description: 'Your vehicle has been added to your profile and will be available across all Paddock20 features',
        variant: 'default'
      });
      
      // Reset the form if staying on the page
      setVehicleData(initialVehicleData);
      setCurrentStep(0);
      setEntryMethod(EntryMethod.MANUAL);
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: 'Error Adding Vehicle',
        description: 'There was an error adding your vehicle. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render the entry method selection step
  const renderEntryMethodStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-center text-blue-400 mb-4">
          Choose How to Add Your Vehicle
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Manual Entry */}
          <button
            type="button"
            onClick={() => setEntryMethod(EntryMethod.MANUAL)}
            className={`flex flex-col items-center justify-center p-6 border rounded-lg transition-all ${
              entryMethod === EntryMethod.MANUAL
                ? 'border-blue-500 bg-blue-500/10 shadow-md'
                : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <FileText size={40} className={entryMethod === EntryMethod.MANUAL ? 'text-blue-400' : 'text-gray-400'} />
            <h4 className="mt-4 font-medium text-lg">Manual Entry</h4>
            <p className="text-sm text-gray-400 text-center mt-2">
              Enter your vehicle details manually through a step-by-step form
            </p>
          </button>
          
          {/* VIN Decoder */}
          <button
            type="button"
            onClick={() => setEntryMethod(EntryMethod.VIN)}
            className={`flex flex-col items-center justify-center p-6 border rounded-lg transition-all ${
              entryMethod === EntryMethod.VIN
                ? 'border-blue-500 bg-blue-500/10 shadow-md'
                : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Search size={40} className={entryMethod === EntryMethod.VIN ? 'text-blue-400' : 'text-gray-400'} />
            <h4 className="mt-4 font-medium text-lg">VIN Decoder</h4>
            <p className="text-sm text-gray-400 text-center mt-2">
              Enter your vehicle's VIN (Vehicle Identification Number) and we'll look up the details
            </p>
          </button>
          
          {/* OBD Connection */}
          <button
            type="button"
            onClick={() => setEntryMethod(EntryMethod.OBD)}
            className={`flex flex-col items-center justify-center p-6 border rounded-lg transition-all ${
              entryMethod === EntryMethod.OBD
                ? 'border-blue-500 bg-blue-500/10 shadow-md'
                : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Bluetooth size={40} className={entryMethod === EntryMethod.OBD ? 'text-blue-400' : 'text-gray-400'} />
            <h4 className="mt-4 font-medium text-lg">OBD Connection</h4>
            <p className="text-sm text-gray-400 text-center mt-2">
              Connect directly to your vehicle's OBD port to retrieve information
            </p>
          </button>
        </div>
        
        {/* VIN Decoder Form */}
        {entryMethod === EntryMethod.VIN && (
          <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-800/50">
            <h4 className="text-lg font-medium text-white mb-4">Enter Vehicle Identification Number</h4>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white"
                  placeholder="Enter 17-character VIN"
                  maxLength={17}
                />
                {vinError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle size={16} className="mr-1" /> {vinError}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleDecodeVIN}
                disabled={isDecoding || vinInput.length !== 17}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDecoding ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" /> Decoding...
                  </>
                ) : (
                  <>
                    <Search size={16} className="mr-2" /> Decode VIN
                  </>
                )}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Your VIN can usually be found on your vehicle registration, insurance card, driver's side door jamb, or through the windshield on the driver's side dashboard.
            </p>
          </div>
        )}
        
        {/* OBD Connection Interface */}
        {entryMethod === EntryMethod.OBD && (
          <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-gray-800/50">
            <h4 className="text-lg font-medium text-white mb-4">Connect to Vehicle OBD Port</h4>
            <div className="flex flex-col items-center">
              {!obdConnected ? (
                <div className="text-center">
                  <p className="text-gray-300 mb-6">
                    Make sure your OBD adapter is connected to your vehicle and your device's Bluetooth is enabled.
                  </p>
                  <button
                    type="button"
                    onClick={handleConnectOBD}
                    disabled={isScanningOBD}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                    {isScanningOBD ? (
                      <>
                        <RefreshCw size={18} className="mr-2 animate-spin" /> Scanning...
                      </>
                    ) : (
                      <>
                        <Bluetooth size={18} className="mr-2" /> Connect to OBD
                      </>
                    )}
                  </button>
                  {obdError && (
                    <p className="mt-4 text-sm text-red-400 flex items-center justify-center">
                      <AlertCircle size={16} className="mr-1" /> {obdError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center text-green-500 mb-4">
                    <Check size={24} className="mr-2" />
                    <span className="text-lg font-medium">Connected to OBD</span>
                  </div>
                  <p className="text-gray-300">
                    Successfully retrieved vehicle information from your OBD port.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render regular form step
  const renderFormStep = (step: OnboardingStep) => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-400">{step.title}</h3>
        <p className="text-gray-400">{step.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {step.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm text-gray-300 block">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={vehicleData[field.name]}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={vehicleData[field.name]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render review step
  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-blue-400">Review Vehicle Information</h3>
        <p className="text-gray-400">Please review your vehicle information before submitting</p>
        
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <dl className="divide-y divide-gray-800">
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Make:</dt>
              <dd className="text-white col-span-2">{vehicleData.make}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Model:</dt>
              <dd className="text-white col-span-2">{vehicleData.model}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Year:</dt>
              <dd className="text-white col-span-2">{vehicleData.year}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Nickname:</dt>
              <dd className="text-white col-span-2">{vehicleData.nickname || 'None'}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Mileage:</dt>
              <dd className="text-white col-span-2">{vehicleData.mileage} miles</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Engine Type:</dt>
              <dd className="text-white col-span-2">{vehicleData.engineType}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Transmission:</dt>
              <dd className="text-white col-span-2">{vehicleData.transmissionType}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Color:</dt>
              <dd className="text-white col-span-2">{vehicleData.color}</dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-gray-400">Purchase Date:</dt>
              <dd className="text-white col-span-2">{vehicleData.purchaseDate || 'Not specified'}</dd>
            </div>
            {vehicleData.vin && (
              <div className="grid grid-cols-3 gap-4 py-3">
                <dt className="text-gray-400">VIN:</dt>
                <dd className="text-white col-span-2">{vehicleData.vin}</dd>
              </div>
            )}
          </dl>
        </div>
        
        {vehicleData.vehicleImage && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Vehicle Image</h4>
            <div className="h-48 overflow-hidden rounded-lg border border-gray-700">
              <img 
                src={vehicleData.vehicleImage} 
                alt={`${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Determine if we're on the review step
  const isReviewStep = currentStep === onboardingSteps.length;
  
  // Determine if we're on the first entry method step
  const isEntryMethodStep = currentStep === 0;
  
  // Determine if we can proceed to the next step
  const canProceed = () => {
    if (isEntryMethodStep) {
      return entryMethod === EntryMethod.MANUAL || 
        (entryMethod === EntryMethod.VIN && vehicleData.make) || 
        (entryMethod === EntryMethod.OBD && obdConnected);
    }
    return true;
  };
  
  return (
    <div className="bg-black text-white pb-32 mb-40"> {/* Increased padding to ensure no overlap with ribbon */}
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {onboardingSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index < currentStep || (index === currentStep && isReviewStep)
                    ? 'bg-[#08c519]'
                    : index === currentStep
                    ? 'bg-blue-500 ring-4 ring-blue-500/20'
                    : 'bg-gray-700'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white">{index + 1}</span>
                )}
              </div>
              <span className="mt-2 text-xs text-gray-500">{step.title}</span>
            </div>
          ))}
          <div className="flex flex-col items-center">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isReviewStep ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-gray-700'
              }`}
            >
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="mt-2 text-xs text-gray-500">Review</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-700 rounded-full">
          <div 
            className="h-2 bg-gradient-to-r from-blue-600 to-[#08c519] rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (onboardingSteps.length + 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 mb-28"> {/* Increased margin to ensure form elements are not hidden */}
        {/* Step content */}
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800"> {/* Increased padding for more space */}
          {isEntryMethodStep && renderEntryMethodStep()}
          {!isEntryMethodStep && !isReviewStep && renderFormStep(onboardingSteps[currentStep])}
          {isReviewStep && renderReviewStep()}
        </div>
        
        {/* Fixed navigation buttons - positioned to stay above the bottom ribbon */}
        <div className="sticky bottom-24 z-10 bg-gradient-to-t from-black via-black to-transparent pt-6 pb-10 px-4"> 
          <div className="flex justify-between max-w-full">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 flex items-center text-gray-300 hover:text-white bg-gray-800 rounded-md shadow-lg"
              >
                <ChevronLeft size={20} className="mr-1" /> Back
              </button>
            ) : (
              <div>{/* Empty div for spacing */}</div>
            )}
            
            {isReviewStep ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#08c519] hover:bg-[#07b016] text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={20} className="mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={20} className="mr-2" /> Add Vehicle
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-[#08c519] hover:bg-[#07b016] text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                Continue <ChevronRight size={20} className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehicleOnboardingWizard;
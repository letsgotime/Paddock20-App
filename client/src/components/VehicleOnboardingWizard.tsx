import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Car, 
  Calendar, 
  Hash, 
  Gauge, 
  Wrench, 
  Paintbrush, 
  Package, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

// Define the vehicle type
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
}

// Initial empty state
const initialVehicleData: VehicleData = {
  make: '',
  model: '',
  year: new Date().getFullYear().toString(),
  nickname: '',
  mileage: '',
  engineType: 'Gasoline',
  transmissionType: 'Automatic',
  color: '',
  purchaseDate: new Date().toISOString().split('T')[0]
};

// Define the step type
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: Array<{
    name: keyof VehicleData;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

const VehicleOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicleData, setVehicleData] = useState<VehicleData>(initialVehicleData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define the steps for the onboarding process
  const steps: OnboardingStep[] = [
    {
      id: 'basics',
      title: 'Basic Vehicle Information',
      description: 'Let\'s start with the basics of your vehicle.',
      icon: <Car className="h-6 w-6 text-blue-400" />,
      fields: [
        { name: 'make', label: 'Make', type: 'text', required: true, placeholder: 'e.g., BMW, Toyota, Ford' },
        { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., 330i, Camry, F-150' },
        { name: 'year', label: 'Year', type: 'number', required: true, placeholder: '2023' },
        { name: 'nickname', label: 'Nickname (Optional)', type: 'text', placeholder: 'Give your car a name' }
      ]
    },
    {
      id: 'details',
      title: 'Technical Details',
      description: 'Now let\'s get some technical details about your vehicle.',
      icon: <Gauge className="h-6 w-6 text-blue-400" />,
      fields: [
        { name: 'mileage', label: 'Current Mileage', type: 'number', required: true, placeholder: 'e.g., 12500' },
        { name: 'engineType', label: 'Engine Type', type: 'select', required: true, options: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Other'] },
        { name: 'transmissionType', label: 'Transmission', type: 'select', required: true, options: ['Automatic', 'Manual', 'CVT', 'DCT', 'Other'] },
        { name: 'vin', label: 'VIN (Optional)', type: 'text', placeholder: 'Vehicle Identification Number' }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance & History',
      description: 'Let\'s finish with some details about your vehicle\'s appearance and history.',
      icon: <Paintbrush className="h-6 w-6 text-blue-400" />,
      fields: [
        { name: 'color', label: 'Color', type: 'text', required: true, placeholder: 'e.g., Black, Alpine White, Silver' },
        { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true }
      ]
    }
  ];

  // Get the current step
  const currentStepData = steps[currentStep];

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value
    });
  };

  // Handle next step
  const handleNext = () => {
    // Validate required fields
    const requiredFields = currentStepData.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !vehicleData[field.name]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields before proceeding.`,
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Generate a nickname if one wasn't provided
    if (!vehicleData.nickname) {
      vehicleData.nickname = `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`;
    }
    
    try {
      // Save vehicle data to localStorage
      localStorage.setItem('vehicleProfile', JSON.stringify(vehicleData));
      
      // In a real app, you would also save this to your database
      // await saveVehicleToDatabase(vehicleData);
      
      toast({
        title: "Vehicle Added Successfully!",
        description: `Your ${vehicleData.make} ${vehicleData.model} has been added to your garage.`,
        variant: "default",
        className: "bg-green-700 border-green-600",
      });
      
      // Redirect to garage page
      navigate('/garage-vault');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error Adding Vehicle",
        description: "There was a problem adding your vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/70">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-400">Add Your Vehicle</h2>
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            {currentStepData.icon}
            <h3 className="text-lg font-semibold text-white ml-2">{currentStepData.title}</h3>
          </div>
          <p className="text-gray-400">{currentStepData.description}</p>
        </div>
        
        <div className="space-y-4">
          {currentStepData.fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name} className="flex items-center">
                {field.label}
                {field.required && <span className="text-blue-400 ml-1">*</span>}
              </Label>
              
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={vehicleData[field.name] as string}
                  onChange={handleChange}
                  className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white w-full"
                >
                  {field.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={vehicleData[field.name] as string}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="bg-gray-800 border-gray-700"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800 bg-gray-900/70 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {currentStep === steps.length - 1 ? (
            isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <CheckCircle2 size={16} className="mr-1" />
                Complete
              </>
            )
          ) : (
            <>
              Next
              <ChevronRight size={16} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VehicleOnboardingWizard;
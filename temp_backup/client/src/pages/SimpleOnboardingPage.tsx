import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Car, Cloud, MapPin, Trophy, Wrench } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  options?: {
    id: string;
    label: string;
    description?: string;
  }[];
}

export default function SimpleOnboardingPage() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({});

  // Onboarding steps
  const steps: OnboardingStep[] = [
    {
      title: "Welcome to PADDOCK20",
      description: "Let's set up your automotive experience in a few simple steps. We'll ask about your interests to personalize your experience.",
      icon: <Car className="h-12 w-12 text-[#1982FC]" />
    },
    {
      title: "Your Automotive Interests",
      description: "What aspects of automotive life are you most interested in?",
      icon: <Trophy className="h-12 w-12 text-[#1982FC]" />,
      options: [
        { id: "racing", label: "Racing & Motorsports", description: "Follow events, track days, and motorsport news" },
        { id: "maintenance", label: "Maintenance & DIY", description: "Track maintenance, log repairs, and DIY guides" },
        { id: "detailing", label: "Detailing & Appearance", description: "Product organization, detailing techniques" },
        { id: "drives", label: "Fun Drives & Routes", description: "Plan drives, log experiences, find new routes" }
      ]
    },
    {
      title: "Vehicle Data",
      description: "How would you like to manage your vehicle information?",
      icon: <Wrench className="h-12 w-12 text-[#1982FC]" />,
      options: [
        { id: "manual", label: "Manual Entry", description: "Input your vehicle details manually" },
        { id: "vin", label: "VIN Lookup", description: "We'll decode your vehicle from its VIN" },
        { id: "obd", label: "OBD Connection", description: "Connect via OBD for live vehicle data" },
        { id: "smartcar", label: "Smartcar API", description: "Connect to your vehicle's manufacturer API" }
      ]
    },
    {
      title: "Location Services",
      description: "Enable location features for weather and route planning",
      icon: <MapPin className="h-12 w-12 text-[#1982FC]" />,
      options: [
        { id: "current", label: "Current Location", description: "Use your current location for weather and drive planning" },
        { id: "manual-loc", label: "Manual Entry", description: "Manually input locations" },
        { id: "save-locations", label: "Save Favorite Locations", description: "Save your frequently visited places" }
      ]
    },
    {
      title: "Weather Preferences",
      description: "Configure your Weather Paddock experience",
      icon: <Cloud className="h-12 w-12 text-[#1982FC]" />,
      options: [
        { id: "weather-alerts", label: "Weather Alerts", description: "Get notified about optimal driving conditions" },
        { id: "detailed-forecast", label: "Detailed Forecast", description: "See hour-by-hour forecasts for your routes" },
        { id: "drive-scoring", label: "Drive Quality Scoring", description: "Score driving conditions based on weather" }
      ]
    }
  ];

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Handle checkbox changes
  const handleOptionToggle = (stepIndex: number, optionId: string) => {
    setSelectedOptions(prev => {
      const stepOptions = prev[stepIndex] || [];
      if (stepOptions.includes(optionId)) {
        return {
          ...prev,
          [stepIndex]: stepOptions.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [stepIndex]: [...stepOptions, optionId]
        };
      }
    });
  };

  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If we're at the last step, complete onboarding
      completeOnboarding();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Complete onboarding and navigate to The Paddock
  const completeOnboarding = () => {
    // Save onboarding preferences to localStorage or elsewhere
    localStorage.setItem('paddock20_onboarding_complete', 'true');
    localStorage.setItem('paddock20_onboarding_preferences', JSON.stringify(selectedOptions));
    
    // Close modal and navigate
    setOpen(false);
    navigate('/demo');
  };

  // Skip onboarding
  const skipOnboarding = () => {
    localStorage.setItem('paddock20_onboarding_complete', 'true');
    setOpen(false);
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#1982FC] to-[#08c519] mx-auto mb-6 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">P20</span>
        </div>
        <h1 className="text-3xl font-orbitron bg-gradient-to-r from-[#1982FC] to-[#08c519] bg-clip-text text-transparent mb-4">
          PADDOCK20
        </h1>
        <p className="text-gray-500">
          Personalizing your automotive lifestyle...
        </p>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] bg-black border border-[#333] text-white">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <Progress value={progressPercentage} className="h-2 w-full bg-gray-800" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-950 text-[#1982FC]">
                {steps[currentStep].icon}
              </div>
              <div>
                <DialogTitle className="font-orbitron text-2xl text-white">
                  {steps[currentStep].title}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {steps[currentStep].description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            {/* Options for the current step */}
            {steps[currentStep].options && (
              <div className="space-y-4">
                {steps[currentStep].options.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
                    <Checkbox 
                      id={option.id} 
                      checked={(selectedOptions[currentStep] || []).includes(option.id)}
                      onCheckedChange={() => handleOptionToggle(currentStep, option.id)}
                      className="data-[state=checked]:bg-[#1982FC] data-[state=checked]:text-primary-foreground mt-1"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={option.id}
                        className="text-white font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      {option.description && (
                        <p className="text-gray-400 text-sm">{option.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* First step doesn't have options */}
            {currentStep === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-300">
                  We'll help you set up your PADDOCK20 experience with personalized features based on your preferences.
                </p>
                <p className="text-gray-400 mt-4 text-sm">
                  You can always change these settings later in your profile.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {currentStep > 0 && (
              <Button 
                onClick={goToPreviousStep} 
                variant="outline"
                className="border-[#1982FC]/30 text-[#1982FC] hover:bg-[#1982FC]/10"
              >
                Back
              </Button>
            )}
            
            <div className="flex-grow"></div>
            
            <Button 
              onClick={skipOnboarding} 
              variant="link" 
              className="text-gray-400 hover:text-white"
            >
              Skip
            </Button>
            
            <Button 
              onClick={goToNextStep}
              className="bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:brightness-110 text-white"
            >
              {currentStep < steps.length - 1 ? 'Continue' : 'Enter The Paddock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
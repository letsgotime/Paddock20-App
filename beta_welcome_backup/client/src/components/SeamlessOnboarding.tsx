import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, Car, User, Check, Shield, FileText, ThumbsUp } from 'lucide-react';
import VehicleAdditionMethods from '@/components/vehicle/VehicleAdditionMethods';

// Step definitions for the onboarding process
const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to Paddock20', isSkippable: false },
  { id: 'profile', title: 'Complete Your Profile', isSkippable: false },
  { id: 'agreement', title: 'Terms & Conditions', isSkippable: false },
  { id: 'vehicle', title: 'Add Your Vehicle', isSkippable: true },
  { id: 'complete', title: 'Ready to Go!', isSkippable: false }
];

interface SeamlessOnboardingProps {
  onComplete: () => void;
}

const SeamlessOnboarding: React.FC<SeamlessOnboardingProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [vehicleAdded, setVehicleAdded] = useState(false);
  const [skipVehicleAddition, setSkipVehicleAddition] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Calculate progress percentage based on current step
  useEffect(() => {
    const newProgress = ((currentStepIndex) / (ONBOARDING_STEPS.length - 1)) * 100;
    setProgress(newProgress);
  }, [currentStepIndex]);

  // Handle next step navigation
  const handleNext = () => {
    // If on the vehicle step and user wants to skip
    if (ONBOARDING_STEPS[currentStepIndex].id === 'vehicle' && !vehicleAdded && !skipVehicleAddition) {
      setSkipVehicleAddition(true);
      return;
    }
    
    // If we're on the Terms step, ensure they've agreed
    if (ONBOARDING_STEPS[currentStepIndex].id === 'agreement' && (!agreedToTerms || !agreedToPrivacy)) {
      toast({
        title: "Agreement Required",
        description: "You must agree to the terms and privacy policy to continue.",
        variant: "destructive",
      });
      return;
    }

    // If we're on the last step, complete onboarding
    if (currentStepIndex === ONBOARDING_STEPS.length - 1) {
      handleComplete();
      return;
    }

    // Otherwise, proceed to next step
    setCurrentStepIndex(currentStepIndex + 1);
    window.scrollTo(0, 0);
  };

  // Handle previous step navigation
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle successful vehicle addition
  const handleVehicleAdded = (vehicleData: any) => {
    setVehicleAdded(true);
    
    toast({
      title: "Vehicle Added",
      description: `Your ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} has been added successfully.`,
    });
    
    // Move to the completion step
    setCurrentStepIndex(currentStepIndex + 1);
  };

  // Handle skip vehicle confirmation
  const confirmSkipVehicle = () => {
    setSkipVehicleAddition(false);
    // Move to the completion step
    setCurrentStepIndex(currentStepIndex + 1);
  };

  // Handle onboarding completion
  const handleComplete = () => {
    // Update localStorage to mark onboarding as complete for this user
    if (user?.id) {
      localStorage.setItem(`paddock20_onboarding_complete_${user.id}`, 'true');
      // Only if they agreed to privacy & terms
      localStorage.setItem(`paddock20_legal_agreements_${user.id}`, 'true');
    } else {
      localStorage.setItem('paddock20_onboarding_completed', 'true');
    }

    // Log success
    console.log('Onboarding completed successfully');

    // Show toast notification
    toast({
      title: "Welcome to Paddock20!",
      description: "Your setup is complete. You're all set to explore!",
    });

    // Call the completion callback
    onComplete();
  };

  // Render the current step content
  const renderStepContent = () => {
    const currentStep = ONBOARDING_STEPS[currentStepIndex];

    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <img 
                src="/assets/paddock-logo-blue.png" 
                alt="Paddock20 Logo" 
                className="h-24 mb-4"
                onError={(e) => {
                  // Fallback in case the image fails to load
                  e.currentTarget.style.display = 'none';
                }} 
              />
            </div>
            <h1 className="text-3xl font-orbitron text-[#1982FC]">Welcome to Paddock20</h1>
            <p className="text-gray-300 text-lg">
              Your advanced automotive lifestyle platform
            </p>
            
            <div className="bg-gray-800/50 p-6 rounded-lg mt-8 text-left">
              <h2 className="text-lg font-medium text-white mb-4">What's Included in Your Beta Access:</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-3 mt-0.5">
                    <Car className="h-3.5 w-3.5 text-[#1982FC]" />
                  </div>
                  <p className="text-gray-300">Comprehensive vehicle management and insights</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-3 mt-0.5">
                    <Shield className="h-3.5 w-3.5 text-[#1982FC]" />
                  </div>
                  <p className="text-gray-300">Weather-based drive recommendations</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-3 mt-0.5">
                    <ThumbsUp className="h-3.5 w-3.5 text-[#1982FC]" />
                  </div>
                  <p className="text-gray-300">Exclusive access to premium features during beta</p>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-400 text-sm italic mt-4">
              Let's set up your profile in just a few simple steps. You'll be ready to go in no time!
            </p>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-orbitron text-[#1982FC]">Your Profile</h1>
            <p className="text-gray-300">
              Let's verify your basic profile information.
            </p>
            
            <div className="bg-gray-800/50 p-6 rounded-lg mt-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-[#1982FC]">
                  <AvatarImage src={user?.profileImage || ''} alt={user?.username || 'User'} />
                  <AvatarFallback className="bg-[#1982FC]/20 text-[#1982FC] text-lg">
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white">
                    {user?.fullName || user?.username || 'Car Enthusiast'}
                  </h3>
                  <p className="text-gray-400 text-sm">{user?.email || 'No email provided'}</p>
                  
                  {user?.role && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1982FC]/20 text-[#1982FC] mt-2">
                      {user.role === 'admin' ? 'Admin' : 'Beta Tester'}
                    </span>
                  )}
                </div>
              </div>
              
              <Separator className="my-4 bg-gray-700" />
              
              <p className="text-gray-300 text-sm mt-2">
                Your profile details are automatically imported from your authentication provider.
                You can update these details later in your profile settings.
              </p>
            </div>
            
            <div className="mt-4 text-gray-400 text-sm">
              <p>Don't worry, you can personalize your profile further after completing the onboarding process.</p>
            </div>
          </div>
        );

      case 'agreement':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-orbitron text-[#1982FC]">Terms & Conditions</h1>
            <p className="text-gray-300">
              Please review and accept our terms and conditions to continue.
            </p>
            
            <div className="bg-gray-800/50 p-6 rounded-lg mt-4 space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-[#1982FC]" />
                  Terms of Service
                </h3>
                <div className="max-h-32 overflow-y-auto p-3 bg-black/30 rounded text-sm text-gray-300 mb-3">
                  <p>
                    By using Paddock20, you agree to be bound by these Terms of Service. Paddock20 is a beta platform providing automotive services and content. 
                    We reserve the right to modify, suspend or discontinue any aspect of the service at any time. During this beta phase, certain features may change or be removed.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms} 
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none cursor-pointer text-gray-300"
                  >
                    I agree to the Terms of Service
                  </label>
                </div>
              </div>
              
              <Separator className="my-4 bg-gray-700" />
              
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-[#1982FC]" />
                  Privacy Policy
                </h3>
                <div className="max-h-32 overflow-y-auto p-3 bg-black/30 rounded text-sm text-gray-300 mb-3">
                  <p>
                    Paddock20 values your privacy. We collect information to provide and improve our services. 
                    This may include vehicle data, user preferences, and usage patterns. We employ industry-standard security measures to protect your data.
                    By using Paddock20, you consent to our data practices as described in the full Privacy Policy.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="privacy" 
                    checked={agreedToPrivacy} 
                    onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                    className="data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <label
                    htmlFor="privacy"
                    className="text-sm font-medium leading-none cursor-pointer text-gray-300"
                  >
                    I agree to the Privacy Policy
                  </label>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-400 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              You can review the full legal documents anytime in the site footer.
            </div>
          </div>
        );

      case 'vehicle':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-orbitron text-[#1982FC]">Add Your Vehicle</h1>
            <p className="text-gray-300">
              Adding a vehicle unlocks all of Paddock20's powerful features. Choose from multiple methods to add your vehicle:
            </p>
            
            {skipVehicleAddition ? (
              <div className="bg-gray-800/50 p-6 rounded-lg mt-4">
                <h3 className="text-lg font-medium text-white mb-3">Skip Vehicle Addition?</h3>
                <p className="text-gray-300 mb-4">
                  Are you sure you want to skip adding a vehicle? Many Paddock20 features rely on your vehicle information.
                  You can always add your vehicle later from the Garage section.
                </p>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSkipVehicleAddition(false)}
                    className="flex-1"
                  >
                    Go Back
                  </Button>
                  <Button 
                    onClick={confirmSkipVehicle}
                    className="flex-1 bg-[#1982FC] hover:bg-[#1982FC]/90"
                  >
                    Skip For Now
                  </Button>
                </div>
              </div>
            ) : (
              <VehicleAdditionMethods onVehicleAdded={handleVehicleAdded} />
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-[#1982FC]/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-[#1982FC]" />
              </div>
            </div>
            
            <h1 className="text-3xl font-orbitron text-[#1982FC]">You're All Set!</h1>
            <p className="text-gray-300 text-lg">
              Welcome to the Paddock20 community
            </p>
            
            <div className="bg-gray-800/50 p-6 rounded-lg mt-4 text-left">
              <h3 className="text-lg font-medium text-white mb-3">What's Next?</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-3 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-[#1982FC]" />
                  </div>
                  <p className="text-gray-300">Explore your personalized dashboard</p>
                </li>
                
                {vehicleAdded ? (
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-[#1982FC]" />
                    </div>
                    <p className="text-gray-300">View your vehicle in the Garage Vault</p>
                  </li>
                ) : (
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center mr-3 mt-0.5">
                      <Car className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <p className="text-gray-400">Add a vehicle in the Garage Vault section</p>
                  </li>
                )}
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-3 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-[#1982FC]" />
                  </div>
                  <p className="text-gray-300">Check the Weather Paddock for drive recommendations</p>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-400 text-sm italic mt-4">
              Click "Finish" below to start your Paddock20 experience!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-3xl bg-gradient-to-b from-gray-900 to-black border border-blue-900/40">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-[#1982FC]/20 h-6 w-6 rounded-full flex items-center justify-center">
                <span className="text-[#1982FC] text-xs font-bold">{currentStepIndex + 1}</span>
              </div>
              <CardTitle className="text-lg text-white">
                {ONBOARDING_STEPS[currentStepIndex].title}
              </CardTitle>
            </div>
            
            {ONBOARDING_STEPS[currentStepIndex].isSkippable && !skipVehicleAddition && (
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setSkipVehicleAddition(true)}
              >
                Skip
              </Button>
            )}
          </div>
          
          <Progress value={progress} className="h-1 w-full mt-4 bg-gray-800" 
            indicatorClassName="bg-[#1982FC]" />
        </CardHeader>
        
        <CardContent className="py-6">
          {renderStepContent()}
        </CardContent>
        
        <CardFooter className="border-t border-gray-800 pt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={currentStepIndex === 0 ? 'opacity-0' : ''}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            className="bg-[#1982FC] hover:bg-[#1982FC]/90"
            disabled={(ONBOARDING_STEPS[currentStepIndex].id === 'agreement' && (!agreedToTerms || !agreedToPrivacy))}
          >
            {currentStepIndex === ONBOARDING_STEPS.length - 1 ? (
              <>Finish</>
            ) : (
              <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SeamlessOnboarding;
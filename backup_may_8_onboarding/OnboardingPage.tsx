import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useRoute, Link } from 'wouter';
import { CheckCircle, ArrowRight, AlertTriangle, Car, User, Shield, Wrench, BarChart4, Camera, Upload, Image, FileText, RefreshCw, Mail, UserCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { legalDocuments } from '../data/legalDocuments';
import LegalDocumentModal from '../components/LegalDocumentModal';
import { useToast } from '@/hooks/use-toast';

const OnboardingPage: React.FC = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Legal document states
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [betaAgreed, setBetaAgreed] = useState(false);
  // Get the beta role from localStorage that was set in BetaWelcomePage
  const savedBetaRole = localStorage.getItem('paddock20_selected_beta_role');
  const [betaTesterRequest, setBetaTesterRequest] = useState(savedBetaRole === 'tester'); // Set based on previous selection
  
  // User profile data - pre-populated from authentication
  const [email, setEmail] = useState<string>(user?.email || '');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [drivingExperience, setDrivingExperience] = useState<string>('intermediate');
  const [interests, setInterests] = useState<string[]>([]);
  const [fullName, setFullName] = useState(user?.fullName || user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '');
  const [helmetSize, setHelmetSize] = useState<string>('');
  const [shoeSize, setShoeSize] = useState<string>('');
  const [gloveSizeUS, setGloveSizeUS] = useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  
  // Vehicle data
  const [vehicles, setVehicles] = useState<Array<{
    id?: number;
    make: string;
    model: string;
    year: string;
    vin: string;
    nickname: string;
    primaryVehicle: boolean;
    hasVin: boolean; // Whether the user has a VIN to enter
    vinDecoding: boolean; // Whether VIN decoding is in progress
  }>>([{
    make: '',
    model: '',
    year: '',
    vin: '',
    nickname: '',
    primaryVehicle: true,
    hasVin: false, // Default to manual entry
    vinDecoding: false
  }]);

  // Redirect if already completed onboarding or not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);
  
  // Open legal document modal
  const openLegalDocument = (documentType: string) => {
    setActiveDocument(documentType);
  };
  
  // Legal checkbox validation
  const validateLegalAgreements = () => {
    if (!termsAgreed || !privacyAgreed || !betaAgreed) {
      setError('Please agree to all terms and conditions to continue');
      return false;
    }
    return true;
  };
  
  // Form submission for each step
  const handleContinue = async () => {
    console.log(`Starting onboarding step ${currentStep} validation`);
    
    // Step 1 validation
    if (currentStep === 1) {
      console.log('Step 1 validation data:', { fullName, termsAgreed, privacyAgreed, betaAgreed });
      
      if (!fullName) {
        setError('Please enter your full name');
        console.log('Step 1 validation failed: Missing full name');
        return;
      }
      
      if (!validateLegalAgreements()) {
        console.log('Step 1 validation failed: Legal agreements not accepted');
        return;
      }
      
      console.log('Step 1 validation passed - proceeding to step 2');
      setCurrentStep(2);
      return;
    }
    
    // Step 2 validation
    if (currentStep === 2) {
      console.log('Step 2 validation data:', { vehicles });
      
      const hasCompleteVehicle = vehicles.some(v => 
        v.make && v.model && v.year
      );
      
      if (!hasCompleteVehicle) {
        setError('Please enter at least one vehicle with make, model, and year');
        console.log('Step 2 validation failed: No complete vehicle');
        return;
      }
      
      console.log('Step 2 validation passed - proceeding to step 3');
      setCurrentStep(3);
      return;
    }
    
    if (currentStep === 3) {
      // Final step - submit all data
      console.log('Starting final step (3) submission');
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Step 1: Update user profile
        // Get Auth0 token from localStorage
        const auth0Token = localStorage.getItem('auth0_token');
        console.log('Auth0 token available:', !!auth0Token, 'User available:', !!user);
        
        const profileResponse = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth0Token ? `Bearer ${auth0Token}` : '',
          },
          body: JSON.stringify({
            username, // Allow username to be changed during onboarding
            fullName,
            drivingExperience,
            interests,
            helmetSize,
            shoeSize,
            gloveSizeUS,
            betaTesterRequest, // Include beta tester request status
            // Don't include profile image in JSON, will be uploaded separately
          }),
        });
        
        // Handle profile image upload if one exists
        if (profileImage) {
          const formData = new FormData();
          formData.append('profileImage', profileImage);
          
          const imageResponse = await fetch('/api/user/profile/image', {
            method: 'POST',
            headers: {
              'Authorization': auth0Token ? `Bearer ${auth0Token}` : '',
            },
            body: formData,
          });
          
          if (!imageResponse.ok) {
            console.warn('Failed to upload profile image, but continuing onboarding');
          }
        }
        
        if (!profileResponse.ok) {
          throw new Error('Failed to update profile information');
        }
        
        // If user requested beta tester status, submit that request
        if (betaTesterRequest) {
          try {
            const betaResponse = await fetch('/api/auth/request-beta-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                betaProgram: 'tester',
                hasAgreedToTerms: true,
                hasAgreedToNDA: true,
                feedbackCommitment: true
              }),
            });
            
            if (!betaResponse.ok) {
              console.warn('Beta tester request not completed, but continuing onboarding');
            } else {
              console.log('Beta tester request submitted successfully');
              // Show success toast
              toast({
                title: "Beta Tester Request Submitted",
                description: "Your beta tester request has been submitted for review.",
                variant: "default"
              });
            }
          } catch (error) {
            console.warn('Beta tester request failed, but continuing onboarding', error);
          }
        }
        
        // Step 2: Add vehicles to garage
        for (const vehicle of vehicles) {
          if (!vehicle.make || !vehicle.model || !vehicle.year) {
            continue; // Skip incomplete vehicles
          }
          
          const vehicleResponse = await fetch('/api/garage/vehicles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': auth0Token ? `Bearer ${auth0Token}` : '',
            },
            body: JSON.stringify(vehicle),
          });
          
          if (!vehicleResponse.ok) {
            throw new Error('Failed to add vehicle to garage');
          }
        }
        
        // Set onboarding completion flags in localStorage
        if (user?.id) {
          // Mark beta onboarding as complete
          const betaOnboardingKey = `paddock20_beta_onboarding_complete_${user.id}`;
          localStorage.setItem(betaOnboardingKey, 'true');
          
          // Also mark legal agreements as accepted
          const legalAgreementsKey = `paddock20_legal_agreements_${user.id}`;
          localStorage.setItem(legalAgreementsKey, JSON.stringify({
            accepted: true,
            acceptedDate: new Date().toISOString(),
            version: '1.0'
          }));
          
          // Log detailed information for debugging
          console.log('Onboarding completed successfully. Details:', {
            userId: user.id,
            username: user.username,
            betaOnboardingKey,
            legalAgreementsKey,
            vehiclesAdded: vehicles.length,
            onboardingFlags: {
              betaOnboarding: localStorage.getItem(betaOnboardingKey),
              legalAgreements: localStorage.getItem(legalAgreementsKey)
            }
          });
          
          // Notify the user
          toast({
            title: 'Setup Complete!',
            description: 'Your profile has been set up successfully.',
            variant: 'default'
          });
        } else {
          console.warn('No user ID found when trying to set onboarding flags');
        }
        
        // Before navigation, ensure we can retrieve the flags to verify they were set
        if (user?.id) {
          const betaOnboardingKey = `paddock20_beta_onboarding_complete_${user.id}`;
          const legalAgreementsKey = `paddock20_legal_agreements_${user.id}`;
          
          console.log('Verifying onboarding flags before navigation:', {
            betaOnboardingCompleted: localStorage.getItem(betaOnboardingKey),
            legalAgreementsAccepted: localStorage.getItem(legalAgreementsKey)
          });
          
          // Set a global flag to inform protected routes that onboarding was just completed
          window.localStorage.setItem('paddock20_onboarding_just_completed', 'true');
          
          // All steps completed - redirect to dashboard
          console.log('All onboarding steps completed - redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.error('Cannot navigate to dashboard - user ID not available');
          // Show error toast
          toast({
            title: 'Error Completing Setup',
            description: 'Unable to verify your identity. Please try again or contact support.',
            variant: 'destructive'
          });
        }
        
      } catch (error) {
        console.error('Onboarding error:', error);
        setError(error instanceof Error ? error.message : 'Failed to complete onboarding');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Handle adding or updating a vehicle
  const handleVehicleChange = (index: number, field: string, value: string | boolean) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = {
      ...updatedVehicles[index],
      [field]: value
    };
    setVehicles(updatedVehicles);
  };
  
  // Add a new vehicle form
  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        make: '',
        model: '',
        year: '',
        vin: '',
        nickname: '',
        primaryVehicle: false,
        hasVin: false,
        vinDecoding: false
      }
    ]);
  };
  
  // Decode VIN and auto-fill vehicle information
  const decodeVin = async (index: number, vin: string) => {
    // If VIN is too short, don't attempt to decode
    if (vin.length < 10) return;
    
    // Set the vehicle to decoding state
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = {
      ...updatedVehicles[index],
      vinDecoding: true
    };
    setVehicles(updatedVehicles);
    
    try {
      // Show temporary "Coming Soon" toast instead of actual API call for now
      toast({
        title: "VIN Decoder",
        description: "VIN decoding feature is coming soon!",
        variant: "default"
      });
      
      // Simulated response after "decoding"
      setTimeout(() => {
        const updatedVehicles = [...vehicles];
        updatedVehicles[index] = {
          ...updatedVehicles[index],
          vinDecoding: false,
          // For now we won't auto-fill with mock data per policy
        };
        setVehicles(updatedVehicles);
      }, 1000);
      
      // In a real implementation, this would be an API call:
      /*
      const response = await fetch(`/api/vin/decode?vin=${vin}`);
      if (!response.ok) {
        throw new Error('VIN decoding failed');
      }
      
      const vehicleData = await response.json();
      
      // Update vehicle with decoded information
      const updatedVehicles = [...vehicles];
      updatedVehicles[index] = {
        ...updatedVehicles[index],
        make: vehicleData.make || updatedVehicles[index].make,
        model: vehicleData.model || updatedVehicles[index].model,
        year: vehicleData.year || updatedVehicles[index].year,
        vinDecoding: false
      };
      setVehicles(updatedVehicles);
      */
    } catch (error) {
      console.error('Error decoding VIN:', error);
      // Revert decoding state
      const updatedVehicles = [...vehicles];
      updatedVehicles[index] = {
        ...updatedVehicles[index],
        vinDecoding: false
      };
      setVehicles(updatedVehicles);
      
      // Show error toast
      toast({
        title: 'VIN Decoding Failed',
        description: 'Unable to decode VIN. Please try again or enter vehicle details manually.',
        variant: 'destructive'
      });
    }
  };
  
  // Remove a vehicle form
  const removeVehicle = (index: number) => {
    if (vehicles.length <= 1) return; // Keep at least one vehicle
    const updatedVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
  };
  
  // Handle interest selection
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };
  
  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfileImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // Save file for upload
    setProfileImage(file);
    setError(null);
  };
  
  // Trigger file input click with explicit browser file dialog
  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure we have a reference to the file input
    if (fileInputRef.current) {
      // Create a new click event and dispatch it to truly open the file dialog
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      fileInputRef.current.dispatchEvent(clickEvent);
    }
  };
  
  return (
    <div className="flex min-h-screen overflow-hidden relative">
      {/* Legal Document Modal */}
      {activeDocument && (
        <LegalDocumentModal
          title={activeDocument === 'termsOfService' ? 'Terms of Service' : 
                activeDocument === 'privacyPolicy' ? 'Privacy Policy' : 'Beta Agreement'}
          content={legalDocuments[activeDocument as keyof typeof legalDocuments]}
          isOpen={!!activeDocument}
          onClose={() => setActiveDocument(null)}
          callback={() => {
            if (activeDocument === 'termsOfService') setTermsAgreed(true);
            if (activeDocument === 'privacyPolicy') setPrivacyAgreed(true);
            if (activeDocument === 'betaAgreement') setBetaAgreed(true);
          }}
          isBetaModal={activeDocument === 'betaAgreement'}
          onBetaTesterRequest={(isTester) => setBetaTesterRequest(isTester)}
        />
      )}
      {/* Dynamic F1 background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('/assets/Stock Photos/F1/garage-f1-car.png')`,
          filter: 'brightness(0.2) contrast(1.1)',
        }}
      />
      
      {/* Carbon fiber texture overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70 mix-blend-multiply"
        style={{ 
          backgroundImage: `url('/assets/Stock Photos/F1/carbon-fiber-texture-dark.png')`,
        }}
      />
      
      {/* F1-inspired blue and green racing stripes */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#08c519] z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1982FC] z-10"></div>
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#1982FC] z-10"></div>
      <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#08c519] z-10"></div>
            
      {/* Content container with glassmorphism */}
      <div className="flex w-full min-h-screen items-center justify-center p-6 z-20">
        <div className="backdrop-blur-md bg-black/60 rounded-2xl border border-gray-800 p-8 shadow-2xl max-w-4xl w-full"
          style={{
            boxShadow: `0 0 40px rgba(8, 197, 25, 0.15), 
                        0 0 20px rgba(25, 130, 252, 0.15)`,
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}
        >
          {/* Header and logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="text-[#1982FC]">PADDOCK</span>
              <span className="text-[#08c519]">20</span>
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-[#1982FC] to-[#08c519] mt-2"></div>
            <p className="text-lg text-gray-300 mt-4">Complete your profile setup</p>
          </div>
          
          {/* Progress steps */}
          <div className="flex justify-between items-center mb-8 px-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 ? 'bg-[#1982FC] border-[#1982FC] text-white' : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
                <User size={20} />
              </div>
              <span className={`text-xs mt-2 ${currentStep >= 1 ? 'text-white' : 'text-gray-500'}`}>Enthusiast Details</span>
            </div>
            
            <div className="flex-1 h-1 mx-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-[#1982FC] to-[#08c519]" 
                style={{ width: currentStep >= 2 ? '100%' : '0%', transition: 'width 0.5s' }}
              ></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 ? 'bg-[#08c519] border-[#08c519] text-white' : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
                <Car size={20} />
              </div>
              <span className={`text-xs mt-2 ${currentStep >= 2 ? 'text-white' : 'text-gray-500'}`}>Vehicle VIN</span>
            </div>
            
            <div className="flex-1 h-1 mx-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-[#08c519] to-[#1982FC]" 
                style={{ width: currentStep >= 3 ? '100%' : '0%', transition: 'width 0.5s' }}
              ></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 3 ? 'bg-[#1982FC] border-[#1982FC] text-white' : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
                <Image size={20} />
              </div>
              <span className={`text-xs mt-2 ${currentStep >= 3 ? 'text-white' : 'text-gray-500'}`}>Photo Gallery</span>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/50 border border-red-800 text-white flex items-center space-x-2">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Step content */}
          <div className="mt-6">
            {/* Step 1: Personal Info & Enthusiast Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>DRIVER PROFILE</h2>
                
                {/* Account Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <UserCircle className="w-4 h-4 mr-1 text-[#1982FC]" />
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      className="w-full rounded-md bg-gray-700/50 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">Choose a unique username for your profile</p>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1 text-[#1982FC]" />
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-md bg-gray-700/50 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                      value={email}
                      readOnly
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email used for account notifications</p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Driving Experience
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div 
                      className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                        drivingExperience === 'beginner' 
                          ? 'bg-[#1982FC]/20 border-[#1982FC]' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setDrivingExperience('beginner')}
                    >
                      <p className="font-medium text-white">Beginner</p>
                      <p className="text-xs text-gray-400 mt-1">New to car care and maintenance</p>
                    </div>
                    <div 
                      className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                        drivingExperience === 'intermediate' 
                          ? 'bg-[#1982FC]/20 border-[#1982FC]' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setDrivingExperience('intermediate')}
                    >
                      <p className="font-medium text-white">Intermediate</p>
                      <p className="text-xs text-gray-400 mt-1">Familiar with basic maintenance</p>
                    </div>
                    <div 
                      className={`cursor-pointer rounded-lg border p-4 text-center transition-all ${
                        drivingExperience === 'advanced' 
                          ? 'bg-[#1982FC]/20 border-[#1982FC]' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setDrivingExperience('advanced')}
                    >
                      <p className="font-medium text-white">Advanced</p>
                      <p className="text-xs text-gray-400 mt-1">Experienced enthusiast</p>
                    </div>
                  </div>
                </div>
                
                {/* Legal Agreements Section */}
                <div className="pt-6 border-t border-gray-700 mt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">LEGAL AGREEMENTS</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Please review and accept our terms to activate your Paddock20 membership
                  </p>
                  
                  <div className="space-y-4">
                    {/* Terms of Service */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="terms"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-700 rounded bg-gray-800 accent-[#08c519]"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="terms" className="text-sm text-gray-200 font-medium">
                          I have read and agree to the <button 
                            type="button"
                            className="text-[#1982FC] hover:underline"
                            onClick={() => openLegalDocument('termsOfService')}
                          >Terms of Service</button>
                        </label>
                        <p className="text-xs text-gray-400 mt-1">
                          The Terms of Service outline your rights and obligations when using Paddock20, including acceptable use policies, intellectual property rights, and liability limitations.
                        </p>
                      </div>
                    </div>
                    
                    {/* Privacy Policy */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="privacy"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-700 rounded bg-gray-800 accent-[#08c519]"
                          checked={privacyAgreed}
                          onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="privacy" className="text-sm text-gray-200 font-medium">
                          I have read and agree to the <button 
                            type="button"
                            className="text-[#1982FC] hover:underline"
                            onClick={() => openLegalDocument('privacyPolicy')}
                          >Privacy Policy</button>
                        </label>
                        <p className="text-xs text-gray-400 mt-1">
                          Our Privacy Policy explains how we collect, use, store, and protect your personal information, including your rights regarding your data and our data retention practices.
                        </p>
                      </div>
                    </div>
                    
                    {/* Beta Agreement */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="beta"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-700 rounded bg-gray-800 accent-[#08c519]"
                          checked={betaAgreed}
                          onChange={(e) => setBetaAgreed(e.target.checked)}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="beta" className="text-sm text-gray-200 font-medium">
                          I have read and agree to the <button 
                            type="button"
                            className="text-[#1982FC] hover:underline"
                            onClick={() => openLegalDocument('betaAgreement')}
                          >Beta Agreement</button>
                        </label>
                        <p className="text-xs text-gray-400 mt-1">
                          The Beta Agreement covers special considerations for beta testers, including feature limitations, feedback expectations, reporting bugs, and confidentiality requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ENTHUSIAST DETAILS - Helmet & Shoe Size */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">ENTHUSIAST GEAR DETAILS</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    For Motorsport events, karting, and hospitality packages we provide customized gear. Help us get your fit right.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label htmlFor="helmetSize" className="block text-sm font-medium text-gray-300 mb-2">
                        Helmet Size
                      </label>
                      <select
                        id="helmetSize"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                        value={helmetSize}
                        onChange={(e) => setHelmetSize(e.target.value)}
                      >
                        <option value="">Select Helmet Size</option>
                        <option value="XS">X-Small (53-54 cm)</option>
                        <option value="S">Small (55-56 cm)</option>
                        <option value="M">Medium (57-58 cm)</option>
                        <option value="L">Large (59-60 cm)</option>
                        <option value="XL">X-Large (61-62 cm)</option>
                        <option value="XXL">XX-Large (63-64 cm)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="shoeSize" className="block text-sm font-medium text-gray-300 mb-2">
                        Shoe Size (US Men's)
                      </label>
                      <select
                        id="shoeSize"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                        value={shoeSize}
                        onChange={(e) => setShoeSize(e.target.value)}
                      >
                        <option value="">Select Shoe Size</option>
                        <option value="6">US 6</option>
                        <option value="6.5">US 6.5</option>
                        <option value="7">US 7</option>
                        <option value="7.5">US 7.5</option>
                        <option value="8">US 8</option>
                        <option value="8.5">US 8.5</option>
                        <option value="9">US 9</option>
                        <option value="9.5">US 9.5</option>
                        <option value="10">US 10</option>
                        <option value="10.5">US 10.5</option>
                        <option value="11">US 11</option>
                        <option value="11.5">US 11.5</option>
                        <option value="12">US 12</option>
                        <option value="12.5">US 12.5</option>
                        <option value="13">US 13</option>
                        <option value="14">US 14</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="gloveSizeUS" className="block text-sm font-medium text-gray-300 mb-2">
                        Glove Size (US)
                      </label>
                      <select
                        id="gloveSizeUS"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                        value={gloveSizeUS}
                        onChange={(e) => setGloveSizeUS(e.target.value)}
                      >
                        <option value="">Select Glove Size</option>
                        <option value="XS">X-Small</option>
                        <option value="S">Small</option>
                        <option value="M">Medium</option>
                        <option value="L">Large</option>
                        <option value="XL">X-Large</option>
                        <option value="XXL">XX-Large</option>
                      </select>
                    </div>

                    {/* Profile Image Upload with enhanced UI */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profile Photo
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <div className="relative">
                        <div 
                          onClick={triggerFileInput}
                          className="w-full h-44 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-700 hover:border-[#1982FC] cursor-pointer transition-colors bg-gray-800/50 overflow-hidden"
                        >
                          {profileImagePreview ? (
                            <>
                              <img 
                                src={profileImagePreview} 
                                alt="Profile preview" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  onClick={triggerFileInput}
                                  className="bg-gray-900/80 hover:bg-gray-800 text-white py-2 px-4 rounded-md shadow-lg transition-all flex items-center space-x-2"
                                >
                                  <RefreshCw size={16} />
                                  <span>Change Photo</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <Camera size={40} className="text-[#1982FC] mb-3" />
                              <p className="text-sm text-gray-300 font-medium">Click to choose a profile photo</p>
                              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF or WEBP (max 5MB)</p>
                              <button 
                                onClick={triggerFileInput}
                                className="mt-3 bg-gray-800 hover:bg-gray-700 text-white py-1.5 px-3 rounded-md border border-gray-700 transition-colors text-sm"
                              >
                                Select Image
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Vehicle Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>GARAGE VAULT</h2>
                  <button
                    type="button"
                    onClick={addVehicle}
                    className="text-sm py-2 px-4 rounded-md bg-[#08c519]/20 border border-[#08c519]/50 text-[#08c519] hover:bg-[#08c519]/30 transition-colors"
                  >
                    Add Vehicle
                  </button>
                </div>
                
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="p-5 rounded-lg border border-gray-700 bg-gray-900/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Vehicle {index + 1}</h3>
                      {vehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVehicle(index)}
                          className="text-xs py-1 px-2 rounded bg-red-900/30 border border-red-800/30 text-red-400 hover:bg-red-900/50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`make-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Make
                        </label>
                        <input
                          id={`make-${index}`}
                          type="text"
                          className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                          placeholder="e.g. BMW, Porsche, Tesla"
                          value={vehicle.make}
                          onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`model-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Model
                        </label>
                        <input
                          id={`model-${index}`}
                          type="text"
                          className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                          placeholder="e.g. M3, 911, Model S"
                          value={vehicle.model}
                          onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`year-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Year
                        </label>
                        <input
                          id={`year-${index}`}
                          type="text"
                          className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                          placeholder="e.g. 2023"
                          value={vehicle.year}
                          onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`nickname-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Nickname (Optional)
                        </label>
                        <input
                          id={`nickname-${index}`}
                          type="text"
                          className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                          placeholder="e.g. The Beast, Silver Bullet"
                          value={vehicle.nickname}
                          onChange={(e) => handleVehicleChange(index, 'nickname', e.target.value)}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor={`vin-${index}`} className="block text-sm font-medium text-gray-300">
                            Do you have a VIN?
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`vin-yes-${index}`}
                                name={`has-vin-${index}`}
                                checked={vehicle.hasVin}
                                onChange={() => handleVehicleChange(index, 'hasVin', true)}
                                className="text-[#1982FC] focus:ring-[#1982FC]"
                              />
                              <label htmlFor={`vin-yes-${index}`} className="text-sm text-gray-300">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`vin-no-${index}`}
                                name={`has-vin-${index}`}
                                checked={!vehicle.hasVin}
                                onChange={() => handleVehicleChange(index, 'hasVin', false)}
                                className="text-[#1982FC] focus:ring-[#1982FC]"
                              />
                              <label htmlFor={`vin-no-${index}`} className="text-sm text-gray-300">No</label>
                            </div>
                          </div>
                        </div>
                        
                        {vehicle.hasVin && (
                          <div className="space-y-2">
                            <input
                              id={`vin-${index}`}
                              type="text"
                              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-[#1982FC] focus:outline-none"
                              placeholder="Enter Vehicle Identification Number"
                              value={vehicle.vin}
                              onChange={(e) => {
                                handleVehicleChange(index, 'vin', e.target.value);
                                // If the VIN is long enough, try to decode it
                                if (e.target.value.length >= 17) {
                                  decodeVin(index, e.target.value);
                                }
                              }}
                            />
                            
                            {vehicle.vinDecoding && (
                              <div className="flex items-center space-x-2 text-sm text-[#1982FC] mt-1">
                                <div className="animate-spin h-4 w-4 border-2 border-[#1982FC] border-t-transparent rounded-full"></div>
                                <span>Decoding VIN...</span>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              className="mt-2 py-1 px-3 text-xs rounded bg-[#1982FC]/20 border border-[#1982FC]/40 text-[#1982FC] hover:bg-[#1982FC]/30 transition-colors flex items-center space-x-1"
                              onClick={() => decodeVin(index, vehicle.vin)}
                              disabled={!vehicle.vin || vehicle.vin.length < 10 || vehicle.vinDecoding}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Decode VIN</span>
                            </button>
                            
                            <p className="mt-1 text-xs text-gray-400">
                              The VIN allows us to provide detailed specifications and service records for your vehicle.
                            </p>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          The VIN allows us to provide detailed specifications and service records for your vehicle.
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="flex items-center">
                          <input
                            id={`primary-${index}`}
                            type="checkbox"
                            className="w-4 h-4 text-[#08c519] bg-gray-700 border-gray-600 rounded focus:ring-[#1982FC]"
                            checked={vehicle.primaryVehicle}
                            onChange={(e) => {
                              // Make this vehicle primary and all others non-primary
                              const updatedVehicles = vehicles.map((v, i) => ({
                                ...v,
                                primaryVehicle: i === index
                              }));
                              setVehicles(updatedVehicles);
                            }}
                          />
                          <label htmlFor={`primary-${index}`} className="ml-2 text-sm text-gray-300">
                            Set as primary vehicle
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Step 3: Vehicle Gallery */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>AUTOMOTIVE GALLERY</h2>
                <p className="text-gray-300 mb-4">Upload photos of your vehicles to showcase in your profile and share with the community</p>
                
                <div className="p-6 rounded-lg border border-gray-700 bg-gray-900/50">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Photo Gallery</h3>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#1982FC]/30 text-[#1982FC]">
                      Beta Feature
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-6">
                    Share your passion with the community. Upload photos of your vehicle in action, 
                    detail sessions, or epic locations. Your uploads will be featured in your profile's gallery.
                  </p>
                  
                  {/* Gallery Upload Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Upload Box */}
                    <div 
                      onClick={triggerFileInput} 
                      className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 hover:border-[#1982FC] cursor-pointer transition-colors bg-gray-800/50"
                    >
                      <Upload size={32} className="text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400">Upload Photos</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (max 5MB)</p>
                    </div>
                    
                    {/* Preview of uploaded photo */}
                    {profileImagePreview && (
                      <div className="aspect-square relative rounded-lg overflow-hidden group">
                        <img src={profileImagePreview} alt="Vehicle" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            className="text-white bg-red-600/70 hover:bg-red-600 rounded-full p-2"
                            onClick={() => {
                              setProfileImage(null);
                              setProfileImagePreview('');
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Empty placeholder boxes */}
                    <div className="aspect-square rounded-lg bg-gray-800/30 border border-gray-800 flex items-center justify-center">
                      <p className="text-xs text-gray-600">Empty Slot</p>
                    </div>
                    <div className="aspect-square rounded-lg bg-gray-800/30 border border-gray-800 flex items-center justify-center">
                      <p className="text-xs text-gray-600">Empty Slot</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-[#1982FC]/10 border border-[#1982FC]/30">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1982FC]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-[#1982FC]">PREMIUM GALLERY COMING SOON</h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Premium users will have access to expanded storage, higher resolution uploads, 
                          and access to professional photoshoot locations in select cities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Interests Selection (moved from main focus but kept) */}
                <div className="pt-6 border-t border-gray-800 mt-8">
                  <h3 className="text-xl font-semibold text-white mb-4">AUTOMOTIVE INTERESTS</h3>
                  <p className="text-gray-300 mb-4">Select areas that interest you for a personalized experience</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'detailing', label: 'Detailing & Paint Correction', icon: <Shield size={18} /> },
                      { id: 'performance', label: 'Performance Modifications', icon: <BarChart4 size={18} /> },
                      { id: 'maintenance', label: 'Maintenance & DIY', icon: <Wrench size={18} /> },
                      { id: 'driving', label: 'Driving Experience & Routes', icon: <Car size={18} /> },
                      { id: 'trackdays', label: 'Track Days & Racing', icon: <Car size={18} /> }
                    ].map(interest => (
                      <div
                        key={interest.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-all flex items-center ${
                          interests.includes(interest.id) 
                            ? 'bg-[#1982FC]/20 border-[#1982FC]' 
                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                        }`}
                        onClick={() => toggleInterest(interest.id)}
                      >
                        <div className={`mr-3 ${interests.includes(interest.id) ? 'text-[#1982FC]' : 'text-gray-400'}`}>
                          {interest.icon}
                        </div>
                        <p className="font-medium text-white">{interest.label}</p>
                        {interests.includes(interest.id) && (
                          <CheckCircle size={18} className="ml-auto text-[#08c519]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prevStep => prevStep - 1)}
                className="py-2 px-4 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div> // Empty div for spacing
            )}
            
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="flex items-center justify-center py-2 px-6 rounded-md bg-gradient-to-r from-[#1982FC] to-[#08c519] text-white font-medium tracking-wide hover:from-[#1671e0] hover:to-[#07b016] focus:outline-none transition-all duration-200 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : currentStep < 3 ? (
                <>
                  Continue <ArrowRight size={16} className="ml-2" />
                </>
              ) : (
                <>
                  Complete Setup <CheckCircle size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
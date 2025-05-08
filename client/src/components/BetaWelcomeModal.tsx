/**
 * ⚠️ BETA FILE PROTECTION ⚠️
 * 
 * WARNING: This file is part of the Beta Program core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the beta enrollment process.
 * 
 * Last verified: May 08, 2025
 */

import React, { useState, useEffect } from 'react';
import { X, Zap, ClipboardCheck, Shield, Car, CheckCircle, User, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: (betaRole?: 'user' | 'tester') => void;
}

// Carolina blue color code for consistent branding
const CAROLINA_BLUE = '#1982FC';
const GOTIME_GREEN = '#08c519';

const BetaWelcomeModal: React.FC<BetaWelcomeModalProps> = ({ isOpen, onClose }) => {
  // Current step state (1-6)
  const [step, setStep] = useState(1);
  const [betaRole, setBetaRole] = useState<'user' | 'tester'>('user');
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Legal agreement tracking
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    betaAgreement: false
  });
  
  // Check if legal agreements are complete
  const allAgreed = Object.values(agreements).every(value => value === true);
  
  // Handle checkbox changes for legal agreements
  const handleAgreementChange = (agreement: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [agreement]: !prev[agreement]
    }));
    setError(null);
  };
  
  // Reset exit animation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false);
      setStep(1); // Reset to first step when reopened
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  // Handle next step navigation
  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 3 && !allAgreed) {
      setError('You must accept all agreements to continue');
      return;
    }
    
    // Final step - complete flow
    if (step === 6) {
      // Start exit animation
      setIsExiting(true);
      
      // Delay actual close to allow for animation
      setTimeout(() => {
        onClose(betaRole);
      }, 400); // Match this with the CSS transition duration
      return;
    }
    
    // Move to next step
    setStep(prev => prev + 1);
    setError(null);
  };
  
  // Handle previous step navigation
  const handlePrevious = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setError(null);
    }
  };
  
  // Base modal classes
  const modalClasses = `
    fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto
    transition-opacity duration-300 ease-in-out
    ${isExiting ? 'opacity-0' : 'opacity-100'}
  `;
  
  // Content animation classes
  const contentClasses = `
    bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg 
    max-w-2xl w-full md:w-3/4 lg:w-2/3 relative mx-auto my-8
    transition-all duration-400 ease-in-out
    ${isExiting ? 'transform translate-y-8 scale-95 opacity-0' : 'transform translate-y-0 scale-100 opacity-100'}
  `;
  
  // Get step icon
  const getStepIcon = () => {
    switch (step) {
      case 1: return <User className="h-6 w-6 text-[#1982FC]" />;
      case 2: return <Car className="h-6 w-6 text-[#1982FC]" />;
      case 3: return <Shield className="h-6 w-6 text-[#1982FC]" />;
      case 4: return <User className="h-6 w-6 text-[#1982FC]" />;
      case 5: return <Zap className="h-6 w-6 text-[#1982FC]" />;
      case 6: return <CheckCircle className="h-6 w-6 text-[#08c519]" />;
      default: return <User className="h-6 w-6 text-[#1982FC]" />;
    }
  };
  
  // Get step title
  const getStepTitle = () => {
    switch (step) {
      case 1: return <span style={{ color: CAROLINA_BLUE }}>WELCOME TO <span style={{ color: CAROLINA_BLUE }}>PADDOCK</span><span style={{ color: GOTIME_GREEN }}>20</span> <span style={{ color: GOTIME_GREEN }}>BETA</span></span>;
      case 2: return <span style={{ color: CAROLINA_BLUE }}>ABOUT <span style={{ color: CAROLINA_BLUE }}>PADDOCK</span><span style={{ color: GOTIME_GREEN }}>20</span> <span style={{ color: GOTIME_GREEN }}>BETA</span></span>;
      case 3: return <span style={{ color: CAROLINA_BLUE }}>LEGAL AGREEMENTS REQUIRED</span>;
      case 4: return <span style={{ color: CAROLINA_BLUE }}>YOUR <span style={{ color: CAROLINA_BLUE }}>PADDOCK</span><span style={{ color: GOTIME_GREEN }}>20</span> PROFILE</span>;
      case 5: return <span style={{ color: CAROLINA_BLUE }}>CHOOSE YOUR BETA ROLE</span>;
      case 6: return <span style={{ color: GOTIME_GREEN }}>READY TO ENTER THE PADDOCK</span>;
      default: return <span style={{ color: CAROLINA_BLUE }}>WELCOME TO <span style={{ color: CAROLINA_BLUE }}>PADDOCK</span><span style={{ color: GOTIME_GREEN }}>20</span></span>;
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <p className="text-gray-300">
              You've been granted early access to explore and test the PADDOCK20 automotive lifestyle platform.
            </p>
            <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[#1982FC] mb-2">What to expect:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Premium automotive enthusiast features</li>
                <li>Cutting-edge tools and insights for your vehicles</li>
                <li>Early access to new features as they're developed</li>
                <li>The ability to provide feedback that shapes the future of Paddock20</li>
              </ul>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <p className="text-gray-300">
              PADDOCK20 is a complete automotive lifestyle platform designed for enthusiasts like you. Here's what makes it special:
            </p>
            <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-3 text-gray-300">
                <li className="font-medium text-white">The Paddock
                  <p className="font-normal text-gray-400 mt-1">Your automotive command center with personalized insights and controls</p>
                </li>
                <li className="font-medium text-white">Weather Paddock
                  <p className="font-normal text-gray-400 mt-1">Detailed driving conditions and recommendations based on real-time weather</p>
                </li>
                <li className="font-medium text-white">Garage Vault
                  <p className="font-normal text-gray-400 mt-1">Secure storage for your vehicle details, maintenance records, and more</p>
                </li>
                <li className="font-medium text-white">Juice Box
                  <p className="font-normal text-gray-400 mt-1">Premium detailing guides and tracking for keeping your ride in perfect condition</p>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <p className="text-gray-300">
              Before proceeding, please review and accept the following agreements:
            </p>
            <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={agreements.termsOfService}
                    onCheckedChange={() => handleAgreementChange('termsOfService')}
                    className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <div>
                    <Label htmlFor="terms" className="text-white">Terms of Service</Label>
                    <p className="text-gray-400 text-sm mt-0.5">
                      I agree to the <a href="#" className="text-[#1982FC] hover:underline">Terms of Service</a> and acknowledge that my use of PADDOCK20 is subject to these terms.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="privacy" 
                    checked={agreements.privacyPolicy}
                    onCheckedChange={() => handleAgreementChange('privacyPolicy')}
                    className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <div>
                    <Label htmlFor="privacy" className="text-white">Privacy Policy</Label>
                    <p className="text-gray-400 text-sm mt-0.5">
                      I have read and agree to the <a href="#" className="text-[#1982FC] hover:underline">Privacy Policy</a> and understand how my data will be used.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="beta" 
                    checked={agreements.betaAgreement}
                    onCheckedChange={() => handleAgreementChange('betaAgreement')}
                    className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <div>
                    <Label htmlFor="beta" className="text-white">Beta Program Agreement</Label>
                    <p className="text-gray-400 text-sm mt-0.5">
                      I understand that I am accessing a beta version of PADDOCK20 that may contain bugs or incomplete features. I agree to provide feedback when requested.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
                {error}
              </div>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <p className="text-gray-300">
              Your PADDOCK20 profile has been pre-configured with the information from your account. You'll be able to customize it further after setup.
            </p>
            <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[#1982FC] mb-2">Profile Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Customizable user dashboard</li>
                <li>Vehicle management system</li>
                <li>Personalized driving insights</li>
                <li>Community engagement options</li>
                <li>Goal tracking and achievements</li>
              </ul>
            </div>
            <p className="text-gray-400 text-sm italic">
              You'll be able to set up your vehicles and preferences during the onboarding process.
            </p>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <p className="text-gray-300">
              Select your preferred beta participation level:
            </p>
            <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-4">            
              <RadioGroup 
                value={betaRole} 
                onValueChange={(value) => setBetaRole(value as 'user' | 'tester')}
                className="gap-4"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50">
                  <RadioGroupItem 
                    value="user" 
                    id="beta-role-user" 
                    className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <div className="flex-1">
                    <Label htmlFor="beta-role-user" className="text-white font-medium flex items-center cursor-pointer">
                      <Zap className="h-4 w-4 mr-2 text-[#1982FC]" />
                      Beta User
                    </Label>
                    <p className="text-gray-400 text-sm mt-1">
                      Access the beta program with basic feedback options. Ideal for users who want to try new features without additional commitments.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50">
                  <RadioGroupItem 
                    value="tester" 
                    id="beta-role-tester"
                    className="mt-1 data-[state=checked]:bg-[#08c519] data-[state=checked]:border-[#08c519]"
                  />
                  <div className="flex-1">
                    <Label htmlFor="beta-role-tester" className="text-white font-medium flex items-center cursor-pointer">
                      <ClipboardCheck className="h-4 w-4 mr-2 text-[#08c519]" />
                      Beta Tester
                    </Label>
                    <p className="text-gray-400 text-sm mt-1">
                      Enhanced program with priority access to features and direct input on product development. Includes additional feedback responsibilities.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#08c519]/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#08c519]" />
              </div>
            </div>
            <h3 className="text-xl text-center font-medium text-[#08c519]">You're all set!</h3>
            <p className="text-gray-300 text-center">
              You've completed the PADDOCK20 beta enrollment process. Click the button below to continue to the onboarding process where you'll set up your vehicle and preferences.
            </p>
            <div className="bg-gray-900/70 border border-[#08c519]/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-2">What happens next:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Set up your vehicle profile</li>
                <li>Configure your dashboard</li>
                <li>Explore the various features</li>
                <li>Provide feedback on your experience</li>
              </ul>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={modalClasses}>
      <div className={contentClasses}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1982FC] to-[#08c519]"></div>
        <div className="absolute top-1 right-0 w-4 h-20 bg-gradient-to-b from-[#08c519] opacity-40"></div>
        <div className="absolute bottom-20 left-0 w-4 h-20 bg-gradient-to-t from-[#1982FC] opacity-40"></div>
        
        {/* Close button */}
        <button 
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onClose(betaRole), 400);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header with step title */}
        <div className="border-b border-gray-800 p-6 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-3">
            {getStepIcon()}
            <h2 className="text-2xl font-bold font-orbitron">
              {getStepTitle()}
            </h2>
          </div>
          
          {/* Step indicator */}
          <div className="text-sm font-medium text-gray-400">
            Step {step} / 6
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-6">
          {renderStepContent()}
        </div>
        
        {/* Footer with navigation */}
        <div className="border-t border-gray-800 p-6 flex justify-between items-center bg-gray-900/30">
          {step > 1 ? (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center"
            >
              <ChevronLeft className="mr-1" size={18} />
              <span>Previous</span>
            </button>
          ) : (
            <div></div> // Empty div to maintain layout with justify-between
          )}
          
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-[#1982FC] hover:bg-[#1982FC]/90 rounded-md text-white transition-colors flex items-center"
            disabled={step === 3 && !allAgreed}
          >
            <span>{step === 6 ? 'Complete Setup' : 'Continue'}</span>
            <ChevronRight className="ml-1" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetaWelcomeModal;
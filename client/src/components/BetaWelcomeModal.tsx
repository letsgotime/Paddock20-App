/**
 * ⚠️ BETA FILE PROTECTION ⚠️
 * 
 * WARNING: This file is part of the Beta Program core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the beta enrollment process.
 * 
 * Last verified: May 08, 2025
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Zap, ClipboardCheck, Shield, Car, CheckCircle, User, Flag, 
  ChevronRight, ChevronLeft, XCircle, Speedometer, Award,
  Settings, Gauge, Sparkles, Lightning, Activity, Compass
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';

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
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Animation state
  const [animationCount, setAnimationCount] = useState(0);
  
  // Legal agreement tracking
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    betaAgreement: false
  });
  
  // Animation trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationCount(prev => (prev + 1) % 5);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
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
      }, 500); // Match this with the CSS transition duration
      return;
    }
    
    // Start exit animation for current step
    setIsExiting(true);
    
    // After a short delay, move to next step with entrance animation
    setTimeout(() => {
      setStep(prev => prev + 1);
      setError(null);
      setIsExiting(false);
    }, 300);
  };
  
  // Handle previous step navigation
  const handlePrevious = () => {
    if (step > 1) {
      // Start exit animation for current step
      setIsExiting(true);
      
      // After a short delay, move to previous step with entrance animation
      setTimeout(() => {
        setStep(prev => prev - 1);
        setError(null);
        setIsExiting(false);
      }, 300);
    }
  };
  
  // Handle terms decline - logs user out and redirects to auth
  const handleDecline = () => {
    // Start exit animation
    setIsExiting(true);
    
    // Small delay to allow animation
    setTimeout(() => {
      // Clear any beta-related localStorage items
      localStorage.removeItem('paddock20_beta_status');
      
      // Perform logout
      logout();
      
      // Redirect to auth page
      setLocation('/auth');
    }, 500);
  };
  
  // Base modal classes with enhanced backdrop
  const modalClasses = `
    fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto
    transition-opacity duration-500 ease-in-out backdrop-blur-lg
    ${isExiting ? 'opacity-0' : 'opacity-100'}
  `;
  
  // Content animation classes with F1-inspired design
  const contentClasses = `
    bg-gradient-to-b from-gray-900 to-black border border-[#1982FC]/30 rounded-lg 
    max-w-4xl w-full md:w-4/5 relative mx-auto my-8 overflow-hidden
    transition-all duration-500 ease-in-out shadow-2xl shadow-[#1982FC]/20
    ${isExiting ? 'transform translate-y-8 scale-95 opacity-0' : 'transform translate-y-0 scale-100 opacity-100'}
  `;
  
  // Get step icon with enhanced styling
  const getStepIcon = () => {
    switch (step) {
      case 1: return <Flag className="h-7 w-7 text-[#1982FC] drop-shadow-glow" />;
      case 2: return <Car className="h-7 w-7 text-[#1982FC] drop-shadow-glow" />;
      case 3: return <Shield className="h-7 w-7 text-[#1982FC] drop-shadow-glow" />;
      case 4: return <User className="h-7 w-7 text-[#1982FC] drop-shadow-glow" />;
      case 5: return <Zap className="h-7 w-7 text-[#1982FC] drop-shadow-glow" />;
      case 6: return <CheckCircle className="h-7 w-7 text-[#08c519] drop-shadow-glow" />;
      default: return <Flag className="h-7 w-7 text-[#1982FC] drop-shadow-glow" />;
    }
  };
  
  // Get step title with enhanced styling
  const getStepTitle = () => {
    switch (step) {
      case 1: return <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1982FC] to-[#08c519] font-orbitron tracking-wider">WELCOME TO <span className="font-bold">PADDOCK<span className="text-[#08c519]">20</span></span> <span className="text-[#08c519] font-bold">BETA</span></span>;
      case 2: return <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1982FC] to-[#08c519] font-orbitron tracking-wider">ABOUT <span className="font-bold">PADDOCK<span className="text-[#08c519]">20</span></span> <span className="text-[#08c519] font-bold">BETA</span></span>;
      case 3: return <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1982FC] to-[#08c519] font-orbitron tracking-wider">LEGAL AGREEMENTS REQUIRED</span>;
      case 4: return <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1982FC] to-[#08c519] font-orbitron tracking-wider">YOUR <span className="font-bold">PADDOCK<span className="text-[#08c519]">20</span></span> PROFILE</span>;
      case 5: return <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1982FC] to-[#08c519] font-orbitron tracking-wider">CHOOSE YOUR BETA ROLE</span>;
      case 6: return <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08c519] to-[#1982FC] font-orbitron tracking-wider">READY TO ENTER THE PADDOCK</span>;
      default: return <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1982FC] to-[#08c519] font-orbitron tracking-wider">WELCOME TO <span className="font-bold">PADDOCK<span className="text-[#08c519]">20</span></span></span>;
    }
  };
  
  // Enhanced progress indicator with F1-inspired styling
  const renderProgressIndicator = () => {
    return (
      <div className="relative mt-6 mb-2">
        {/* Track background */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          {/* Progress fill */}
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#1982FC] to-[#08c519]"
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
        
        {/* Step markers */}
        <div className="flex justify-between absolute -top-3 left-0 right-0">
          {[1, 2, 3, 4, 5, 6].map((dot) => (
            <div 
              key={dot}
              className={`
                flex flex-col items-center transition-all duration-300 -ml-2 first:ml-0 last:ml-0
              `}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center border-2
                transition-all duration-300
                ${dot <= step 
                  ? 'border-[#1982FC] bg-gray-900 shadow-glow' 
                  : 'border-gray-600 bg-gray-800'}
              `}>
                <span className={`text-xs font-bold ${dot <= step ? 'text-[#1982FC]' : 'text-gray-500'}`}>
                  {dot}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="relative bg-gray-900/50 rounded-lg p-6 overflow-hidden">
              {/* F1-inspired diagonal stripes */}
              <div className="absolute -right-4 top-0 w-28 h-2 bg-[#1982FC] transform rotate-45"></div>
              <div className="absolute -right-4 top-4 w-28 h-1 bg-[#08c519] transform rotate-45"></div>
              
              <p className="text-gray-300 text-lg relative z-10">
                You've been granted early access to explore and test the PADDOCK20 automotive lifestyle platform.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-[#1982FC]/20 rounded-lg overflow-hidden relative">
              {/* Racing stripe decoration */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1982FC] to-[#08c519]"></div>
              
              <div className="p-5">
                <h3 className="text-lg font-orbitron text-[#1982FC] mb-3 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-black mr-2 flex items-center justify-center border border-[#1982FC]/50">
                    <Zap size={18} className="text-[#1982FC]" />
                  </span>
                  WHAT TO EXPECT
                </h3>
                <ul className="space-y-3 pl-5">
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="mt-1 min-w-5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={12} className="text-[#1982FC]" />
                      </div>
                    </div>
                    <span>Premium automotive enthusiast features optimized for performance</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="mt-1 min-w-5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={12} className="text-[#1982FC]" />
                      </div>
                    </div>
                    <span>Cutting-edge tools and telemetry insights for your vehicles</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="mt-1 min-w-5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={12} className="text-[#1982FC]" />
                      </div>
                    </div>
                    <span>Early access to exclusive features as they're developed</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300">
                    <div className="mt-1 min-w-5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={12} className="text-[#1982FC]" />
                      </div>
                    </div>
                    <span>Direct input that shapes the future of PADDOCK20</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {renderProgressDots()}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="relative bg-gray-900/50 rounded-lg p-6 overflow-hidden">
              {/* F1-inspired diagonal stripes */}
              <div className="absolute -right-4 top-0 w-28 h-2 bg-[#1982FC] transform rotate-45"></div>
              <div className="absolute -right-4 top-4 w-28 h-1 bg-[#08c519] transform rotate-45"></div>
              
              <p className="text-gray-300 text-lg relative z-10">
                PADDOCK20 is a complete automotive lifestyle platform designed by enthusiasts, for enthusiasts.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-[#1982FC]/20 rounded-lg overflow-hidden relative p-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1982FC]"></div>
                <div className="flex items-center text-white font-medium mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-2">
                    <Flag size={16} className="text-[#1982FC]" />
                  </div>
                  <h3 className="font-orbitron">THE PADDOCK</h3>
                </div>
                <p className="text-gray-400 text-sm pl-10">
                  Your automotive command center with Formula 1 inspired telemetry and insights
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black border border-[#1982FC]/20 rounded-lg overflow-hidden relative p-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1982FC]"></div>
                <div className="flex items-center text-white font-medium mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#1982FC]">
                      <path d="M8 5.07a4 4 0 0 1 4-3.07 4 4 0 0 1 4 4 7 7 0 0 1-8 6m8 0a7 7 0 0 1 4 6 4 4 0 0 1-4 4 4 4 0 0 1-4-3.07"/>
                    </svg>
                  </div>
                  <h3 className="font-orbitron">WEATHER PADDOCK</h3>
                </div>
                <p className="text-gray-400 text-sm pl-10">
                  Race-grade weather intelligence and real-time driving condition reports
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black border border-[#1982FC]/20 rounded-lg overflow-hidden relative p-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1982FC]"></div>
                <div className="flex items-center text-white font-medium mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#1982FC]/20 flex items-center justify-center mr-2">
                    <Car size={16} className="text-[#1982FC]" />
                  </div>
                  <h3 className="font-orbitron">GARAGE VAULT</h3>
                </div>
                <p className="text-gray-400 text-sm pl-10">
                  Secure high-performance storage for your vehicle data and maintenance records
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-black border border-[#1982FC]/20 rounded-lg overflow-hidden relative p-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#08c519]"></div>
                <div className="flex items-center text-white font-medium mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#08c519]/20 flex items-center justify-center mr-2">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#08c519]">
                      <path d="M5 6l14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 12l14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 18l14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-orbitron">JUICE BOX</h3>
                </div>
                <p className="text-gray-400 text-sm pl-10">
                  Premium detailing protocols and tracking inspired by motorsport preparation
                </p>
              </div>
            </div>
            
            {renderProgressDots()}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="relative bg-gray-900/50 rounded-lg p-6 overflow-hidden">
              {/* F1-inspired diagonal stripes */}
              <div className="absolute -right-4 top-0 w-28 h-2 bg-[#1982FC] transform rotate-45"></div>
              <div className="absolute -right-4 top-4 w-28 h-1 bg-[#08c519] transform rotate-45"></div>
              
              <p className="text-gray-300 text-lg relative z-10">
                Before proceeding, please review and accept the following agreements:
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-black border border-[#1982FC]/20 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-800/50 bg-black/30 hover:bg-black/50 transition-colors">
                  <Checkbox 
                    id="terms" 
                    checked={agreements.termsOfService}
                    onCheckedChange={() => handleAgreementChange('termsOfService')}
                    className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <div>
                    <Label htmlFor="terms" className="text-white font-medium">TERMS OF SERVICE</Label>
                    <p className="text-gray-400 text-sm mt-0.5">
                      I agree to the <a href="#" className="text-[#1982FC] hover:underline font-medium">Terms of Service</a> and acknowledge that my use of PADDOCK20 is subject to these terms.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-800/50 bg-black/30 hover:bg-black/50 transition-colors">
                  <Checkbox 
                    id="privacy" 
                    checked={agreements.privacyPolicy}
                    onCheckedChange={() => handleAgreementChange('privacyPolicy')}
                    className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <div>
                    <Label htmlFor="privacy" className="text-white font-medium">PRIVACY POLICY</Label>
                    <p className="text-gray-400 text-sm mt-0.5">
                      I have read and agree to the <a href="#" className="text-[#1982FC] hover:underline font-medium">Privacy Policy</a> and understand how my data will be used.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-800/50 bg-black/30 hover:bg-black/50 transition-colors">
                  <Checkbox 
                    id="beta" 
                    checked={agreements.betaAgreement}
                    onCheckedChange={() => handleAgreementChange('betaAgreement')}
                    className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                  />
                  <div>
                    <Label htmlFor="beta" className="text-white font-medium">BETA PROGRAM AGREEMENT</Label>
                    <p className="text-gray-400 text-sm mt-0.5">
                      I understand that I am accessing a beta version of PADDOCK20 and agree to the <a href="#" className="text-[#1982FC] hover:underline font-medium">Beta Agreement</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {renderProgressDots()}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="relative bg-gray-900/50 rounded-lg p-6 overflow-hidden">
              {/* F1-inspired diagonal stripes */}
              <div className="absolute -right-4 top-0 w-28 h-2 bg-[#1982FC] transform rotate-45"></div>
              <div className="absolute -right-4 top-4 w-28 h-1 bg-[#08c519] transform rotate-45"></div>
              
              <p className="text-gray-300 text-lg relative z-10">
                Your PADDOCK20 profile has been pre-configured with performance-optimized defaults. You'll be able to customize it further after setup.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-black border border-[#1982FC]/20 rounded-lg overflow-hidden">
              <div className="border-b border-gray-800">
                <div className="bg-black/30 px-4 py-2">
                  <h3 className="font-orbitron text-[#1982FC] flex items-center">
                    <User size={16} className="mr-2" />
                    PROFILE FEATURES
                  </h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-800/50">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="w-4 h-4 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={10} className="text-[#1982FC]" />
                      </div>
                      <span>Customizable user dashboard</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="w-4 h-4 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={10} className="text-[#1982FC]" />
                      </div>
                      <span>Vehicle management system</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="w-4 h-4 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={10} className="text-[#1982FC]" />
                      </div>
                      <span>Driving data telemetry</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="w-4 h-4 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={10} className="text-[#1982FC]" />
                      </div>
                      <span>Community engagement options</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="w-4 h-4 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={10} className="text-[#1982FC]" />
                      </div>
                      <span>Goal tracking and achievements</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <div className="w-4 h-4 rounded-sm bg-[#1982FC]/10 border border-[#1982FC]/30 flex items-center justify-center">
                        <CheckCircle size={10} className="text-[#1982FC]" />
                      </div>
                      <span>Performance statistics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 border border-[#1982FC]/10 rounded p-3 flex items-start">
              <div className="bg-[#1982FC]/10 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-[#1982FC]">
                  <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm italic">
                You'll be able to set up your vehicles and preferences during the onboarding process after completing beta enrollment.
              </p>
            </div>
            
            {renderProgressDots()}
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="relative bg-gray-900/50 rounded-lg p-6 overflow-hidden">
              {/* F1-inspired diagonal stripes */}
              <div className="absolute -right-4 top-0 w-28 h-2 bg-[#1982FC] transform rotate-45"></div>
              <div className="absolute -right-4 top-4 w-28 h-1 bg-[#08c519] transform rotate-45"></div>
              
              <p className="text-gray-300 text-lg relative z-10">
                Select your preferred beta participation level:
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-black border border-[#1982FC]/20 rounded-lg overflow-hidden">
              <div className="border-b border-gray-800">
                <div className="bg-black/30 px-4 py-2">
                  <h3 className="font-orbitron text-[#1982FC] flex items-center">
                    <Zap size={16} className="mr-2" />
                    BETA PROGRAM SELECTION
                  </h3>
                </div>
              </div>
              
              <div className="p-4">
                <RadioGroup 
                  value={betaRole} 
                  onValueChange={(value) => setBetaRole(value as 'user' | 'tester')}
                  className="gap-4"
                >
                  <div className="bg-black/30 border border-[#1982FC]/20 rounded-lg hover:bg-black/40 transition-all p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem 
                        value="user" 
                        id="beta-role-user" 
                        className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                      />
                      <div className="flex-1">
                        <Label htmlFor="beta-role-user" className="text-white font-orbitron flex items-center cursor-pointer">
                          <Zap className="h-4 w-4 mr-2 text-[#1982FC]" />
                          BETA USER
                        </Label>
                        <p className="text-gray-400 text-sm mt-1">
                          Access the beta program with basic feedback options. Ideal for enthusiasts who want early access with minimal commitments.
                        </p>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#1982FC]" />
                            <span>Early access</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#1982FC]" />
                            <span>Basic feedback</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#1982FC]" />
                            <span>Feature voting</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#1982FC]" />
                            <span>Standard support</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 border border-[#08c519]/20 rounded-lg hover:bg-black/40 transition-all p-4 relative">
                    <div className="absolute -top-2 -right-2 bg-[#08c519] text-xs text-white px-2 py-0.5 rounded">
                      RECOMMENDED
                    </div>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem 
                        value="tester" 
                        id="beta-role-tester"
                        className="mt-1 data-[state=checked]:bg-[#08c519] data-[state=checked]:border-[#08c519]"
                      />
                      <div className="flex-1">
                        <Label htmlFor="beta-role-tester" className="text-white font-orbitron flex items-center cursor-pointer">
                          <ClipboardCheck className="h-4 w-4 mr-2 text-[#08c519]" />
                          BETA TESTER
                        </Label>
                        <p className="text-gray-400 text-sm mt-1">
                          Enhanced program with priority access and direct input on development. Perfect for enthusiasts who want to shape the product.
                        </p>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#08c519]" />
                            <span>All Beta User benefits</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#08c519]" />
                            <span>Priority feature access</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#08c519]" />
                            <span>Direct developer access</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#08c519]" />
                            <span>Extended capabilities</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#08c519]" />
                            <span>Beta Tester badge</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CheckCircle size={12} className="text-[#08c519]" />
                            <span>Feature voting weight</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            {renderProgressDots()}
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-[#08c519]/10 rounded-full flex items-center justify-center border border-[#08c519]/30">
                <CheckCircle className="h-10 w-10 text-[#08c519]" />
              </div>
            </div>
            
            <h3 className="text-xl text-center font-orbitron tracking-wide text-[#08c519]">YOU'RE READY TO ENTER THE PADDOCK</h3>
            
            <div className="relative bg-gray-900/50 rounded-lg p-6 overflow-hidden">
              {/* F1-inspired diagonal stripes */}
              <div className="absolute -right-4 top-0 w-28 h-2 bg-[#08c519] transform rotate-45"></div>
              <div className="absolute -right-4 top-4 w-28 h-1 bg-[#1982FC] transform rotate-45"></div>
              
              <p className="text-gray-300 text-center relative z-10">
                You've completed the PADDOCK20 beta enrollment. The next step is vehicle setup and customizing your experience.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-black border border-[#08c519]/20 rounded-lg overflow-hidden">
              <div className="border-b border-gray-800">
                <div className="bg-black/30 px-4 py-2">
                  <h3 className="font-orbitron text-[#08c519] flex items-center">
                    <Flag size={16} className="mr-2" />
                    WHAT HAPPENS NEXT
                  </h3>
                </div>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#08c519]/10 rounded-full p-1.5 flex-shrink-0">
                      <Car size={16} className="text-[#08c519]" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium">Set up your vehicle profile</h4>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Add your vehicles with detailed specifications and connection options
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-[#08c519]/10 rounded-full p-1.5 flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-[#08c519]">
                        <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium">Configure your dashboard</h4>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Personalize your command center with the widgets most important to you
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-[#08c519]/10 rounded-full p-1.5 flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-[#08c519]">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium">Explore features</h4>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Discover the premium automotive tools and insights available to you
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-[#08c519]/10 rounded-full p-1.5 flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-[#08c519]">
                        <path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium">Provide feedback</h4>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Share your thoughts to help shape the future of PADDOCK20
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {renderProgressDots()}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={modalClasses}>
      <div className={contentClasses}>
        {/* Decorative elements - F1-inspired aesthetic */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1982FC] to-[#08c519]"></div>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#1982FC] via-transparent to-[#08c519]"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#08c519] via-transparent to-[#1982FC]"></div>
        
        {/* Diagonal racing stripes */}
        <div className="absolute -bottom-4 -right-4 w-32 h-2 bg-[#1982FC] transform rotate-45"></div>
        <div className="absolute -bottom-1 -right-4 w-32 h-1 bg-[#08c519] transform rotate-45"></div>
        
        {/* Carbon fiber pattern overlay - subtle background texture */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+CiAgPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMTExIj48L3JlY3Q+CiAgPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjAiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIj48L2NpcmNsZT4KPC9zdmc+')",
            backgroundSize: "50px 50px"
          }}
        />
        
        {/* Close button */}
        <button 
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onClose(betaRole), 400);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/30 rounded-full p-1.5 backdrop-blur-sm" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Header with step title */}
        <div className="border-b border-gray-800 p-4 md:p-6 flex justify-between items-center bg-gradient-to-r from-black to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#1982FC]/30 bg-black/50 flex items-center justify-center shadow-lg">
              {getStepIcon()}
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-orbitron">
              {getStepTitle()}
            </h2>
          </div>
          
          {/* Step indicator */}
          <div className="text-sm font-orbitron bg-black/30 px-2.5 py-1 rounded border border-[#1982FC]/20">
            {step === 6 ? (
              <span className="text-[#08c519]">STEP {step}/6</span>
            ) : (
              <span className="text-[#1982FC]">STEP {step}/6</span>
            )}
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-4 md:p-6">
          {renderStepContent()}
        </div>
        
        {/* Footer with navigation */}
        <div className="border-t border-gray-800 p-4 md:p-6 flex justify-between items-center bg-gradient-to-r from-gray-900 to-black">
          {step > 1 ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-md transition-colors flex items-center border border-gray-800"
              >
                <ChevronLeft className="mr-1" size={18} />
                <span>PREVIOUS</span>
              </button>
              
              {step === 3 && (
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 bg-black hover:bg-red-900/20 text-red-500 hover:text-red-400 rounded-md transition-colors flex items-center border border-red-900/30"
                >
                  <XCircle className="mr-1" size={18} />
                  <span>I DO NOT ACCEPT THESE TERMS</span>
                </button>
              )}
            </div>
          ) : (
            <div></div> // Empty div to maintain layout with justify-between
          )}
          
          <button
            onClick={handleNext}
            className={`
              px-6 py-2 text-white rounded-md transition-all flex items-center shadow-lg
              ${step === 6 
                ? 'bg-gradient-to-r from-[#08c519] to-[#08c519]/80 hover:brightness-110 border border-[#08c519]/30' 
                : 'bg-gradient-to-r from-[#1982FC] to-[#1982FC]/80 hover:brightness-110 border border-[#1982FC]/30'}
            `}
            disabled={step === 3 && !allAgreed}
          >
            <span className="font-orbitron tracking-wide">{step === 6 ? 'COMPLETE SETUP' : 'CONTINUE'}</span>
            <ChevronRight className="ml-1" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetaWelcomeModal;
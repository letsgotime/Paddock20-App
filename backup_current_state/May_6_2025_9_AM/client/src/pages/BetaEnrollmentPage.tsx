import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import BetaWelcomeModal from '@/components/dashboard/BetaWelcomeModal';
import OnboardingModal from '@/components/OnboardingModal';

/**
 * Beta Enrollment Page
 * Shown to users after authentication to opt into the beta program
 * This page manages the flow from BetaWelcomeModal to OnboardingModal
 */
const BetaEnrollmentPage = () => {
  const { user } = useAuth0();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Modal states
  const [showBetaWelcomeModal, setShowBetaWelcomeModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedBetaRole, setSelectedBetaRole] = useState<'user' | 'tester'>('user');
  
  // Show the welcome modal when the component mounts
  useEffect(() => {
    setShowBetaWelcomeModal(true);
  }, []);
  
  // Handle when the beta welcome modal is closed
  const handleBetaWelcomeClose = (betaRole?: 'user' | 'tester') => {
    // Save the selected beta role
    if (betaRole) {
      setSelectedBetaRole(betaRole);
    }
    
    // Hide the beta welcome modal
    setShowBetaWelcomeModal(false);
    
    // Store the beta status in localStorage
    localStorage.setItem('paddock20_beta_status', 'enrolled');
    localStorage.setItem('paddock20_beta_role', betaRole || 'user');
    
    // Show the onboarding modal next
    setShowOnboardingModal(true);
  };
  
  // Handle when the onboarding modal is closed
  const handleOnboardingClose = () => {
    // Hide the onboarding modal
    setShowOnboardingModal(false);
    
    // Store onboarding completion
    localStorage.setItem('paddock20_onboarding_completed', 'true');
    
    // Show toast notification
    toast({
      title: 'Setup Complete',
      description: 'Welcome to Paddock20! Your garage is ready.',
      variant: 'default',
    });
    
    // Redirect to dashboard
    setLocation('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Beta Welcome Modal - first in sequence */}
      <BetaWelcomeModal 
        isOpen={showBetaWelcomeModal} 
        onClose={handleBetaWelcomeClose}
      />
      
      {/* Onboarding Modal - second in sequence */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleOnboardingClose}
        betaRole={selectedBetaRole}
      />
      
      {/* Placeholder content for the background page */}
      <div className="text-center text-gray-600">
        Setting up your Paddock20 experience...
      </div>
    </div>
  );
};

export default BetaEnrollmentPage;
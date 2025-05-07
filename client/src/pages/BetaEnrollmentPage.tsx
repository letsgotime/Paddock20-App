/**
 * ⚠️ BETA FILE PROTECTION ⚠️
 * 
 * WARNING: This file is part of the Beta Program core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the beta enrollment process.
 * 
 * Last verified: May 07, 2025
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import BetaWelcomeModal from '@/components/dashboard/BetaWelcomeModal';
import OnboardingModal from '@/components/OnboardingModal';
import { Loader2 } from 'lucide-react';

/**
 * Beta Enrollment Page
 * Shown to users after authentication to opt into the beta program
 * This page manages the flow from BetaWelcomeModal to OnboardingModal
 */
const BetaEnrollmentPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Modal states
  const [showBetaWelcomeModal, setShowBetaWelcomeModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedBetaRole, setSelectedBetaRole] = useState<'user' | 'tester'>('user');
  
  // Protect this page for authenticated users only
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to auth page if not authenticated
      setLocation('/auth');
    }
  }, [isAuthenticated, loading, setLocation]);
  
  // Show the welcome modal when the component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setShowBetaWelcomeModal(true);
    }
  }, [isAuthenticated, user]);
  
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
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#1982FC]" />
          <p className="text-gray-400">Verifying your credentials...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, this will redirect in the useEffect
  if (!isAuthenticated || !user) {
    return null;
  }
  
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
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/auth/useAuth';
import userProfileWarehouse from '@/services/UserProfileWarehouse';

// Types
interface OnboardingContextType {
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  resetOnboarding: () => void;
}

// Create context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  showOnboarding: false,
  setShowOnboarding: () => {},
  onboardingComplete: false,
  setOnboardingComplete: () => {},
  resetOnboarding: () => {},
});

// Provider component
export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user, checkAuthStatus } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Check onboarding status when user changes
  useEffect(() => {
    if (user) {
      // Check if onboarding is complete from warehouse
      const profile = userProfileWarehouse.getProfile();
      const completedInWarehouse = profile?.identity?.onboardingCompleted || false;
      
      // Check if onboarding is complete from localStorage
      const completedInLocalStorage = localStorage.getItem('paddock20_onboarding_completed') === 'true';
      
      // If either source shows completed, treat as complete
      const isComplete = completedInWarehouse || completedInLocalStorage;
      setOnboardingComplete(isComplete);
      
      // Show onboarding if not complete
      setShowOnboarding(user && !isComplete);
    } else {
      // No user, so don't show onboarding and reset status
      setShowOnboarding(false);
      setOnboardingComplete(false);
    }
  }, [user]);

  // Reset onboarding status
  const resetOnboarding = () => {
    setOnboardingComplete(false);
    localStorage.removeItem('paddock20_onboarding_completed');
    
    // Update warehouse
    if (user) {
      userProfileWarehouse.updateIdentity({
        onboardingCompleted: false
      });
      
      // Also update server
      fetch(`/api/user-profile/${user.id}/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: false
        }),
      }).catch(error => {
        console.error('Error resetting onboarding status:', error);
      });
    }
  };

  // Mark onboarding as complete
  useEffect(() => {
    if (onboardingComplete && user) {
      // Update localStorage
      localStorage.setItem('paddock20_onboarding_completed', 'true');
      
      // Update warehouse
      userProfileWarehouse.updateIdentity({
        onboardingCompleted: true
      });
      
      // Don't show onboarding anymore
      setShowOnboarding(false);
    }
  }, [onboardingComplete, user]);

  const value = {
    showOnboarding,
    setShowOnboarding,
    onboardingComplete,
    setOnboardingComplete,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import OnboardingFlow from './dashboard/OnboardingFlow';

interface UserOnboardingProps {
  onComplete: (userId: number | string) => void;
}

/**
 * UserOnboarding Component
 * 
 * Complete onboarding flow including legal terms, user profile creation, vehicle setup,
 * and dashboard preferences.
 * 
 * Uses brand-consistent styling with Orbitron for headings and Open Sans for body text.
 * Color scheme follows the dark carbon-fiber theme with Carolina blue accents.
 * 
 * Now implemented with the simplified OnboardingFlow wrapper component that manages
 * the transition between beta welcome and detailed onboarding.
 */
const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  // Access authenticated user context
  const auth = useAuth();
  
  // We're now using the OnboardingFlow component instead of our custom step logic
  return (
    <OnboardingFlow
      onComplete={() => {
        // Once the onboarding is complete, call the callback with the user ID
        if (auth.user?.id) {
          onComplete(auth.user.id);
        }
      }}
    />
  );
};

export default UserOnboarding;
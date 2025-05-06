import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import BetaWelcomeModal from './BetaWelcomeModal';
import OnboardingModal from './OnboardingModal';

interface OnboardingFlowProps {
  onComplete: () => void;
}

/**
 * OnboardingFlow component manages the sequence of modals shown during onboarding
 * 1. First shows the Beta Welcome Modal for program enrollment
 * 2. Then shows the Onboarding Modal for collecting user and vehicle information
 */
const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const auth = useAuth();
  const [showBetaModal, setShowBetaModal] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [animatingBetween, setAnimatingBetween] = useState(false);
  
  // Check if user has already seen the beta welcome modal in this session
  useEffect(() => {
    const hasSeenBetaModal = sessionStorage.getItem('hasSeenBetaModal');
    if (hasSeenBetaModal === 'true') {
      setShowBetaModal(false);
      setShowOnboardingModal(true);
    }
  }, []);
  
  // Handle completing the beta welcome modal
  const handleBetaModalClose = () => {
    // Mark that the user has seen the beta modal in this session
    sessionStorage.setItem('hasSeenBetaModal', 'true');
    setShowBetaModal(false);
  };
  
  // Handle transitioning from beta modal to onboarding modal
  const handleProceedToOnboarding = () => {
    setAnimatingBetween(true);
    setShowOnboardingModal(true);
    setAnimatingBetween(false);
  };
  
  // Handle completing the entire onboarding process
  const handleOnboardingComplete = () => {
    // Close the onboarding modal
    setShowOnboardingModal(false);
    
    // Call the onComplete callback to let the parent component know we're done
    if (auth.user?.id) {
      // Mark onboarding as complete in localStorage
      const onboardingKey = `paddock20_onboarding_complete_${auth.user.id}`;
      localStorage.setItem(onboardingKey, 'true');
      
      // Let parent component know we're done
      onComplete();
    }
  };
  
  return (
    <>
      {/* Beta Welcome Modal - shown first */}
      <BetaWelcomeModal 
        isOpen={showBetaModal}
        onClose={handleBetaModalClose}
        onProceedToOnboarding={handleProceedToOnboarding}
      />
      
      {/* Onboarding Modal - shown after beta modal is closed */}
      <OnboardingModal
        isOpen={showOnboardingModal && !animatingBetween}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};

export default OnboardingFlow;
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUserProfile } from './UserProfileContext';
import { useAuth } from '@/hooks/useAuth';

interface BetaWelcomeContextType {
  showWelcomeModal: boolean;
  hideWelcomeModal: () => void;
  showWelcomeModalManually: () => void;
}

const BetaWelcomeContext = createContext<BetaWelcomeContextType | undefined>(undefined);

export const BetaWelcomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { user } = useAuth();
  const { userProfile, loading } = useUserProfile();

  // Track if the user is newly registered to show the welcome modal
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Check for welcome message on first visit or login
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(`paddock20_welcome_seen_${user?.id}`);
    
    if (user && userProfile && !loading && !hasSeenWelcome && !hasShownWelcome) {
      // Only show welcome once the profile is available and we have beta status
      if (userProfile.betaStatus) {
        setShowWelcomeModal(true);
        setHasShownWelcome(true);
      }
    }
  }, [user, userProfile, loading, hasShownWelcome]);

  const hideWelcomeModal = () => {
    setShowWelcomeModal(false);
    // Mark the welcome as seen for this user
    if (user?.id) {
      localStorage.setItem(`paddock20_welcome_seen_${user.id}`, 'true');
    }
  };

  const showWelcomeModalManually = () => {
    setShowWelcomeModal(true);
  };

  return (
    <BetaWelcomeContext.Provider value={{ 
      showWelcomeModal, 
      hideWelcomeModal,
      showWelcomeModalManually
    }}>
      {children}
    </BetaWelcomeContext.Provider>
  );
};

export const useBetaWelcome = (): BetaWelcomeContextType => {
  const context = useContext(BetaWelcomeContext);
  if (context === undefined) {
    throw new Error('useBetaWelcome must be used within a BetaWelcomeProvider');
  }
  return context;
};
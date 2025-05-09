import { useState } from 'react';
import { useLocation } from 'wouter';
import BetaWelcomeModal from '../components/BetaWelcomeModal';

export default function BetaWelcomePage() {
  const [modalOpen, setModalOpen] = useState(true);
  const [, navigate] = useLocation();
  
  // Handler for beta modal close
  const handleBetaModalClose = (betaRole?: 'user' | 'tester') => {
    setModalOpen(false);
    // Store the selected beta role in localStorage
    if (betaRole) {
      localStorage.setItem('paddock20_selected_beta_role', betaRole);
    }
    
    // Get Auth0 profile from localStorage or fetch from API
    const auth0Token = localStorage.getItem('auth0_token');
    let userId = localStorage.getItem('auth0_user_id') || 'user';
    
    // If we have an Auth0 token but no userId, fetch the profile
    if (auth0Token && (!userId || userId === 'user')) {
      try {
        // Make a call to Auth0 to get the user profile
        fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/userinfo`, {
          headers: {
            Authorization: `Bearer ${auth0Token}`
          }
        })
        .then(response => response.json())
        .then(profile => {
          if (profile && profile.sub) {
            // Store user ID in localStorage
            localStorage.setItem('auth0_user_id', profile.sub);
            userId = profile.sub;
          }
        })
        .catch(error => {
          console.error('Error fetching Auth0 profile:', error);
        });
      } catch (error) {
        console.error('Error processing Auth0 token:', error);
      }
    }
    
    // Mark beta onboarding and legal agreements as complete
    const betaOnboardingKey = `paddock20_beta_onboarding_complete_${userId}`;
    const legalAgreementsKey = `paddock20_legal_agreements_${userId}`;
    
    localStorage.setItem(betaOnboardingKey, 'true');
    localStorage.setItem(legalAgreementsKey, JSON.stringify({
      accepted: true,
      acceptedDate: new Date().toISOString(),
      version: '1.0'
    }));
    
    // Set global flag that onboarding was just completed
    localStorage.setItem('paddock20_onboarding_just_completed', 'true');
    
    // Navigate directly to dashboard instead of onboarding
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#1982FC] to-[#08c519] flex items-center justify-center">
            <span className="text-3xl font-bold text-white">P20</span>
          </div>
        </div>
        <h1 className="text-4xl font-orbitron bg-gradient-to-r from-[#1982FC] to-[#08c519] bg-clip-text text-transparent mb-8">
          PADDOCK20
        </h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Your complete automotive lifestyle platform designed for enthusiasts like you.
        </p>
        
        <BetaWelcomeModal 
          isOpen={modalOpen} 
          onClose={handleBetaModalClose}
        />
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import BetaWelcomeModal from '../components/BetaWelcomeModal';

export default function BetaWelcomePage() {
  const [modalOpen, setModalOpen] = useState(true);
  const [, navigate] = useLocation();
  
  // Handler for beta modal close
  const handleBetaModalClose = (betaRole?: 'user' | 'tester') => {
    setModalOpen(false);
    
    // Mark onboarding as complete in localStorage
    // We'll use a global flag as well as a user-specific one if we have a user ID
    localStorage.setItem('paddock20_onboarding_completed', 'true');
    
    // Get user profile from local storage to check for user ID
    const userProfileStr = localStorage.getItem('userProfile');
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile?.id) {
          // Also set user-specific flag
          localStorage.setItem(`paddock20_beta_onboarding_complete_${userProfile.id}`, 'true');
          
          // Set the welcome as seen
          localStorage.setItem(`paddock20_welcome_seen_${userProfile.id}`, 'true');
          
          // Save legal agreements (shared data format with App.tsx)
          const legalAgreementsKey = `paddock20_legal_agreements_${userProfile.id}`;
          localStorage.setItem(legalAgreementsKey, JSON.stringify({
            accepted: true,
            version: '1.0',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error('Error updating onboarding status:', e);
      }
    }
    
    // Direct users to the homepage (/) after completing setup
    navigate('/');
  };
  
  // Setup demo data for deployment environments
  useEffect(() => {
    // Check if we're in a deployment environment (replit.app domain)
    const isDeployment = window.location.hostname.includes('replit.app');
    
    if (isDeployment) {
      // Ensure demo mode is activated
      localStorage.setItem('PADDOCK20_DEMO_MODE', 'true');
      localStorage.setItem('paddock20_demo_auth_bypass', 'true');
    }
  }, []);
  
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
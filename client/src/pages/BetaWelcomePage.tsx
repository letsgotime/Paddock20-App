import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import BetaWelcomeModal from '../components/BetaWelcomeModal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function BetaWelcomePage() {
  const [modalOpen, setModalOpen] = useState(true);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Handler for beta modal close
  const handleBetaModalClose = (betaRole?: 'user' | 'tester') => {
    setModalOpen(false);
    
    // Store the selected beta role in localStorage
    if (betaRole) {
      localStorage.setItem('paddock20_selected_beta_role', betaRole);
      
      // Mark beta onboarding and legal agreements as complete
      if (user?.id) {
        // Mark beta onboarding as complete
        localStorage.setItem(`paddock20_beta_onboarding_complete_${user.id}`, 'true');
        
        // Mark legal agreements as accepted
        localStorage.setItem(`paddock20_legal_agreements_${user.id}`, JSON.stringify({
          accepted: true,
          acceptedDate: new Date().toISOString(),
          version: '1.0'
        }));
        
        // Set a global flag indicating onboarding was completed
        localStorage.setItem('paddock20_onboarding_just_completed', 'true');
        
        // Set all flag variations to ensure consistent behavior across the app
        localStorage.setItem('paddock20_simplified_onboarding', 'true');
        localStorage.setItem('paddock20_simplified_flow', 'true');
        localStorage.setItem('betamodalgo', 'true');
      } else {
        // Fallback if no user ID is available
        localStorage.setItem('paddock20_beta_onboarding_complete', 'true');
        localStorage.setItem('paddock20_legal_agreements', 'true');
        localStorage.setItem('paddock20_onboarding_just_completed', 'true');
        localStorage.setItem('paddock20_simplified_onboarding', 'true');
        localStorage.setItem('paddock20_simplified_flow', 'true');
        localStorage.setItem('betamodalgo', 'true');
      }
      
      // Show welcome toast
      toast({
        title: 'Welcome to Paddock20!',
        description: 'You\'re all set up and ready to explore the platform.',
      });
    }
    
    // Navigate directly to main app instead of onboarding
    navigate('/', { replace: true });
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
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function BetaWelcomePage() {
  const [, navigate] = useLocation();
  
  // Automatically accept beta and redirect to onboarding
  useEffect(() => {
    // Set beta status as accepted in localStorage
    localStorage.setItem('paddock20_beta_status', 'accepted');
    console.log('Beta terms automatically accepted - status set to accepted');
    
    // Short delay before redirecting to onboarding
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#1982FC] to-[#08c519] flex items-center justify-center">
            <span className="text-3xl font-bold text-white">P20</span>
          </div>
        </div>
        <h1 className="text-4xl font-orbitron bg-gradient-to-r from-[#1982FC] to-[#08c519] bg-clip-text text-transparent mb-6">
          PADDOCK20
        </h1>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          Your complete automotive lifestyle platform designed for enthusiasts like you.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-[#1982FC]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Preparing your experience...</span>
        </div>
      </div>
    </div>
  );
}
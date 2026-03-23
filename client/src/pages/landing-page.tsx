import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import BetaWelcomeModal from '@/components/BetaWelcomeModal';

const LandingPage = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Auto-open modal when page loads
    setModalOpen(true);
  }, []);

  const handleBypassAuth = () => {
    navigate('/demo');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="text-center mb-8">
        <h1 className="font-orbitron text-5xl mb-4 bg-gradient-to-br from-[#1982FC] to-[#08c519] bg-clip-text text-transparent">
          PADDOCK20
        </h1>
        <p className="text-xl text-gray-400 max-w-lg mx-auto">
          Your ultimate automotive lifestyle platform for enthusiasts
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:brightness-110 text-white"
          size="lg"
        >
          Explore Features
        </Button>
        
        <Button 
          onClick={handleBypassAuth}
          variant="outline" 
          className="border-[#1982FC] text-[#1982FC] hover:bg-[#1982FC]/10"
          size="lg"
        >
          Enter Demo
        </Button>
      </div>
      
      {/* Beta Welcome Modal */}
      <BetaWelcomeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
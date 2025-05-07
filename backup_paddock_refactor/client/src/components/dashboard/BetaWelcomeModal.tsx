import React, { useState, useEffect } from 'react';
import { X, Zap, ClipboardCheck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: (betaRole?: 'user' | 'tester') => void;
}

const BetaWelcomeModal: React.FC<BetaWelcomeModalProps> = ({ isOpen, onClose }) => {
  const [betaRole, setBetaRole] = useState<'user' | 'tester'>('user');
  const [isExiting, setIsExiting] = useState(false);
  
  // Reset exit animation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleContinue = () => {
    // Start exit animation
    setIsExiting(true);
    
    // Delay actual close to allow for animation
    setTimeout(() => {
      onClose(betaRole);
    }, 400); // Match this with the CSS transition duration
  };
  
  // Base modal classes
  const modalClasses = `
    fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto
    transition-opacity duration-300 ease-in-out
    ${isExiting ? 'opacity-0' : 'opacity-100'}
  `;
  
  // Content animation classes
  const contentClasses = `
    bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg 
    max-w-2xl w-full md:w-3/4 lg:w-2/3 p-6 relative mx-auto my-8
    transition-all duration-400 ease-in-out
    ${isExiting ? 'transform translate-y-8 scale-95 opacity-0' : 'transform translate-y-0 scale-100 opacity-100'}
  `;
  
  return (
    <div className={modalClasses}>
      <div className={contentClasses}>
        <button 
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onClose(betaRole), 400);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron text-[#1982FC] mb-1">Welcome to Paddock20 Beta</h2>
          <p className="text-gray-300">You've been granted early access to explore and test the application.</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-[#1982FC] mb-2">What to expect:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Premium automotive enthusiast features</li>
              <li>Cutting-edge tools and insights for your vehicles</li>
              <li>Early access to new features as they're developed</li>
              <li>The ability to provide feedback that shapes the future of Paddock20</li>
            </ul>
          </div>
          
          {/* Beta Role Selection Box - Moved from slide 5 */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3">Choose Your Beta Program Level</h3>
            
            <RadioGroup 
              value={betaRole} 
              onValueChange={(value) => setBetaRole(value as 'user' | 'tester')}
              className="gap-4"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50">
                <RadioGroupItem 
                  value="user" 
                  id="beta-role-user" 
                  className="mt-1 data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                />
                <div className="flex-1">
                  <Label htmlFor="beta-role-user" className="text-white font-medium flex items-center cursor-pointer">
                    <Zap className="h-4 w-4 mr-2 text-[#1982FC]" />
                    Beta User
                  </Label>
                  <p className="text-gray-400 text-sm mt-1">
                    Access the beta program with basic feedback options. Ideal for users who want to try new features without additional commitments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50">
                <RadioGroupItem 
                  value="tester" 
                  id="beta-role-tester"
                  className="mt-1 data-[state=checked]:bg-[#08c519] data-[state=checked]:border-[#08c519]"
                />
                <div className="flex-1">
                  <Label htmlFor="beta-role-tester" className="text-white font-medium flex items-center cursor-pointer">
                    <ClipboardCheck className="h-4 w-4 mr-2 text-[#08c519]" />
                    Beta Tester
                  </Label>
                  <p className="text-gray-400 text-sm mt-1">
                    Enhanced program with priority access to features and direct input on product development. Includes additional feedback responsibilities.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="pt-3">
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-[#1982FC] hover:bg-[#1982FC]/80 text-white rounded-md font-medium"
            >
              Continue to Onboarding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaWelcomeModal;
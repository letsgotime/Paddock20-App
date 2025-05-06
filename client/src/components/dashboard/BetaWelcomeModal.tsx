import React from 'react';
import { X } from 'lucide-react';

interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BetaWelcomeModal: React.FC<BetaWelcomeModalProps> = ({ isOpen, onClose }) => {
  // Simplified - we'll always show the beta user status 
  // since this is the introduction modal
  const isBetaTester = false;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg max-w-2xl w-full md:w-3/4 lg:w-2/3 p-6 relative mx-auto my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron text-blue-400 mb-1">Welcome to Paddock20 Beta</h2>
          <p className="text-gray-300">You've been granted early access to explore and test the application.</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-300 mb-2">What to expect:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Premium automotive enthusiast features</li>
              <li>Cutting-edge tools and insights for your vehicles</li>
              <li>Early access to new features as they're developed</li>
              <li>The ability to provide feedback that shapes the future of Paddock20</li>
            </ul>
          </div>
          
          {isBetaTester ? (
            <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-400 mb-2">Beta Tester Status</h3>
              <p className="text-gray-300">
                As a Beta Tester, you'll receive free service for life! Your application is pending approval
                from our team. You'll be notified via email once approved.
              </p>
            </div>
          ) : (
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-300 mb-2">Beta User Status</h3>
              <p className="text-gray-300">
                As a Beta User, you'll receive discounted service for life! Your account is already
                active with full access to all beta features.
              </p>
            </div>
          )}
          
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaWelcomeModal;
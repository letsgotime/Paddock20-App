import React, { useState } from 'react';
import { X } from 'lucide-react';

interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOnboarding: () => void;
}

const BetaWelcomeModal: React.FC<BetaWelcomeModalProps> = ({ 
  isOpen, 
  onClose,
  onProceedToOnboarding 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Simplified - we'll always show the beta user status 
  // since this is the introduction modal
  const isBetaTester = false;
  
  if (!isOpen) return null;
  
  // Handle clicking Get Started - this will close the beta modal and open the onboarding modal
  const handleGetStarted = () => {
    // Close this modal first
    onClose();
    // Trigger the onboarding modal after a short delay for animation
    setTimeout(() => {
      onProceedToOnboarding();
    }, 300);
  };

  // Navigation functions
  const handleNextSlide = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  // The content to show based on the current slide
  let slideContent;
  let buttonText = "Next";

  if (currentSlide === 0) {
    // First slide: Welcome
    slideContent = (
      <>
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
        </div>
      </>
    );
  } else if (currentSlide === 1) {
    // Second slide: Beta Status
    slideContent = (
      <>
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron text-blue-400 mb-1">Your Beta Access</h2>
          <p className="text-gray-300">Learn about your special beta privileges.</p>
        </div>
        
        <div className="space-y-4">
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
        </div>
      </>
    );
  } else {
    // Third slide: Get Started
    slideContent = (
      <>
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron text-blue-400 mb-1">Ready to Begin?</h2>
          <p className="text-gray-300">Let's set up your profile and vehicle information.</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-300 mb-2">Next Steps:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Complete your user profile</li>
              <li>Add your vehicle information</li>
              <li>Set your preferences</li>
              <li>Start exploring the Paddock20 experience</li>
            </ul>
          </div>
        </div>
      </>
    );
    buttonText = "Get Started";
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg max-w-2xl w-full md:w-3/4 lg:w-2/3 p-6 relative mx-auto my-8 animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Display current slide content */}
        {slideContent}
        
        {/* Navigation dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {[0, 1, 2].map((index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? 'bg-blue-400' : 'bg-gray-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Button to proceed */}
        <div className="pt-6">
          <button
            onClick={handleNextSlide}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetaWelcomeModal;
import React, { useState, useEffect } from "react";
import { VolumeX, Volume2, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";

/**
 * FixedSoundBar - A fixed bottom bar showing GoTime logo, navigation controls and sound controls
 * 
 * This component is designed to be always visible regardless of authentication state
 * and is positioned at the bottom of the screen using fixed positioning.
 */
const FixedSoundBar: React.FC = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  // Check browser history state on mount and whenever it might change
  useEffect(() => {
    // Update navigation button states based on window.history
    const updateNavButtons = () => {
      setCanGoBack(window.history.length > 1);
      // We don't have a reliable way to check if forward is available
      // So we disable forward button when using direct navigation
      setCanGoForward(false);
    };
    
    // Initial check
    updateNavButtons();
    
    // Listen for history changes
    window.addEventListener('popstate', updateNavButtons);
    
    return () => {
      window.removeEventListener('popstate', updateNavButtons);
    };
  }, []);
  
  // Navigation functions
  const goBack = () => {
    try {
      // Use browser history API
      window.history.back();
      
      // Play sound effect if enabled
      if (soundEnabled) playMotorsportSound('ui_navigate');
      
      console.log("Navigating back");
    } catch (error) {
      console.error("Error navigating back:", error);
    }
  };
  
  const goForward = () => {
    try {
      // Use browser history API
      window.history.forward();
      
      // Play sound effect if enabled
      if (soundEnabled) playMotorsportSound('ui_navigate');
      
      console.log("Navigating forward");
    } catch (error) {
      console.error("Error navigating forward:", error);
    }
  };
  
  const goHome = () => {
    try {
      // Navigate to home page
      window.location.href = '/';
      
      // Play sound effect if enabled
      if (soundEnabled) playMotorsportSound('ui_select');
      
      console.log("Navigating to homepage");
    } catch (error) {
      console.error("Error navigating home:", error);
    }
  };
  
  // Initialize sound settings from sound service
  useEffect(() => {
    try {
      const soundSettings = getSoundSettings();
      setSoundEnabledState(soundSettings.enabled);
    } catch (error) {
      console.error("Error loading sound settings:", error);
    }
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/95 border-t border-blue-900/50 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-[9999]">
      {/* GoTime Logo */}
      <div className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-8 w-auto"
        />
      </div>
      
      {/* Navigation Controls */}
      <div className="flex items-center space-x-2 px-3 py-1">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`w-7 h-7 flex items-center justify-center ${
            canGoBack 
              ? 'text-[#08c519] hover:text-green-300' 
              : 'text-gray-600 opacity-50 cursor-not-allowed'
          }`}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="mx-1 h-4 w-px bg-blue-900/50"></div>
        
        <button
          onClick={goHome}
          className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300"
          aria-label="Go to home page"
          title="Home"
        >
          <Home size={18} />
        </button>
        
        <div className="mx-1 h-4 w-px bg-blue-900/50"></div>
        
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className={`w-7 h-7 flex items-center justify-center ${
            canGoForward
              ? 'text-[#08c519] hover:text-green-300' 
              : 'text-gray-600 opacity-50 cursor-not-allowed'
          }`}
          aria-label="Go forward"
          title="Forward"
        >
          <ArrowRight size={18} />
        </button>
      </div>
      
      {/* Sound Controls */}
      <div className="flex items-center space-x-2">
        {/* Sound toggle button */}
        <button
          onClick={() => {
            try {
              // Toggle sound setting
              const newState = !soundEnabled;
              setSoundEnabledState(newState);
              setSoundEnabled(newState);
              // Play sound effect for toggle
              if (newState) {
                playMotorsportSound('radio_beep');
              }
            } catch (error) {
              console.error("Error toggling sound:", error);
            }
          }}
          className="text-gray-400 hover:text-blue-400 p-2 rounded-full transition-colors duration-200"
          aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        
        {/* Sound Library link - using standard <a> tag for consistent navigation */}
        <a 
          href="/sound-library" 
          className="text-gray-400 hover:text-blue-400 p-2 transition-colors duration-200"
          aria-label="Sound Library"
          title="Sound Library"
          onClick={(e) => {
            if (soundEnabled) {
              try {
                playMotorsportSound('button_press');
              } catch (error) {
                console.error("Error playing sound:", error);
              }
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9.5a6 2.5 0 0 1 6 -2.5"></path>
            <path d="M8 17a6 2.5 0 0 0 6 -2.5"></path>
            <path d="M14 7a6 2.5 0 0 1 6 -2.5"></path>
            <path d="M20 14.5a6 2.5 0 0 1 -6 2.5"></path>
          </svg>
        </a>
      </div>
    </nav>
  );
};

export default FixedSoundBar;
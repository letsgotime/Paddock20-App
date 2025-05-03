import React, { useState, useEffect } from "react";
import { VolumeX, Volume2, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";

/**
 * FixedSoundBar - A fixed bottom bar showing GoTime logo, navigation controls and sound controls
 * 
 * This component is designed to be always visible regardless of authentication state
 * and is positioned at the bottom of the screen using fixed positioning.
 * 
 * It uses direct anchor tags for navigation to ensure maximum compatibility.
 */
const FixedSoundBar: React.FC = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  // Check browser history state on mount and whenever it might change
  useEffect(() => {
    // Update navigation button states based on window.history
    const updateNavButtons = () => {
      setCanGoBack(window.history.length > 1);
      setCanGoForward(false); // We can't reliably detect forward capability
    };
    
    // Initial check
    updateNavButtons();
    
    // Listen for history changes
    window.addEventListener('popstate', updateNavButtons);
    
    return () => {
      window.removeEventListener('popstate', updateNavButtons);
    };
  }, []);
  
  // Initialize sound settings from sound service
  useEffect(() => {
    try {
      const soundSettings = getSoundSettings();
      setSoundEnabledState(soundSettings.enabled);
    } catch (error) {
      console.error("Error loading sound settings:", error);
    }
  }, []);

  // Simple navigation handlers
  const handleBackClick = (e: React.MouseEvent) => {
    if (canGoBack) {
      if (soundEnabled) playMotorsportSound('ui_navigate');
      window.history.back();
    } else {
      e.preventDefault();
    }
  };

  const handleForwardClick = (e: React.MouseEvent) => {
    if (canGoForward) {
      if (soundEnabled) playMotorsportSound('ui_navigate');
      window.history.forward();
    } else {
      e.preventDefault();
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (soundEnabled) playMotorsportSound('ui_select');
  };

  const handleSoundLibraryClick = (e: React.MouseEvent) => {
    if (soundEnabled) playMotorsportSound('button_press');
  };

  const toggleSound = () => {
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
  };

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
        {/* Back Button */}
        <button
          onClick={handleBackClick}
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
        
        {/* Home Button - Using anchor tag for maximum compatibility */}
        <a
          href="/"
          onClick={handleHomeClick}
          className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300"
          aria-label="Go to home page"
          title="Home"
        >
          <Home size={18} />
        </a>
        
        <div className="mx-1 h-4 w-px bg-blue-900/50"></div>
        
        {/* Forward Button */}
        <button
          onClick={handleForwardClick}
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
          onClick={toggleSound}
          className="text-gray-400 hover:text-blue-400 p-2 rounded-full transition-colors duration-200"
          aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        
        {/* Sound Library link - Using standard anchor tag */}
        <a 
          href="/sound-library"
          onClick={handleSoundLibraryClick}
          className="text-gray-400 hover:text-blue-400 p-2 transition-colors duration-200"
          aria-label="Sound Library"
          title="Sound Library"
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
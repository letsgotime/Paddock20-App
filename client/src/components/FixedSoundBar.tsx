import React, { useState, useEffect } from "react";
import { VolumeX, Volume2, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";
import { useLocation } from "wouter";

/**
 * FixedSoundBar - A fixed bottom bar showing GoTime logo, navigation controls and sound controls
 * 
 * This component is designed to be always visible regardless of authentication state
 * and is positioned at the bottom of the screen using fixed positioning.
 */
const FixedSoundBar: React.FC = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [location, setLocation] = useLocation();
  
  // Get navigation state from localStorage
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  // Initialize navigation state
  useEffect(() => {
    try {
      const navState = JSON.parse(localStorage.getItem('navigationState') || '{"history":[],"currentIndex":0}');
      const currentIndex = navState.currentIndex;
      const history = navState.history || [];
      
      setCanGoBack(currentIndex > 0);
      setCanGoForward(currentIndex < history.length - 1);
    } catch (error) {
      console.error("Error loading navigation state:", error);
    }
  }, [location]);
  
  // Navigation functions
  const goBack = () => {
    try {
      const navState = JSON.parse(localStorage.getItem('navigationState') || '{"history":[],"currentIndex":0}');
      if (navState.currentIndex > 0) {
        navState.currentIndex--;
        const prevPath = navState.history[navState.currentIndex];
        localStorage.setItem('navigationState', JSON.stringify(navState));
        setLocation(prevPath);
        if (soundEnabled) playMotorsportSound('ui_navigate');
      }
    } catch (error) {
      console.error("Error navigating back:", error);
    }
  };
  
  const goForward = () => {
    try {
      const navState = JSON.parse(localStorage.getItem('navigationState') || '{"history":[],"currentIndex":0}');
      if (navState.currentIndex < navState.history.length - 1) {
        navState.currentIndex++;
        const nextPath = navState.history[navState.currentIndex];
        localStorage.setItem('navigationState', JSON.stringify(navState));
        setLocation(nextPath);
        if (soundEnabled) playMotorsportSound('ui_navigate');
      }
    } catch (error) {
      console.error("Error navigating forward:", error);
    }
  };
  
  const goHome = () => {
    try {
      setLocation('/');
      if (soundEnabled) playMotorsportSound('ui_select');
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
    <nav className="fixed bottom-[60px] left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/95 border-t border-blue-900/50 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-[9999]">
      {/* GoTime Logo */}
      <div className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GoTime White.png" 
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
        
        {/* Sound Library link */}
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
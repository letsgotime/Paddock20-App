import React, { useState, useEffect, useCallback } from "react";
import { VolumeX, Volume2, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";
import { useLocation } from "wouter";

// Constants for localStorage keys
const HISTORY_KEY = 'navigationHistory';
const CURRENT_INDEX_KEY = 'navigationCurrentIndex';

// Add navigationInProgress property to Window interface
declare global {
  interface Window {
    navigationInProgress: boolean;
  }
}

/**
 * FixedSoundBar - A fixed bottom bar showing GoTime logo, navigation controls and sound controls
 * 
 * This component is designed to be always visible regardless of authentication state
 * and is positioned at the bottom of the screen using fixed positioning.
 */
const FixedSoundBar: React.FC = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [location, setLocation] = useLocation();
  
  // Navigation state
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Load initial navigation state
  useEffect(() => {
    try {
      // Get history from localStorage or initialize with current location
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [location];
      
      // Get current index from localStorage or initialize with 0
      const savedIndex = localStorage.getItem(CURRENT_INDEX_KEY);
      const parsedIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
      
      // Set state with safe values
      setNavigationHistory(Array.isArray(parsedHistory) ? parsedHistory : [location]);
      setCurrentIndex(isNaN(parsedIndex) ? 0 : parsedIndex);
      
      // Debug output
      console.log("Navigation initialized:", {history: parsedHistory, currentIndex: parsedIndex});
    } catch (error) {
      console.error("Error initializing navigation:", error);
      // Initialize with safe defaults
      setNavigationHistory([location]);
      setCurrentIndex(0);
    }
  }, []);
  
  // Update navigation buttons state
  useEffect(() => {
    setCanGoBack(currentIndex > 0);
    setCanGoForward(currentIndex < navigationHistory.length - 1);
    
    // Save navigation state
    localStorage.setItem(HISTORY_KEY, JSON.stringify(navigationHistory));
    localStorage.setItem(CURRENT_INDEX_KEY, currentIndex.toString());
    
    // Debug output
    console.log("Navigation state updated:", {
      history: navigationHistory,
      currentIndex: currentIndex,
      canGoBack: currentIndex > 0,
      canGoForward: currentIndex < navigationHistory.length - 1
    });
  }, [navigationHistory, currentIndex]);
  
  // Initialize the navigation progress flag if needed
  useEffect(() => {
    if (typeof window.navigationInProgress === 'undefined') {
      window.navigationInProgress = false;
    }
  }, []);

  // Track location changes
  useEffect(() => {
    if (navigationHistory.length === 0) {
      // Initialize if empty
      setNavigationHistory([location]);
      return;
    }
    
    // Get current path in history
    const currentPath = navigationHistory[currentIndex];
    
    // Only add to history if path changed and not triggered by back/forward buttons
    if (currentPath !== location && !window.navigationInProgress) {
      // If user navigated from a non-latest point, truncate future history
      const newHistory = currentIndex < navigationHistory.length - 1
        ? [...navigationHistory.slice(0, currentIndex + 1), location]
        : [...navigationHistory, location];
      
      setNavigationHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
    
    // Reset navigation progress flag
    window.navigationInProgress = false;
  }, [location]);
  
  // Navigation functions
  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      try {
        // Mark that we're navigating programmatically
        window.navigationInProgress = true;
        
        // Update index and navigate
        const newIndex = currentIndex - 1;
        const prevPath = navigationHistory[newIndex];
        
        setCurrentIndex(newIndex);
        setLocation(prevPath);
        
        // Play sound effect if enabled
        if (soundEnabled) playMotorsportSound('ui_navigate');
        
        console.log("Navigating back to:", prevPath);
      } catch (error) {
        console.error("Error navigating back:", error);
      }
    }
  }, [navigationHistory, currentIndex, setLocation, soundEnabled]);
  
  const goForward = useCallback(() => {
    if (currentIndex < navigationHistory.length - 1) {
      try {
        // Mark that we're navigating programmatically
        window.navigationInProgress = true;
        
        // Update index and navigate
        const newIndex = currentIndex + 1;
        const nextPath = navigationHistory[newIndex];
        
        setCurrentIndex(newIndex);
        setLocation(nextPath);
        
        // Play sound effect if enabled
        if (soundEnabled) playMotorsportSound('ui_navigate');
        
        console.log("Navigating forward to:", nextPath);
      } catch (error) {
        console.error("Error navigating forward:", error);
      }
    }
  }, [navigationHistory, currentIndex, setLocation, soundEnabled]);
  
  const goHome = useCallback(() => {
    try {
      // Only navigate if not already home
      if (location !== '/') {
        setLocation('/');
        
        // Create a new history entry (not using back/forward)
        const newHistory = [...navigationHistory.slice(0, currentIndex + 1), '/'];
        setNavigationHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
      }
      
      // Play sound effect if enabled
      if (soundEnabled) playMotorsportSound('ui_select');
    } catch (error) {
      console.error("Error navigating home:", error);
    }
  }, [location, navigationHistory, currentIndex, setLocation, soundEnabled]);
  
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
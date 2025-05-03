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
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black border-t border-blue-500/50 shadow-[0_-5px_15px_rgba(0,0,0,0.8)] z-[9999]">
      {/* GoTime Logo */}
      <div className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GoTime Logo-7FC844-White (1).png" 
          alt="GoTime Motorsports" 
          className="h-8 w-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAxMDAgMzAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIGZpbGw9IiMwOGM1MTkiLz48dGV4dCB4PSI1MCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5Hb1RpbWU8L3RleHQ+PC9zdmc+';
          }}
        />
        <span className="ml-2 text-[#08c519] text-sm hidden sm:inline">TELEMETRY</span>
      </div>
      
      {/* Navigation Controls - Center Element */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
        <div className="flex items-center px-4 py-2 bg-blue-900/30 rounded-full border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`w-12 h-12 flex items-center justify-center rounded-full mx-1 ${
              canGoBack 
                ? 'text-[#08c519] hover:bg-green-900/40 hover:text-green-300 active:bg-green-900/60 active:scale-95 border border-green-700' 
                : 'text-gray-600 opacity-50 cursor-not-allowed'
            }`}
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="mx-2 h-8 w-px bg-blue-500/50"></div>
          
          <button
            onClick={goHome}
            className="w-12 h-12 flex items-center justify-center rounded-full mx-1 text-blue-400 hover:bg-blue-900/40 hover:text-blue-300 active:bg-blue-900/60 active:scale-95 border border-blue-700"
            aria-label="Go to home page"
            title="Home"
          >
            <Home size={24} />
          </button>
          
          <div className="mx-2 h-8 w-px bg-blue-500/50"></div>
          
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`w-12 h-12 flex items-center justify-center rounded-full mx-1 ${
              canGoForward
                ? 'text-[#08c519] hover:bg-green-900/40 hover:text-green-300 active:bg-green-900/60 active:scale-95 border border-green-700' 
                : 'text-gray-600 opacity-50 cursor-not-allowed'
            }`}
            aria-label="Go forward"
            title="Forward"
          >
            <ArrowRight size={24} />
          </button>
        </div>
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
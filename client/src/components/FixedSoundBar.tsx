import React, { useState, useEffect } from "react";
import { VolumeX, Volume2 } from "lucide-react";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";

/**
 * FixedSoundBar - A fixed nav bar at the top of the screen showing the GoTime logo and sound controls
 * 
 * This component is designed to be always visible regardless of authentication state
 * and is positioned at the top of the screen using fixed positioning.
 */
const FixedSoundBar: React.FC = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  
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
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-black border-b border-gray-700 z-50">
      <div className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-10 w-auto mr-2"
        />
      </div>
      
      <div className="flex items-center space-x-3">
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
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        
        {/* Sound Library link - Using plain A tag for non-authenticated state */}
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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { VolumeX, Volume2 } from "lucide-react";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";

const DropdownNavbar = () => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const location = useLocation();
  
  // Initialize sound settings from sound service
  useEffect(() => {
    const soundSettings = getSoundSettings();
    setSoundEnabledState(soundSettings.enabled);
  }, []);

  return (
    <nav className="flex items-center justify-between p-4 bg-black border-b border-gray-700 relative z-30">
      <Link to="/dashboard" className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-10 w-auto mr-2"
        />
      </Link>
      
      <div className="flex items-center space-x-3">
        {/* Sound toggle button */}
        <button
          onClick={() => {
            // Toggle sound setting
            const newState = !soundEnabled;
            setSoundEnabledState(newState);
            setSoundEnabled(newState);
            // Play sound effect for toggle
            if (newState) {
              playMotorsportSound('radio_beep');
            }
          }}
          className="text-gray-400 hover:text-blue-400 p-2 rounded-full transition-colors duration-200"
          aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        
        {/* Sound Library link */}
        <Link 
          to="/sound-library" 
          className="text-gray-400 hover:text-blue-400 p-2 transition-colors duration-200"
          aria-label="Sound Library"
          title="Sound Library"
          onClick={() => soundEnabled && playMotorsportSound('button_press')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9.5a6 2.5 0 0 1 6 -2.5"></path>
            <path d="M8 17a6 2.5 0 0 0 6 -2.5"></path>
            <path d="M14 7a6 2.5 0 0 1 6 -2.5"></path>
            <path d="M20 14.5a6 2.5 0 0 1 -6 2.5"></path>
          </svg>
        </Link>
      </div>
    </nav>
  );
};

export default DropdownNavbar;
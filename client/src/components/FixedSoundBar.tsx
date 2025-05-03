import React, { useState, useEffect, useRef } from "react";
import { VolumeX, Volume2, Home, ArrowLeft, ArrowRight, Music, Music2 } from "lucide-react";
import { 
  playMotorsportSound, 
  getSoundSettings, 
  setSoundEnabled, 
  setAmbientSoundsEnabled
} from "../services/soundService";
import { useNavigate, useLocation, Link } from "react-router-dom";

/**
 * FixedSoundBar - A fixed bottom bar showing GoTime logo, navigation controls and sound controls
 * 
 * This component is designed to be always visible regardless of authentication state
 * and is positioned at the bottom of the screen using fixed positioning.
 * 
 * Now uses React Router's Link component for seamless SPA navigation.
 */
const FixedSoundBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [soundEnabled, setSoundEnabledState] = useState(false); // Default off
  const [ambientEnabled, setAmbientEnabledState] = useState(false); // Default off
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const soundMenuRef = useRef<HTMLDivElement>(null);
  
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
  }, [location.pathname]); // Re-check when location changes
  
  // Initialize sound settings from sound service
  useEffect(() => {
    try {
      const soundSettings = getSoundSettings();
      setSoundEnabledState(soundSettings.enabled);
      setAmbientEnabledState(soundSettings.ambientEnabled);
    } catch (error) {
      console.error("Error loading sound settings:", error);
    }
  }, []);
  
  // Handle clicks outside the sound menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node)) {
        setShowSoundMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation handlers using React Router
  const handleBackClick = (e: React.MouseEvent) => {
    if (canGoBack) {
      if (soundEnabled) playMotorsportSound('ui_navigate');
      navigate(-1); // Go back one step in history
    } else {
      e.preventDefault();
    }
  };

  const handleForwardClick = (e: React.MouseEvent) => {
    if (canGoForward) {
      if (soundEnabled) playMotorsportSound('ui_navigate');
      navigate(1); // Go forward one step in history
    } else {
      e.preventDefault();
    }
  };

  const handleHomeClick = () => {
    if (soundEnabled) playMotorsportSound('ui_select');
  };

  const handleSoundLibraryClick = () => {
    if (soundEnabled) playMotorsportSound('button_press');
    setShowSoundMenu(false);
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
  
  const toggleAmbientSound = () => {
    try {
      // Toggle ambient sound setting
      const newState = !ambientEnabled;
      setAmbientEnabledState(newState);
      setAmbientSoundsEnabled(newState);
      
      // Play sound effect for toggle if sounds are enabled
      if (soundEnabled) {
        playMotorsportSound(newState ? 'start_chime' : 'button_press');
      }
    } catch (error) {
      console.error("Error toggling ambient sound:", error);
    }
  };
  
  const toggleSoundMenu = () => {
    setShowSoundMenu(!showSoundMenu);
    if (soundEnabled) playMotorsportSound('menu_select');
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
        
        {/* Home Button - Using React Router Link for SPA navigation */}
        <Link
          to="/"
          onClick={handleHomeClick}
          className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300"
          aria-label="Go to home page"
          title="Home"
        >
          <Home size={18} />
        </Link>
        
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
      <div className="flex items-center space-x-2 relative">
        {/* Sound toggle button */}
        <button
          onClick={toggleSoundMenu}
          className="text-gray-400 hover:text-blue-400 p-2 rounded-full transition-colors duration-200"
          aria-label="Sound settings"
          title="Sound settings"
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        
        {/* Sound settings dropdown menu */}
        {showSoundMenu && (
          <div 
            ref={soundMenuRef}
            className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-blue-900/50 rounded-md shadow-lg p-3 min-w-[180px] z-50"
          >
            <div className="text-sm text-blue-400 border-b border-blue-900/50 pb-1 mb-2">Sound Settings</div>
            
            {/* Sound effects toggle */}
            <button 
              onClick={toggleSound}
              className="flex items-center justify-between w-full text-sm text-gray-300 hover:text-white py-1"
            >
              <span className="flex items-center">
                <Volume2 size={14} className="mr-2" />
                Sound Effects
              </span>
              <span className={`px-2 py-0.5 rounded ${soundEnabled ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
            
            {/* Ambient sound toggle */}
            <button 
              onClick={toggleAmbientSound}
              className="flex items-center justify-between w-full text-sm text-gray-300 hover:text-white py-1 mt-1"
            >
              <span className="flex items-center">
                <Music2 size={14} className="mr-2" />
                Ambient Sounds
              </span>
              <span className={`px-2 py-0.5 rounded ${ambientEnabled ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                {ambientEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
            
            {/* Sound library link */}
            <Link 
              to="/sound-library"
              onClick={handleSoundLibraryClick}
              className="flex items-center w-full text-sm text-gray-300 hover:text-white py-1 mt-1"
            >
              <Music size={14} className="mr-2" />
              Sound Library
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default FixedSoundBar;
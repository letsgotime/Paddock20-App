import React, { useState, useEffect, useRef } from "react";
import { VolumeX, Volume2, Home, ArrowLeft, ArrowRight, Music, Music2 } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useSoundContext } from "@/contexts/SoundContext";
import SoundButton from "@/components/ui/SoundButton";

/**
 * FixedSoundBar - A fixed bottom bar showing GoTime logo, navigation controls and sound controls
 * 
 * This component is designed to be always visible regardless of authentication state
 * and is positioned at the bottom of the screen using fixed positioning.
 * 
 * Now uses wouter's Link component for seamless SPA navigation.
 */
const FixedSoundBar: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { isEnabled: soundEnabled, ambientEnabled, volume, playSound, toggleSound, toggleAmbient, setVolumeLevel } = useSoundContext();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const soundMenuRef = useRef<HTMLDivElement>(null);
  
  // Track navigation history to enable forward/back functionality
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
  
  // Update history when location changes
  useEffect(() => {
    // Check if we're navigating with the back/forward buttons
    const isPopstate = navigationHistory[currentHistoryIndex] === location;
    
    if (!isPopstate) {
      // Normal navigation (not back/forward)
      // Remove any "future" history if we navigated to a new path
      const newHistory = [...navigationHistory.slice(0, currentHistoryIndex + 1), location];
      setNavigationHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
    
    // Update back/forward button states
    setCanGoBack(currentHistoryIndex > 0);
    setCanGoForward(currentHistoryIndex < navigationHistory.length - 1);
  }, [location]);
  
  // Initialize history on first render
  useEffect(() => {
    if (navigationHistory.length === 0) {
      setNavigationHistory([location]);
      setCurrentHistoryIndex(0);
    }
  }, []);
  
  // Listen to browser popstate events (back/forward browser buttons)
  useEffect(() => {
    const handlePopstate = () => {
      // Find the pathname in our history
      const index = navigationHistory.findIndex(path => path === location);
      
      if (index !== -1) {
        // Update our current index
        setCurrentHistoryIndex(index);
      }
      
      // Update button states
      setCanGoBack(currentHistoryIndex > 0);
      setCanGoForward(currentHistoryIndex < navigationHistory.length - 1);
    };
    
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [navigationHistory, currentHistoryIndex, location]);
  
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

  // Navigation handlers using wouter and our custom history tracking
  const handleBackClick = (e: React.MouseEvent) => {
    if (canGoBack) {
      if (soundEnabled) playSound('ui_click');
      
      // Go to previous path in our history
      const prevIndex = currentHistoryIndex - 1;
      if (prevIndex >= 0) {
        const prevPath = navigationHistory[prevIndex];
        setLocation(prevPath);
        setCurrentHistoryIndex(prevIndex);
      }
    } else {
      e.preventDefault();
    }
  };

  const handleForwardClick = (e: React.MouseEvent) => {
    if (canGoForward) {
      if (soundEnabled) playSound('ui_click');
      
      // Go to next path in our history
      const nextIndex = currentHistoryIndex + 1;
      if (nextIndex < navigationHistory.length) {
        const nextPath = navigationHistory[nextIndex];
        setLocation(nextPath);
        setCurrentHistoryIndex(nextIndex);
      }
    } else {
      e.preventDefault();
    }
  };

  const handleHomeClick = () => {
    if (soundEnabled) playSound('ui_success');
    
    // Update navigation history when clicking home link
    const newHistory = [...navigationHistory.slice(0, currentHistoryIndex + 1), '/'];
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const handleSoundLibraryClick = () => {
    if (soundEnabled) playSound('ui_click');
    setShowSoundMenu(false);
    
    // Update navigation history when clicking sound library link
    const newHistory = [...navigationHistory.slice(0, currentHistoryIndex + 1), '/sound-library'];
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const toggleSoundMenu = () => {
    setShowSoundMenu(!showSoundMenu);
    if (soundEnabled) playSound('ui_click');
  };
  
  // Handle volume change from the slider
  const handleVolumeChange = (newValue: number) => {
    setVolumeLevel(newValue);
    
    // Play a sample sound to demonstrate new volume
    if (soundEnabled) {
      playSound('ui_click');
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
        
        {/* Home Button - Using wouter's Link for SPA navigation */}
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
        
        {/* Enhanced Sound settings dropdown menu - Combined with SoundControlPanel functionality */}
        {showSoundMenu && (
          <div 
            ref={soundMenuRef}
            className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-blue-900/50 rounded-md shadow-lg p-3 min-w-[250px] z-50"
          >
            <div className="text-sm text-blue-400 border-b border-blue-900/50 pb-1 mb-2">Sound Controls</div>
            
            {/* Sound effects toggle */}
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center text-sm text-gray-300">
                <Volume2 size={14} className="mr-2" />
                Sound Effects
              </span>
              <SoundButton
                className={`px-2 py-0.5 rounded text-xs ${soundEnabled ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}
                onClick={toggleSound}
                sound="ui_success"
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </SoundButton>
            </div>
            
            {/* Ambient sound toggle */}
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center text-sm text-gray-300">
                <Music2 size={14} className="mr-2" />
                Ambient Sounds
              </span>
              <SoundButton
                className={`px-2 py-0.5 rounded text-xs ${ambientEnabled ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}
                onClick={toggleAmbient}
                sound="ui_success"
                disabled={!soundEnabled}
              >
                {ambientEnabled ? 'ON' : 'OFF'}
              </SoundButton>
            </div>
            
            {/* Master volume slider */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Master Volume</span>
                <span>{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                disabled={!soundEnabled}
                className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                style={{
                  background: soundEnabled 
                    ? `linear-gradient(to right, #3b82f6 ${volume}%, #374151 ${volume}%)` 
                    : '#374151'
                }}
              />
            </div>
            
            {/* Sound test buttons */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <SoundButton
                className="w-full px-2 py-1 text-xs rounded bg-blue-900/20 hover:bg-blue-900/40 text-blue-400"
                sound="ui_click"
                disabled={!soundEnabled}
              >
                Test UI Sound
              </SoundButton>
              <SoundButton
                className="w-full px-2 py-1 text-xs rounded bg-blue-900/20 hover:bg-blue-900/40 text-blue-400"
                sound="notification"
                disabled={!soundEnabled}
              >
                Test Notification
              </SoundButton>
            </div>
            
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
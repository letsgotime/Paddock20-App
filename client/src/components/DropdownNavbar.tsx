import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  VolumeX, 
  Volume2, 
  LayoutDashboard, 
  Car, 
  User, 
  Music, 
  Settings,
  CloudSun
} from "lucide-react";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/sound-service-alt";

interface DropdownNavbarProps {
  isOpen: boolean;
  onClose: () => void;
  demoMode?: boolean;
}

const DropdownNavbar: React.FC<DropdownNavbarProps> = ({ isOpen, onClose, demoMode = false }) => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  
  // Initialize sound settings from sound service
  useEffect(() => {
    const soundSettings = getSoundSettings();
    setSoundEnabledState(soundSettings.enabled);
  }, []);

  const handleLinkClick = () => {
    // Play sound if enabled
    if (soundEnabled) {
      playMotorsportSound('button_press');
    }
    // Close the dropdown
    onClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-black/95 border-b border-[#1982FC]/30 shadow-xl z-50 animate-in fade-in duration-200">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-sm uppercase text-gray-500 font-orbitron tracking-wider mb-4">Navigation</h3>
            
            <Link href="/dashboard" onClick={handleLinkClick}>
              <span className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </span>
            </Link>
            
            <Link href="/the-paddock" onClick={handleLinkClick}>
              <span className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2">
                <Car className="h-5 w-5" />
                <span>The Paddock</span>
              </span>
            </Link>
            
            <Link href="/garage" onClick={handleLinkClick}>
              <span className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2">
                <Car className="h-5 w-5" />
                <span>Garage</span>
              </span>
            </Link>
            
            <Link href="/profile" onClick={handleLinkClick}>
              <span className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2">
                <User className="h-5 w-5" />
                <span>Driver Profile</span>
              </span>
            </Link>
          </div>
          
          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-sm uppercase text-gray-500 font-orbitron tracking-wider mb-4">Features</h3>
            
            <Link href="/weather" onClick={handleLinkClick}>
              <span className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2">
                <CloudSun className="h-5 w-5" />
                <span>Weather</span>
              </span>
            </Link>
            
            <Link href="/sound-library" onClick={handleLinkClick}>
              <span className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2">
                <Music className="h-5 w-5" />
                <span>Sound Library</span>
              </span>
            </Link>
          </div>
          
          {/* Settings */}
          <div className="space-y-3">
            <h3 className="text-sm uppercase text-gray-500 font-orbitron tracking-wider mb-4">Settings</h3>
            
            <Link href="/settings" onClick={handleLinkClick}>
              <span className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2">
                <Settings className="h-5 w-5" />
                <span>Preferences</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-3 text-white hover:text-[#1982FC] transition-colors py-2 cursor-pointer"
                onClick={() => {
                  // Toggle sound setting
                  const newState = !soundEnabled;
                  setSoundEnabledState(newState);
                  setSoundEnabled(newState);
                  // Play sound effect for toggle
                  if (newState) {
                    playMotorsportSound('radio_beep');
                  }
                }}>
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              <span>{soundEnabled ? "Mute Sounds" : "Enable Sounds"}</span>
            </div>
          </div>
          
          {/* Quick Access */}
          <div className="border-l border-gray-800 pl-6 hidden md:block">
            <h3 className="text-sm uppercase text-gray-500 font-orbitron tracking-wider mb-4">Quick Access</h3>
            
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">Access your most recent items or pinned content.</p>
              {!demoMode ? (
                <div className="bg-black/40 rounded-md p-3 border border-gray-800">
                  <p className="text-blue-400 font-medium mb-1">Recent Activity</p>
                  <p className="text-gray-400 text-sm">No recent activity found.</p>
                </div>
              ) : (
                <div className="bg-blue-900/20 rounded-md p-3 border border-blue-800/40">
                  <p className="text-blue-400 font-medium mb-1">Demo Mode Active</p>
                  <p className="text-gray-400 text-sm">Explore all features without saving data.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownNavbar;
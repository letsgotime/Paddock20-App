import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Menu, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Home, 
  CarFront, 
  Cloud, 
  GitBranch,
  Map,
  Calendar,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock user for preview mode (same as in App.tsx)
const mockUser = { 
  id: 99999, 
  username: 'Alex Garza', 
  email: 'alex@gotime.com', 
  firstName: 'Alex', 
  lastName: 'Garza', 
  fullName: 'Alex Garza', 
  profileImage: null, 
  role: 'admin' as const 
};

/**
 * Header component with menu dropdown and ambient sounds control
 * 
 * This component serves as the main navigation header with:
 * - Paddock20 logo on the left
 * - Dropdown menu for navigation
 * - Ambient sounds toggle on the right
 * - Logout option in the dropdown menu
 */
const Header: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Always using mockUser for now with preview mode, but this will be replaced
  // with real authentication once the system is ready
  const user = mockUser;
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  const handleLogout = () => {
    // Since we're in preview mode, just show a toast notification
    toast({
      title: 'Logout Functionality',
      description: 'The logout button is now implemented and ready for authentication.',
    });
    
    // In real implementation, this would call the API and redirect
    setIsMenuOpen(false);
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast({
      title: soundEnabled ? 'Ambient Sounds Disabled' : 'Ambient Sounds Enabled',
      description: soundEnabled ? 'All sound effects are now muted.' : 'Enjoying the immersive experience!',
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[9000] w-full bg-black border-b-2 border-blue-700 bg-gradient-to-r from-black via-black to-[#05071A]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/" className="text-3xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors font-['Orbitron'] tracking-wider">
            PADDOCK<span style={{ color: '#08c519' }}>20</span>
          </Link>
        </div>

        {/* Controls Section */}
        <div className="flex items-center space-x-3">
          {/* User Info - Desktop */}
          {user && (
            <div className="hidden md:flex items-center text-white font-medium mr-1">
              <span className="mr-1">
                <User className="h-4 w-4 inline text-blue-400" />
              </span>
              <span className="text-sm text-blue-300">{user.username}</span>
            </div>
          )}
          
          {/* Sound Toggle Button */}
          <button 
            onClick={toggleSound}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-blue-900/60 bg-blue-950/30 hover:bg-blue-900/40 transition-colors text-blue-400"
            aria-label={soundEnabled ? "Mute ambient sounds" : "Enable ambient sounds"}
            title={soundEnabled ? "Mute ambient sounds" : "Enable ambient sounds"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
          
          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <Menu className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline font-medium">Menu</span>
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-black border border-blue-900 rounded-md shadow-lg overflow-hidden z-50">
                <div className="bg-blue-900/20 px-3 py-2 text-sm text-blue-300 font-semibold border-b border-blue-900/40">
                  Navigation
                </div>
                
                <div className="py-1">
                  {/* Menu Items */}
                  <Link to="/" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Home className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Home</span>
                  </Link>
                  
                  <Link to="/garage-vault" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <CarFront className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Garage Vault</span>
                  </Link>
                  
                  <Link to="/new-weather-center" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Cloud className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Weather Center</span>
                  </Link>
                  
                  <Link to="/manifestation-station" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <GitBranch className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Manifestation Station</span>
                  </Link>
                  
                  <Link to="/route-planner" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Map className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Route Planner</span>
                  </Link>
                  
                  <Link to="/motorsports-events" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Motorsports Events</span>
                  </Link>
                </div>
                
                <div className="border-t border-blue-900/40 py-1">
                  <Link to="/settings" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Settings className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Settings</span>
                  </Link>
                  
                  {user && (
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-red-900/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-red-400" />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
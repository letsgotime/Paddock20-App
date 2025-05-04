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
  Settings,
  LayoutDashboard,
  MapPin,
  Flag,
  Watch,
  Compass,
  BookOpen,
  Brain,
  ClipboardCheck,
  SprayCan,
  Percent,
  Mail,
  BookMarked,
  MessageCircle,
  HeartHandshake,
  Shield,
  Trophy,
  Award,
  Star,
  Medal,
  ShoppingBag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";
import { useAuth } from '../hooks/useAuth';

/**
 * Header component with complete menu dropdown and ambient sounds control
 * 
 * This component serves as the main navigation header with:
 * - Paddock20 logo on the left
 * - Comprehensive dropdown menu for navigation
 * - Ambient sounds toggle on the right
 * - Logout option in the dropdown menu
 */
const Header: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get auth functionality from context
  const { user, logout } = useAuth();
  const userDisplayName = user?.username || 'Guest';
  
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
  
  const handleLogout = async () => {
    try {
      // Play sound effect if enabled
      const soundSettings = getSoundSettings();
      if (soundSettings?.enabled) {
        playMotorsportSound('logout');
      }
      
      // Close menu
      setIsMenuOpen(false);
      
      // Use the context's logout function
      await logout();
      
      // Redirect to auth page
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      
      // Show error toast
      toast({
        title: 'Logout Failed',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[8000] w-full bg-black border-b-2 border-blue-700 bg-gradient-to-r from-black via-black to-[#05071A]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/" className="text-3xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors font-['Orbitron'] tracking-wider">
            PADDOCK<span style={{ color: '#08c519' }}>20</span>
          </Link>
        </div>

        {/* Controls Section */}
        <div className="flex items-center space-x-3">
          {/* User Info - Desktop with dropdown */}
          <div 
            className="hidden md:flex items-center text-white font-medium mr-1 relative group cursor-pointer"
            onClick={() => {
              const soundSettings = getSoundSettings();
              if (soundSettings?.enabled) {
                playMotorsportSound('menu_select');
              }
            }}
          >
            <span className="mr-1">
              <User className="h-4 w-4 inline text-blue-400" />
            </span>
            <button className="text-sm text-blue-300 hover:text-blue-200 flex items-center">
              {userDisplayName}
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
            
            {/* User dropdown menu */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-blue-900 rounded-md shadow-lg overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
              <Link to="/profile" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                <User className="h-4 w-4 mr-2 text-blue-400" />
                <span>My Profile</span>
              </Link>
              <Link to="/settings" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                <Settings className="h-4 w-4 mr-2 text-blue-400" />
                <span>Settings</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2 text-red-400" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
          
          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                const soundSettings = getSoundSettings();
                if (soundSettings?.enabled) {
                  // Play menu open/close sound
                  playMotorsportSound(isMenuOpen ? 'menu_select' : 'toggle_switch');
                }
              }}
              className="flex items-center justify-center px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <Menu className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline font-medium">Menu</span>
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu - Complete with all navigation options */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-black border border-blue-900 rounded-md shadow-lg overflow-auto max-h-[90vh] z-50">
                <div className="bg-blue-900/20 px-3 py-2 text-sm text-blue-300 font-semibold border-b border-blue-900/40 sticky top-0">
                  Paddock Menu
                </div>
                
                <div className="py-1">
                  {/* Menu Items - Comprehensive */}
                  <Link to="/" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Home className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Home</span>
                  </Link>
                  
                  <Link to="/personalized-dashboard" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <LayoutDashboard className="h-4 w-4 mr-2 text-blue-400" />
                    <span>My Dashboard</span>
                  </Link>
                  
                  <Link to="/profile" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <User className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Driver Profile</span>
                    <span className="ml-2 text-xs text-green-500 font-orbitron">NEW</span>
                  </Link>
                  
                  <Link to="/podium-pursuit" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Medal className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Podium Pursuit</span>
                  </Link>
                  
                  <Link to="/weather-paddock" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Cloud className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Weather Paddock</span>
                  </Link>
                  
                  <Link to="/route-planner" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Fun Drive Planner</span>
                  </Link>
                  
                  <Link to="/events" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                    <span>P20 Events & Meetups</span>
                  </Link>
                  
                  <Link to="/motorsports-events" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Trophy className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Motorsports Events</span>
                  </Link>
                  
                  <Link to="/motorsports-gallery" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Motorsports Gallery</span>
                    <span className="ml-2 text-xs text-green-500 font-orbitron">NEW</span>
                  </Link>
                  
                  <Link to="/membership" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Flag className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Paddock20 Membership</span>
                  </Link>
                  
                  <Link to="/garage-vault" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <CarFront className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Garage Vault</span>
                  </Link>
                  
                  <Link to="/tires-timepieces" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Watch className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Tires & Timepieces</span>
                  </Link>
                  
                  <Link to="/manifestation-station" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Compass className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Manifestation Station™</span>
                  </Link>
                  
                  <Link to="/drive-journal" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Drive Journal</span>
                  </Link>
                  
                  <Link to="/manifestation-station" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors" onClick={() => {
                    // Directly navigate to the Manifestation Station with the discipline tracker view
                    window.localStorage.setItem('manifestation_activeView', 'discipline-tracker');
                  }}>
                    <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Daily Check-in</span>
                  </Link>
                  
                  <Link to="/juicebox" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <SprayCan className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Juice Box</span>
                  </Link>
                  
                  <Link to="/product-organizer" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <ShoppingBag className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Product Organizer</span>
                    <span className="ml-2 text-xs text-green-500 font-orbitron">NEW</span>
                  </Link>
                  
                  <Link to="/discounts" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Percent className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Discounts & Promotions</span>
                  </Link>
                </div>
                
                <div className="border-t border-blue-900/40 py-1">
                  <Link to="/concierge" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <HeartHandshake className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Concierge</span>
                  </Link>
                  
                  <Link to="/contact" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Contact Us</span>
                  </Link>
                  
                  <Link to="/ebooks" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <BookMarked className="h-4 w-4 mr-2 text-blue-400" />
                    <span>GoTime eBooks Vault</span>
                  </Link>
                  
                  <Link to="/chat-feed" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <MessageCircle className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Member Chat Feed</span>
                  </Link>
                  
                  <Link to="/settings" className="flex items-center px-4 py-2 text-white hover:bg-blue-900/30 transition-colors">
                    <Settings className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Settings</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2 text-red-400" />
                    <span>Log Out</span>
                  </button>
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
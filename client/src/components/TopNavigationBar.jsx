import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Menu, 
  Gauge, 
  MapPin, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  CloudRain
} from 'lucide-react';
import { useUnits } from '../hooks/useUnits';

/**
 * TopNavigationBar - Main navigation header for the app
 */
const TopNavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { units, setUnits } = useUnits();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUnits = () => {
    setUnits(units === 'imperial' ? 'metric' : 'imperial');
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <CloudRain className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-white font-bold text-xl">WEATHER PADDOCK</span>
              </a>
            </Link>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            {/* Units Toggle */}
            <button 
              onClick={toggleUnits}
              className="flex items-center px-3 py-1 text-sm rounded-full bg-gray-700 hover:bg-gray-600 text-gray-200"
            >
              {units === 'imperial' ? 'F°' : 'C°'}
              <span className="mx-1">|</span>
              {units === 'imperial' ? 'mph' : 'km/h'}
            </button>

            {/* Menu Toggle */}
            <button 
              onClick={toggleMenu}
              className="flex items-center text-gray-300 hover:text-white"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">Menu</span>
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-gray-800 border border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            <Link href="/">
              <a className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <Gauge className="h-4 w-4 mr-3 text-blue-400" />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/locations">
              <a className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <MapPin className="h-4 w-4 mr-3 text-blue-400" />
                <span>Locations</span>
              </a>
            </Link>
            <Link href="/settings">
              <a className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <Settings className="h-4 w-4 mr-3 text-blue-400" />
                <span>Settings</span>
              </a>
            </Link>
            
            <div className="border-t border-gray-700 my-1"></div>
            
            <Link href="/profile">
              <a className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700">
                <User className="h-4 w-4 mr-3 text-blue-400" />
                <span>Profile</span>
              </a>
            </Link>
            <button 
              className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-3 text-blue-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavigationBar;
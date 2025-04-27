import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { ARIA_LABELS, KEYS } from '../lib/accessibility';

// Define event types
type MouseEventHandler = (event: React.MouseEvent<HTMLDivElement>) => void;

function DropdownNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [juiceBoxOpen, setJuiceBoxOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Close dropdowns when route changes
  useEffect(() => {
    setIsOpen(false);
    setJuiceBoxOpen(false);
  }, [location.pathname]);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus trap for keyboard accessibility
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === KEYS.ESCAPE && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleJuiceBox: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setJuiceBoxOpen(!juiceBoxOpen);
  };

  // Keyboard handler for JuiceBox submenu toggle
  const handleJuiceBoxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
      e.preventDefault();
      setJuiceBoxOpen(!juiceBoxOpen);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/auth');
  };

  return (
    <nav 
      className="bg-black border-b border-gray-700 p-4 flex items-center justify-between" 
      role="navigation" 
      aria-label={ARIA_LABELS.MAIN_NAV}
    >
      <Link 
        to="/dashboard" 
        className="flex items-center font-orbitron text-2xl no-underline"
        aria-label="GoTime Motorsports - Return to Dashboard"
      >
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-10 w-auto mr-2"
        />
        <span className="text-gray-400 font-orbitron">ApexVault™</span>
      </Link>

      <div className="relative" ref={menuRef}>
        <button 
          ref={menuButtonRef}
          onClick={toggleDropdown}
          className="bg-gray-900 hover:bg-gray-800 text-green-400 font-orbitron uppercase px-4 py-2 rounded-lg flex items-center space-x-1"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls="main-menu"
          aria-label="Main navigation menu"
        >
          <span>Menu</span>
          {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>

        {isOpen && (
          <div 
            id="main-menu"
            className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg z-20 border border-gray-700"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="main-menu-button"
          >
            {/* Weather at the top */}
            <Link 
              to="/weather" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans font-bold"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Weather Center
            </Link>
            
            {/* Dashboard second */}
            <Link 
              to="/dashboard" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Dashboard
            </Link>
            
            {/* Drive Journal third */}
            <Link 
              to="/journal" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Drive Journal
            </Link>
            
            {/* Then the rest of the menu */}
            <Link 
              to="/garage" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Garage Vault
            </Link>
            <Link 
              to="/marketplace" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Marketplace
            </Link>
            <Link 
              to="/events" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Events & Meetups
            </Link>
            <Link 
              to="/seasonal-checklist" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Seasonal Checklist
            </Link>
            
            {/* Juice Box submenu */}
            <div className="block" role="group" aria-label="Juice Box submenu">
              {/* Juice Box main item with dropdown arrow */}
              <div 
                className="flex justify-between items-center px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans cursor-pointer"
                onClick={toggleJuiceBox}
                onKeyDown={handleJuiceBoxKeyDown}
                role="menuitem"
                aria-expanded={juiceBoxOpen}
                aria-haspopup="true"
                tabIndex={0}
              >
                <span>Juice Box™</span>
                {juiceBoxOpen ? 
                  <ChevronDown className="h-4 w-4" aria-hidden="true" /> : 
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                }
              </div>
              
              {/* Collapsible Juice Box submenu */}
              {juiceBoxOpen && (
                <div role="menu" aria-label="Juice Box options">
                  <Link 
                    to="/juicebox" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                  >
                    Main
                  </Link>
                  <Link 
                    to="/gloss-reset" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                  >
                    Gloss Reset
                  </Link>
                  <Link 
                    to="/juice-loadouts" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                  >
                    Loadouts
                  </Link>
                  <Link 
                    to="/gloss-growth" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                  >
                    Gloss Growth
                  </Link>
                  <Link 
                    to="/juicebox-videos" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                  >
                    Video Library
                  </Link>
                </div>
              )}
            </div>
            <Link 
              to="/broker-portal" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Broker Portal
            </Link>
            <Link 
              to="/settings" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Settings
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-800 hover:text-white font-openSans border-t border-gray-700 mt-2"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default DropdownNavbar;
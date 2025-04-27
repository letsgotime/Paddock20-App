import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Define event types
type MouseEventHandler = (event: React.MouseEvent<HTMLDivElement>) => void;

function DropdownNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [juiceBoxOpen, setJuiceBoxOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleJuiceBox: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setJuiceBoxOpen(!juiceBoxOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/auth');
  };

  return (
    <nav className="bg-black border-b border-gray-700 p-4 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-10 w-auto mr-2"
        />
        <span className="text-gray-400 font-orbitron">ApexVault™</span>
      </Link>

      <div className="relative">
        <button 
          onClick={toggleDropdown}
          className="bg-gray-900 hover:bg-gray-800 text-green-400 font-orbitron uppercase px-4 py-2 rounded-lg"
        >
          Menu
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg z-20">
            <Link 
              to="/dashboard" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/garage" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Garage Vault
            </Link>
            <Link 
              to="/journal" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Drive Journal
            </Link>
            <Link 
              to="/marketplace" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Marketplace
            </Link>

            <Link 
              to="/events" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Events & Meetups
            </Link>
            <Link 
              to="/garage-vault" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Garage Vault
            </Link>
            <div className="block">
              {/* Juice Box main item with dropdown arrow */}
              <div 
                className="flex justify-between items-center px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans cursor-pointer"
                onClick={toggleJuiceBox}
              >
                <span>Juice Box™</span>
                {juiceBoxOpen ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </div>
              
              {/* Collapsible Juice Box submenu */}
              {juiceBoxOpen && (
                <div>
                  <Link 
                    to="/juicebox" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                  >
                    Main
                  </Link>
                  <Link 
                    to="/gloss-reset" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                  >
                    Gloss Reset
                  </Link>
                  <Link 
                    to="/juice-loadouts" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                  >
                    Loadouts
                  </Link>
                  <Link 
                    to="/gloss-growth" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                  >
                    Gloss Growth
                  </Link>
                  <Link 
                    to="/juicebox-videos" 
                    className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans pl-8"
                    onClick={() => setIsOpen(false)}
                  >
                    Video Library
                  </Link>
                </div>
              )}
            </div>
            <Link 
              to="/weather" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Weather Center
            </Link>
            <Link 
              to="/seasonal-checklist" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Seasonal Checklist
            </Link>
            <Link 
              to="/broker-portal" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Broker Portal
            </Link>
            <Link 
              to="/settings" 
              className="block px-4 py-2 text-white hover:bg-green-500 hover:text-black font-openSans"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-800 hover:text-white font-openSans border-t border-gray-700 mt-2"
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
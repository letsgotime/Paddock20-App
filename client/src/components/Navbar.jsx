import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logos/GoTime-White.png';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-gray-900 text-white shadow-md" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" aria-label="GoTime Motorsports, back to home">
              <img className="h-8 w-auto" src={Logo} alt="GoTime Motorsports Logo" />
              <span className="ml-3 text-xl font-orbitron">GoTime <span className="text-green-500">Motorsports</span></span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/garage-vault" className="hover:text-green-400">🏎️ Garage Vault</Link>
            <Link to="/paddock20-vault" className="hover:text-green-400">🏁 Paddock20 Vault</Link>
            <Link to="/manifestation-station" className="hover:text-green-400">✨ Manifestation Station</Link>
            <Link to="/mod-planner" className="hover:text-green-400">🔧 Mod Planner</Link>
            <Link to="/concierge" className="hover:text-green-400">👨‍💼 Concierge</Link>
            <Link to="/redline-report" className="hover:text-green-400">📊 Redline Report</Link>
            <Link to="/events" className="hover:text-green-400">📅 Events & Meetups</Link>
            <Link to="/hustle-planner" className="hover:text-green-400">💰 Hustle Planner</Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/garage-vault" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            🏎️ Garage Vault
          </Link>
          <Link to="/paddock20-vault" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            🏁 Paddock20 Vault
          </Link>
          <Link to="/manifestation-station" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            ✨ Manifestation Station
          </Link>
          <Link to="/mod-planner" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            🔧 Mod Planner
          </Link>
          <Link to="/concierge" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            👨‍💼 Concierge
          </Link>
          <Link to="/redline-report" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            📊 Redline Report
          </Link>
          <Link to="/events" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            📅 Events & Meetups
          </Link>
          <Link to="/hustle-planner" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
            💰 Hustle Planner
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
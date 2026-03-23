import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

function HorizontalNavbar() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Check current route
  const isActive = (path) => {
    return location === path ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-green-400';
  };
  
  return (
    <>
      {/* Logo and Name Bar */}
      <div className="bg-black p-4 border-b border-gray-800">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center font-orbitron text-2xl no-underline">
              <img 
                src="/assets/GoTime Logo-7FC844-White (1).png" 
                alt="GoTime Motorsports" 
                className="h-10 w-auto mr-2"
              />
              <span className="text-gray-300 font-orbitron">BTS™</span>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-green-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Horizontal Navigation */}
      <nav className="bg-gray-900 text-white p-2 overflow-x-auto">
        <div className="container mx-auto">
          <div className="flex space-x-1 md:space-x-2 lg:space-x-3 items-center justify-between lg:justify-start">
            <Link to="/weather-center" className={`flex flex-col items-center p-2 ${isActive('/weather-center')}`}>
              <span className="text-xl">☁️</span>
              <span className="text-xs mt-1 whitespace-nowrap">Weather Center</span>
            </Link>
            
            <Link to="/route-planner" className={`flex flex-col items-center p-2 ${isActive('/route-planner')}`}>
              <span className="text-xl">🛣️</span>
              <span className="text-xs mt-1 whitespace-nowrap">Route Planner</span>
            </Link>
            
            <Link to="/events" className={`flex flex-col items-center p-2 ${isActive('/events')}`}>
              <span className="text-xl">📅</span>
              <span className="text-xs mt-1 whitespace-nowrap">Events</span>
            </Link>
            
            <Link to="/paddock20-vault" className={`flex flex-col items-center p-2 ${isActive('/paddock20-vault')}`}>
              <span className="text-xl">🏁</span>
              <span className="text-xs mt-1 whitespace-nowrap">Paddock20</span>
            </Link>
            
            <Link to="/personalized-dashboard" className={`flex flex-col items-center p-2 ${isActive('/personalized-dashboard')}`}>
              <span className="text-xl">📊</span>
              <span className="text-xs mt-1 whitespace-nowrap">My Dashboard</span>
            </Link>
            
            <Link to="/garage-vault" className={`flex flex-col items-center p-2 ${isActive('/garage-vault')}`}>
              <span className="text-xl">🚗</span>
              <span className="text-xs mt-1 whitespace-nowrap">Garage Vault</span>
            </Link>
            
            <Link to="/tires-timepieces" className={`flex flex-col items-center p-2 ${isActive('/tires-timepieces')}`}>
              <span className="text-xl">🛞</span>
              <span className="text-xs mt-1 whitespace-nowrap">Tires & Timepieces</span>
            </Link>
            
            <Link to="/manifestation-mod-planner" className={`flex flex-col items-center p-2 ${isActive('/manifestation-mod-planner')}`}>
              <span className="text-xl">🧭</span>
              <span className="text-xs mt-1 whitespace-nowrap">Manifestation</span>
            </Link>
            
            <Link to="/drive-journal" className={`flex flex-col items-center p-2 ${isActive('/drive-journal')}`}>
              <span className="text-xl">📝</span>
              <span className="text-xs mt-1 whitespace-nowrap">Drive Journal</span>
            </Link>
            
            <Link to="/hustle-planner" className={`flex flex-col items-center p-2 ${isActive('/hustle-planner')}`}>
              <span className="text-xl">🧠</span>
              <span className="text-xs mt-1 whitespace-nowrap">Hustle Planner</span>
            </Link>
            
            <Link to="/juice-box" className={`flex flex-col items-center p-2 ${isActive('/juice-box')}`}>
              <span className="text-xl">🧼</span>
              <span className="text-xs mt-1 whitespace-nowrap">Juice Box</span>
            </Link>
            
            {/* Checklists Dropdown */}
            <div className="relative group">
              <div className={`flex flex-col items-center p-2 cursor-pointer ${isActive('/checklists')}`}>
                <span className="text-xl">✅</span>
                <span className="text-xs mt-1 whitespace-nowrap flex items-center">
                  Checklists <span className="ml-1">🔽</span>
                </span>
              </div>
              <div className="absolute hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg p-2 z-50">
                <Link to="/checklists/tire" className="block py-2 px-4 hover:text-green-400 whitespace-nowrap">
                  🛞 Tire Checklist
                </Link>
                <Link to="/checklists/maintenance" className="block py-2 px-4 hover:text-green-400 whitespace-nowrap">
                  🛠️ Maintenance Checklist
                </Link>
                <Link to="/checklists/pre-drive" className="block py-2 px-4 hover:text-green-400 whitespace-nowrap">
                  🛡️ Pre-Drive Checklist
                </Link>
              </div>
            </div>
            
            <Link to="/concierge" className={`flex flex-col items-center p-2 ${isActive('/concierge')}`}>
              <span className="text-xl">📩</span>
              <span className="text-xs mt-1 whitespace-nowrap">Concierge</span>
            </Link>
            
            <Link to="/affiliate-links" className={`flex flex-col items-center p-2 ${isActive('/affiliate-links')}`}>
              <span className="text-xl">🤝</span>
              <span className="text-xs mt-1 whitespace-nowrap">Affiliate Links</span>
            </Link>
            
            <Link to="/settings" className={`flex flex-col items-center p-2 ${isActive('/settings')}`}>
              <span className="text-xl">⚙️</span>
              <span className="text-xs mt-1 whitespace-nowrap">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu (Hidden on larger screens) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900 border-b border-gray-700">
          <div className="container mx-auto py-4 px-6">
            <div className="grid grid-cols-3 gap-4">
              <Link to="/weather-center" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">☁️</span>
                <span className="text-xs mt-1">Weather</span>
              </Link>
              
              <Link to="/route-planner" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">🛣️</span>
                <span className="text-xs mt-1">Routes</span>
              </Link>
              
              <Link to="/events" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">📅</span>
                <span className="text-xs mt-1">Events</span>
              </Link>
              
              <Link to="/paddock20-vault" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">🏁</span>
                <span className="text-xs mt-1">Paddock20</span>
              </Link>
              
              <Link to="/personalized-dashboard" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">📊</span>
                <span className="text-xs mt-1">Dashboard</span>
              </Link>
              
              <Link to="/garage-vault" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">🚗</span>
                <span className="text-xs mt-1">Garage</span>
              </Link>
              
              <Link to="/tires-timepieces" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">🛞</span>
                <span className="text-xs mt-1">Tires</span>
              </Link>
              
              <Link to="/juice-box" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">🧼</span>
                <span className="text-xs mt-1">Juice Box</span>
              </Link>
              
              <Link to="/checklists/pre-drive" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">✅</span>
                <span className="text-xs mt-1">Checks</span>
              </Link>
              
              <Link to="/settings" className="flex flex-col items-center p-2 text-gray-300 hover:text-green-400">
                <span className="text-xl">⚙️</span>
                <span className="text-xs mt-1">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HorizontalNavbar;
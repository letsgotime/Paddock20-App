import React from 'react';
import { Link } from 'react-router-dom';

function HorizontalNavbar() {
  return (
    <nav className="bg-black border-b border-gray-700 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center font-orbitron text-2xl no-underline">
            <img 
              src="/assets/GTM Logo - Green-White.png" 
              alt="GoTime Motorsports" 
              className="h-10 w-auto mr-2"
            />
            <span className="text-gray-400 font-orbitron">ApexVault™</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 text-gray-300 font-openSans">
            <Link to="/weather-center" className="hover:text-green-400">☁️ Weather Center</Link>
            <Link to="/route-planner" className="hover:text-green-400">🛣️ Route Planner</Link>
            <Link to="/events" className="hover:text-green-400">📅 Events & Meetups</Link>
            <Link to="/paddock20-vault" className="hover:text-green-400">🏁 Paddock20 Membership</Link>
            <Link to="/garage-vault" className="hover:text-green-400">🚗 Garage Vault</Link>
            <Link to="/tires-timepieces" className="hover:text-green-400">🛞 Tires & Timepieces Brokerage</Link>
            <Link to="/manifestation-mod-planner" className="hover:text-green-400">🧭 Manifestation Station & Mod Planner</Link>
            <Link to="/drive-journal" className="hover:text-green-400">📝 Drive Journal</Link>
            <Link to="/hustle-planner" className="hover:text-green-400">🧠 Hustle Planner</Link>
            <Link to="/juice-box" className="hover:text-green-400">🧼 Juice Box</Link>

            {/* Dropdown Section for Checklists */}
            <div className="relative group">
              <button className="flex items-center hover:text-green-400">
                ✅ Checklists <span className="ml-2">🔽</span>
              </button>
              <div className="absolute hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg p-4 mt-2 z-50">
                <Link to="/checklists/tire" className="block hover:text-green-400 py-2">🛞 Tire Checklist</Link>
                <Link to="/checklists/maintenance" className="block hover:text-green-400 py-2">🛠️ Maintenance Checklist</Link>
                <Link to="/checklists/pre-drive" className="block hover:text-green-400 py-2">🛡️ Pre-Drive Checklist</Link>
              </div>
            </div>

            <Link to="/concierge" className="hover:text-green-400">📩 Concierge</Link>
            <Link to="/affiliate-links" className="hover:text-green-400">🤝 Affiliate Links</Link>
            <Link to="/settings" className="hover:text-green-400">⚙️ Settings</Link>
          </div>

          {/* Mobile Menu Button - Shows the dropdown navbar on small screens */}
          <div className="lg:hidden">
            <Link to="#" className="text-green-400">
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HorizontalNavbar;
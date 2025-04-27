import React, { useState } from "react";
import { Link } from "react-router-dom";

const DropdownNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between p-4 bg-black border-b border-gray-700">
      <Link to="/dashboard" className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-10 w-auto mr-2"
        />
        <span className="text-gray-400 font-orbitron">Paddock20™</span>
      </Link>
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-green-500 font-orbitron font-medium px-4 py-2 rounded-md border border-green-500 hover:bg-gray-800"
        >
          Menu
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-gradient-to-r from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-4 space-y-2 z-50">
            <Link to="/weather-center" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>☁️ Weather Center</Link>
            <Link to="/route-planner" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🛣️ Route Planner</Link>
            <Link to="/events" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📅 Events & Meetups</Link>
            <Link to="/paddock20-vault" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🏁 Paddock20 Membership</Link>
            <Link to="/garage-vault" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🚗 Garage Vault</Link>
            <Link to="/tires-timepieces" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🛞 Tires & Timepieces Brokerage</Link>
            <Link to="/manifestation-mod-planner" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🧭 Manifestation Station & Mod Planner</Link>
            <Link to="/drive-journal" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📝 Drive Journal</Link>
            <Link to="/hustle-planner" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🧠 Hustle Planner</Link>
            {/* Juice Box Dropdown */}
            <div className="relative group">
              <button className="flex items-center hover:text-green-400 w-full">
                🧼 Juice Box <span className="ml-2">🔽</span>
              </button>
              <div className="absolute left-full ml-2 top-0 hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg p-4 z-10">
                <Link to="/juicebox" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🧪 Detailing Products</Link>
                <Link to="/juice-loadouts" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🧰 Loadouts</Link>
                <Link to="/gloss-growth" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>✨ Gloss Growth</Link>
                <Link to="/gloss-reset" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🔄 Gloss Reset</Link>
                <Link to="/juicebox-videos" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🎥 Video Library</Link>
              </div>
            </div>

            {/* Checklists Dropdown */}
            <div className="relative group">
              <button className="flex items-center hover:text-green-400 w-full">
                ✅ Checklists <span className="ml-2">🔽</span>
              </button>
              <div className="absolute left-full ml-2 top-0 hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg p-4 z-10">
                <Link to="/checklists/tire" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🛞 Tire Checklist</Link>
                <Link to="/checklists/maintenance" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🛠️ Maintenance Checklist</Link>
                <Link to="/checklists/pre-drive" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🛡️ Pre-Drive Checklist</Link>
                <Link to="/seasonal-checklist" className="block hover:text-green-400" onClick={() => setIsOpen(false)}>🌦️ Seasonal Checklist</Link>
              </div>
            </div>

            <Link to="/concierge" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📩 Concierge</Link>
            <Link to="/affiliate-links" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🤝 Affiliate Links</Link>
            <Link to="/ebooks" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📚 GoTime eBooks Vault</Link>
            <Link to="/settings" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>⚙️ Settings</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DropdownNavbar;
import React from "react";
import { Link } from "react-router-dom";

const DropdownNavbar = () => {
  return (
    <nav className="space-y-2 bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="flex items-center font-orbitron text-2xl no-underline">
          <img 
            src="/assets/GTM Logo - Green-White.png" 
            alt="GoTime Motorsports" 
            className="h-10 w-auto mr-2"
          />
          <span className="text-gray-400 font-orbitron">ApexVault™</span>
        </Link>
      </div>
      
      <Link to="/weather-center" className="hover:text-green-400 block">☁️ Weather Center</Link>
      <Link to="/route-planner" className="hover:text-green-400 block">🛣️ Route Planner</Link>
      <Link to="/events" className="hover:text-green-400 block">📅 Events & Meetups</Link>
      <Link to="/paddock20-vault" className="hover:text-green-400 block">🏁 Paddock20 Membership</Link>
      <Link to="/garage-vault" className="hover:text-green-400 block">🚗 Garage Vault</Link>
      <Link to="/tires-timepieces" className="hover:text-green-400 block">🛞 Tires & Timepieces Brokerage</Link>
      <Link to="/manifestation-mod-planner" className="hover:text-green-400 block">🧭 Manifestation Station & Mod Planner</Link>
      <Link to="/drive-journal" className="hover:text-green-400 block">📝 Drive Journal</Link>
      <Link to="/hustle-planner" className="hover:text-green-400 block">🧠 Hustle Planner</Link>
      <Link to="/juice-box" className="hover:text-green-400 block">🧼 Juice Box</Link>

      {/* Checklists Dropdown */}
      <div className="relative group">
        <button className="flex items-center hover:text-green-400 w-full">
          ✅ Checklists <span className="ml-2">🔽</span>
        </button>
        <div className="absolute hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg p-4 mt-2 z-10">
          <Link to="/checklists/tire" className="block hover:text-green-400">🛞 Tire Checklist</Link>
          <Link to="/checklists/maintenance" className="block hover:text-green-400">🛠️ Maintenance Checklist</Link>
          <Link to="/checklists/pre-drive" className="block hover:text-green-400">🛡️ Pre-Drive Checklist</Link>
        </div>
      </div>

      <Link to="/concierge" className="hover:text-green-400 block">📩 Concierge</Link>
      <Link to="/affiliate-links" className="hover:text-green-400 block">🤝 Affiliate Links</Link>
      <Link to="/settings" className="hover:text-green-400 block">⚙️ Settings</Link>
    </nav>
  );
};

export default DropdownNavbar;
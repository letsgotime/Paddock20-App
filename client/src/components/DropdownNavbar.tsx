import React from "react";
import { Link } from "react-router-dom";

const DropdownNavbar = () => {
  return (
    <nav className="space-y-2 p-4 bg-black border-b border-gray-700">
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
      
      <Link to="/weather-center" className="block py-2 hover:text-green-400">☁️ Weather Center</Link>
      <Link to="/route-planner" className="block py-2 hover:text-green-400">🛣️ Route Planner</Link>
      <Link to="/events" className="block py-2 hover:text-green-400">📅 Events & Meetups</Link>
      <Link to="/paddock20-vault" className="block py-2 hover:text-green-400">🏁 Paddock20 Membership</Link>
      <Link to="/garage-vault" className="block py-2 hover:text-green-400">🚗 Garage Vault</Link>
      <Link to="/tires-timepieces" className="block py-2 hover:text-green-400">🛞 Tires & Timepieces Brokerage</Link>
      <Link to="/manifestation-mod-planner" className="block py-2 hover:text-green-400">🧭 Manifestation Station & Mod Planner</Link>
      <Link to="/drive-journal" className="block py-2 hover:text-green-400">📝 Drive Journal</Link>
      <Link to="/hustle-planner" className="block py-2 hover:text-green-400">🧠 Hustle Planner</Link>
      <Link to="/juice-box" className="block py-2 hover:text-green-400">🧼 Juice Box</Link>

      {/* Checklists Dropdown */}
      <div className="relative group">
        <button className="flex items-center py-2 hover:text-green-400 w-full text-left">
          ✅ Checklists <span className="ml-2">🔽</span>
        </button>
        <div className="absolute hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg p-4 mt-2 z-50">
          <Link to="/checklists/tire" className="block py-2 hover:text-green-400">🛞 Tire Checklist</Link>
          <Link to="/checklists/maintenance" className="block py-2 hover:text-green-400">🛠️ Maintenance Checklist</Link>
          <Link to="/checklists/pre-drive" className="block py-2 hover:text-green-400">🛡️ Pre-Drive Checklist</Link>
        </div>
      </div>

      <Link to="/concierge" className="block py-2 hover:text-green-400">📩 Concierge</Link>
      <Link to="/affiliate-links" className="block py-2 hover:text-green-400">🤝 Affiliate Links</Link>
      <Link to="/settings" className="block py-2 hover:text-green-400">⚙️ Settings</Link>
    </nav>
  );
};

export default DropdownNavbar;
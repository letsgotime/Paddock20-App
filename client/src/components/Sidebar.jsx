import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 p-6 hidden md:block">
      <nav className="flex flex-col space-y-4">
        <Link to="/" className="hover:text-green-400">🏠 Home</Link>
        <Link to="/garage-vault" className="hover:text-green-400">🚗 Garage Vault</Link>
        <Link to="/manifestation-station" className="hover:text-green-400">🧭 Manifestation Station</Link>
        <Link to="/mod-planner" className="hover:text-green-400">🔧 Mod Planner</Link>
        <Link to="/concierge" className="hover:text-green-400">🛞 Concierge</Link>
        <Link to="/redline-report" className="hover:text-green-400">🎥 Redline Report</Link>
        <Link to="/events" className="hover:text-green-400">📅 Events & Meetups</Link> {/* Links to your EXISTING module */}
        <Link to="/hustle-planner" className="hover:text-green-400">🧠 Hustle Planner</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
import React from "react";
import { Link } from "wouter";

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 p-6 hidden md:block">
      <nav className="flex flex-col space-y-4">
        <Link href="/" className="hover:text-green-400">🏠 Home</Link>
        <Link href="/garage-vault" className="hover:text-green-400">🚗 Garage Vault</Link>
        <Link href="/paddock20-vault" className="hover:text-green-400">🏁 Paddock20 Vault</Link>
        <Link href="/manifestation-station" className="hover:text-green-400">🧭 Manifestation Station</Link>
        <Link href="/mod-planner" className="hover:text-green-400">🔧 Mod Planner</Link>
        <Link href="/concierge" className="hover:text-green-400">🛞 Concierge</Link>
        <Link href="/redline-report" className="hover:text-green-400">🎥 Redline Report</Link>
        <Link href="/events" className="hover:text-green-400">📅 Events & Meetups</Link> {/* Links to your EXISTING module */}
        <Link href="/hustle-planner" className="hover:text-green-400">🧠 Hustle Planner</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

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
          <div className="absolute right-0 mt-2 w-60 bg-gradient-to-r from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-4 space-y-2 z-50 border border-gray-800">
            <Link to="/" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🏠 Home</Link>
            <Link to="/personalized-dashboard" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📊 My Dashboard</Link>
            <Link to="/weather" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>☁️ Weather Center</Link>
            <Link to="/new-weather-center" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>☁️ New Weather Center</Link>
            <Link to="/route-planner" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🛣️ Route Planner</Link>
            <Link to="/events" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📅 Events & Meetups</Link>
            <Link to="/paddock20-vault" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🏁 Paddock20 Membership</Link>
            <Link to="/garage-vault" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🚗 Garage Vault</Link>
            <Link to="/tires-timepieces" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🛞 Tires & Timepieces Brokerage</Link>
            <Link to="/manifestation-station" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🧭 Manifestation Station™</Link>
            <Link to="/manifestation-station" className="hover:text-green-400 block" onClick={() => {
              // Route mod planner to Manifestation Station with hustle planner view
              window.localStorage.setItem('manifestation_activeView', 'hustle-planner');
              window.localStorage.setItem('manifestation_context', 'vehicle-mods');
              setIsOpen(false);
            }}>📐 Mod Planner</Link>
            <Link to="/drive-journal" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📝 Drive Journal</Link>
            <Link to="/manifestation-station" className="hover:text-green-400 block" onClick={() => {
              // Directly navigate to the Manifestation Station with the hustle planner view
              window.localStorage.setItem('manifestation_activeView', 'hustle-planner');
              setIsOpen(false);
            }}>🧠 Hustle Planner</Link>
            <Link to="/manifestation-station" className="hover:text-green-400 block" onClick={() => {
              // Directly navigate to the Manifestation Station with the discipline tracker view
              window.localStorage.setItem('manifestation_activeView', 'discipline-tracker');
              setIsOpen(false);
            }}>📅 Daily Check-in</Link>
            <Link to="/juicebox" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>🧼 Juice Box</Link>
            <Link to="/discounts" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>💸 Discounts & Promotions</Link>
            
            {/* Checklists Dropdown */}
            <div className="relative group" 
                 onMouseEnter={(e) => e.currentTarget.classList.add('menu-open')}
                 onMouseLeave={(e) => {
                    // Add a delay before removing the class
                    const currentElem = e.currentTarget;
                    setTimeout(() => {
                      if (currentElem && !currentElem.classList.contains('hover-active')) {
                        currentElem.classList.remove('menu-open');
                      }
                    }, 500); // 500ms delay
                 }}>
              <button className="flex items-center hover:text-green-400 w-full">
                ✅ Checklists
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <div className="absolute top-0 right-full mr-2 hidden menu-content bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 z-10 w-48">
                <Link to="/seasonal-checklist" className="block hover:text-green-400 mb-2" onClick={() => setIsOpen(false)}>🌡️ Seasonal Checklist</Link>
                <Link to="/pre-drive-checklist" className="block hover:text-green-400 mb-2" onClick={() => setIsOpen(false)}>🛡️ Pre-Drive Checklist</Link>
                <Link to="/juicebox" className="block hover:text-green-400 mb-2" onClick={() => setIsOpen(false)}>🧼 Detailing Checklist</Link>
              </div>
            </div>

            <Link to="/concierge" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📩 Concierge</Link>
            <Link to="/contact" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📩 Contact Us</Link>
            <Link to="/ebooks" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>📚 GoTime eBooks Vault</Link>
            <Link to="/chat-feed" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>💬 Member Chat Feed</Link>
            <Link to="/settings" className="hover:text-green-400 block" onClick={() => setIsOpen(false)}>⚙️ Settings</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DropdownNavbar;
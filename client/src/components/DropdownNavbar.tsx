import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, Home, LayoutDashboard, Cloud, MapPin,
  Calendar, Flag, Car, Watch, Compass, Ruler,
  BookOpen, Brain, ClipboardCheck, SprayCan, Percent,
  Mail, BookMarked, MessageCircle, Settings, HeartHandshake,
  Shield
} from "lucide-react";

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
            <Link to="/" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Home className="h-4 w-4 mr-2 text-blue-400" />
              <span>Home</span>
            </Link>
            <Link to="/personalized-dashboard" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <LayoutDashboard className="h-4 w-4 mr-2 text-blue-400" />
              <span>My Dashboard</span>
            </Link>
            <Link to="/weather" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Cloud className="h-4 w-4 mr-2 text-blue-400" />
              <span>Weather Center</span>
            </Link>
            <Link to="/new-weather-center" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Cloud className="h-4 w-4 mr-2 text-blue-400" />
              <span>New Weather Center</span>
            </Link>
            <Link to="/route-planner" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <MapPin className="h-4 w-4 mr-2 text-blue-400" />
              <span>Fun Drive Planner</span>
            </Link>
            <Link to="/events" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
              <span>Events & Meetups</span>
            </Link>
            <Link to="/paddock20-vault" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Flag className="h-4 w-4 mr-2 text-blue-400" />
              <span>Paddock20 Membership</span>
            </Link>
            <Link to="/garage-vault" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Car className="h-4 w-4 mr-2 text-blue-400" />
              <span>Garage Vault</span>
            </Link>
            <Link to="/tires-timepieces" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Watch className="h-4 w-4 mr-2 text-blue-400" />
              <span>Tires & Timepieces Brokerage</span>
            </Link>
            <Link to="/manifestation-station" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Compass className="h-4 w-4 mr-2 text-blue-400" />
              <span>Manifestation Station™</span>
            </Link>
            <Link to="/manifestation-station" className="hover:text-green-400 flex items-center py-1" onClick={() => {
              // Route mod planner to Manifestation Station with hustle planner view
              window.localStorage.setItem('manifestation_activeView', 'hustle-planner');
              window.localStorage.setItem('manifestation_context', 'vehicle-mods');
              setIsOpen(false);
            }}>
              <Ruler className="h-4 w-4 mr-2 text-blue-400" />
              <span>Mod Planner</span>
            </Link>
            <Link to="/drive-journal" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
              <span>Drive Journal</span>
            </Link>
            <Link to="/manifestation-station" className="hover:text-green-400 flex items-center py-1" onClick={() => {
              // Directly navigate to the Manifestation Station with the hustle planner view
              window.localStorage.setItem('manifestation_activeView', 'hustle-planner');
              setIsOpen(false);
            }}>
              <Brain className="h-4 w-4 mr-2 text-blue-400" />
              <span>Hustle Planner</span>
            </Link>
            <Link to="/manifestation-station" className="hover:text-green-400 flex items-center py-1" onClick={() => {
              // Directly navigate to the Manifestation Station with the discipline tracker view
              window.localStorage.setItem('manifestation_activeView', 'discipline-tracker');
              setIsOpen(false);
            }}>
              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
              <span>Daily Check-in</span>
            </Link>
            <Link to="/juicebox" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <SprayCan className="h-4 w-4 mr-2 text-blue-400" />
              <span>Juice Box</span>
            </Link>
            <Link to="/discounts" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Percent className="h-4 w-4 mr-2 text-blue-400" />
              <span>Discounts & Promotions</span>
            </Link>
            
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
                <ClipboardCheck className="h-4 w-4 mr-2 text-blue-400" />
                <span>Checklists</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
              <div className="absolute top-0 right-full mr-2 hidden menu-content bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 z-10 w-48">
                <Link to="/seasonal-checklist" className="flex items-center hover:text-green-400 mb-2 py-1" onClick={() => setIsOpen(false)}>
                  <Cloud className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Seasonal Checklist</span>
                </Link>
                <Link to="/pre-drive-checklist" className="flex items-center hover:text-green-400 mb-2 py-1" onClick={() => setIsOpen(false)}>
                  <Shield className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Pre-Drive Checklist</span>
                </Link>
                <Link to="/juicebox" className="flex items-center hover:text-green-400 mb-2 py-1" onClick={() => setIsOpen(false)}>
                  <SprayCan className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Detailing Checklist</span>
                </Link>
              </div>
            </div>

            <Link to="/concierge" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <HeartHandshake className="h-4 w-4 mr-2 text-blue-400" />
              <span>Concierge</span>
            </Link>
            <Link to="/contact" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Mail className="h-4 w-4 mr-2 text-blue-400" />
              <span>Contact Us</span>
            </Link>
            <Link to="/ebooks" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <BookMarked className="h-4 w-4 mr-2 text-blue-400" />
              <span>GoTime eBooks Vault</span>
            </Link>
            <Link to="/chat-feed" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <MessageCircle className="h-4 w-4 mr-2 text-blue-400" />
              <span>Member Chat Feed</span>
            </Link>
            <Link to="/settings" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
              <Settings className="h-4 w-4 mr-2 text-blue-400" />
              <span>Settings</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DropdownNavbar;
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Home, LayoutDashboard, Cloud, MapPin,
  Calendar, Flag, Car, Watch, Compass, Ruler,
  BookOpen, Brain, ClipboardCheck, SprayCan, Percent,
  Mail, BookMarked, MessageCircle, Settings, HeartHandshake,
  Shield, Trophy, Award, Star, Medal
} from "lucide-react";
import { useRewards } from "../contexts/RewardsContext";

// This structure makes it easy to add new rewards tracks/branches in the future
const REWARD_TRACKS = {
  MAIN: 'main',
  DRIVING: 'driving',
  DETAILING: 'detailing',
  TRACK_DAY: 'track_day',
  MOTORSPORT: 'motorsport',
  COLLECTOR: 'collector'
};

// Level thresholds - easy to modify point requirements
const LEVEL_THRESHOLDS = [
  { level: 1, points: 0 },
  { level: 2, points: 100 },
  { level: 3, points: 250 },
  { level: 4, points: 500 },
  { level: 5, points: 1000 },
  { level: 6, points: 2000 },
  { level: 7, points: 3500 },
  { level: 8, points: 5000 },
  { level: 9, points: 7500 },
  { level: 10, points: 10000 },
  { level: 15, points: 25000 },
  { level: 20, points: 50000 },
  { level: 25, points: 100000 }
];

// Driver rank titles based on level - easy to add new ranks
const DRIVER_RANKS = [
  { minLevel: 25, title: "Racing Legend" },
  { minLevel: 20, title: "Grand Champion" },
  { minLevel: 15, title: "Master Driver" },
  { minLevel: 10, title: "Elite Driver" },
  { minLevel: 5, title: "Senior Driver" },
  { minLevel: 0, title: "Driver" }
];

const DropdownNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPodiumOpen, setIsPodiumOpen] = useState(false);
  const location = useLocation();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { userRewards, pointsToNextLevel } = useRewards();
  
  // Close menu on location changes (navigation)
  useEffect(() => {
    setIsOpen(false);
    setIsPodiumOpen(false);
  }, [location.pathname]);
  
  // Handle clicks outside the menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    }
    
    // Add event listener when either menu is open
    if (isOpen || isPodiumOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isPodiumOpen]);

  // Get level icon based on driver level - easy to add new icons/levels
  const getLevelIcon = () => {
    const driverLevel = userRewards.level;
    switch (true) {
      case driverLevel >= 25:
        return <Trophy className="text-purple-400 h-4 w-4" />;
      case driverLevel >= 20:
        return <Trophy className="text-yellow-400 h-4 w-4" />;
      case driverLevel >= 15:
        return <Award className="text-blue-400 h-4 w-4" />;
      case driverLevel >= 10:
        return <Medal className="text-green-400 h-4 w-4" />;
      case driverLevel >= 5:
        return <Star className="text-orange-400 h-4 w-4" />;
      default:
        return <Trophy className="text-gray-400 h-4 w-4" />;
    }
  };

  // Get appropriate level name from predefined ranks
  const getLevelName = () => {
    const driverLevel = userRewards.level;
    const rank = DRIVER_RANKS.find(rank => driverLevel >= rank.minLevel);
    return rank ? rank.title : "Driver";
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-black border-b border-gray-700 relative z-30">
      <Link to="/dashboard" className="flex items-center font-orbitron text-2xl no-underline">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-10 w-auto mr-2"
        />
        <span className="text-gray-400 font-orbitron">Paddock20™</span>
      </Link>
      
      <div className="flex items-center space-x-3">
        {/* Main menu dropdown */}
        <div className="relative" ref={menuRef}>
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
              
              {/* Podium Pursuit Link */}
              <Link 
                to="/podium-pursuit" 
                className="hover:text-green-400 flex items-center py-1" 
                onClick={() => setIsOpen(false)}
              >
                <Medal className="h-4 w-4 mr-2 text-blue-400" />
                <span>Podium Pursuit</span>
              </Link>

              <Link to="/new-weather-center" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
                <Cloud className="h-4 w-4 mr-2 text-blue-400" />
                <span>Weather Paddock</span>
              </Link>
              <Link to="/route-planner" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                <span>Fun Drive Planner</span>
              </Link>
              <Link to="/events" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
                <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                <span>Events & Meetups</span>
              </Link>
              <Link to="/motorsports-events" className="hover:text-green-400 flex items-center py-1 text-green-400" onClick={() => setIsOpen(false)}>
                <Trophy className="h-4 w-4 mr-2 text-blue-400" />
                <span>Motorsports Events</span>
              </Link>
              <Link to="/motorsports-gallery" className="hover:text-green-400 flex items-center py-1 text-green-400 animate-pulse" onClick={() => setIsOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Motorsports Gallery</span>
                <span className="ml-2 text-xs text-green-500 font-orbitron">NEW</span>
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

              <Link to="/drive-journal" className="hover:text-green-400 flex items-center py-1" onClick={() => setIsOpen(false)}>
                <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                <span>Drive Journal</span>
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
      </div>
    </nav>
  );
};

export default DropdownNavbar;
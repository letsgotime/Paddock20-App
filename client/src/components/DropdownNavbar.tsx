import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Home, LayoutDashboard, Cloud, MapPin,
  Calendar, Flag, Car, Watch, Compass, Ruler,
  BookOpen, Brain, ClipboardCheck, SprayCan, Percent,
  Mail, BookMarked, MessageCircle, Settings, HeartHandshake,
  Shield, Trophy, Award, Star, Medal, VolumeX, Volume2
} from "lucide-react";
import { useRewards } from "../contexts/RewardsContext";
import { playMotorsportSound, getSoundSettings, setSoundEnabled } from "../services/soundService";

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
  const [isPodiumOpen, setIsPodiumOpen] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const location = useLocation();
  const { userRewards, pointsToNextLevel } = useRewards();
  
  // Initialize sound settings from sound service
  useEffect(() => {
    const soundSettings = getSoundSettings();
    setSoundEnabledState(soundSettings.enabled);
  }, []);
  
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
      </Link>
      
      <div className="flex items-center space-x-3">
        {/* Sound toggle button */}
        <button
          onClick={() => {
            // Toggle sound setting
            const newState = !soundEnabled;
            setSoundEnabledState(newState);
            setSoundEnabled(newState);
            // Play sound effect for toggle
            if (newState) {
              playMotorsportSound('radio_beep');
            }
          }}
          className="text-gray-400 hover:text-blue-400 p-2 rounded-full transition-colors duration-200"
          aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        
        {/* Sound Library link */}
        <Link 
          to="/sound-library" 
          className="text-gray-400 hover:text-blue-400 p-2 transition-colors duration-200"
          aria-label="Sound Library"
          title="Sound Library"
          onClick={() => soundEnabled && playMotorsportSound('button_press')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9.5a6 2.5 0 0 1 6 -2.5"></path>
            <path d="M8 17a6 2.5 0 0 0 6 -2.5"></path>
            <path d="M14 7a6 2.5 0 0 1 6 -2.5"></path>
            <path d="M20 14.5a6 2.5 0 0 1 -6 2.5"></path>
          </svg>
        </Link>
      </div>
    </nav>
  );
};

export default DropdownNavbar;
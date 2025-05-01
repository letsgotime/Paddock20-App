import React, { useState } from 'react';
import { Menu, X, ChevronDown, Settings, Home, Cloud, Map, Car, Clock, BarChart3, Gauge, Bell, AlertTriangle, ThermometerSun, Wind, Droplets } from 'lucide-react';
import { Link, useLocation } from 'wouter';

/**
 * DashboardHeader - F1-style header with ribbon and menu dropdown
 * Provides navigation and branding for the main dashboard
 * Styled to match Manifestation Station design
 */
const DashboardHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  // Menu navigation items - only include routes we know exist
  const menuItems = [
    { name: 'Dashboard', icon: <Home size={18} />, route: '/' },
    { name: 'Route Analysis', icon: <Map size={18} />, route: '/route-analysis' },
    { name: 'Weather View', icon: <Cloud size={18} />, route: '/' },
  ];

  // F1-style telemetry data
  const telemetryData = [
    { label: "HUMIDITY", icon: <Droplets size={12} />, value: "73%" },
    { label: "WIND", icon: <Wind size={12} />, value: "8MPH" },
    { label: "SURFACE", icon: <ThermometerSun size={12} />, value: "DRY" },
    { label: "ALERTS", icon: <AlertTriangle size={12} />, value: "NONE" }
  ];

  return (
    <header className="w-full">
      {/* Top ribbon - F1-style telemetry banner inspired by Manifestation Station */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 py-1 px-4 flex justify-between items-center border-b border-blue-800">
        <div className="text-xs text-gray-300 flex items-center space-x-4">
          <span className="text-blue-400 font-bold">PADDOCK20™</span>
          <span className="text-gray-500">|</span>
          <span>LIVE TELEMETRY</span>
        </div>
        
        {/* Live telemetry data in ribbon */}
        <div className="hidden md:flex space-x-6">
          {telemetryData.map((data, index) => (
            <div key={index} className="flex items-center space-x-1">
              <span className="text-blue-400">{data.icon}</span>
              <span className="text-xs text-gray-400">{data.label}:</span>
              <span className="text-xs text-gray-300">{data.value}</span>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-300 flex items-center">
          <Bell size={12} className="mr-1 text-green-400" />
          <span className="animate-pulse text-green-400">DRIVING INTELLIGENCE ACTIVE</span>
        </div>
      </div>

      {/* Main header section - Matching Manifestation Station styling */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-black to-gray-900 p-5 rounded-lg border-l-4 border-blue-400 shadow-lg">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-3xl md:text-4xl font-orbitron text-blue-400">WEATHER PADDOCK</div>
            <div className="text-lg md:text-xl font-semibold mt-1">F1-Inspired Weather & Navigation Telemetry</div>
          </div>
          
          {/* Menu button with green border like Manifestation Station */}
          <div className="mt-4 md:mt-0 relative">
            <div className="flex overflow-hidden rounded-md border-2 border-green-500">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 hover:bg-blue-600 transition-colors"
                aria-expanded={menuOpen}
                aria-label="Main menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
                <span className="font-medium">Menu</span>
                <ChevronDown size={14} className={`transform transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <Link
                to="/"
                className="px-4 py-2 bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white border-l-2 border-green-500"
              >
                <Home size={18} />
              </Link>
            </div>
            
            {/* Menu dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-700">
                <div className="p-2">
                  {menuItems.map((item) => (
                    <Link 
                      key={item.name}
                      to={item.route}
                      className={`flex items-center space-x-3 p-3 rounded-md hover:bg-blue-900/50 transition-colors ${location === item.route ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className={location === item.route ? "text-white" : "text-blue-400"}>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
                {/* No profile link as we don't have a profile route */}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
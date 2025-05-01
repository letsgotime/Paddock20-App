import React, { useState, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Car, MapPin, Gauge, CloudRain, 
  BookOpen, Camera, Brain
} from 'lucide-react';

// Simple stable version for testing - uses minimal components
export default function Paddock20HomePageSimple() {
  const [activeSection, setActiveSection] = useState('command-center');
  
  // Stable tab switching function
  const handleTabChange = useCallback((tabId: string) => {
    try {
      console.log("Switching to tab:", tabId);
      setActiveSection(tabId);
    } catch (error) {
      console.error("Error switching tabs:", error);
    }
  }, []);
  
  return (
    <div className="bg-black text-white min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4">
            PADDOCK20™ (Debug Version)
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Simplified version for debugging - all functionality removed
          </p>
        </div>
        
        {/* Tab Navigation - Simplified for stability */}
        <div className="mb-6 bg-gray-900 rounded-lg border border-blue-900 overflow-x-auto">
          <div className="flex p-1">
            {[
              { id: 'command-center', label: 'Command Center', icon: <Gauge className="h-4 w-4" /> },
              { id: 'driver-weather', label: 'Driver Weather', icon: <CloudRain className="h-4 w-4" /> },
              { id: 'motorsports-gallery', label: 'Gallery', icon: <Camera className="h-4 w-4" /> },
              { id: 'drive-journal', label: 'Drive Journal', icon: <BookOpen className="h-4 w-4" /> },
              { id: 'route-planner', label: 'Route Planner', icon: <MapPin className="h-4 w-4" /> },
              { id: 'garage-vault', label: 'Garage', icon: <Car className="h-4 w-4" /> },
              { id: 'manifestation', label: 'Manifestation', icon: <Brain className="h-4 w-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-4 py-2 whitespace-nowrap rounded-md transition-colors ${
                  activeSection === tab.id 
                    ? 'bg-blue-900 text-blue-400 border border-blue-500' 
                    : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content Area - Simplified for stability */}
        <div className="min-h-[600px] bg-gray-900 rounded-lg p-4">
          <h2 className="text-xl text-blue-400 mb-4">Active Section: {activeSection}</h2>
          
          <div className="space-y-4">
            {activeSection === 'command-center' && (
              <div className="border border-blue-800 rounded p-4">
                <h3 className="text-lg text-blue-300 mb-2">Command Center</h3>
                <p className="text-gray-400">This is a simplified version of the Command Center for debugging.</p>
              </div>
            )}
            
            {activeSection === 'driver-weather' && (
              <div className="border border-blue-800 rounded p-4">
                <h3 className="text-lg text-blue-300 mb-2">Driver Weather</h3>
                <p className="text-gray-400">This is a simplified version of the Driver Weather for debugging.</p>
              </div>
            )}
            
            {activeSection === 'motorsports-gallery' && (
              <div className="border border-blue-800 rounded p-4">
                <h3 className="text-lg text-blue-300 mb-2">Motorsports Gallery</h3>
                <p className="text-gray-400">This is a simplified version of the Motorsports Gallery for debugging.</p>
              </div>
            )}
            
            {activeSection === 'drive-journal' && (
              <div className="border border-blue-800 rounded p-4">
                <h3 className="text-lg text-blue-300 mb-2">Drive Journal</h3>
                <p className="text-gray-400">This is a simplified version of the Drive Journal for debugging.</p>
              </div>
            )}
            
            {activeSection === 'route-planner' && (
              <div className="border border-blue-800 rounded p-4">
                <h3 className="text-lg text-blue-300 mb-2">Route Planner</h3>
                <p className="text-gray-400">This is a simplified version of the Route Planner for debugging.</p>
              </div>
            )}
            
            {activeSection === 'garage-vault' && (
              <div className="border border-blue-800 rounded p-4">
                <h3 className="text-lg text-blue-300 mb-2">Garage Vault</h3>
                <p className="text-gray-400">This is a simplified version of the Garage Vault for debugging.</p>
              </div>
            )}
            
            {activeSection === 'manifestation' && (
              <div className="border border-blue-800 rounded p-4">
                <h3 className="text-lg text-blue-300 mb-2">Manifestation</h3>
                <p className="text-gray-400">This is a simplified version of the Manifestation Station for debugging.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/dashboard" className="text-blue-500 hover:text-blue-400">
              Go back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
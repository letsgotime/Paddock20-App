import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeatherStation from "../components/WeatherStation";

function Home() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className='text-green-400 font-orbitron text-2xl mb-4'>GoTime Motorsports Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">🚗 Garage Vault</h3>
          <p className="text-gray-300 mb-4">
            Manage your vehicles, maintenance records, and gloss tracking in one place.
          </p>
          <div className="flex justify-end">
            <Link to="/garage-vault" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors">
              Open Garage
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">🛞 Tire Lifecycle</h3>
          <p className="text-gray-300 mb-4">
            Track tire mileage, rotations, and replacements for optimal performance.
          </p>
          <div className="flex justify-end">
            <Link to="/garage-vault" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors">
              View Tires
            </Link>
          </div>
        </div>
      </div>
      
      {/* Weather Section with Weather Mood Emotions and Blue North Carolina Styling */}
      <div className="mb-8">
        <h3 className="text-blue-400 font-orbitron text-xl mb-4">☀️ Weather Station</h3>
        <div className="bg-blue-900 bg-opacity-10 border border-blue-800 rounded-lg p-6">
          <WeatherStation />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">🧭 Manifestation</h3>
          <p className="text-gray-300 mb-4">
            Your dream car wish list and achievement timeline.
          </p>
          <div className="flex justify-end">
            <Link to="/manifestation-station" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
              Open
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">🔧 Mods</h3>
          <p className="text-gray-300 mb-4">
            Plan your upgrades, performance mods, and detailing.
          </p>
          <div className="flex justify-end">
            <Link to="/mod-planner" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
              Open
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">🧠 Hustle Planner</h3>
          <p className="text-gray-300 mb-4">
            Syndicate planning and automotive investment strategies.
          </p>
          <div className="flex justify-end">
            <Link to="/hustle-planner" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
              Open
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-8">
          <h2 className='text-green-400 font-orbitron text-3xl mb-4'>Welcome to ApexVault™</h2>
          <p className='text-white text-lg mb-6'>Your comprehensive platform for managing your automotive assets, maintenance, and journey.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black bg-opacity-50 p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-colors">
              <h3 className="text-green-400 font-orbitron text-xl mb-3">Garage Vault</h3>
              <p className="text-gray-300 mb-4">Manage your vehicles, track mods, tires, gloss, readiness — all sovereign, exportable, private.</p>
              <Link to="/garage-vault" className="inline-block bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition-colors">
                Access Vault
              </Link>
            </div>
            
            <div className="bg-black bg-opacity-50 p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-colors">
              <h3 className="text-green-400 font-orbitron text-xl mb-3">Manifestation Station</h3>
              <p className="text-gray-300 mb-4">Track your dream assets: future cars, watches, collectibles, garages.</p>
              <Link to="/manifestation-station" className="inline-block bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition-colors">
                Manifest Dreams
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-colors">
          <h3 className="text-green-400 font-orbitron text-xl mb-3">Mod Planner</h3>
          <p className="text-gray-300 mb-4">Plan and track your upgrades and customizations.</p>
          <Link to="/mod-planner" className="text-green-400 hover:text-white transition-colors">
            Explore →
          </Link>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-colors">
          <h3 className="text-green-400 font-orbitron text-xl mb-3">Concierge</h3>
          <p className="text-gray-300 mb-4">Submit asset sourcing requests: cars, watches, collectibles.</p>
          <Link to="/concierge" className="text-green-400 hover:text-white transition-colors">
            Explore →
          </Link>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-green-400 transition-colors">
          <h3 className="text-green-400 font-orbitron text-xl mb-3">Redline Report</h3>
          <p className="text-gray-300 mb-4">View cinematic flips, drops, and motorsport media.</p>
          <Link to="/redline-report" className="text-green-400 hover:text-white transition-colors">
            Explore →
          </Link>
        </div>
      </div>
      
      <div className="bg-black bg-opacity-50 p-6 rounded-lg border border-gray-800">
        <h3 className="text-green-400 font-orbitron text-xl mb-3">Hustle Planner</h3>
        <p className="text-gray-300 mb-4">Plan milestones, flips, funding targets, and syndicate growth.</p>
        <Link to="/hustle-planner" className="inline-block bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition-colors">
          Start Planning
        </Link>
      </div>
    </div>
  );
}

export default Home;
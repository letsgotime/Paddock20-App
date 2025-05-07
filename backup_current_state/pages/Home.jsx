import React from "react";
import { Link } from "react-router-dom";
import HomeWeatherWidget from '../components/HomeWeatherWidget';
import ConsolidatedWeatherDashboard from '../components/ConsolidatedWeatherDashboard';

function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-blue-400 font-orbitron text-4xl mb-3">Welcome to Paddock20™</h1>
        <p className="text-white text-xl max-w-3xl mx-auto">Drive Life. Document Legacy. Built for the serious. Designed for the seamless.</p>
      </div>
      
      <div className="space-y-10">
        {/* Featured section - Weather Intelligence using Consolidated API */}
        <section aria-labelledby="weather-heading">
          <h2 id="weather-heading" className="text-green-500 font-orbitron text-2xl mb-5 text-center">
            <span className="bg-green-500 text-black px-2 rounded-md text-xs align-middle mr-2">BETA</span>
            Weather Intelligence Center
          </h2>
          <div className="mb-6">
            <ConsolidatedWeatherDashboard />
          </div>
          <div className="mt-3 text-center">
            <Link to="/weather-paddock" className="inline-flex items-center justify-center bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 py-2 px-4 rounded-md text-sm transition-colors">
              <span>Visit the full Weather Paddock</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </section>
        
        {/* Other homepage modules */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-green-500 font-orbitron text-2xl mb-5 text-center">Paddock20™ Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:shadow-lg hover:border-gray-700 transition-all">
              <h3 className="text-blue-400 font-orbitron text-xl mb-3">Garage Vault</h3>
              <p className="text-gray-300 mb-4">Manage your vehicle collection, maintenance records, and track maintenance schedules for optimal performance.</p>
              <Link to="/garage-vault" className="inline-flex items-center text-green-500 hover:text-green-400 font-medium">
                View Your Garage
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:shadow-lg hover:border-gray-700 transition-all">
              <h3 className="text-blue-400 font-orbitron text-xl mb-3">Paddock20 Vault</h3>
              <p className="text-gray-300 mb-4">Access exclusive content, automotive resources, and community insights for the serious enthusiast.</p>
              <Link to="/paddock20-vault" className="inline-flex items-center text-green-500 hover:text-green-400 font-medium">
                Enter The Vault
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';
import SimpleWeatherStation from '../components/SimpleWeatherStation';
import { vehicleProfile } from '../data/vehicles';

function Home() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-20 w-auto mx-auto mb-10"
        />

        <div className="text-center mb-12">
          <h1 className="text-blue-400 font-orbitron text-4xl uppercase mb-6">Welcome to ApexVault™</h1>
          <p className="text-white text-xl mb-6">
            Your comprehensive car enthusiast command center
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-300 mb-6">
              ApexVault™ by GoTime Motorsports is the ultimate ecosystem for automotive enthusiasts, combining practical vehicle management with lifestyle elements designed to enhance your driving experience.
            </p>
            <p className="text-gray-300 mb-6">
              Manage your vehicles, track maintenance, plan scenic routes, discover events, organize detailing products, and connect with a community that shares your passion.
            </p>
          </div>
          <Link to="/dashboard" className="inline-block bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-md mt-4">
            Explore Your Dashboard
          </Link>
        </div>

        {/* Weather Station Section */}
        <div className="mb-16">
          <h2 className="text-blue-400 font-orbitron text-2xl mb-6 text-center">Today's Conditions</h2>
          <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
            <SimpleWeatherStation />
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-16">
          <h2 className="text-blue-400 font-orbitron text-2xl mb-8 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🚗</span>
                <h3 className="text-blue-400 font-orbitron text-xl">Garage Vault</h3>
              </div>
              <p className="text-gray-300">Securely store and organize all your vehicle data, from maintenance records to modification plans and part details.</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🧼</span>
                <h3 className="text-blue-400 font-orbitron text-xl">Juice Box™ System</h3>
              </div>
              <p className="text-gray-300">Organize your detailing products, follow proven maintenance routines, and maximize your vehicle's appearance.</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">☁️</span>
                <h3 className="text-blue-400 font-orbitron text-xl">Weather Intelligence</h3>
              </div>
              <p className="text-gray-300">Get real-time weather conditions and forecasts to plan your drives, detailing sessions, and maintenance tasks.</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">📝</span>
                <h3 className="text-blue-400 font-orbitron text-xl">Drive Journal</h3>
              </div>
              <p className="text-gray-300">Capture your driving experiences, track modifications, and preserve memories with our comprehensive journaling system.</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🛣️</span>
                <h3 className="text-blue-400 font-orbitron text-xl">Route Planning</h3>
              </div>
              <p className="text-gray-300">Discover and save scenic routes, track your favorite driving roads, and plan memorable road trips.</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🏁</span>
                <h3 className="text-blue-400 font-orbitron text-xl">Paddock20 Portal</h3>
              </div>
              <p className="text-gray-300">Access premium features, connect with other enthusiasts, and get exclusive content through our membership program.</p>
            </div>
          </div>
        </div>
        
        {/* Featured Section */}
        <div className="mb-16">
          <h2 className="text-blue-400 font-orbitron text-2xl mb-8 text-center">Featured Vehicle</h2>
          <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-blue-400 font-orbitron text-xl mb-4">{vehicleProfile.make} {vehicleProfile.model}</h3>
                <p className="text-gray-300 mb-2"><span className="text-white font-semibold">Specifications:</span> {vehicleProfile.year}, {vehicleProfile.color}</p>
                <p className="text-gray-300 mb-2"><span className="text-white font-semibold">Drivetrain:</span> {vehicleProfile.transmission}</p>
                <p className="text-gray-300 mb-2"><span className="text-white font-semibold">Current Mileage:</span> {vehicleProfile.mileage.toLocaleString()} miles</p>
                <p className="text-gray-300 mb-2"><span className="text-white font-semibold">Tires:</span> {vehicleProfile.tire.brand} {vehicleProfile.tire.model}</p>
                <p className="text-gray-300 mb-4"><span className="text-white font-semibold">Last Gloss Boost:</span> {vehicleProfile.glossTracking.lastGlossBoost}</p>
                <Link to="/garage-vault" className="inline-block bg-green-500 hover:bg-green-400 text-black font-medium px-4 py-2 rounded-md">
                  View in Garage Vault
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 italic">Vehicle Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Access Section */}
        <div className="text-center">
          <h2 className="text-blue-400 font-orbitron text-2xl mb-6">Quick Access</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/garage-vault" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md">
              Garage Vault
            </Link>
            <Link to="/juice-box" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md">
              Juice Box
            </Link>
            <Link to="/drive-journal" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md">
              Drive Journal
            </Link>
            <Link to="/events" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md">
              Events & Meetups
            </Link>
            <Link to="/route-planner" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md">
              Route Planner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

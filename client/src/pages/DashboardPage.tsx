import React from 'react';
import { Link } from 'react-router-dom';
import WeatherStation from '../components/WeatherStation';
import supabase from '../services/supabaseClient';

function DashboardPage() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-10 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-20 w-auto mx-auto mb-10"
        />

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-gray-400 font-orbitron text-3xl uppercase">ApexVault™ Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-400 mb-10 text-center">
          Welcome to your personal car enthusiast command center.
        </p>

        {/* Insert WeatherStation - now has its own seasonal checklist button */}
        <div className="block mb-10">
          <WeatherStation />
        </div>

        {/* Dashboard Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/garage-vault" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-green mb-4">Garage Vault</h2>
            <p className="text-gray-400">Manage your vehicles and track modifications with Supabase database.</p>
          </Link>

          <Link to="/journal" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-green mb-4">Drive Journal</h2>
            <p className="text-gray-400">Log your drives, add mood, miles, photos.</p>
          </Link>

          <Link to="/juicebox" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-green mb-4">Juice Box™</h2>
            <p className="text-gray-400">Explore elite detailing products and guides.</p>
          </Link>

          <Link to="/gloss-growth" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-green mb-4">Gloss Growth</h2>
            <p className="text-gray-400">Track the evolution of your vehicle's finish.</p>
          </Link>

          <Link to="/juicebox-videos" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-green mb-4">Video Library</h2>
            <p className="text-gray-400">Watch tutorials and expert training guides.</p>
          </Link>

          <Link to="/events" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-green mb-4">Events & Meetups</h2>
            <p className="text-gray-400">Find local car events and meetups.</p>
          </Link>

          <Link to="/seasonal-checklist" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-green mb-4">Seasonal Adaptation Checklist</h2>
            <p className="text-gray-400">Update your maintenance based on seasons.</p>
          </Link>

          <Link to="/pre-drive-checklist" className="apex-card hover:bg-gray-900 p-6 rounded-lg">
            <h2 className="apex-header-gray mb-4">Pre-Drive Readiness</h2>
            <p className="text-gray-400">Complete your essential vehicle safety checklist before every drive.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
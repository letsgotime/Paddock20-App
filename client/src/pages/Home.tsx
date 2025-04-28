import React from "react";
import { Link } from "react-router-dom";
import F1MotorsportWeatherStation from '../components/F1MotorsportWeatherStation';

const Home = () => {
  return (
    <div className="bg-black min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <img 
          src="/assets/GTM Logo - Green-White.png" 
          alt="GoTime Motorsports" 
          className="h-20 w-auto mx-auto mb-6"
        />
      </div>
      
      <h1 className="font-orbitron text-blue-400 text-4xl text-center mb-8">Welcome to Bespoke Technology Syndicate™</h1>

      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <p className="font-openSans text-white text-base leading-relaxed mb-6">
          🏁 Drive Sovereignty Starts Here.
        </p>
        <p className="font-openSans text-white text-base leading-relaxed mb-6">
          BTS™ isn't just an app. It's your private command center — built for those who live their drive, not just document it.
        </p>
        <p className="font-openSans text-white text-base leading-relaxed mb-6">
          Every car. Every mile. Every margin. Secured, logged, and leveraged on your terms.
        </p>
        <p className="font-openSans text-white text-base leading-relaxed mb-6">
          From garage discipline to track-day dominance, BTS™ locks your lifestyle into a system built for precision, not noise.
        </p>
        <p className="font-openSans text-white text-base leading-relaxed mb-6">
          Start your day smarter:
        </p>
        <ul className="list-disc ml-8 text-white mb-6">
          <li>✅ Check live drive readiness: weather, temps, and surface data</li>
          <li>✅ Update your tire life, torque specs, and drive logs instantly</li>
          <li>✅ Discover, buy, or sell cars and watches in our encrypted marketplace</li>
          <li>✅ Find every motorsports event near you — and secure your tickets first</li>
          <li>✅ Set private alerts for race results, track meets, auctions, and gloss drops</li>
        </ul>
        <p className="font-openSans text-white text-base leading-relaxed">
          This isn't where you scroll.
          <br />
          This is where you move.
          <br />
          BTS™: Built for Drivers. Designed for Legacy.
        </p>
      </section>

      {/* Weather Station Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">F1 Motorsports Weather</h2>
        <F1MotorsportWeatherStation />
      </section>

      {/* Quick Start Links */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Quick Start Launchpad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/route-planner" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🛣️</span>
            <span className="text-white font-openSans hover:text-green-400">Plan Today's Drive</span>
          </Link>
          <Link to="/garage-vault" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🚗</span>
            <span className="text-white font-openSans hover:text-green-400">Update Your Garage</span>
          </Link>
          <Link to="/marketplace" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🛒</span>
            <span className="text-white font-openSans hover:text-green-400">Browse Cars & Watches</span>
          </Link>
          <Link to="/events" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🏎️</span>
            <span className="text-white font-openSans hover:text-green-400">Find Motorsport Events</span>
          </Link>
          <Link to="/drive-journal" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">📝</span>
            <span className="text-white font-openSans hover:text-green-400">Your Drive Journal</span>
          </Link>
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Core BTS™ Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black p-4 rounded-lg border border-gray-800">
            <h3 className="font-orbitron text-green-500 text-lg mb-2">Garage Vault</h3>
            <p className="text-white text-sm">Your complete vehicle database with maintenance records, modification tracking, and service history.</p>
          </div>
          <div className="bg-black p-4 rounded-lg border border-gray-800">
            <h3 className="font-orbitron text-green-500 text-lg mb-2">Drive Journal</h3>
            <p className="text-white text-sm">Capture every driving experience with detailed logs, road conditions, and performance metrics.</p>
          </div>
          <div className="bg-black p-4 rounded-lg border border-gray-800">
            <h3 className="font-orbitron text-green-500 text-lg mb-2">Juice Box™ System</h3>
            <p className="text-white text-sm">Manage your detailing products, protocols, and gloss maintenance routines in one central hub.</p>
          </div>
          <div className="bg-black p-4 rounded-lg border border-gray-800">
            <h3 className="font-orbitron text-green-500 text-lg mb-2">Paddock20 Portal</h3>
            <p className="text-white text-sm">Premium membership features including dream car manifestation, luxury asset vaulting, and community access.</p>
          </div>
          <div className="bg-black p-4 rounded-lg border border-gray-800">
            <h3 className="font-orbitron text-green-500 text-lg mb-2">Tires & Timepieces</h3>
            <p className="text-white text-sm">Track performance tires and manage your collection of automotive-inspired timepieces and memorabilia.</p>
          </div>
          <div className="bg-black p-4 rounded-lg border border-gray-800">
            <h3 className="font-orbitron text-green-500 text-lg mb-2">Hustle Planner</h3>
            <p className="text-white text-sm">Track your automotive investments, flip metrics, and projected returns with margin calculators.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

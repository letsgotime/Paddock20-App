import React from 'react';
import { Link } from 'wouter';
import { Car, Sparkles, Map, BookOpen, Tag, Users, Calendar, Compass } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Paddock<span className="text-blue-500">20</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Your advanced personal development platform for auto enthusiasts and goal-driven individuals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/garage">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all group cursor-pointer">
              <div className="bg-blue-900/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-900/40 transition-colors">
                <Car className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Garage Vault</h3>
              <p className="text-gray-400">
                Your vehicle command center for maintenance, modifications & documentation
              </p>
            </div>
          </Link>

          <Link href="/drive-journal">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all group cursor-pointer">
              <div className="bg-blue-900/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-900/40 transition-colors">
                <BookOpen className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Drive Journal</h3>
              <p className="text-gray-400">
                Record your driving experiences, insights, and emotions
              </p>
            </div>
          </Link>

          <Link href="/route-planner">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all group cursor-pointer">
              <div className="bg-blue-900/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-900/40 transition-colors">
                <Map className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Route Planner</h3>
              <p className="text-gray-400">
                Discover and plan your perfect drives with weather integration
              </p>
            </div>
          </Link>

          <Link href="/marketplace">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all group cursor-pointer">
              <div className="bg-blue-900/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-900/40 transition-colors">
                <Tag className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Marketplace</h3>
              <p className="text-gray-400">
                Shop for products with the JuiceBox™ system for your vehicle needs
              </p>
            </div>
          </Link>

          <Link href="/events">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all group cursor-pointer">
              <div className="bg-blue-900/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-900/40 transition-colors">
                <Calendar className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Events Calendar</h3>
              <p className="text-gray-400">
                Discover automotive events and meet-ups near you
              </p>
            </div>
          </Link>

          <Link href="/manifestation-station">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/60 transition-all group cursor-pointer">
              <div className="bg-blue-900/20 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-900/40 transition-colors">
                <Compass className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Manifestation Station</h3>
              <p className="text-gray-400">
                Set and track your automotive and life goals with our 7 Elements System
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
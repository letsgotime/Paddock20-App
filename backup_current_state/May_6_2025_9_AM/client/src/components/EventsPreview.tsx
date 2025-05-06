import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';

/**
 * Events Preview Component
 * 
 * Displays a preview of upcoming motorsports events with links to the full events pages
 */
const EventsPreview: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-500 font-orbitron">Upcoming Events</h2>
        <div className="flex gap-2">
          <Link 
            to="/events-page" 
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            All Events <ArrowRight size={14} className="ml-1" />
          </Link>
          <Link 
            to="/motorsports-events" 
            className="text-green-500 hover:text-green-400 text-sm flex items-center"
          >
            Motorsports <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Featured Event */}
        <div className="relative overflow-hidden group rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          <img 
            src="/assets/Stock Photos/F1/redbull-sparks-night.png" 
            alt="Formula 1 Night Race"
            className="w-full h-48 object-cover transition-transform group-hover:scale-105" 
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-sm text-xs font-medium">
                F1
              </span>
              <span className="text-gray-300 text-xs">Featured</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Formula 1 Night Race</h3>
            <div className="flex items-center text-sm text-gray-300">
              <CalendarDays size={14} className="mr-1 text-blue-400" />
              <span className="mr-3">Sep 20, 2025</span>
              <MapPin size={14} className="mr-1 text-blue-400" />
              <span>Singapore</span>
            </div>
          </div>
        </div>
        
        {/* Event List */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2 bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition-colors border-l-2 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold mb-1">Ferrari Racing Days</h4>
                <div className="flex items-center text-xs text-gray-400">
                  <CalendarDays size={12} className="mr-1" />
                  <span className="mr-2">Jul 4, 2025</span>
                  <MapPin size={12} className="mr-1" />
                  <span>Austin, TX</span>
                </div>
              </div>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-sm text-xs">
                Car Club
              </span>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition-colors border-l-2 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold mb-1">Nürburgring Track Day</h4>
                <div className="flex items-center text-xs text-gray-400">
                  <CalendarDays size={12} className="mr-1" />
                  <span className="mr-2">Jun 15, 2025</span>
                  <MapPin size={12} className="mr-1" />
                  <span>Germany</span>
                </div>
              </div>
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-sm text-xs">
                Track Day
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Link 
          to="/motorsports-events" 
          className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-medium hover:from-blue-700 hover:to-green-700 transition-colors"
        >
          Explore Motorsports Events <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default EventsPreview;
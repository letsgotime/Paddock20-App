import React from 'react';
import { Calendar, MapPin, Users, Clock, Tag } from 'lucide-react';

const EventsCalendarPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Events Calendar</h1>
            <p className="text-gray-400 mt-2">
              Discover automotive events and meet-ups near you
            </p>
          </div>
          
          <div>
            <select className="bg-gray-900 border border-gray-800 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Event Types</option>
              <option>Car Shows</option>
              <option>Track Days</option>
              <option>Meets & Cruises</option>
              <option>Auctions</option>
              <option>Paddock20 Exclusives</option>
            </select>
          </div>
        </div>
        
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-3">Events Calendar Coming Soon</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Our automotive events calendar is under development.
            Check back soon for car shows, track days, meets, and exclusive Paddock20 events near you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventsCalendarPage;
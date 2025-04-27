import React from 'react';
import EventsPreview from '../components/EventsPreview';

/**
 * Events Page 
 * 
 * Showcases automotive events, including track days, car shows,
 * meetups, and auctions.
 */
const EventsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-blue-500 mb-4 font-orbitron">Paddock20 Events</h1>
          <p className="text-gray-300 max-w-3xl mb-8">
            Discover exclusive automotive events curated for Paddock20 members. From high-performance track days 
            to exclusive car shows and private auctions - connect with fellow enthusiasts and showcase your prized vehicles.
          </p>
        </div>
      </div>

      {/* Events Preview Section */}
      <EventsPreview />
      
      {/* Calendar Section - Placeholder for future implementation */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-blue-500 mb-6 font-orbitron">Event Calendar</h2>
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-8 shadow-lg">
          <div className="text-center py-16">
            <h3 className="text-2xl mb-4">Full Calendar Coming Soon</h3>
            <p className="text-gray-300">
              Our interactive event calendar is under development. Soon you'll be able to filter events 
              by location, type, and date range - and sync directly with your personal calendar.
            </p>
          </div>
        </div>
      </div>
      
      {/* Event Submission Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-10">
              <h2 className="text-3xl font-bold text-green-500 mb-4 font-orbitron">Host Your Own Event</h2>
              <p className="text-gray-300 mb-6">
                Are you a Paddock20 member interested in hosting an event? Whether it's a casual cars &amp; coffee, a 
                charity drive, or a track day - we can help promote your event to our passionate community.
              </p>
              <button className="apex-button">Submit Event Proposal</button>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Event Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Promotion to verified Paddock20 members</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Digital event management tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Optional photography and videography services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3">✓</span>
                    <span>Exclusive venue partnership opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
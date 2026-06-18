import React, { useState } from 'react';
import EventsPreview from '../components/EventsPreview';
import EventsTabs from '../components/EventsTabs';
import TrackConditionsTelemetry from '../components/TrackConditionsTelemetry';
import P20EventsCalendar from '../components/P20EventsCalendar';
import { CalendarDays, MapPin, Clock, Trophy, Users, Car } from 'lucide-react';

interface TrackEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  trackName: string;
  eventType: 'F1' | 'Track Day' | 'Racing School' | 'Car Club' | 'Exhibition';
  description: string;
  featured?: boolean;
  trackLength?: string;
  turns?: number;
  entryFee?: string;
  availableSpots?: number;
}

// Sample motorsports events data - same as in MotorsportsEventsPage
const motorsportsEvents: TrackEvent[] = [
  {
    id: 1,
    title: "Formula 1 Monaco Grand Prix",
    date: "May 28, 2025",
    location: "Monte Carlo, Monaco",
    imageUrl: "/assets/images/F1/ferrari-f1-pitstop-aerial.webp",
    trackName: "Circuit de Monaco",
    eventType: "F1",
    description: "Experience the glamour and prestige of the Monaco Grand Prix, widely considered to be one of the most important and prestigious automobile races in the world.",
    featured: true,
    trackLength: "3.337 km",
    turns: 19,
    entryFee: "From $500",
    availableSpots: 15
  },
  {
    id: 2,
    title: "Nürburgring Track Day",
    date: "June 15, 2025",
    location: "Nürburg, Germany",
    imageUrl: "/assets/images/F1/redbull-honda-track.webp",
    trackName: "Nürburgring Nordschleife",
    eventType: "Track Day",
    description: "Test your skills on the legendary Nordschleife, known as 'The Green Hell', one of the most challenging race tracks in the world.",
    trackLength: "20.8 km",
    turns: 73,
    entryFee: "$895",
    availableSpots: 8
  },
  {
    id: 3,
    title: "Ferrari Racing Days",
    date: "July 4, 2025",
    location: "Austin, Texas",
    imageUrl: "/assets/images/F1/ferrari-laferrari-mountains.webp",
    trackName: "Circuit of the Americas",
    eventType: "Car Club",
    description: "Ferrari owners gather for an exclusive track day experience at the home of the US Grand Prix.",
    trackLength: "5.513 km",
    turns: 20,
    entryFee: "$1,200",
    availableSpots: 25
  },
  {
    id: 4,
    title: "Formula 1 Night Race Experience",
    date: "September 20, 2025",
    location: "Singapore",
    imageUrl: "/assets/Stock Photos/F1/redbull-sparks-night.png",
    trackName: "Marina Bay Street Circuit",
    eventType: "F1",
    description: "Witness the spectacular F1 night race through the illuminated streets of Singapore, a truly unique motorsport experience.",
    featured: true,
    trackLength: "5.063 km",
    turns: 23,
    entryFee: "From $450",
    availableSpots: 12
  }
];

/**
 * Events Page 
 * 
 * Showcases automotive events, including track days, car shows,
 * meetups, and auctions.
 */
const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('community');
  
  // Filter motorsports events for featured and non-featured
  const featuredEvents = motorsportsEvents.filter(event => event.featured);
  const otherEvents = motorsportsEvents.filter(event => !event.featured);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-blue-500 mb-4 font-orbitron">P20 Events & Meetups</h1>
          <p className="text-gray-300 max-w-3xl mb-8">
            Discover exclusive automotive events curated for Paddock20 members. From high-performance track days 
            to exclusive car shows and private auctions - connect with fellow enthusiasts and showcase your prized vehicles.
          </p>
          
          {/* Tabs Navigation */}
          <EventsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Community Events Tab Content */}
      {activeTab === 'community' && (
        <div className="container mx-auto px-4">
          {/* Events Preview Section */}
          <EventsPreview />
          
          {/* P20 60-Week Event Calendar */}
          <div className="py-12">
            <h2 className="text-3xl font-bold text-blue-500 mb-6 font-orbitron">Event Calendar</h2>
            <P20EventsCalendar />
          </div>
          
          {/* Event Submission Section */}
          <div className="bg-gradient-to-b from-gray-900 to-black py-12">
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
      )}

      {/* Motorsports Events Tab Content */}
      {activeTab === 'motorsports' && (
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="lg:w-2/3">
              {/* Featured Events */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-blue-500 mb-6 font-orbitron">Featured Events</h2>
                <div className="space-y-8">
                  {featuredEvents.map(event => (
                    <div key={event.id} className="bg-gradient-to-r from-gray-900 to-black rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-green-500 transition-all">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-64 object-cover" 
                          />
                        </div>
                        <div className="md:w-1/2 p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded text-sm font-medium">
                              {event.eventType}
                            </span>
                            <span className="text-sm text-gray-400">
                              {event.availableSpots} spots left
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-300">
                              <CalendarDays size={16} className="mr-2 text-blue-400" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                              <MapPin size={16} className="mr-2 text-blue-400" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                              <Trophy size={16} className="mr-2 text-blue-400" />
                              <span>{event.trackName}</span>
                            </div>
                          </div>
                          <p className="text-gray-400 mb-4">{event.description}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-blue-500 font-bold">{event.entryFee}</span>
                            <button className="apex-button">Register</button>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-900 px-6 py-3 flex justify-between">
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock size={14} className="mr-1" />
                          <span>Track Length: {event.trackLength}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Car size={14} className="mr-1" />
                          <span>Turns: {event.turns}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* All Other Events */}
              <section>
                <h2 className="text-3xl font-bold text-blue-500 mb-6 font-orbitron">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherEvents.map(event => (
                    <div key={event.id} className="bg-gradient-to-r from-gray-900 to-black rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-blue-500 transition-all">
                      <div className="relative">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-48 object-cover" 
                        />
                        <div className="absolute top-0 right-0 bg-blue-500/90 text-white px-3 py-1 text-sm m-2 rounded">
                          {event.eventType}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-gray-300 text-sm">
                            <CalendarDays size={14} className="mr-2 text-blue-400" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-300 text-sm">
                            <MapPin size={14} className="mr-2 text-blue-400" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-blue-500 font-bold">{event.entryFee}</span>
                          <button className="apex-button-small">Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              {/* Track Conditions */}
              <TrackConditionsTelemetry />

              {/* Event Categories */}
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-5 shadow-lg border border-gray-800">
                <h3 className="text-xl font-bold text-blue-500 mb-4">Event Types</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-800 rounded">
                    <div className="flex items-center">
                      <Trophy size={18} className="mr-2 text-green-500" />
                      <span>Formula 1</span>
                    </div>
                    <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">2</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-800 rounded">
                    <div className="flex items-center">
                      <Car size={18} className="mr-2 text-blue-500" />
                      <span>Track Days</span>
                    </div>
                    <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs">1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-800 rounded">
                    <div className="flex items-center">
                      <Users size={18} className="mr-2 text-purple-500" />
                      <span>Car Clubs</span>
                    </div>
                    <span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded text-xs">1</span>
                  </div>
                </div>
              </div>

              {/* Member Benefits */}
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-5 shadow-lg border border-gray-800">
                <h3 className="text-xl font-bold text-green-500 mb-4">Paddock20 Member Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">Early access to ticket sales</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">Exclusive paddock access at select events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">Discounted track day registration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-300">Pit lane tours and driver meet-and-greets</span>
                  </li>
                </ul>
                <button className="apex-button-small w-full mt-4">Join The Grid</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
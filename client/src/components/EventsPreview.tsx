import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  category: 'track' | 'show' | 'meetup' | 'auction';
  featured?: boolean;
}

// Sample events data - this would typically come from an API
const upcomingEvents: Event[] = [
  {
    id: 1,
    title: "F1 Monaco Grand Prix",
    date: "May 28, 2025",
    location: "Monaco",
    imageUrl: "@assets/Stock Photos/F1/redbull-honda-track.png",
    description: "Experience the legendary Monaco Grand Prix, the most prestigious race on the F1 calendar.",
    category: "track",
    featured: true
  },
  {
    id: 2,
    title: "Corvette Club Track Day",
    date: "June 12, 2025",
    location: "Circuit of the Americas, Austin",
    imageUrl: "@assets/Stock Photos/Supercars/corvette-desert.png",
    description: "Join fellow Corvette owners for an exclusive track day experience at COTA.",
    category: "track"
  },
  {
    id: 3,
    title: "Supercar Summer Showcase",
    date: "July 4, 2025",
    location: "Downtown Chicago",
    imageUrl: "@assets/Stock Photos/Events/corvette-street-event.png",
    description: "Annual downtown supercar showcase featuring the latest models and custom builds.",
    category: "show",
    featured: true
  },
  {
    id: 4,
    title: "Ferrari Owners Club Meet",
    date: "August 15, 2025",
    location: "Lake Como, Italy",
    imageUrl: "@assets/Stock Photos/F1/ferrari-laferrari-mountains.png",
    description: "Exclusive gathering of Ferrari owners and enthusiasts in scenic Lake Como.",
    category: "meetup"
  }
];

/**
 * EventsPreview Component
 * 
 * A preview component that displays upcoming automotive events
 * with imagery and date/location information
 */
const EventsPreview: React.FC = () => {
  const featuredEvent = upcomingEvents.find(event => event.featured) || upcomingEvents[0];
  const otherEvents = upcomingEvents.filter(event => event.id !== featuredEvent.id).slice(0, 3);

  return (
    <div className="w-full bg-black text-white pb-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-blue-500 mb-6 font-orbitron">Upcoming Events</h2>
        
        {/* Featured Event */}
        <div className="mb-10 bg-gradient-to-r from-gray-900 to-black rounded-lg overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 relative">
              <img 
                src={featuredEvent.imageUrl} 
                alt={featuredEvent.title}
                className="w-full h-64 md:h-96 object-cover" 
              />
              <div className="absolute top-0 left-0 bg-green-500 text-black px-3 py-1 m-4 font-bold">
                FEATURED
              </div>
            </div>
            <div className="md:w-1/3 p-6 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2">{featuredEvent.title}</h3>
              <div className="flex items-center text-blue-400 mb-2">
                <Calendar size={16} className="mr-2" />
                <span>{featuredEvent.date}</span>
              </div>
              <div className="flex items-center text-blue-400 mb-4">
                <MapPin size={16} className="mr-2" />
                <span>{featuredEvent.location}</span>
              </div>
              <p className="text-gray-300 mb-6">{featuredEvent.description}</p>
              <button className="apex-button self-start">View Details</button>
            </div>
          </div>
        </div>
        
        {/* Other Events */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherEvents.map(event => (
            <div key={event.id} className="bg-gradient-to-r from-gray-900 to-black rounded-lg overflow-hidden shadow-lg hover:shadow-green-500/10 transition-all">
              <div className="relative">
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-48 object-cover" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-24"></div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <div className="flex items-center text-blue-400 mb-1">
                  <Calendar size={14} className="mr-2" />
                  <span className="text-sm">{event.date}</span>
                </div>
                <div className="flex items-center text-blue-400 mb-3">
                  <MapPin size={14} className="mr-2" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <button className="apex-button-small w-full mt-2">Details</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="apex-button-outline">View All Events</button>
        </div>
      </div>
    </div>
  );
};

export default EventsPreview;
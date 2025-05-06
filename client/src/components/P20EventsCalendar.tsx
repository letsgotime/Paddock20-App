import React, { useState } from 'react';
import { CalendarDays, MapPin, Clock, Calendar, Trophy, Users, Car, Filter } from 'lucide-react';

// Define types for our events
interface P20Event {
  week: number;
  date: string;
  city: string;
  eventType: string;
  venue: string;
  theme: string;
  charity: string;
  estimatedCost: string;
  colorCode: string;
}

// Sample data from the PDF
const eventsData: P20Event[] = [
  {
    week: 1,
    date: "Mar 1, 2025",
    city: "Scottsdale, AZ",
    eventType: "Detail Day",
    venue: "Shine Haus™ Bay",
    theme: "Gloss Season Launch",
    charity: "PCH Foundation",
    estimatedCost: "$8,500",
    colorCode: "bg-amber-500"
  },
  {
    week: 2,
    date: "Mar 8, 2025",
    city: "Scottsdale, AZ",
    eventType: "Tires & Timepieces™",
    venue: "Experience Haus Rooftop",
    theme: "Spring Opener",
    charity: "Phoenix Children's",
    estimatedCost: "$12,000",
    colorCode: "bg-purple-500"
  },
  {
    week: 3,
    date: "Mar 15, 2025",
    city: "Los Angeles, CA",
    eventType: "Rally Drive",
    venue: "Malibu Loop",
    theme: "West Coast Warm-Up",
    charity: "Inner-City Arts",
    estimatedCost: "$15,000",
    colorCode: "bg-green-500"
  },
  {
    week: 4,
    date: "Mar 22, 2025",
    city: "Los Angeles, CA",
    eventType: "Timepiece Meetup",
    venue: "Hublot Beverly Hills",
    theme: "Flip Fundamentals",
    charity: "BBBS LA",
    estimatedCost: "$6,000",
    colorCode: "bg-blue-500"
  },
  {
    week: 5,
    date: "Mar 29, 2025",
    city: "Miami, FL",
    eventType: "Track Day",
    venue: "Homestead-Miami GP",
    theme: "Flex Control",
    charity: "BBBS Miami",
    estimatedCost: "$20,000",
    colorCode: "bg-red-500"
  },
  {
    week: 6,
    date: "Apr 5, 2025",
    city: "Miami, FL",
    eventType: "Detail Day",
    venue: "Wynwood Detail Lounge",
    theme: "Pre-Summer Shine",
    charity: "The Just One Project",
    estimatedCost: "$8,000",
    colorCode: "bg-amber-500"
  },
  {
    week: 7,
    date: "Apr 12, 2025",
    city: "Dallas, TX",
    eventType: "Tires & Timepieces™",
    venue: "Deep Ellum Show Lot",
    theme: "Texas Torque",
    charity: "CIS North Texas",
    estimatedCost: "$11,500",
    colorCode: "bg-purple-500"
  },
  {
    week: 8,
    date: "Apr 19, 2025",
    city: "Dallas, TX",
    eventType: "Timepiece Meetup",
    venue: "Omega Boutique",
    theme: "Grail Math Live",
    charity: "CIS North Texas",
    estimatedCost: "$6,500",
    colorCode: "bg-blue-500"
  },
  {
    week: 9,
    date: "Apr 26, 2025",
    city: "Charlotte, NC",
    eventType: "Rally Drive",
    venue: "Blue Ridge Loop",
    theme: "Appalachian Flex",
    charity: "Dream On 3",
    estimatedCost: "$14,000",
    colorCode: "bg-green-500"
  },
  {
    week: 10,
    date: "May 3, 2025",
    city: "Atlanta, GA",
    eventType: "Track Day",
    venue: "Atlanta Motorsports Park",
    theme: "Paddock Precision",
    charity: "Next Gen ATL",
    estimatedCost: "$20,000",
    colorCode: "bg-red-500"
  },
  {
    week: 11,
    date: "May 10, 2025",
    city: "Charlotte, NC",
    eventType: "Timepiece Meetup",
    venue: "Collectors Lounge ATL",
    theme: "Time Over Torque",
    charity: "Dream On 3",
    estimatedCost: "$6,000",
    colorCode: "bg-blue-500"
  },
  {
    week: 12,
    date: "May 17, 2025",
    city: "Nashville, TN",
    eventType: "Detail Day",
    venue: "Music City Mod Garage",
    theme: "Rally Ready Gloss",
    charity: "Drive On 3",
    estimatedCost: "$8,000",
    colorCode: "bg-amber-500"
  },
  {
    week: 13,
    date: "May 24, 2025",
    city: "Dallas, TX",
    eventType: "Haute Auction",
    venue: "Private Estate | Park Cities",
    theme: "Modern Grails",
    charity: "CIS North Texas",
    estimatedCost: "$18,000",
    colorCode: "bg-indigo-500"
  },
  {
    week: 14,
    date: "May 31, 2025",
    city: "Miami, FL",
    eventType: "Timepiece Meetup",
    venue: "TAG Lounge",
    theme: "Grail Logic | Collector Panel",
    charity: "BBBS Miami",
    estimatedCost: "$6,500",
    colorCode: "bg-blue-500"
  },
  {
    week: 15,
    date: "Jun 7, 2025",
    city: "Philadelphia, PA",
    eventType: "Rally Drive",
    venue: "Poconos Loop",
    theme: "Summer Sprint",
    charity: "Year Up Philly",
    estimatedCost: "$14,000",
    colorCode: "bg-green-500"
  },
  {
    week: 16,
    date: "Jun 14, 2025",
    city: "Chicago, IL",
    eventType: "Tires & Timepieces™",
    venue: "Navy Pier Auto Deck",
    theme: "Midwest Moves",
    charity: "MBMHMC",
    estimatedCost: "$12,000",
    colorCode: "bg-purple-500"
  },
  {
    week: 17,
    date: "Jun 21, 2025",
    city: "Chicago, IL",
    eventType: "Track Day",
    venue: "Autobahn Country Club",
    theme: "Great Lakes Apex",
    charity: "MBMHMC",
    estimatedCost: "$20,000",
    colorCode: "bg-red-500"
  },
  {
    week: 18,
    date: "Jun 28, 2025",
    city: "All F1 Cities",
    eventType: "F1 Mega Weekend",
    venue: "National Theater Circuit",
    theme: "Fast Lines & Fine Timepieces",
    charity: "Redline x Local Orgs",
    estimatedCost: "$25,000",
    colorCode: "bg-pink-500"
  },
  // Add additional weeks as needed
];

const P20EventsCalendar: React.FC = () => {
  // State for filtering
  const [filteredType, setFilteredType] = useState<string | null>(null);
  
  // Get unique event types for filter
  const eventTypes = [...new Set(eventsData.map(event => event.eventType))];
  
  // Filter events based on selected type
  const displayEvents = filteredType 
    ? eventsData.filter(event => event.eventType === filteredType) 
    : eventsData;
  
  return (
    <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-6 shadow-lg mb-8 border border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-500 mb-4 font-orbitron flex items-center">
          <CalendarDays className="mr-3 h-7 w-7" />
          P20 60-Week Event Plan
        </h2>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-blue-400" />
          <select 
            className="bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
            value={filteredType || ''}
            onChange={(e) => setFilteredType(e.target.value || null)}
          >
            <option value="">All Event Types</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Event Type Legend */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
            <span className="text-gray-300">Detail Day</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-gray-300">Tires & Timepieces™</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-300">Rally Drive</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-gray-300">Timepiece Meetup</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-gray-300">Track Day</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-gray-300">Haute Auction</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-pink-500 mr-2"></div>
            <span className="text-gray-300">F1 Mega Weekend</span>
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayEvents.map((event) => (
          <div 
            key={event.week} 
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-200"
          >
            <div className={`${event.colorCode} p-3 text-white flex justify-between items-center`}>
              <span className="font-bold">Week {event.week}</span>
              <span className="text-sm">{event.date}</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2">{event.eventType}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <MapPin size={14} className="mr-2 text-blue-400" />
                  <span>{event.city}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Calendar size={14} className="mr-2 text-blue-400" />
                  <span>{event.theme}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Trophy size={14} className="mr-2 text-green-400" />
                  <span>{event.charity}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock size={14} className="mr-2 text-blue-400" />
                  <span>{event.estimatedCost}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default P20EventsCalendar;
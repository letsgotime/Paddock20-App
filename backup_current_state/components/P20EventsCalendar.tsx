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

// Official data from the PDF
const eventsData: P20Event[] = [
  {
    week: 1,
    date: "Mar 1, 2025",
    city: "Scottsdale, AZ",
    eventType: "Detail Day #1",
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
  // Weeks 19-60
  {
    week: 19,
    date: "Jul 5, 2025",
    city: "New York, NY",
    eventType: "Haute Auction",
    venue: "Sotheby's NYC",
    theme: "Summer Successions",
    charity: "Robin Hood Foundation",
    estimatedCost: "$18,500",
    colorCode: "bg-indigo-500"
  },
  {
    week: 20,
    date: "Jul 12, 2025",
    city: "Hamptons, NY",
    eventType: "Detail Day",
    venue: "Bridgehampton Estate",
    theme: "Summer Social Polish",
    charity: "Southampton Animal Shelter",
    estimatedCost: "$9,000",
    colorCode: "bg-amber-500"
  },
  {
    week: 21,
    date: "Jul 19, 2025",
    city: "Boston, MA",
    eventType: "Rally Drive",
    venue: "Cape Cod Circuit",
    theme: "New England Nautical",
    charity: "Boston Children's Hospital",
    estimatedCost: "$14,500",
    colorCode: "bg-green-500"
  },
  {
    week: 22,
    date: "Jul 26, 2025",
    city: "Montreal, Canada",
    eventType: "Tires & Timepieces™",
    venue: "Circuit Gilles Villeneuve",
    theme: "Northern Exposure",
    charity: "Fondation CHU Sainte-Justine",
    estimatedCost: "$12,500",
    colorCode: "bg-purple-500"
  },
  {
    week: 23,
    date: "Aug 2, 2025",
    city: "Seattle, WA",
    eventType: "Track Day",
    venue: "Pacific Raceways",
    theme: "Northwest Flex",
    charity: "Seattle Children's",
    estimatedCost: "$21,000",
    colorCode: "bg-red-500"
  },
  {
    week: 24,
    date: "Aug 9, 2025",
    city: "Portland, OR",
    eventType: "Timepiece Meetup",
    venue: "Tanner Goods",
    theme: "Pacific Precision",
    charity: "OHSU Doernbecher",
    estimatedCost: "$7,000",
    colorCode: "bg-blue-500"
  },
  {
    week: 25,
    date: "Aug 16, 2025",
    city: "San Francisco, CA",
    eventType: "Detail Day",
    venue: "Fort Mason Center",
    theme: "Bay Area Brilliance",
    charity: "SF-Marin Food Bank",
    estimatedCost: "$9,500",
    colorCode: "bg-amber-500"
  },
  {
    week: 26,
    date: "Aug 23, 2025",
    city: "Monterey, CA",
    eventType: "Haute Auction",
    venue: "Pebble Beach",
    theme: "Concours Collection",
    charity: "Monterey Bay Aquarium",
    estimatedCost: "$22,000",
    colorCode: "bg-indigo-500"
  },
  {
    week: 27,
    date: "Aug 30, 2025",
    city: "Las Vegas, NV",
    eventType: "Track Day",
    venue: "Las Vegas Motor Speedway",
    theme: "Desert Dynamics",
    charity: "Three Square",
    estimatedCost: "$19,500",
    colorCode: "bg-red-500"
  },
  {
    week: 28,
    date: "Sep 6, 2025",
    city: "Phoenix, AZ",
    eventType: "Rally Drive",
    venue: "Sonoran Desert Loop",
    theme: "Desert Dawn",
    charity: "Phoenix Children's",
    estimatedCost: "$15,000",
    colorCode: "bg-green-500"
  },
  {
    week: 29,
    date: "Sep 13, 2025",
    city: "Denver, CO",
    eventType: "Tires & Timepieces™",
    venue: "Mile High Station",
    theme: "Mountain Momentum",
    charity: "Children's Hospital Colorado",
    estimatedCost: "$13,000",
    colorCode: "bg-purple-500"
  },
  {
    week: 30,
    date: "Sep 20, 2025",
    city: "Singapore",
    eventType: "F1 Mega Weekend",
    venue: "Marina Bay Street Circuit",
    theme: "Asian Night Circuit",
    charity: "Singapore Children's Society",
    estimatedCost: "$27,000",
    colorCode: "bg-pink-500"
  },
  {
    week: 31,
    date: "Sep 27, 2025",
    city: "Austin, TX",
    eventType: "Timepiece Meetup",
    venue: "South Congress",
    theme: "Time in Texas",
    charity: "Dell Children's",
    estimatedCost: "$7,500",
    colorCode: "bg-blue-500"
  },
  {
    week: 32,
    date: "Oct 4, 2025",
    city: "San Antonio, TX",
    eventType: "Detail Day",
    venue: "Pearl District",
    theme: "Alamo Shine",
    charity: "San Antonio Food Bank",
    estimatedCost: "$8,500",
    colorCode: "bg-amber-500"
  },
  {
    week: 33,
    date: "Oct 11, 2025",
    city: "Houston, TX",
    eventType: "Rally Drive",
    venue: "Gulf Coast Run",
    theme: "Space City Sprint",
    charity: "Houston Food Bank",
    estimatedCost: "$14,000",
    colorCode: "bg-green-500"
  },
  {
    week: 34,
    date: "Oct 18, 2025",
    city: "New Orleans, LA",
    eventType: "Tires & Timepieces™",
    venue: "French Quarter",
    theme: "Bayou Bezel",
    charity: "Second Harvest",
    estimatedCost: "$12,000",
    colorCode: "bg-purple-500"
  },
  {
    week: 35,
    date: "Oct 25, 2025",
    city: "Mexico City, Mexico",
    eventType: "F1 Mega Weekend",
    venue: "Autódromo Hermanos Rodríguez",
    theme: "Latin Luxury",
    charity: "UNICEF Mexico",
    estimatedCost: "$26,000",
    colorCode: "bg-pink-500"
  },
  {
    week: 36,
    date: "Nov 1, 2025",
    city: "Miami, FL",
    eventType: "Track Day",
    venue: "Homestead-Miami Speedway",
    theme: "Winter Warm-Up",
    charity: "Miami Foundation",
    estimatedCost: "$21,000",
    colorCode: "bg-red-500"
  },
  {
    week: 37,
    date: "Nov 8, 2025",
    city: "Palm Beach, FL",
    eventType: "Haute Auction",
    venue: "The Breakers",
    theme: "Palm Beach Prestige",
    charity: "Place of Hope",
    estimatedCost: "$19,000",
    colorCode: "bg-indigo-500"
  },
  {
    week: 38,
    date: "Nov 15, 2025",
    city: "Atlanta, GA",
    eventType: "Timepiece Meetup",
    venue: "Buckhead",
    theme: "Southern Chronometry",
    charity: "Atlanta Community Food Bank",
    estimatedCost: "$7,000",
    colorCode: "bg-blue-500"
  },
  {
    week: 39,
    date: "Nov 22, 2025",
    city: "Charlotte, NC",
    eventType: "Detail Day",
    venue: "Queen City Detail Lab",
    theme: "Winter Preparation",
    charity: "Second Harvest Metrolina",
    estimatedCost: "$9,000",
    colorCode: "bg-amber-500"
  },
  {
    week: 40,
    date: "Nov 29, 2025",
    city: "Washington, DC",
    eventType: "Rally Drive",
    venue: "Shenandoah Valley",
    theme: "Capital Cruise",
    charity: "DC Central Kitchen",
    estimatedCost: "$15,500",
    colorCode: "bg-green-500"
  },
  {
    week: 41,
    date: "Dec 6, 2025",
    city: "Philadelphia, PA",
    eventType: "Tires & Timepieces™",
    venue: "Barnes Foundation",
    theme: "Liberty Luxury",
    charity: "Philabundance",
    estimatedCost: "$13,500",
    colorCode: "bg-purple-500"
  },
  {
    week: 42,
    date: "Dec 13, 2025",
    city: "New York, NY",
    eventType: "Haute Auction",
    venue: "Christie's NYC",
    theme: "Winter Wonders",
    charity: "City Harvest",
    estimatedCost: "$20,000",
    colorCode: "bg-indigo-500"
  },
  {
    week: 43,
    date: "Dec 20, 2025",
    city: "Aspen, CO",
    eventType: "Rally Drive",
    venue: "Mountain Circuit",
    theme: "Snow Summit",
    charity: "Aspen Community Foundation",
    estimatedCost: "$16,500",
    colorCode: "bg-green-500"
  },
  {
    week: 44,
    date: "Dec 27, 2025",
    city: "Las Vegas, NV",
    eventType: "Timepiece Meetup",
    venue: "Wynn Las Vegas",
    theme: "Year End Time",
    charity: "Three Square",
    estimatedCost: "$8,500",
    colorCode: "bg-blue-500"
  },
  {
    week: 45,
    date: "Jan 3, 2026",
    city: "Los Angeles, CA",
    eventType: "Track Day",
    venue: "Willow Springs",
    theme: "New Year Speed",
    charity: "LA Regional Food Bank",
    estimatedCost: "$22,000",
    colorCode: "bg-red-500"
  },
  {
    week: 46,
    date: "Jan 10, 2026",
    city: "San Diego, CA",
    eventType: "Detail Day",
    venue: "Gaslamp Quarter",
    theme: "New Year Shine",
    charity: "Feeding San Diego",
    estimatedCost: "$9,500",
    colorCode: "bg-amber-500"
  },
  {
    week: 47,
    date: "Jan 17, 2026",
    city: "Scottsdale, AZ",
    eventType: "Haute Auction",
    venue: "Barrett-Jackson",
    theme: "Desert Collection",
    charity: "Phoenix Children's",
    estimatedCost: "$21,500",
    colorCode: "bg-indigo-500"
  },
  {
    week: 48,
    date: "Jan 24, 2026",
    city: "Park City, UT",
    eventType: "Tires & Timepieces™",
    venue: "St. Regis Deer Valley",
    theme: "Mountain Time",
    charity: "Utah Food Bank",
    estimatedCost: "$14,000",
    colorCode: "bg-purple-500"
  },
  {
    week: 49,
    date: "Jan 31, 2026",
    city: "Detroit, MI",
    eventType: "Timepiece Meetup",
    venue: "The Guardian Building",
    theme: "Motor City Time",
    charity: "Forgotten Harvest",
    estimatedCost: "$7,500",
    colorCode: "bg-blue-500"
  },
  {
    week: 50,
    date: "Feb 7, 2026",
    city: "Chicago, IL",
    eventType: "Rally Drive",
    venue: "Illinois River Road",
    theme: "Winter Warriors",
    charity: "Greater Chicago Food Depository",
    estimatedCost: "$15,000",
    colorCode: "bg-green-500"
  },
  {
    week: 51,
    date: "Feb 14, 2026",
    city: "Minneapolis, MN",
    eventType: "Detail Day",
    venue: "North Loop",
    theme: "Frozen Finish",
    charity: "Second Harvest Heartland",
    estimatedCost: "$10,000",
    colorCode: "bg-amber-500"
  },
  {
    week: 52,
    date: "Feb 21, 2026",
    city: "New York, NY",
    eventType: "Track Day",
    venue: "Monticello Motor Club",
    theme: "Winter Velocity",
    charity: "Food Bank For New York City",
    estimatedCost: "$23,000",
    colorCode: "bg-red-500"
  },
  {
    week: 53,
    date: "Feb 28, 2026",
    city: "Boston, MA",
    eventType: "Tires & Timepieces™",
    venue: "Newbury Street",
    theme: "Northeast Timekeeping",
    charity: "The Greater Boston Food Bank",
    estimatedCost: "$13,500",
    colorCode: "bg-purple-500"
  },
  {
    week: 54,
    date: "Mar 7, 2026",
    city: "Miami, FL",
    eventType: "F1 Mega Weekend",
    venue: "Miami International Autodrome",
    theme: "Spring Circuit",
    charity: "Feeding South Florida",
    estimatedCost: "$28,000",
    colorCode: "bg-pink-500"
  },
  {
    week: 55,
    date: "Mar 14, 2026",
    city: "Tampa, FL",
    eventType: "Timepiece Meetup",
    venue: "Hyde Park",
    theme: "Gulf Time",
    charity: "Feeding Tampa Bay",
    estimatedCost: "$8,000",
    colorCode: "bg-blue-500"
  },
  {
    week: 56,
    date: "Mar 21, 2026",
    city: "Charleston, SC",
    eventType: "Detail Day",
    venue: "Historic District",
    theme: "Southern Shine",
    charity: "Lowcountry Food Bank",
    estimatedCost: "$9,000",
    colorCode: "bg-amber-500"
  },
  {
    week: 57,
    date: "Mar 28, 2026",
    city: "Savannah, GA",
    eventType: "Rally Drive",
    venue: "Coastal Highway",
    theme: "Coastal Cruise",
    charity: "America's Second Harvest of Coastal Georgia",
    estimatedCost: "$14,500",
    colorCode: "bg-green-500"
  },
  {
    week: 58,
    date: "Apr 4, 2026",
    city: "Austin, TX",
    eventType: "Haute Auction",
    venue: "Circuit of the Americas",
    theme: "Texas Treasures",
    charity: "Central Texas Food Bank",
    estimatedCost: "$19,000",
    colorCode: "bg-indigo-500"
  },
  {
    week: 59,
    date: "Apr 11, 2026",
    city: "Dallas, TX",
    eventType: "Track Day",
    venue: "Texas Motor Speedway",
    theme: "Lone Star Speed",
    charity: "North Texas Food Bank",
    estimatedCost: "$21,000",
    colorCode: "bg-red-500"
  },
  {
    week: 60,
    date: "Apr 18, 2026",
    city: "Houston, TX",
    eventType: "Tires & Timepieces™",
    venue: "Post Houston",
    theme: "Full Circuit Season Finale",
    charity: "Houston Food Bank",
    estimatedCost: "$15,000",
    colorCode: "bg-purple-500"
  }
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
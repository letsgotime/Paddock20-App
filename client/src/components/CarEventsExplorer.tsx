// client/src/components/CarEventsExplorer.tsx
import React, { useState, useEffect } from 'react';
import { findEventsAlongRoute, StrutEvent } from '@/services/strutAPI';
import { Star, Calendar, Clock, MapPin, Users, DollarSign, Link, Info, ChevronRight, ChevronDown } from 'lucide-react';

interface CarEventsExplorerProps {
  waypoints: Array<{lat: number, lng: number}>;
  radius?: number;
  showTitle?: boolean;
  maxEvents?: number;
  onSelectEvent?: (event: StrutEvent) => void;
}

const CarEventsExplorer: React.FC<CarEventsExplorerProps> = ({
  waypoints,
  radius = 20,
  showTitle = true,
  maxEvents = 5,
  onSelectEvent
}) => {
  const [events, setEvents] = useState<StrutEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    if (waypoints.length === 0) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current date for filtering
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        
        // Format dates for API
        const startDate = today.toISOString().split('T')[0];
        const endDate = nextMonth.toISOString().split('T')[0];
        
        const result = await findEventsAlongRoute(
          waypoints,
          radius,
          [], // No category filtering initially
          startDate,
          endDate
        );
        
        setEvents(result);
      } catch (err) {
        console.error('Error fetching car events:', err);
        setError('Failed to load car events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [waypoints, radius]);
  
  // Function to filter events
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.eventType === filter || event.categories.includes(filter);
  }).slice(0, maxEvents);
  
  // Get unique event types and categories for filtering
  const eventTypes = Array.from(new Set(events.map(event => event.eventType)));
  const categories = Array.from(new Set(events.flatMap(event => event.categories)));
  
  // Format date string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  if (loading && events.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg w-full">
        {showTitle && <h2 className="text-blue-400 font-orbitron text-xl mb-3">Car Events Along Route</h2>}
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }
  
  if (error && events.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg w-full">
        {showTitle && <h2 className="text-blue-400 font-orbitron text-xl mb-3">Car Events Along Route</h2>}
        <div className="text-red-400 text-center py-4">{error}</div>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg w-full">
        {showTitle && <h2 className="text-blue-400 font-orbitron text-xl mb-3">Car Events Along Route</h2>}
        <div className="text-gray-400 text-center py-4">No car events found along this route. Try increasing the search radius.</div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg w-full shadow-lg border border-gray-700">
      {showTitle && (
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-blue-400 font-orbitron text-xl flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Car Events Along Route
          </h2>
          <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full">
            Via Strut API
          </span>
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-green-500 text-black font-medium' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Events
          </button>
          
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap capitalize ${
                filter === type 
                  ? 'bg-green-500 text-black font-medium' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap capitalize ${
                filter === category 
                  ? 'bg-green-500 text-black font-medium' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredEvents.map(event => (
          <div 
            key={event.id}
            className="bg-black/30 rounded-lg p-3 border border-gray-700 hover:border-blue-700 transition-colors cursor-pointer"
            onClick={() => expandedEventId === event.id 
              ? setExpandedEventId(null) 
              : setExpandedEventId(event.id)
            }
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-medium">{event.name}</h3>
                <div className="flex items-center text-gray-400 text-sm mt-1">
                  <Calendar className="h-3 w-3 mr-1" /> 
                  <span>{formatDate(event.date)}</span>
                  <Clock className="h-3 w-3 ml-3 mr-1" /> 
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
              </div>
              <div>
                {expandedEventId === event.id ? (
                  <ChevronDown className="h-5 w-5 text-blue-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-blue-400" />
                )}
              </div>
            </div>
            
            {/* Preview data visible when collapsed */}
            <div className="mt-2 flex flex-wrap gap-1">
              {event.categories.map(category => (
                <span 
                  key={category} 
                  className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs"
                >
                  {category}
                </span>
              ))}
              <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs capitalize">
                {event.eventType.replace('_', ' ')}
              </span>
            </div>
            
            {/* Expanded details */}
            {expandedEventId === event.id && (
              <div className="mt-3 border-t border-gray-700 pt-3 space-y-3">
                <p className="text-gray-300 text-sm">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-blue-400 mr-1 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <div>{event.location.address}</div>
                      <div>{event.location.city}, {event.location.state} {event.location.zipCode}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-400 mr-1" />
                    <span className="text-sm text-gray-300">{event.attendees}+ attendees</span>
                  </div>
                  
                  {event.entryFee !== null && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-blue-400 mr-1" />
                      <span className="text-sm text-gray-300">
                        {event.entryFee > 0 ? `$${event.entryFee}` : 'Free entry'}
                      </span>
                    </div>
                  )}
                  
                  {event.registrationRequired && (
                    <div className="flex items-center">
                      <Info className="h-4 w-4 text-blue-400 mr-1" />
                      <span className="text-sm text-gray-300">Registration required</span>
                    </div>
                  )}
                </div>
                
                {event.featuredVehicles.length > 0 && (
                  <div>
                    <h4 className="text-sm text-blue-400 mb-1">Featured Vehicles:</h4>
                    <div className="flex flex-wrap gap-1">
                      {event.featuredVehicles.map(vehicle => (
                        <span 
                          key={vehicle} 
                          className="px-2 py-0.5 bg-gray-700 text-white rounded-full text-xs"
                        >
                          {vehicle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {event.hostInfo.website && (
                    <a 
                      href={event.hostInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link className="h-3 w-3 mr-1" /> 
                      Website
                    </a>
                  )}
                  
                  {event.registrationLink && (
                    <a 
                      href={event.registrationLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-full text-xs hover:bg-green-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Calendar className="h-3 w-3 mr-1" /> 
                      Register
                    </a>
                  )}
                  
                  <button
                    className="flex items-center px-3 py-1 bg-gray-700 text-white rounded-full text-xs hover:bg-gray-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent && onSelectEvent(event);
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" /> 
                    Add to Route
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {events.length > maxEvents && (
        <button 
          className="w-full mt-3 py-2 text-center text-blue-400 hover:text-blue-300 text-sm"
          onClick={() => setMaxEvents(prev => prev + 5)}
        >
          Show More Events
        </button>
      )}
    </div>
  );
};

export default CarEventsExplorer;
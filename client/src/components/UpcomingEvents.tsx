import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { useLocationServices } from '@/contexts/LocationServicesContext';

interface UpcomingEventsProps {
  compact?: boolean;
}

/**
 * UpcomingEvents Component
 * 
 * Displays upcoming automotive events based on user's location and interests
 * Can show events in compact or full mode
 */
export default function UpcomingEvents({ compact = false }: UpcomingEventsProps) {
  const locationServices = useLocationServices();
  
  // Function to calculate time remaining until event
  const getTimeRemaining = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Live now';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `In ${diffDays}d ${diffHours}h`;
    }
    
    return `In ${diffHours}h`;
  };
  
  // Get events from the location services context
  // If the API isn't available, we'll use an empty array (never mock data)
  const events = locationServices?.events || [];
  
  // For compact mode, just show a simplified list
  if (compact) {
    return (
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-gray-400 text-sm">No upcoming events found in your area</p>
          </div>
        ) : (
          events.slice(0, 3).map((event, index) => (
            <div 
              key={event.id || index} 
              className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
            >
              <div>
                <p className="text-white text-sm font-medium">{event.title}</p>
                <div className="flex items-center mt-1">
                  <CalendarClock size={12} className="text-blue-400 mr-1" />
                  <span className="text-gray-400 text-xs">{new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                {getTimeRemaining(event.date)}
              </Badge>
            </div>
          ))
        )}
      </div>
    );
  }
  
  // Full events display
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-blue-400 font-orbitron text-sm">UPCOMING EVENTS</h3>
        {locationServices?.currentLocation?.city && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 flex items-center gap-1">
            <MapPin size={12} />
            <span>{locationServices.currentLocation.city}</span>
          </Badge>
        )}
      </div>
      
      {events.length === 0 ? (
        <Card className="bg-black/30 border-gray-800">
          <CardContent className="p-4 text-center">
            <p className="text-gray-300">No upcoming events found in your area</p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later or expand your search area in settings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <Card 
              key={event.id || index} 
              className="bg-gradient-to-r from-gray-900 to-black border-gray-800 hover:border-blue-800/30 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-white font-medium">{event.title}</h4>
                      {event.featured && (
                        <Badge variant="outline" className="ml-2 bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-y-1 gap-x-3 mt-3">
                      <div className="flex items-center">
                        <CalendarClock size={14} className="text-blue-400 mr-1" />
                        <span className="text-gray-300 text-xs">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={14} className="text-blue-400 mr-1" />
                        <span className="text-gray-300 text-xs">
                          {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin size={14} className="text-blue-400 mr-1" />
                        <span className="text-gray-300 text-xs">{event.location}</span>
                      </div>
                      
                      {event.attendees && (
                        <div className="flex items-center">
                          <Users size={14} className="text-blue-400 mr-1" />
                          <span className="text-gray-300 text-xs">{event.attendees} attending</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-blue-400 border-blue-500/30 flex items-center gap-1 ${
                      event.date && new Date(event.date) < new Date() ? 'bg-green-500/10' : 'bg-blue-500/10'
                    }`}
                  >
                    {getTimeRemaining(event.date)}
                    <ArrowRight size={12} />
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
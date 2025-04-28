// client/src/services/strutAPI.ts
import axios from 'axios';

// Types for Strut API data
export interface StrutEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  eventType: 'car_meet' | 'cars_and_coffee' | 'cruise' | 'track_day' | 'auto_show' | 'auction' | 'other';
  categories: string[];
  featuredVehicles: string[];
  entryFee: number | null;
  attendees: number;
  registrationRequired: boolean;
  registrationLink?: string;
  hostInfo: {
    name: string;
    contact?: string;
    website?: string;
    social?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    }
  };
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StrutEventResponse {
  events: StrutEvent[];
  totalCount: number;
  nextCursor?: string;
}

// This would normally be in an environment variable
const STRUT_API_ENDPOINT = 'https://api.strutevents.com/v1';
const STRUT_API_KEY = import.meta.env.VITE_STRUT_API_KEY;

// Helper to configure API requests
const strutApi = axios.create({
  baseURL: STRUT_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRUT_API_KEY || 'demo-key'}`
  }
});

/**
 * Fetch car events near a specified location or along a route
 */
export const findEventsNearLocation = async (
  lat: number, 
  lng: number, 
  radius: number = 50,
  categories: string[] = [],
  startDate?: string,
  endDate?: string
): Promise<StrutEvent[]> => {
  try {
    // In a real implementation, we would use the actual API endpoint
    // This is a mock implementation for demonstration
    
    // Normally, we'd call:
    // const response = await strutApi.get('/events', {
    //   params: { lat, lng, radius, categories, startDate, endDate }
    // });
    // return response.data.events;
    
    // For demo purposes, we'll return mock data that resembles what the API would return
    // In production, use the commented code above with actual API credentials
    console.log(`Searching for events near ${lat},${lng} with radius ${radius}km`);
    
    // This simulates an API call to fetch events
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return generateMockEvents(lat, lng, radius, categories, startDate, endDate);
  } catch (error) {
    console.error('Error fetching events from Strut API:', error);
    throw new Error('Failed to fetch car events. Please try again later.');
  }
};

/**
 * Find events along a route with multiple waypoints
 */
export const findEventsAlongRoute = async (
  waypoints: Array<{lat: number, lng: number}>,
  radius: number = 10,
  categories: string[] = [],
  startDate?: string,
  endDate?: string
): Promise<StrutEvent[]> => {
  try {
    // For a real implementation, we would send the route to the Strut API
    // and get back events along the route
    
    // For demo, we'll collect events from each waypoint 
    let allEvents: StrutEvent[] = [];
    
    for (const waypoint of waypoints) {
      const events = await findEventsNearLocation(
        waypoint.lat, 
        waypoint.lng, 
        radius, 
        categories,
        startDate,
        endDate
      );
      
      // Add new events, avoiding duplicates
      events.forEach(event => {
        if (!allEvents.some(e => e.id === event.id)) {
          allEvents.push(event);
        }
      });
    }
    
    // Sort by date, closest date first
    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return allEvents;
  } catch (error) {
    console.error('Error fetching events along route from Strut API:', error);
    throw new Error('Failed to fetch car events along route. Please try again later.');
  }
};

/**
 * Helper function to generate mock events data for demonstration
 * In a production app, this would be replaced with actual API calls
 */
function generateMockEvents(
  centerLat: number, 
  centerLng: number, 
  radius: number,
  categories: string[] = [],
  startDate?: string,
  endDate?: string
): StrutEvent[] {
  const eventTypes = ['car_meet', 'cars_and_coffee', 'cruise', 'track_day', 'auto_show', 'auction'] as const;
  const mockEvents: StrutEvent[] = [];
  
  // Generate 2-5 random events
  const numEvents = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < numEvents; i++) {
    // Generate a random location within the radius
    const r = radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const lat = centerLat + r * Math.cos(theta) * 0.01; // rough approximation
    const lng = centerLng + r * Math.sin(theta) * 0.01;
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Generate date within the next month
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 1);
    
    // Skip if outside date range
    if (startDate && futureDate < new Date(startDate)) continue;
    if (endDate && futureDate > new Date(endDate)) continue;
    
    // Format date strings
    const dateStr = futureDate.toISOString().split('T')[0];
    
    // Generate start and end times
    const startHour = 8 + Math.floor(Math.random() * 10); // 8am to 6pm
    const duration = 1 + Math.floor(Math.random() * 5); // 1 to 5 hours
    const startTimeStr = `${startHour.toString().padStart(2, '0')}:00`;
    const endTimeStr = `${(startHour + duration).toString().padStart(2, '0')}:00`;
    
    // Event categories
    const categoryPool = [
      'exotic', 'supercar', 'muscle', 'classic', 'tuner', 'jdm', 
      'european', 'american', 'italian', 'german', 'offroad'
    ];
    
    // Featured vehicles
    const vehiclePool = [
      'Ferrari F8 Tributo', 'Porsche 911 GT3', 'Ford Mustang Shelby GT500', 
      'Chevrolet Corvette C8', 'Lamborghini Huracan', 'McLaren 720S',
      'Audi R8', 'BMW M4', 'Mercedes-AMG GT', 'Nissan GT-R', 'Toyota Supra'
    ];
    
    // Pick random categories
    const numCategories = 1 + Math.floor(Math.random() * 3);
    const eventCategories = [];
    for (let j = 0; j < numCategories; j++) {
      const cat = categoryPool[Math.floor(Math.random() * categoryPool.length)];
      if (!eventCategories.includes(cat)) {
        eventCategories.push(cat);
      }
    }
    
    // Filter by categories if requested
    if (categories.length > 0 && !categories.some(c => eventCategories.includes(c))) {
      continue;
    }
    
    // Pick random featured vehicles
    const numVehicles = Math.floor(Math.random() * 4) + 1;
    const featuredVehicles = [];
    for (let j = 0; j < numVehicles; j++) {
      const vehicle = vehiclePool[Math.floor(Math.random() * vehiclePool.length)];
      if (!featuredVehicles.includes(vehicle)) {
        featuredVehicles.push(vehicle);
      }
    }
    
    // Generate mock social links
    const hostName = ['SpeedSociety', 'Throttle Club', 'Apex Crew', 'RPM Collective', 'Fast Lane'][Math.floor(Math.random() * 5)];
    
    mockEvents.push({
      id: `event_${Date.now()}_${i}`,
      name: `${['Annual', 'Summer', 'Weekend', 'Exclusive', 'Premium'][Math.floor(Math.random() * 5)]} ${eventCategories[0].charAt(0).toUpperCase() + eventCategories[0].slice(1)} ${eventType.replace('_', ' ')}`,
      description: `Join us for an amazing gathering of ${eventCategories.join(', ')} enthusiasts. This event will feature some incredible cars, food, and networking opportunities.`,
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      location: {
        address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
        city: `${['Charlotte', 'Raleigh', 'Asheville', 'Concord', 'Durham'][Math.floor(Math.random() * 5)]}`,
        state: 'NC',
        zipCode: `${Math.floor(Math.random() * 9000) + 10000}`,
        coordinates: {
          lat,
          lng
        }
      },
      eventType,
      categories: eventCategories,
      featuredVehicles,
      entryFee: Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 5 : null,
      attendees: Math.floor(Math.random() * 500) + 50,
      registrationRequired: Math.random() > 0.5,
      registrationLink: Math.random() > 0.5 ? `https://example.com/register/${i}` : undefined,
      hostInfo: {
        name: `${hostName} ${['Chapter', 'Group', 'Club', 'Enthusiasts'][Math.floor(Math.random() * 4)]}`,
        contact: `info@${hostName.toLowerCase().replace(' ', '')}.com`,
        website: `https://${hostName.toLowerCase().replace(' ', '')}.com`,
        social: {
          instagram: `@${hostName.toLowerCase().replace(' ', '')}`,
          facebook: `https://facebook.com/${hostName.toLowerCase().replace(' ', '')}`,
        }
      },
      images: [
        `https://example.com/events/${i}_1.jpg`,
        `https://example.com/events/${i}_2.jpg`
      ],
      tags: [...eventCategories, eventType, 'paddock20'],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return mockEvents;
}
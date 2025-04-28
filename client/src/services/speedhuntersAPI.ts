// client/src/services/speedhuntersAPI.ts
import axios from 'axios';

// Types for Speedhunters API data
export interface CarCultureSpot {
  id: string;
  name: string;
  description: string;
  category: 'landmark' | 'shop' | 'museum' | 'garage' | 'dealership' | 'photographer_spot' | 'meetup_location' | 'restaurant' | 'other';
  location: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  rating: number; // 1-5 scale
  featuredCars: string[];
  openHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  pricing?: {
    entryFee?: number;
    typical?: 'free' | '$' | '$$' | '$$$' | '$$$$';
  };
  amenities: string[];
  photos: {
    url: string;
    credit?: string;
    description?: string;
  }[];
  tags: string[];
  verified: boolean;
  socialProfiles?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SpeedhuntersResponse {
  spots: CarCultureSpot[];
  totalCount: number;
  nextCursor?: string;
}

// This would normally be in an environment variable
const SPEEDHUNTERS_API_ENDPOINT = 'https://api.speedhunters.com/v1';
const SPEEDHUNTERS_API_KEY = process.env.VITE_SPEEDHUNTERS_API_KEY;

// Helper to configure API requests
const speedhuntersApi = axios.create({
  baseURL: SPEEDHUNTERS_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SPEEDHUNTERS_API_KEY}`
  }
});

/**
 * Fetch car culture spots near a specified location
 */
export const findCarCultureSpotsNearLocation = async (
  lat: number,
  lng: number,
  radius: number = 25,
  categories: string[] = [],
  tags: string[] = []
): Promise<CarCultureSpot[]> => {
  try {
    // In a real implementation, we would use the actual API endpoint
    // This is a mock implementation for demonstration
    
    // Normally, we'd call:
    // const response = await speedhuntersApi.get('/spots', {
    //   params: { lat, lng, radius, categories, tags }
    // });
    // return response.data.spots;
    
    // For demo purposes, we'll return mock data that resembles what the API would return
    console.log(`Searching for car culture spots near ${lat},${lng} with radius ${radius}km`);
    
    // This simulates an API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return generateMockCarCultureSpots(lat, lng, radius, categories, tags);
  } catch (error) {
    console.error('Error fetching spots from Speedhunters API:', error);
    throw new Error('Failed to fetch car culture spots. Please try again later.');
  }
};

/**
 * Find car culture spots along a route with multiple waypoints
 */
export const findCarCultureSpotsAlongRoute = async (
  waypoints: Array<{lat: number, lng: number}>,
  radius: number = 5,
  categories: string[] = [],
  tags: string[] = []
): Promise<CarCultureSpot[]> => {
  try {
    // For a real implementation, we would send the route to the Speedhunters API
    // and get back spots along the route
    
    // For demo, we'll collect spots from each waypoint 
    let allSpots: CarCultureSpot[] = [];
    
    for (const waypoint of waypoints) {
      const spots = await findCarCultureSpotsNearLocation(
        waypoint.lat,
        waypoint.lng,
        radius,
        categories,
        tags
      );
      
      // Add new spots, avoiding duplicates
      spots.forEach(spot => {
        if (!allSpots.some(s => s.id === spot.id)) {
          allSpots.push(spot);
        }
      });
    }
    
    // Sort by rating, highest first
    allSpots.sort((a, b) => b.rating - a.rating);
    
    return allSpots;
  } catch (error) {
    console.error('Error fetching spots along route from Speedhunters API:', error);
    throw new Error('Failed to fetch car culture spots along route. Please try again later.');
  }
};

/**
 * Helper function to generate mock car culture spots for demonstration
 */
function generateMockCarCultureSpots(
  centerLat: number,
  centerLng: number,
  radius: number,
  categories: string[] = [],
  tags: string[] = []
): CarCultureSpot[] {
  const spotCategories = ['landmark', 'shop', 'museum', 'garage', 'dealership', 'photographer_spot', 'meetup_location', 'restaurant', 'other'] as const;
  const mockSpots: CarCultureSpot[] = [];
  
  // Generate 3-7 random spots
  const numSpots = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 0; i < numSpots; i++) {
    // Generate a random location within the radius
    const r = radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const lat = centerLat + r * Math.cos(theta) * 0.01; // rough approximation
    const lng = centerLng + r * Math.sin(theta) * 0.01;
    
    const category = spotCategories[Math.floor(Math.random() * spotCategories.length)];
    
    // Filter by categories if requested
    if (categories.length > 0 && !categories.includes(category)) {
      continue;
    }
    
    // Tag pools
    const tagPool = [
      'exotic', 'supercar', 'muscle', 'classic', 'tuner', 'jdm', 
      'european', 'american', 'italian', 'german', 'photography',
      'historical', 'memorabilia', 'racing', 'motorsport', 'food'
    ];
    
    // Pick random tags
    const numTags = 1 + Math.floor(Math.random() * 4);
    const spotTags = [];
    for (let j = 0; j < numTags; j++) {
      const tag = tagPool[Math.floor(Math.random() * tagPool.length)];
      if (!spotTags.includes(tag)) {
        spotTags.push(tag);
      }
    }
    
    // Filter by tags if requested
    if (tags.length > 0 && !tags.some(t => spotTags.includes(t))) {
      continue;
    }
    
    // Featured cars
    const carPool = [
      'Ferrari F40', 'Porsche 959', 'Ford GT', 'Nissan Skyline GT-R',
      'Toyota AE86', 'Mazda RX-7', 'Honda NSX', 'Lamborghini Countach',
      'BMW E30 M3', 'Mercedes 300SL', 'Shelby Cobra', 'Lancia Delta Integrale'
    ];
    
    // Pick random featured cars
    const numCars = Math.floor(Math.random() * 3) + 1;
    const featuredCars = [];
    for (let j = 0; j < numCars; j++) {
      const car = carPool[Math.floor(Math.random() * carPool.length)];
      if (!featuredCars.includes(car)) {
        featuredCars.push(car);
      }
    }
    
    // Amenities
    const amenityPool = [
      'parking', 'wifi', 'food', 'drinks', 'restrooms', 'charging stations',
      'photography allowed', 'guided tours', 'souvenirs', 'historic displays'
    ];
    
    // Pick random amenities
    const numAmenities = Math.floor(Math.random() * 5) + 1;
    const amenities = [];
    for (let j = 0; j < numAmenities; j++) {
      const amenity = amenityPool[Math.floor(Math.random() * amenityPool.length)];
      if (!amenities.includes(amenity)) {
        amenities.push(amenity);
      }
    }
    
    // Generate mock spot name based on category
    let name = '';
    switch(category) {
      case 'landmark':
        name = `${['Historic', 'Famous', 'Legendary', 'Iconic'][Math.floor(Math.random() * 4)]} ${['Racing', 'Motorsport', 'Automotive'][Math.floor(Math.random() * 3)]} ${['Site', 'Landmark', 'Monument', 'Track'][Math.floor(Math.random() * 4)]}`;
        break;
      case 'shop':
        name = `${['Classic', 'Speed', 'Racing', 'Tuner'][Math.floor(Math.random() * 4)]} ${['Parts', 'Accessories', 'Garage', 'Shop'][Math.floor(Math.random() * 4)]}`;
        break;
      case 'museum':
        name = `${['Automotive', 'Racing', 'Classic Car', 'Motorsport'][Math.floor(Math.random() * 4)]} Museum`;
        break;
      case 'garage':
        name = `${['Precision', 'Performance', 'Elite', 'Master'][Math.floor(Math.random() * 4)]} ${['Garage', 'Workshop', 'Motors', 'Auto'][Math.floor(Math.random() * 4)]}`;
        break;
      case 'dealership':
        name = `${['Exotic', 'Luxury', 'Heritage', 'Premium'][Math.floor(Math.random() * 4)]} ${['Auto', 'Motors', 'Automotive', 'Car'][Math.floor(Math.random() * 4)]}`;
        break;
      case 'photographer_spot':
        name = `${['Scenic', 'Perfect', 'Golden', 'Prime'][Math.floor(Math.random() * 4)]} ${['Overlook', 'Vista', 'Photo Point', 'Backdrop'][Math.floor(Math.random() * 4)]}`;
        break;
      case 'meetup_location':
        name = `${['Driver\'s', 'Enthusiast', 'Car Club', 'Racer\'s'][Math.floor(Math.random() * 4)]} ${['Haven', 'Meet', 'Spot', 'Gathering'][Math.floor(Math.random() * 4)]}`;
        break;
      case 'restaurant':
        name = `${['Pistons', 'Throttle', 'Gearhead', 'Drifter\'s'][Math.floor(Math.random() * 4)]} ${['Diner', 'Cafe', 'Bar & Grill', 'Eatery'][Math.floor(Math.random() * 4)]}`;
        break;
      default:
        name = `Car Culture ${['Spot', 'Location', 'Destination', 'Venue'][Math.floor(Math.random() * 4)]}`;
    }
    
    mockSpots.push({
      id: `spot_${Date.now()}_${i}`,
      name,
      description: `A must-visit ${category.replace('_', ' ')} for any automotive enthusiast. Known for ${spotTags.join(', ')} culture and featuring iconic cars like the ${featuredCars.join(', ')}.`,
      category,
      location: {
        address: `${Math.floor(Math.random() * 9000) + 1000} ${['Main St', 'Racing Ln', 'Automotive Dr', 'Motor Ave'][Math.floor(Math.random() * 4)]}`,
        city: `${['Charlotte', 'Raleigh', 'Asheville', 'Concord', 'Durham'][Math.floor(Math.random() * 5)]}`,
        state: 'NC',
        country: 'USA',
        coordinates: {
          lat,
          lng
        }
      },
      rating: Math.floor(Math.random() * 2) + 3 + Math.random(), // 3.0 to 5.0
      featuredCars,
      openHours: {
        monday: `${9 + Math.floor(Math.random() * 3)}:00 - ${17 + Math.floor(Math.random() * 4)}:00`,
        tuesday: `${9 + Math.floor(Math.random() * 3)}:00 - ${17 + Math.floor(Math.random() * 4)}:00`,
        wednesday: `${9 + Math.floor(Math.random() * 3)}:00 - ${17 + Math.floor(Math.random() * 4)}:00`,
        thursday: `${9 + Math.floor(Math.random() * 3)}:00 - ${17 + Math.floor(Math.random() * 4)}:00`,
        friday: `${9 + Math.floor(Math.random() * 3)}:00 - ${17 + Math.floor(Math.random() * 4)}:00`,
        saturday: Math.random() > 0.8 ? 'Closed' : `${10 + Math.floor(Math.random() * 2)}:00 - ${16 + Math.floor(Math.random() * 2)}:00`,
        sunday: Math.random() > 0.5 ? 'Closed' : `${11 + Math.floor(Math.random() * 2)}:00 - ${15 + Math.floor(Math.random() * 2)}:00`
      },
      pricing: {
        entryFee: Math.random() > 0.7 ? Math.floor(Math.random() * 25) + 5 : undefined,
        typical: ['free', '$', '$$', '$$$', '$$$$'][Math.floor(Math.random() * 5)] as any
      },
      amenities,
      photos: [
        {
          url: `https://example.com/spots/${i}_1.jpg`,
          credit: `Speedhunters`,
          description: `${name} - exterior`
        },
        {
          url: `https://example.com/spots/${i}_2.jpg`,
          credit: `Speedhunters`,
          description: `${featuredCars[0]} at ${name}`
        }
      ],
      tags: spotTags,
      verified: Math.random() > 0.3,
      socialProfiles: {
        instagram: Math.random() > 0.4 ? `@${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
        facebook: Math.random() > 0.5 ? `https://facebook.com/${name.toLowerCase().replace(/\s+/g, '')}` : undefined,
        website: Math.random() > 0.3 ? `https://${name.toLowerCase().replace(/\s+/g, '')}.com` : undefined
      },
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return mockSpots;
}
import axios from 'axios';

// Define the response type for unsplash
interface UnsplashResponse {
  results: {
    id: string;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    alt_description: string;
    description: string;
    user: {
      name: string;
    };
  }[];
}

/**
 * Search for high-resolution images related to a query
 * @param query The search term for finding images
 * @param count The number of images to return (default: 5)
 * @returns An array of image objects with URLs and metadata
 */
export async function searchHighResImages(query: string, count: number = 5): Promise<any[]> {
  // For now, this is using a demo mode since we don't have actual API credentials
  // In a real implementation, we'd use Unsplash, Pexels, or similar APIs
  
  // Demo mode: Return predefined images based on search term categories
  const normalizedQuery = query.toLowerCase();
  
  // Categorize the search query
  let category = 'general';
  
  if (normalizedQuery.includes('ferrari') || normalizedQuery.includes('458') || 
      normalizedQuery.includes('porsche') || normalizedQuery.includes('lamborghini') ||
      normalizedQuery.includes('car') || normalizedQuery.includes('supercar')) {
    category = 'car';
  } else if (normalizedQuery.includes('patek') || normalizedQuery.includes('rolex') || 
             normalizedQuery.includes('watch') || normalizedQuery.includes('timepiece') ||
             normalizedQuery.includes('nautilus')) {
    category = 'watch';
  } else if (normalizedQuery.includes('house') || normalizedQuery.includes('home') || 
             normalizedQuery.includes('cabin') || normalizedQuery.includes('villa') ||
             normalizedQuery.includes('property') || normalizedQuery.includes('retreat')) {
    category = 'house';
  } else if (normalizedQuery.includes('monaco') || normalizedQuery.includes('grand prix') || 
             normalizedQuery.includes('formula') || normalizedQuery.includes('f1') ||
             normalizedQuery.includes('racing') || normalizedQuery.includes('yacht')) {
    category = 'racing';
  }
  
  // Sample image collections for each category
  const imageSets: Record<string, any[]> = {
    car: [
      {
        id: 'car1',
        urls: {
          full: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmVycmFyaXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmVycmFyaXxlbnwwfHwwfHx8MA%3D%3D&w=300&q=80'
        },
        alt_description: 'Red Ferrari parked on the street',
        description: 'Ferrari 458 Italia in Rosso Corsa',
        user: { name: 'Car Enthusiast' }
      },
      {
        id: 'car2',
        urls: {
          full: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmVycmFyaXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmVycmFyaXxlbnwwfHwwfHx8MA%3D%3D&w=300&q=80'
        },
        alt_description: 'Ferrari 458 interior dashboard',
        description: 'Ferrari 458 cockpit and dashboard with carbon fiber details',
        user: { name: 'Automotive Photography' }
      },
      {
        id: 'car3',
        urls: {
          full: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cG9yc2NoZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cG9yc2NoZXxlbnwwfHwwfHx8MA%3D%3D&w=300&q=80'
        },
        alt_description: 'Porsche 911 on mountain road',
        description: 'Classic Porsche 911 on a mountain pass during sunset',
        user: { name: 'Porsche Lifestyle' }
      }
    ],
    watch: [
      {
        id: 'watch1',
        urls: {
          full: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0Y2h8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0Y2h8ZW58MHx8MHx8fDA%3D&w=300&q=80'
        },
        alt_description: 'Luxury watch close-up',
        description: 'Luxury timepiece with stainless steel bracelet',
        user: { name: 'Watch Collector' }
      },
      {
        id: 'watch2',
        urls: {
          full: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGF0ZWslMjBwaGlsaXBwZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGF0ZWslMjBwaGlsaXBwZXxlbnwwfHwwfHx8MA%3D%3D&w=300&q=80'
        },
        alt_description: 'Patek Philippe watch on wrist',
        description: 'Nautilus steel bracelet with blue dial on collector\'s wrist',
        user: { name: 'Horology Expert' }
      },
      {
        id: 'watch3',
        urls: {
          full: 'https://images.unsplash.com/photo-1633078654544-61b3455b9161?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwd2F0Y2h8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1633078654544-61b3455b9161?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwd2F0Y2h8ZW58MHx8MHx8fDA%3D&w=300&q=80'
        },
        alt_description: 'Luxury watch movement',
        description: 'High-end mechanical watch movement with intricate details',
        user: { name: 'Timepiece Photographer' }
      }
    ],
    house: [
      {
        id: 'house1',
        urls: {
          full: 'https://images.unsplash.com/photo-1506126944674-00c6c192e0a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1506126944674-00c6c192e0a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&w=300&q=80'
        },
        alt_description: 'Luxury mountain retreat with pool',
        description: 'Modern mountain home with infinity pool overlooking the valley',
        user: { name: 'Architecture Photographer' }
      },
      {
        id: 'house2',
        urls: {
          full: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwaG91c2V8ZW58MHx8MHx8fDA%3D&w=300&q=80'
        },
        alt_description: 'Modern luxury home exterior',
        description: 'Contemporary luxury villa with sleek design and large windows',
        user: { name: 'Real Estate Pro' }
      },
      {
        id: 'house3',
        urls: {
          full: 'https://images.unsplash.com/photo-1542889601-399c4f3a8402?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGx1eHVyeSUyMGhvdXNlfGVufDB8fDB8fHww&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1542889601-399c4f3a8402?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGx1eHVyeSUyMGhvdXNlfGVufDB8fDB8fHww&w=300&q=80'
        },
        alt_description: 'Luxury cabin in the woods',
        description: 'Premium wooden cabin with large deck in forested mountain setting',
        user: { name: 'Wilderness Estates' }
      }
    ],
    racing: [
      {
        id: 'racing1',
        urls: {
          full: 'https://images.unsplash.com/photo-1533844833509-841be4a10f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uYWNvJTIwZ3JhbmQlMjBwcml4fGVufDB8fDB8fHww&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1533844833509-841be4a10f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uYWNvJTIwZ3JhbmQlMjBwcml4fGVufDB8fDB8fHww&w=300&q=80'
        },
        alt_description: 'Formula 1 car at Monaco',
        description: 'F1 racing through the famous Monaco street circuit',
        user: { name: 'Racing Photographer' }
      },
      {
        id: 'racing2',
        urls: {
          full: 'https://images.unsplash.com/photo-1504826260979-242151ee45b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8eWFjaHQlMjBtb25hY298ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1504826260979-242151ee45b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8eWFjaHQlMjBtb25hY298ZW58MHx8MHx8fDA%3D&w=300&q=80'
        },
        alt_description: 'Luxury yachts in Monaco harbor',
        description: 'Exclusive super yachts docked in Monaco harbor during Grand Prix weekend',
        user: { name: 'Monaco Lifestyle' }
      },
      {
        id: 'racing3',
        urls: {
          full: 'https://images.unsplash.com/photo-1579169182369-86c019d5d1d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8eWFjaHQlMjBtb25hY298ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1579169182369-86c019d5d1d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8eWFjaHQlMjBtb25hY298ZW58MHx8MHx8fDA%3D&w=300&q=80'
        },
        alt_description: 'Aerial view of Monaco harbor during Grand Prix',
        description: 'Bird\'s eye view of Monaco circuit and harbor filled with luxury yachts',
        user: { name: 'Aerial Photography' }
      }
    ],
    general: [
      {
        id: 'general1',
        urls: {
          full: 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5fGVufDB8fDB8fHww&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bHV4dXJ5fGVufDB8fDB8fHww&w=300&q=80'
        },
        alt_description: 'Luxury lifestyle items',
        description: 'Premium lifestyle accessories on display',
        user: { name: 'Luxury Lifestyle' }
      },
      {
        id: 'general2',
        urls: {
          full: 'https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bHV4dXJ5fGVufDB8fDB8fHww&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bHV4dXJ5fGVufDB8fDB8fHww&w=300&q=80'
        },
        alt_description: 'Luxury hotel interior',
        description: 'Exclusive five-star hotel suite with panoramic views',
        user: { name: 'Travel Luxury' }
      },
      {
        id: 'general3',
        urls: {
          full: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bHV4dXJ5JTIwZXhwZXJpZW5jZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumb: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bHV4dXJ5JTIwZXhwZXJpZW5jZXxlbnwwfHwwfHx8MA%3D%3D&w=300&q=80'
        },
        alt_description: 'Sunset experience',
        description: 'Exclusive sunset experience with champagne',
        user: { name: 'Experience Luxury' }
      }
    ]
  };
  
  // Return a slice of the images for the category
  const results = imageSets[category].slice(0, count);
  
  return results;
}

/**
 * Function to add an image from search results to a goal's media gallery
 * @param imageData Image data from the search results
 * @param goalId The goal ID to associate the image with
 * @returns A formatted media item ready to be added to the goal's mediaGallery array
 */
export function createMediaItemFromSearch(imageData: any): any {
  return {
    id: Date.now(), // Generate a unique ID
    type: 'image',
    name: imageData.description || imageData.alt_description || 'Searched Image',
    url: imageData.urls.full,
    thumbnail: imageData.urls.thumb,
    description: `Photo by ${imageData.user.name}`,
    dateAdded: new Date().toISOString().split('T')[0]
  };
}
/**
 * Unsplash Image Service
 * Provides high-quality images for marketplace listings
 */

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || import.meta.env.UNSPLASH_ACCESS_KEY;

/**
 * Fetches a random image from Unsplash based on search query
 * @param {string} query - The search query (e.g., "Ferrari 458", "Patek Philippe")
 * @param {string} orientation - The orientation of the image (landscape, portrait, squarish)
 * @param {number} width - The desired width of the image
 * @param {number} height - The desired height of the image
 * @returns {Promise<string>} - The URL of the image
 */
export const getRandomImage = async (query, orientation = 'landscape', width = 800, height = 600) => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/random?query=${encodeURIComponent(query)}&orientation=${orientation}&client_id=${ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.urls.regular;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    // Return null in case of error
    return null;
  }
};

/**
 * Searches for images on Unsplash and returns the first result
 * @param {string} query - The search query
 * @returns {Promise<string|null>} - The URL of the first image or null if none found
 */
export const searchImage = async (query) => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search images: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching images on Unsplash:', error);
    return null;
  }
};

/**
 * Cache to store previously fetched image URLs
 * This reduces API calls and ensures consistent images for listings
 */
const imageCache = {
  vehicles: {
    "Ferrari 458": null,
    "Lamborghini Gallardo": null,
    "Lamborghini Aventador SVJ": null,
    "Porsche 911 GT3": null,
    "McLaren 765LT": null,
    "Mercedes-Benz AMG GT": null,
    "Bugatti Chiron": null
  },
  timepieces: {
    "Patek Philippe Nautilus": null,
    "Rolex Daytona": null,
    "Audemars Piguet Royal Oak": null,
    "F.P. Journe Chronometre Bleu": null,
    "Richard Mille RM 35": null,
    "A. Lange & Söhne Zeitwerk": null
  }
};

// Create a simplified version of the initialization function
// that doesn't rely on complex caching

/**
 * Simplified initialization function for the image cache
 * This is a placeholder that logs but doesn't actually make API calls
 * which could cause issues
 */
export const initializeImageCache = async () => {
  // Check if the API key is available
  if (!ACCESS_KEY) {
    console.warn('Unsplash API key not found. Image fetching will use fallback images.');
    return;
  }
  
  console.log('Image cache initialization skipped to avoid API rate limiting.');
  console.log('Images will be loaded on demand when components render.');
};

/**
 * Gets an image URL for a specific vehicle or timepiece
 * @param {string} type - The type of item ('vehicle' or 'timepiece')
 * @param {string} brand - The brand of the item (e.g., 'Ferrari', 'Patek Philippe')
 * @param {string} model - The model of the item (e.g., '458', 'Nautilus')
 * @returns {string|null} - The URL of the image or null if not found
 */
export const getImageForItem = (type, brand, model) => {
  const searchKey = type === 'vehicle' 
    ? `${brand} ${model}`
    : `${brand} ${model}`;
  
  // Try to find an exact match
  if (type === 'vehicle' && imageCache.vehicles[searchKey]) {
    return imageCache.vehicles[searchKey];
  }
  
  if (type === 'timepiece' && imageCache.timepieces[searchKey]) {
    return imageCache.timepieces[searchKey];
  }
  
  // If no exact match, try to find a partial match
  const cache = type === 'vehicle' ? imageCache.vehicles : imageCache.timepieces;
  for (const key of Object.keys(cache)) {
    if (key.includes(brand) && cache[key]) {
      return cache[key];
    }
  }
  
  return null;
};

export default {
  getRandomImage,
  searchImage,
  initializeImageCache,
  getImageForItem
};